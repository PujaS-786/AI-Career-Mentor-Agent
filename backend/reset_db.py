"""
Reset Development Database Script for AI Career Mentor Agent.
Wipes all existing user records and tables to ensure a clean, empty-by-default environment for testing.

Usage:
    python reset_db.py
"""
import os
import sys

# Ensure backend root is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.database import db

def reset_database():
    app = create_app("development")
    with app.app_context():
        print("Dropping all existing database tables...")
        db.drop_all()
        print("Creating clean database tables...")
        db.create_all()
        print("Database reset successfully! The database is now completely empty and ready for fresh user registration.")

if __name__ == "__main__":
    reset_database()
