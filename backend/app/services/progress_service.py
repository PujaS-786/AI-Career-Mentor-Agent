"""
Progress Tracking Service — Flask backend service (NOT an AI agent).
Handles database operations for progress, milestone updates, skill counts, and activity logs.
"""
from datetime import datetime, timezone
from ..database import db
from ..models import Progress, ActivityLog, RoadmapMilestone, SkillGap, MockInterview


def get_user_progress(user_id):
    prog = Progress.query.filter_by(user_id=user_id).first()
    if not prog:
        prog = Progress(user_id=user_id, overall_progress=0, completed_milestones=0, total_milestones=0)
        db.session.add(prog)
        db.session.commit()
    return prog


def update_progress_on_event(user_id, event_type, data=None):
    prog = get_user_progress(user_id)

    if event_type == "ASSESSMENT_COMPLETED":
        prog.overall_progress = max(prog.overall_progress, 25)
        log_activity(user_id, "ASSESSMENT", "Completed Career Assessment")

    elif event_type == "RESUME_ANALYZED":
        prog.overall_progress = max(prog.overall_progress, 40)
        log_activity(user_id, "RESUME", f"Resume analyzed. Score: {data.get('score', 0)}")

    elif event_type == "ROLE_SELECTED":
        prog.overall_progress = max(prog.overall_progress, 50)
        log_activity(user_id, "TARGET_ROLE", f"Confirmed target role: {data.get('role', '')}")

    elif event_type == "SKILL_GAP_ANALYZED":
        prog.overall_progress = max(prog.overall_progress, 65)
        log_activity(user_id, "SKILL_GAP", "Skill gap analysis completed")

    elif event_type == "ROADMAP_GENERATED":
        prog.overall_progress = max(prog.overall_progress, 80)
        total_m = RoadmapMilestone.query.filter_by(user_id=user_id).count()
        prog.total_milestones = total_m if total_m > 0 else 5
        log_activity(user_id, "ROADMAP", "Personalized career roadmap generated")

    elif event_type == "MILESTONE_TOGGLED":
        completed_count = RoadmapMilestone.query.filter_by(user_id=user_id, is_completed=True).count()
        total_count = RoadmapMilestone.query.filter_by(user_id=user_id).count()
        prog.completed_milestones = completed_count
        prog.total_milestones = max(total_count, 1)
        prog.roadmap_progress = int((completed_count / prog.total_milestones) * 100)
        prog.overall_progress = min(100, 80 + int((completed_count / prog.total_milestones) * 20))
        log_activity(user_id, "PROGRESS", f"Updated milestone completion status: {completed_count}/{total_count}")

    elif event_type == "MOCK_INTERVIEW_COMPLETED":
        score = data.get("score", 0) if data else 0
        interviews = MockInterview.query.filter_by(user_id=user_id).all()
        if interviews:
            avg_score = int(sum(i.overall_score for i in interviews) / len(interviews))
            prog.avg_interview_score = avg_score
        log_activity(user_id, "INTERVIEW", f"Completed Mock Interview. Score: {score}%")

    db.session.commit()
    return prog


def log_activity(user_id, activity_type, description):
    log = ActivityLog(
        user_id=user_id,
        activity_type=activity_type,
        description=description,
        timestamp=datetime.now(timezone.utc)
    )
    db.session.add(log)
    db.session.commit()
    return log
