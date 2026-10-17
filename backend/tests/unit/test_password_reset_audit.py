"""
Password Reset Security & Account Enumeration Audit Tests
"""
import pytest
import os
from unittest.mock import patch
from app.models import User, PasswordResetToken
from app.database import db

def test_password_reset_flow_and_security(client):
    # 1. Register a user
    client.post("/api/v1/auth/register", json={
        "email": "reset_user@test.com",
        "password": "OldPassword123!",
        "full_name": "Reset Test User"
    })

    # 2. When SMTP credentials are missing, expect clear error message
    with patch.dict(os.environ, {"MAIL_SERVER": "", "MAIL_USERNAME": "", "MAIL_PASSWORD": ""}):
        res_missing = client.post("/api/v1/auth/forgot-password", json={"email": "reset_user@test.com"})
        assert res_missing.status_code == 400
        assert "SMTP configuration missing" in res_missing.get_json()["message"]

    # 3. When SMTP is configured:
    with patch.dict(os.environ, {
        "MAIL_SERVER": "smtp.example.com",
        "MAIL_USERNAME": "test@example.com",
        "MAIL_PASSWORD": "password"
    }), patch("smtplib.SMTP") as mock_smtp:
        mock_instance = mock_smtp.return_value
        mock_instance.sendmail.return_value = {}

        # 3a. Request reset for existing user
        res_exist = client.post("/api/v1/auth/forgot-password", json={"email": "reset_user@test.com"})
        assert res_exist.status_code == 200
        assert "If an account exists" in res_exist.get_json()["message"]

        # 3b. Request reset for non-existent user (Account Enumeration Prevention)
        res_nonexist = client.post("/api/v1/auth/forgot-password", json={"email": "nobody@test.com"})
        assert res_nonexist.status_code == 200
        # Responses MUST be identical so an attacker cannot enumerate accounts
        assert res_nonexist.get_json()["message"] == res_exist.get_json()["message"]

        # 4. Verify token creation in database
        u = User.query.filter_by(email="reset_user@test.com").first()
        token_entry = PasswordResetToken.query.filter_by(user_id=u.id, is_used=False).first()
        assert token_entry is not None
        assert token_entry.is_valid() is True
        token = token_entry.token

        # 5. Reset Password using token
        res_reset = client.post("/api/v1/auth/reset-password", json={
            "token": token,
            "new_password": "NewPassword456!"
        })
        assert res_reset.status_code == 200
        assert res_reset.get_json()["status"] == "success"

        # 6. Verify single-use: token CANNOT be reused
        res_reuse = client.post("/api/v1/auth/reset-password", json={
            "token": token,
            "new_password": "AnotherPassword789!"
        })
        assert res_reuse.status_code == 400
        assert "Invalid or expired" in res_reuse.get_json()["message"]

        # 7. Login with old password must fail
        old_login = client.post("/api/v1/auth/login", json={
            "email": "reset_user@test.com",
            "password": "OldPassword123!"
        })
        assert old_login.status_code == 401

        # 8. Login with new password must succeed
        new_login = client.post("/api/v1/auth/login", json={
            "email": "reset_user@test.com",
            "password": "NewPassword456!"
        })
        assert new_login.status_code == 200
        assert "token" in new_login.get_json()
