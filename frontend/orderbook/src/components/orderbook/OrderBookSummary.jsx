const OrderBookSummary = ({ stats, selectedSymbol }) => {
  return (
    <div className="flex justify-around bg-gray-50 p-4 rounded-lg mb-6">
      <div className="text-center">
        <span className="block text-xs text-gray-600 uppercase tracking-wider mb-1">
          Symbol
        </span>
        <span className="block text-lg font-semibold text-blue-600">
          {selectedSymbol}
        </span>
      </div>

      <div className="text-center">
        <span className="block text-xs text-gray-600 uppercase tracking-wider mb-1">
          Total Orders
        </span>
        <span className="block text-lg font-semibold text-gray-800">
          {stats.totalOrders}
        </span>
      </div>

      <div className="text-center">
        <span className="block text-xs text-gray-600 uppercase tracking-wider mb-1">
          Buy Orders
        </span>
        <span className="block text-lg font-semibold text-green-600">
          {stats.bidCount}
        </span>
      </div>

      <div className="text-center">
        <span className="block text-xs text-gray-600 uppercase tracking-wider mb-1">
          Sell Orders
        </span>
        <span className="block text-lg font-semibold text-red-600">
          {stats.askCount}
        </span>
      </div>
    </div>
  );
};

export default OrderBookSummary;
