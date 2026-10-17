"""
API v1 — Blueprint registry
"""
from .health import health_bp
from .auth import auth_bp
from .assessment import assessment_bp
from .resume import resume_bp
from .analysis import analysis_bp
from .roles import roles_bp
from .skills import skills_bp
from .roadmap import roadmap_bp
from .interview import interview_bp
from .progress import progress_bp
from .mentor import mentor_bp

__all__ = [
    "health_bp",
    "auth_bp",
    "assessment_bp",
    "resume_bp",
    "analysis_bp",
    "roles_bp",
    "skills_bp",
    "roadmap_bp",
    "interview_bp",
    "progress_bp",
    "mentor_bp",
]
