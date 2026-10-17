"""
Career Assessment API routes
"""
from flask import Blueprint, request, jsonify
from ...database import db
from ...models import CareerAssessment
from ...utils.auth_decorator import auth_required
from ...services.progress_service import update_progress_on_event

assessment_bp = Blueprint("assessment", __name__, url_prefix="/api/v1/assessment")


@assessment_bp.route("", methods=["POST"])
@auth_required
def submit_assessment(user):
    data = request.get_json() or {}

    career_interests = data.get("career_interests")
    if not career_interests or not str(career_interests).strip():
        return jsonify({
            "status": "error",
            "message": "Career interest is required. Please fill in your career interest before proceeding."
        }), 400

    assessment = CareerAssessment.query.filter_by(user_id=user.id).first()
    if not assessment:
        assessment = CareerAssessment(user_id=user.id)
        db.session.add(assessment)

    assessment.career_interests = str(career_interests).strip()
    assessment.technical_interests = data.get("technical_interests")
    assessment.current_technical_skills = data.get("current_technical_skills")
    assessment.soft_skills = data.get("soft_skills")
    assessment.experience_level = data.get("experience_level")
    assessment.education_background = data.get("education_background")
    assessment.areas_enjoyed = data.get("areas_enjoyed")
    assessment.areas_to_learn = data.get("areas_to_learn")
    assessment.preferred_work_type = data.get("preferred_work_type")
    assessment.career_goals = data.get("career_goals")

    # Persist confirmed target_role, target_company, and onboarding_path on authenticated user
    if "target_role" in data:
        role_val = data.get("target_role")
        user.target_role = str(role_val).strip() if (role_val and str(role_val).strip()) else None
    if "target_company" in data:
        comp_val = data.get("target_company")
        user.target_company = str(comp_val).strip() if (comp_val and str(comp_val).strip()) else None
    if "onboarding_path" in data and data.get("onboarding_path"):
        user.onboarding_path = str(data.get("onboarding_path")).strip()

    db.session.commit()
    update_progress_on_event(user.id, "ASSESSMENT_COMPLETED")

    return jsonify({
        "status": "success",
        "message": "Career assessment saved successfully",
        "assessment": assessment.to_dict(),
        "user": user.to_dict()
    }), 200


@assessment_bp.route("", methods=["GET"])
@auth_required
def get_assessment(user):
    assessment = CareerAssessment.query.filter_by(user_id=user.id).first()
    ass_dict = assessment.to_dict() if assessment else None
    if ass_dict:
        ass_dict["target_role"] = user.target_role
        ass_dict["target_company"] = user.target_company
        ass_dict["onboarding_path"] = user.onboarding_path
    return jsonify({
        "status": "success",
        "assessment": ass_dict,
        "user": user.to_dict()
    }), 200
