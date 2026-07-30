# 🧘‍♂️ Unwind — The Quiet Science of Staying Well at the Keyboard

> Turning burnout signals into actionable insights with data, ML, and guided breathing.

Unwind is an intelligent wellness platform designed for developers and knowledge workers. It analyzes behavioral and work-related signals (like sleep, caffeine intake, commits, and meetings) to predict burnout risk, explain *why* that risk exists, and help users recover through personalized habits and guided breathwork.

---

## 🚀 The Core Product Loop

Unwind isn't just a dashboard—it's a complete diagnostic and recovery cycle built for developers:

1. **Predict:** Input your weekly averages (sleep, screen time, meetings) into the ML model.
2. **Analyze (Dashboard):** Visualize your data against a 7,000-developer dataset. See exactly which habits are driving your stress via SHAP explanations.
3. **Plan (Tips):** Select targeted micro-habits tailored to your specific top risk drivers.
4. **Reset (Breathe):** Interrupt stress loops instantly with our built-in 4-7-8 breathing module, powered by buttery-smooth `framer-motion` state machines.
5. **Track (My Unwind):** A personalized hub to log daily check-ins, maintain habit streaks, and watch your risk trend downwards over time.

---

## 🏗️ Architecture & Tech Stack

This project is built with a decoupled architecture, optimizing for a snappy frontend and an ML-capable backend.

### **Frontend**
- **Framework:** Next.js (App Router) + React
- **Styling & UI:** Tailwind CSS v4, custom brutalist design system (Navy/Cream), Radix UI primitives.
- **Animations:** Framer Motion for complex, physics-based interactions (like the Breathe orb).
- **Visualization:** Plotly.js (lazy-loaded via `next/dynamic` for performance) for rich interactive charts.
- **State & Privacy:** 100% local. All user history, habits, and preferences are stored in `localStorage`. Your data never leaves your device.

### **Backend & Machine Learning**
- **API:** Python with **FastAPI** for high-performance, async endpoint handling.
- **Model:** Gradient Boosting Classifier trained on a dataset of over 7,000 developers. 
- **Explainability:** Integrated **SHAP (SHapley Additive exPlanations)**. Instead of a black-box "High Risk" result, the backend calculates the marginal contribution of each input (e.g., "High screen time increased your risk by 33%").
- **Observability:** Structured JSON logging and error tracking integrated directly into the FastAPI endpoints for production readiness.

---

## 🧠 Model Decisions & Explainability

A core philosophy of Unwind is that **insight without explanation is just anxiety**. 

### The Behavioral Pivot
Initially, the model was trained on a dataset that included a self-reported `stress_level` feature. This achieved 92% accuracy, but SHAP analysis revealed it was a near-circular feature (accounting for >60% of the model's decisions). If a user knows they are highly stressed, they don't need an ML model to tell them they might burn out.

To make the tool genuinely predictive, we dropped all self-reported subjective metrics and retrained the Gradient Boosting model exclusively on **behavioral data** (commits, sleep, caffeine, meetings). The model now detects hidden burnout risks in developers who *feel* fine but are sustaining dangerous behavioral loops.

### Real-Time SHAP Integration
The backend doesn't just return a probability score. It uses a pre-computed `explainer.pkl` to run SHAP analysis in real-time on every prediction. This allows the frontend to confidently say: *"You are at High Risk, and it is primarily driven by your caffeine-to-sleep ratio and your high meeting load."*

The Tips page then reads this SHAP output and dynamically recommends the exact micro-habits that target the highest-contributing factors.

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/PraneetGogoi/Unwind.git
cd Unwind
```

### 2️⃣ Start the Next.js Frontend

```bash
npm install
npm run dev
```
*The frontend will run on `http://localhost:3000`.*

### 3️⃣ Start the Python FastAPI Backend

In a new terminal tab, navigate to the API directory and start the Python server:

```bash
cd api
python3 -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn index:app --reload --port 8000
```
*The backend will run on `http://localhost:8000`.*

---

## 🎨 Design Decisions

- **Aesthetic:** A deliberate departure from typical "medical" or "wellness" apps. Unwind uses a high-contrast, brutalist design (sharp borders, strong typography, visible structure) that appeals to developers.
- **Dark Mode:** Fully responsive, semantic dark mode built into the custom Tailwind configuration.
- **Accessibility:** High-contrast `ink` and `paper` variables, reduced-motion fallbacks for the breathing animation, and fully keyboard-navigable components (Command Palette `Cmd+K`).

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork this repo and submit a pull request.

```bash
git checkout -b feature/your-feature
git commit -m "Added new feature"
git push origin feature/your-feature
```

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Praneet Gogoi**
🔗 GitHub: [https://github.com/PraneetGogoi](https://github.com/PraneetGogoi)

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
