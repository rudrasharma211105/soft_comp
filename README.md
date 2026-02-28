# Smart Health Risk Prediction System

A full-stack web application that predicts health risk levels using a Fuzzy Logic Inference Engine (Mamdani Method) based on BMI, Heart Rate, Sleep Hours, and Exercise Level.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Vite, Recharts, Lucide-React
- **Backend:** FastAPI (Python), scikit-fuzzy, NumPy, JWT Authentication
- **Database:** MySQL (SQLAlchemy + aiomysql)

## Prerequisites
- Python 3.9+
- Node.js 16+
- MySQL installed and running locally
     - Create a database named `smart_health_db` before running the backend.

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```
Create a `.env` file in the `backend` folder (already created for you):
```env
SECRET_KEY=your-secret-key
MYSQL_URL=mysql+aiomysql://root:@localhost/smart_health_db
```
Run the backend:
```bash
python main.py
```
Backend will run on `http://localhost:8000`. Swagger docs at `/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`.

## Authentication
- **User Role:** Standard registration via `/register`.
- **Admin Role:** The **first user registered** in the system is automatically granted the `admin` role for convenience.

## Features
- **Dashboard:** Interactive sliders to input health data and real-time risk prediction.
- **Fuzzy Engine:** 20+ rules using Scikit-Fuzzy for accurate Mamdani inference.
- **History:** Persistent storage of all health records and prediction scores.
- **Admin Analytics:** Charts showing risk distribution and user statistics.
