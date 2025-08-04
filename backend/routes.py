from flask import Blueprint, Flask, Response, jsonify, request
from db_pool import get_db_connection
import mysql.connector
import logging
import bcrypt
import os
import jwt
from datetime import datetime, timedelta

# Secret key for JWT
JWT_SECRET = os.environ.get('JWT_SECRET', 'your_default_secret_here')

bp = Blueprint('bp', __name__)

# get all orders
@bp.route('/orders', methods=['GET'])
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
    
# create a new order
@bp.route('/orders', methods=['POST'])
def create_order():
    try:
        with get_db_connection() as db:
            cursor = db.cursor()
            sql = "INSERT INTO orders (symbol, side, price, quantity) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (request.json['symbol'], request.json['side'], request.json['price'], request.json['quantity']))
            db.commit()
            cursor.close()
            return Response(status=201)
    except mysql.connector.Error as err:
        logging.error(f"Error creating order: {err}")
        return Response(status=500)

# delete an existing order
@bp.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    try:
        with get_db_connection() as db:
            cursor = db.cursor()
            sql = "DELETE FROM orders WHERE id = %s"
            cursor.execute(sql, (order_id,))
            db.commit()
            cursor.close()
            return Response(status=204)
    except mysql.connector.Error as err:
        logging.error(f"Error deleting order: {err}")
        return Response(status=500)

# get a specific order by ID
@bp.route('/orders/<int:order_id>', methods=['GET'])
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
@bp.route('/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    try:
        with get_db_connection() as db:
            cursor = db.cursor()
            sql = "UPDATE orders SET symbol = %s, side = %s, price = %s, quantity = %s WHERE id = %s"
            cursor.execute(sql, (request.json['symbol'], request.json['side'], request.json['price'], request.json['quantity'], order_id))
            db.commit()
    
            if cursor.rowcount > 0:
                cursor.close()
                return Response(status=200)
            else:
                cursor.close()
                return Response(status=404)
            
    except mysql.connector.Error as err:
        logging.error(f"Error updating order: {err}")
        return Response(status=500)
    
    
@bp.route('/login', methods=['POST'])
def login():
    try:
        email = request.json.get('email')
        password = request.json.get('password')

        with get_db_connection() as db:
            cursor = db.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

        # Check password with bcrypt
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            # Create JWT with 30min expiration
            payload = {
                'user_id': user['id'],
                'email': user['email'],
                'exp': datetime.utcnow() + timedelta(minutes=30)
            }
            
            token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
            
            return jsonify({
                "success": True,
                "token": token,
                "expiresIn": 30 * 60,  # seconds
                "user": {
                    "id": user['id'],
                    "email": user['email'],
                    "username": user['username']
                }
            }), 200
        else:
            return jsonify({"message": "Invalid email or password"}), 401

    except mysql.connector.Error as err:
        logging.error(f"Error logging in: {err}")
        return Response(status=500)
    
@bp.route('/register', methods=['POST'])
def register():
    try:
        email = request.json.get('email')
        password = request.json.get('password')
        username = request.json.get('username', email)

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        with get_db_connection() as db:
            cursor = db.cursor()
            cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", (username, email, hashed_password))
            db.commit()
            cursor.close()

            return jsonify({"message": "User registered successfully"}), 201

    except mysql.connector.Error as err:
        logging.error(f"Error registering user: {err}")
        return Response(status=500)
