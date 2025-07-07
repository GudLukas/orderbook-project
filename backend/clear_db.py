from api import app
from models import db, Order

with app.app_context():
    # Delete all orders
    Order.query.delete()
    db.session.commit()
    print("All orders deleted from database")
    
    # Verify it's empty
    count = Order.query.count()
    print(f"Orders remaining: {count}")