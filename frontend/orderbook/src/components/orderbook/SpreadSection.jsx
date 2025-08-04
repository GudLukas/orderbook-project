
const SpreadSection = ({ spread, bidCount, askCount }) => {
  return (
    <div className="flex flex-col justify-center p-5 bg-gray-50 rounded-lg">
      <div className="text-center">
        {spread ? (
          <>
            {/* Best Ask */}
            <div className="mb-4">
              <span className="block text-xs text-gray-600 uppercase tracking-wider mb-1">
                Best Ask
              </span>
              <span className="block text-lg font-semibold text-red-600">
                ${spread.bestAsk.toFixed(2)}
              </span>
            </div>

            {/* Market Spread Display */}
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 my-4">
              <div className="text-xs text-gray-600 uppercase tracking-wider mb-2">
                Market Spread
              </div>
              <div className="text-xl font-bold text-gray-800 mb-1">
                ${spread.spreadAmount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                {spread.spreadPercent.toFixed(2)}%
              </div>
            </div>

            {/* Best Bid */}
            <div className="mb-4">
              <span className="block text-xs text-gray-600 uppercase tracking-wider mb-1">
                Best Bid
              </span>
              <span className="block text-lg font-semibold text-green-600">
                ${spread.bestBid.toFixed(2)}
              </span>
            </div>
          </>
        ) : (
          /* No Market Available */
          <div className="py-10 text-center text-gray-500">
            <div className="text-base font-semibold mb-2">
              No Market Available
            </div>
            <div className="text-sm">
              {bidCount === 0 && <div>• No buy orders</div>}
              {askCount === 0 && <div>• No sell orders</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpreadSection;
