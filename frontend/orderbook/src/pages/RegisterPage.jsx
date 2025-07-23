import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "@/services/api";

const RegisterCard = ({
  title = "Create Account",
  onSubmit,
  loading = false,
  error = null,
  onLoginClick,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerUser(formData)
      .then(() => {
        // Redirect to login or orderbook page
        onSubmit(formData);

        console.log("Registration successful:", formData);
      })
      .catch((error) => {
        console.error("Registration error:", error);
      });

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      {/* Header */}
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        {title}
      </h2>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Choose a username"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Create a password"
            required
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              formData.password &&
              formData.confirmPassword &&
              formData.password !== formData.confirmPassword
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="Confirm your password"
            required
          />
          {formData.password &&
            formData.confirmPassword &&
            formData.password !== formData.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
            )}
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={
            loading ||
            (formData.password &&
              formData.confirmPassword &&
              formData.password !== formData.confirmPassword)
          }
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

      {/* Login Button */}
      <div className="mt-4">
        <button
          onClick={onLoginClick}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Already have an account? Login
        </button>
      </div>

      {/* Terms */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-600">
          By registering, you agree to our{" "}
          <a href="#" className="text-blue-600 hover:text-blue-800">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Register:", formData);

      // Redirect to login or directly to orderbook
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <RegisterCard
        title="Join OrderBook"
        onSubmit={handleRegister}
        loading={loading}
        error={error}
        onLoginClick={handleLoginClick}
      />
    </div>
  );
};

export default RegisterPage;
