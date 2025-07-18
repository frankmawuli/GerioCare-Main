import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  requireSubscription?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireSubscription = false 
}) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(userProfile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireSubscription && userProfile.role === 'older_adult' && !userProfile.is_subscribed) {
    return <Navigate to="/subscribe" replace />;
  }

  return <>{children}</>;
};