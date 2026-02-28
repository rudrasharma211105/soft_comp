from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class HealthInput(BaseModel):
    bmi: float = Field(..., ge=10, le=40)
    heart_rate: float = Field(..., ge=40, le=180)
    sleep_hours: float = Field(..., ge=0, le=12)
    exercise_level: float = Field(..., ge=0, le=7)

class PredictionResult(BaseModel):
    risk_score: float
    risk_level: str
    recommendation: str

class HealthRecord(HealthInput, PredictionResult):
    id: Optional[str] = None
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)
