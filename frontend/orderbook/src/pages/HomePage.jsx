// Create: src/pages/HomePage.jsx
import { Link } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "../services/api";

const HomePage = () => {
  const userIsAuthenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Modern Header with Glass Effect */}
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

        <div className="relative z-10 text-center py-16 px-8">
          <div className="max-w-4xl mx-auto">
            {/* Main Title with Gradient Text */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-5xl md:text-7xl">📊</span>{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                OrderBook
              </span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
              Trading Platform
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Advanced real-time order management system with professional-grade
              analytics and lightning-fast execution
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                ⚡ Real-time Data
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                📈 Advanced Charts
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                🔒 Secure Trading
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Cards */}
      <main className="relative -mt-8 z-20">
        <div className="max-w-6xl mx-auto px-8">
          {/* Welcome Card with Glass Morphism */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 md:p-12 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {userIsAuthenticated
                ? `Welcome back, ${currentUser?.username || "Trader"}!`
                : "Welcome to the Trading Floor"}
            </h3>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              {userIsAuthenticated
                ? "Your trading dashboard is ready. Access real-time market data, manage your portfolio, and execute trades with professional-grade tools."
                : "Experience next-generation order book visualization with real-time market depth analysis, advanced charting capabilities, and institutional-grade trading tools."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/orderbook"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                {userIsAuthenticated
                  ? "Go to Trading Dashboard"
                  : "Start Trading"}
              </Link>
              {!userIsAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-emerald-500/20 backdrop-blur-sm text-emerald-300 font-semibold rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-emerald-400 mb-2">
                  99.9%
                </div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  &lt;1ms
                </div>
                <div className="text-sm text-gray-400">Latency</div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  24/7
                </div>
                <div className="text-sm text-gray-400">Trading</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 border-t border-white/10 mt-16">
        <p className="text-sm">
          © 2025 OrderBook Trading Platform. Built with modern web technologies.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
