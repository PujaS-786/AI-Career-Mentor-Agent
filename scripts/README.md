# Utility & Automation Scripts — AI Career Mentor Agent

## Academic Project Details
- **Course**: Bachelor of Computer Applications (BCA)
- **Institution**: Birla Institute of Technology, Mesra (BIT Mesra)
- **Team**: Riya Rani [BCA/40009/24], Shambhavi Shrivastava [BCA/40010/24], Divyanka Singh [BCA/40026/24], Puja Sharma [BCA/40031/24]

---

## Available Scripts

| Script | Location | Purpose | Command |
|---|---|---|---|
| **Project Verification Suite** | `scripts/verify_project.py` | Runs backend unit tests and compiles frontend production bundle | `python scripts/verify_project.py` |
| **Database Reset Utility** | `backend/reset_db.py` | Rebuilds SQLite database schema from scratch and resets tables | `cd backend && python reset_db.py` |
| **Backend Server Runner** | `backend/run.py` | Starts the Flask development server on port 5000 | `cd backend && python run.py` |
| **Backend Test Runner** | `backend/tests/` | Executes automated unit and integration tests using pytest | `cd backend && python -m pytest` |
| **Frontend Dev Server** | `frontend/package.json` | Runs Vite development server on port 5173/5174 | `cd frontend && npm run dev` |
| **Frontend Production Build** | `frontend/package.json` | Bundles and minifies React application for production | `cd frontend && npm run build` |
