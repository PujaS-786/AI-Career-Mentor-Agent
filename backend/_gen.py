import os

BASE = r"c:\Users\Divyanka Singh\OneDrive\Documents\GitHub\AI-Career-Mentor-Agent\backend"

files = {}

# ── config/settings.py ────────────────────────────────────────
files["app/config/settings.py"] = '''import os
from dotenv import load_dotenv

load_dotenv()


class BaseConfig:
    """Shared configuration for all environments."""
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///career_mentor.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")


class DevelopmentConfig(BaseConfig):
    """Development environment settings."""
    DEBUG = True
    FLASK_ENV = "development"


class ProductionConfig(BaseConfig):
    """Production environment settings."""
    DEBUG = False
    FLASK_ENV = "production"


class TestingConfig(BaseConfig):
    """Testing environment settings."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


config_map = {
    "development": DevelopmentConfig,
    "production":  ProductionConfig,
    "testing":     TestingConfig,
}
'''

# ── app/__init__.py  (application factory) ─────────────────────
files["app/__init__.py"] = '''"""
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
'''

# ── app/api/__init__.py ────────────────────────────────────────
files["app/api/__init__.py"] = ""

# ── app/api/v1/__init__.py ─────────────────────────────────────
files["app/api/v1/__init__.py"] = '''"""
API v1 — Blueprint registry
"""
from .health import health_bp

__all__ = ["health_bp"]
'''

# ── app/api/v1/health.py ───────────────────────────────────────
files["app/api/v1/health.py"] = '''"""
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
'''

# ── app/utils/__init__.py ─────────────────────────────────────
files["app/utils/__init__.py"] = ""

# ── app/utils/response.py ─────────────────────────────────────
files["app/utils/response.py"] = '''"""
Utility helpers for consistent JSON responses.
"""
from flask import jsonify


def success(data=None, message="Success", status_code=200):
    """Return a standardised success response."""
    payload = {"status": "success", "message": message}
    if data is not None:
        payload["data"] = data
    return jsonify(payload), status_code


def error(message="An error occurred", status_code=400):
    """Return a standardised error response."""
    return jsonify({"status": "error", "message": message}), status_code
'''

# ── app/agents/__init__.py ─────────────────────────────────────
files["app/agents/__init__.py"] = '''"""
Agents package — reserved for future AI agent modules.
(LangChain agents, tool-calling chains, etc.)
"""
'''

# ── app/services/__init__.py ───────────────────────────────────
files["app/services/__init__.py"] = '''"""
Services package — reserved for future business logic.
(Career analysis, skill-gap detection, recommendations, etc.)
"""
'''

# ── app/models/__init__.py ─────────────────────────────────────
files["app/models/__init__.py"] = '''"""
Models package — reserved for future ORM models.
"""
'''

# ── run.py ────────────────────────────────────────────────────
files["run.py"] = '''"""
Entry point for the Flask development server.

Usage:
    python run.py
    # or
    flask --app run:app run --debug
"""
import os
from app import create_app

env = os.environ.get("FLASK_ENV", "development")
app = create_app(env)

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=app.config.get("DEBUG", True),
    )
'''

# ── tests/__init__.py ─────────────────────────────────────────
files["tests/__init__.py"] = ""

# ── tests/unit/__init__.py ────────────────────────────────────
files["tests/unit/__init__.py"] = ""

# ── tests/integration/__init__.py ────────────────────────────
files["tests/integration/__init__.py"] = ""

# ── tests/conftest.py ─────────────────────────────────────────
files["tests/conftest.py"] = '''"""
Pytest configuration and shared fixtures.
"""
import pytest
from app import create_app


@pytest.fixture()
def app():
    """Create a test Flask application instance."""
    application = create_app("testing")
    application.config.update({"TESTING": True})
    yield application


@pytest.fixture()
def client(app):
    """Return a test client for the app."""
    return app.test_client()
'''

# ── tests/unit/test_health.py ─────────────────────────────────
files["tests/unit/test_health.py"] = '''"""
Unit tests for the /api/health endpoint.
"""


def test_health_check_status_code(client):
    response = client.get("/api/health")
    assert response.status_code == 200


def test_health_check_response_body(client):
    response = client.get("/api/health")
    data = response.get_json()
    assert data["status"] == "ok"
    assert data["service"] == "AI Career Mentor Agent API"
    assert "version" in data
    assert "message" in data
'''

# ── requirements.txt ──────────────────────────────────────────
files["requirements.txt"] = '''# Core
flask>=3.0.0
flask-cors>=4.0.0
python-dotenv>=1.0.0

# Testing
pytest>=8.0.0
pytest-flask>=1.3.0
'''

# ── .env.example ──────────────────────────────────────────────
files[".env.example"] = '''# Backend Environment Variables
# Copy this file to .env and fill in your values.
# Never commit a real .env file.

FLASK_ENV=development
FLASK_DEBUG=1
PORT=5000
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///career_mentor.db
CORS_ORIGINS=http://localhost:5173
# OPENAI_API_KEY=your-openai-api-key-here   # reserved for future AI integration
'''

# Write all files
for rel_path, content in files.items():
    full_path = os.path.join(BASE, rel_path.replace("/", os.sep))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  wrote: {rel_path}")

print("All files written successfully.")
