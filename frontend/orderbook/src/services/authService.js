import toast from "react-hot-toast";
import api, { normalizeResponse } from "./apiClient";

export const registerUser = async (userData) => {
  const loadingToast = toast.loading("Creating account...");

  try {
    if (!userData.email || !userData.password) {
      const errorMsg = "Email and password are required";
      toast.error(errorMsg, { id: loadingToast });
      throw new Error(errorMsg);
    }

    const response = await api.post("/register", userData);
    const result = normalizeResponse(response.data);

    toast.success("Account created successfully! You can now login.", {
      id: loadingToast,
    });
    return result;
  } catch (error) {
    const errorMsg =
      error.response?.data?.error ||
      error.message ||
      "Failed to create account";
    toast.error(errorMsg, { id: loadingToast });
    throw error;
  }
};

export const loginUser = async (credentials) => {
  const loadingToast = toast.loading("Signing in...");

  try {
    if (!credentials.email || !credentials.password) {
      const errorMsg = "Email and password are required";
      toast.error(errorMsg, { id: loadingToast });
      throw new Error(errorMsg);
    }

    const response = await api.post("/login", credentials);

    // Check if token exists in response
    if (!response.data.token) {
      const errorMsg = "No token received from server";
      toast.error(errorMsg, { id: loadingToast });
      throw new Error(errorMsg);
    }

    // Store token and expiration
    localStorage.setItem("authToken", response.data.token);
    localStorage.setItem(
      "tokenExpiry",
      Date.now() + response.data.expiresIn * 1000
    );
    localStorage.setItem("user", JSON.stringify(response.data.user));

    const userName =
      response.data.user?.name || response.data.user?.email || "User";
    toast.success(`Welcome back, ${userName}!`, { id: loadingToast });

    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.error || error.message || "Failed to sign in";
    toast.error(errorMsg, { id: loadingToast });
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("tokenExpiry");

  toast.success("Logged out successfully");
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  const expiry = localStorage.getItem("tokenExpiry");

  if (!token || !expiry) {
    return false;
  }

  // Check if token is expired
  if (Date.now() > parseInt(expiry)) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiry");
    toast.error("Session expired. Please login again.");
    return false;
  }

  return true;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
