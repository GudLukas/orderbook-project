

const OrderBookHeader = ({ onRefresh, loading, isConnected }) => {
  return (
    <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800">Order Book</h2>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onRefresh} 
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-md font-medium transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
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
}

export default OrderBookHeader;
