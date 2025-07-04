from flask import Blueprint, request, jsonify
from models import db, Order

bp = Blueprint('routes', __name__)

@bp.route('/orders', methods=['POST'])
def add_order():
    data = request.json
    order = Order(
        symbol=data['symbol'],
        side=data['side'],
        price=data['price'],
        quantity=data['quantity']
    )
    db.session.add(order)
    db.session.commit()
    return jsonify({'message': 'Order added', 'id': order.id}), 201

@bp.route('/orders', methods=['GET'])
def get_orders():
    orders = Order.query.all()
    return jsonify([{
        'id': o.id,
        'symbol': o.symbol,
        'side': o.side,
        'price': o.price,
        'quantity': o.quantity
    } for o in orders])