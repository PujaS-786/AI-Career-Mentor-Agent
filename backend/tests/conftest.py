"""
Pytest configuration and shared fixtures.
"""
import pytest
from app import create_app


@pytest.fixture()
def app():
    """Create a test Flask application instance."""
    import os
    saved_key = os.environ.get("GEMINI_API_KEY")
    os.environ["GEMINI_API_KEY"] = ""
    application = create_app("testing")
    application.config.update({"TESTING": True})
    yield application
    if saved_key:
        os.environ["GEMINI_API_KEY"] = saved_key


@pytest.fixture()
def client(app):
    """Return a test client for the app."""
    return app.test_client()
