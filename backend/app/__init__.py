"""
AI Career Mentor Agent — Flask Application Factory
"""
from flask import Flask
from flask_cors import CORS

from .config.settings import config_map


def create_app(env: str = "development") -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Load config class for the given environment
    config_class = config_map.get(env, config_map["development"])
    app.config.from_object(config_class)

    # Enable CORS
    CORS(app, origins=app.config["CORS_ORIGINS"])

    # Register blueprints
    _register_blueprints(app)

    return app


def _register_blueprints(app: Flask) -> None:
    """Register all API blueprints."""
    from .api.v1 import health_bp
    app.register_blueprint(health_bp)
