from flask import Blueprint, Flask, Response, jsonify, request
from db_connect import get_connection


bp = Blueprint('bp', __name__)

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
    