import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { CreditCard, Calendar, AlertCircle, CheckCircle } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: "monthly" | "quarterly" | "yearly";
  features: string[];
  recommended?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "therapy-session",
    name: "One-time Therapy Session",
    price: 5000, // GHS 50
    duration: "monthly",
    features: [
      "Single therapy session",
      "Basic care plan",
      "Limited shop access",
    ],
  },
  {
    id: "monthly",
    name: "Monthly Care Plan",
    price: 15000, // GHS 150
    duration: "monthly",
    features: [
      "Unlimited therapy sessions",
      "Full care plan",
      "Complete shop access",
      "Caregiver assignment",
    ],
    recommended: true,
  },
  {
    id: "quarterly",
    name: "Quarterly Care Plan",
    price: 40000, // GHS 400 (save GHS 50)
    duration: "quarterly",
    features: [
      "Unlimited therapy sessions",
      "Full care plan",
      "Complete shop access",
      "Priority caregiver assignment",
      "10% shop discount",
    ],
  },
  {
    id: "yearly",
    name: "Yearly Care Plan",
    price: 150000, // GHS 1500 (save GHS 300)
    duration: "yearly",
    features: [
      "Unlimited therapy sessions",
      "Full care plan",
      "Complete shop access",
      "Priority caregiver assignment",
      "20% shop discount",
      "Monthly health reports",
    ],
  },
];

export const SubscriptionPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile_money">(
    "card"
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(true);

    try {
      // TODO: Integrate with Paystack
      const plan = subscriptionPlans.find((p) => p.id === planId);

      // Mock payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Processing subscription:", {
        planId,
        paymentMethod,
        amount: plan?.price,
      });

      // Redirect to dashboard after successful payment
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Care Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to UnifiedCare! Select a subscription plan to access our
            comprehensive care management platform.
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all duration-200 hover:shadow-lg ${
                plan.recommended
                  ? "border-blue-500 relative"
                  : selectedPlan === plan.id
                  ? "border-blue-400"
                  : "border-gray-200"
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Recommended
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ₵{(plan.price / 100).toFixed(2)}
                </div>
                <p className="text-gray-500 capitalize">{plan.duration}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isProcessing}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.recommended
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isProcessing ? "Processing..." : "Select Plan"}
              </button>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Payment Methods
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                paymentMethod === "card"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() => setPaymentMethod("card")}
            >
              <div className="flex items-center">
                <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    Credit/Debit Card
                  </h3>
                  <p className="text-sm text-gray-600">
                    Visa, Mastercard, Verve
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                paymentMethod === "mobile_money"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() => setPaymentMethod("mobile_money")}
            >
              <div className="flex items-center">
                <Calendar className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Mobile Money</h3>
                  <p className="text-sm text-gray-600">
                    MTN, Vodafone, AirtelTigo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Subscription Status */}
        {userProfile?.is_subscribed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-green-900">
                  Active Subscription
                </h3>
                <p className="text-sm text-green-700">
                  Your subscription is active until{" "}
                  {userProfile.subscription_expires_at || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900">Secure Payment</h3>
              <p className="text-sm text-blue-700">
                All payments are processed securely through Paystack. Your card
                information is never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
