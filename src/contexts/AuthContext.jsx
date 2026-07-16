import { createContext, useContext, useEffect, useState } from "react";
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  subscribeToAuth 
} from "../services/authService";
import { fetchUserProfile } from "../services/userService";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      // Wait for auth subscriber to load profile
      return user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email, password, extraData) => {
    setLoading(true);
    try {
      const user = await registerUser(email, password, extraData);
      return user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setCurrentUser(null);
      setRole(null);
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (currentUser?.uid) {
      try {
        const freshProfile = await fetchUserProfile(currentUser.uid);
        if (freshProfile) {
          setCurrentUser(freshProfile);
          setRole(freshProfile.role || "customer");
        }
      } catch (error) {
        console.error("Failed to refresh user:", error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuth((userProfile) => {
      if (userProfile) {
        setCurrentUser(userProfile);
        setRole(userProfile.role || "customer");
      } else {
        setCurrentUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    role,
    login,
    register,
    logout,
    refreshUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
export default AuthContext;
