import OrderSide from './OrderSide';
import SpreadSection from './SpreadSection';

const OrderBookGrid = ({ groupedBids, groupedAsks, spread, stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-96">
      {/* Bids Section (Left) */}
      <div className="order-2 lg:order-1">
        <OrderSide
          type="bids"
          title="Bids (Buy Orders)"
          orders={groupedBids}
          count={stats.bidCount}
          priceColor="text-green-600"
          headerBg="bg-green-50"
          headerText="text-green-700"
        />
      </div>

      {/* Market Spread Section (Center) */}
      <div className="order-1 lg:order-2">
        <SpreadSection
          spread={spread}
          bidCount={stats.bidCount}
          askCount={stats.askCount}
        />
      </div>

      {/* Asks Section (Right) */}
      <div className="order-3">
        <OrderSide
          type="asks"
          title="Asks (Sell Orders)"
          orders={groupedAsks}
          count={stats.askCount}
          priceColor="text-red-600"
          headerBg="bg-red-50"
          headerText="text-red-700"
        />
      </div>
    </div>
  );
}

export default OrderBookGrid;
