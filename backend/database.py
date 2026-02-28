import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from dotenv import load_dotenv

load_dotenv()

# Example: mysql+aiomysql://root:password@localhost/smart_health_db
MYSQL_URL = os.getenv("MYSQL_URL", "mysql+aiomysql://root:@localhost/smart_health_db")

# Automatically fix the prefix if it's a standard mysql:// URL
if MYSQL_URL.startswith("mysql://"):
    MYSQL_URL = MYSQL_URL.replace("mysql://", "mysql+aiomysql://", 1)

from sqlalchemy.pool import NullPool

# Configure SSL for remote databases (like Aiven)
connect_args = {}
if "localhost" not in MYSQL_URL and "127.0.0.1" not in MYSQL_URL:
    # Aiven requires SSL; this enables it for the aiomysql driver
    connect_args = {"ssl": True}

engine = create_async_engine(
    MYSQL_URL, 
    echo=False,
    connect_args=connect_args,
    poolclass=NullPool
)
AsyncSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
