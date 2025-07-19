import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  User,
  Phone,
  MessageCircle,
  Calendar,
  Plus,
  ShoppingCart,
  Bell,
  Activity,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { JournalWidget } from "../Journal/JournalWidget";
import { CallWidget } from "../Calling/CallWidget";

export const OlderAdultDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [carePlan, setCarePlan] = useState<any>(null);
  const [todayJournal, setTodayJournal] = useState<any>(null);
  const [caregiver, setCaregiver] = useState<any>(null);

  console.log(
    "🏠 OlderAdultDashboard: Component rendering with userProfile:",
    userProfile?.role
  );
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchDashboardData();
    }
  }, [userProfile]);

  const fetchDashboardData = async () => {
    // Fetch care plan
    const { data: carePlanData } = await supabase
      .from("care_plans")
      .select("*")
      .eq("user_id", userProfile?.id)
      .single();
    setCarePlan(carePlanData);

    // Fetch today's journal entry
    const today = new Date().toISOString().split("T")[0];
    const { data: journalData } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userProfile?.id)
      .eq("date", today)
      .single();
    setTodayJournal(journalData);

    // Fetch assigned caregiver
    if (userProfile?.assigned_caregiver_id) {
      const { data: caregiverData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userProfile.assigned_caregiver_id)
        .single();
      setCaregiver(caregiverData);
    }

    // Fetch recent orders
    const { data: ordersData } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (*)
        )
      `
      )
      .eq("user_id", userProfile?.id)
      .order("created_at", { ascending: false })
      .limit(3);
    setRecentOrders(ordersData || []);
  };

  if (!userProfile?.is_subscribed) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Heart className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Subscription Required
          </h3>
          <p className="text-yellow-700 mb-4">
            Please subscribe to access your personalized care dashboard and
            connect with caregivers.
          </p>
          <Link
            to="/subscribe"
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Subscribe Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile?.first_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your care overview for today
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Care Plan Widget */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Care Plan</h3>
            <Heart className="h-6 w-6 text-red-500" />
          </div>
          {carePlan ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Next appointment:</span>
                <p className="text-gray-900">
                  {new Date(carePlan.next_appointment).toLocaleDateString()}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Current goals:</span>
                <p className="text-gray-900">
                  {carePlan.current_goals || "Maintain wellness"}
                </p>
              </div>
              <Link
                to="/care-plan"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View full plan →
              </Link>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>No care plan set up yet</p>
              <Link
                to="/care-plan"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
              >
                Create care plan
              </Link>
            </div>
          )}
        </div>

        {/* Daily Journal Widget */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Today's Journal
            </h3>
            <Calendar className="h-6 w-6 text-blue-500" />
          </div>
          {todayJournal ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mood:</span>
                <span className="font-medium">{todayJournal.mood}/10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pain Level:</span>
                <span className="font-medium">
                  {todayJournal.pain_level}/10
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sleep:</span>
                <span className="font-medium">{todayJournal.sleep_hours}h</span>
              </div>
              <Link
                to="/journal"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View details →
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-3">No entry for today</p>
              <Link
                to="/journal"
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Link>
            </div>
          )}
        </div>

        {/* My Caregiver Widget */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              My Caregiver
            </h3>
            <User className="h-6 w-6 text-green-500" />
          </div>
          {caregiver ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {caregiver.first_name} {caregiver.last_name}
                  </p>
                  <p className="text-sm text-gray-600">Available today</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    (window.location.href = `tel:${caregiver.phone}`)
                  }
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </button>
                <Link
                  to="/messages"
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>No caregiver assigned</p>
              <p className="text-sm mt-1">Contact admin for assignment</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h3>
            <ShoppingCart className="h-6 w-6 text-purple-500" />
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Order #{order.id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.order_items?.length} items • ${order.total_amount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              <Link
                to="/orders"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all orders →
              </Link>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No orders yet</p>
              <Link
                to="/shop"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm mt-3"
              >
                Start shopping
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Daily Journal and Calling Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Journal Widget */}
        <div>
          <JournalWidget />
        </div>

        {/* Call Widget */}
        <div>
          <CallWidget />
        </div>
      </div>
    </div>
  );
};
