"""
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
