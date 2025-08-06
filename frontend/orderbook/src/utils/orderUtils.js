// Order processing utilities
export const groupOrdersByPrice = (ordersList) => {
  const grouped = {};
  ordersList.forEach(order => {
    const price = parseFloat(order.price).toString();
    const filledQuantity = parseFloat(order.filled_quantity || 0);
    const totalQuantity = parseFloat(order.quantity || 0);
    const remainingQuantity = totalQuantity - filledQuantity;
    
    // Only include orders with remaining quantity
    if (remainingQuantity > 0) {
      if (!grouped[price]) {
        grouped[price] = {
          price: parseFloat(order.price),
          totalQuantity: 0,
          totalRemainingQuantity: 0,
          orders: []
        };
      }
      
      // Add the remaining quantity to the total
      grouped[price].totalQuantity += remainingQuantity;
      grouped[price].totalRemainingQuantity += remainingQuantity;
      
      // Add order with calculated remaining quantity
      grouped[price].orders.push({
        ...order,
        remainingQuantity: remainingQuantity,
        filledQuantity: filledQuantity,
        fillPercentage: totalQuantity > 0 ? (filledQuantity / totalQuantity) * 100 : 0
      });
    }
  });
  return Object.values(grouped);
};

export const separateOrdersBySide = (orders) => {
  const bids = orders
    .filter(order => order.side && order.side.toLowerCase() === 'buy')
    .sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

  const asks = orders
    .filter(order => order.side && order.side.toLowerCase() === 'sell')
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  return { bids, asks };
};

export const calculateSpread = (groupedBids, groupedAsks) => {
  if (groupedAsks.length === 0 || groupedBids.length === 0) {
    return null;
  }

  const bestAsk = groupedAsks[0].price;
  const bestBid = groupedBids[0].price;
  const spreadAmount = bestAsk - bestBid;
  const spreadPercent = (spreadAmount / bestBid) * 100;

  return { bestAsk, bestBid, spreadAmount, spreadPercent };
};

export const handleApiError = (err) => {
  if (err.code === 'ECONNABORTED') {
    return 'Request timeout - please check if the backend server is running';
  } else if (err.response?.status === 404) {
    return 'Orders endpoint not found - please check your backend API';
  } else if (err.response?.status >= 500) {
    return 'Server error - please try again later';
  } else if (err.message.includes('Network Error')) {
    return 'Cannot connect to server - please check if backend is running on http://localhost:5000';
  } else {
    return `Failed to load orders: ${err.message}`;
  }
};

export const normalizeApiResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.orders)) {
    return data.orders;
  } else if (data && Array.isArray(data.data)) {
    return data.data;
  } else {
    throw new Error('Invalid data format received from API');
  }
};