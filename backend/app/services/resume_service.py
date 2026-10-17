"""
Resume Service — Upload handling, strict multi-signal resume validation, and text & hyperlink extraction.
"""
import os
import re
import html
from werkzeug.utils import secure_filename
from ..database import db
from ..models import Resume


NON_RESUME_INDICATORS = [
    r'\bproblem\s*solution\b', r'\bwhy\s*our\s*solution\b', r'\bour\s*solution\b',
    r'\bour\s*usp\b', r'\bworking\s*prototype\b', r'\bfeasibility\s*analysis\b',
    r'\boperational\s*impact\b', r'\btechnical\s*references\b', r'\bdataset\s*information\b',
    r'\bslide\s*\d+\b', r'\bpitch\s*deck\b', r'\bhackathon\b', r'\bproblem\s*statement\b',
    r'\bmarket\s*size\b', r'\bbusiness\s*model\b', r'\bdemo\s*day\b',
    r'\bcompetitor\s*analysis\b', r'\bfuture\s*scope\b', r'\bthank\s*you\s*for\s*listening\b',
    r'\bq\s*&\s*a\b', r'\bquestions\s*&\s*answers\b', r'\bcertificate\s*of\s*(completion|achievement)\b',
    r'\bthis\s*is\s*to\s*certify\s*that\b', r'\bhas\s*successfully\s*completed\b',
    r'\babstract\b', r'\bmethodology\b', r'\bassignment\s*\d+\b', r'\bhomework\b'
]


def extract_pdf_with_links(file_path):
    """
    Extracts text AND clickable hyperlink annotations (/Annots -> /Subtype /Link -> /URI)
    from a PDF file using pypdf.
    """
    import pypdf
    reader = pypdf.PdfReader(file_path)
    text_chunks = []
    links = []

    for page in reader.pages:
        page_text = page.extract_text() or ""
        text_chunks.append(page_text)

        # Inspect PDF annotation dictionary for hyperlinks
        annots = page.get('/Annots')
        if annots:
            for annot_ref in annots:
                try:
                    annot = annot_ref.get_object()
                    if annot and annot.get('/Subtype') == '/Link':
                        action = annot.get('/A')
                        if action:
                            action_obj = action.get_object()
                            uri = action_obj.get('/URI')
                            if uri:
                                links.append(str(uri).strip())
                except Exception:
                    continue

    full_text = "\n".join(text_chunks).strip()
    return full_text, links


def extract_docx_with_links(file_path):
    """
    Extracts text AND embedded hyperlinks from a Word DOCX document.
    """
    import docx
    doc = docx.Document(file_path)
    full_text = "\n".join([p.text for p in doc.paragraphs if p.text]).strip()
    links = []

    try:
        for rel_id, rel in doc.part.rels.items():
            if "hyperlink" in getattr(rel, "reltype", "") and getattr(rel, "target_ref", None):
                links.append(str(rel.target_ref).strip())
    except Exception:
        pass

    return full_text, links


def extract_text_and_links_from_file(file_path, filename):
    ext = os.path.splitext(filename)[1].lower()
    text = ""
    links = []

    try:
        if ext == ".pdf":
            text, links = extract_pdf_with_links(file_path)
        elif ext in [".docx", ".doc"]:
            text, links = extract_docx_with_links(file_path)
    except Exception as e:
        text = ""
        links = []

    return text.strip(), links


def validate_and_extract_resume(file_path, filename):
    """
    Multi-signal resume validation.
    Accepts valid PDF and DOCX student and professional resumes.
    Strictly rejects presentations (PPT/PPTX), hackathon decks, certificates, assignments, and non-resumes.
    Preserves and surfaces clickable hyperlinks (LinkedIn, GitHub).
    """
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = [".pdf", ".docx", ".doc"]
    if ext not in allowed_exts:
        raise ValueError(
            "The uploaded document does not appear to be a valid resume format. "
            "Please upload a valid PDF or DOCX resume document (presentations, PPT/PPTX files, images, and text notes are not accepted)."
        )

    # File size validation (200 bytes min, 10MB max)
    file_size = os.path.getsize(file_path)
    if file_size < 200 or file_size > 10 * 1024 * 1024:
        raise ValueError(
            "The uploaded document does not appear to be a valid resume. "
            "Please upload a valid PDF or DOCX resume document."
        )

    text, links = extract_text_and_links_from_file(file_path, filename)
    if not text or len(text.strip()) < 150:
        raise ValueError(
            "The uploaded document does not appear to be a valid resume. "
            "The document contains insufficient text or incomplete profile details."
        )

    text_lower = text.lower()

    # 1. Reject if presentation/deck/certificate/assignment negative indicators exist
    neg_matches = sum(1 for pattern in NON_RESUME_INDICATORS if re.search(pattern, text_lower))
    if neg_matches >= 2:
        raise ValueError(
            "The uploaded document appears to be a presentation deck, certificate, or assignment rather than a resume. "
            "Please upload a valid PDF or DOCX resume document."
        )

    # 2. Extract and recognize candidate contact details (Email, Phone, LinkedIn, GitHub)
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text))
    has_phone = bool(re.search(r'(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}|\b\d{10}\b', text))

    # Detect LinkedIn: from clickable PDF/DOCX annotations OR plain text
    detected_linkedin = None
    for link in links:
        if "linkedin.com/in" in link.lower() or "linkedin.com" in link.lower():
            detected_linkedin = link
            break

    if not detected_linkedin:
        # Check text regex
        m = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
        if m:
            detected_linkedin = f"https://www.linkedin.com/in/{m.group(1)}"
        else:
            # Check LinkedIn icon or shorthand like "in divyanka-singh-..."
            m2 = re.search(r'\bin\s+([a-zA-Z0-9_-]{5,40})\b', text)
            if m2 and any('linkedin' in l.lower() for l in links):
                detected_linkedin = next(l for l in links if 'linkedin' in l.lower())

    # Detect GitHub: from clickable links or plain text
    detected_github = None
    for link in links:
        if "github.com/" in link.lower() and not link.lower().endswith("github.com/"):
            detected_github = link
            break

    if not detected_github:
        m_git = re.search(r'(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
        if m_git and m_git.group(1).lower() not in ["click", "here", "to", "visit", "prototype"]:
            detected_github = f"https://github.com/{m_git.group(1)}"

    has_candidate_contact = has_email and (has_phone or bool(detected_linkedin) or bool(detected_github))

    # 3. Resume section verification
    has_education = bool(re.search(
        r'\b(education|academic background|qualifications?|academic profile|bca|b\.tech|bachelor|master|degree|school|matriculation|intermediate|cgpa|gpa)\b',
        text_lower
    ))
    has_skills = bool(re.search(
        r'\b(technical skills|core competencies|skills|tech stack|languages\s*(&|and)\s*frameworks|programming|tools|libraries)\b',
        text_lower
    ))
    has_projects_or_exp = bool(re.search(
        r'\b(projects?|key projects|academic projects|technical projects|experience|work experience|internships?|employment|contributions)\b',
        text_lower
    ))

    # A document without personal candidate contact details or lacking core resume sections cannot be a resume
    if not has_candidate_contact:
        raise ValueError(
            "The uploaded document does not appear to be a valid resume. "
            "A valid resume must contain personal contact details (such as email, phone number, or profile link)."
        )

    if not has_education and not has_skills:
        raise ValueError(
            "The uploaded document does not appear to be a valid resume. "
            "A valid resume must contain an Education or Technical Skills section."
        )

    if not has_projects_or_exp and not has_skills:
        raise ValueError(
            "The uploaded document does not appear to be a valid resume. "
            "A valid resume must contain Projects, Experience, or Skills sections."
        )

    # Append detected clickable links to text if not already explicitly written in text body
    enriched_text = text
    links_to_append = []
    if detected_linkedin and detected_linkedin.lower() not in text_lower:
        links_to_append.append(f"LinkedIn Profile: {detected_linkedin}")
    if detected_github and detected_github.lower() not in text_lower:
        links_to_append.append(f"GitHub Profile: {detected_github}")

    if links_to_append:
        enriched_text += "\n\n[DETECTED PROFILE HYPERLINKS]\n" + "\n".join(links_to_append)

    contact_metadata = {
        "email": re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text).group(0) if has_email else None,
        "phone": re.search(r'(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}|\b\d{10}\b', text).group(0) if has_phone else None,
        "linkedin_url": detected_linkedin,
        "github_url": detected_github,
    }

    return enriched_text.strip(), contact_metadata


def save_user_resume(user_id, file_obj, upload_folder):
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder, exist_ok=True)

    original_filename = secure_filename(file_obj.filename)
    if not original_filename:
        original_filename = "resume.pdf"

    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc"]:
        raise ValueError(
            "The uploaded document does not appear to be a valid resume format. "
            "Please upload a valid PDF or DOCX resume document (presentations, PPT/PPTX files, and images are not accepted)."
        )

    save_path = os.path.join(upload_folder, f"user_{user_id}_{original_filename}")
    file_obj.save(save_path)

    try:
        extracted_text, contact_meta = validate_and_extract_resume(save_path, original_filename)
    except Exception as e:
        if os.path.exists(save_path):
            try:
                os.remove(save_path)
            except OSError:
                pass
        raise e

    resume = Resume(
        user_id=user_id,
        filename=original_filename,
        file_path=save_path,
        extracted_text=extracted_text,
    )
    db.session.add(resume)
    db.session.commit()

    return resume
