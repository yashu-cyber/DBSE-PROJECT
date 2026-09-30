from flask import Flask, request, jsonify
import os
from flask_cors import CORS
import mysql.connector
from auth.jwt_utils import create_token

app = Flask(__name__)
CORS(app)


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "yashas0620"),
        database=os.getenv("DB_NAME", "warehouseiq_final")
    )


@app.route("/")
def home():
    return {
        "success": True,
        "message": "WarehouseIQ Auth Service is running"
    }


@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}

        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            return jsonify({
                "success": False,
                "message": "Username and password are required"
            }), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT user_id, full_name, username, role
            FROM users
            WHERE username = %s AND password = %s
            """,
            (username, password)
        )

        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if not user:
            return jsonify({
                "success": False,
                "message": "Invalid username or password"
            }), 401

        token = create_token(
            user["user_id"],
            user["username"],
            user["role"]
        )

        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": user,
            "token": token
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Login failed",
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
