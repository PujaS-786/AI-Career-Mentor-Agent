"""
Comprehensive Audit & Test Suite for Mock Interview Feature
"""
import pytest
from app.models import MockInterview, InterviewQuestion, InterviewAnswer, User
from app.database import db

def test_mock_interview_complete_audit(client):
    # 1. Register User A
    res_a = client.post("/api/v1/auth/register", json={
        "email": "student_a@test.com",
        "password": "Password123!",
        "full_name": "Student A",
        "target_role": "Software Developer"
    })
    token_a = res_a.get_json()["token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register User B (for user isolation testing)
    res_b = client.post("/api/v1/auth/register", json={
        "email": "student_b@test.com",
        "password": "Password123!",
        "full_name": "Student B",
        "target_role": "Data Analyst"
    })
    token_b = res_b.get_json()["token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Start Technical Interview for User A
    start_res = client.post("/api/v1/interview/start", json={
        "mode": "Technical",
        "target_role": "Software Developer"
    }, headers=headers_a)
    assert start_res.status_code == 201
    start_data = start_res.get_json()
    assert start_data["status"] == "success"
    interview_id = start_data["interview_id"]
    first_q = start_data["current_question"]
    assert first_q is not None
    assert "Tell me about yourself" in first_q["question_text"]
    assert start_data["total_questions"] >= 5

    # 4. Submit Answer to Question 1
    ans_res = client.post(f"/api/v1/interview/{interview_id}/answer", json={
        "question_id": first_q["id"],
        "answer": "I have experience building fullstack web applications using React and Python Flask with SQLite backend. I implemented state management and REST APIs.",
        "speech_transcript": ""
    }, headers=headers_a)
    assert ans_res.status_code == 200
    ans_data = ans_res.get_json()
    assert ans_data["status"] == "success"
    assert "evaluation" in ans_data
    assert ans_data["evaluation"]["evaluation_score"] >= 70
    assert len(ans_data["evaluation"]["evaluation_feedback"]) > 10

    # 5. Cross-User Isolation Test: User B cannot access User A's interview
    isolated_res = client.get(f"/api/v1/interview/{interview_id}/results", headers=headers_b)
    assert isolated_res.status_code == 404
    isolated_ans = client.post(f"/api/v1/interview/{interview_id}/answer", json={
        "question_id": first_q["id"],
        "answer": "Hacked answer"
    }, headers=headers_b)
    assert isolated_ans.status_code == 404

    # 6. Complete Interview
    comp_res = client.post(f"/api/v1/interview/{interview_id}/complete", json={
        "presentation_cues": {"camera_engagement": "Good"}
    }, headers=headers_a)
    assert comp_res.status_code == 200
    comp_data = comp_res.get_json()
    assert comp_data["status"] == "success"
    rep = comp_data["report"]
    assert rep["overall_score"] > 0
    assert rep["tech_score"] > 0
    assert rep["presentation_score"] >= 80
    assert len(rep["strong_areas"]) > 0
    assert len(rep["recommendations"]) > 0

    # 7. Interview History Endpoint
    hist_res = client.get("/api/v1/interview/history", headers=headers_a)
    assert hist_res.status_code == 200
    hist_data = hist_res.get_json()
    assert len(hist_data["interviews"]) >= 1
    assert hist_data["interviews"][0]["id"] == interview_id

    # User B's history should be empty
    hist_b_res = client.get("/api/v1/interview/history", headers=headers_b)
    assert hist_b_res.status_code == 200
    assert len(hist_b_res.get_json()["interviews"]) == 0

    # 8. Dashboard Progress reflects interview score
    prog_res = client.get("/api/v1/progress", headers=headers_a)
    assert prog_res.status_code == 200
    assert prog_res.get_json()["progress"]["avg_interview_score"] == rep["overall_score"]
