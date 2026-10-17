"""
Personalized Roadmap & Milestone API routes
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from ...database import db
from ...models import RoadmapMilestone, LearningResource, Project, Certification
from ...utils.auth_decorator import auth_required
from ...services.progress_service import update_progress_on_event

roadmap_bp = Blueprint("roadmap", __name__, url_prefix="/api/v1/roadmap")


@roadmap_bp.route("", methods=["GET"])
@auth_required
def get_roadmap(user):
    milestones = RoadmapMilestone.query.filter_by(user_id=user.id).order_by(RoadmapMilestone.milestone_order.asc()).all()
    resources = LearningResource.query.filter_by(user_id=user.id).all()
    projects = Project.query.filter_by(user_id=user.id).all()
    certifications = Certification.query.filter_by(user_id=user.id).all()

    formatted_milestones = []
    for m in milestones:
        m_dict = m.to_dict()
        m_dict["resources"] = [r.to_dict() for r in resources if r.milestone_id == m.id]
        m_dict["projects"] = [p.to_dict() for p in projects if p.skills_json and any(s in m.skills_json for s in p.to_dict()["skills"])]
        formatted_milestones.append(m_dict)

    return jsonify({
        "status": "success",
        "milestones": formatted_milestones,
        "resources": [r.to_dict() for r in resources],
        "projects": [p.to_dict() for p in projects],
        "certifications": [c.to_dict() for c in certifications]
    }), 200


@roadmap_bp.route("/milestones/<int:milestone_id>", methods=["PATCH"])
@auth_required
def toggle_milestone(user, milestone_id):
    data = request.get_json() or {}
    milestone = RoadmapMilestone.query.filter_by(id=milestone_id, user_id=user.id).first()

    if not milestone:
        return jsonify({"status": "error", "message": "Milestone not found"}), 404

    is_completed = data.get("is_completed", not milestone.is_completed)
    milestone.is_completed = is_completed
    milestone.completed_at = datetime.utcnow() if is_completed else None

    db.session.commit()
    update_progress_on_event(user.id, "MILESTONE_TOGGLED")

    return jsonify({
        "status": "success",
        "message": "Milestone status updated",
        "milestone": milestone.to_dict()
    }), 200


@roadmap_bp.route("/projects/<int:project_id>", methods=["PATCH"])
@auth_required
def toggle_project(user, project_id):
    data = request.get_json() or {}
    project = Project.query.filter_by(id=project_id, user_id=user.id).first()
    if not project:
        return jsonify({"status": "error", "message": "Project not found"}), 404

    project.is_completed = data.get("is_completed", not project.is_completed)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Project status updated",
        "project": project.to_dict()
    }), 200


@roadmap_bp.route("/certifications/<int:cert_id>", methods=["PATCH"])
@auth_required
def toggle_certification(user, cert_id):
    data = request.get_json() or {}
    cert = Certification.query.filter_by(id=cert_id, user_id=user.id).first()
    if not cert:
        return jsonify({"status": "error", "message": "Certification not found"}), 404

    cert.is_completed = data.get("is_completed", not cert.is_completed)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Certification status updated",
        "certification": cert.to_dict()
    }), 200
