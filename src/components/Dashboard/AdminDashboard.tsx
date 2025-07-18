import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Settings,
  Plus,
  Shield,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch user stats
    const { data: usersData, count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch product stats
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Fetch order stats
    const { data: ordersData, count: ordersCount } = await supabase
      .from('orders')
      .select(`
        *,
        users (first_name, last_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate total revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed');

    const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // Count active subscriptions
    const { count: subscriptionsCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('is_subscribed', true);

    setStats({
      totalUsers: usersCount || 0,
      totalProducts: productsCount || 0,
      totalOrders: ordersCount || 0,
      totalRevenue,
      activeSubscriptions: subscriptionsCount || 0,
    });

    setRecentUsers(usersData || []);
    setRecentOrders(ordersData || []);
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={ShoppingCart}
          label="Products"
          value={stats.totalProducts}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Orders"
          value={stats.totalOrders}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          icon={Shield}
          label="Subscriptions"
          value={stats.activeSubscriptions}
          color="bg-indigo-100 text-indigo-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          to="/admin/users"
          className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Users className="h-5 w-5 mr-2" />
          Manage Users
        </Link>
        <Link
          to="/admin/products"
          className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Manage Products
        </Link>
        <Link
          to="/admin/assignments"
          className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Settings className="h-5 w-5 mr-2" />
          Assignments
        </Link>
        <Link
          to="/admin/reports"
          className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          View Reports
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          {recentUsers.length > 0 ? (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'therapist' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'caregiver' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              <Link
                to="/admin/users"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all users →
              </Link>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No users found</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <ShoppingCart className="h-6 w-6 text-green-500" />
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Order #{order.id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.users?.first_name} {order.users?.last_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${order.total_amount}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              <Link
                to="/admin/orders"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all orders →
              </Link>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};