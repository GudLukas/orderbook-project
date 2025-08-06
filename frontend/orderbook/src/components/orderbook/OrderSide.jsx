import PriceLevel from './PriceLevel';

const OrderSide = ({
  type,
  title,
  orders,
  count,
  priceColor,
  headerBg,
  headerText
}) => {
  const emptyMessage = type === 'bids' ? 'No buy orders available' : 'No sell orders available';
  
  // Calculate partial fill statistics
  const partialOrders = orders.flatMap(priceLevel => 
    priceLevel.orders.filter(order => 
      parseFloat(order.filled_quantity || 0) > 0 && order.status === 'PARTIAL'
    )
  ).length;

  return (
    <div>
      {/* Section Header */}
      <div className={`flex justify-between items-center ${headerBg} ${headerText} px-4 py-3 rounded-t-md`}>
        <div>
          <h3 className="font-semibold">{title}</h3>
          {partialOrders > 0 && (
            <div className="text-xs text-orange-600 font-medium mt-1">
              {partialOrders} partially filled
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="bg-white bg-opacity-80 px-2 py-1 rounded-xl text-xs font-semibold">
            {count} orders
          </div>
          {partialOrders > 0 && (
            <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-xl text-xs font-semibold mt-1">
              {partialOrders} partial
            </div>
          )}
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-4 gap-2 px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
        <span>Price</span>
        <span>Available</span>
        <span>Total Value</span>
        <span>Orders</span>
      </div>

      {/* Orders List */}
      <div className="bg-white border border-gray-200 rounded-b-md max-h-96 overflow-y-auto">
        {orders.length > 0 ? (
          orders.map((priceLevel) => (
            <PriceLevel
              key={`${type}-${priceLevel.price}`}
              priceLevel={priceLevel}
              priceColor={priceColor}
              type={type}
            />
          ))
        ) : (
          <div className="py-10 text-center text-gray-500 italic">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderSide;
