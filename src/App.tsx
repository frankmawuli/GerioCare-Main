import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Header } from "./components/Layout/Header";
import { Sidebar } from "./components/Layout/Sidebar";
import { LoginForm } from "./components/Auth/LoginForm";
import { RegisterForm } from "./components/Auth/RegisterForm";
import { OlderAdultDashboard } from "./components/Dashboard/OlderAdultDashboard";
import { CaregiverDashboard } from "./components/Dashboard/CaregiverDashboard";
import { TherapistDashboard } from "./components/Dashboard/TherapistDashboard";
import { AdminDashboard } from "./components/Dashboard/AdminDashboard";
import { ShopPage } from "./components/Shop/ShopPage";
import { NotificationCenter } from "./components/Notifications/NotificationCenter";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAuthContext } from "./contexts/AuthContext";

const DashboardRouter: React.FC = () => {
  const { userProfile } = useAuthContext();

  if (!userProfile) return null;

  switch (userProfile.role) {
    case "older_adult":
      return <OlderAdultDashboard />;
    case "caregiver":
      return <CaregiverDashboard />;
    case "therapist":
      return <TherapistDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartItemCount={0} notificationCount={3} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:pl-64">{children}</main>
      </div>
    </div>
  );
};

function App() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading UnifiedCare...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={!user ? <LoginForm /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!user ? <RegisterForm /> : <Navigate to="/dashboard" />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardRouter />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/shop"
            element={
              <ProtectedRoute>
                <Layout>
                  <ShopPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <NotificationCenter />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Placeholder routes for development */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="max-w-4xl mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Messages
                    </h1>
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                      <p className="text-gray-600">
                        Messages feature coming soon...
                      </p>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscribe"
            element={
              <ProtectedRoute requiredRole={["older_adult"]}>
                <Layout>
                  <div className="max-w-4xl mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Subscription
                    </h1>
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                      <p className="text-gray-600">
                        Subscription management coming soon...
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Integration with Paystack for seamless payments
                      </p>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
