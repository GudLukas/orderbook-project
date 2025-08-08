import mysql.connector
import logging
from flask_jwt_extended import get_jwt_identity


def get_base_asset(symbol):
    """Extract base asset from trading symbol (e.g., BTC from BTCUSD)"""
    return symbol.replace("USD", "").replace("USDT", "")


def get_user_id_int():
    """Get current user ID as integer"""
    return int(get_jwt_identity())


def get_user_balance(cursor, user_id, asset):
    """Get user balance for a specific asset"""
    cursor.execute(
        "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = %s",
        (user_id, asset),
    )
    return cursor.fetchone()


def update_balance(cursor, user_id, asset, available_change=0, reserved_change=0):
    """Update user balance with specified changes"""
    balance = get_user_balance(cursor, user_id, asset)
    if not balance:
        raise ValueError(f"{asset} balance not found for user {user_id}")

    new_available = float(balance["available"]) + available_change
    new_reserved = float(balance["reserved"]) + reserved_change

    if new_available < 0:
        raise ValueError(f"Insufficient {asset} balance")

    cursor.execute(
        """UPDATE balances 
           SET available = %s, reserved = %s, updated_at = NOW()
           WHERE user_id = %s AND asset = %s""",
        (new_available, new_reserved, user_id, asset),
    )

    return new_available, new_reserved


def reserve_balance_for_order(cursor, user_id, side, symbol, quantity, price):
    """Reserve balance for a new order"""
    if side == "BUY":
        total_cost = quantity * price
        balance = get_user_balance(cursor, user_id, "USD")

        if not balance or float(balance["available"]) < total_cost:
            available = float(balance["available"]) if balance else 0
            raise ValueError(
                f"Insufficient USD balance. Required: ${total_cost:.2f}, Available: ${available:.2f}"
            )

        update_balance(cursor, user_id, "USD", -total_cost, total_cost)

    elif side == "SELL":
        base_asset = get_base_asset(symbol)
        balance = get_user_balance(cursor, user_id, base_asset)

        if not balance or float(balance["available"]) < quantity:
            available = float(balance["available"]) if balance else 0
            raise ValueError(
                f"Insufficient {base_asset} balance. Required: {quantity}, Available: {available}"
            )

        update_balance(cursor, user_id, base_asset, -quantity, quantity)


def release_balance_for_order(cursor, user_id, side, symbol, quantity, price):
    """Release reserved balance when cancelling an order"""
    if side == "BUY":
        total_cost = quantity * price
        update_balance(cursor, user_id, "USD", total_cost, -total_cost)
    elif side == "SELL":
        base_asset = get_base_asset(symbol)
        update_balance(cursor, user_id, base_asset, quantity, -quantity)


def process_trade_settlement(cursor, buy_order, sell_order, quantity, price):
    """
    Process the balance transfers for a completed trade.
    """
    try:
        # Determine which order is buy and which is sell
        if buy_order["side"] == "BUY":
            buyer_id = buy_order["user_id"]
            seller_id = sell_order["user_id"]
        else:
            buyer_id = sell_order["user_id"]
            seller_id = buy_order["user_id"]

        total_cost = quantity * price
        base_asset = buy_order["symbol"].replace("USD", "").replace("USDT", "")

        # Buyer: Release reserved USD, receive base asset
        # Get buyer's USD balance
        cursor.execute(
            "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = 'USD'",
            (buyer_id,),
        )
        buyer_usd = cursor.fetchone()

        if buyer_usd:
            # Release reserved USD (reduce reserved by total_cost)
            new_reserved = max(0, float(buyer_usd["reserved"]) - total_cost)
            cursor.execute(
                """UPDATE balances 
                   SET reserved = %s, updated_at = NOW()
                   WHERE user_id = %s AND asset = 'USD'""",
                (new_reserved, buyer_id),
            )

        # Buyer: Add base asset to available balance
        cursor.execute(
            "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = %s",
            (buyer_id, base_asset),
        )
        buyer_asset = cursor.fetchone()

        if buyer_asset:
            new_available = float(buyer_asset["available"]) + quantity
            cursor.execute(
                """UPDATE balances 
                   SET available = %s, updated_at = NOW()
                   WHERE user_id = %s AND asset = %s""",
                (new_available, buyer_id, base_asset),
            )
        else:
            # Create new balance record for buyer
            cursor.execute(
                """INSERT INTO balances (user_id, asset, available, reserved, updated_at)
                   VALUES (%s, %s, %s, 0, NOW())""",
                (buyer_id, base_asset, quantity),
            )

        # Seller: Release reserved base asset, receive USD
        # Get seller's base asset balance
        cursor.execute(
            "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = %s",
            (seller_id, base_asset),
        )
        seller_asset = cursor.fetchone()

        if seller_asset:
            # Release reserved base asset
            new_reserved = max(0, float(seller_asset["reserved"]) - quantity)
            cursor.execute(
                """UPDATE balances 
                   SET reserved = %s, updated_at = NOW()
                   WHERE user_id = %s AND asset = %s""",
                (new_reserved, seller_id, base_asset),
            )

        # Seller: Add USD to available balance
        cursor.execute(
            "SELECT available, reserved FROM balances WHERE user_id = %s AND asset = 'USD'",
            (seller_id,),
        )
        seller_usd = cursor.fetchone()

        if seller_usd:
            new_available = float(seller_usd["available"]) + total_cost
            cursor.execute(
                """UPDATE balances 
                   SET available = %s, updated_at = NOW()
                   WHERE user_id = %s AND asset = 'USD'""",
                (new_available, seller_id),
            )
        else:
            # Create new USD balance for seller
            cursor.execute(
                """INSERT INTO balances (user_id, asset, available, reserved, updated_at)
                   VALUES (%s, 'USD', %s, 0, NOW())""",
                (seller_id, total_cost),
            )

        logging.info(
            f"Trade settled: {quantity} {base_asset} @ ${price} between users {buyer_id} and {seller_id}"
        )

    except Exception as e:
        logging.error(f"Error in trade settlement: {e}")
        raise


def match_orders(cursor, new_order_id, db):
    """
    Match orders in the order book for the given new order.
    Returns True if the order was fully filled, False otherwise.
    """
    try:
        # Get the new order details
        cursor.execute(
            "SELECT * FROM orders WHERE id = %s AND status IN ('PENDING', 'PARTIAL')", (new_order_id,)
        )
        new_order = cursor.fetchone()

        if not new_order:
            return False

        logging.info(
            f"Matching order {new_order_id}: {new_order['side']} {new_order['quantity']} {new_order['symbol']} @ {new_order['price']}"
        )

        # Find matching orders (opposite side, same symbol, compatible price)
        # For BUY orders, find SELL orders with price <= new_order_price
        # For SELL orders, find BUY orders with price >= new_order_price
        if new_order["side"] == "BUY":
            match_sql = """
                SELECT * FROM orders 
                WHERE symbol = %s 
                AND side = 'SELL' 
                AND status IN ('PENDING', 'PARTIAL')
                AND price <= %s
                AND user_id != %s
                ORDER BY price ASC, created_at ASC
            """
        else:  # SELL
            match_sql = """
                SELECT * FROM orders 
                WHERE symbol = %s 
                AND side = 'BUY' 
                AND status IN ('PENDING', 'PARTIAL')
                AND price >= %s
                AND user_id != %s
                ORDER BY price DESC, created_at ASC
            """

        cursor.execute(
            match_sql, (new_order["symbol"], new_order["price"], new_order["user_id"])
        )
        matching_orders = cursor.fetchall()

        remaining_quantity = float(new_order["quantity"]) - float(
            new_order["filled_quantity"]
        )

        for match_order in matching_orders:
            if remaining_quantity <= 0:
                break

            match_remaining = float(match_order["quantity"]) - float(
                match_order["filled_quantity"]
            )
            if match_remaining <= 0:
                continue

            # Calculate trade quantity (minimum of both remaining quantities)
            trade_quantity = min(remaining_quantity, match_remaining)
            # Use the existing order's price (price-time priority)
            trade_price = float(match_order["price"])

            logging.info(f"Executing trade: {trade_quantity} @ {trade_price}")

            # Create transaction record
            cursor.execute(
                """
                INSERT INTO transactions (
                    buy_order_id, sell_order_id, symbol, quantity, price, executed_at
                ) VALUES (%s, %s, %s, %s, %s, NOW())
            """,
                (
                    (
                        new_order["id"]
                        if new_order["side"] == "BUY"
                        else match_order["id"]
                    ),
                    (
                        match_order["id"]
                        if new_order["side"] == "BUY"
                        else new_order["id"]
                    ),
                    new_order["symbol"],
                    trade_quantity,
                    trade_price,
                ),
            )

            # Update filled quantities
            new_filled = float(new_order["filled_quantity"]) + trade_quantity
            match_filled = float(match_order["filled_quantity"]) + trade_quantity

            # Update new order
            cursor.execute(
                """
                UPDATE orders 
                SET filled_quantity = %s, 
                    status = CASE WHEN filled_quantity >= quantity THEN 'FILLED' ELSE 'PARTIAL' END,
                    updated_at = NOW()
                WHERE id = %s
            """,
                (new_filled, new_order["id"]),
            )

            # Update matching order
            cursor.execute(
                """
                UPDATE orders 
                SET filled_quantity = %s,
                    status = CASE WHEN filled_quantity >= quantity THEN 'FILLED' ELSE 'PARTIAL' END,
                    updated_at = NOW()
                WHERE id = %s
            """,
                (match_filled, match_order["id"]),
            )

            # Process balance transfers
            process_trade_settlement(
                cursor, new_order, match_order, trade_quantity, trade_price
            )

            remaining_quantity -= trade_quantity

            # Update the new_order data for next iteration
            new_order["filled_quantity"] = new_filled

        return remaining_quantity <= 0

    except Exception as e:
        logging.error(f"Error in order matching: {e}")
        raise
