from flask import Flask, jsonify
import os
from flask_cors import CORS
import mysql.connector

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
        "message": "WarehouseIQ Admin Service is running"
    }


@app.route("/suppliers", methods=["GET"])
def suppliers():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                supplier_id,
                supplier_name,
                contact_person,
                phone,
                email,
                address,
                lead_time_days,
                last_contact_date
            FROM suppliers
            ORDER BY supplier_id
        """)

        data = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "suppliers": data
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@app.route("/warehouses", methods=["GET"])
def warehouses():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                warehouse_id,
                warehouse_name,
                location,
                bin_code,
                capacity
            FROM warehouses
            ORDER BY warehouse_id
        """)

        data = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "warehouses": data
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003)
