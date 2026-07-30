# Case Study: Unwind — Predictive Burnout Analytics

Unwind is a full-stack ML application built to detect, explain, and mitigate developer burnout before it happens. Rather than just offering generic wellness advice, Unwind ties directly into a developer's specific work habits—commits, screen time, meetings, and sleep—to offer a highly personalized risk assessment and actionable recovery plan.

This document details the architectural decisions, the machine learning pipeline, and the crucial iteration on the predictive model that moved it from a statistical vulnerability to a robust, behavioral tool.

## The Problem
Burnout is a trailing indicator. By the time a developer realizes they are burned out, recovery is slow and difficult. Standard wellness tools track habits but lack predictive power. We needed an application that could ingest routine developer metrics and provide a forward-looking risk profile.

## System Architecture

Unwind is designed around a decoupled, local-first architecture:

1. **The Predictor API (Backend):** A Python-based FastAPI service that runs our machine learning models. It receives an anonymous payload of weekly habits, computes the risk probability, and simultaneously generates a **SHAP (SHapley Additive exPlanations)** analysis.
2. **The Client (Frontend):** A Next.js (App Router) application. To ensure maximum privacy, **no user data is saved to a central database**. All historical tracking, habit preferences, and predictions are stored on the client via `localStorage`.
3. **The Design System:** A custom, brutalist aesthetic (Tailwind CSS) offering a high-contrast dark mode to reduce eye strain, paired with Framer Motion for buttery-smooth state transitions during guided breathwork.
4. **PWA Ready:** Unwind acts as a Progressive Web App (PWA), meaning developers can install it locally and track their habits completely offline.

## The Machine Learning Story: Catching a Circular Feature

The most critical engineering lesson in this project was not in the frontend state management, but in the ML pipeline.

### Version 1: The "Self-Reported" Trap
The initial model (an XGBoost Classifier) was trained on a dataset of 7,000 developers. It achieved an impressive 92% accuracy during cross-validation. However, when examining the feature importance, I discovered a significant issue:

**~62% of the model's predictive power was driven by a single feature: `stress_level`.**

This was a classic case of target leakage or a near-circular feature. A user predicting their burnout shouldn't have to already know their exact stress level. If a user *feels* stressed (reporting a 90/100), they probably already know they are burning out. The model was effectively just echoing the user's feelings back to them, masking the actual underlying behavioral drivers (like caffeine intake, sleep deficit, and meeting load).

### Version 2: The Behavioral Pivot
To make the tool genuinely predictive and actionable, I needed the model to infer risk *purely from behavior*.

I dropped the `stress_level` and `work_life_balance` self-reported features from the training pipeline and retrained the XGBoost model exclusively on behavioral data (e.g., `commits_per_day`, `sleep_hours`, `caffeine_intake`, `meetings_per_day`). 

While the baseline accuracy dropped slightly (from 92% to 85%), the **utility of the model skyrocketed**. The application was now capable of detecting hidden burnout risk in developers who *felt* fine but were sustaining dangerous behavioral loops (like high caffeine + low sleep + high commit velocity).

## Explainability Over Accuracy

A core philosophy of Unwind is: **Insight without explanation is just anxiety.**

Simply telling a user "You have an 80% risk of burnout" is unhelpful. We integrated the `shap` library directly into the FastAPI endpoint. Now, when a prediction is made, the API returns the exact marginal contribution of each behavior. 

The frontend maps this SHAP data directly to the user interface:
*"You are at High Risk, and it is primarily driven by your caffeine-to-sleep ratio."*

This allows the subsequent "Tips" engine to dynamically filter its recommendations, offering highly targeted micro-habits rather than a generic list.

## Conclusion

Unwind demonstrates how to bridge the gap between raw machine learning output and human-centric design. By prioritizing local-first privacy, catching target leakage in our model, and emphasizing explainability via SHAP, Unwind serves as a complete, robust pipeline from data science to daily user recovery.
