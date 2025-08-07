import axios from "axios";
import toast from "react-hot-toast";

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
      if (url?.includes("/orders") && !url?.includes("/user/orders")) {
        return Promise.reject(error);
      }

      // Auto-logout for login/user endpoints
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpiry");
      toast.error("Session expired. Please login again.");
      window.location.href = "/login";
    }

    // Handle connection errors
    if (!error.response) {
      toast.error("Connection error. Please check your internet connection.");
    }

    return Promise.reject(error);
  }
);

// Normalize API response data
export const normalizeResponse = (data) => {
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

// Utility function to handle common API errors with user-friendly messages
export const handleApiError = (error, context = "") => {
  const contextPrefix = context ? `${context}: ` : "";

  if (!error.response) {
    toast.error(`${contextPrefix}Network error. Please check your connection.`);
  } else if (error.response.status === 401) {
    toast.error(`${contextPrefix}Authentication required. Please login.`);
  } else if (error.response.status === 403) {
    toast.error(`${contextPrefix}Access denied.`);
  } else if (error.response.status === 404) {
    toast.error(`${contextPrefix}Resource not found.`);
  } else if (error.response.status >= 500) {
    toast.error(`${contextPrefix}Server error. Please try again later.`);
  } else {
    const message =
      error.response?.data?.error || error.message || "Unknown error occurred";
    toast.error(`${contextPrefix}${message}`);
  }
};

// Show network status notification
export const showNetworkStatus = (isOnline) => {
  if (isOnline) {
    toast.success("Connection restored", { duration: 2000 });
  } else {
    toast.error("Connection lost. Retrying...", { duration: 4000 });
  }
};

// Check API connection health
export const checkApiHealth = async () => {
  try {
    const response = await api.get("/health", { timeout: 5000 });
    return { connected: true, data: response.data };
  } catch (error) {
    console.error("API health check failed:", error);

    // Show connection error to user
    if (!error.response) {
      toast.error("Cannot connect to server. Please check your connection.");
    } else if (error.response.status >= 500) {
      toast.error("Server is experiencing issues. Please try again later.");
    }

    return { connected: false, error: error.message };
  }
};

export default api;
