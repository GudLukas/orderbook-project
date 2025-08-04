import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchOrderBook } from '../services/api';
import { 
  groupOrdersByPrice, 
  separateOrdersBySide, 
  calculateSpread
} from '../utils/orderUtils';

export const useOrderBook = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Simple data fetching - API handles all the complexity
  const loadOrders = useCallback(async () => {
    try {
      setError('');
      const ordersArray = await fetchOrderBook();
      setOrders(ordersArray);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh
  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Process orders (memoized for performance)
  const processedData = useMemo(() => {
    const { bids, asks } = separateOrdersBySide(orders);
    const groupedBids = groupOrdersByPrice(bids);
    const groupedAsks = groupOrdersByPrice(asks);
    const spread = calculateSpread(groupedBids, groupedAsks);

    return {
      bids,
      asks,
      groupedBids,
      groupedAsks,
      spread,
      stats: {
        totalOrders: orders.length,
        bidCount: bids.length,
        askCount: asks.length
      }
    };
  }, [orders]);

  // Manual refresh
  const refetch = useCallback(() => {
    setLoading(true);
    loadOrders();
  }, [loadOrders]);

  return {
    // Raw data
    orders,
    loading,
    error,
    
    // Processed data
    ...processedData,
    
    // Actions
    refetch,
    
    // Status helpers
    isConnected: !error,
    hasData: orders.length > 0
  };
};