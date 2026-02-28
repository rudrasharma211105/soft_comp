import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models.user import UserCreate, UserLogin, UserResponse, Token, TokenData
from models.domain import UserDB

load_dotenv()

# JWT Config
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

# removed passlib CryptContext due to version conflicts with bcrypt 4.0+
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

router = APIRouter(tags=["Authentication"])

# Helper Functions
def verify_password(plain_password: str, hashed_password: str):
    # Truncate to 72 characters as per bcrypt limit to avoid any potential errors
    password_bytes = plain_password[:72].encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    try:
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False

def get_password_hash(password: str):
    # Truncate to 72 characters as per bcrypt limit
    password_bytes = password[:72].encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    return hashed_bytes.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: str = payload.get("id")
        role: str = payload.get("role")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email, user_id=user_id, role=role)
    except JWTError:
        raise credentials_exception
    
    result = await db.execute(select(UserDB).where(UserDB.id == token_data.user_id))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    
    # Return as dict-like object for compatibility with existing code
    return {"_id": user.id, "email": user.email, "role": user.role, "name": user.name}

async def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource"
        )
    return current_user

# Endpoints
@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(UserDB).where(UserDB.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # First user becomes admin (convenience for setup)
    count_result = await db.execute(select(UserDB))
    is_admin = len(count_result.scalars().all()) == 0
    role = "admin" if is_admin else "user"
    
    new_user = UserDB(
        name=user_in.name,
        email=user_in.email,
        age=user_in.age,
        gender=user_in.gender,
        password=get_password_hash(user_in.password),
        role=role
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserDB).where(UserDB.email == user_in.email))
    user = result.scalars().first()
    
    if not user or not verify_password(user_in.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/user-profile", response_model=UserResponse)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    # Create dict that matches UserResponse schema
    return {
        "id": current_user["_id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "age": current_user.get("age", 0), # Default if not accessed in token explicitly
        "gender": current_user.get("gender", "")
    }
