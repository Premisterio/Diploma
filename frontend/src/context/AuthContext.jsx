import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken"));
  const navigate = useNavigate();

  // Check if token is valid on initial load
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await fetch("http://localhost:8000/api/secure-endpoint", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Token is invalid, try to refresh
            await refreshUserToken();
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const refreshUserToken = async () => {
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const response = await fetch("http://localhost:8000/api/refresh", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        
        // Verify the new token
        const userResponse = await fetch("http://localhost:8000/api/secure-endpoint", {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
          return true;
        }
      }
      
      // If refresh failed, logout
      logout();
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);
      
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
      
      // Get user info
      const userResponse = await fetch("http://localhost:8000/api/secure-endpoint", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }
      
      navigate("/dashboard");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analyst_name: name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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

export const useAuth = () => useContext(AuthContext);