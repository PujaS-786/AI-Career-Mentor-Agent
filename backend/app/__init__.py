"""
AI Career Mentor Agent — Flask Application Factory
"""
from flask import Flask
from flask_cors import CORS

from .config.settings import config_map
from .database import db


def create_app(env: str = "development") -> Flask:
    """Create and configure the Flask application."""
    flask_app = Flask(__name__)

    # Load config class for the given environment
    config_class = config_map.get(env, config_map["development"])
    flask_app.config.from_object(config_class)

    # Enable CORS
    CORS(flask_app, origins=flask_app.config["CORS_ORIGINS"])

    # Initialize Database
    db.init_app(flask_app)

    # Register blueprints
    _register_blueprints(flask_app)

    # Create tables if not existing
    with flask_app.app_context():
        from . import models  # Ensure models are loaded
        db.create_all()

    return flask_app


def _register_blueprints(flask_app: Flask) -> None:
    """Register all API blueprints."""
    from .api.v1 import (
        health_bp,
        auth_bp,
        assessment_bp,
        resume_bp,
        analysis_bp,
        roles_bp,
        skills_bp,
        roadmap_bp,
        interview_bp,
        progress_bp,
        mentor_bp,
    )
    flask_app.register_blueprint(health_bp)
    flask_app.register_blueprint(auth_bp)
    flask_app.register_blueprint(assessment_bp)
    flask_app.register_blueprint(resume_bp)
    flask_app.register_blueprint(analysis_bp)
    flask_app.register_blueprint(roles_bp)
    flask_app.register_blueprint(skills_bp)
    flask_app.register_blueprint(roadmap_bp)
    flask_app.register_blueprint(interview_bp)
    flask_app.register_blueprint(progress_bp)
    flask_app.register_blueprint(mentor_bp)
