"""
Health-check endpoint.

GET /api/v1/health
Returns a JSON payload confirming the backend is running.
Used by the React frontend to verify backend connectivity.
"""
from flask import Blueprint, jsonify

# Register under /api/v1 so the route becomes GET /api/v1/health
health_bp = Blueprint("health", __name__, url_prefix="/api/v1")


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Return backend health status."""
    return jsonify({
        "status": "success",
        "message": "AI Career Mentor Agent backend is running",
        "version": "0.1.0",
    }), 200
