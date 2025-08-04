import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
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
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
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
  } else if (data && typeof data === "object") {
    // Single object response
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
    // Error is already enhanced by the interceptor
    throw error;
  }
};

export const placeOrder = async (orderData) => {
  try {
    // Validate required fields before sending
    const requiredFields = ["symbol", "side", "price", "quantity"];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate data types
    if (isNaN(orderData.price) || isNaN(orderData.quantity)) {
      throw new Error("Price and quantity must be valid numbers");
    }

    if (orderData.price <= 0 || orderData.quantity <= 0) {
      throw new Error("Price and quantity must be positive");
    }

    if (!["BUY", "SELL", "buy", "sell"].includes(orderData.side)) {
      throw new Error("Side must be BUY or SELL");
    }

    const response = await api.post("/orders", {
      ...orderData,
      side: orderData.side.toUpperCase(),
      symbol: orderData.symbol.toUpperCase(),
    });

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
    return normalizeResponse(response.data);
  } catch (error) {
    throw error;
  }
};

export const updateOrder = async (orderId, orderData) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const response = await api.put(`/orders/${orderId}`, orderData);
    return normalizeResponse(response.data);
  } catch (error) {
    throw error;
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

// Get all orders for a user
// not implemented on the backend yet
export const getUserOrders = async () => {
  try {
    const response = await api.get("/orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

// Get market data/prices
// not implemented on the backend yet
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
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Auto-logout when token expires
// export const checkTokenExpiration = () => {
//   if (!isTokenValid()) {
//     logout();
//     window.location.href = "/login";
//   }
// };

// // Set up automatic token checking
// setInterval(checkTokenExpiration, 60000); // Check every minute

export default api;
