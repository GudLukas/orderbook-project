from api import app
from models import db, Order

with app.app_context():
    # Check database connection
    print("Database URI:", app.config['SQLALCHEMY_DATABASE_URI'])
    
    # Get all orders with more details
    orders = Order.query.all()
    print(f"Total orders found: {len(orders)}")
    print("=" * 60)
    
    if orders:
        for i, order in enumerate(orders, 1):
            print(f"Order #{i}")
            print(f"ID: {order.id}")
            print(f"Symbol: {order.symbol}")
            print(f"Side: {order.side}")
            print(f"Price: ${order.price}")
            print(f"Quantity: {order.quantity}")
            print("-" * 40)
    else:
        print("No orders found in database")
    
    # Also check raw SQL
    result = db.session.execute(db.text("SELECT COUNT(*) FROM 'order'")).scalar()
    print(f"Raw SQL count: {result}")