from flask import Flask, request, jsonify
from flask_cors import CORS
from auth.jwt_utils import create_token
from auth.jwt_required import token_required
import mysql.connector

app = Flask(__name__)
CORS(app)


def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="yashas0620",
        database="warehouseiq_final"
    )


@app.route("/")
def home():
    return {
        "success": True,
        "message": "WarehouseIQ API is running"
    }


# ---------------- LOGIN ----------------

@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            return {
                "success": False,
                "message": "Username and password are required"
            }, 400

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
            return {
                "success": False,
                "message": "Invalid username or password"
            }, 401

        token = create_token(
            user["user_id"],
            user["username"],
            user["role"]
        )

        return {
            "success": True,
            "message": "Login successful",
            "user": user,
            "token": token
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Login failed",
            "error": str(e)
        }, 500


# ---------------- DATABASE TEST ----------------

@app.route("/api/test-db")
@token_required
def test_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM products")
        product_count = cursor.fetchone()[0]

        cursor.close()
        conn.close()

        return {
            "success": True,
            "message": "MySQL connection successful",
            "product_count": product_count
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }, 500


# ---------------- PRODUCTS ----------------

@app.route("/api/products", methods=["GET"])
def get_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                p.product_id,
                p.product_name,
                p.sku,
                p.category,
                p.description,
                p.price,
                p.minimum_stock,
                p.supplier_id,
                s.supplier_name
            FROM products p
            JOIN suppliers s
                ON p.supplier_id = s.supplier_id
            ORDER BY p.product_id
            """
        )

        products = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "count": len(products),
            "products": products
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to fetch products",
            "error": str(e)
        }, 500


@app.route("/api/inventory", methods=["GET"])
def get_inventory():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                i.inventory_id,
                i.product_id,
                p.product_name,
                p.sku,
                p.category,
                i.warehouse_id,
                w.warehouse_name,
                w.location,
                i.bin_location,
                i.available_stock,
                i.reserved_stock,
                (i.available_stock + i.reserved_stock) AS total_stock,
                i.last_updated
            FROM inventory i
            JOIN products p
                ON i.product_id = p.product_id
            JOIN warehouses w
                ON i.warehouse_id = w.warehouse_id
            ORDER BY i.inventory_id
        """)

        inventory = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "count": len(inventory),
            "inventory": inventory
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to fetch inventory",
            "error": str(e)
        }, 500

if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )

@app.route("/api/stock-in", methods=["POST"])
def stock_in():
    conn = None
    cursor = None

    try:
        data = request.get_json()

        product_id = int(data.get("product_id"))
        warehouse_id = int(data.get("warehouse_id"))
        quantity = int(data.get("quantity"))
        user_id = int(data.get("user_id"))
        reference_number = data.get("reference_number", "").strip()
        reason = data.get("reason", "").strip()

        if quantity <= 0:
            return {
                "success": False,
                "message": "Quantity must be greater than zero"
            }, 400

        if not reference_number:
            return {
                "success": False,
                "message": "Reference number is required"
            }, 400

        conn = get_db_connection()
        conn.start_transaction()

        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT inventory_id
            FROM inventory
            WHERE product_id = %s AND warehouse_id = %s
            FOR UPDATE
        """, (product_id, warehouse_id))

        inventory = cursor.fetchone()

        if inventory:
            cursor.execute("""
                UPDATE inventory
                SET available_stock = available_stock + %s
                WHERE inventory_id = %s
            """, (quantity, inventory["inventory_id"]))
        else:
            cursor.execute("""
                INSERT INTO inventory
                (
                    product_id,
                    warehouse_id,
                    bin_location,
                    available_stock,
                    reserved_stock
                )
                VALUES (%s, %s, 'UNASSIGNED', %s, 0)
            """, (product_id, warehouse_id, quantity))

        cursor.execute("""
            INSERT INTO stock_movements
            (
                product_id,
                warehouse_id,
                user_id,
                movement_type,
                quantity,
                reference_number,
                reason,
                status
            )
            VALUES (%s, %s, %s, 'IN', %s, %s, %s, 'Completed')
        """, (
            product_id,
            warehouse_id,
            user_id,
            quantity,
            reference_number,
            reason
        ))

        conn.commit()

        return {
            "success": True,
            "message": "Stock added successfully"
        }

    except Exception as e:
        if conn:
            conn.rollback()

        return {
            "success": False,
            "message": "Stock-in failed",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()

@app.route("/api/warehouses", methods=["GET"])
def get_warehouses():
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

        warehouses = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "count": len(warehouses),
            "warehouses": warehouses
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Failed to fetch warehouses",
            "error": str(e)
        }, 500

@app.route("/api/stock-out", methods=["POST"])
def stock_out():
    conn = None
    cursor = None

    try:
        data = request.get_json()

        product_id = int(data.get("product_id"))
        warehouse_id = int(data.get("warehouse_id"))
        quantity = int(data.get("quantity"))
        user_id = int(data.get("user_id"))
        reference_number = data.get("reference_number", "").strip()
        reason = data.get("reason", "").strip()

        if quantity <= 0:
            return {
                "success": False,
                "message": "Quantity must be greater than zero"
            }, 400

        if not reference_number:
            return {
                "success": False,
                "message": "Reference number is required"
            }, 400

        conn = get_db_connection()
        conn.start_transaction()

        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT inventory_id, available_stock
            FROM inventory
            WHERE product_id = %s AND warehouse_id = %s
            FOR UPDATE
        """, (product_id, warehouse_id))

        inventory = cursor.fetchone()

        if not inventory:
            conn.rollback()
            return {
                "success": False,
                "message": "No inventory record exists for this product and warehouse"
            }, 404

        if inventory["available_stock"] < quantity:
            conn.rollback()
            return {
                "success": False,
                "message": f"Insufficient stock. Available: {inventory['available_stock']}"
            }, 400

        cursor.execute("""
            UPDATE inventory
            SET available_stock = available_stock - %s
            WHERE inventory_id = %s
        """, (quantity, inventory["inventory_id"]))

        cursor.execute("""
            INSERT INTO stock_movements
            (
                product_id,
                warehouse_id,
                user_id,
                movement_type,
                quantity,
                reference_number,
                reason,
                status
            )
            VALUES (%s, %s, %s, 'OUT', %s, %s, %s, 'Completed')
        """, (
            product_id,
            warehouse_id,
            user_id,
            quantity,
            reference_number,
            reason
        ))

        conn.commit()

        return {
            "success": True,
            "message": "Stock removed successfully"
        }

    except Exception as e:
        if conn:
            conn.rollback()

        return {
            "success": False,
            "message": "Stock-out failed",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()

@app.route("/api/movements", methods=["GET"])
def get_movements():
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                sm.movement_id,
                sm.product_id,
                p.product_name,
                p.sku,
                sm.warehouse_id,
                w.warehouse_name,
                sm.user_id,
                u.full_name,
                sm.movement_type,
                sm.quantity,
                sm.reference_number,
                sm.reason,
                sm.status,
                sm.movement_date
            FROM stock_movements sm
            JOIN products p ON sm.product_id = p.product_id
            JOIN warehouses w ON sm.warehouse_id = w.warehouse_id
            JOIN users u ON sm.user_id = u.user_id
            ORDER BY sm.movement_date DESC, sm.movement_id DESC
        """)

        movements = cursor.fetchall()

        return {
            "success": True,
            "count": len(movements),
            "movements": movements
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Could not load stock movements.",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


@app.route("/api/warehouse-values", methods=["GET"])
def get_warehouse_values():
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                w.warehouse_id,
                w.warehouse_name,
                w.location,
                w.bin_code,
                w.capacity,
                COALESCE(SUM(i.available_stock + i.reserved_stock), 0) AS total_stock,
                COALESCE(SUM(
                    (i.available_stock + i.reserved_stock) * p.price
                ), 0) AS inventory_value,
                COUNT(DISTINCT i.product_id) AS product_count
            FROM warehouses w
            LEFT JOIN inventory i
                ON w.warehouse_id = i.warehouse_id
            LEFT JOIN products p
                ON i.product_id = p.product_id
            GROUP BY
                w.warehouse_id,
                w.warehouse_name,
                w.location,
                w.bin_code,
                w.capacity
            ORDER BY w.warehouse_id
        """)

        warehouses = cursor.fetchall()

        for warehouse in warehouses:
            warehouse["inventory_value"] = float(
                warehouse["inventory_value"] or 0
            )
            warehouse["total_stock"] = int(
                warehouse["total_stock"] or 0
            )
            warehouse["product_count"] = int(
                warehouse["product_count"] or 0
            )

        return jsonify({
            "success": True,
            "count": len(warehouses),
            "warehouses": warehouses
        })

    except Exception as e:
        print("WAREHOUSE VALUES ERROR:", e)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/api/suppliers", methods=["GET"])
def get_suppliers():
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                s.supplier_id,
                s.supplier_name,
                s.contact_person,
                s.phone,
                s.email,
                s.address,
                s.lead_time_days,
                s.last_contact_date,
                COUNT(p.product_id) AS product_count
            FROM suppliers s
            LEFT JOIN products p
                ON s.supplier_id = p.supplier_id
            GROUP BY
                s.supplier_id,
                s.supplier_name,
                s.contact_person,
                s.phone,
                s.email,
                s.address,
                s.lead_time_days,
                s.last_contact_date
            ORDER BY s.supplier_id
        """)

        suppliers = cursor.fetchall()

        return {
            "success": True,
            "count": len(suppliers),
            "suppliers": suppliers
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Could not load suppliers.",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()
