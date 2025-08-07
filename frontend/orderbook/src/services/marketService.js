import toast from "react-hot-toast";
import api from "./apiClient";

// Get market data/prices
export const getMarketData = async () => {
  try {
    const response = await api.get("/market");
    return response.data;
  } catch (error) {
    // Show error for user-initiated actions
    if (error.response?.status >= 400 && error.response?.status !== 401) {
      toast.error("Failed to load market data");
    }
    console.error("Error fetching market data:", error);
    throw error;
  }
};
