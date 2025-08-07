import { useState, useEffect } from "react";
import { useOrderBook } from "../../hooks/useOrderBook";
import OrderBookHeader from "./OrderBookHeader";
import OrderBookSummary from "./OrderBookSummary";
import OrderBookGrid from "./OrderBookGrid";
import OrderBookCharts from "./OrderBookCharts";

const OrderBookContainer = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");

  const {
    loading,
    error,
    orders,
    groupedBids,
    groupedAsks,
    spread,
    stats,
    refetch,
    isConnected,
    hasData,
    availableSymbols,
  } = useOrderBook(selectedSymbol);

  // Auto-select first available symbol if current selection is not available
  useEffect(() => {
    if (
      availableSymbols.length > 0 &&
      !availableSymbols.includes(selectedSymbol)
    ) {
      setSelectedSymbol(availableSymbols[0]);
    }
  }, [availableSymbols, selectedSymbol]);

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
        selectedSymbol={selectedSymbol}
        onSymbolChange={setSelectedSymbol}
        availableSymbols={availableSymbols}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-5">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Summary Stats */}
      <OrderBookSummary stats={stats} selectedSymbol={selectedSymbol} />

      {/* No data message for selected symbol */}
      {!loading && !hasData && availableSymbols.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md mb-5 text-center">
          No orders found for <strong>{selectedSymbol}</strong>. Try selecting a
          different symbol.
        </div>
      )}

      {/* Main Orderbook Grid */}
      <div className="grid  gap-5 min-h-96">
        <OrderBookGrid
          groupedBids={groupedBids}
          groupedAsks={groupedAsks}
          spread={spread}
          stats={stats}
        />
      </div>

      {/* OrderBook Charts */}
      {hasData && (
        <OrderBookCharts orders={orders} selectedPair={selectedSymbol} />
      )}

      {/* Footer Info */}
      {hasData && (
        <div className="mt-5 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
          Auto-refreshes every 5 seconds • Last updated:{" "}
          {new Date().toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default OrderBookContainer;
