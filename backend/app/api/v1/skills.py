"""
Skill Gap Analysis API routes
"""
from flask import Blueprint, jsonify
from ...models import SkillGap
from ...utils.auth_decorator import auth_required

skills_bp = Blueprint("skills", __name__, url_prefix="/api/v1/skills")


@skills_bp.route("/gaps", methods=["GET"])
@auth_required
def get_skill_gaps(user):
    gap = SkillGap.query.filter_by(user_id=user.id).order_by(SkillGap.analyzed_at.desc()).first()
    return jsonify({
        "status": "success",
        "skill_gap": gap.to_dict() if gap else None
    }), 200
