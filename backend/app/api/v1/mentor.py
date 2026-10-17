"""
AI Mentor Guidance API routes
"""
import json
from flask import Blueprint, request, jsonify
from ...models import ResumeAnalysis, SkillGap, Progress, MockInterview
from ...services.llm_service import is_llm_available, generate_llm_response
from ...utils.auth_decorator import auth_required

mentor_bp = Blueprint("mentor", __name__, url_prefix="/api/v1/mentor")


@mentor_bp.route("/chat", methods=["POST"])
@auth_required
def mentor_chat(user):
    import os
    data = request.get_json() or {}
    message = data.get("message", "")

    if not message.strip():
        return jsonify({"status": "error", "message": "Message content cannot be empty"}), 400

    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")
    if not gemini_key and not openai_key:
        return jsonify({
            "status": "error",
            "message": "GEMINI_API_KEY is not configured in backend .env file. Please add GEMINI_API_KEY=your_key to enable the AI Mentor."
        }), 400

    from ...models import MentorChatMessage
    from ...database import db

    target_role = user.target_role or "Software Developer"
    target_company = user.target_company or ""
    
    analysis = ResumeAnalysis.query.filter_by(user_id=user.id).first()
    skill_gap = SkillGap.query.filter_by(user_id=user.id).first()
    prog = Progress.query.filter_by(user_id=user.id).first()
    interview = MockInterview.query.filter_by(user_id=user.id).order_by(MockInterview.created_at.desc()).first()

    profile_summary = analysis.profile_summary if analysis else "Student Profile"
    priority_gaps = json.loads(skill_gap.priority_gaps_json) if (skill_gap and skill_gap.priority_gaps_json) else []
    latest_score = interview.overall_score if interview else "No interview taken yet"

    context = (
        f"User Full Name: {user.full_name}\n"
        f"Onboarding Path: {user.onboarding_path or 'Not specified'}\n"
        f"Target Role: {target_role}\n"
        f"Target Company: {target_company or 'Not specified'}\n"
        f"Profile Summary: {profile_summary}\n"
        f"Priority Skill Gaps: {priority_gaps}\n"
        f"Overall Readiness Progress: {prog.overall_progress if prog else 0}%\n"
        f"Latest Mock Interview Score: {latest_score}"
    )
    prompt = f"Student Query: {message}"
    sys_inst = (
        f"You are the personalized AI Career Mentor for {user.full_name}. "
        f"Context regarding this student:\n{context}\n"
        f"Provide personalized, encouraging, and actionable career guidance matching their target role and background."
    )

    try:
        reply = generate_llm_response(prompt, sys_inst)
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to communicate with Gemini API: {str(e)}"
        }), 500

    if not reply:
        return jsonify({
            "status": "error",
            "message": "Gemini API returned an empty response. Please check your API key quota or retry."
        }), 500

    # Log user message & AI response to DB
    user_msg = MentorChatMessage(user_id=user.id, sender="user", message_text=message.strip())
    ai_msg = MentorChatMessage(user_id=user.id, sender="ai", message_text=reply)
    db.session.add(user_msg)
    db.session.add(ai_msg)
    db.session.commit()

    return jsonify({
        "status": "success",
        "reply": reply
    }), 200


@mentor_bp.route("/history", methods=["GET"])
@auth_required
def get_chat_history(user):
    from ...models import MentorChatMessage
    messages = MentorChatMessage.query.filter_by(user_id=user.id).order_by(MentorChatMessage.created_at.asc()).all()
    return jsonify({
        "status": "success",
        "messages": [m.to_dict() for m in messages]
    }), 200
