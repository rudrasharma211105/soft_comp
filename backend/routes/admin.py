from fastapi import APIRouter, Depends
from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from database import get_db
from routes.auth import get_current_admin_user
from models.user import UserResponse
from models.domain import UserDB, HealthRecordDB

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/all-users", response_model=List[UserResponse])
async def get_all_users(admin: dict = Depends(get_current_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserDB))
    db_users = result.scalars().all()
    
    users = []
    for doc in db_users:
        users.append(UserResponse(
            id=doc.id,
            name=doc.name,
            email=doc.email,
            age=doc.age,
            gender=doc.gender,
            role=doc.role
        ))
    return users

@router.get("/analytics")
async def get_analytics(admin: dict = Depends(get_current_admin_user), db: AsyncSession = Depends(get_db)):
    # Total Users
    total_users_result = await db.execute(select(func.count(UserDB.id)))
    total_users = total_users_result.scalar() or 0
    
    # Total Predictions
    total_predictions_result = await db.execute(select(func.count(HealthRecordDB.id)))
    total_predictions = total_predictions_result.scalar() or 0
    
    # Calculate average risk score
    avg_risk_result = await db.execute(select(func.avg(HealthRecordDB.risk_score)))
    avg_risk = avg_risk_result.scalar() or 0
    
    # Risk distribution
    risk_dist_result = await db.execute(
        select(HealthRecordDB.risk_level, func.count(HealthRecordDB.id))
        .group_by(HealthRecordDB.risk_level)
    )
    
    risk_distribution = {}
    for row in risk_dist_result:
        risk_distribution[row[0]] = row[1]
        
    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
        "average_risk_score": round(float(avg_risk), 2) if avg_risk else 0,
        "risk_distribution": risk_distribution
    }
