// OrderBookPage.jsx
import OrderGrid from "../components/orderbook/OrderBookContainer.jsx";
import OrderBookTabs from '../components/orderbook/OrderBookTabs';

const OrderBookPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Trading Platform Header */}
      <header className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        ></div>

        <div className="relative z-10 text-center py-12 px-8">
          <div className="max-w-4xl mx-auto">
            {/* Page Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-4xl md:text-6xl">📊</span>{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Live Trading
              </span>
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
              Real-Time Order Book
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Monitor market depth, execute trades, and analyze order flow in
              real-time
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                🔥 Live Market Data
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                📊 Market Depth
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                ⚡ Instant Execution
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Order Book Section */}
      <main className="relative -mt-4 z-20">
        <div className="py-8">
          <OrderBookTabs />
        </div>
      </main>
    </div>
  );
};

export default OrderBookPage;
