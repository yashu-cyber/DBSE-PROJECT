from flask import Flask, request, jsonify
import os
from flask_cors import CORS
import requests
from auth.jwt_required import token_required, admin_required

app = Flask(__name__)
CORS(app)


AUTH_SERVICE = os.getenv("AUTH_SERVICE", "http://127.0.0.1:5001")
INVENTORY_SERVICE = os.getenv("INVENTORY_SERVICE", "http://127.0.0.1:5002")
ADMIN_SERVICE = os.getenv("ADMIN_SERVICE", "http://127.0.0.1:5003")


def forward_request(base_url, path):
    try:
        url = f"{base_url}{path}"

        response = requests.request(
            method=request.method,
            url=url,
            headers={
                "Authorization": request.headers.get("Authorization", "")
            },
            json=request.get_json(silent=True)
        )

        return (
            response.content,
            response.status_code,
            {
                "Content-Type": response.headers.get(
                    "Content-Type",
                    "application/json"
                )
            }
        )

    except requests.RequestException as e:
        return jsonify({
            "success": False,
            "message": "Service unavailable",
            "error": str(e)
        }), 503


@app.route("/")
def home():
    return {
        "success": True,
        "message": "WarehouseIQ API Gateway is running"
    }


@app.route("/api/login", methods=["POST"])
def login():
    return forward_request(AUTH_SERVICE, "/login")


@app.route("/api/products", methods=["GET"])
@token_required
def products():
    return forward_request(INVENTORY_SERVICE, "/products")


@app.route("/api/inventory", methods=["GET"])
@token_required
def inventory():
    return forward_request(INVENTORY_SERVICE, "/inventory")


@app.route("/api/warehouses", methods=["GET"])
@token_required
def warehouses():
    return forward_request(INVENTORY_SERVICE, "/warehouses")


@app.route("/api/stock-in", methods=["POST"])
@token_required
def stock_in():
    return forward_request(INVENTORY_SERVICE, "/stock-in")


@app.route("/api/stock-out", methods=["POST"])
@token_required
def stock_out():
    return forward_request(INVENTORY_SERVICE, "/stock-out")


@app.route("/api/movements", methods=["GET"])
@token_required
def movements():
    return forward_request(INVENTORY_SERVICE, "/movements")


@app.route("/api/low-stock", methods=["GET"])
@token_required
def low_stock():
    return forward_request(INVENTORY_SERVICE, "/low-stock")


@app.route("/api/warehouse-values", methods=["GET"])
@token_required
def warehouse_values():
    return forward_request(INVENTORY_SERVICE, "/warehouse-values")


@app.route("/api/suppliers", methods=["GET"])
@admin_required
def suppliers():
    return forward_request(ADMIN_SERVICE, "/suppliers")


@app.route("/api/admin/warehouses", methods=["GET"])
@admin_required
def admin_warehouses():
    return forward_request(ADMIN_SERVICE, "/warehouses")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
