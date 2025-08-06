import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-logout on authentication endpoints or specific 401 cases
    if (error.response?.status === 401) {
      const url = error.config?.url;
      
      // Don't auto-logout on order operations - let component handle it
      if (url?.includes('/orders') && !url?.includes('/user/orders')) {
        return Promise.reject(error);
      }
      
      // Auto-logout for login/user endpoints
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

// Normalize API response data
const normalizeResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.orders)) {
    return data.orders;
  } else if (data && Array.isArray(data.data)) {
    return data.data;
  } else if (data && typeof data === "object") {
    return data;
  } else {
    throw new Error("Invalid data format received from API");
  }
};

export const fetchOrderBook = async () => {
  try {
    const response = await api.get("/orders");
    return normalizeResponse(response.data);
  } catch (error) {
    throw error;
  }
};

export const placeOrder = async (orderData) => {
  try {
    // Validate required fields - price is NOT always required
    const requiredFields = ["symbol", "side", "quantity"];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate data types
    if (isNaN(orderData.quantity)) {
      throw new Error("Quantity must be a valid number");
    }

    if (orderData.quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    // Only validate price if it's provided (not for market orders)
    if (orderData.price !== undefined && orderData.price !== null) {
      if (isNaN(orderData.price)) {
        throw new Error("Price must be a valid number");
      }
      if (orderData.price <= 0) {
        throw new Error("Price must be positive");
      }
    }

    if (!["BUY", "SELL", "buy", "sell"].includes(orderData.side)) {
      throw new Error("Side must be BUY or SELL");
    }

    // Prepare the payload exactly as your backend expects
    const payload = {
      symbol: orderData.symbol.toUpperCase(),
      side: orderData.side.toUpperCase(),
      quantity: parseFloat(orderData.quantity)
    };

    // Add price if provided, otherwise set to 0 for market orders
    if (orderData.price !== undefined && orderData.price !== null && orderData.price > 0) {
      payload.price = parseFloat(orderData.price);
    } else {
      payload.price = 0; // Market order
    }

    // Add order type if provided
    if (orderData.order_type) {
      payload.order_type = orderData.order_type.toUpperCase();
    }

    const response = await api.post("/orders", payload);
    return normalizeResponse(response.data);
  } catch (error) {
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const response = await api.delete(`/orders/${orderId}`);
    
    // Backend now returns { success: true, message: "..." }
    if (response.data && response.data.success) {
      return response.data;
    } else {
      // Handle case where response doesn't have expected format
      return { success: true, message: "Order cancelled successfully" };
    }
  } catch (error) {
    // Enhanced error handling for different HTTP status codes
    if (error.response?.status === 404) {
      throw new Error("Order not found");
    } else if (error.response?.status === 403) {
      throw new Error("You can only cancel your own orders");
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || "Cannot cancel this order");
    } else {
      throw error;
    }
  }
};

export const updateOrder = async (orderId, orderData) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const response = await api.put(`/orders/${orderId}`, orderData);
    
    // Backend now returns { success: true, message: "..." }
    if (response.data && response.data.success) {
      return response.data;
    } else {
      // Handle case where response doesn't have expected format
      return { success: true, message: "Order updated successfully" };
    }
  } catch (error) {
    // Enhanced error handling for different HTTP status codes
    if (error.response?.status === 404) {
      throw new Error("Order not found");
    } else if (error.response?.status === 403) {
      throw new Error("You can only update your own orders");
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || "Cannot update this order");
    } else {
      throw error;
    }
  }
};

export const getOrderById = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const response = await api.get(`/orders/${orderId}`);
    return normalizeResponse(response.data);
  } catch (error) {
    throw error;
  }
};

export const getOrderBookBySymbol = async (symbol) => {
  try {
    if (!symbol) {
      throw new Error("Symbol is required");
    }

    const response = await api.get(`/orderbook/${symbol.toUpperCase()}`);
    return normalizeResponse(response.data);
  } catch (error) {
    throw error;
  }
};

// Get user's orders - fixed endpoint
export const getUserOrders = async () => {
  try {
    const response = await api.get("/user/orders");
    
    // Backend returns { success: true, orders: [...] }
    // So we need to extract the orders array from response.data
    if (response.data && response.data.success && Array.isArray(response.data.orders)) {
      return response.data.orders;
    } else {
      console.warn('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

// Get user's balances
export const getUserBalances = async () => {
  try {
    const response = await api.get("/user/balances");
    
    // Backend returns { success: true, balances: {...} }
    if (response.data && response.data.success && response.data.balances) {
      return response.data.balances;
    } else {
      console.warn('Unexpected response format:', response.data);
      return {};
    }
  } catch (error) {
    console.error("Error fetching user balances:", error);
    throw error;
  }
};

// Update user balance (for admin or internal use)
export const updateUserBalance = async (asset, balanceData) => {
  try {
    if (!asset) {
      throw new Error("Asset is required");
    }
    
    if (!balanceData.available && balanceData.available !== 0) {
      throw new Error("Available balance is required");
    }

    const response = await api.put(`/user/balances/${asset.toUpperCase()}`, balanceData);
    
    if (response.data && response.data.success) {
      return response.data;
    } else {
      return { success: true, message: "Balance updated successfully" };
    }
  } catch (error) {
    console.error("Error updating balance:", error);
    throw error;
  }
};

// Get market data/prices
export const getMarketData = async () => {
  try {
    const response = await api.get("/market");
    return response.data;
  } catch (error) {
    console.error("Error fetching market data:", error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    if (!userData.email || !userData.password) {
      throw new Error("Email and password are required");
    }

    const response = await api.post("/register", userData);
    return normalizeResponse(response.data);
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    if (!credentials.email || !credentials.password) {
      throw new Error("Email and password are required");
    }

    const response = await api.post("/login", credentials);
    
    // Check if token exists in response
    if (!response.data.token) {
      throw new Error('No token received from server');
    }
    
    // Store token and expiration
    localStorage.setItem("authToken", response.data.token);
    localStorage.setItem(
      "tokenExpiry",
      Date.now() + response.data.expiresIn * 1000
    );
    localStorage.setItem("user", JSON.stringify(response.data.user));

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("tokenExpiry");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Get all transactions
export const getTransactions = async () => {
  try {
    const response = await api.get("/transactions");
    
    if (response.data && response.data.success && Array.isArray(response.data.transactions)) {
      return response.data.transactions;
    } else {
      console.warn('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

// Get user's transaction history
export const getUserTransactions = async () => {
  try {
    const response = await api.get("/user/transactions");
    
    if (response.data && response.data.success && Array.isArray(response.data.transactions)) {
      return response.data.transactions;
    } else {
      console.warn('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    throw error;
  }
};

export default api;