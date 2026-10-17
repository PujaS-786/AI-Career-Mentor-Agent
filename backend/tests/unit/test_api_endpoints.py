"""
Unit and integration tests for AI Career Mentor Agent API endpoints.
"""
import io
import json


def test_auth_register_and_login(client):
    # Test registration
    reg_data = {
        "email": "teststudent@example.com",
        "password": "securepassword123",
        "full_name": "Test Student",
        "college": "Tech University",
        "degree": "B.Tech Computer Science",
        "graduation_year": 2026,
        "onboarding_path": "path1"
    }
    response = client.post("/api/v1/auth/register", json=reg_data)
    assert response.status_code == 201
    res_json = response.get_json()
    assert res_json["status"] == "success"
    assert "token" in res_json

    # Test login
    login_data = {
        "email": "teststudent@example.com",
        "password": "securepassword123"
    }
    login_res = client.post("/api/v1/auth/login", json=login_data)
    assert login_res.status_code == 200
    assert login_res.get_json()["status"] == "success"


def test_assessment_and_role_selection(client):
    # Register user first
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "student2@example.com",
        "password": "password123",
        "full_name": "Student Two"
    })
    token = reg_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit assessment
    assess_data = {
        "career_interests": "Software Engineering, AI",
        "current_technical_skills": "Python, JavaScript, React",
        "experience_level": "Intermediate",
        "career_goals": "Become a Senior Full Stack Engineer"
    }
    res = client.post("/api/v1/assessment", json=assess_data, headers=headers)
    assert res.status_code == 200

    # Role matching
    match_res = client.post("/api/v1/roles/match", json={"preferred_roles": ["Software Developer", "Data Analyst"]}, headers=headers)
    assert match_res.status_code == 200
    assert len(match_res.get_json()["matches"]) > 0

    # Select target role
    select_res = client.post("/api/v1/roles/select", json={"target_role": "Software Developer", "target_company": "Google"}, headers=headers)
    assert select_res.status_code == 200
    select_json = select_res.get_json()
    assert select_json["skill_gap"]["target_role"] == "Software Developer"
    assert len(select_json["roadmap"]["milestones"]) > 0


def test_mock_interview_flow(client):
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "student3@example.com",
        "password": "password123",
        "full_name": "Student Three"
    })
    token = reg_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Start interview
    start_res = client.post("/api/v1/interview/start", json={"mode": "Technical", "target_role": "Software Developer"}, headers=headers)
    assert start_res.status_code == 201
    start_json = start_res.get_json()
    interview_id = start_json["interview_id"]
    question_id = start_json["current_question"]["id"]

    # Submit answer
    ans_res = client.post(f"/api/v1/interview/{interview_id}/answer", json={
        "question_id": question_id,
        "answer": "I have strong foundational knowledge in Python, Flask API development, React, and relational database design with SQL."
    }, headers=headers)
    assert ans_res.status_code == 200

    # Complete interview
    comp_res = client.post(f"/api/v1/interview/{interview_id}/complete", json={
        "presentation_cues": {"camera_engagement": "Good", "posture": "Good"}
    }, headers=headers)
    assert comp_res.status_code == 200
    assert comp_res.get_json()["report"]["overall_score"] >= 0


def test_invalid_resume_rejection(client):
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "invalidresume@example.com",
        "password": "password123",
        "full_name": "Test User"
    })
    token = reg_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload invalid non-resume text
    res = client.post("/api/v1/resume/upload", json={"resume_text": "Random text without resume content"}, headers=headers)
    assert res.status_code == 400
    assert "does not appear to be a valid resume" in res.get_json()["message"]


def test_empty_career_interest_rejection(client):
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "emptyinterest@example.com",
        "password": "password123",
        "full_name": "Test User"
    })
    token = reg_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/v1/assessment", json={"career_interests": "   "}, headers=headers)
    assert res.status_code == 400
    assert "Career interest is required" in res.get_json()["message"]

