"""
Health-check endpoint.

GET /api/health
Returns a JSON payload confirming the backend is running.
"""
from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__, url_prefix="/api")


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Return backend health status."""
    return jsonify({
        "status": "ok",
        "service": "AI Career Mentor Agent API",
        "version": "0.1.0",
        "message": "Backend is running successfully.",
    }), 200
