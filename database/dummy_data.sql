-- Dummy Data for OrderBook Database
-- This script should be run after creating the database schema

USE `orderbook_db`;

-- Insert dummy users
INSERT INTO `users` (`username`, `email`, `password`, `created_at`) VALUES
('alice_trader', 'alice@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBdXzogKLzGAu6', '2025-08-01 09:00:00'), -- password: password123
('bob_investor', 'bob@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBdXzogKLzGAu6', '2025-08-01 10:30:00'),   -- password: password123
('charlie_whale', 'charlie@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBdXzogKLzGAu6', '2025-08-02 08:15:00'), -- password: password123
('diana_scalper', 'diana@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBdXzogKLzGAu6', '2025-08-02 14:20:00'), -- password: password123
('eve_hodler', 'eve@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBdXzogKLzGAu6', '2025-08-03 11:45:00'),   -- password: password123
('frank_day_trader', 'frank@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBdXzogKLzGAu6', '2025-08-03 16:30:00'), -- password: password123
('grace_swing', 'grace@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBdXzogKLzGAu6', '2025-08-04 09:15:00'), -- password: password123
('henry_arbitrage', 'henry@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBdXzogKLzGAu6', '2025-08-04 13:00:00'); -- password: password123

-- Insert user balances (giving users realistic starting balances)
INSERT INTO `balances` (`user_id`, `asset`, `available`, `reserved`) VALUES
-- Alice (user_id: 1)
(1, 'USD', 50000.00000000, 0.00000000),
(1, 'BTC', 2.50000000, 0.00000000),
(1, 'ETH', 15.75000000, 0.00000000),
(1, 'AAPL', 100.00000000, 0.00000000),

-- Bob (user_id: 2)
(2, 'USD', 75000.00000000, 0.00000000),
(2, 'BTC', 1.25000000, 0.00000000),
(2, 'ETH', 25.50000000, 0.00000000),
(2, 'AAPL', 250.00000000, 0.00000000),

-- Charlie (user_id: 3) - Whale with large balances
(3, 'USD', 500000.00000000, 0.00000000),
(3, 'BTC', 15.00000000, 0.00000000),
(3, 'ETH', 200.00000000, 0.00000000),
(3, 'AAPL', 2000.00000000, 0.00000000),

-- Diana (user_id: 4)
(4, 'USD', 25000.00000000, 0.00000000),
(4, 'BTC', 0.75000000, 0.00000000),
(4, 'ETH', 8.25000000, 0.00000000),
(4, 'AAPL', 150.00000000, 0.00000000),

-- Eve (user_id: 5)
(5, 'USD', 100000.00000000, 0.00000000),
(5, 'BTC', 3.00000000, 0.00000000),
(5, 'ETH', 45.00000000, 0.00000000),
(5, 'AAPL', 500.00000000, 0.00000000),

-- Frank (user_id: 6)
(6, 'USD', 35000.00000000, 0.00000000),
(6, 'BTC', 1.50000000, 0.00000000),
(6, 'ETH', 20.00000000, 0.00000000),
(6, 'AAPL', 300.00000000, 0.00000000),

-- Grace (user_id: 7)
(7, 'USD', 80000.00000000, 0.00000000),
(7, 'BTC', 2.75000000, 0.00000000),
(7, 'ETH', 35.50000000, 0.00000000),
(7, 'AAPL', 400.00000000, 0.00000000),

-- Henry (user_id: 8)
(8, 'USD', 150000.00000000, 0.00000000),
(8, 'BTC', 5.25000000, 0.00000000),
(8, 'ETH', 75.00000000, 0.00000000),
(8, 'AAPL', 800.00000000, 0.00000000);

-- Insert active orders (mix of buy and sell orders at different price levels)
INSERT INTO `orders` (`user_id`, `symbol`, `side`, `price`, `quantity`, `filled_quantity`, `status`, `created_at`) VALUES
-- BTC/USD orders
(1, 'BTCUSD', 'BUY', 65000.00, 0.5000, 0.0000, 'PENDING', '2025-08-07 08:15:00'),
(2, 'BTCUSD', 'BUY', 64800.00, 0.2500, 0.0000, 'PENDING', '2025-08-07 08:30:00'),
(3, 'BTCUSD', 'BUY', 64500.00, 1.0000, 0.0000, 'PENDING', '2025-08-07 08:45:00'),
(4, 'BTCUSD', 'BUY', 64200.00, 0.1500, 0.0000, 'PENDING', '2025-08-07 09:00:00'),
(5, 'BTCUSD', 'BUY', 64000.00, 0.7500, 0.0000, 'PENDING', '2025-08-07 09:15:00'),

(6, 'BTCUSD', 'SELL', 65500.00, 0.3000, 0.0000, 'PENDING', '2025-08-07 08:20:00'),
(7, 'BTCUSD', 'SELL', 65800.00, 0.4500, 0.0000, 'PENDING', '2025-08-07 08:35:00'),
(8, 'BTCUSD', 'SELL', 66000.00, 0.6000, 0.0000, 'PENDING', '2025-08-07 08:50:00'),
(1, 'BTCUSD', 'SELL', 66200.00, 0.2000, 0.0000, 'PENDING', '2025-08-07 09:05:00'),
(3, 'BTCUSD', 'SELL', 66500.00, 1.2000, 0.0000, 'PENDING', '2025-08-07 09:20:00'),

-- ETH/USD orders
(2, 'ETHUSD', 'BUY', 3200.00, 2.5000, 0.0000, 'PENDING', '2025-08-07 08:25:00'),
(4, 'ETHUSD', 'BUY', 3180.00, 1.7500, 0.0000, 'PENDING', '2025-08-07 08:40:00'),
(6, 'ETHUSD', 'BUY', 3150.00, 3.0000, 0.0000, 'PENDING', '2025-08-07 08:55:00'),
(8, 'ETHUSD', 'BUY', 3120.00, 2.2500, 0.0000, 'PENDING', '2025-08-07 09:10:00'),
(1, 'ETHUSD', 'BUY', 3100.00, 1.5000, 0.0000, 'PENDING', '2025-08-07 09:25:00'),

(3, 'ETHUSD', 'SELL', 3250.00, 4.0000, 0.0000, 'PENDING', '2025-08-07 08:18:00'),
(5, 'ETHUSD', 'SELL', 3280.00, 2.7500, 0.0000, 'PENDING', '2025-08-07 08:33:00'),
(7, 'ETHUSD', 'SELL', 3300.00, 3.5000, 0.0000, 'PENDING', '2025-08-07 08:48:00'),
(2, 'ETHUSD', 'SELL', 3320.00, 1.8000, 0.0000, 'PENDING', '2025-08-07 09:03:00'),
(4, 'ETHUSD', 'SELL', 3350.00, 2.2000, 0.0000, 'PENDING', '2025-08-07 09:18:00'),

-- AAPL orders
(1, 'AAPL', 'BUY', 185.50, 50.0000, 0.0000, 'PENDING', '2025-08-07 08:12:00'),
(3, 'AAPL', 'BUY', 185.25, 100.0000, 0.0000, 'PENDING', '2025-08-07 08:27:00'),
(5, 'AAPL', 'BUY', 185.00, 75.0000, 0.0000, 'PENDING', '2025-08-07 08:42:00'),
(7, 'AAPL', 'BUY', 184.75, 200.0000, 0.0000, 'PENDING', '2025-08-07 08:57:00'),
(2, 'AAPL', 'BUY', 184.50, 125.0000, 0.0000, 'PENDING', '2025-08-07 09:12:00'),

(4, 'AAPL', 'SELL', 186.00, 80.0000, 0.0000, 'PENDING', '2025-08-07 08:22:00'),
(6, 'AAPL', 'SELL', 186.25, 60.0000, 0.0000, 'PENDING', '2025-08-07 08:37:00'),
(8, 'AAPL', 'SELL', 186.50, 150.0000, 0.0000, 'PENDING', '2025-08-07 08:52:00'),
(3, 'AAPL', 'SELL', 186.75, 90.0000, 0.0000, 'PENDING', '2025-08-07 09:07:00'),
(5, 'AAPL', 'SELL', 187.00, 110.0000, 0.0000, 'PENDING', '2025-08-07 09:22:00'),

-- Some partially filled orders
(1, 'BTCUSD', 'BUY', 64900.00, 1.0000, 0.3000, 'PARTIAL', '2025-08-07 07:30:00'),
(2, 'ETHUSD', 'SELL', 3220.00, 5.0000, 2.5000, 'PARTIAL', '2025-08-07 07:45:00'),
(4, 'AAPL', 'BUY', 185.75, 200.0000, 100.0000, 'PARTIAL', '2025-08-07 07:20:00');

-- Insert some completed orders (for transaction history)
INSERT INTO `orders` (`user_id`, `symbol`, `side`, `price`, `quantity`, `filled_quantity`, `status`, `created_at`, `updated_at`) VALUES
-- Filled orders from earlier today
(1, 'BTCUSD', 'BUY', 64700.00, 0.5000, 0.5000, 'FILLED', '2025-08-07 06:00:00', '2025-08-07 06:15:00'),
(2, 'BTCUSD', 'SELL', 64700.00, 0.5000, 0.5000, 'FILLED', '2025-08-07 06:10:00', '2025-08-07 06:15:00'),

(3, 'ETHUSD', 'BUY', 3190.00, 2.0000, 2.0000, 'FILLED', '2025-08-07 06:30:00', '2025-08-07 06:45:00'),
(4, 'ETHUSD', 'SELL', 3190.00, 2.0000, 2.0000, 'FILLED', '2025-08-07 06:35:00', '2025-08-07 06:45:00'),

(5, 'AAPL', 'BUY', 185.25, 100.0000, 100.0000, 'FILLED', '2025-08-07 07:00:00', '2025-08-07 07:10:00'),
(6, 'AAPL', 'SELL', 185.25, 100.0000, 100.0000, 'FILLED', '2025-08-07 07:05:00', '2025-08-07 07:10:00'),

-- Filled orders from yesterday
(7, 'BTCUSD', 'BUY', 64500.00, 1.0000, 1.0000, 'FILLED', '2025-08-06 14:00:00', '2025-08-06 14:20:00'),
(8, 'BTCUSD', 'SELL', 64500.00, 1.0000, 1.0000, 'FILLED', '2025-08-06 14:15:00', '2025-08-06 14:20:00'),

(2, 'ETHUSD', 'BUY', 3170.00, 3.0000, 3.0000, 'FILLED', '2025-08-06 15:30:00', '2025-08-06 15:45:00'),
(3, 'ETHUSD', 'SELL', 3170.00, 3.0000, 3.0000, 'FILLED', '2025-08-06 15:35:00', '2025-08-06 15:45:00'),

-- Some cancelled orders
(1, 'BTCUSD', 'BUY', 63000.00, 1.0000, 0.0000, 'CANCELLED', '2025-08-06 10:00:00', '2025-08-06 16:00:00'),
(4, 'ETHUSD', 'SELL', 3500.00, 2.0000, 0.0000, 'CANCELLED', '2025-08-06 11:00:00', '2025-08-06 17:00:00');

-- Insert transaction history (completed trades)
INSERT INTO `transactions` (`buy_order_id`, `sell_order_id`, `symbol`, `price`, `quantity`, `executed_at`) VALUES
-- Today's transactions
(29, 30, 'BTCUSD', 64700.00, 0.5000, '2025-08-07 06:15:00'),
(31, 32, 'ETHUSD', 3190.00, 2.0000, '2025-08-07 06:45:00'),
(33, 34, 'AAPL', 185.25, 100.0000, '2025-08-07 07:10:00'),

-- Partial fills for current orders
(27, 2, 'BTCUSD', 64900.00, 0.3000, '2025-08-07 07:35:00'), -- Partial fill for order 27
(2, 18, 'ETHUSD', 3220.00, 2.5000, '2025-08-07 07:50:00'),  -- Partial fill for order 18
(28, 22, 'AAPL', 185.75, 100.0000, '2025-08-07 07:25:00'),  -- Partial fill for order 28

-- Yesterday's transactions
(35, 36, 'BTCUSD', 64500.00, 1.0000, '2025-08-06 14:20:00'),
(37, 38, 'ETHUSD', 3170.00, 3.0000, '2025-08-06 15:45:00'),

-- Some older transactions for history
(7, 6, 'BTCUSD', 65500.00, 0.3000, '2025-08-05 10:30:00'),
(15, 16, 'ETHUSD', 3250.00, 1.5000, '2025-08-05 11:45:00'),
(23, 22, 'AAPL', 186.00, 50.0000, '2025-08-05 14:20:00'),

-- More historical data
(3, 8, 'BTCUSD', 66000.00, 0.6000, '2025-08-04 16:15:00'),
(14, 17, 'ETHUSD', 3280.00, 2.0000, '2025-08-04 12:30:00'),
(21, 24, 'AAPL', 186.25, 75.0000, '2025-08-04 09:45:00');

-- Update balances to reflect reserved amounts for pending orders
-- (This would normally be handled by the application, but for demo purposes)
UPDATE `balances` SET 
    `available` = `available` - 32500.00,  -- 0.5 * 65000
    `reserved` = `reserved` + 32500.00
WHERE `user_id` = 1 AND `asset` = 'USD';

UPDATE `balances` SET 
    `available` = `available` - 0.3000,
    `reserved` = `reserved` + 0.3000
WHERE `user_id` = 6 AND `asset` = 'BTC';

UPDATE `balances` SET 
    `available` = `available` - 8000.00,  -- 2.5 * 3200
    `reserved` = `reserved` + 8000.00
WHERE `user_id` = 2 AND `asset` = 'USD';

UPDATE `balances` SET 
    `available` = `available` - 4.0000,
    `reserved` = `reserved` + 4.0000
WHERE `user_id` = 3 AND `asset` = 'ETH';

UPDATE `balances` SET 
    `available` = `available` - 9275.00,  -- 50 * 185.5
    `reserved` = `reserved` + 9275.00
WHERE `user_id` = 1 AND `asset` = 'USD';

UPDATE `balances` SET 
    `available` = `available` - 80.0000,
    `reserved` = `reserved` + 80.0000
WHERE `user_id` = 4 AND `asset` = 'AAPL';

-- Add some volume and price history simulation with more transactions
INSERT INTO `transactions` (`buy_order_id`, `sell_order_id`, `symbol`, `price`, `quantity`, `executed_at`) VALUES
-- BTC price movement simulation
(1, 6, 'BTCUSD', 65250.00, 0.1000, '2025-08-07 06:00:00'),
(2, 7, 'BTCUSD', 65300.00, 0.1500, '2025-08-07 06:30:00'),
(3, 8, 'BTCUSD', 65100.00, 0.2000, '2025-08-07 07:00:00'),
(4, 9, 'BTCUSD', 65400.00, 0.1000, '2025-08-07 07:30:00'),

-- ETH price movement simulation
(11, 16, 'ETHUSD', 3225.00, 0.5000, '2025-08-07 06:15:00'),
(12, 17, 'ETHUSD', 3210.00, 1.0000, '2025-08-07 06:45:00'),
(13, 18, 'ETHUSD', 3235.00, 0.7500, '2025-08-07 07:15:00'),
(14, 19, 'ETHUSD', 3220.00, 0.8000, '2025-08-07 07:45:00'),

-- AAPL trading activity
(21, 24, 'AAPL', 185.80, 25.0000, '2025-08-07 06:20:00'),
(22, 25, 'AAPL', 185.60, 40.0000, '2025-08-07 06:50:00'),
(23, 26, 'AAPL', 185.90, 30.0000, '2025-08-07 07:20:00');

-- Create a view for easy market data access (optional)
CREATE OR REPLACE VIEW `market_summary` AS
SELECT 
    o.symbol,
    COUNT(CASE WHEN o.side = 'BUY' AND o.status IN ('PENDING', 'PARTIAL') THEN 1 END) as active_buy_orders,
    COUNT(CASE WHEN o.side = 'SELL' AND o.status IN ('PENDING', 'PARTIAL') THEN 1 END) as active_sell_orders,
    MAX(CASE WHEN o.side = 'BUY' AND o.status IN ('PENDING', 'PARTIAL') THEN o.price END) as highest_bid,
    MIN(CASE WHEN o.side = 'SELL' AND o.status IN ('PENDING', 'PARTIAL') THEN o.price END) as lowest_ask,
    (SELECT t.price FROM transactions t WHERE t.symbol = o.symbol ORDER BY t.executed_at DESC LIMIT 1) as last_price,
    (SELECT SUM(t.quantity) FROM transactions t WHERE t.symbol = o.symbol AND DATE(t.executed_at) = CURDATE()) as daily_volume
FROM orders o
GROUP BY o.symbol
ORDER BY o.symbol;

-- Display summary
SELECT 'Dummy data insertion completed!' as status;
SELECT 'Users created:', COUNT(*) as count FROM users;
SELECT 'Orders created:', COUNT(*) as count FROM orders;
SELECT 'Transactions created:', COUNT(*) as count FROM transactions;
SELECT 'Balance records created:', COUNT(*) as count FROM balances;

-- Show market summary
SELECT * FROM market_summary;
