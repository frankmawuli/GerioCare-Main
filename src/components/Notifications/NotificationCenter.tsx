import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Heart,
  DollarSign,
  Shield,
  Filter
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Notification } from '../../types';

export const NotificationCenter: React.FC = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const filters = [
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread' },
    { value: 'medication', label: 'Medication' },
    { value: 'journal', label: 'Journal' },
    { value: 'therapy', label: 'Therapy' },
    { value: 'payment', label: 'Payment' },
    { value: 'admin', label: 'Admin' },
    { value: 'system', label: 'System' },
  ];

  useEffect(() => {
    if (userProfile?.id) {
      fetchNotifications();
    }
  }, [userProfile]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, selectedFilter]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userProfile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    if (selectedFilter === 'unread') {
      filtered = filtered.filter(notif => !notif.is_read);
    } else if (selectedFilter !== 'all') {
      filtered = filtered.filter(notif => notif.type === selectedFilter);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userProfile?.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'journal':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'therapy':
        return <Heart className="h-5 w-5 text-purple-500" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'admin':
        return <Shield className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationBg = (type: string, isRead: boolean) => {
    const baseClasses = isRead ? 'bg-white' : 'bg-blue-50';
    const borderClasses = isRead ? 'border-gray-200' : 'border-blue-200';
    return `${baseClasses} ${borderClasses}`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
              Stay updated with your care activities and important alerts
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              {filter.value === 'unread' && unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${getNotificationBg(
                notification.type,
                notification.is_read
              )}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${
                        notification.is_read ? 'text-gray-900' : 'text-gray-900 font-semibold'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          notification.type === 'medication' ? 'bg-red-100 text-red-800' :
                          notification.type === 'journal' ? 'bg-blue-100 text-blue-800' :
                          notification.type === 'therapy' ? 'bg-purple-100 text-purple-800' :
                          notification.type === 'payment' ? 'bg-green-100 text-green-800' :
                          notification.type === 'admin' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="ml-4 flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Check className="h-4 w-4" />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedFilter === 'unread' ? 'No unread notifications' : 'No notifications found'}
            </h3>
            <p className="text-gray-600">
              {selectedFilter === 'unread' 
                ? 'All caught up! You have no unread notifications.'
                : selectedFilter === 'all' 
                  ? 'You\'ll see important updates and alerts here.'
                  : `No ${selectedFilter} notifications at this time.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};