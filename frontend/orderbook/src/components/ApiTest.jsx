import React, { useState } from 'react';
import { fetchOrderBook, placeOrder, cancelOrder, updateOrder } from '../services/api';

function ApiTest() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [deleteId, setDeleteId] = useState('');
    const [updateId, setUpdateId] = useState('');
    const [updateData, setUpdateData] = useState({
        symbol: 'MSFT',
        side: 'sell',
        price: 280.00,
        quantity: 75
    });

    // Test 1: Fetch Orders
    const testFetchOrders = async () => {
        setLoading(true);
        setMessage('');
        try {
            const data = await fetchOrderBook();
            setOrders(data);
            setMessage(`✅ Fetched ${data.length} orders`);
        } catch (error) {
            setMessage(`❌ Fetch Error: ${error.message}`);
        }
        setLoading(false);
    };

    // Test 2: Place Order
    const testPlaceOrder = async () => {
        setMessage('');
        try {
            const newOrder = {
                symbol: 'AAPL',
                side: 'buy',
                price: 175.50,
                quantity: 100
            };
            const result = await placeOrder(newOrder);
            setMessage(`✅ Order created! ID: ${result.id}`);
            testFetchOrders(); // Refresh orders
        } catch (error) {
            setMessage(`❌ Place Error: ${error.message}`);
        }
    };

    // Test 3: Cancel/Delete Order
    const testDeleteOrder = async () => {
        if (!deleteId) {
            setMessage('❌ Please enter an order ID to delete');
            return;
        }
        
        setMessage('');
        try {
            await cancelOrder(deleteId);
            setMessage(`✅ Order ${deleteId} deleted successfully!`);
            setDeleteId(''); // Clear input
            testFetchOrders(); // Refresh orders
        } catch (error) {
            setMessage(`❌ Delete Error: ${error.message}`);
        }
    };

    // Test 4: Update Order
    const testUpdateOrder = async () => {
        if (!updateId) {
            setMessage('❌ Please enter an order ID to update');
            return;
        }
        
        setMessage('');
        try {
            await updateOrder(updateId, updateData);
            setMessage(`✅ Order ${updateId} updated successfully!`);
            testFetchOrders(); // Refresh orders
        } catch (error) {
            setMessage(`❌ Update Error: ${error.message}`);
        }
    };

    // Quick delete from order list
    const deleteOrderById = async (orderId) => {
        setMessage('');
        try {
            await cancelOrder(orderId);
            setMessage(`✅ Order ${orderId} deleted successfully!`);
            testFetchOrders(); // Refresh orders
        } catch (error) {
            setMessage(`❌ Delete Error: ${error.message}`);
        }
    };

    return (
        <div className="api-test">
            <h3>API Testing</h3>
            
            {/* Test 1: Fetch Orders */}
            <div className="test-section">
                <h4>1. Fetch Orders Test</h4>
                <button onClick={testFetchOrders} disabled={loading}>
                    {loading ? 'Loading...' : 'Fetch Orders'}
                </button>
            </div>

            {/* Test 2: Place Order */}
            <div className="test-section">
                <h4>2. Place Order Test</h4>
                <p>Creates: AAPL, buy, $175.50, 100 shares</p>
                <button onClick={testPlaceOrder}>
                    Place Test Order
                </button>
            </div>

            {/* Test 3: Delete Order */}
            <div className="test-section">
                <h4>3. Delete Order Test</h4>
                <div className="input-group">
                    <input 
                        type="number" 
                        placeholder="Enter Order ID"
                        value={deleteId}
                        onChange={(e) => setDeleteId(e.target.value)}
                    />
                    <button onClick={testDeleteOrder}>
                        Delete Order
                    </button>
                </div>
            </div>

            {/* Test 4: Update Order */}
            <div className="test-section">
                <h4>4. Update Order Test</h4>
                <div className="input-group">
                    <input 
                        type="number" 
                        placeholder="Order ID to update"
                        value={updateId}
                        onChange={(e) => setUpdateId(e.target.value)}
                    />
                    <div className="update-inputs">
                        <input 
                            placeholder="Symbol"
                            value={updateData.symbol}
                            onChange={(e) => setUpdateData({...updateData, symbol: e.target.value})}
                        />
                        <select 
                            value={updateData.side}
                            onChange={(e) => setUpdateData({...updateData, side: e.target.value})}
                        >
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                        </select>
                        <input 
                            type="number" 
                            step="0.01"
                            placeholder="Price"
                            value={updateData.price}
                            onChange={(e) => setUpdateData({...updateData, price: parseFloat(e.target.value)})}
                        />
                        <input 
                            type="number" 
                            placeholder="Quantity"
                            value={updateData.quantity}
                            onChange={(e) => setUpdateData({...updateData, quantity: parseInt(e.target.value)})}
                        />
                    </div>
                    <button onClick={testUpdateOrder}>
                        Update Order
                    </button>
                </div>
            </div>

            {/* Message Display */}
            {message && <div className="message">{message}</div>}

            {/* Orders Display */}
            <h4>Orders ({orders.length}):</h4>

            {orders.length > 0 ? (
                <div className="orders-table">
                    <div className="order-header">
                        <span>ID</span>
                        <span>Symbol</span>
                        <span>Side</span>
                        <span>Price</span>
                        <span>Quantity</span>
                        <span>Actions</span>
                    </div>
                    {orders.map(order => (
                        <div key={order.id} className="order-row">
                            <span>{order.id}</span>
                            <span>{order.symbol}</span>
                            <span className={order.side}>{order.side.toUpperCase()}</span>
                            <span>${order.price}</span>
                            <span>{order.quantity}</span>
                            <button 
                                className="delete-btn"
                                onClick={() => deleteOrderById(order.id)}
                            >
                                ❌ Delete
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-orders">No orders found</div>
            )}
        </div>
    );
}

export default ApiTest;