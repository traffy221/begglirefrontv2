import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../api/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Helper to fetch wishlist count
  const refreshWishlistCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setWishlistCount(0);
      return;
    }
    try {
      const response = await apiClient.get("/wishlist/count");
      if (response.data && response.data.success) {
        setWishlistCount(response.data.data || 0);
      }
    } catch (error) {
      // Quietly fail or set to 0
      setWishlistCount(0);
    }
  };

  // Check login status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          // Verify token by calling /api/me
          const response = await apiClient.get("/me");
          if (response.data && response.data.success) {
            const fetchedUser = response.data.data;
            setUser(fetchedUser);
            setIsAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(fetchedUser));
            // Trigger wishlist load
            refreshWishlistCount();
          } else {
            // Invalid user data
            clearAuthLocal();
          }
        } catch (error) {
          // Token is invalid or expired
          clearAuthLocal();
        }
      } else {
        clearAuthLocal();
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Listen to global 401 events from our Axios client
    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticated(false);
      setWishlistCount(0);
    };

    window.addEventListener("unauthorized-access", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorized-access", handleUnauthorized);
    };
  }, []);

  const clearAuthLocal = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setWishlistCount(0);
  };

  // Login action
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/login", { email, password });
      if (response.data && response.data.success) {
        const { access_token, data: loggedUser } = response.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(loggedUser));
        setUser(loggedUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        refreshWishlistCount();
        return response.data;
      } else {
        throw new Error(response.data?.message || "Identifiants incorrects.");
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Register action
  const register = async (data) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/register", data);
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await apiClient.post("/logout");
    } catch (error) {
      // Quietly ignore logout errors if session already expired on backend
    } finally {
      clearAuthLocal();
      if (typeof window !== "undefined") {
        window.location.href = "/connexion";
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        wishlistCount,
        refreshWishlistCount,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
