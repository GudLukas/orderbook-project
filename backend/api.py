# use Flask to develop the needed endpoints /buy, /sell, /view
# data needed (regular stock trading): order_id, symbol (of stock), order_type (buy/sell), price, quantity, timestamp, status, user_id 
# data needed (options): order_id, symbol (of option), order_type (buy/sell), price, quantity, timestamp, status, user_id, option_type (call/put), expiration_date, strike_price


from flask import Flask, request, jsonify

app = Flask(__name__)

# Enhanced database structure
orders_db = {
    "stocks": {
        "buy_orders": [],
        "sell_orders": []
    },
    "options": {
        "buy_orders": [],
        "sell_orders": []
    }
}

def is_options_order(data):
    options_fields = ['option_type', 'expiration_date', 'strike_price']
    return any(field in data for field in options_fields)

@app.route("/addBuy", methods=["POST"])
def buy_item():
    data = request.get_json()
    
    if not is_options_order(data):
        # Get data once
        order_id = data.get("order_id")
        symbol = data.get("symbol")
        order_type = data.get("order_type", "buy")  # Default to buy if not provided
        price = data.get("price")
        quantity = data.get("quantity")
        timestamp = data.get("timestamp")
        status = data.get("status")
        user_id = data.get("user_id")
        
        # Create stock order
        stock_order = {
            "order_id": order_id,
            "symbol": symbol,
            "order_type": order_type,
            "price": price,
            "quantity": quantity,
            "timestamp": timestamp,
            "status": status,
            "user_id": user_id
        }
        
        # Add to temporary database
        orders_db["stocks"]['buy_orders'].append(stock_order)
        
        # Implement buying logic here
        return jsonify({"message": "Stock bought successfully", "order": stock_order})
    else:
        # Get data once
        order_id = data.get("order_id")
        symbol = data.get("symbol")
        order_type = data.get("order_type", "buy")  # Default to buy if not provided
        price = data.get("price")
        quantity = data.get("quantity")
        timestamp = data.get("timestamp")
        status = data.get("status")
        user_id = data.get("user_id")
        option_type = data.get("option_type")
        expiration_date = data.get("expiration_date")
        strike_price = data.get("strike_price")
        
        # Create options order
        options_order = {
            "order_id": order_id,
            "symbol": symbol,
            "order_type": order_type,
            "price": price,
            "quantity": quantity,
            "timestamp": timestamp,
            "status": status,
            "user_id": user_id,
            "option_type": option_type,
            "expiration_date": expiration_date,
            "strike_price": strike_price
        }
        
        # Add to temporary database
        orders_db["options"]['buy_orders'].append(options_order)

        # Implement options buying logic here
        return jsonify({"message": "Option bought successfully", "order": options_order})


@app.route("/addSell", methods=["POST"])
def sell_item():
    data = request.get_json()
    
    if not is_options_order(data):
        # Create stock sell order
        stock_order = {
            "order_id": data.get("order_id"),
            "symbol": data.get("symbol"),
            "order_type": data.get("order_type", "sell"),  # Default to sell if not provided
            "price": data.get("price"),
            "quantity": data.get("quantity"),
            "timestamp": data.get("timestamp"),
            "status": data.get("status", "open"),
            "user_id": data.get("user_id")
        }
        
        # Add to temporary database
        orders_db["stocks"]['sell_orders'].append(stock_order)

        return jsonify({"message": "Stock sell order created successfully", "order": stock_order})
    else:
        # Create options sell order
        options_order = {
            "order_id": data.get("order_id"),
            "symbol": data.get("symbol"),
            "order_type": data.get("order_type", "sell"),  # Default to sell if not provided
            "price": data.get("price"),
            "quantity": data.get("quantity"),
            "timestamp": data.get("timestamp"),
            "status": data.get("status", "open"),
            "user_id": data.get("user_id"),
            "option_type": data.get("option_type"),
            "expiration_date": data.get("expiration_date"),
            "strike_price": data.get("strike_price")
        }
        
        # Add to temporary database
        orders_db["options"]['sell_orders'].append(options_order)

        return jsonify({"message": "Options sell order created successfully", "order": options_order})

@app.route("/view", methods=["GET"])
def view_items():
    # Implement viewing logic here
    return jsonify({"stocks": orders_db["stocks"], "options": orders_db["options"]})

@app.route('/')
def get_description():
    return """
    <h1>
        Order Book API
    </h1>
    <p>
        This app supports the endpoints listed below. You can change the data being sent to the API by updating the URI.
    </p>
    <ul>
        <li><a href='http://127.0.0.1:5000/buy'>POST Buy Item</a></li>
        <li><a href='http://127.0.0.1:5000/sell'>POST Sell Item</a></li>
        <li><a href='http://127.0.0.1:5000/view'>GET View Items</a></li>
    </ul>
    """

if __name__ == "__main__":
    app.run(debug=True)