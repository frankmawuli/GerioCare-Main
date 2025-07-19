import React, { createContext, useContext, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { useAuth } from "../hooks/useAuth";
import { User as AppUser } from "../types";

interface AuthContextType {
  user: User | null;
  userProfile: AppUser | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: unknown; error: unknown }>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<AppUser>
  ) => Promise<{ data: unknown; error: unknown }>;
  signOut: () => Promise<{ error: unknown }>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  const isAuthenticated = !!auth.user && !!auth.userProfile;

  const hasRole = (role: string): boolean => {
    return auth.userProfile?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return auth.userProfile ? roles.includes(auth.userProfile.role) : false;
  };

  const value: AuthContextType = {
    ...auth,
    isAuthenticated,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
