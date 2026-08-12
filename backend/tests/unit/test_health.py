"""
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
