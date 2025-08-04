import React, { useState, useEffect, useCallback } from 'react';
import { fetchOrderBook } from '../services/api';
import './OrderBookGrid.css';

function OrderBookGrid() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadOrders = useCallback(async () => {
        try {
            setError('');
            const data = await fetchOrderBook();
            
            // Handle different response formats
            let ordersArray = [];
            if (Array.isArray(data)) {
                ordersArray = data;
            } else if (data && Array.isArray(data.orders)) {
                ordersArray = data.orders;
            } else if (data && Array.isArray(data.data)) {
                ordersArray = data.data;
            } else {
                setError('Invalid data format received from API');
                return;
            }

            setOrders(ordersArray);
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                setError('Request timeout - please check if the backend server is running');
            } else if (err.response?.status === 404) {
                setError('Orders endpoint not found - please check your backend API');
            } else if (err.response?.status >= 500) {
                setError('Server error - please try again later');
            } else if (err.message.includes('Network Error')) {
                setError('Cannot connect to server - please check if backend is running on http://localhost:5000');
            } else {
                setError(`Failed to load orders: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 5000);
        return () => clearInterval(interval);
    }, [loadOrders]);

    // Separate orders by side and sort appropriately
    const bids = orders
        .filter(order => order.side && order.side.toLowerCase() === 'buy')
        .sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

    const asks = orders
        .filter(order => order.side && order.side.toLowerCase() === 'sell')
        .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

    // Group orders by price level
    const groupOrdersByPrice = (ordersList) => {
        const grouped = {};
        ordersList.forEach(order => {
            const price = parseFloat(order.price).toString();
            if (!grouped[price]) {
                grouped[price] = {
                    price: parseFloat(order.price),
                    totalQuantity: 0,
                    orders: []
                };
            }
            grouped[price].totalQuantity += parseInt(order.quantity);
            grouped[price].orders.push(order);
        });
        return Object.values(grouped);
    };

    const groupedBids = groupOrdersByPrice(bids);
    const groupedAsks = groupOrdersByPrice(asks);

    if (loading) {
        return (
            <div className="orderbook-loading">
                <div>Loading order book...</div>
            </div>
        );
    }

    return (
        <div className="orderbook-container">
            <div className="orderbook-header">
                <h2>Order Book</h2>
                <div className="header-controls">
                    <button onClick={loadOrders} className="refresh-btn" disabled={loading}>
                        {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
                    </button>
                    <div className="connection-status">
                        {error ? (
                            <span className="status-error">❌ Connection Error</span>
                        ) : (
                            <span className="status-connected">✅ Connected</span>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="orderbook-summary">
                <div className="summary-item">
                    <span className="summary-label">Total Orders:</span>
                    <span className="summary-value">{orders.length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Buy Orders:</span>
                    <span className="summary-value buy-count">{bids.length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Sell Orders:</span>
                    <span className="summary-value sell-count">{asks.length}</span>
                </div>
            </div>

            <div className="orderbook-grid">
                {/* Bids Section (Left) */}
                <div className="bids-section">
                    <div className="section-header bids-header">
                        <h3>Bids (Buy Orders)</h3>
                        <div className="order-count-badge">{bids.length}</div>
                    </div>
                    
                    <div className="table-header">
                        <span>Price</span>
                        <span>Quantity</span>
                        <span>Total Value</span>
                        <span>Orders</span>
                    </div>

                    <div className="orders-list">
                        {groupedBids.length > 0 ? (
                            groupedBids.map((priceLevel, index) => (
                                <div key={`bid-${priceLevel.price}`} className="price-level bid-level">
                                    <span className="price">${priceLevel.price.toFixed(2)}</span>
                                    <span className="quantity">{priceLevel.totalQuantity.toLocaleString()}</span>
                                    <span className="total">${(priceLevel.price * priceLevel.totalQuantity).toLocaleString()}</span>
                                    <span className="order-count">{priceLevel.orders.length}</span>
                                    
                                    {/* Show individual orders at this price level on hover */}
                                    <div className="individual-orders">
                                        {priceLevel.orders.map(order => (
                                            <div key={order.id} className="individual-order">
                                                <small>#{order.id} • {order.symbol} • {order.quantity} shares</small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-orders">No buy orders available</div>
                        )}
                    </div>
                </div>

                {/* Market Spread */}
                <div className="spread-section">
                    <div className="spread-info">
                        {groupedAsks.length > 0 && groupedBids.length > 0 ? (
                            <>
                                <div className="best-price best-ask">
                                    <span className="price-label">Best Ask</span>
                                    <span className="price-value">${groupedAsks[0].price.toFixed(2)}</span>
                                </div>
                                <div className="spread-display">
                                    <div className="spread-label">Market Spread</div>
                                    <div className="spread-value">
                                        ${(groupedAsks[0].price - groupedBids[0].price).toFixed(2)}
                                    </div>
                                    <div className="spread-percent">
                                        {(((groupedAsks[0].price - groupedBids[0].price) / groupedBids[0].price) * 100).toFixed(2)}%
                                    </div>
                                </div>
                                <div className="best-price best-bid">
                                    <span className="price-label">Best Bid</span>
                                    <span className="price-value">${groupedBids[0].price.toFixed(2)}</span>
                                </div>
                            </>
                        ) : (
                            <div className="no-spread">
                                <div className="no-spread-title">No Market Available</div>
                                <div className="no-spread-details">
                                    {groupedBids.length === 0 && <span>• No buy orders</span>}
                                    {groupedAsks.length === 0 && <span>• No sell orders</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Asks Section (Right) */}
                <div className="asks-section">
                    <div className="section-header asks-header">
                        <h3>Asks (Sell Orders)</h3>
                        <div className="order-count-badge">{asks.length}</div>
                    </div>
                    
                    <div className="table-header">
                        <span>Price</span>
                        <span>Quantity</span>
                        <span>Total Value</span>
                        <span>Orders</span>
                    </div>

                    <div className="orders-list">
                        {groupedAsks.length > 0 ? (
                            groupedAsks.map((priceLevel, index) => (
                                <div key={`ask-${priceLevel.price}`} className="price-level ask-level">
                                    <span className="price">${priceLevel.price.toFixed(2)}</span>
                                    <span className="quantity">{priceLevel.totalQuantity.toLocaleString()}</span>
                                    <span className="total">${(priceLevel.price * priceLevel.totalQuantity).toLocaleString()}</span>
                                    <span className="order-count">{priceLevel.orders.length}</span>
                                    
                                    {/* Show individual orders at this price level on hover */}
                                    <div className="individual-orders">
                                        {priceLevel.orders.map(order => (
                                            <div key={order.id} className="individual-order">
                                                <small>#{order.id} • {order.symbol} • {order.quantity} shares</small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-orders">No sell orders available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderBookGrid;