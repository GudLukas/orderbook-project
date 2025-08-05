from flask import Blueprint, Flask, Response, jsonify, request, current_app
from db_pool import get_db_connection
import mysql.connector
import logging
import bcrypt
import os
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from datetime import datetime, timedelta

bp = Blueprint("bp", __name__)


# get all orders
@bp.route("/orders", methods=["GET"])
def get_orders():
    try:
        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)
            cursor.execute("SELECT * FROM orders")
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
        user_id = get_jwt_identity()

        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)
            sql = """
                SELECT id, symbol, side, price, quantity, status, 
                    filled_quantity, created_at, updated_at
                FROM orders 
                WHERE user_id = %s 
                ORDER BY created_at DESC
            """
            # Convert user_id to int for database query
            cursor.execute(sql, (int(user_id),))
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
        user_id = get_jwt_identity()

        # Validate required fields
        required_fields = ["symbol", "side", "quantity"]
        for field in required_fields:
            if field not in request.json:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Get data from request
        symbol = request.json["symbol"]
        side = request.json["side"].upper()  # Ensure uppercase (BUY/SELL)
        quantity = float(request.json["quantity"])
        price = float(request.json.get("price", 0))  # Default to 0 for market orders
        order_type = request.json.get("order_type", "LIMIT")  # Default to LIMIT
        status = "PENDING"  # New orders start as PENDING
        filled_quantity = 0.0  # Initially no quantity is filled

        # Validate numeric values
        if quantity <= 0:
            return jsonify({"error": "Quantity must be greater than 0"}), 400

        if order_type != "MARKET" and price <= 0:
            return (
                jsonify(
                    {"error": "Price must be greater than 0 for non-market orders"}
                ),
                400,
            )

        # Validate side
        if side not in ["BUY", "SELL"]:
            return jsonify({"error": "Side must be either 'BUY' or 'SELL'"}), 400

        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)

            # Balance validation and reservation logic
            if side == "BUY":
                # For BUY orders, check USD balance and reserve the total cost
                total_cost = quantity * price
                
                # Get current USD balance
                cursor.execute(
                    "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = 'USD'",
                    (int(user_id),)
                )
                usd_balance = cursor.fetchone()
                
                if not usd_balance:
                    cursor.close()
                    return jsonify({"error": "USD balance not found. Please contact support."}), 400
                
                if float(usd_balance['available']) < total_cost:
                    cursor.close()
                    return jsonify({
                        "error": f"Insufficient USD balance. Required: ${total_cost:.2f}, Available: ${float(usd_balance['available']):.2f}"
                    }), 400
                
                # Reserve the USD amount
                new_available = float(usd_balance['available']) - total_cost
                new_reserved = float(usd_balance['reserved']) + total_cost
                
                cursor.execute(
                    """UPDATE balances 
                       SET available = %s, reserved = %s, updated_at = NOW()
                       WHERE user_id = %s AND asset = 'USD'""",
                    (new_available, new_reserved, int(user_id))
                )
                
            elif side == "SELL":
                # For SELL orders, check asset balance and reserve the quantity
                # Extract base asset from symbol (e.g., BTC from BTCUSD)
                base_asset = symbol.replace('USD', '').replace('USDT', '')
                
                # Get current asset balance
                cursor.execute(
                    "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = %s",
                    (int(user_id), base_asset)
                )
                asset_balance = cursor.fetchone()
                
                if not asset_balance:
                    cursor.close()
                    return jsonify({"error": f"{base_asset} balance not found. Please contact support."}), 400
                
                if float(asset_balance['available']) < quantity:
                    cursor.close()
                    return jsonify({
                        "error": f"Insufficient {base_asset} balance. Required: {quantity}, Available: {float(asset_balance['available'])}"
                    }), 400
                
                # Reserve the asset quantity
                new_available = float(asset_balance['available']) - quantity
                new_reserved = float(asset_balance['reserved']) + quantity
                
                cursor.execute(
                    """UPDATE balances 
                       SET available = %s, reserved = %s, updated_at = NOW()
                       WHERE user_id = %s AND asset = %s""",
                    (new_available, new_reserved, int(user_id), base_asset)
                )

            # Insert order with all required fields according to schema
            sql = """
                INSERT INTO orders (
                    user_id, symbol, side, price, quantity, 
                    status, filled_quantity, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """

            # Convert user_id to int for database insertion
            cursor.execute(
                sql,
                (
                    int(user_id),  # user_id (FK to users table) - convert to int
                    symbol,  # symbol (VARCHAR(10))
                    side,  # side (ENUM 'BUY', 'SELL')
                    price,  # price (DECIMAL(10,2))
                    quantity,  # quantity (DECIMAL(10,8))
                    status,  # status (ENUM)
                    filled_quantity,  # filled_quantity (DECIMAL(10,8))
                ),
            )

            db.commit()
            order_id = cursor.lastrowid
            cursor.close()

            return (
                jsonify(
                    {
                        "success": True,
                        "message": "Order created successfully",
                        "order": {
                            "id": order_id,
                            "user_id": int(user_id),  # Convert back to int for response
                            "symbol": symbol,
                            "side": side,
                            "price": price,
                            "quantity": quantity,
                            "status": status,
                            "filled_quantity": filled_quantity,
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
    except KeyError as e:
        logging.error(f"Missing field: {e}")
        return jsonify({"error": f"Missing required field: {e}"}), 400
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return jsonify({"error": "Internal server error"}), 500


# delete an existing order
@bp.route("/orders/<int:order_id>", methods=["DELETE"])
@jwt_required()
def delete_order(order_id):
    try:
        user_id = get_jwt_identity()

        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)

            # First check if the order exists and belongs to the user
            check_sql = "SELECT id, user_id, status, symbol, side, quantity, price FROM orders WHERE id = %s"
            cursor.execute(check_sql, (order_id,))
            order = cursor.fetchone()

            if not order:
                cursor.close()
                return jsonify({"error": "Order not found"}), 404

            # Check if the order belongs to the current user
            if int(order["user_id"]) != int(user_id):
                cursor.close()
                return jsonify({"error": "You can only delete your own orders"}), 403

            # Check if order can be cancelled (only PENDING orders can be cancelled)
            if order["status"] != "PENDING":
                cursor.close()
                return (
                    jsonify(
                        {
                            "error": f"Cannot delete order with status '{order['status']}'. Only PENDING orders can be deleted."
                        }
                    ),
                    400,
                )

            # Release reserved balances before deleting order
            if order["side"] == "BUY":
                # Release reserved USD
                total_cost = float(order["quantity"]) * float(order["price"])
                
                cursor.execute(
                    "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = 'USD'",
                    (int(user_id),)
                )
                usd_balance = cursor.fetchone()
                
                if usd_balance:
                    new_available = float(usd_balance['available']) + total_cost
                    new_reserved = max(0, float(usd_balance['reserved']) - total_cost)
                    
                    cursor.execute(
                        """UPDATE balances 
                           SET available = %s, reserved = %s, updated_at = NOW()
                           WHERE user_id = %s AND asset = 'USD'""",
                        (new_available, new_reserved, int(user_id))
                    )
                    
            elif order["side"] == "SELL":
                # Release reserved asset
                base_asset = order["symbol"].replace('USD', '').replace('USDT', '')
                quantity = float(order["quantity"])
                
                cursor.execute(
                    "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = %s",
                    (int(user_id), base_asset)
                )
                asset_balance = cursor.fetchone()
                
                if asset_balance:
                    new_available = float(asset_balance['available']) + quantity
                    new_reserved = max(0, float(asset_balance['reserved']) - quantity)
                    
                    cursor.execute(
                        """UPDATE balances 
                           SET available = %s, reserved = %s, updated_at = NOW()
                           WHERE user_id = %s AND asset = %s""",
                        (new_available, new_reserved, int(user_id), base_asset)
                    )

            # Delete the order
            delete_sql = "DELETE FROM orders WHERE id = %s AND user_id = %s"
            cursor.execute(delete_sql, (order_id, int(user_id)))
            db.commit()

            if cursor.rowcount > 0:
                cursor.close()
                return (
                    jsonify({"success": True, "message": "Order cancelled and balances released successfully"}),
                    200,
                )
            else:
                cursor.close()
                return jsonify({"error": "Failed to delete order"}), 500

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
            check_sql = "SELECT id, user_id, status, symbol, side, price, quantity FROM orders WHERE id = %s"
            cursor.execute(check_sql, (order_id,))
            order = cursor.fetchone()

            if not order:
                cursor.close()
                return jsonify({"error": "Order not found"}), 404

            # Check if the order belongs to the current user
            if int(order["user_id"]) != int(user_id):
                cursor.close()
                return jsonify({"error": "You can only update your own orders"}), 403

            # Check if order can be updated (only PENDING orders can be updated)
            if order["status"] != "PENDING":
                cursor.close()
                return (
                    jsonify(
                        {
                            "error": f"Cannot update order with status '{order['status']}'. Only PENDING orders can be updated."
                        }
                    ),
                    400,
                )

            # Release old reservations
            old_side = order["side"]
            old_quantity = float(order["quantity"])
            old_price = float(order["price"])
            old_symbol = order["symbol"]

            if old_side == "BUY":
                # Release old USD reservation
                old_total_cost = old_quantity * old_price
                
                cursor.execute(
                    "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = 'USD'",
                    (int(user_id),)
                )
                usd_balance = cursor.fetchone()
                
                if usd_balance:
                    new_available = float(usd_balance['available']) + old_total_cost
                    new_reserved = max(0, float(usd_balance['reserved']) - old_total_cost)
                    
                    cursor.execute(
                        """UPDATE balances 
                           SET available = %s, reserved = %s, updated_at = NOW()
                           WHERE user_id = %s AND asset = 'USD'""",
                        (new_available, new_reserved, int(user_id))
                    )
                    
            elif old_side == "SELL":
                # Release old asset reservation
                old_base_asset = old_symbol.replace('USD', '').replace('USDT', '')
                
                cursor.execute(
                    "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = %s",
                    (int(user_id), old_base_asset)
                )
                asset_balance = cursor.fetchone()
                
                if asset_balance:
                    new_available = float(asset_balance['available']) + old_quantity
                    new_reserved = max(0, float(asset_balance['reserved']) - old_quantity)
                    
                    cursor.execute(
                        """UPDATE balances 
                           SET available = %s, reserved = %s, updated_at = NOW()
                           WHERE user_id = %s AND asset = %s""",
                        (new_available, new_reserved, int(user_id), old_base_asset)
                    )

            # Apply new reservations
            if new_side == "BUY":
                # Reserve new USD amount
                new_total_cost = new_quantity * new_price
                
                cursor.execute(
                    "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = 'USD'",
                    (int(user_id),)
                )
                usd_balance = cursor.fetchone()
                
                if not usd_balance:
                    cursor.close()
                    return jsonify({"error": "USD balance not found. Please contact support."}), 400
                
                if float(usd_balance['available']) < new_total_cost:
                    cursor.close()
                    return jsonify({
                        "error": f"Insufficient USD balance for updated order. Required: ${new_total_cost:.2f}, Available: ${float(usd_balance['available']):.2f}"
                    }), 400
                
                new_available = float(usd_balance['available']) - new_total_cost
                new_reserved = float(usd_balance['reserved']) + new_total_cost
                
                cursor.execute(
                    """UPDATE balances 
                       SET available = %s, reserved = %s, updated_at = NOW()
                       WHERE user_id = %s AND asset = 'USD'""",
                    (new_available, new_reserved, int(user_id))
                )
                
            elif new_side == "SELL":
                # Reserve new asset amount
                new_base_asset = new_symbol.replace('USD', '').replace('USDT', '')
                
                cursor.execute(
                    "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = %s",
                    (int(user_id), new_base_asset)
                )
                asset_balance = cursor.fetchone()
                
                if not asset_balance:
                    cursor.close()
                    return jsonify({"error": f"{new_base_asset} balance not found. Please contact support."}), 400
                
                if float(asset_balance['available']) < new_quantity:
                    cursor.close()
                    return jsonify({
                        "error": f"Insufficient {new_base_asset} balance for updated order. Required: {new_quantity}, Available: {float(asset_balance['available'])}"
                    }), 400
                
                new_available = float(asset_balance['available']) - new_quantity
                new_reserved = float(asset_balance['reserved']) + new_quantity
                
                cursor.execute(
                    """UPDATE balances 
                       SET available = %s, reserved = %s, updated_at = NOW()
                       WHERE user_id = %s AND asset = %s""",
                    (new_available, new_reserved, int(user_id), new_base_asset)
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
                cursor.close()
                return (
                    jsonify({"success": True, "message": "Order updated successfully with balance adjustments"}),
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
                ('USD', 10000.00, 0.00),    # $10,000 USD
                ('BTC', 0.5, 0.00),         # 0.5 BTC
                ('ETH', 2.0, 0.00),         # 2.0 ETH
                ('ADA', 1000.0, 0.00),      # 1,000 ADA
                ('SOL', 50.0, 0.00),        # 50 SOL
            ]
            
            for asset, available, reserved in demo_balances:
                cursor.execute(
                    """INSERT INTO balances (user_id, asset, available, reserved, updated_at) 
                       VALUES (%s, %s, %s, %s, NOW())""",
                    (user_id, asset, available, reserved)
                )
            
            db.commit()
            cursor.close()

            return jsonify({"message": "User registered successfully with demo balances"}), 201

    except mysql.connector.Error as err:
        logging.error(f"Error registering user: {err}")
        return jsonify({"error": "Database error"}), 500


# Get user balances
@bp.route('/user/balances', methods=['GET'])
@jwt_required()
def get_user_balances():
    try:
        user_id = get_jwt_identity()

        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)
            sql = """
                SELECT asset, available, reserved, updated_at
                FROM balances 
                WHERE user_id = %s 
                ORDER BY asset
            """
            cursor.execute(sql, (int(user_id),))
            balances = cursor.fetchall()
            cursor.close()

            # Convert to a more convenient format for frontend
            balance_dict = {}
            for balance in balances:
                balance_dict[balance['asset']] = {
                    'available': float(balance['available']),
                    'reserved': float(balance['reserved']),
                    'total': float(balance['available']) + float(balance['reserved']),
                    'updated_at': balance['updated_at'].isoformat() if balance['updated_at'] else None
                }

            return jsonify({
                "success": True,
                "balances": balance_dict
            })
        
    except mysql.connector.Error as err:
        logging.error(f"Error fetching user balances: {err}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        logging.error(f"Unexpected error fetching balances: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Update user balance (for admin or internal use)
@bp.route('/user/balances/<asset>', methods=['PUT'])
@jwt_required()
def update_user_balance(asset):
    try:
        user_id = get_jwt_identity()
        
        # Validate required fields
        if 'available' not in request.json:
            return jsonify({"error": "Missing required field: available"}), 400
        
        available = float(request.json['available'])
        reserved = float(request.json.get('reserved', 0))
        
        if available < 0 or reserved < 0:
            return jsonify({"error": "Balance amounts cannot be negative"}), 400

        with get_db_connection() as db:
            cursor = db.cursor()
            
            # Check if balance record exists
            cursor.execute(
                "SELECT id FROM balances WHERE user_id = %s AND asset = %s",
                (int(user_id), asset.upper())
            )
            existing = cursor.fetchone()
            
            if existing:
                # Update existing balance
                cursor.execute(
                    """UPDATE balances 
                       SET available = %s, reserved = %s, updated_at = NOW()
                       WHERE user_id = %s AND asset = %s""",
                    (available, reserved, int(user_id), asset.upper())
                )
            else:
                # Create new balance record
                cursor.execute(
                    """INSERT INTO balances (user_id, asset, available, reserved, updated_at)
                       VALUES (%s, %s, %s, %s, NOW())""",
                    (int(user_id), asset.upper(), available, reserved)
                )
            
            db.commit()
            cursor.close()
            
            return jsonify({
                "success": True,
                "message": f"Balance updated for {asset.upper()}"
            }), 200
            
    except ValueError as e:
        return jsonify({"error": "Invalid numeric value provided"}), 400
    except mysql.connector.Error as err:
        logging.error(f"Error updating balance: {err}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        logging.error(f"Unexpected error updating balance: {e}")
        return jsonify({"error": "Internal server error"}), 500
