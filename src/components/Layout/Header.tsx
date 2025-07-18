import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  ShoppingCart, 
  User, 
  Bell,
  ChevronDown,
  LogOut,
  Heart
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  cartItemCount?: number;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  cartItemCount = 0, 
  notificationCount = 0 
}) => {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      older_adult: 'bg-blue-100 text-blue-800',
      caregiver: 'bg-green-100 text-green-800',
      therapist: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">UnifiedCare</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link 
              to="/messages" 
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Messages</span>
            </Link>
            <Link 
              to="/shop" 
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Shop</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link 
              to="/notifications" 
              className="relative text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Bell className="h-6 w-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <User className="h-6 w-6" />
                <span className="hidden md:block">
                  {userProfile?.first_name} {userProfile?.last_name}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {userProfile?.first_name} {userProfile?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{userProfile?.email}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getRoleBadgeColor(userProfile?.role || '')}`}>
                          {userProfile?.role?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Profile Settings
                    </Link>
                    {userProfile?.role === 'older_adult' && (
                      <Link
                        to="/subscription"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Subscription
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleSignOut();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50">
        <div className="flex justify-around py-2">
          <Link to="/dashboard" className="flex flex-col items-center py-2 text-gray-600">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/messages" className="flex flex-col items-center py-2 text-gray-600">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs mt-1">Messages</span>
          </Link>
          <Link to="/shop" className="flex flex-col items-center py-2 text-gray-600 relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs mt-1">Shop</span>
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-3 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          <Link to="/notifications" className="flex flex-col items-center py-2 text-gray-600 relative">
            <Bell className="h-5 w-5" />
            <span className="text-xs mt-1">Alerts</span>
            {notificationCount > 0 && (
              <span className="absolute top-0 right-3 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};