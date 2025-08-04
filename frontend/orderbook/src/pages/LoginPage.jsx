// Update: src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { loginUser } from "../services/api";
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      loginUser(formData)
        .then(() => {
          // Redirect to orderbook page on successful login
          console.log("Login successful:", formData);
          navigate("/orderbook");
        })
        .catch((error) => {
          console.error("Login error:", error);
          throw error; // Re-throw to handle in catch block
        });
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // Navigate to register or toggle mode
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <AuthCard
        title="Welcome Back"
        onSubmit={handleLogin}
        loading={loading}
        error={error}
        onRegisterClick={handleRegister}
      />
    </div>
  );
};

export default LoginPage;
