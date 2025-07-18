from flask import Blueprint, Flask, Response, jsonify, request
from db_connect import get_connection


bp = Blueprint('bp', __name__)

# get all orders
@bp.route('/orders', methods=['GET'])
def get_orders():
    db = get_connection()
    cursor = db.cursor()
    sql = "SELECT * FROM orders"
    cursor.execute(sql)
    orders = cursor.fetchall()
    cursor.close()
    db.close()
    
    return jsonify([{
        'id': order[0],
        'symbol': order[1],
        'side': order[2],
        'price': order[3],
        'quantity': order[4]
    } for order in orders])
    
# create a new order
@bp.route('/orders', methods=['POST'])
def create_order():
    db = get_connection()
    cursor = db.cursor()
    sql = "INSERT INTO orders (symbol, side, price, quantity) VALUES (%s, %s, %s, %s)"
    cursor.execute(sql, (request.json['symbol'], request.json['side'], request.json['price'], request.json['quantity']))
    db.commit()
    cursor.close()
    db.close()
    return Response(status=201)

# delete an existing order
@bp.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    db = get_connection()
    cursor = db.cursor()
    sql = "DELETE FROM orders WHERE id = %s"
    cursor.execute(sql, (order_id,))
    db.commit()
    cursor.close()
    db.close()
    return Response(status=204)

# get a specific order by ID
@bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    db = get_connection()
    cursor = db.cursor()
    sql = "SELECT * FROM orders WHERE id = %s"
    cursor.execute(sql, (order_id,))
    order = cursor.fetchone()
    cursor.close()
    db.close()
    
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

# update an existing order
@bp.route('/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    db = get_connection()
    cursor = db.cursor()
    sql = "UPDATE orders SET symbol = %s, side = %s, price = %s, quantity = %s WHERE id = %s"
    cursor.execute(sql, (request.json['symbol'], request.json['side'], request.json['price'], request.json['quantity'], order_id))
    db.commit()
    cursor.close()
    db.close()
    
    if cursor.rowcount > 0:
        return Response(status=200)
    else:
        return Response(status=404)