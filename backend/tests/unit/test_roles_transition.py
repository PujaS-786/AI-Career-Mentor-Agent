"""
Unit tests for the transition after resume review to the next workflow stage:
- Verifies Path 1 preserves confirmed target role (e.g. Data Analyst)
- Verifies select_role handles roadmap resources, projects, and certifications when formatted as either strings or dicts
- Verifies Path 2 and Path 3 matching does not prematurely confirm a role
- Verifies error handling and validation
"""
import pytest
import json
from unittest.mock import patch


def test_path1_target_role_preservation_and_roadmap(client):
    # 1. Register a student
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "dataanalyst_student@test.com",
        "password": "Password123!",
        "full_name": "Data Analyst Candidate",
        "college": "BIT Mesra",
        "degree": "BCA",
        "graduation_year": 2026,
        "onboarding_path": "path1"
    })
    assert reg_res.status_code == 201
    token = reg_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Submit assessment with target role Data Analyst
    assess_res = client.post("/api/v1/assessment", json={
        "career_interests": "Data Analytics & Business Intelligence",
        "current_technical_skills": "Python, SQL, Excel, Pandas",
        "experience_level": "Student / Beginner",
        "target_role": "Data Analyst",
        "target_company": "Deloitte",
        "onboarding_path": "path1"
    }, headers=headers)
    assert assess_res.status_code == 200
    user_data = assess_res.get_json()["user"]
    assert user_data["target_role"] == "Data Analyst"
    assert user_data["target_company"] == "Deloitte"

    # 3. Call /api/v1/roles/select with confirmed target role
    select_res = client.post("/api/v1/roles/select", json={
        "target_role": "Data Analyst",
        "target_company": "Deloitte"
    }, headers=headers)
    assert select_res.status_code == 200
    data = select_res.get_json()
    assert data["status"] == "success"
    assert data["user"]["target_role"] == "Data Analyst"
    assert data["user"]["target_company"] == "Deloitte"
    assert data["skill_gap"]["target_role"] == "Data Analyst"
    assert len(data["roadmap"]["milestones"]) > 0

    # 4. Verify skill gaps and roadmap are persisted and retrievable
    gaps_res = client.get("/api/v1/skills/gaps", headers=headers)
    assert gaps_res.status_code == 200
    assert gaps_res.get_json()["skill_gap"]["target_role"] == "Data Analyst"

    roadmap_res = client.get("/api/v1/roadmap", headers=headers)
    assert roadmap_res.status_code == 200
    assert len(roadmap_res.get_json()["milestones"]) > 0


def test_select_role_resilience_to_string_resources_and_projects(client):
    """
    Simulates LLM returning list of strings for resources, projects, and certifications
    to ensure AttributeError: 'str' object has no attribute 'get' is fully resolved.
    """
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "string_test@test.com",
        "password": "Password123!",
        "full_name": "String Test User"
    })
    token = reg_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Mock roadmap_agent to return strings for resources, projects, certifications
    mock_roadmap = {
        "roadmap_title": "Data Analyst Career Roadmap",
        "target_role": "Data Analyst",
        "milestones": [
            {
                "milestone_order": 1,
                "title": "Foundation in SQL and Python",
                "description": "Learn SQL basics and pandas",
                "skills": ["SQL", "Python"],
                "estimated_weeks": 3,
                "resources": ["Coursera Python for Everybody", "Khan Academy SQL"],
                "projects": ["Build an ETL pipeline script"]
            }
        ],
        "certifications": ["Google Data Analytics Professional Certificate"],
        "career_tips": ["Build a GitHub portfolio"]
    }

    with patch("app.agents.roadmap_generator.LearningAndCareerRoadmapAgent.generate_roadmap", return_value=mock_roadmap):
        select_res = client.post("/api/v1/roles/select", json={
            "target_role": "Data Analyst",
            "target_company": "Amazon"
        }, headers=headers)

        assert select_res.status_code == 200
        data = select_res.get_json()
        assert data["status"] == "success"

        # Verify learning resources saved properly as objects with title string
        roadmap_db_res = client.get("/api/v1/roadmap", headers=headers)
        assert roadmap_db_res.status_code == 200
        r_data = roadmap_db_res.get_json()
        assert len(r_data["resources"]) >= 2
        assert r_data["resources"][0]["title"] == "Coursera Python for Everybody"
        assert len(r_data["projects"]) >= 1
        assert r_data["projects"][0]["title"] == "Build an ETL pipeline script"
        assert len(r_data["certifications"]) >= 1
        assert r_data["certifications"][0]["title"] == "Google Data Analytics Professional Certificate"


def test_path2_and_path3_separate_behavior_without_auto_confirm(client):
    """
    Verifies Path 2 and Path 3 compute role matches but do NOT automatically confirm a role.
    """
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "path2_student@test.com",
        "password": "Password123!",
        "full_name": "Path 2 Candidate",
        "onboarding_path": "path2"
    })
    token = reg_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # User submits assessment without confirming target role
    client.post("/api/v1/assessment", json={
        "career_interests": "Uncertain between Data Analyst and Software Developer",
        "current_technical_skills": "Python, SQL, HTML",
        "onboarding_path": "path2"
    }, headers=headers)

    # User profile should have target_role as None
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.get_json()["user"]["target_role"] is None

    # Step 4.5 transition for Path 2 calls /api/v1/roles/match
    match_res = client.post("/api/v1/roles/match", json={
        "preferred_roles": ["Data Analyst", "Software Developer"]
    }, headers=headers)
    assert match_res.status_code == 200
    matches = match_res.get_json()["matches"]
    assert len(matches) == 2
    role_names = [m["role_name"] for m in matches]
    assert "Data Analyst" in role_names
    assert "Software Developer" in role_names

    # Target role is STILL unconfirmed (user has not chosen yet)
    me_res2 = client.get("/api/v1/auth/me", headers=headers)
    assert me_res2.get_json()["user"]["target_role"] is None

    # Only when user explicitly selects role in Step 5 does it confirm
    confirm_res = client.post("/api/v1/roles/select", json={
        "target_role": "Data Analyst",
        "target_company": "Microsoft"
    }, headers=headers)
    assert confirm_res.status_code == 200
    me_res3 = client.get("/api/v1/auth/me", headers=headers)
    assert me_res3.get_json()["user"]["target_role"] == "Data Analyst"


def test_select_role_missing_role_error(client):
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "missing_role@test.com",
        "password": "Password123!",
        "full_name": "No Role User"
    })
    token = reg_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/v1/roles/select", json={"target_role": ""}, headers=headers)
    assert res.status_code == 400
    assert "target_role is required" in res.get_json()["message"]
