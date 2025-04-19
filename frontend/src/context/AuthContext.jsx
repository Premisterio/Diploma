import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (!token || !refreshToken) {
        setLoading(false);
        return;
      }
      
      try {
        // Try to get user info with current token
        const response = await authAPI.getUserInfo();
        
        if (response.success) {
          setUser(response.data.user);
        } else {
          // If token is invalid, try to refresh
          await refreshUserToken();
        }
      } catch (err) {
        console.error("Auth verification error:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const refreshUserToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const response = await authAPI.refreshToken(refreshToken);
      
      if (response.success) {
        localStorage.setItem("token", response.data.access_token);
        
        // Get user info with new token
        const userResponse = await authAPI.getUserInfo();
        if (userResponse.success) {
          setUser(userResponse.data.user);
          return true;
        }
      }
      
      // If refresh failed, logout
      logout();
      return false;
    } catch (err) {
      console.error("Token refresh error:", err);
      logout();
      return false;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { access_token, refresh_token } = response.data;
        
        localStorage.setItem("token", access_token);
        localStorage.setItem("refreshToken", refresh_token);
        
        // Get user info
        const userResponse = await authAPI.getUserInfo();
        if (userResponse.success) {
          setUser(userResponse.data.user);
          navigate("/dashboard");
          return true;
        }
      } else {
        setError(response.error);
        return false;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Authentication failed. Please try again.");
      return false;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const response = await authAPI.register(name, email, password);
      return response.success;
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        refreshUserToken,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};