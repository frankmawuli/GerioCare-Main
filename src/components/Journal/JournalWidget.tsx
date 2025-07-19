import React, { useState, useEffect } from "react";
import {
  Calendar,
  Heart,
  Moon,
  Activity,
  Save,
  Clock,
  TrendingUp,
  Smile,
  Frown,
  Meh,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { JournalEntry } from "../../types";

const mockJournalEntries: JournalEntry[] = [
  {
    id: "1",
    user_id: "user-1",
    mood: 4,
    pain_level: 2,
    sleep_hours: 7,
    notes: "Had a great day with family. Feeling energetic and positive.",
    date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: "user-1",
    mood: 3,
    pain_level: 3,
    sleep_hours: 6,
    notes: "Mild discomfort in knees but managed daily activities well.",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const JournalWidget: React.FC = () => {
  const { userProfile } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    mood: 3,
    pain_level: 1,
    sleep_hours: 8,
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isEditing, setIsEditing] = useState(false);

  // Check if today's entry exists
  const todayEntry = entries.find((entry) => entry.date === currentEntry.date);

  const getMoodIcon = (mood: number) => {
    if (mood >= 4) return <Smile className="w-6 h-6 text-green-500" />;
    if (mood >= 3) return <Meh className="w-6 h-6 text-yellow-500" />;
    return <Frown className="w-6 h-6 text-red-500" />;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return "bg-green-100 text-green-800";
    if (mood >= 3) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getPainColor = (level: number) => {
    if (level <= 2) return "bg-green-100 text-green-800";
    if (level <= 3) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const saveEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      user_id: userProfile?.id || "user-1",
      mood: currentEntry.mood || 3,
      pain_level: currentEntry.pain_level || 1,
      sleep_hours: currentEntry.sleep_hours || 8,
      notes: currentEntry.notes || "",
      date: currentEntry.date || new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString(),
    };

    if (todayEntry) {
      // Update existing entry
      setEntries((prev) =>
        prev.map((entry) =>
          entry.date === currentEntry.date
            ? { ...newEntry, id: entry.id }
            : entry
        )
      );
    } else {
      // Add new entry
      setEntries((prev) => [newEntry, ...prev]);
    }

    setIsEditing(false);
  };

  const getWeeklyAverage = () => {
    const recentEntries = entries.slice(0, 7);
    if (recentEntries.length === 0) return { mood: 0, pain: 0, sleep: 0 };

    const totals = recentEntries.reduce(
      (acc, entry) => ({
        mood: acc.mood + entry.mood,
        pain: acc.pain + entry.pain_level,
        sleep: acc.sleep + entry.sleep_hours,
      }),
      { mood: 0, pain: 0, sleep: 0 }
    );

    return {
      mood: Math.round((totals.mood / recentEntries.length) * 10) / 10,
      pain: Math.round((totals.pain / recentEntries.length) * 10) / 10,
      sleep: Math.round((totals.sleep / recentEntries.length) * 10) / 10,
    };
  };

  const weeklyAvg = getWeeklyAverage();

  return (
    <div className="space-y-6">
      {/* Today's Entry */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Daily Journal
          </h2>
          {!isEditing && !todayEntry && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Add Today's Entry
            </button>
          )}
        </div>

        {todayEntry && !isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Today's Wellbeing</h3>
              <button
                onClick={() => {
                  setCurrentEntry({
                    mood: todayEntry.mood,
                    pain_level: todayEntry.pain_level,
                    sleep_hours: todayEntry.sleep_hours,
                    notes: todayEntry.notes,
                    date: todayEntry.date,
                  });
                  setIsEditing(true);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getMoodIcon(todayEntry.mood)}
                <div>
                  <p className="text-sm font-medium text-gray-900">Mood</p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getMoodColor(
                      todayEntry.mood
                    )}`}
                  >
                    {todayEntry.mood}/5
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Heart className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Pain Level
                  </p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getPainColor(
                      todayEntry.pain_level
                    )}`}
                  >
                    {todayEntry.pain_level}/5
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Moon className="w-6 h-6 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sleep</p>
                  <span className="text-sm text-gray-600">
                    {todayEntry.sleep_hours} hours
                  </span>
                </div>
              </div>
            </div>

            {todayEntry.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Notes</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {todayEntry.notes}
                </p>
              </div>
            )}
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood (1-5)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() =>
                        setCurrentEntry((prev) => ({ ...prev, mood: value }))
                      }
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        currentEntry.mood === value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pain Level (1-5)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() =>
                        setCurrentEntry((prev) => ({
                          ...prev,
                          pain_level: value,
                        }))
                      }
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        currentEntry.pain_level === value
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={currentEntry.sleep_hours}
                  onChange={(e) =>
                    setCurrentEntry((prev) => ({
                      ...prev,
                      sleep_hours: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={currentEntry.notes}
                onChange={(e) =>
                  setCurrentEntry((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="How are you feeling today? Any thoughts or observations..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={saveEntry}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Entry</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No entry for today
            </h3>
            <p className="text-gray-600 mb-4">
              Track your mood, pain level, and sleep to monitor your wellbeing
            </p>
          </div>
        )}
      </div>

      {/* Weekly Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Weekly Average
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {weeklyAvg.mood}
            </div>
            <div className="text-sm text-blue-700">Mood Score</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {weeklyAvg.pain}
            </div>
            <div className="text-sm text-red-700">Pain Level</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {weeklyAvg.sleep}h
            </div>
            <div className="text-sm text-indigo-700">Sleep</div>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-600" />
          Recent Entries
        </h3>

        <div className="space-y-3">
          {entries.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-900">
                  {new Date(entry.date).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  {getMoodIcon(entry.mood)}
                  <span className="text-xs text-gray-600">
                    Mood: {entry.mood}/5
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-gray-600">
                    Pain: {entry.pain_level}/5
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs text-gray-600">
                    {entry.sleep_hours}h
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
