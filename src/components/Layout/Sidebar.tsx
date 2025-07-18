import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText,
  Settings,
  Shield,
  Heart,
  Phone,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const { userProfile } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    const role = userProfile?.role;
    
    switch (role) {
      case 'older_adult':
        return [
          { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/care-plan', icon: Heart, label: 'Care Plan' },
          { path: '/journal', icon: BookOpen, label: 'Daily Journal' },
          { path: '/my-caregiver', icon: Users, label: 'My Caregiver' },
        ];
      
      case 'caregiver':
        return [
          { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/my-clients', icon: Users, label: 'My Clients' },
          { path: '/tasks', icon: Calendar, label: 'Tasks' },
          { path: '/reports', icon: TrendingUp, label: 'Reports' },
        ];
      
      case 'therapist':
        return [
          { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/my-clients', icon: Users, label: 'My Clients' },
          { path: '/sessions', icon: Calendar, label: 'Sessions' },
          { path: '/notes', icon: FileText, label: 'Session Notes' },
          { path: '/reports', icon: TrendingUp, label: 'Reports' },
        ];
      
      case 'admin':
        return [
          { path: '/admin', icon: Shield, label: 'Admin Panel' },
          { path: '/admin/users', icon: Users, label: 'User Management' },
          { path: '/admin/products', icon: Settings, label: 'Product Management' },
          { path: '/admin/assignments', icon: Calendar, label: 'Assignments' },
          { path: '/admin/reports', icon: TrendingUp, label: 'System Reports' },
        ];
      
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:top-16 lg:bg-white lg:border-r lg:border-gray-200">
      <div className="flex-1 flex flex-col min-h-0 bg-white">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${
                    isActive(item.path)
                      ? 'bg-blue-50 border-blue-500 text-blue-700 border-r-2'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                >
                  <Icon
                    className={`${
                      isActive(item.path) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 h-5 w-5 transition-colors duration-150`}
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="space-y-2">
            {(userProfile?.role === 'caregiver' || userProfile?.role === 'therapist') && (
              <button
                onClick={() => {
                  // Native phone dialing
                  if (userProfile?.phone) {
                    window.location.href = `tel:${userProfile.phone}`;
                  }
                }}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Phone className="h-4 w-4 mr-2" />
                Emergency Call
              </button>
            )}
            <Link
              to="/shop"
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Heart className="h-4 w-4 mr-2" />
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};