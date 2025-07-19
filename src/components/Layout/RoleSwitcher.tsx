import React, { useState } from "react";
import { ChevronDown, User, Users, Stethoscope, Shield } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: "older_adult" | "caregiver" | "therapist" | "admin";
  availableRoles: Array<"older_adult" | "caregiver" | "therapist" | "admin">;
  onRoleChange: (
    role: "older_adult" | "caregiver" | "therapist" | "admin"
  ) => void;
}

const roleConfig = {
  older_adult: {
    label: "Older Adult",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  caregiver: {
    label: "Caregiver",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  therapist: {
    label: "Therapist",
    icon: Stethoscope,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
};

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  availableRoles,
  onRoleChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Only show switcher if user has multiple roles
  if (availableRoles.length <= 1) {
    return null;
  }

  const currentConfig = roleConfig[currentRole];
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${currentConfig.bgColor} border-gray-200 hover:border-gray-300`}
      >
        <CurrentIcon className={`w-4 h-4 ${currentConfig.color}`} />
        <span className="text-sm font-medium text-gray-900">
          {currentConfig.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {availableRoles.map((role) => {
              if (role === currentRole) return null;

              const config = roleConfig[role];
              const Icon = config.icon;

              return (
                <button
                  key={role}
                  onClick={() => {
                    onRoleChange(role);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="text-sm text-gray-900">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
