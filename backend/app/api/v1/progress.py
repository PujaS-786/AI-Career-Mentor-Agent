"""
Progress Tracking & Analytics API routes
"""
from flask import Blueprint, jsonify
from ...models import Progress, ActivityLog, RoadmapMilestone
from ...utils.auth_decorator import auth_required
from ...services.progress_service import get_user_progress

progress_bp = Blueprint("progress", __name__, url_prefix="/api/v1/progress")


@progress_bp.route("", methods=["GET"])
@auth_required
def get_progress(user):
    prog = get_user_progress(user.id)
    logs = ActivityLog.query.filter_by(user_id=user.id).order_by(ActivityLog.timestamp.desc()).limit(10).all()
    milestones = RoadmapMilestone.query.filter_by(user_id=user.id).order_by(RoadmapMilestone.milestone_order.asc()).all()

    return jsonify({
        "status": "success",
        "progress": prog.to_dict(),
        "recent_activities": [l.to_dict() for l in logs],
        "milestones_summary": {
            "completed": sum(1 for m in milestones if m.is_completed),
            "total": len(milestones) if milestones else 5
        }
    }), 200
