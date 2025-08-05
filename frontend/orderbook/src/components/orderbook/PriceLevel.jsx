import { formatQuantity } from '../../utils/formatters';

const PriceLevel = ({ priceLevel, priceColor, type }) => {
  return (
    <div className="grid grid-cols-4 gap-2 px-4 py-2.5 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 group relative">
      {/* Price */}
      <span className={`${priceColor} font-semibold`}>
        ${priceLevel.price.toFixed(2)}
      </span>

      {/* Quantity */}
      <span className="text-gray-800">
        {formatQuantity(priceLevel.totalQuantity)}
      </span>

      {/* Total Value */}
      <span className="text-gray-800 font-medium">
        ${(priceLevel.price * priceLevel.totalQuantity).toLocaleString()}
      </span>

      {/* Order Count Badge */}
      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold text-center min-w-fit">
        {priceLevel.orders.length}
      </span>

      {/* Hover Details - Individual Orders */}
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md p-2 shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="text-xs text-gray-600 font-medium mb-1">
          Individual Orders at ${priceLevel.price.toFixed(2)}:
        </div>
        {priceLevel.orders.map(order => (
          <div key={order.id} className="py-1 text-xs text-gray-600 border-b border-gray-100 last:border-b-0">
            <span className="font-medium">#{order.id}</span> •
            <span className="text-blue-600 font-medium"> {order.symbol}</span> •
            <span>{formatQuantity(order.quantity)} shares</span>
            {order.created_at && (
              <span className="text-gray-400 ml-2">
                {new Date(order.created_at).toLocaleTimeString()}
              </span>
            )}
          </div>
        ))}

        {/* Summary for this price level */}
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
          <strong>{priceLevel.orders.length} orders</strong> •
          <strong> {formatQuantity(priceLevel.totalQuantity)} total shares</strong> •
          <strong> ${(priceLevel.price * priceLevel.totalQuantity).toLocaleString()} total value</strong>
        </div>
      </div>
    </div>
  );
}

export default PriceLevel;
