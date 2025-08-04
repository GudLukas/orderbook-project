import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { isAuthenticated, getCurrentUser, logout } from "../../services/api";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication status on component mount and route changes
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isAuthenticated();
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        setUser(getCurrentUser());
      } else {
        setUser(null);
      }
    };

    checkAuth();
    
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuth);
    
    return () => window.removeEventListener('storage', checkAuth);
  }, [location]);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="absolute top-4 right-4 z-50">
      <div className="flex gap-4 items-center">
        {/* Home Link */}
        <Link
          to="/"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            location.pathname === "/"
              ? "bg-white/20 text-white"
              : "bg-white/10 text-white/80 hover:bg-white/20"
          }`}
        >
          Home
        </Link>

        {/* Trading Link - Only show if logged in */}
        {isLoggedIn && (
          <Link
            to="/orderbook"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname === "/orderbook"
                ? "bg-white/20 text-white"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            Trading
          </Link>
        )}

        {/* Authentication Links */}
        {!isLoggedIn ? (
          // Show Login/Register when not logged in
          <>
            <Link
              to="/login"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === "/login"
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === "/register"
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              Register
            </Link>
          </>
        ) : (
          // Show User info and Logout when logged in
          <>
            {/* User Avatar/Name */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg text-white/90">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">
                {user?.username || user?.email}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-red-500/20 text-white/90 hover:bg-red-500/30 border border-red-500/30"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
