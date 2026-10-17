"""
Resume & Profile Analysis API routes
"""
import json
from flask import Blueprint, jsonify
from ...database import db
from ...models import Resume, CareerAssessment, ResumeAnalysis
from ...agents import CareerMentorOrchestratorAgent
from ...utils.auth_decorator import auth_required

analysis_bp = Blueprint("analysis", __name__, url_prefix="/api/v1/analysis")


@analysis_bp.route("/resume", methods=["POST"])
@auth_required
def analyze_resume(user):
    resume = Resume.query.filter_by(user_id=user.id).order_by(Resume.uploaded_at.desc()).first()
    assessment = CareerAssessment.query.filter_by(user_id=user.id).first()

    if not resume and not assessment:
        return jsonify({
            "status": "error",
            "message": "Please upload a resume or complete the assessment before running analysis."
        }), 400

    resume_text = resume.extracted_text if resume else ""
    assessment_data = assessment.to_dict() if assessment else {}

    # Ensure confirmed target role and company on user profile are supplied to analysis agent
    if user.target_role and str(user.target_role).strip():
        assessment_data["target_role"] = str(user.target_role).strip()
    if user.target_company and str(user.target_company).strip():
        assessment_data["target_company"] = str(user.target_company).strip()
    if user.onboarding_path:
        assessment_data["onboarding_path"] = str(user.onboarding_path).strip()

    orchestrator = CareerMentorOrchestratorAgent()
    profile = orchestrator.process_resume_and_assessment(user.id, resume_text, assessment_data)

    analysis = ResumeAnalysis.query.filter_by(user_id=user.id).first()
    if not analysis:
        analysis = ResumeAnalysis(user_id=user.id)
        db.session.add(analysis)

    analysis.resume_id = resume.id if resume else None
    analysis.resume_score = profile.get("resume_score", 60)
    analysis.ats_score = profile.get("ats_score", 55)
    analysis.structured_profile_json = json.dumps(profile)
    analysis.strengths_json = json.dumps(profile.get("strengths", []))
    analysis.missing_areas_json = json.dumps(profile.get("missing_areas", []))
    analysis.ats_analysis_json = json.dumps(profile.get("ats_analysis", {}))
    analysis.profile_summary = profile.get("profile_summary", "")

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Resume and profile analysis completed",
        "analysis": analysis.to_dict()
    }), 200


@analysis_bp.route("/resume", methods=["GET"])
@auth_required
def get_resume_analysis(user):
    analysis = ResumeAnalysis.query.filter_by(user_id=user.id).first()
    return jsonify({
        "status": "success",
        "analysis": analysis.to_dict() if analysis else None
    }), 200
