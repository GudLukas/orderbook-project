import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; 

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
    (config) => {
        // Add auth token here if needed
        // config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const fetchOrderBook = async () => {
    try {
        const response = await api.get("/orderbook");
        return response.data;
    } catch (error) {
        console.error('Error fetching order book:', error);
        throw error;
    }
}

export const placeOrder = async (order) => {
    try {
        const response = await api.post("/order", order);
        return response.data;
    } catch (error) {
        console.error('Error placing order:', error);
        throw error;
    }
}

export const cancelOrder = async (orderId) => {
    try {
        const response = await api.delete(`/order/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error canceling order:', error);
        throw error;
    }
}

// Get all orders for a user
export const getUserOrders = async () => {
    try {
        const response = await api.get('/orders');
        return response.data;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
}

// Get market data/prices
export const getMarketData = async () => {
    try {
        const response = await api.get('/market');
        return response.data;
    } catch (error) {
        console.error('Error fetching market data:', error);
        throw error;
    }
}

export default api;
