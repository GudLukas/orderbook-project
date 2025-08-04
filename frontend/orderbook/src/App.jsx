import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import OrderBookPage from "./pages/OrderBookPage";
import Navigation from "./components/layout/Navigation";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Navigation />
      {/* <Card /> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/orderbook"
          element={
            <ProtectedRoute>
              <OrderBookPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
