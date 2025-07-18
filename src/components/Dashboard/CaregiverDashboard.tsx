import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Phone, 
  MessageCircle, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export const CaregiverDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    completedTasks: 0,
    pendingAlerts: 0,
  });

  useEffect(() => {
    if (userProfile?.id) {
      fetchDashboardData();
    }
  }, [userProfile]);

  const fetchDashboardData = async () => {
    // Fetch assigned clients
    const { data: assignmentsData } = await supabase
      .from('assignments')
      .select(`
        *,
        older_adult:users!assignments_older_adult_id_fkey (*)
      `)
      .eq('caregiver_id', userProfile?.id);

    const clientsList = assignmentsData?.map(a => a.older_adult) || [];
    setClients(clientsList);

    // Fetch alerts for assigned clients
    const clientIds = clientsList.map(client => client.id);
    if (clientIds.length > 0) {
      const { data: alertsData } = await supabase
        .from('notifications')
        .select('*')
        .in('user_id', clientIds)
        .eq('type', 'medication')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      setAlerts(alertsData || []);
    }

    // Fetch today's tasks
    const today = new Date().toISOString().split('T')[0];
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userProfile?.id)
      .eq('due_date', today);
    setTodayTasks(tasksData || []);

    // Calculate stats
    setStats({
      totalClients: clientsList.length,
      completedTasks: todayTasks.filter(task => task.completed).length,
      pendingAlerts: alerts.length,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Good day, {userProfile?.first_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your clients and tasks
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Clients */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Clients</h3>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          {clients.length > 0 ? (
            <div className="space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {client.first_name} {client.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Last contact: Today
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.location.href = `tel:${client.phone}`}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                      title="Call client"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                    <Link
                      to="/messages"
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                      title="Message client"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
              <Link
                to="/my-clients"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all clients →
              </Link>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No clients assigned yet</p>
              <p className="text-sm mt-1">Contact admin for client assignments</p>
            </div>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Today's Tasks</h3>
            <Calendar className="h-6 w-6 text-purple-500" />
          </div>
          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      className="h-4 w-4 text-blue-600 rounded"
                      readOnly
                    />
                    <div>
                      <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">{task.description}</p>
                    </div>
                  </div>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
              ))}
              <Link
                to="/tasks"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all tasks →
              </Link>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No tasks scheduled for today</p>
              <Link
                to="/tasks"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
              >
                View task calendar
              </Link>
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Address
                  </button>
                </div>
              ))}
              <Link
                to="/notifications"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all alerts →
              </Link>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p>No pending alerts</p>
              <p className="text-sm mt-1">All clients are doing well!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};