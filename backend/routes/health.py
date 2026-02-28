from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models.health_record import HealthInput, PredictionResult, HealthRecord
from models.domain import HealthRecordDB
from fuzzy_engine import get_health_prediction
from routes.auth import get_current_user

router = APIRouter(tags=["Health Risk"])

@router.post("/predict-risk", response_model=PredictionResult)
async def predict_risk(health_in: HealthInput, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Run Fuzzy Logic Engine
    prediction = get_health_prediction(
        health_in.bmi, 
        health_in.heart_rate, 
        health_in.sleep_hours, 
        health_in.exercise_level
    )
    
    # Save record to database
    db_record = HealthRecordDB(
        user_id=str(current_user["_id"]),
        bmi=health_in.bmi,
        heart_rate=health_in.heart_rate,
        sleep_hours=health_in.sleep_hours,
        exercise_level=health_in.exercise_level,
        risk_score=prediction["risk_score"],
        risk_level=prediction["risk_level"],
        recommendation=prediction["recommendation"]
    )
    
    db.add(db_record)
    await db.commit()
    
    return prediction

@router.get("/history", response_model=List[HealthRecord])
async def get_history(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(HealthRecordDB)
        .where(HealthRecordDB.user_id == current_user["_id"])
        .order_by(HealthRecordDB.timestamp.desc())
    )
    db_records = result.scalars().all()
    
    records = []
    for doc in db_records:
        records.append(HealthRecord(
            id=doc.id,
            user_id=doc.user_id,
            bmi=doc.bmi,
            heart_rate=doc.heart_rate,
            sleep_hours=doc.sleep_hours,
            exercise_level=doc.exercise_level,
            risk_score=doc.risk_score,
            risk_level=doc.risk_level,
            recommendation=doc.recommendation,
            timestamp=doc.timestamp
        ))
    return records
