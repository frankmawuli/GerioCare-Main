import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  requireSubscription?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireSubscription = false,
}) => {
  const { user, userProfile, loading } = useAuth();

  console.log("🛡️ ProtectedRoute: Checking access with:", {
    user: user?.email,
    userProfile: userProfile?.role,
    loading,
    requiredRole,
    requireSubscription,
  });

  if (loading) {
    console.log("⏳ ProtectedRoute: Still loading, showing spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    console.log(
      "❌ ProtectedRoute: No user or userProfile, redirecting to login"
    );
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(userProfile.role)) {
    console.log(
      "🚫 ProtectedRoute: Role not authorized, redirecting to login. Required:",
      requiredRole,
      "User:",
      userProfile.role
    );
    return <Navigate to="/login" replace />;
  }

  if (
    requireSubscription &&
    userProfile.role === "older_adult" &&
    !userProfile.is_subscribed
  ) {
    console.log(
      "💳 ProtectedRoute: Subscription required, redirecting to subscribe"
    );
    return <Navigate to="/subscribe" replace />;
  }

  console.log("✅ ProtectedRoute: Access granted, rendering children");
  return <>{children}</>;
};
