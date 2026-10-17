"""
Auth token decorator utility with demo user fallback.
"""
from functools import wraps
from flask import request, jsonify
from ..database import db
from ..services.auth_service import decode_token
from ..models import User


def get_current_user():
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            user_id = decode_token(token)
            user = db.session.get(User, user_id) if hasattr(db.session, 'get') else User.query.get(user_id)
            if user:
                return user
        except Exception:
            pass

    return None


def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"status": "error", "message": "Authentication required. Please log in."}), 401
        return f(user, *args, **kwargs)
    return decorated
