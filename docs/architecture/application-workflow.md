# Application Workflow — AI Career Mentor Agent

## Academic Project Details
- **Course**: Bachelor of Computer Applications (BCA)
- **Institution**: Birla Institute of Technology, Mesra (BIT Mesra)
- **Project Team**:
  - Riya Rani [BCA/40009/24]
  - Shambhavi Shrivastava [BCA/40010/24]
  - Divyanka Singh [BCA/40026/24]
  - Puja Sharma [BCA/40031/24]
- **Status**: Completed & Production Ready

---

## 1. Overview

This document describes the complete end-to-end user journey through the AI Career Mentor Agent, from first visit through to ongoing career development.

The workflow has three phases:
1. **Onboarding** — registration, career assessment, resume upload, target role selection
2. **Core Career Analysis** — profile analysis, skill gap analysis, roadmap generation
3. **Ongoing Development** — mock interviews, progress tracking, AI mentor chat

---

## 2. Complete User Workflow

```mermaid
flowchart TD
    A([User visits platform]) --> B[Registration / Login]
    B --> C{Target role decision}

    C -->|Path 1: Role decided| D1[Enter target role\n+ optional target company]
    C -->|Path 2: Few roles in mind| D2[Enter 2–4 preferred roles]
    C -->|Path 3: No role decided| D3[Proceed to assessment]

    D1 --> E[Career Assessment]
    D2 --> E
    D3 --> E

    E --> F[Resume Upload]

    F --> G{Orchestrator routes\nbased on path}

    G -->|Path 1| H1[Resume + Profile Analysis\nSkill Gap Analysis\nagainst confirmed role]
    G -->|Path 2| H2[Resume + Profile Analysis\nCareer Matching\nagainst preferred roles]
    G -->|Path 3| H3[Resume + Profile Analysis\nCareer Role Recommendation]

    H2 --> I2[Role-match percentages\nshown to user]
    H3 --> I3[Recommended roles\nshown to user]

    I2 --> J[User selects final target role]
    I3 --> J

    H1 --> K[Skill Gap Analysis]
    J --> K

    K --> L[Learning and Career\nRoadmap Generation]
    L --> M[Roadmap + Resources\n+ Projects displayed]

    M --> N{User continues}
    N --> O[Mock Interview Practice]
    N --> P[AI Mentor Chat]
    N --> Q[View Progress Dashboard]

    O --> R[Interview Evaluation\n+ Feedback]
    R --> S[Progress Tracking Service\nupdated]
    P --> S
    Q --> S
    S --> T[(Database)]
```

---

## 3. Three Onboarding Paths

### Path 1 — Target Role Already Decided

The student knows their target role before starting.

**Steps:**
1. Register / log in
2. Answer: *"Have you decided your target role?"* → **Yes**
3. Enter target role (required) and target company (optional)
4. Complete career assessment (interests, skills, preferences, experience)
5. Upload resume
6. System runs: Resume Analysis → Skill Gap Analysis (against confirmed role)
7. Proceed directly to roadmap generation

**Advantage:** Fastest path. No role matching step required.

---

### Path 2 — Student Has a Few Preferred Roles

The student has ideas but is not yet committed to one role.

**Steps:**
1. Register / log in
2. Answer: *"I have some roles in mind but I am not sure"*
3. Enter 2–4 preferred roles (e.g., Software Developer, Data Analyst, AI/ML Engineer, Cybersecurity Analyst)
4. Complete career assessment
5. Upload resume
6. System analyses: resume, skills, interests, assessment, education, projects, experience
7. System displays estimated career-match percentages:

```
Data Analyst       — 89%
Software Developer — 84%
AI/ML Engineer     — 76%
Cybersecurity      — 68%
```

8. Student selects one final target role
9. Proceed to skill gap analysis against chosen role

---

### Path 3 — No Target Role Decided

The student has no specific role in mind.

**Steps:**
1. Register / log in
2. Answer: *"I have not decided my target role yet"*
3. Complete career assessment
4. Upload resume
5. System analyses everything and recommends suitable career roles with match percentages:

```
Software Developer — 91%
Data Analyst       — 86%
AI/ML Engineer     — 79%
```

6. Student selects one final target role
7. Proceed to skill gap analysis against chosen role

---

## 4. Three-Path Onboarding Diagram

```mermaid
flowchart TD
    Start([Student registers and logs in]) --> Q{Target role decision}

    Q --> P1["PATH 1\nRole already decided"]
    Q --> P2["PATH 2\nFew roles in mind"]
    Q --> P3["PATH 3\nNo role decided"]

    P1 --> P1A[Enter target role\nand optional company]
    P1A --> Assessment

    P2 --> P2A["Enter 2–4\npreferred roles"]
    P2A --> Assessment

    P3 --> Assessment

    Assessment["Career Assessment\n(interests · skills · preferences\n· experience · education)"]
    Assessment --> ResumeUpload["Resume Upload"]

    ResumeUpload --> P1Route{Path 1?}
    P1Route -->|Yes| DirectAnalysis["Orchestrator:\nResume Analysis\nSkill Gap Analysis"]
    P1Route -->|No| MatchAnalysis["Orchestrator:\nResume Analysis\nCareer Matching"]

    MatchAnalysis --> ShowMatches["Show role-match\npercentages to user"]
    ShowMatches --> SelectRole["Student selects\nfinal target role"]

    DirectAnalysis --> SkillGap
    SelectRole --> SkillGap

    SkillGap["Skill Gap Analysis"] --> Roadmap["Learning and Career\nRoadmap Generation"]
    Roadmap --> Dashboard["Student Dashboard"]
```

---

## 5. Common Workflow After Target Role Is Confirmed

Once the student has a confirmed target role (from any path), the same sequence runs:

| Step | Component | Output |
|------|-----------|--------|
| 1 | Resume and Profile Analysis Agent | Structured profile, resume score, strengths, missing areas |
| 2 | Skill Gap Analysis Agent | Existing skills, weak skills, missing skills, priority gaps |
| 3 | Learning and Career Roadmap Agent | Personalized roadmap, milestones, courses, projects, certifications |
| 4 | Progress Tracking Service | Roadmap stored, milestones initialized at 0% |
| 5 | Mock Interview Agent | Role-specific questions, answer evaluation, performance score |
| 6 | Progress Tracking Service | Interview score stored, skill feedback recorded |
| 7 | AI Mentor Chat | Conversational career guidance through Orchestrator |
| 8 | Progress Dashboard | Overall progress, milestones, skill status, interview history |

---

## 6. Flask API → React Data Flow

```mermaid
sequenceDiagram
    participant R as React Frontend
    participant A as Flask API
    participant O as Orchestrator
    participant Ag as Specialized Agent
    participant PS as Progress Service
    participant DB as Database

    R->>A: POST /api/v1/resume/upload
    A->>O: trigger_analysis(user_id, resume_text, context)
    O->>Ag: analyze_resume(resume_text)
    Ag-->>O: structured_profile
    O->>Ag: analyze_skill_gap(profile, target_role)
    Ag-->>O: skill_gap_data
    O->>Ag: generate_roadmap(skill_gaps)
    Ag-->>O: roadmap + resources
    O->>PS: store_results(user_id, roadmap)
    PS->>DB: INSERT milestones, resources
    O-->>A: combined_response
    A-->>R: JSON response (profile + gaps + roadmap)
    R->>R: Render Dashboard
```

---

## 7. Mock Interview Feedback Loop

```mermaid
flowchart LR
    MI["Mock Interview Agent\nevaluates answers"]
    MI -->|"Identifies weak areas\ne.g. weak SQL"| Orch["Orchestrator"]
    Orch -->|"Re-triggers with\nnew weak areas"| SGA["Skill Gap Analysis Agent\nSQL confirmed as priority gap"]
    SGA --> RoadA["Learning and Career\nRoadmap Agent\nadd SQL resources"]
    RoadA --> PS["Progress Tracking Service\nupdates skill status"]
    PS --> DB[(Database)]
    PS --> UI["React Progress\nDashboard updated"]
```

This loop allows mock interview performance to continuously refine the student's learning roadmap — the platform adapts as the student grows.
