from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import uvicorn
import os

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model.pkl")
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

class PredictionRequest(BaseModel):
    age: float
    experience_years: float
    daily_work_hours: float
    sleep_hours: float
    caffeine_intake: float
    bugs_per_day: float
    commits_per_day: float
    meetings_per_day: float
    screen_time: float
    exercise_hours: float
    stress_level: float

@app.post("/predict")
def predict_burnout(req: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Calculate engineered features exactly as done in the notebook
    # work_life_balance = (sleep + exercise) / (work_hours + screen_time)
    den_wlb = req.daily_work_hours + req.screen_time
    work_life_balance = (req.sleep_hours + req.exercise_hours) / (den_wlb if den_wlb > 0 else 1e-6)
    
    # productivity_ratio = commits / (bugs + meetings + 1)
    productivity_ratio = req.commits_per_day / (req.bugs_per_day + req.meetings_per_day + 1)
    
    # cognitive_load = bugs*2 + meetings*1.5 + work_hours
    cognitive_load = (req.bugs_per_day * 2) + (req.meetings_per_day * 1.5) + req.daily_work_hours
    
    # caffeine_per_sleep = caffeine / sleep
    caffeine_per_sleep = req.caffeine_intake / (req.sleep_hours if req.sleep_hours > 0 else 1)
    
    # Create feature array in the exact order of FEATURE_COLS
    features = [[
        req.age, req.experience_years, req.daily_work_hours, req.sleep_hours,
        req.caffeine_intake, req.bugs_per_day, req.commits_per_day,
        req.meetings_per_day, req.screen_time, req.exercise_hours, req.stress_level,
        work_life_balance, productivity_ratio, cognitive_load, caffeine_per_sleep
    ]]
    
    prediction = model.predict(features)[0]
    
    return {
        "burnout_level": prediction,
        "metrics": {
            "work_life_balance": round(work_life_balance, 2),
            "productivity_ratio": round(productivity_ratio, 2),
            "cognitive_load": round(cognitive_load, 2),
            "caffeine_per_sleep": round(caffeine_per_sleep, 2)
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
