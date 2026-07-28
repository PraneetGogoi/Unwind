import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier
import joblib

print("Loading dataset...")
df = pd.read_csv("developer_burnout_cleaned.csv")

FEATURE_COLS = [
    'age','experience_years','daily_work_hours','sleep_hours',
    'caffeine_intake','bugs_per_day','commits_per_day',
    'meetings_per_day','screen_time','exercise_hours','stress_level',
    'work_life_balance','productivity_ratio','cognitive_load','caffeine_per_sleep'
]

X = df[FEATURE_COLS].values
y = df['burnout_level'].values

print("Training Gradient Boosting model...")
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('clf', GradientBoostingClassifier(n_estimators=200, learning_rate=0.05, random_state=42))
])

pipe.fit(X, y)

print("Exporting model to model.pkl...")
joblib.dump(pipe, "model.pkl")
print("Export complete!")
