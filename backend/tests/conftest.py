"""
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
