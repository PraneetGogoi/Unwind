import os
import json
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import uvicorn
import shap
import numpy as np

# Configure structured logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("unwind.api")

app = FastAPI(title="Unwind API", description="Burnout prediction and explanation endpoints")

# Configure CORS more securely and comprehensively
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3005",
        "https://unwind-5owh.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and explainer on startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model.pkl")
EXPLAINER_PATH = os.path.join(os.path.dirname(__file__), "..", "explainer.pkl")

try:
    model = joblib.load(MODEL_PATH)
    logger.info("Model loaded successfully.")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    model = None

try:
    explainer = joblib.load(EXPLAINER_PATH)
    logger.info("Explainer loaded successfully.")
except Exception as e:
    logger.error(f"Error loading explainer: {e}")
    explainer = None

class PredictionRequest(BaseModel):
    age: float = Field(..., ge=18, le=100)
    experience_years: float = Field(..., ge=0, le=80)
    daily_work_hours: float = Field(..., ge=0, le=24)
    sleep_hours: float = Field(..., ge=0, le=24)
    caffeine_intake: float = Field(..., ge=0, le=30)
    bugs_per_day: float = Field(..., ge=0)
    commits_per_day: float = Field(..., ge=0)
    meetings_per_day: float = Field(..., ge=0, le=50)
    screen_time: float = Field(..., ge=0, le=24)
    exercise_hours: float = Field(..., ge=0, le=24)
    # stress_level removed for the behavioral model

# Feature columns matching training (without stress_level)
FEATURE_COLS = [
    'age','experience_years','daily_work_hours','sleep_hours',
    'caffeine_intake','bugs_per_day','commits_per_day',
    'meetings_per_day','screen_time','exercise_hours',
    'work_life_balance','productivity_ratio','cognitive_load','caffeine_per_sleep'
]

def build_features(req: PredictionRequest):
    den_wlb = req.daily_work_hours + req.screen_time
    work_life_balance = (req.sleep_hours + req.exercise_hours) / (den_wlb if den_wlb > 0 else 1e-6)
    productivity_ratio = req.commits_per_day / (req.bugs_per_day + req.meetings_per_day + 1)
    cognitive_load = (req.bugs_per_day * 2) + (req.meetings_per_day * 1.5) + req.daily_work_hours
    caffeine_per_sleep = req.caffeine_intake / (req.sleep_hours if req.sleep_hours > 0 else 1)
    
    return [
        req.age, req.experience_years, req.daily_work_hours, req.sleep_hours,
        req.caffeine_intake, req.bugs_per_day, req.commits_per_day,
        req.meetings_per_day, req.screen_time, req.exercise_hours,
        work_life_balance, productivity_ratio, cognitive_load, caffeine_per_sleep
    ], {
        "work_life_balance": round(work_life_balance, 2),
        "productivity_ratio": round(productivity_ratio, 2),
        "cognitive_load": round(cognitive_load, 2),
        "caffeine_per_sleep": round(caffeine_per_sleep, 2)
    }

@app.post("/api/predict")
async def predict_burnout(req: PredictionRequest, request: Request):
    logger.info(f"Predict requested from {request.client.host}")
    if model is None:
        logger.error("Predict failed: Model not loaded")
        raise HTTPException(status_code=500, detail="Model not loaded")
        
    features, metrics = build_features(req)
    features_2d = [features]
    
    try:
        prediction = model.predict(features_2d)[0]
        try:
            probabilities = model.predict_proba(features_2d)[0]
            classes = model.classes_
            proba_dict = {str(c): round(float(p), 3) for c, p in zip(classes, probabilities)}
        except AttributeError:
            proba_dict = {prediction: 1.0}
            
        # Baseline stats updated to match current feature set
        baseline_stats = {
            'age': 32.1, 'experience_years': 9.6, 'daily_work_hours': 9.0, 
            'sleep_hours': 6.5, 'caffeine_intake': 3.5, 'bugs_per_day': 9.5, 
            'commits_per_day': 14.5, 'meetings_per_day': 4.5, 'screen_time': 12.0, 
            'exercise_hours': 1.0
        }
        
        logger.info(f"Prediction successful: {prediction}")
        return {
            "burnout_level": str(prediction),
            "probabilities": proba_dict,
            "baseline_stats": baseline_stats,
            "metrics": metrics
        }
    except Exception as e:
        logger.exception("Error during prediction")
        raise HTTPException(status_code=500, detail="Error generating prediction")

@app.post("/api/explain")
async def explain_burnout(req: PredictionRequest, request: Request):
    logger.info(f"Explain requested from {request.client.host}")
    if explainer is None or model is None:
        logger.error("Explain failed: Explainer or Model not loaded")
        raise HTTPException(status_code=500, detail="Explainer not loaded")
        
    features, _ = build_features(req)
    
    try:
        # Get SHAP values for the specific prediction
        features_array = np.array([features])
        shap_values = explainer.shap_values(features_array)
        prediction = model.predict(features_array)[0]
        class_idx = list(model.classes_).index(prediction)
        
        if isinstance(shap_values, list):
            class_shap = shap_values[class_idx][0]
        else:
            if len(shap_values.shape) == 3: 
                class_shap = shap_values[0, :, class_idx]
            else:
                class_shap = shap_values[0] 
                
        impacts = [{"feature": f, "impact": round(float(s), 4), "value": round(float(v), 2)} 
                   for f, s, v in zip(FEATURE_COLS, class_shap, features)]
                   
        impacts.sort(key=lambda x: abs(x["impact"]), reverse=True)
        
        logger.info(f"Explanation successful for {prediction}")
        return {
            "prediction": str(prediction),
            "top_drivers": impacts[:5] 
        }
    except Exception as e:
        logger.exception("Error during explanation")
        raise HTTPException(status_code=500, detail="Error generating explanation")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
