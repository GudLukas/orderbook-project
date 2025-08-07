import toast from "react-hot-toast";
import api, { normalizeResponse } from "./apiClient";

export const fetchOrderBook = async () => {
  try {
    const response = await api.get("/orders");
    return normalizeResponse(response.data);
  } catch (error) {
    // Only show error toast for severe errors, not for network issues during polling
    if (error.response?.status >= 500) {
      toast.error("Server error while fetching order book");
    }
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
    // Show error for user-initiated symbol changes
    if (error.response?.status >= 500) {
      toast.error(`Failed to load ${symbol} order book`);
    }
    throw error;
  }
};

export const placeOrder = async (orderData) => {
  const loadingToast = toast.loading("Placing order...");

  try {
    // Validate required fields - price is NOT always required
    const requiredFields = ["symbol", "side", "quantity"];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        const errorMsg = `Missing required field: ${field}`;
        toast.error(errorMsg, { id: loadingToast });
        throw new Error(errorMsg);
      }
    }

    // Validate data types
    if (isNaN(orderData.quantity)) {
      const errorMsg = "Quantity must be a valid number";
      toast.error(errorMsg, { id: loadingToast });
      throw new Error(errorMsg);
    }

    if (orderData.quantity <= 0) {
      const errorMsg = "Quantity must be positive";
      toast.error(errorMsg, { id: loadingToast });
      throw new Error(errorMsg);
    }

    // Only validate price if it's provided (not for market orders)
    if (orderData.price !== undefined && orderData.price !== null) {
      if (isNaN(orderData.price)) {
        const errorMsg = "Price must be a valid number";
        toast.error(errorMsg, { id: loadingToast });
        throw new Error(errorMsg);
      }
      if (orderData.price <= 0) {
        const errorMsg = "Price must be positive";
        toast.error(errorMsg, { id: loadingToast });
        throw new Error(errorMsg);
      }
    }

    if (!["BUY", "SELL", "buy", "sell"].includes(orderData.side)) {
      const errorMsg = "Side must be BUY or SELL";
      toast.error(errorMsg, { id: loadingToast });
      throw new Error(errorMsg);
    }

    // Prepare the payload exactly as your backend expects
    const payload = {
      symbol: orderData.symbol.toUpperCase(),
      side: orderData.side.toUpperCase(),
      quantity: parseFloat(orderData.quantity),
    };

    // Add price if provided, otherwise set to 0 for market orders
    if (
      orderData.price !== undefined &&
      orderData.price !== null &&
      orderData.price > 0
    ) {
      payload.price = parseFloat(orderData.price);
    } else {
      payload.price = 0; // Market order
    }

    // Add order type if provided
    if (orderData.order_type) {
      payload.order_type = orderData.order_type.toUpperCase();
    }

    const response = await api.post("/orders", payload);
    const result = normalizeResponse(response.data);

    // Success notification
    const orderType = payload.price === 0 ? "Market" : "Limit";
    const successMsg = `${orderType} ${payload.side} order placed successfully for ${payload.quantity} ${payload.symbol}`;
    toast.success(successMsg, { id: loadingToast });

    return result;
  } catch (error) {
    const errorMsg =
      error.response?.data?.error || error.message || "Failed to place order";
    toast.error(errorMsg, { id: loadingToast });
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  const loadingToast = toast.loading("Cancelling order...");

  try {
    if (!orderId) {
      const errorMsg = "Order ID is required";
      toast.error(errorMsg, { id: loadingToast });
      throw new Error(errorMsg);
    }

    const response = await api.delete(`/orders/${orderId}`);

    // Backend now returns { success: true, message: "..." }
    let result;
    if (response.data && response.data.success) {
      result = response.data;
    } else {
      // Handle case where response doesn't have expected format
      result = { success: true, message: "Order cancelled successfully" };
    }

    toast.success(result.message || "Order cancelled successfully", {
      id: loadingToast,
    });
    return result;
  } catch (error) {
    let errorMsg;
    // Enhanced error handling for different HTTP status codes
    if (error.response?.status === 404) {
      errorMsg = "Order not found";
    } else if (error.response?.status === 403) {
      errorMsg = "You can only cancel your own orders";
    } else if (error.response?.status === 400) {
      errorMsg = error.response.data?.error || "Cannot cancel this order";
    } else {
      errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to cancel order";
    }

    toast.error(errorMsg, { id: loadingToast });
    throw new Error(errorMsg);
  }
};

export const updateOrder = async (orderId, orderData) => {
  const loadingToast = toast.loading("Updating order...");

  try {
    if (!orderId) {
      const errorMsg = "Order ID is required";
      toast.error(errorMsg, { id: loadingToast });
      throw new Error(errorMsg);
    }

    const response = await api.put(`/orders/${orderId}`, orderData);

    // Backend now returns { success: true, message: "..." }
    let result;
    if (response.data && response.data.success) {
      result = response.data;
    } else {
      // Handle case where response doesn't have expected format
      result = { success: true, message: "Order updated successfully" };
    }

    toast.success(result.message || "Order updated successfully", {
      id: loadingToast,
    });
    return result;
  } catch (error) {
    let errorMsg;
    // Enhanced error handling for different HTTP status codes
    if (error.response?.status === 404) {
      errorMsg = "Order not found";
    } else if (error.response?.status === 403) {
      errorMsg = "You can only update your own orders";
    } else if (error.response?.status === 400) {
      errorMsg = error.response.data?.error || "Cannot update this order";
    } else {
      errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to update order";
    }

    toast.error(errorMsg, { id: loadingToast });
    throw new Error(errorMsg);
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
    // Show user-friendly error messages
    if (error.response?.status === 404) {
      toast.error("Order not found");
    } else if (error.response?.status === 403) {
      toast.error("Access denied for this order");
    } else if (error.response?.status >= 500) {
      toast.error("Server error while fetching order details");
    }
    throw error;
  }
};

export const getUserOrders = async () => {
  try {
    const response = await api.get("/user/orders");

    // Backend returns { success: true, orders: [...] }
    // So we need to extract the orders array from response.data
    if (
      response.data &&
      response.data.success &&
      Array.isArray(response.data.orders)
    ) {
      return response.data.orders;
    } else {
      console.warn("Unexpected response format:", response.data);
      return [];
    }
  } catch (error) {
    // Show error for user-initiated actions
    if (error.response?.status >= 400 && error.response?.status !== 401) {
      toast.error("Failed to load your orders");
    }
    console.error("Error fetching user orders:", error);
    throw error;
  }
};
