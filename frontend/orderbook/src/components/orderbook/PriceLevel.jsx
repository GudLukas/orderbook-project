import { formatQuantity } from '../../utils/formatters';

const PriceLevel = ({ priceLevel, priceColor, type }) => {
  // Check if any orders at this price level belong to the current user
  const hasUserOrders = priceLevel.orders.some(order => order.is_own_order);
  
  return (
    <div className={`grid grid-cols-4 gap-2 px-4 py-2.5 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 group relative ${
      hasUserOrders ? 'bg-yellow-50 border-yellow-200' : ''
    }`}>
      {/* Price */}
      <span className={`${priceColor} font-semibold`}>
        ${priceLevel.price.toFixed(2)}
      </span>

      {/* Quantity - show remaining quantity */}
      <span className="text-gray-800">
        {formatQuantity(priceLevel.totalRemainingQuantity || priceLevel.totalQuantity)}
      </span>

      {/* Total Value - use remaining quantity */}
      <span className="text-gray-800 font-medium">
        ${(priceLevel.price * (priceLevel.totalRemainingQuantity || priceLevel.totalQuantity)).toLocaleString()}
      </span>

      {/* Order Count Badge with user indicator */}
      <div className="flex items-center gap-1">
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold text-center min-w-fit">
          {priceLevel.orders.length}
        </span>
        {hasUserOrders && (
          <span className="bg-yellow-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold" title="You have orders at this price">
            👤
          </span>
        )}
      </div>

      {/* Hover Details - Individual Orders */}
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md p-2 shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="text-xs text-gray-600 font-medium mb-1">
          Individual Orders at ${priceLevel.price.toFixed(2)}:
        </div>
        {priceLevel.orders.map(order => {
          const remainingQty = order.remainingQuantity || parseFloat(order.quantity) - parseFloat(order.filled_quantity || 0);
          const filledQty = parseFloat(order.filled_quantity || 0);
          const totalQty = parseFloat(order.quantity);
          const fillPercentage = totalQty > 0 ? (filledQty / totalQty) * 100 : 0;
          
          return (
            <div key={order.id} className={`py-1 text-xs border-b border-gray-100 last:border-b-0 ${
              order.is_own_order ? 'bg-yellow-50 text-yellow-800 border-yellow-200 rounded px-2' : 'text-gray-600'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">#{order.id}</span> •
                  <span className="text-blue-600 font-medium"> {order.symbol}</span> •
                  <span className={order.status === 'PARTIAL' ? 'text-orange-600 font-semibold' : ''}>
                    {formatQuantity(remainingQty)} 
                    {filledQty > 0 && (
                      <span className="text-gray-500"> / {formatQuantity(totalQty)}</span>
                    )}
                  </span>
                  {order.is_own_order && (
                    <span className="text-yellow-600 font-bold ml-2">YOUR ORDER</span>
                  )}
                </div>
                {order.created_at && (
                  <span className="text-gray-400">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </span>
                )}
              </div>
              {filledQty > 0 && (
                <div className="mt-1 text-xs">
                  <span className="text-green-600">
                    Filled: {formatQuantity(filledQty)} ({fillPercentage.toFixed(1)}%)
                  </span>
                  <span className="text-orange-600 ml-2">
                    Remaining: {formatQuantity(remainingQty)}
                  </span>
                </div>
              )}
              {order.status === 'PARTIAL' && (
                <div className="mt-1">
                  <span className="bg-orange-100 text-orange-800 px-1 py-0.5 rounded text-xs font-semibold">
                    PARTIAL FILL
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Summary for this price level */}
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
          <strong>{priceLevel.orders.length} orders</strong> •
          <strong> {formatQuantity(priceLevel.totalRemainingQuantity || priceLevel.totalQuantity)} remaining</strong> •
          <strong> ${(priceLevel.price * (priceLevel.totalRemainingQuantity || priceLevel.totalQuantity)).toLocaleString()} total value</strong>
          {hasUserOrders && (
            <div className="text-yellow-600 font-semibold mt-1">
              ⚠️ You have {priceLevel.orders.filter(o => o.is_own_order).length} order(s) at this price level
            </div>
          )}
          {/* Show if there are any partial fills at this level */}
          {priceLevel.orders.some(o => parseFloat(o.filled_quantity || 0) > 0) && (
            <div className="text-orange-600 font-semibold mt-1">
              🔄 Contains partially filled orders
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PriceLevel;
