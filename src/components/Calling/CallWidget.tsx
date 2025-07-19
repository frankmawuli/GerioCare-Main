import React, { useState } from "react";
import { Phone, PhoneCall, Clock, User, Heart } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface Contact {
  id: string;
  name: string;
  role: "caregiver" | "therapist" | "older_adult";
  phone: string;
  availability: "available" | "busy" | "offline";
  relationship?: string;
}

// Mock contacts data
const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Mary Johnson",
    role: "caregiver",
    phone: "+233241234567",
    availability: "available",
    relationship: "Primary Caregiver",
  },
  {
    id: "2",
    name: "Dr. Sarah Wilson",
    role: "therapist",
    phone: "+233241234568",
    availability: "available",
    relationship: "Physical Therapist",
  },
  {
    id: "3",
    name: "Emergency Contact",
    role: "caregiver",
    phone: "+233241234569",
    availability: "available",
    relationship: "Family Member",
  },
];

export const CallWidget: React.FC = () => {
  const { userProfile } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);

  // Only show calling features for authorized roles
  const canMakeCalls =
    userProfile?.role === "caregiver" ||
    userProfile?.role === "therapist" ||
    userProfile?.role === "older_adult";

  const makeCall = (contact: Contact) => {
    // Use the device's native phone functionality
    const phoneNumber = contact.phone.replace(/\s/g, "");
    window.location.href = `tel:${phoneNumber}`;

    // Log the call attempt
    const callLog = {
      id: Date.now().toString(),
      contact: contact.name,
      phone: contact.phone,
      timestamp: new Date().toISOString(),
      type: "outgoing",
    };

    setRecentCalls((prev) => [callLog, ...prev.slice(0, 4)]);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "text-green-500";
      case "busy":
        return "text-yellow-500";
      case "offline":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getAvailabilityBg = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-100";
      case "busy":
        return "bg-yellow-100";
      case "offline":
        return "bg-gray-100";
      default:
        return "bg-gray-100";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "caregiver":
        return <Heart className="w-5 h-5 text-green-600" />;
      case "therapist":
        return <User className="w-5 h-5 text-purple-600" />;
      case "older_adult":
        return <User className="w-5 h-5 text-blue-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!canMakeCalls) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Emergency Call Button */}
      {userProfile?.role === "older_adult" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Emergency Contact
            </h2>
            <p className="text-sm text-red-700 mb-4">
              Call your primary caregiver or emergency contact immediately
            </p>
            <button
              onClick={() => makeCall(contacts[0])}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Phone className="w-5 h-5" />
              <span className="font-medium">Emergency Call</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Contact List */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PhoneCall className="w-5 h-5 mr-2 text-blue-600" />
          {userProfile?.role === "older_adult"
            ? "My Care Team"
            : "Quick Contacts"}
        </h2>

        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getRoleIcon(contact.role)}
                <div>
                  <h3 className="font-medium text-gray-900">{contact.name}</h3>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">
                      {contact.relationship}
                    </p>
                    <div
                      className={`w-2 h-2 rounded-full ${getAvailabilityBg(
                        contact.availability
                      )}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          contact.availability === "available"
                            ? "bg-green-500"
                            : contact.availability === "busy"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs capitalize ${getAvailabilityColor(
                        contact.availability
                      )}`}
                    >
                      {contact.availability}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => makeCall(contact)}
                disabled={contact.availability === "offline"}
                className={`p-2 rounded-full transition-colors ${
                  contact.availability === "offline"
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                title={`Call ${contact.name}`}
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Calls */}
      {recentCalls.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-600" />
            Recent Calls
          </h2>

          <div className="space-y-2">
            {recentCalls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <div className="flex items-center space-x-3">
                  <PhoneCall className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {call.contact}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(call.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => (window.location.href = `tel:${call.phone}`)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Call back
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              How calling works
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Calls use your device's native phone app</li>
              <li>• Works offline - no internet required for calls</li>
              <li>• All call history is stored locally on your device</li>
              <li>• Emergency contacts are always available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
