# REST API Documentation — AI Career Mentor Agent

## Academic Project Details
- **Project**: AI Career Mentor Agent
- **Degree**: Bachelor of Computer Applications (BCA)
- **Institution**: Birla Institute of Technology, Mesra (BIT Mesra)
- **Team**: Riya Rani [BCA/40009/24], Shambhavi Shrivastava [BCA/40010/24], Divyanka Singh [BCA/40026/24], Puja Sharma [BCA/40031/24]
- **Base URL**: `http://localhost:5000/api/v1`

---

## 1. Authentication & Security Model

Protected endpoints require the standard `Authorization` header containing the JWT bearer token acquired via `/api/v1/auth/login` or `/api/v1/auth/register`:

```http
Authorization: Bearer <jwt_token>
```

All responses follow a consistent JSON response envelope:
```json
{
  "status": "success" | "error",
  "message": "Human-readable description",
  "data": { ... }
}
```

---

## 2. API Endpoints Reference

### 2.1 Health Check

#### `GET /api/v1/health`
Confirms the backend Flask application and services are operating.

- **Auth Required**: No
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "AI Career Mentor Agent backend is running",
  "version": "0.1.0"
}
```

---

### 2.2 Authentication & User Profile

#### `POST /api/v1/auth/register`
Creates a new student account and returns an authenticated JWT session.

- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "student@bitmesra.ac.in",
  "password": "SecurePassword123",
  "full_name": "Divyanka Singh",
  "college": "Birla Institute of Technology, Mesra",
  "degree": "Bachelor of Computer Applications (BCA)",
  "graduation_year": 2027,
  "target_role": "Full-Stack Developer",
  "target_company": "Google",
  "onboarding_path": "path1"
}
```
- **Response `201 Created`**:
```json
{
  "status": "success",
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "student@bitmesra.ac.in",
    "full_name": "Divyanka Singh",
    "college": "Birla Institute of Technology, Mesra",
    "degree": "Bachelor of Computer Applications (BCA)",
    "target_role": "Full-Stack Developer",
    "target_company": "Google"
  }
}
```

#### `POST /api/v1/auth/login`
Authenticates existing credentials and issues a JWT token.

- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "student@bitmesra.ac.in",
  "password": "SecurePassword123"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### `GET /api/v1/auth/me`
Retrieves the authenticated user's profile and current target role settings.

- **Auth Required**: Yes (`Bearer <token>`)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "email": "student@bitmesra.ac.in",
    "full_name": "Divyanka Singh",
    "college": "Birla Institute of Technology, Mesra",
    "target_role": "Full-Stack Developer"
  }
}
```

#### `PUT /api/v1/auth/update`
Updates profile information for the authenticated user.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "full_name": "Divyanka Singh",
  "college": "Birla Institute of Technology, Mesra",
  "degree": "BCA",
  "target_role": "Frontend Developer",
  "target_company": "Microsoft"
}
```

#### `POST /api/v1/auth/forgot-password`
Initiates a password reset flow, generating a reset token and sending an email or returning the token in development mode.

- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "student@bitmesra.ac.in"
}
```

#### `POST /api/v1/auth/reset-password`
Resets the account password using the reset token.

- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "student@bitmesra.ac.in",
  "token": "reset-token-uuid",
  "new_password": "NewStrongPassword123"
}
```

---

### 2.3 Career Assessment

#### `POST /api/v1/assessment`
Submits student career assessment responses and updates onboarding path preferences.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "career_interests": "Software Engineering, Web Development",
  "technical_interests": "React, Python, Cloud Systems",
  "current_technical_skills": "HTML, CSS, JavaScript, Python, SQL",
  "soft_skills": "Communication, Teamwork, Critical Thinking",
  "experience_level": "Undergraduate Fresher",
  "education_background": "Bachelor of Computer Applications (BCA)",
  "areas_enjoyed": "Frontend UI design, Full-stack web development",
  "areas_to_learn": "Distributed microservices, Docker, CI/CD",
  "preferred_work_type": "Hybrid / Remote",
  "career_goals": "Land an Associate Software Engineer role at a top tech enterprise",
  "target_role": "Full-Stack Developer",
  "target_company": "Google",
  "onboarding_path": "path1"
}
```

#### `GET /api/v1/assessment`
Retrieves the student's existing assessment data.

- **Auth Required**: Yes
- **Response `200 OK`**:
```json
{
  "status": "success",
  "assessment": { ... }
}
```

---

### 2.4 Resume Upload, ATS Analysis & PDF Generation

#### `POST /api/v1/resume/upload`
Uploads a candidate resume document (`multipart/form-data`) or JSON text. Validates that the document is a true resume and extracts content via PyPDF/python-docx.

- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Form Fields**: `file` (file binary, `.pdf` or `.docx`) or JSON body `{"resume_text": "..."}`
- **Response `200 OK` / `201 Created`**:
```json
{
  "status": "success",
  "message": "Resume uploaded and validated successfully",
  "resume": {
    "id": 1,
    "filename": "Divyanka_Singh_Resume.pdf",
    "uploaded_at": "2026-10-17T22:00:00"
  },
  "extracted_text": "Divyanka Singh | Birla Institute of Technology, Mesra..."
}
```

#### `GET /api/v1/resume`
Fetches the candidate's latest uploaded resume and extracted plain text.

- **Auth Required**: Yes

#### `POST /api/v1/analysis/resume`
Triggers the **Resume & Profile Analysis Agent** to compute ATS compatibility, strengths, weaknesses, and a structured profile.

- **Auth Required**: Yes
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Resume and profile analysis completed",
  "analysis": {
    "resume_score": 82,
    "ats_score": 78,
    "strengths": ["Clear technical stack listed", "Relevant projects in web development"],
    "missing_areas": ["Quantifiable impact metrics (e.g. % improvements)", "Cloud deployment details"],
    "ats_analysis": {
      "contact_info": 100,
      "formatting": 85,
      "keyword_relevance": 75,
      "action_verbs": 70
    },
    "profile_summary": "Motivated BCA student at BIT Mesra with solid JavaScript and Python fundamentals."
  }
}
```

#### `POST /api/v1/resume/confirm-details`
Allows the student to review and persist missing details (e.g. contact info, projects) before generating an improved ATS resume.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "contact_info": { "phone": "+91 9876543210", "linkedin": "linkedin.com/in/student" },
  "projects": [ ... ]
}
```

#### `POST /api/v1/resume/improve`
Invokes the agent to generate an optimized, ATS-compliant resume markdown draft with strengthened action verbs and quantified impact.

- **Auth Required**: Yes
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Improved ATS resume draft generated successfully",
  "improved_resume": {
    "id": 1,
    "target_role": "Full-Stack Developer",
    "improved_text": "# DIVYANKA SINGH\n...",
    "improved_markdown": "# DIVYANKA SINGH\n..."
  }
}
```

#### `GET /api/v1/resume/improved`
Fetches the existing improved resume draft.

- **Auth Required**: Yes

#### `POST /api/v1/resume/improved/update-text`
Updates the draft text if the student edits it in the markdown editor.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "text": "# DIVYANKA SINGH\n..."
}
```

#### `GET /api/v1/resume/improved/download` / `POST /api/v1/resume/improved/download`
Renders and downloads an ATS-compliant, single-column PDF file using ReportLab with clickable contact links and typography.

- **Auth Required**: Yes
- **Response**: Binary PDF file (`application/pdf`) with `Content-Disposition: attachment; filename="Candidate_ATS_Improved_Resume.pdf"`

---

### 2.5 Role Matching & Target Role Confirmation

#### `POST /api/v1/roles/match`
Calculates compatibility percentages between the student's background and candidate roles (Path 2).

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "preferred_roles": ["Frontend Developer", "Full-Stack Developer", "Data Analyst"]
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "matches": [
    { "role_name": "Frontend Developer", "match_percentage": 88 },
    { "role_name": "Full-Stack Developer", "match_percentage": 78 },
    { "role_name": "Data Analyst", "match_percentage": 62 }
  ]
}
```

#### `POST /api/v1/roles/select`
Confirms the student's definitive target role and company. Automatically triggers the **Skill Gap Agent** and **Roadmap Agent**, persisting gaps, milestones, resources, and projects.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "target_role": "Full-Stack Developer",
  "target_company": "Google"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Confirmed target role as Full-Stack Developer",
  "skill_gap": {
    "existing_skills": ["HTML", "CSS", "JavaScript", "Python"],
    "weak_skills": ["SQL Optimization", "State Management"],
    "missing_skills": ["Docker", "Kubernetes", "CI/CD Pipelines", "System Design"],
    "gap_summary": "Strong foundational knowledge; needs cloud and DevOps tooling for senior roles."
  },
  "roadmap": {
    "milestones": [ ... ],
    "certifications": [ ... ]
  }
}
```

---

### 2.6 Skill Gap Analysis

#### `GET /api/v1/skills/gaps`
Retrieves the latest skill gap report for the authenticated student.

- **Auth Required**: Yes
- **Response `200 OK`**:
```json
{
  "status": "success",
  "skill_gap": {
    "target_role": "Full-Stack Developer",
    "existing_skills": ["JavaScript", "React", "Python"],
    "weak_skills": ["SQL", "Redux"],
    "missing_skills": ["Docker", "CI/CD", "Redis"],
    "priority_gaps": ["Docker", "CI/CD"],
    "gap_summary": "Focus first on containerization and caching."
  }
}
```

---

### 2.7 Roadmap & Milestones

#### `GET /api/v1/roadmap`
Fetches the student's tailored roadmap, including categorized milestones, practice projects, and curated learning resources.

- **Auth Required**: Yes
- **Response `200 OK`**:
```json
{
  "status": "success",
  "milestones": [
    {
      "id": 1,
      "milestone_order": 1,
      "title": "Phase 1: Advanced Frontend & State Architecture",
      "description": "Master React Hooks, Context API, and state management libraries.",
      "skills": ["React", "Redux", "TypeScript"],
      "estimated_weeks": 3,
      "is_completed": true,
      "resources": [ ... ],
      "projects": [ ... ]
    }
  ],
  "certifications": [ ... ]
}
```

#### `PATCH /api/v1/roadmap/milestones/<int:milestone_id>`
Toggles milestone completion status, automatically updating progress metrics.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "is_completed": true
}
```

---

### 2.8 Simulated AI Mock Interview Suite

#### `POST /api/v1/interview/start`
Initializes a new simulated mock interview session, generating tailored questions via the Mock Interview Agent.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "mode": "Technical",
  "target_role": "Full-Stack Developer"
}
```
- **Response `201 Created`**:
```json
{
  "status": "success",
  "interview_id": 4,
  "mode": "Technical",
  "target_role": "Full-Stack Developer",
  "greeting": "Hello Divyanka! I am your AI Interviewer for today's Technical interview...",
  "current_question": {
    "id": 12,
    "question_order": 1,
    "question_text": "Can you explain how the virtual DOM works in React and how it optimizes performance?"
  },
  "total_questions": 5
}
```

#### `POST /api/v1/interview/<int:interview_id>/answer`
Submits a transcribed or typed answer for scoring and evaluation.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "question_id": 12,
  "answer_text": "The Virtual DOM is a lightweight copy of the real DOM. When state changes, React creates a new virtual DOM tree, diffs it with the previous one, and batch-updates only the modified nodes..."
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "score": 92,
  "feedback": "Excellent response! Clearly explained the diffing algorithm and reconciliation process.",
  "next_question": { ... }
}
```

#### `POST /api/v1/interview/<int:interview_id>/finish`
Concludes the interview session, calculates the overall score, and persists analytics.

- **Auth Required**: Yes

---

### 2.9 Progress Analytics

#### `GET /api/v1/progress`
Retrieves overall career readiness scores, recent activity logs, and milestone completion percentages.

- **Auth Required**: Yes
- **Response `200 OK`**:
```json
{
  "status": "success",
  "progress": {
    "overall_progress": 74,
    "resume_score": 82,
    "interview_score": 85,
    "milestones_completed": 3,
    "total_milestones": 5
  },
  "recent_activities": [ ... ],
  "milestones_summary": { "completed": 3, "total": 5 }
}
```

---

### 2.10 AI Mentor Chat

#### `POST /api/v1/mentor/chat`
Sends a question to the 24/7 Context-Aware AI Career Mentor, which answers with complete student context.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "message": "Which project should I build next to demonstrate Docker and microservices?"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "reply": "Hi Divyanka! Given your target role of Full-Stack Developer at Google, I recommend building a containerized task manager with a React frontend, Flask backend, and Redis caching service packaged using Docker Compose..."
}
```

#### `GET /api/v1/mentor/history`
Loads chat message history between the student and the AI mentor.

- **Auth Required**: Yes
- **Response `200 OK`**:
```json
{
  "status": "success",
  "messages": [
    { "sender": "user", "message_text": "...", "created_at": "..." },
    { "sender": "ai", "message_text": "...", "created_at": "..." }
  ]
}
```

---

## 3. HTTP Error Codes

| Status Code | Reason | Typical Handling |
|---|---|---|
| `400 Bad Request` | Validation failure (invalid email, missing required fields, non-resume file) | Display error message banner to student |
| `401 Unauthorized` | Missing or expired JWT bearer token | Redirect student to `/login` modal |
| `404 Not Found` | Requested entity (milestone, interview, resume) does not exist | Show resource not found message |
| `500 Server Error` | Unexpected backend or LLM API exception | Show fallback message and log error |
