import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from dotenv import load_dotenv

load_dotenv()

# Example: mysql+aiomysql://root:password@localhost/smart_health_db
MYSQL_URL = os.getenv("MYSQL_URL", "mysql+aiomysql://root:@localhost/smart_health_db")

engine = create_async_engine(MYSQL_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
