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

@bp.route('/instructions', methods=['GET'])
def instructions():
    html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Orderbook API Instructions</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                background-color: #f5f5f5; 
            }
            .container { 
                max-width: 800px; 
                margin: 0 auto; 
                background: white; 
                padding: 30px; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            h1 { 
                color: #333; 
                text-align: center; 
                margin-bottom: 30px; 
            }
            .instructions-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px; 
            }
            .instructions-table th, .instructions-table td { 
                border: 1px solid #ddd; 
                padding: 12px; 
                text-align: left; 
            }
            .instructions-table th { 
                background-color: #4CAF50; 
                color: white; 
                font-weight: bold; 
            }
            .instructions-table tr:nth-child(even) { 
                background-color: #f9f9f9; 
            }
            .method { 
                font-weight: bold; 
                color: #2196F3; 
            }
            .endpoint { 
                font-family: 'Courier New', monospace; 
                background-color: #f0f0f0; 
                padding: 4px 6px; 
                border-radius: 3px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Orderbook API</h1>
            
            <table class="instructions-table">
                <thead>
                    <tr>
                        <th>Method</th>
                        <th>Endpoint</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="method">POST</span></td>
                        <td><span class="endpoint">/orders</span></td>
                        <td>Add a new order</td>
                    </tr>
                    <tr>
                        <td><span class="method">GET</span></td>
                        <td><span class="endpoint">/orders</span></td>
                        <td>List all orders</td>
                    </tr>
                    <tr>
                        <td><span class="method">PUT</span></td>
                        <td><span class="endpoint">/orders/&lt;id&gt;</span></td>
                        <td>Update an order</td>
                    </tr>
                    <tr>
                        <td><span class="method">DELETE</span></td>
                        <td><span class="endpoint">/orders/&lt;id&gt;</span></td>
                        <td>Delete an order</td>
                    </tr>
                    <tr>
                        <td><span class="method">GET</span></td>
                        <td><span class="endpoint">/instructions</span></td>
                        <td>Show this instructions page</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </body>
    </html>
    """
    return html