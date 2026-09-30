import os
from flask import Flask, request, jsonify
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
        "message": "WarehouseIQ Inventory Service is running"
    }


@app.route("/products", methods=["GET"])
def products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
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
        """)

        data = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "products": data
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@app.route("/inventory", methods=["GET"])
def inventory():
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
                i.bin_location,
                i.available_stock,
                i.reserved_stock,
                i.last_updated
            FROM inventory i
            JOIN products p
                ON i.product_id = p.product_id
            JOIN warehouses w
                ON i.warehouse_id = w.warehouse_id
            ORDER BY i.inventory_id
        """)

        data = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "inventory": data
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


@app.route("/movements", methods=["GET"])
def movements():
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
            JOIN products p
                ON sm.product_id = p.product_id
            JOIN warehouses w
                ON sm.warehouse_id = w.warehouse_id
            JOIN users u
                ON sm.user_id = u.user_id
            ORDER BY sm.movement_date DESC
        """)

        data = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "movements": data
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@app.route("/low-stock", methods=["GET"])
def low_stock():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                i.inventory_id,
                i.product_id,
                p.product_name,
                p.sku,
                i.warehouse_id,
                w.warehouse_name,
                i.available_stock,
                p.minimum_stock
            FROM inventory i
            JOIN products p
                ON i.product_id = p.product_id
            JOIN warehouses w
                ON i.warehouse_id = w.warehouse_id
            WHERE i.available_stock <= p.minimum_stock
            ORDER BY i.available_stock ASC
        """)

        data = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "low_stock": data
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@app.route("/warehouse-values", methods=["GET"])
def warehouse_values():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                w.warehouse_id,
                w.warehouse_name,
                COALESCE(
                    SUM(
                        (i.available_stock + i.reserved_stock) * p.price
                    ),
                    0
                ) AS total_value,
                COALESCE(
                    SUM(i.available_stock + i.reserved_stock),
                    0
                ) AS total_stock,
                COUNT(DISTINCT i.product_id) AS product_count
            FROM warehouses w
            LEFT JOIN inventory i
                ON w.warehouse_id = i.warehouse_id
            LEFT JOIN products p
                ON i.product_id = p.product_id
            GROUP BY w.warehouse_id, w.warehouse_name
            ORDER BY w.warehouse_id
        """)

        data = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "warehouse_values": data
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@app.route("/stock-in", methods=["POST"])
def stock_in():
    conn = None
    cursor = None

    try:
        data = request.get_json() or {}

        product_id = int(data.get("product_id"))
        warehouse_id = int(data.get("warehouse_id"))
        quantity = int(data.get("quantity"))
        user_id = int(data.get("user_id"))
        reference_number = data.get("reference_number", "").strip()
        reason = data.get("reason", "").strip()

        if quantity <= 0:
            return jsonify({
                "success": False,
                "message": "Quantity must be greater than zero"
            }), 400

        if not reference_number:
            return jsonify({
                "success": False,
                "message": "Reference number is required"
            }), 400

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

        return jsonify({
            "success": True,
            "message": "Stock added successfully"
        })

    except Exception as e:
        if conn:
            conn.rollback()

        return jsonify({
            "success": False,
            "message": "Stock-in failed",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


@app.route("/stock-out", methods=["POST"])
def stock_out():
    conn = None
    cursor = None

    try:
        data = request.get_json() or {}

        product_id = int(data.get("product_id"))
        warehouse_id = int(data.get("warehouse_id"))
        quantity = int(data.get("quantity"))
        user_id = int(data.get("user_id"))
        reference_number = data.get("reference_number", "").strip()
        reason = data.get("reason", "").strip()

        if quantity <= 0:
            return jsonify({
                "success": False,
                "message": "Quantity must be greater than zero"
            }), 400

        if not reference_number:
            return jsonify({
                "success": False,
                "message": "Reference number is required"
            }), 400

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
            return jsonify({
                "success": False,
                "message": "No inventory record exists for this product and warehouse"
            }), 404

        if inventory["available_stock"] < quantity:
            conn.rollback()
            return jsonify({
                "success": False,
                "message": f"Insufficient stock. Available: {inventory['available_stock']}"
            }), 400

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

        return jsonify({
            "success": True,
            "message": "Stock removed successfully"
        })

    except Exception as e:
        if conn:
            conn.rollback()

        return jsonify({
            "success": False,
            "message": "Stock-out failed",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)
