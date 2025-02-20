import React, { useState, useEffect, useContext } from "react";
import axios from "axios"; // Import Axios
import { Context } from "./contexts";

export default function LoginSignup({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", username: "" });
  const [error, setError] = useState(""); // State for error handling
  const { api, token, setToken, setTrips } = useContext(Context); // Get API base URL from context

  useEffect(() => {
    if (token) {
      onAuthSuccess(token);
    }
  }, [token, onAuthSuccess]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const endpoint = isLogin ? `${api}/login` : `${api}/signup`; 
      const response = await axios.post(endpoint, formData); // Send request to API
      // console.log(response.data);
      const data=response.data;
      // Extract token from response
      const userToken = data.token;

      // Store token and update context
      localStorage.setItem("token", userToken);
      setToken(userToken);
      onAuthSuccess(userToken);
      // setTrips(data.trips);
    } catch (error) {
      console.error("Authentication Error:", error.response?.data?.message || error.message);
      setError(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="login-signup-container">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>

      {error && <p className="error-message">{error}</p>} {/* Display error message */}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
          
        )}
        <input
            type="text"
            name="username"
            placeholder="username"
            value={formData.name}
            onChange={handleChange}
            required
          />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>

      <p onClick={() => setIsLogin(!isLogin)} className="toggle-link">
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
      </p>
    </div>
  );
}
