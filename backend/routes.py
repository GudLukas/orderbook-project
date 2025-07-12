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

@bp.route('/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    data = request.json
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found'}), 404
    order.symbol = data['symbol']
    order.side = data['side']
    order.price = data['price']
    order.quantity = data['quantity']
    db.session.commit()
    return jsonify({'message': 'Order updated'}), 200

@bp.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found'}), 404
    db.session.delete(order)
    db.session.commit()
    return jsonify({'message': 'Order deleted'}), 200