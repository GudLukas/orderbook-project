import { useOrderBook } from '../../hooks/useOrderBook';
import OrderBookHeader from './OrderBookHeader';
import OrderBookSummary from './OrderBookSummary';
import OrderBookGrid from './OrderBookGrid';
import OrderBookCharts from './OrderBookCharts';

const OrderBookContainer = () => {
  const {
    loading,
    error,
    groupedBids,
    groupedAsks,
    spread,
    stats,
    refetch,
    isConnected,
    hasData
  } = useOrderBook();

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-5 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center justify-center h-96 text-gray-600">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mb-4"></div>
          <div>Loading order book...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-5 bg-white rounded-xl shadow-lg">
      <OrderBookHeader
        onRefresh={refetch}
        loading={loading}
        isConnected={isConnected}
        error={error}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-5">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Summary Stats */}
      <OrderBookSummary stats={stats} />

      {/* Main Orderbook Grid */}
      <div className="grid  gap-5 min-h-96">
        <OrderBookGrid
          groupedBids={groupedBids}
          groupedAsks={groupedAsks}
          spread={spread}
          stats={stats}
        />
      </div>

      {/* Footer Info */}
      {hasData && (
        <div className="mt-5 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
          Auto-refreshes every 5 seconds • Last updated: {new Date().toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default OrderBookContainer;