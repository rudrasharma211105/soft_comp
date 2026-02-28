from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship
import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class UserDB(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(50), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)
    
    records = relationship("HealthRecordDB", back_populates="user", cascade="all, delete-orphan")

class HealthRecordDB(Base):
    __tablename__ = "health_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    bmi = Column(Float, nullable=False)
    heart_rate = Column(Float, nullable=False)
    sleep_hours = Column(Float, nullable=False)
    exercise_level = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)
    recommendation = Column(String(1000), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    
    user = relationship("UserDB", back_populates="records")
