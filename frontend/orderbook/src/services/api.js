import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; 

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

// Enhanced response interceptor with detailed error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Create a more detailed error object
        const enhancedError = new Error();
        
        if (error.code === 'ECONNABORTED') {
            enhancedError.message = 'Request timeout - please check if the backend server is running';
            enhancedError.type = 'TIMEOUT';
        } else if (error.response?.status === 404) {
            enhancedError.message = 'API endpoint not found - please check your backend API';
            enhancedError.type = 'NOT_FOUND';
        } else if (error.response?.status >= 500) {
            enhancedError.message = 'Server error - please try again later';
            enhancedError.type = 'SERVER_ERROR';
        } else if (error.message.includes('Network Error')) {
            enhancedError.message = 'Cannot connect to server - please check if backend is running on http://localhost:5000';
            enhancedError.type = 'NETWORK_ERROR';
        } else if (error.response?.status >= 400) {
            enhancedError.message = error.response?.data?.error || 'Client error - please check your request';
            enhancedError.type = 'CLIENT_ERROR';
        } else {
            enhancedError.message = `API Error: ${error.message}`;
            enhancedError.type = 'UNKNOWN_ERROR';
        }
        
        enhancedError.originalError = error;
        enhancedError.status = error.response?.status;
        
        console.error('API Error:', enhancedError);
        return Promise.reject(enhancedError);
    }
);

// Normalize API response data
const normalizeResponse = (data) => {
    // Handle different response formats that the backend might send
    if (Array.isArray(data)) {
        return data;
    } else if (data && Array.isArray(data.orders)) {
        return data.orders;
    } else if (data && Array.isArray(data.data)) {
        return data.data;
    } else if (data && typeof data === 'object') {
        // Single object response
        return data;
    } else {
        throw new Error('Invalid data format received from API');
    }
};

export const fetchOrderBook = async () => {
    try {
        const response = await api.get("/orders");
        return normalizeResponse(response.data);
    } catch (error) {
        // Error is already enhanced by the interceptor
        throw error;
    }
}

export const placeOrder = async (orderData) => {
    try {
        // Validate required fields before sending
        const requiredFields = ['symbol', 'side', 'price', 'quantity'];
        for (const field of requiredFields) {
            if (!orderData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate data types
        if (isNaN(orderData.price) || isNaN(orderData.quantity)) {
            throw new Error('Price and quantity must be valid numbers');
        }

        if (orderData.price <= 0 || orderData.quantity <= 0) {
            throw new Error('Price and quantity must be positive');
        }

        if (!['BUY', 'SELL', 'buy', 'sell'].includes(orderData.side)) {
            throw new Error('Side must be BUY or SELL');
        }

        const response = await api.post("/orders", {
            ...orderData,
            side: orderData.side.toUpperCase(),
            symbol: orderData.symbol.toUpperCase()
        });
        
        return normalizeResponse(response.data);
    } catch (error) {
        throw error;
    }
}

export const cancelOrder = async (orderId) => {
    try {
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        const response = await api.delete(`/orders/${orderId}`);
        return normalizeResponse(response.data);
    } catch (error) {
        throw error;
    }
}

export const updateOrder = async (orderId, orderData) => {
    try {
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        const response = await api.put(`/orders/${orderId}`, orderData);
        return normalizeResponse(response.data);
    } catch (error) {
        throw error;
    }
}

export const getOrderById = async (orderId) => {
    try {
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        const response = await api.get(`/orders/${orderId}`);
        return normalizeResponse(response.data);
    } catch (error) {
        throw error;
    }
}

export const getOrderBookBySymbol = async (symbol) => {
    try {
        if (!symbol) {
            throw new Error('Symbol is required');
        }

        const response = await api.get(`/orderbook/${symbol.toUpperCase()}`);
        return normalizeResponse(response.data);
    } catch (error) {
        throw error;
    }
}

// Get all orders for a user
// not implemented on the backend yet
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
// not implemented on the backend yet
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
