// Main API module - Re-exports all services for convenience
// This maintains backward compatibility while using modular architecture

// Core API client and utilities
export {
  default as api,
  normalizeResponse,
  handleApiError,
  showNetworkStatus,
  checkApiHealth,
} from "./apiClient";

// Authentication services
export {
  registerUser,
  loginUser,
  logout,
  isAuthenticated,
  getCurrentUser,
} from "./authService";

// Order management services
export {
  fetchOrderBook,
  getOrderBookBySymbol,
  placeOrder,
  cancelOrder,
  updateOrder,
  getOrderById,
  getUserOrders,
} from "./orderService";

// User and balance services
export {
  getUserBalances,
  updateUserBalance,
  getTransactions,
  getUserTransactions,
} from "./userService";

// Market data services
export { getMarketData } from "./marketService";

// Re-export the default axios instance for direct access if needed
export { default } from "./apiClient";
