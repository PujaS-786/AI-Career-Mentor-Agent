"""
Auth routes: Register, Login, Current User profile
"""
from flask import Blueprint, request, jsonify
from ...services.auth_service import register_user, login_user
from ...utils.auth_decorator import auth_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")

    if not email or not password or not full_name:
        return jsonify({"status": "error", "message": "Email, password, and full_name are required"}), 400

    try:
        user, token = register_user(
            email=email,
            password=password,
            full_name=full_name,
            college=data.get("college"),
            degree=data.get("degree"),
            graduation_year=data.get("graduation_year"),
            target_role=data.get("target_role"),
            target_company=data.get("target_company"),
            onboarding_path=data.get("onboarding_path"),
        )
        return jsonify({
            "status": "success",
            "message": "User registered successfully",
            "token": token,
            "user": user.to_dict(),
        }), 201
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": f"Server error: {str(e)}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password are required"}), 400

    try:
        user, token = login_user(email, password)
        return jsonify({
            "status": "success",
            "message": "Login successful",
            "token": token,
            "user": user.to_dict(),
        }), 200
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 401
    except Exception as e:
        return jsonify({"status": "error", "message": f"Server error: {str(e)}"}), 500


@auth_bp.route("/me", methods=["GET"])
@auth_required
def get_me(user):
    return jsonify({
        "status": "success",
        "user": user.to_dict()
    }), 200


@auth_bp.route("/profile", methods=["PUT", "PATCH"])
@auth_required
def update_profile(user):
    data = request.get_json() or {}
    from ...database import db

    if "full_name" in data and data["full_name"]:
        user.full_name = data["full_name"].strip()
    if "college" in data:
        user.college = data["college"]
    if "degree" in data:
        user.degree = data["degree"]
    if "graduation_year" in data:
        try:
            user.graduation_year = int(data["graduation_year"]) if data["graduation_year"] else None
        except ValueError:
            pass
    if "target_role" in data:
        user.target_role = data["target_role"]
    if "target_company" in data:
        user.target_company = data["target_company"]

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Profile updated successfully",
        "user": user.to_dict()
    }), 200


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email")
    if not email:
        return jsonify({"status": "error", "message": "Email address is required"}), 400

    from ...services.auth_service import request_password_reset
    try:
        app_url = request.headers.get("Origin") or "http://localhost:5173"
        request_password_reset(email, app_url)
        return jsonify({
            "status": "success",
            "message": "If an account exists for that email address, a password reset link has been sent. Please check your inbox."
        }), 200
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": f"Server error sending reset email: {str(e)}"}), 500


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json() or {}
    token = data.get("token")
    new_password = data.get("new_password")

    if not token or not new_password:
        return jsonify({"status": "error", "message": "Reset token and new_password are required"}), 400

    from ...services.auth_service import reset_password_with_token
    try:
        user = reset_password_with_token(token, new_password)
        return jsonify({
            "status": "success",
            "message": "Password reset successfully. You can now log in with your new password.",
            "user": user.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": f"Server error: {str(e)}"}), 500

