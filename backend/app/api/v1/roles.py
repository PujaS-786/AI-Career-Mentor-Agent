"""
Career Role Matching & Role Selection API routes
"""
import json
from flask import Blueprint, request, jsonify
from ...database import db
from ...models import ResumeAnalysis, PreferredRole, SkillGap, RoadmapMilestone, LearningResource, Project, Certification
from ...agents import CareerMentorOrchestratorAgent
from ...utils.auth_decorator import auth_required
from ...services.progress_service import update_progress_on_event

roles_bp = Blueprint("roles", __name__, url_prefix="/api/v1/roles")


@roles_bp.route("/match", methods=["POST"])
@auth_required
def match_roles(user):
    data = request.get_json() or {}
    preferred = data.get("preferred_roles", [])

    from ...models import CareerAssessment
    analysis = ResumeAnalysis.query.filter_by(user_id=user.id).first()
    assessment = CareerAssessment.query.filter_by(user_id=user.id).first()

    profile = {}
    if analysis and analysis.structured_profile_json:
        try:
            profile = json.loads(analysis.structured_profile_json)
        except Exception:
            profile = {}
    elif assessment and assessment.current_technical_skills:
        user_skills = [s.strip() for s in assessment.current_technical_skills.split(",") if s.strip()]
        profile = {"skills": user_skills, "profile_summary": "Assessment-based profile"}
    else:
        profile = {"skills": [], "profile_summary": "New Candidate Profile"}

    try:
        orchestrator = CareerMentorOrchestratorAgent()
        matches = orchestrator.process_role_matching(profile, preferred)

        # Save matches
        PreferredRole.query.filter_by(user_id=user.id).delete()
        for m in matches:
            pr = PreferredRole(user_id=user.id, role_name=m["role_name"], match_percentage=m["match_percentage"])
            db.session.add(pr)
        db.session.commit()

        return jsonify({
            "status": "success",
            "matches": matches
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error during role matching: {e}")
        return jsonify({
            "status": "error",
            "message": f"Failed to calculate role matches: {str(e)}"
        }), 500


@roles_bp.route("/select", methods=["POST"])
@auth_required
def select_role(user):
    data = request.get_json() or {}
    target_role = data.get("target_role")
    target_company = data.get("target_company")

    # If target_role is not provided in payload, preserve user's existing confirmed target_role
    if (not target_role or not str(target_role).strip()) and user.target_role:
        target_role = user.target_role

    if not target_role or not str(target_role).strip():
        return jsonify({"status": "error", "message": "target_role is required"}), 400

    target_role = str(target_role).strip()
    user.target_role = target_role
    if target_company is not None and str(target_company).strip():
        user.target_company = str(target_company).strip()

    from ...models import CareerAssessment
    analysis = ResumeAnalysis.query.filter_by(user_id=user.id).first()
    assessment = CareerAssessment.query.filter_by(user_id=user.id).first()

    profile = {}
    if analysis and analysis.structured_profile_json:
        try:
            profile = json.loads(analysis.structured_profile_json)
        except Exception:
            profile = {}
    elif assessment and assessment.current_technical_skills:
        user_skills = [s.strip() for s in assessment.current_technical_skills.split(",") if s.strip()]
        profile = {"skills": user_skills, "profile_summary": "Assessment-based profile"}
    else:
        profile = {"skills": [], "profile_summary": "Candidate Profile"}

    orchestrator = CareerMentorOrchestratorAgent()
    try:
        results = orchestrator.process_skill_gap_and_roadmap(user.id, profile, target_role, user.target_company)
    except Exception as e:
        print(f"Orchestrator skill gap & roadmap error: {e}, falling back to agent defaults")
        gap_report = orchestrator.skill_gap_agent.analyze_gaps(profile, target_role, user.target_company)
        roadmap_data = orchestrator.roadmap_agent.generate_roadmap(gap_report, profile.get("profile_summary"))
        results = {"skill_gap": gap_report, "roadmap": roadmap_data}

    gap_report = results.get("skill_gap") or {}
    roadmap_data = results.get("roadmap") or {}

    try:
        # Save Skill Gap
        SkillGap.query.filter_by(user_id=user.id).delete()
        sg = SkillGap(
            user_id=user.id,
            target_role=target_role,
            existing_skills_json=json.dumps(gap_report.get("existing_skills", [])),
            weak_skills_json=json.dumps(gap_report.get("weak_skills", [])),
            missing_skills_json=json.dumps(gap_report.get("missing_skills", [])),
            priority_gaps_json=json.dumps(gap_report.get("priority_gaps", [])),
            gap_summary=gap_report.get("gap_summary", "")
        )
        db.session.add(sg)

        # Save Roadmap Milestones & Items
        RoadmapMilestone.query.filter_by(user_id=user.id).delete()
        LearningResource.query.filter_by(user_id=user.id).delete()
        Project.query.filter_by(user_id=user.id).delete()
        Certification.query.filter_by(user_id=user.id).delete()

        milestones_list = roadmap_data.get("milestones") if isinstance(roadmap_data, dict) else []
        if not isinstance(milestones_list, list):
            milestones_list = []

        for idx, m in enumerate(milestones_list, 1):
            if not isinstance(m, dict):
                m = {"title": str(m), "milestone_order": idx, "description": "", "skills": [], "estimated_weeks": 2}

            skills = m.get("skills") if isinstance(m.get("skills"), list) else []
            ms = RoadmapMilestone(
                user_id=user.id,
                milestone_order=m.get("milestone_order", idx),
                title=m.get("title") or f"Milestone {idx}",
                description=m.get("description", ""),
                skills_json=json.dumps(skills),
                estimated_weeks=m.get("estimated_weeks", 2)
            )
            db.session.add(ms)
            db.session.flush()

            resources = m.get("resources") if isinstance(m.get("resources"), list) else []
            for r in resources:
                if isinstance(r, dict):
                    r_title = r.get("title") or "Recommended Learning Resource"
                    r_type = r.get("type") or "Course"
                    r_url = r.get("url") or "#"
                else:
                    r_title = str(r)
                    r_type = "Course"
                    r_url = "#"
                lr = LearningResource(
                    user_id=user.id,
                    milestone_id=ms.id,
                    title=r_title,
                    resource_type=r_type,
                    url=r_url
                )
                db.session.add(lr)

            projects = m.get("projects") if isinstance(m.get("projects"), list) else []
            for p in projects:
                if isinstance(p, dict):
                    p_title = p.get("title") or "Milestone Project"
                    p_desc = p.get("description", "")
                else:
                    p_title = str(p)
                    p_desc = ""
                proj = Project(
                    user_id=user.id,
                    title=p_title,
                    description=p_desc,
                    skills_json=json.dumps(skills)
                )
                db.session.add(proj)

        certs_list = roadmap_data.get("certifications") if isinstance(roadmap_data, dict) else []
        if isinstance(certs_list, list):
            for c in certs_list:
                if isinstance(c, dict):
                    c_title = c.get("title") or "Professional Certification"
                    c_prov = c.get("provider") or "Coursera / Meta"
                else:
                    c_title = str(c)
                    c_prov = "Online Provider"
                cert = Certification(
                    user_id=user.id,
                    title=c_title,
                    provider=c_prov
                )
                db.session.add(cert)

        db.session.commit()
        update_progress_on_event(user.id, "ROLE_SELECTED", {"role": target_role})

        return jsonify({
            "status": "success",
            "message": f"Confirmed target role as {target_role}",
            "user": user.to_dict(),
            "skill_gap": gap_report,
            "roadmap": roadmap_data
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error persisting role selection: {e}")
        return jsonify({
            "status": "error",
            "message": f"Failed to save role selection and roadmap: {str(e)}"
        }), 500
