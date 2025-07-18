from flask import Blueprint, Flask, Response, jsonify, request
from db_pool import get_db_connection
import mysql.connector
import logging

bp = Blueprint('bp', __name__)

# get all orders
@bp.route('/orders', methods=['GET'])
def get_orders():
    try:
        with get_db_connection() as db:
            cursor = db.cursor()
            cursor.execute("SELECT * FROM orders")
            orders = cursor.fetchall()
            cursor.close()

            return jsonify([{
                'id': order[0],
                'symbol': order[1],
                'side': order[2],
                'price': order[3],
                'quantity': order[4]
            } for order in orders])
        
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
            cursor = db.cursor()
            sql = "SELECT * FROM orders WHERE id = %s"
            cursor.execute(sql, (order_id,))
            order = cursor.fetchone()
            cursor.close()

        if order:
            return jsonify({
                'id': order[0],
                'symbol': order[1],
                'side': order[2],
                'price': order[3],
                'quantity': order[4]
            })
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
            cursor.close()
    
            if cursor.rowcount > 0:
                return Response(status=200)
            else:
                return Response(status=404)
    except mysql.connector.Error as err:
        logging.error(f"Error updating order: {err}")
        return Response(status=500)