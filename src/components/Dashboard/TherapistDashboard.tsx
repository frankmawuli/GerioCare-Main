import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Phone, 
  MessageCircle, 
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  Plus
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export const TherapistDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [todaySessions, setTodaySessions] = useState<any[]>([]);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    sessionsToday: 0,
    notesThisWeek: 0,
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
      .eq('therapist_id', userProfile?.id);

    const clientsList = assignmentsData?.map(a => a.older_adult) || [];
    setClients(clientsList);

    // Fetch today's sessions
    const today = new Date().toISOString().split('T')[0];
    const { data: sessionsData } = await supabase
      .from('therapy_sessions')
      .select(`
        *,
        client:users (first_name, last_name)
      `)
      .eq('therapist_id', userProfile?.id)
      .eq('date', today)
      .order('time', { ascending: true });
    setTodaySessions(sessionsData || []);

    // Fetch recent notes
    const { data: notesData } = await supabase
      .from('therapy_notes')
      .select(`
        *,
        client:users (first_name, last_name)
      `)
      .eq('therapist_id', userProfile?.id)
      .order('created_at', { ascending: false })
      .limit(3);
    setRecentNotes(notesData || []);

    // Calculate stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { count: notesThisWeekCount } = await supabase
      .from('therapy_notes')
      .select('*', { count: 'exact' })
      .eq('therapist_id', userProfile?.id)
      .gte('created_at', oneWeekAgo.toISOString());

    setStats({
      totalClients: clientsList.length,
      sessionsToday: sessionsData?.length || 0,
      notesThisWeek: notesThisWeekCount || 0,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, Dr. {userProfile?.last_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Your therapy practice overview for today
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
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sessions Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sessionsToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notes This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.notesThisWeek}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Sessions */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Today's Sessions</h3>
            <Calendar className="h-6 w-6 text-purple-500" />
          </div>
          {todaySessions.length > 0 ? (
            <div className="space-y-4">
              {todaySessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.client?.first_name} {session.client?.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {session.time} • {session.type || 'General Session'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.location.href = `tel:${session.client?.phone}`}
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
                to="/sessions"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                View all sessions →
              </Link>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No sessions scheduled for today</p>
              <Link
                to="/sessions"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Schedule session
              </Link>
            </div>
          )}
        </div>

        {/* My Clients */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Clients</h3>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          {clients.length > 0 ? (
            <div className="space-y-4">
              {clients.slice(0, 4).map((client) => (
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
                        Last session: 2 days ago
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

        {/* Recent Session Notes */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Session Notes</h3>
            <FileText className="h-6 w-6 text-green-500" />
          </div>
          {recentNotes.length > 0 ? (
            <div className="space-y-4">
              {recentNotes.map((note) => (
                <div key={note.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        Session with {note.client?.first_name} {note.client?.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(note.created_at).toLocaleDateString()} • {note.session_type}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Completed
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {note.notes || 'Session completed successfully. Client showed good progress.'}
                  </p>
                </div>
              ))}
              <Link
                to="/notes"
                className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View all notes →
              </Link>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No session notes yet</p>
              <Link
                to="/notes"
                className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add session note
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};