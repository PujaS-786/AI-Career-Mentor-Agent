"""
Resume Upload, Validation, Confirmation, ATS Generation & PDF Download API routes
"""
import os
import re
import html
import json
from io import BytesIO
from flask import Blueprint, request, jsonify, current_app, send_file
from ...database import db
from ...services.resume_service import save_user_resume
from ...models import Resume, ResumeAnalysis, ImprovedResume
from ...agents import ResumeAndProfileAnalysisAgent
from ...utils.auth_decorator import auth_required

resume_bp = Blueprint("resume", __name__, url_prefix="/api/v1/resume")


@resume_bp.route("/upload", methods=["POST"])
@auth_required
def upload_resume(user):
    if "file" not in request.files:
        data = request.get_json(silent=True) or {}
        resume_text = data.get("resume_text")
        if resume_text:
            text_lower = resume_text.lower()
            sections_found = sum(1 for kw in ["education", "skills", "experience", "projects", "certifications"] if kw in text_lower)
            if len(resume_text.strip()) < 100 or sections_found < 2:
                return jsonify({
                    "status": "error",
                    "message": "The uploaded text does not appear to be a valid resume. Please upload a valid PDF or DOCX resume document containing recognizable education, skills, or experience."
                }), 400
            existing = Resume.query.filter_by(user_id=user.id).first()
            if not existing:
                existing = Resume(
                    user_id=user.id,
                    filename="user_resume_text.txt",
                    raw_text=resume_text.strip(),
                    extracted_text=resume_text.strip()
                )
                db.session.add(existing)
            else:
                existing.raw_text = resume_text.strip()
                existing.extracted_text = resume_text.strip()
            db.session.commit()
            return jsonify({
                "status": "success",
                "message": "Resume uploaded successfully",
                "resume": existing.to_dict()
            }), 201

        return jsonify({
            "status": "error",
            "message": "No resume file selected. Please choose a valid PDF or DOCX file."
        }), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({
            "status": "error",
            "message": "No file selected. Please choose a valid PDF or DOCX resume document."
        }), 400

    original_filename = file.filename
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc"]:
        return jsonify({
            "status": "error",
            "message": "The uploaded document does not appear to be a valid resume format. Please upload a valid PDF or DOCX resume document (presentations, PPT/PPTX files, and images are not accepted)."
        }), 400

    upload_folder = os.path.join(current_app.root_path, "..", "data", "resumes")
    try:
        resume = save_user_resume(user.id, file, upload_folder)
        return jsonify({
            "status": "success",
            "message": "Resume uploaded and validated successfully",
            "resume": resume.to_dict(),
            "extracted_text": resume.extracted_text
        }), 200
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": f"Resume processing error: {str(e)}"}), 500


@resume_bp.route("", methods=["GET"])
@auth_required
def get_resume(user):
    resume = Resume.query.filter_by(user_id=user.id).order_by(Resume.uploaded_at.desc()).first()
    return jsonify({
        "status": "success",
        "resume": resume.to_dict() if resume else None,
        "extracted_text": resume.extracted_text if resume else None
    }), 200


@resume_bp.route("/confirm-details", methods=["POST"])
@auth_required
def confirm_details(user):
    """
    Persists user-confirmed details and missing information collected before final ATS resume generation.
    """
    data = request.get_json() or {}
    analysis = ResumeAnalysis.query.filter_by(user_id=user.id).first()
    if not analysis:
        return jsonify({"status": "error", "message": "No resume analysis found. Please upload and analyze your resume first."}), 400

    current_profile = json.loads(analysis.structured_profile_json) if analysis.structured_profile_json else {}

    # Merge confirmed sections
    if "contact_info" in data:
        current_profile["contact_info"] = {**(current_profile.get("contact_info") or {}), **data["contact_info"]}
        if data["contact_info"].get("full_name"):
            user.full_name = data["contact_info"]["full_name"].strip()
    if "education" in data:
        current_profile["education"] = data["education"]
    if "skills" in data:
        current_profile["skills"] = data["skills"]
    if "projects" in data:
        current_profile["projects"] = data["projects"]
    if "experience" in data:
        current_profile["experience"] = data["experience"]
    if "certifications" in data:
        current_profile["certifications"] = data["certifications"]

    analysis.structured_profile_json = json.dumps(current_profile)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Resume details confirmed and persisted successfully",
        "profile": current_profile
    }), 200


@resume_bp.route("/improve", methods=["POST"])
@auth_required
def improve_resume(user):
    resume = Resume.query.filter_by(user_id=user.id).order_by(Resume.uploaded_at.desc()).first()
    if not resume:
        return jsonify({"status": "error", "message": "No uploaded resume found. Please upload a resume first."}), 400

    data = request.get_json(silent=True) or {}
    confirmed_details = data.get("confirmed_details")

    analysis = ResumeAnalysis.query.filter_by(user_id=user.id).first()
    profile = json.loads(analysis.structured_profile_json) if (analysis and analysis.structured_profile_json) else {}

    target_role = user.target_role or data.get("target_role")
    target_company = user.target_company or data.get("target_company")

    agent = ResumeAndProfileAnalysisAgent()
    improved_data = agent.improve_resume(
        resume.extracted_text,
        profile,
        target_role=target_role,
        target_company=target_company,
        confirmed_details=confirmed_details
    )

    imp = ImprovedResume(
        user_id=user.id,
        original_resume_id=resume.id,
        target_role=target_role or "Role Neutral",
        target_company=target_company or "",
        improved_text=improved_data.get("improved_text", ""),
        improved_markdown=improved_data.get("improved_markdown", ""),
        improvement_notes_json=json.dumps(improved_data.get("improvement_notes", []))
    )
    db.session.add(imp)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Improved ATS resume draft generated successfully",
        "improved_resume": imp.to_dict(),
        "completeness_report": improved_data.get("completeness_report")
    }), 200


@resume_bp.route("/improved", methods=["GET"])
@auth_required
def get_improved_resume(user):
    imp = ImprovedResume.query.filter_by(user_id=user.id).order_by(ImprovedResume.created_at.desc()).first()
    return jsonify({
        "status": "success",
        "improved_resume": imp.to_dict() if imp else None
    }), 200


@resume_bp.route("/improved/update-text", methods=["POST"])
@auth_required
def update_improved_resume_text(user):
    data = request.get_json() or {}
    new_text = data.get("text")
    if not new_text or not new_text.strip():
        return jsonify({"status": "error", "message": "Resume text cannot be empty."}), 400

    imp = ImprovedResume.query.filter_by(user_id=user.id).order_by(ImprovedResume.created_at.desc()).first()
    if not imp:
        return jsonify({"status": "error", "message": "No improved resume found to update."}), 404

    imp.improved_text = new_text.strip()
    imp.improved_markdown = new_text.strip()
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Improved resume text updated successfully",
        "improved_resume": imp.to_dict()
    }), 200


def build_ats_resume_pdf(text_content, candidate_name):
    """
    Builds a clean, single-column, ATS-compliant PDF document from resume text using ReportLab.
    Ensures safe XML character escaping, clickable tel/mailto/http hyperlinks, and balanced vertical spacing.
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors

    def safe_xml(raw_text):
        escaped = html.escape(raw_text)
        # Convert markdown bold and italic
        escaped = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', escaped)
        escaped = re.sub(r'\*(.+?)\*', r'<i>\1</i>', escaped)
        # Convert markdown links [text](url)
        escaped = re.sub(r'\[(.*?)\]\((https?://[^\s)]+)\)', r'<link href="\2" color="#0369a1"><u>\1</u></link>', escaped)
        return escaped

    icons_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "icons"))

    def get_icon_tag(name):
        path = os.path.join(icons_dir, f"{name}.png").replace('\\', '/')
        if os.path.exists(path):
            return f'<img src="{path}" width="8.5" height="8.5" valign="-1"/> '
        return ""

    def format_contact_line(raw_line):
        parts = [p.strip() for p in re.split(r'\s*\|\s*', raw_line) if p.strip()]
        formatted_parts = []
        for part in parts:
            # Strip redundant user-facing labels like "Phone:", "Email:", "LinkedIn:"
            cleaned = re.sub(r'^(?:phone|tel|email|linkedin|github|location)\s*:\s*', '', part, flags=re.IGNORECASE).strip()

            # Handle Markdown links [text](url)
            md_match = re.match(r'\[(.*?)\]\((https?://[^\s)]+)\)', cleaned)
            if md_match:
                disp, url = md_match.group(1), md_match.group(2)
                icon = ""
                if "linkedin" in url.lower():
                    icon = get_icon_tag("linkedin")
                elif "github" in url.lower():
                    icon = get_icon_tag("github")
                formatted_parts.append(f'{icon}<link href="{url}" color="#0369a1"><u>{html.escape(disp)}</u></link>')
                continue

            # Handle Email
            email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', cleaned)
            if email_match:
                em = email_match.group(0)
                icon = get_icon_tag("email")
                formatted_parts.append(f'{icon}<link href="mailto:{em}" color="#0369a1"><u>{html.escape(em)}</u></link>')
                continue

            # Handle LinkedIn
            if 'linkedin.com' in cleaned.lower():
                url = cleaned if cleaned.startswith('http') else f"https://{cleaned}"
                disp = re.sub(r'^https?://(?:www\.)?', '', url).rstrip('/')
                icon = get_icon_tag("linkedin")
                formatted_parts.append(f'{icon}<link href="{url}" color="#0369a1"><u>{html.escape(disp)}</u></link>')
                continue

            # Handle GitHub
            if 'github.com' in cleaned.lower():
                url = cleaned if cleaned.startswith('http') else f"https://{cleaned}"
                disp = re.sub(r'^https?://(?:www\.)?', '', url).rstrip('/')
                icon = get_icon_tag("github")
                formatted_parts.append(f'{icon}<link href="{url}" color="#0369a1"><u>{html.escape(disp)}</u></link>')
                continue

            # Handle Phone
            phone_match = re.search(r'(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}|\b\d{10}\b', cleaned)
            if phone_match:
                digits = re.sub(r'[^\d+]', '', cleaned)
                icon = get_icon_tag("phone")
                formatted_parts.append(f'{icon}<link href="tel:{digits}" color="#334155">{html.escape(cleaned)}</link>')
                continue

            # General plain text (e.g., location if supplied)
            if cleaned:
                icon = get_icon_tag("location")
                formatted_parts.append(f'{icon}{html.escape(cleaned)}')

        return ' &nbsp;|&nbsp; '.join(formatted_parts)

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=32,
        bottomMargin=32
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=17,
        leading=20,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=2,
        alignment=1
    )
    contact_style = ParagraphStyle(
        'ContactStyle',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155'),
        spaceAfter=4,
        alignment=1
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True
    )
    subheading_style = ParagraphStyle(
        'SubHeading',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=12.5,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=4,
        spaceAfter=1,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=2
    )
    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor('#1E293B'),
        leftIndent=12,
        spaceAfter=1.8
    )

    story = []
    lines = text_content.split('\n')
    is_first_line = True
    seen_contact = False

    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue

        if line_str.startswith('# '):
            story.append(Paragraph(safe_xml(line_str[2:]), title_style))
            is_first_line = False
        elif not seen_contact and ('@' in line_str or 'linkedin' in line_str.lower() or 'phone' in line_str.lower() or re.search(r'\+?\d{10,12}', line_str)):
            formatted_contact = format_contact_line(line_str)
            story.append(Paragraph(formatted_contact, contact_style))
            story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#94A3B8'), spaceAfter=5))
            seen_contact = True
        elif line_str.startswith('## '):
            section_title = safe_xml(line_str[3:].upper())
            story.append(Paragraph(section_title, heading_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceAfter=3))
        elif line_str.startswith('### '):
            item_title = safe_xml(line_str[4:])
            story.append(Paragraph(f"<b>{item_title}</b>", subheading_style))
        elif line_str.startswith('- '):
            bullet_text = safe_xml(line_str[2:])
            story.append(Paragraph(f"&bull; {bullet_text}", bullet_style))
        else:
            story.append(Paragraph(safe_xml(line_str), body_style))

    doc.build(story)
    buffer.seek(0)
    return buffer


@resume_bp.route("/improved/download", methods=["GET", "POST"])
@auth_required
def download_improved_resume_pdf(user):
    data = request.get_json(silent=True) or {}
    custom_text = data.get("text")

    imp = ImprovedResume.query.filter_by(user_id=user.id).order_by(ImprovedResume.created_at.desc()).first()
    text_to_render = custom_text or (imp.improved_text if imp else None)

    if not text_to_render:
        return jsonify({
            "status": "error",
            "message": "No improved resume draft found to download. Please generate your improved resume draft first."
        }), 400

    try:
        candidate_name = user.full_name or "Candidate"
        pdf_buffer = build_ats_resume_pdf(text_to_render, candidate_name)
        safe_name = re.sub(r'[^a-zA-Z0-9_-]', '_', candidate_name)
        filename = f"{safe_name}_ATS_Improved_Resume.pdf"

        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=filename,
            mimetype="application/pdf"
        )
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error generating PDF: {str(e)}"
        }), 500
