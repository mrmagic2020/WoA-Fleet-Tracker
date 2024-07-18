import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from "react";
import {
  getCurrentUser,
  getToken,
  logout as logoutService
} from "../services/AuthService";
import { UserRole } from "@mrmagic2020/shared/dist/enums";

interface AuthContextType {
  isAuthenticated: boolean;
  name: string;
  role: UserRole;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.User);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUser = async () => {
        try {
          const userData = await getCurrentUser();
          setName(userData.username);
          setRole(userData.role);
        } catch (err) {
          console.error("Failed to fetch user", err);
        }
      };

      fetchUser();
    }
  }, [isAuthenticated]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    logoutService();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, name, role, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
