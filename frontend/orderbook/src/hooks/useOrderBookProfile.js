import { useState, useEffect } from 'react';
import { getUserOrders, cancelOrder, updateOrder, getUserBalances } from '../services/api';

export const useOrderBookProfile = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [balances, setBalances] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [orderMessage, setOrderMessage] = useState({ type: '', text: '' });
    const [balanceMessage, setBalanceMessage] = useState({ type: '', text: '' });

    const getCurrentUser = () => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    };

    const loadUserData = async () => {
        try {
            setLoading(true);
            const currentUser = getCurrentUser();
            setUser(currentUser);

            // Load user orders with better error handling
            try {
                const userOrders = await getUserOrders();
                console.log('Received orders:', userOrders); // Debug log

                // Ensure orders is always an array
                if (Array.isArray(userOrders)) {
                    setOrders(userOrders);
                } else if (userOrders && userOrders.orders && Array.isArray(userOrders.orders)) {
                    setOrders(userOrders.orders);
                } else if (userOrders && userOrders.data && Array.isArray(userOrders.data)) {
                    setOrders(userOrders.data);
                } else {
                    console.warn('Orders data is not an array:', userOrders);
                    setOrders([]);
                }
            } catch (orderError) {
                console.error('Error loading orders:', orderError);
                setOrders([]); // Ensure orders is an empty array on error
                setOrderMessage({ type: 'error', text: 'Failed to load orders' });
            }

            // Load user balances from backend
            try {
                const userBalances = await getUserBalances();
                console.log('Received balances:', userBalances); // Debug log
                setBalances(userBalances);
            } catch (balanceError) {
                console.error('Error loading balances:', balanceError);
                // Set empty balances on error
                setBalances({});
                setBalanceMessage({ type: 'error', text: 'Failed to load balances' });
            }

        } catch (error) {
            console.error('Error loading user data:', error);
            setOrders([]); // Ensure orders is an empty array on error
            setOrderMessage({ type: 'error', text: 'Failed to load user data' });
        } finally {
            setLoading(false);
        }
    };

    const refreshOrders = async () => {
        try {
            const userOrders = await getUserOrders();
            console.log('Refreshed orders:', userOrders); // Debug log

            // Ensure orders is always an array
            if (Array.isArray(userOrders)) {
                setOrders(userOrders);
            } else if (userOrders && userOrders.orders && Array.isArray(userOrders.orders)) {
                setOrders(userOrders.orders);
            } else if (userOrders && userOrders.data && Array.isArray(userOrders.data)) {
                setOrders(userOrders.data);
            } else {
                console.warn('Orders data is not an array:', userOrders);
                setOrders([]);
            }
            
            setOrderMessage({ type: 'success', text: 'Orders refreshed successfully' });
        } catch (orderError) {
            console.error('Error refreshing orders:', orderError);
            setOrderMessage({ type: 'error', text: 'Failed to refresh orders' });
        }
    };

    const refreshBalances = async () => {
        try {
            const userBalances = await getUserBalances();
            console.log('Refreshed balances:', userBalances); // Debug log
            setBalances(userBalances);
            setBalanceMessage({ type: 'success', text: 'Balances refreshed successfully' });
        } catch (balanceError) {
            console.error('Error refreshing balances:', balanceError);
            setBalanceMessage({ type: 'error', text: 'Failed to refresh balances' });
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            await cancelOrder(orderId);
            setOrderMessage({ type: 'success', text: 'Order cancelled successfully' });
            refreshOrders(); // Refresh only orders
            refreshBalances(); // Also refresh balances since cancellation releases reserved amounts
        } catch (error) {
            console.error('Error cancelling order:', error);
            setOrderMessage({ type: 'error', text: 'Failed to cancel order' });
        }
    };

    const handleEditOrder = (order) => {
        setEditingOrder(order.id);
        setEditForm({
            symbol: order.symbol,
            side: order.side,
            quantity: order.quantity,
            price: order.price
        });
    };

    const handleUpdateOrder = async (orderId) => {
        try {
            // Make sure all required fields are included
            const updateData = {
                symbol: editForm.symbol,
                side: editForm.side,
                quantity: parseFloat(editForm.quantity),
                price: parseFloat(editForm.price)
            };

            await updateOrder(orderId, updateData);
            setOrderMessage({ type: 'success', text: 'Order updated successfully' });
            setEditingOrder(null);
            setEditForm({});
            refreshOrders(); // Refresh only orders
            refreshBalances(); // Also refresh balances since update may change reservations
        } catch (error) {
            console.error('Error updating order:', error);
            setOrderMessage({ type: 'error', text: error.message || 'Failed to update order' });
        }
    };

    const handleCancelEdit = () => {
        setEditingOrder(null);
        setEditForm({});
    };

    const handleFormChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return 'text-yellow-600 bg-yellow-100';
            case 'FILLED':
                return 'text-green-600 bg-green-100';
            case 'CANCELLED':
                return 'text-red-600 bg-red-100';
            case 'PARTIAL':
                return 'text-blue-600 bg-blue-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getSideColor = (side) => {
        return side?.toUpperCase() === 'BUY'
            ? 'text-green-600 bg-green-100'
            : 'text-red-600 bg-red-100';
    };

    useEffect(() => {
        loadUserData();
    }, []);

    return {
        // State
        user,
        orders,
        balances,
        loading,
        editingOrder,
        editForm,
        orderMessage,
        balanceMessage,
        
        // Functions
        refreshOrders,
        refreshBalances,
        handleCancelOrder,
        handleEditOrder,
        handleUpdateOrder,
        handleCancelEdit,
        handleFormChange,
        getStatusColor,
        getSideColor
    };
};
