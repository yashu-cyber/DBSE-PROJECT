from functools import wraps

from flask import request, jsonify, g

from auth.jwt_utils import decode_token


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({
                "success": False,
                "message": "Authorization token is required"
            }), 401

        token = auth_header.split(" ", 1)[1].strip()

        if not token:
            return jsonify({
                "success": False,
                "message": "Authorization token is required"
            }), 401

        try:
            payload = decode_token(token)
            g.current_user = payload
        except Exception:
            return jsonify({
                "success": False,
                "message": "Invalid or expired token"
            }), 401

        return f(*args, **kwargs)

    return decorated
