const OrderBookHeader = ({
  onRefresh,
  loading,
  isConnected,
  selectedSymbol,
  onSymbolChange,
  availableSymbols,
}) => {
  return (
    <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-gray-100">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Order Book</h2>

        {/* Symbol Selector */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="symbol-select"
            className="text-sm font-medium text-gray-600"
          >
            Select Trading Pair:
          </label>
          <select
            id="symbol-select"
            value={selectedSymbol}
            onChange={(e) => onSymbolChange(e.target.value)}
            disabled={!availableSymbols || availableSymbols.length === 0}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {availableSymbols && availableSymbols.length > 0 ? (
              availableSymbols.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))
            ) : (
              <option value="">Loading symbols...</option>
            )}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-md font-medium transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "⏳ Refreshing..." : "🔄 Refresh"}
        </button>

        <div className="text-sm font-medium">
          {isConnected ? (
            <span className="text-green-500">✅ Connected</span>
          ) : (
            <span className="text-red-500">❌ Connection Error</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderBookHeader;
