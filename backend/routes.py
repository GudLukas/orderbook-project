from flask import Blueprint, Flask, Response, jsonify, request, current_app
from db_pool import get_db_connection
import mysql.connector
import logging
import bcrypt
import os
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_DOWN

# Import helper functions
from helpers import (
    get_base_asset,
    get_user_id_int,
    get_user_balance,
    update_balance,
    reserve_balance_for_order,
    release_balance_for_order,
    process_trade_settlement,
    match_orders,
)

bp = Blueprint("bp", __name__)


# get all orders
@bp.route("/orders", methods=["GET"])
@jwt_required()
def get_orders():
    try:
        current_user_id = get_user_id_int()

        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT id, user_id, symbol, side, price, quantity, status, 
                       filled_quantity, created_at, updated_at,
                       CASE WHEN user_id = %s THEN true ELSE false END as is_own_order
                FROM orders 
                WHERE status IN ('PENDING', 'PARTIAL')
                ORDER BY 
                    symbol ASC,
                    CASE WHEN side = 'BUY' THEN price END DESC,
                    CASE WHEN side = 'SELL' THEN price END ASC,
                    created_at ASC
            """,
                (current_user_id,),
            )
            orders = cursor.fetchall()
            cursor.close()

            return jsonify(orders)

    except mysql.connector.Error as err:
        logging.error(f"Error fetching orders: {err}")
        return Response(status=500)


# Add this new route for getting user's orders
@bp.route("/user/orders", methods=["GET"])
@jwt_required()
def get_user_orders():
    try:
        user_id = get_user_id_int()

        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT id, symbol, side, price, quantity, status, 
                       filled_quantity, created_at, updated_at
                FROM orders 
                WHERE user_id = %s 
                ORDER BY created_at DESC
            """,
                (user_id,),
            )
            orders = cursor.fetchall()
            cursor.close()

            return jsonify({"success": True, "orders": orders})

    except mysql.connector.Error as err:
        logging.error(f"Error fetching user orders: {err}")
        return jsonify({"error": "Database error"}), 500


# create a new order
@bp.route("/orders", methods=["POST"])
@jwt_required()
def create_order():
    try:
        user_id = get_user_id_int()

        # Validate required fields
        required_fields = ["symbol", "side", "quantity"]
        for field in required_fields:
            if field not in request.json:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Get and validate data
        symbol = request.json["symbol"]
        side = request.json["side"].upper()
        quantity = float(request.json["quantity"])
        price = float(request.json.get("price", 0))
        order_type = request.json.get("order_type", "LIMIT")

        # Validate values
        if quantity <= 0:
            return jsonify({"error": "Quantity must be greater than 0"}), 400
        if order_type != "MARKET" and price <= 0:
            return (
                jsonify(
                    {"error": "Price must be greater than 0 for non-market orders"}
                ),
                400,
            )
        if side not in ["BUY", "SELL"]:
            return jsonify({"error": "Side must be either 'BUY' or 'SELL'"}), 400

        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)

            # Reserve balance for the order
            try:
                reserve_balance_for_order(
                    cursor, user_id, side, symbol, quantity, price
                )
            except ValueError as e:
                cursor.close()
                return jsonify({"error": str(e)}), 400

            # Insert order
            cursor.execute(
                """
                INSERT INTO orders (
                    user_id, symbol, side, price, quantity, 
                    status, filled_quantity, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, 'PENDING', 0.0, NOW(), NOW())
            """,
                (user_id, symbol, side, price, quantity),
            )

            db.commit()
            order_id = cursor.lastrowid

            # Attempt to match the new order
            try:
                match_orders(cursor, order_id, db)
                db.commit()
                logging.info(f"Order matching completed for order {order_id}")
            except Exception as match_error:
                logging.error(f"Error during order matching: {match_error}")
                db.rollback()
                db.commit()

            cursor.close()

            return (
                jsonify(
                    {
                        "success": True,
                        "message": "Order created successfully",
                        "order": {
                            "id": order_id,
                            "user_id": user_id,
                            "symbol": symbol,
                            "side": side,
                            "price": price,
                            "quantity": quantity,
                            "status": "PENDING",
                            "filled_quantity": 0.0,
                        },
                    }
                ),
                201,
            )

    except ValueError as e:
        return jsonify({"error": "Invalid numeric value provided"}), 400
    except mysql.connector.Error as err:
        logging.error(f"Error creating order: {err}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return jsonify({"error": "Internal server error"}), 500


# delete an existing order
@bp.route("/orders/<int:order_id>", methods=["DELETE"])
@jwt_required()
def delete_order(order_id):
    try:
        user_id = get_user_id_int()

        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)

            # Get order details
            cursor.execute(
                "SELECT id, user_id, status, symbol, side, quantity, price, filled_quantity FROM orders WHERE id = %s",
                (order_id,),
            )
            order = cursor.fetchone()

            if not order:
                cursor.close()
                return jsonify({"error": "Order not found"}), 404

            if order["user_id"] != user_id:
                cursor.close()
                return jsonify({"error": "You can only delete your own orders"}), 403

            if order["status"] not in ["PENDING", "PARTIAL"]:
                cursor.close()
                return (
                    jsonify(
                        {
                            "error": f"Cannot delete order with status '{order['status']}'. Only PENDING and PARTIAL orders can be cancelled."
                        }
                    ),
                    400,
                )

            # Calculate remaining unfilled quantity and release reserved balances
            filled_quantity = float(order.get("filled_quantity", 0))
            remaining_quantity = float(order["quantity"]) - filled_quantity

            if remaining_quantity > 0:
                try:
                    release_balance_for_order(
                        cursor,
                        user_id,
                        order["side"],
                        order["symbol"],
                        remaining_quantity,
                        float(order["price"]),
                    )
                except ValueError as e:
                    cursor.close()
                    return jsonify({"error": str(e)}), 500

            # Mark order as CANCELLED
            cursor.execute(
                "UPDATE orders SET status = 'CANCELLED', updated_at = NOW() WHERE id = %s AND user_id = %s",
                (order_id, user_id),
            )
            db.commit()
            cursor.close()

            return (
                jsonify(
                    {
                        "success": True,
                        "message": "Order cancelled and balances released successfully",
                    }
                ),
                200,
            )

    except mysql.connector.Error as err:
        logging.error(f"Error deleting order: {err}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        logging.error(f"Unexpected error deleting order: {e}")
        return jsonify({"error": "Internal server error"}), 500


# get a specific order by ID
@bp.route("/orders/<int:order_id>", methods=["GET"])
@jwt_required()
def get_order(order_id):
    try:
        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)
            sql = "SELECT * FROM orders WHERE id = %s"
            cursor.execute(sql, (order_id,))
            order = cursor.fetchone()
            cursor.close()

        if order:
            return jsonify(order)
        else:
            return Response(status=404)
    except mysql.connector.Error as err:
        logging.error(f"Error fetching order: {err}")
        return Response(status=500)


# update an existing order
@bp.route("/orders/<int:order_id>", methods=["PUT"])
@jwt_required()
def update_order(order_id):
    try:
        user_id = get_jwt_identity()

        # Validate required fields
        required_fields = ["symbol", "side", "price", "quantity"]
        for field in required_fields:
            if field not in request.json:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Get new order data
        new_symbol = request.json["symbol"]
        new_side = request.json["side"].upper()
        new_price = float(request.json["price"])
        new_quantity = float(request.json["quantity"])

        # Validate new values
        if new_quantity <= 0:
            return jsonify({"error": "Quantity must be greater than 0"}), 400
        if new_price <= 0:
            return jsonify({"error": "Price must be greater than 0"}), 400
        if new_side not in ["BUY", "SELL"]:
            return jsonify({"error": "Side must be either 'BUY' or 'SELL'"}), 400

        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)

            # First check if the order exists and belongs to the user
            check_sql = "SELECT id, user_id, status, symbol, side, price, quantity, filled_quantity FROM orders WHERE id = %s"
            cursor.execute(check_sql, (order_id,))
            order = cursor.fetchone()

            if not order:
                cursor.close()
                return jsonify({"error": "Order not found"}), 404

            # Check if the order belongs to the current user
            if int(order["user_id"]) != int(user_id):
                cursor.close()
                return jsonify({"error": "You can only update your own orders"}), 403

            # Check if order can be updated (only PENDING and PARTIAL orders can be updated)
            if order["status"] not in ["PENDING", "PARTIAL"]:
                cursor.close()
                return (
                    jsonify(
                        {
                            "error": f"Cannot update order with status '{order['status']}'. Only PENDING and PARTIAL orders can be updated."
                        }
                    ),
                    400,
                )

            # Get filled quantity and calculate remaining
            filled_quantity = float(order.get("filled_quantity", 0))
            remaining_quantity = float(order["quantity"]) - filled_quantity

            # For partial orders, new quantity must be at least filled_quantity
            if order["status"] == "PARTIAL" and new_quantity < filled_quantity:
                cursor.close()
                return (
                    jsonify(
                        {
                            "error": f"Cannot reduce quantity below filled amount. Already filled: {filled_quantity}, Minimum new quantity: {filled_quantity}"
                        }
                    ),
                    400,
                )

            # Release old reservations (only for unfilled portion)
            old_side = order["side"]
            old_quantity = float(order["quantity"])
            old_price = float(order["price"])
            old_symbol = order["symbol"]
            old_unfilled_quantity = old_quantity - filled_quantity

            if old_side == "BUY":
                # Release old USD reservation for unfilled portion
                old_unfilled_cost = old_unfilled_quantity * old_price

                cursor.execute(
                    "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = 'USD'",
                    (int(user_id),),
                )
                usd_balance = cursor.fetchone()

                if usd_balance:
                    new_available = float(usd_balance["available"]) + old_unfilled_cost
                    new_reserved = max(
                        0, float(usd_balance["reserved"]) - old_unfilled_cost
                    )

                    cursor.execute(
                        """UPDATE balances 
                           SET available = %s, reserved = %s, updated_at = NOW()
                           WHERE user_id = %s AND asset = 'USD'""",
                        (new_available, new_reserved, int(user_id)),
                    )

            elif old_side == "SELL":
                # Release old asset reservation for unfilled portion
                old_base_asset = old_symbol.replace("USD", "").replace("USDT", "")

                cursor.execute(
                    "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = %s",
                    (int(user_id), old_base_asset),
                )
                asset_balance = cursor.fetchone()

                if asset_balance:
                    new_available = (
                        float(asset_balance["available"]) + old_unfilled_quantity
                    )
                    new_reserved = max(
                        0, float(asset_balance["reserved"]) - old_unfilled_quantity
                    )

                    cursor.execute(
                        """UPDATE balances 
                           SET available = %s, reserved = %s, updated_at = NOW()
                           WHERE user_id = %s AND asset = %s""",
                        (new_available, new_reserved, int(user_id), old_base_asset),
                    )

            # Apply new reservations (only for new unfilled portion)
            new_unfilled_quantity = new_quantity - filled_quantity

            if new_side == "BUY":
                # Reserve new USD amount for unfilled portion
                new_unfilled_cost = new_unfilled_quantity * new_price

                cursor.execute(
                    "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = 'USD'",
                    (int(user_id),),
                )
                usd_balance = cursor.fetchone()

                if not usd_balance:
                    cursor.close()
                    return (
                        jsonify(
                            {"error": "USD balance not found. Please contact support."}
                        ),
                        400,
                    )

                if float(usd_balance["available"]) < new_unfilled_cost:
                    cursor.close()
                    return (
                        jsonify(
                            {
                                "error": f"Insufficient USD balance for updated order. Required for unfilled portion: ${new_unfilled_cost:.2f}, Available: ${float(usd_balance['available']):.2f}"
                            }
                        ),
                        400,
                    )

                new_available = float(usd_balance["available"]) - new_unfilled_cost
                new_reserved = float(usd_balance["reserved"]) + new_unfilled_cost

                cursor.execute(
                    """UPDATE balances 
                       SET available = %s, reserved = %s, updated_at = NOW()
                       WHERE user_id = %s AND asset = 'USD'""",
                    (new_available, new_reserved, int(user_id)),
                )

            elif new_side == "SELL":
                # Reserve new asset amount for unfilled portion
                new_base_asset = new_symbol.replace("USD", "").replace("USDT", "")

                cursor.execute(
                    "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = %s",
                    (int(user_id), new_base_asset),
                )
                asset_balance = cursor.fetchone()

                if not asset_balance:
                    cursor.close()
                    return (
                        jsonify(
                            {
                                "error": f"{new_base_asset} balance not found. Please contact support."
                            }
                        ),
                        400,
                    )

                if float(asset_balance["available"]) < new_unfilled_quantity:
                    cursor.close()
                    return (
                        jsonify(
                            {
                                "error": f"Insufficient {new_base_asset} balance for updated order. Required for unfilled portion: {new_unfilled_quantity}, Available: {float(asset_balance['available'])}"
                            }
                        ),
                        400,
                    )

                new_available = (
                    float(asset_balance["available"]) - new_unfilled_quantity
                )
                new_reserved = float(asset_balance["reserved"]) + new_unfilled_quantity

                cursor.execute(
                    """UPDATE balances 
                       SET available = %s, reserved = %s, updated_at = NOW()
                       WHERE user_id = %s AND asset = %s""",
                    (new_available, new_reserved, int(user_id), new_base_asset),
                )

            # Update the order
            update_sql = """
                UPDATE orders 
                SET symbol = %s, side = %s, price = %s, quantity = %s, updated_at = NOW()
                WHERE id = %s AND user_id = %s
            """
            cursor.execute(
                update_sql,
                (new_symbol, new_side, new_price, new_quantity, order_id, int(user_id)),
            )
            db.commit()

            if cursor.rowcount > 0:
                # Try to match the updated order with existing orders
                try:
                    match_orders(cursor, order_id, db)
                    db.commit()
                    logging.info(f"Order matching completed for updated order {order_id}")
                except Exception as match_error:
                    logging.error(f"Error during order matching for updated order: {match_error}")
                    # Don't fail the update if matching fails, just log it
                    db.rollback()
                    db.commit()
                
                cursor.close()
                return (
                    jsonify(
                        {
                            "success": True,
                            "message": "Order updated successfully with balance adjustments",
                        }
                    ),
                    200,
                )
            else:
                cursor.close()
                return jsonify({"error": "Failed to update order"}), 500

    except ValueError as e:
        return jsonify({"error": "Invalid numeric value provided"}), 400
    except mysql.connector.Error as err:
        logging.error(f"Error updating order: {err}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        logging.error(f"Unexpected error updating order: {e}")
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/login", methods=["POST"])
def login():
    try:
        email = request.json.get("email")
        password = request.json.get("password")

        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            cursor.close()

        # Check password with bcrypt
        if user and bcrypt.checkpw(
            password.encode("utf-8"), user["password"].encode("utf-8")
        ):
            # Create JWT token - Convert user ID to string for Flask-JWT-Extended compatibility
            access_token = create_access_token(identity=str(user["id"]))

            response_data = {
                "success": True,
                "token": access_token,
                "expiresIn": 60 * 60,  # 1 hour in seconds
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "username": user["username"],
                    "created_at": (
                        user["created_at"].isoformat()
                        if user.get("created_at")
                        else None
                    ),
                },
            }

            return jsonify(response_data), 200
        else:
            return jsonify({"message": "Invalid email or password"}), 401

    except mysql.connector.Error as err:
        logging.error(f"Error logging in: {err}")
        return jsonify({"error": "Database error"}), 500


@bp.route("/register", methods=["POST"])
def register():
    try:
        email = request.json.get("email")
        password = request.json.get("password")
        username = request.json.get("username", email)

        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        with get_db_connection() as db:
            cursor = db.cursor()

            # Insert user
            cursor.execute(
                "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                (username, email, hashed_password),
            )
            user_id = cursor.lastrowid

            # Create demo balances for new user
            demo_balances = [
                ("USD", 10000.00, 0.00),  # $10,000 USD
                ("BTC", 0.5, 0.00),  # 0.5 BTC
                ("ETH", 2.0, 0.00),  # 2.0 ETH
                ("ADA", 1000.0, 0.00),  # 1,000 ADA
                ("SOL", 50.0, 0.00),  # 50 SOL
            ]

            for asset, available, reserved in demo_balances:
                cursor.execute(
                    """INSERT INTO balances (user_id, asset, available, reserved, updated_at) 
                       VALUES (%s, %s, %s, %s, NOW())""",
                    (user_id, asset, available, reserved),
                )

            db.commit()
            cursor.close()

            return (
                jsonify({"message": "User registered successfully with demo balances"}),
                201,
            )

    except mysql.connector.Error as err:
        logging.error(f"Error registering user: {err}")
        return jsonify({"error": "Database error"}), 500


# Get user balances
@bp.route("/user/balances", methods=["GET"])
@jwt_required()
def get_user_balances():
    try:
        user_id = get_user_id_int()

        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT asset, available, reserved, updated_at
                FROM balances 
                WHERE user_id = %s 
                ORDER BY asset
            """,
                (user_id,),
            )
            balances = cursor.fetchall()
            cursor.close()

            # Convert to a more convenient format for frontend
            balance_dict = {}
            for balance in balances:
                balance_dict[balance["asset"]] = {
                    "available": float(balance["available"]),
                    "reserved": float(balance["reserved"]),
                    "total": float(balance["available"]) + float(balance["reserved"]),
                    "updated_at": (
                        balance["updated_at"].isoformat()
                        if balance["updated_at"]
                        else None
                    ),
                }

            return jsonify({"success": True, "balances": balance_dict})

    except mysql.connector.Error as err:
        logging.error(f"Error fetching user balances: {err}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        logging.error(f"Unexpected error fetching balances: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Get transaction history
@bp.route("/transactions", methods=["GET"])
@jwt_required()
def get_transactions():
    try:
        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT t.*, 
                       bo.user_id as buyer_id,
                       so.user_id as seller_id
                FROM transactions t
                LEFT JOIN orders bo ON t.buy_order_id = bo.id
                LEFT JOIN orders so ON t.sell_order_id = so.id
                ORDER BY t.executed_at DESC
                LIMIT 100
            """
            )
            transactions = cursor.fetchall()
            cursor.close()

            return jsonify({"success": True, "transactions": transactions})

    except mysql.connector.Error as err:
        logging.error(f"Error fetching transactions: {err}")
        return jsonify({"error": "Database error"}), 500


# Get user's transaction history
@bp.route("/user/transactions", methods=["GET"])
@jwt_required()
def get_user_transactions():
    try:
        user_id = get_user_id_int()

        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT t.*, 
                       bo.user_id as buyer_id,
                       so.user_id as seller_id,
                       CASE 
                           WHEN bo.user_id = %s THEN 'BUY'
                           WHEN so.user_id = %s THEN 'SELL'
                           ELSE 'UNKNOWN'
                       END as user_side
                FROM transactions t
                LEFT JOIN orders bo ON t.buy_order_id = bo.id
                LEFT JOIN orders so ON t.sell_order_id = so.id
                WHERE bo.user_id = %s OR so.user_id = %s
                ORDER BY t.executed_at DESC
                LIMIT 100
            """,
                (user_id, user_id, user_id, user_id),
            )
            transactions = cursor.fetchall()
            cursor.close()

            return jsonify({"success": True, "transactions": transactions})

    except mysql.connector.Error as err:
        logging.error(f"Error fetching user transactions: {err}")
        return jsonify({"error": "Database error"}), 500


# Update user balance (can be used for deposits or withdrawals in the future)
@bp.route("/user/balances/<asset>", methods=["PUT"])
@jwt_required()
def update_user_balance(asset):
    try:
        user_id = get_jwt_identity()

        # Validate required fields
        if "available" not in request.json:
            return jsonify({"error": "Missing required field: available"}), 400

        available = float(request.json["available"])
        reserved = float(request.json.get("reserved", 0))

        if available < 0 or reserved < 0:
            return jsonify({"error": "Balance amounts cannot be negative"}), 400

        with get_db_connection() as db:
            cursor = db.cursor()

            # Check if balance record exists
            cursor.execute(
                "SELECT id FROM balances WHERE user_id = %s AND asset = %s",
                (int(user_id), asset.upper()),
            )
            existing = cursor.fetchone()

            if existing:
                # Update existing balance
                cursor.execute(
                    """UPDATE balances 
                       SET available = %s, reserved = %s, updated_at = NOW()
                       WHERE user_id = %s AND asset = %s""",
                    (available, reserved, int(user_id), asset.upper()),
                )
            else:
                # Create new balance record
                cursor.execute(
                    """INSERT INTO balances (user_id, asset, available, reserved, updated_at)
                       VALUES (%s, %s, %s, %s, NOW())""",
                    (int(user_id), asset.upper(), available, reserved),
                )

            db.commit()
            cursor.close()

            return (
                jsonify(
                    {"success": True, "message": f"Balance updated for {asset.upper()}"}
                ),
                200,
            )

    except ValueError as e:
        return jsonify({"error": "Invalid numeric value provided"}), 400
    except mysql.connector.Error as err:
        logging.error(f"Error updating balance: {err}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        logging.error(f"Unexpected error updating balance: {e}")
        return jsonify({"error": "Internal server error"}), 500