# Database Design & Entity Relationship Specifications

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

The AI Career Mentor Agent relies on a database-first architecture powered by SQLite and SQLAlchemy ORM. All student-specific data is strictly isolated by `user_id` foreign keys.

---

## Entity Models & Tables

### 1. `users`
Stores student accounts, credentials, and profile target information.
- `id` (INTEGER, Primary Key)
- `email` (VARCHAR(120), Unique, Indexed)
- `password_hash` (VARCHAR(256))
- `full_name` (VARCHAR(100))
- `college` (VARCHAR(150))
- `degree` (VARCHAR(100))
- `graduation_year` (INTEGER)
- `target_role` (VARCHAR(100))
- `target_company` (VARCHAR(100))
- `onboarding_path` (VARCHAR(50))
- `created_at` (DATETIME)

### 2. `career_assessments`
Stores candidate assessment answers.
- `id` (INTEGER, Primary Key)
- `user_id` (INTEGER, Foreign Key -> `users.id`)
- `career_interests` (TEXT)
- `technical_interests` (TEXT)
- `current_technical_skills` (TEXT)
- `soft_skills` (TEXT)
- `experience_level` (VARCHAR(50))
- `education_background` (VARCHAR(100))
- `areas_enjoyed` (TEXT)
- `areas_to_learn` (TEXT)
- `preferred_work_type` (VARCHAR(100))
- `career_goals` (TEXT)
- `created_at` (DATETIME)

### 3. `resumes`
Stores uploaded resume metadata and extracted plain text.
- `id` (INTEGER, Primary Key)
- `user_id` (INTEGER, Foreign Key -> `users.id`)
- `filename` (VARCHAR(255))
- `file_path` (VARCHAR(500))
- `extracted_text` (TEXT)
- `uploaded_at` (DATETIME)

### 4. `resume_analyses`
Stores resume quality score, estimated ATS compatibility score, extracted structured profile, strengths, missing areas, and ATS diagnostics.
- `id` (INTEGER, Primary Key)
- `user_id` (INTEGER, Foreign Key -> `users.id`)
- `resume_id` (INTEGER, Foreign Key -> `resumes.id`)
- `resume_score` (INTEGER)
- `ats_score` (INTEGER)
- `structured_profile_json` (TEXT)
- `strengths_json` (TEXT)
- `missing_areas_json` (TEXT)
- `ats_analysis_json` (TEXT)
- `profile_summary` (TEXT)
- `analyzed_at` (DATETIME)

### 5. `improved_resumes`
Stores optional AI-generated ATS-optimized resume drafts.
- `id` (INTEGER, Primary Key)
- `user_id` (INTEGER, Foreign Key -> `users.id`)
- `original_resume_id` (INTEGER, Foreign Key -> `resumes.id`)
- `target_role` (VARCHAR(100))
- `target_company` (VARCHAR(100))
- `improved_text` (TEXT)
- `improved_markdown` (TEXT)
- `improvement_notes_json` (TEXT)
- `is_approved` (BOOLEAN)
- `created_at` (DATETIME)

### 6. `preferred_roles`
Stores candidate preferred roles and real calculated role match scores (Path 2 & Path 3).
- `id` (INTEGER, Primary Key)
- `user_id` (INTEGER, Foreign Key -> `users.id`)
- `role_name` (VARCHAR(100))
- `match_percentage` (INTEGER)

### 7. `skill_gaps`
Stores candidate skill gap report comparing candidate capabilities to target role requirements.
- `id` (INTEGER, Primary Key)
- `user_id` (INTEGER, Foreign Key -> `users.id`)
- `target_role` (VARCHAR(100))
- `existing_skills_json` (TEXT)
- `weak_skills_json` (TEXT)
- `missing_skills_json` (TEXT)
- `priority_gaps_json` (TEXT)
- `gap_summary` (TEXT)
- `analyzed_at` (DATETIME)

### 8. `roadmap_milestones`
Stores personalized career roadmap milestones.
- `id` (INTEGER, Primary Key)
- `user_id` (INTEGER, Foreign Key -> `users.id`)
- `milestone_order` (INTEGER)
- `title` (VARCHAR(150))
- `description` (TEXT)
- `skills_json` (TEXT)
- `estimated_weeks` (INTEGER)
- `is_completed` (BOOLEAN)
- `completed_at` (DATETIME)

### 9. `learning_resources`
Stores curated learning resources connected to milestones.
- `id` (INTEGER, Primary Key)
- `user_id` (INTEGER, Foreign Key -> `users.id`)
- `milestone_id` (INTEGER, Foreign Key -> `roadmap_milestones.id`)
- `title` (VARCHAR(200))
- `resource_type` (VARCHAR(50))
- `url` (VARCHAR(500))
- `is_completed` (BOOLEAN)

### 10. `projects`
Stores recommended practice projects.
- `id` (INTEGER, Primary Key)
- `user_id` (INTEGER, Foreign Key -> `users.id`)
- `title` (VARCHAR(200))
- `description` (TEXT)
- `skills_json` (TEXT)
- `difficulty` (VARCHAR(50))
- `is_completed` (BOOLEAN)

### 11. `certifications`
Stores industry certification recommendations.
- `id` (INTEGER, Primary Key)
- `user_id` (INTEGER, Foreign Key -> `users.id`)
- `title` (VARCHAR(200))
- `provider` (VARCHAR(100))
- `is_completed` (BOOLEAN)

### 12. `mock_interviews`
Stores mock interview sessions and evaluation reports.
- `id` (INTEGER, Primary Key)
- `user_id` (INTEGER, Foreign Key -> `users.id`)
- `mode` (VARCHAR(50))
- `target_role` (VARCHAR(100))
- `overall_score` (INTEGER)
- `tech_score` (INTEGER)
- `relevance_score` (INTEGER)
- `comm_score` (INTEGER)
- `pace_score` (INTEGER)
- `presentation_score` (INTEGER)
- `project_score` (INTEGER)
- `feedback_summary` (TEXT)
- `weak_areas_json` (TEXT)
- `strong_areas_json` (TEXT)
- `recommendations_json` (TEXT)
- `created_at` (DATETIME)

### 13. `interview_questions` & `interview_answers`
Store question text, candidate response (typed or speech transcript), and evaluation feedback per question.

### 14. `progress` & `activity_logs`
Track real calculated overall readiness score, milestone completion counts, and historical audit logs.

### 15. `mentor_chat_messages`
Stores AI Mentor conversation history per user.
- `id` (INTEGER, Primary Key)
- `user_id` (INTEGER, Foreign Key -> `users.id`)
- `sender` (VARCHAR(20) - 'user' / 'ai')
- `message_text` (TEXT)
- `created_at` (DATETIME)
