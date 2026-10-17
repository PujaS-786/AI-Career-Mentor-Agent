"""
Mock Interview API routes
"""
import json
from flask import Blueprint, request, jsonify
from ...database import db
from ...models import MockInterview, InterviewQuestion, InterviewAnswer, ResumeAnalysis
from ...agents import MockInterviewAgent, CareerMentorOrchestratorAgent
from ...utils.auth_decorator import auth_required
from ...services.progress_service import update_progress_on_event

interview_bp = Blueprint("interview", __name__, url_prefix="/api/v1/interview")


@interview_bp.route("/start", methods=["POST"])
@auth_required
def start_interview(user):
    data = request.get_json() or {}
    mode = data.get("mode", "Technical")
    target_role = user.target_role or data.get("target_role", "Software Developer")

    agent = MockInterviewAgent()
    questions = agent.generate_questions(target_role, mode)

    interview = MockInterview(
        user_id=user.id,
        mode=mode,
        target_role=target_role,
        overall_score=0
    )
    db.session.add(interview)
    db.session.flush()

    question_objs = []
    for idx, q_text in enumerate(questions, start=1):
        iq = InterviewQuestion(
            interview_id=interview.id,
            question_order=idx,
            question_text=q_text,
            category=mode
        )
        db.session.add(iq)
        question_objs.append(iq)

    db.session.commit()

    return jsonify({
        "status": "success",
        "interview_id": interview.id,
        "mode": mode,
        "target_role": target_role,
        "greeting": f"Hello {user.full_name or 'there'}! I am your AI Interviewer for today's {mode} interview for the {target_role} position. Let's begin!",
        "current_question": question_objs[0].to_dict() if question_objs else None,
        "total_questions": len(question_objs)
    }), 201


@interview_bp.route("/<int:interview_id>/answer", methods=["POST"])
@auth_required
def submit_answer(user, interview_id):
    interview = MockInterview.query.filter_by(id=interview_id, user_id=user.id).first()
    if not interview:
        return jsonify({"status": "error", "message": "Interview session not found"}), 404

    data = request.get_json() or {}
    question_id = data.get("question_id")
    student_answer = data.get("answer", "")
    speech_transcript = data.get("speech_transcript", "")

    question = db.session.get(InterviewQuestion, question_id)
    if not question:
        return jsonify({"status": "error", "message": "Question not found"}), 404

    agent = MockInterviewAgent()
    eval_result = agent.evaluate_answer(question.question_text, student_answer or speech_transcript, interview.target_role)

    ans = InterviewAnswer(
        question_id=question.id,
        student_answer=student_answer,
        speech_transcript=speech_transcript,
        evaluation_score=eval_result.get("evaluation_score", 75),
        evaluation_feedback=eval_result.get("evaluation_feedback", ""),
        weak_points_json=json.dumps(eval_result.get("weak_points", []))
    )
    db.session.add(ans)
    db.session.commit()

    # Determine next question or follow-up
    next_question = InterviewQuestion.query.filter_by(interview_id=interview.id).filter(InterviewQuestion.question_order > question.question_order).first()
    followup = None
    if eval_result.get("evaluation_score", 75) < 70 and not next_question:
        followup = agent.generate_followup(question.question_text, student_answer)

    return jsonify({
        "status": "success",
        "evaluation": eval_result,
        "followup_question": followup,
        "next_question": next_question.to_dict() if next_question else None,
        "is_complete": next_question is None and followup is None
    }), 200


@interview_bp.route("/<int:interview_id>/complete", methods=["POST"])
@auth_required
def complete_interview(user, interview_id):
    interview = MockInterview.query.filter_by(id=interview_id, user_id=user.id).first()
    if not interview:
        return jsonify({"status": "error", "message": "Interview session not found"}), 404

    data = request.get_json(silent=True) or {}
    presentation_cues = data.get("presentation_cues")

    questions = InterviewQuestion.query.filter_by(interview_id=interview.id).all()
    qa_pairs = []
    for q in questions:
        ans = InterviewAnswer.query.filter_by(question_id=q.id).first()
        if ans:
            qa_pairs.append({
                "question": q.question_text,
                "answer": ans.student_answer or ans.speech_transcript,
                "score": ans.evaluation_score,
                "weak_points": json.loads(ans.weak_points_json) if ans.weak_points_json else []
            })

    agent = MockInterviewAgent()
    report = agent.generate_final_report(interview.target_role, interview.mode, qa_pairs, presentation_cues)

    interview.overall_score = report["overall_score"]
    interview.tech_score = report["tech_score"]
    interview.relevance_score = report["relevance_score"]
    interview.comm_score = report["comm_score"]
    interview.pace_score = report["pace_score"]
    interview.presentation_score = report["presentation_score"]
    interview.project_score = report["project_score"]
    interview.feedback_summary = report["feedback_summary"]
    interview.weak_areas_json = json.dumps(report["weak_areas"])
    interview.strong_areas_json = json.dumps(report["strong_areas"])
    interview.recommendations_json = json.dumps(report["recommendations"])

    db.session.commit()

    # Trigger Feedback Loop
    orchestrator = CareerMentorOrchestratorAgent()
    analysis = ResumeAnalysis.query.filter_by(user_id=user.id).first()
    profile = json.loads(analysis.structured_profile_json) if (analysis and analysis.structured_profile_json) else {}
    orchestrator.process_interview_feedback_loop(user.id, report["weak_areas"], profile, interview.target_role)

    update_progress_on_event(user.id, "MOCK_INTERVIEW_COMPLETED", {"score": report["overall_score"]})

    return jsonify({
        "status": "success",
        "report": report
    }), 200


@interview_bp.route("/<int:interview_id>/results", methods=["GET"])
@auth_required
def get_interview_results(user, interview_id):
    interview = MockInterview.query.filter_by(id=interview_id, user_id=user.id).first()
    if not interview:
        return jsonify({"status": "error", "message": "Interview session not found"}), 404

    return jsonify({
        "status": "success",
        "report": interview.to_dict()
    }), 200


@interview_bp.route("/history", methods=["GET"])
@auth_required
def get_interview_history(user):
    interviews = MockInterview.query.filter_by(user_id=user.id).order_by(MockInterview.created_at.desc()).all()
    return jsonify({
        "status": "success",
        "interviews": [i.to_dict() for i in interviews]
    }), 200
