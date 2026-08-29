# AI Career Mentor Agent

An intelligent, AI-powered career mentoring platform designed to guide students and early-career professionals through personalized career planning, skill gap analysis, and job market insights.

---

## Purpose

The AI Career Mentor Agent helps users:
- Receive personalized career roadmap recommendations
- Identify skill gaps based on their target roles
- Get AI-driven guidance through a conversational mentor interface
- Explore job market trends and learning resources

---

## Technology Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18 + Vite + JavaScript/JSX + HTML 5|
| Backend   | Python 3.11+ + Flask              |
| AI/Agents | LangChain / OpenAI API (planned)  |
| Styling   | CSS Modules / Vanilla CSS         |
| Testing   | Pytest (backend) · Vitest (frontend) |

---

## Project Structure

```
AI-Career-Mentor-Agent/
├── frontend/          # React + Vite application
├── backend/           # Flask REST API + AI agents
├── docs/              # Architecture, diagrams, API docs, report
├── data/              # Raw and processed datasets
├── scripts/           # Utility and automation scripts
├── .gitignore
└── README.md
```

---


## Current Setup Status

- [x] Project repository initialized
- [x] Folder structure established
- [x] Frontend React + Vite application setup
- [x] Backend Flask application setup
- [x] React–Flask API integration
- [x] Backend health API verified
- [x] Production frontend build verified
- [x] Application workflow documented
- [x] Multi-agent architecture documented
- [x] System architecture documented
- [ ] Database implementation
- [ ] Authentication
- [ ] AI agent implementation
- [ ] Resume analysis
- [ ] Skill gap analysis
- [ ] Personalized roadmap
- [ ] Mock interview
- [ ] Progress dashboard
- [ ] Deployment

---

## Getting Started

### 1. Install Dependencies

Install the required frontend dependencies:

```bash
cd frontend
npm install
```
### 2. Start the Frontend
Open a terminal and run:
```cd frontend
npm run dev
```
The frontend will run at:
http://localhost:5173
If port 5173 is already in use, Vite may use another port such as 5174.
### 3. Start the Backend
Open a new terminal and run:
```cd backend
python run.py
```
The Flask backend will run at:
http://127.0.0.1:5000
### 4. Check Backend Connection
Open the following URL in your browser:
http://127.0.0.1:5000/api/v1/health

A successful response confirms that the Flask backend is running.
### 5. Open the Application
Open the frontend URL shown by Vite in your browser:
http://localhost:5173

If Vite uses another port, open the URL displayed in the terminal instead.

---

## College Project Information

- **Course**: [To be added]
- **Team**: [To be added]
- **Institution**: [To be added]
