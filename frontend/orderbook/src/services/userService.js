import toast from "react-hot-toast";
import api from "./apiClient";

// Get user's balances
export const getUserBalances = async () => {
  try {
    const response = await api.get("/user/balances");

    // Backend returns { success: true, balances: {...} }
    if (response.data && response.data.success && response.data.balances) {
      return response.data.balances;
    } else {
      console.warn("Unexpected response format:", response.data);
      return {};
    }
  } catch (error) {
    // Show error for user-initiated actions
    if (error.response?.status >= 400 && error.response?.status !== 401) {
      toast.error("Failed to load account balances");
    }
    console.error("Error fetching user balances:", error);
    throw error;
  }
};

// Update user balance (for admin or internal use)
export const updateUserBalance = async (asset, balanceData) => {
  const loadingToast = toast.loading("Updating balance...");

  try {
    if (!asset) {
      const errorMsg = "Asset is required";
      toast.error(errorMsg, { id: loadingToast });
      throw new Error(errorMsg);
    }

    if (!balanceData.available && balanceData.available !== 0) {
      const errorMsg = "Available balance is required";
      toast.error(errorMsg, { id: loadingToast });
      throw new Error(errorMsg);
    }

    const response = await api.put(
      `/user/balances/${asset.toUpperCase()}`,
      balanceData
    );

    let result;
    if (response.data && response.data.success) {
      result = response.data;
    } else {
      result = { success: true, message: "Balance updated successfully" };
    }

    toast.success(`${asset.toUpperCase()} balance updated successfully`, {
      id: loadingToast,
    });
    return result;
  } catch (error) {
    const errorMsg =
      error.response?.data?.error ||
      error.message ||
      "Failed to update balance";
    toast.error(errorMsg, { id: loadingToast });
    console.error("Error updating balance:", error);
    throw error;
  }
};

// Get all transactions
export const getTransactions = async () => {
  try {
    const response = await api.get("/transactions");

    if (
      response.data &&
      response.data.success &&
      Array.isArray(response.data.transactions)
    ) {
      return response.data.transactions;
    } else {
      console.warn("Unexpected response format:", response.data);
      return [];
    }
  } catch (error) {
    // Show error for user-initiated actions
    if (error.response?.status >= 400 && error.response?.status !== 401) {
      toast.error("Failed to load transaction history");
    }
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

// Get user's transaction history
export const getUserTransactions = async () => {
  try {
    const response = await api.get("/user/transactions");

    if (
      response.data &&
      response.data.success &&
      Array.isArray(response.data.transactions)
    ) {
      return response.data.transactions;
    } else {
      console.warn("Unexpected response format:", response.data);
      return [];
    }
  } catch (error) {
    // Show error for user-initiated actions
    if (error.response?.status >= 400 && error.response?.status !== 401) {
      toast.error("Failed to load your transaction history");
    }
    console.error("Error fetching user transactions:", error);
    throw error;
  }
};
