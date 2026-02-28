from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routes import auth, health, admin
from database import engine
from models.domain import Base

app = FastAPI(title="Smart Health Risk Prediction System API", root_path="/api")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for the Vercel deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route Mounting
app.include_router(auth.router)
app.include_router(health.router)
app.include_router(admin.router)

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        # Create all tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Welcome to Smart Health Risk Prediction API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
