"""
SQLAlchemy models for AI Career Mentor Agent
"""
from datetime import datetime, timezone
import json
from ..database import db


def utc_now():
    return datetime.now(timezone.utc)




class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    college = db.Column(db.String(150), nullable=True)
    degree = db.Column(db.String(100), nullable=True)
    graduation_year = db.Column(db.Integer, nullable=True)
    target_role = db.Column(db.String(100), nullable=True)
    target_company = db.Column(db.String(100), nullable=True)
    onboarding_path = db.Column(db.String(50), nullable=True)  # path1, path2, path3
    created_at = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "college": self.college,
            "degree": self.degree,
            "graduation_year": self.graduation_year,
            "target_role": self.target_role,
            "target_company": self.target_company,
            "onboarding_path": self.onboarding_path,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CareerAssessment(db.Model):
    __tablename__ = "career_assessments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    career_interests = db.Column(db.Text, nullable=True)
    technical_interests = db.Column(db.Text, nullable=True)
    current_technical_skills = db.Column(db.Text, nullable=True)
    soft_skills = db.Column(db.Text, nullable=True)
    experience_level = db.Column(db.String(50), nullable=True)
    education_background = db.Column(db.String(100), nullable=True)
    areas_enjoyed = db.Column(db.Text, nullable=True)
    areas_to_learn = db.Column(db.Text, nullable=True)
    preferred_work_type = db.Column(db.String(100), nullable=True)
    career_goals = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "career_interests": self.career_interests,
            "technical_interests": self.technical_interests,
            "current_technical_skills": self.current_technical_skills,
            "soft_skills": self.soft_skills,
            "experience_level": self.experience_level,
            "education_background": self.education_background,
            "areas_enjoyed": self.areas_enjoyed,
            "areas_to_learn": self.areas_to_learn,
            "preferred_work_type": self.preferred_work_type,
            "career_goals": self.career_goals,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Resume(db.Model):
    __tablename__ = "resumes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=True)
    extracted_text = db.Column(db.Text, nullable=True)
    uploaded_at = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.filename,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }


class ResumeAnalysis(db.Model):
    __tablename__ = "resume_analyses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    resume_id = db.Column(db.Integer, db.ForeignKey("resumes.id"), nullable=True)
    resume_score = db.Column(db.Integer, default=0)
    ats_score = db.Column(db.Integer, default=0)
    structured_profile_json = db.Column(db.Text, nullable=True)
    strengths_json = db.Column(db.Text, nullable=True)
    missing_areas_json = db.Column(db.Text, nullable=True)
    ats_analysis_json = db.Column(db.Text, nullable=True)
    profile_summary = db.Column(db.Text, nullable=True)
    analyzed_at = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "resume_id": self.resume_id,
            "resume_score": self.resume_score,
            "ats_score": self.ats_score,
            "structured_profile": json.loads(self.structured_profile_json) if self.structured_profile_json else {},
            "strengths": json.loads(self.strengths_json) if self.strengths_json else [],
            "missing_areas": json.loads(self.missing_areas_json) if self.missing_areas_json else [],
            "ats_analysis": json.loads(self.ats_analysis_json) if self.ats_analysis_json else {},
            "profile_summary": self.profile_summary,
            "analyzed_at": self.analyzed_at.isoformat() if self.analyzed_at else None,
        }


class ImprovedResume(db.Model):
    __tablename__ = "improved_resumes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    original_resume_id = db.Column(db.Integer, db.ForeignKey("resumes.id"), nullable=True)
    target_role = db.Column(db.String(100), nullable=True)
    target_company = db.Column(db.String(100), nullable=True)
    improved_text = db.Column(db.Text, nullable=False)
    improved_markdown = db.Column(db.Text, nullable=True)
    improvement_notes_json = db.Column(db.Text, nullable=True)
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "original_resume_id": self.original_resume_id,
            "target_role": self.target_role,
            "target_company": self.target_company,
            "improved_text": self.improved_text,
            "improved_markdown": self.improved_markdown,
            "improvement_notes": json.loads(self.improvement_notes_json) if self.improvement_notes_json else [],
            "is_approved": self.is_approved,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class MentorChatMessage(db.Model):
    __tablename__ = "mentor_chat_messages"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    sender = db.Column(db.String(20), nullable=False)  # 'user' or 'ai'
    message_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "sender": self.sender,
            "message_text": self.message_text,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }



class PreferredRole(db.Model):
    __tablename__ = "preferred_roles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    role_name = db.Column(db.String(100), nullable=False)
    match_percentage = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "role_name": self.role_name,
            "match_percentage": self.match_percentage,
        }


class SkillGap(db.Model):
    __tablename__ = "skill_gaps"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    target_role = db.Column(db.String(100), nullable=False)
    existing_skills_json = db.Column(db.Text, nullable=True)
    weak_skills_json = db.Column(db.Text, nullable=True)
    missing_skills_json = db.Column(db.Text, nullable=True)
    priority_gaps_json = db.Column(db.Text, nullable=True)
    gap_summary = db.Column(db.Text, nullable=True)
    analyzed_at = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "target_role": self.target_role,
            "existing_skills": json.loads(self.existing_skills_json) if self.existing_skills_json else [],
            "weak_skills": json.loads(self.weak_skills_json) if self.weak_skills_json else [],
            "missing_skills": json.loads(self.missing_skills_json) if self.missing_skills_json else [],
            "priority_gaps": json.loads(self.priority_gaps_json) if self.priority_gaps_json else [],
            "gap_summary": self.gap_summary,
            "analyzed_at": self.analyzed_at.isoformat() if self.analyzed_at else None,
        }


class RoadmapMilestone(db.Model):
    __tablename__ = "roadmap_milestones"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    milestone_order = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    skills_json = db.Column(db.Text, nullable=True)
    estimated_weeks = db.Column(db.Integer, default=2)
    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "milestone_order": self.milestone_order,
            "title": self.title,
            "description": self.description,
            "skills": json.loads(self.skills_json) if self.skills_json else [],
            "estimated_weeks": self.estimated_weeks,
            "is_completed": self.is_completed,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }


class LearningResource(db.Model):
    __tablename__ = "learning_resources"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    milestone_id = db.Column(db.Integer, db.ForeignKey("roadmap_milestones.id"), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    resource_type = db.Column(db.String(50), default="Course")  # Course, Article, Video, Docs
    url = db.Column(db.String(500), nullable=True)
    is_completed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "milestone_id": self.milestone_id,
            "title": self.title,
            "resource_type": self.resource_type,
            "url": self.url,
            "is_completed": self.is_completed,
        }


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    skills_json = db.Column(db.Text, nullable=True)
    difficulty = db.Column(db.String(50), default="Intermediate")
    is_completed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "skills": json.loads(self.skills_json) if self.skills_json else [],
            "difficulty": self.difficulty,
            "is_completed": self.is_completed,
        }


class Certification(db.Model):
    __tablename__ = "certifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    provider = db.Column(db.String(100), nullable=True)
    is_completed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "provider": self.provider,
            "is_completed": self.is_completed,
        }


class MockInterview(db.Model):
    __tablename__ = "mock_interviews"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    mode = db.Column(db.String(50), default="Technical")
    target_role = db.Column(db.String(100), nullable=False)
    overall_score = db.Column(db.Integer, default=0)
    tech_score = db.Column(db.Integer, default=0)
    relevance_score = db.Column(db.Integer, default=0)
    comm_score = db.Column(db.Integer, default=0)
    pace_score = db.Column(db.Integer, default=0)
    presentation_score = db.Column(db.Integer, default=0)
    project_score = db.Column(db.Integer, default=0)
    feedback_summary = db.Column(db.Text, nullable=True)
    weak_areas_json = db.Column(db.Text, nullable=True)
    strong_areas_json = db.Column(db.Text, nullable=True)
    recommendations_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "mode": self.mode,
            "target_role": self.target_role,
            "overall_score": self.overall_score,
            "tech_score": self.tech_score,
            "relevance_score": self.relevance_score,
            "comm_score": self.comm_score,
            "pace_score": self.pace_score,
            "presentation_score": self.presentation_score,
            "project_score": self.project_score,
            "feedback_summary": self.feedback_summary,
            "weak_areas": json.loads(self.weak_areas_json) if self.weak_areas_json else [],
            "strong_areas": json.loads(self.strong_areas_json) if self.strong_areas_json else [],
            "recommendations": json.loads(self.recommendations_json) if self.recommendations_json else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class InterviewQuestion(db.Model):
    __tablename__ = "interview_questions"

    id = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(db.Integer, db.ForeignKey("mock_interviews.id"), nullable=False)
    question_order = db.Column(db.Integer, nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), default="Technical")

    def to_dict(self):
        return {
            "id": self.id,
            "interview_id": self.interview_id,
            "question_order": self.question_order,
            "question_text": self.question_text,
            "category": self.category,
        }


class InterviewAnswer(db.Model):
    __tablename__ = "interview_answers"

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey("interview_questions.id"), nullable=False)
    student_answer = db.Column(db.Text, nullable=True)
    speech_transcript = db.Column(db.Text, nullable=True)
    evaluation_score = db.Column(db.Integer, default=0)
    evaluation_feedback = db.Column(db.Text, nullable=True)
    weak_points_json = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "question_id": self.question_id,
            "student_answer": self.student_answer,
            "speech_transcript": self.speech_transcript,
            "evaluation_score": self.evaluation_score,
            "evaluation_feedback": self.evaluation_feedback,
            "weak_points": json.loads(self.weak_points_json) if self.weak_points_json else [],
        }


class Progress(db.Model):
    __tablename__ = "progress"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    overall_progress = db.Column(db.Integer, default=15)
    roadmap_progress = db.Column(db.Integer, default=0)
    completed_milestones = db.Column(db.Integer, default=0)
    total_milestones = db.Column(db.Integer, default=5)
    skills_completed = db.Column(db.Integer, default=0)
    skills_total = db.Column(db.Integer, default=8)
    resources_completed = db.Column(db.Integer, default=0)
    projects_completed = db.Column(db.Integer, default=0)
    avg_interview_score = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "overall_progress": self.overall_progress,
            "roadmap_progress": self.roadmap_progress,
            "completed_milestones": self.completed_milestones,
            "total_milestones": self.total_milestones,
            "skills_completed": self.skills_completed,
            "skills_total": self.skills_total,
            "resources_completed": self.resources_completed,
            "projects_completed": self.projects_completed,
            "avg_interview_score": self.avg_interview_score,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ActivityLog(db.Model):
    __tablename__ = "activity_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "activity_type": self.activity_type,
            "description": self.description,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }


class PasswordResetToken(db.Model):
    __tablename__ = "password_reset_tokens"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utc_now)

    def is_valid(self):
        now = datetime.now(timezone.utc)
        # Handle offset-naive/aware datetime comparisons safely
        expires = self.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        return not self.is_used and expires > now

