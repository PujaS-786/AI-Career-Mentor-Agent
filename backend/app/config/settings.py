import os
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
