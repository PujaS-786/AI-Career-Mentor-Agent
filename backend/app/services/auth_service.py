"""
Auth service for user registration, authentication, password hashing and JWT token handling.
"""
from datetime import datetime, timedelta, timezone
import jwt
from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash
from ..database import db
from ..models import User, Progress, ActivityLog


def register_user(email, password, full_name, college=None, degree=None, graduation_year=None, target_role=None, target_company=None, onboarding_path=None):
    existing = User.query.filter_by(email=email.lower().strip()).first()
    if existing:
        raise ValueError("User with this email already exists")

    hashed_pw = generate_password_hash(password)
    user = User(
        email=email.lower().strip(),
        password_hash=hashed_pw,
        full_name=full_name,
        college=college,
        degree=degree,
        graduation_year=int(graduation_year) if graduation_year else None,
        target_role=target_role,
        target_company=target_company,
        onboarding_path=onboarding_path,
    )
    db.session.add(user)
    db.session.flush()

    # Create initial progress record
    progress = Progress(
        user_id=user.id,
        overall_progress=10,
        completed_milestones=0,
        total_milestones=5,
    )
    db.session.add(progress)

    # Log activity
    log = ActivityLog(
        user_id=user.id,
        activity_type="REGISTRATION",
        description="Registered on AI Career Mentor Agent platform",
    )
    db.session.add(log)
    db.session.commit()

    token = generate_token(user.id)
    return user, token


def login_user(email, password):
    user = User.query.filter_by(email=email.lower().strip()).first()
    if not user or not check_password_hash(user.password_hash, password):
        raise ValueError("Invalid email or password")

    token = generate_token(user.id)
    return user, token


def generate_token(user_id):
    secret = current_app.config.get("SECRET_KEY", "dev-secret-key")
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": user_id,
        "exp": now + timedelta(days=7),
        "iat": now,
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_token(token):
    secret = current_app.config.get("SECRET_KEY", "dev-secret-key")
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")


def request_password_reset(email, app_base_url="http://localhost:5173"):
    import os
    import secrets
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from ..models import PasswordResetToken

    mail_server = os.environ.get("MAIL_SERVER")
    mail_port = os.environ.get("MAIL_PORT")
    mail_username = os.environ.get("MAIL_USERNAME")
    mail_password = os.environ.get("MAIL_PASSWORD")

    if not mail_server or not mail_username or not mail_password:
        raise ValueError("SMTP configuration missing in backend .env. Please configure MAIL_SERVER, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD to send reset emails.")

    user = User.query.filter_by(email=email.lower().strip()).first()
    if not user:
        # Do not expose whether the email exists in our database
        return True

    # Generate secure reset token
    reset_token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=30)

    token_entry = PasswordResetToken(
        user_id=user.id,
        token=reset_token,
        expires_at=expires_at,
        is_used=False
    )
    db.session.add(token_entry)
    db.session.commit()

    reset_link = f"{app_base_url}/?reset_token={reset_token}"

    try:
        use_ssl = os.environ.get("MAIL_USE_SSL", "false").lower() in ("true", "1", "yes")
        use_tls = os.environ.get("MAIL_USE_TLS", "true").lower() in ("true", "1", "yes")
        port = int(mail_port) if mail_port else (465 if use_ssl else 587)

        msg = MIMEMultipart()
        msg['Subject'] = "Password Reset Request — AI Career Mentor Agent"
        msg['From'] = mail_username
        msg['To'] = user.email

        body = (
            f"Hello {user.full_name},\n\n"
            f"A password reset request was received for your AI Career Mentor Agent account.\n\n"
            f"Click the link below to set a new password:\n{reset_link}\n\n"
            f"This token is valid for 30 minutes and can only be used once.\n"
            f"If you did not request this, please ignore this email.\n\n"
            f"Regards,\nAI Career Mentor Agent Team"
        )
        msg.attach(MIMEText(body, 'plain'))

        if use_ssl:
            server = smtplib.SMTP_SSL(mail_server, port)
        else:
            server = smtplib.SMTP(mail_server, port)
            if use_tls:
                server.starttls()

        server.login(mail_username, mail_password)
        server.sendmail(mail_username, [user.email], msg.as_string())
        server.quit()
    except Exception as e:
        raise ValueError(f"Failed to send email via SMTP server: {str(e)}")

    return True


def reset_password_with_token(token, new_password):
    from ..models import PasswordResetToken

    token_entry = PasswordResetToken.query.filter_by(token=token).first()
    if not token_entry or not token_entry.is_valid():
        raise ValueError("Invalid or expired password reset token. Please request a new password reset email.")

    user = db.session.get(User, token_entry.user_id) if hasattr(db.session, 'get') else User.query.get(token_entry.user_id)
    if not user:
        raise ValueError("User account associated with this token no longer exists.")

    user.password_hash = generate_password_hash(new_password)
    token_entry.is_used = True
    db.session.commit()

    return user

