"use client";

import { useState } from "react";
import {
  CheckCircle,
  UserPlus,
  DollarSign,
  Bell,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

/**
 * Types
 */
type NotificationItem = {
  id: string;
  type: "reservation" | "payout" | "order" | "other";
  title?: string;
  description?: string;
  titleKey?: string;
  descriptionKey?: string;
  status?: "PENDING" | "COMPLETED";
  createdAt?: string;
};

interface Props {
  notifications?: NotificationItem[];
  loading?: boolean;
  selectedTab?: string;
  setSelectedTab?: (tab: string) => void;
}

/**
 * ✅ Static fallback data
 */
const STATIC_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "reservation",
    titleKey: "newReservation",
    descriptionKey: "reservationDescription",
    status: "PENDING",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    type: "payout",
    titleKey: "payoutProcessed",
    descriptionKey: "payoutDescription",
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    type: "order",
    titleKey: "orderCompleted",
    descriptionKey: "orderDescription",
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    type: "other",
    titleKey: "systemAlert",
    descriptionKey: "systemAlertDescription",
    status: "PENDING",
    createdAt: new Date().toISOString(),
  },
];

export default function Notifications({
  notifications,
  loading = false,
  selectedTab,
  setSelectedTab,
}: Props) {
  const common = useTranslations("common");
  const notificationSettings = useTranslations("notificationSettings");
  /**
   * ✅ Internal fallback state (if props not provided)
   */
  const [internalTab, setInternalTab] = useState("all");

  const activeTab = selectedTab ?? internalTab;
  const handleTabChange = setSelectedTab ?? setInternalTab;

  /**
   * ✅ Use static data if no props
   */
  const data = notifications?.length
    ? notifications
    : STATIC_NOTIFICATIONS;

  const getIcon = (type: string) => {
    switch (type) {
      case "reservation":
        return <UserPlus />;
      case "payout":
        return <DollarSign />;
      case "order":
        return <CheckCircle />;
      default:
        return <Bell />;
    }
  };

  const filteredNotifications =
    activeTab === "all"
      ? data
      : data.filter((n) => n.status === "PENDING");

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="mb-4">
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === "all"
                ? "text-primary"
                : "text-gray-600"
            }`}
            onClick={() => handleTabChange("all")}
          >
            {notificationSettings("all")}
          </button>

          <button
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === "pending"
                ? "text-primary"
                : "text-gray-600"
            }`}
            onClick={() => handleTabChange("pending")}
          >
            {notificationSettings("pending")}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-sm text-gray-400">
          {notificationSettings("loadingNotifications")}
        </p>
      )}

      {/* Empty */}
      {!loading && filteredNotifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Bell className="text-gray-300 mb-3" size={40} />
          <p className="text-gray-500 text-sm">
            {notificationSettings("noNotificationsFound")}
          </p>
        </div>
      )}

      {/* List */}
      {!loading &&
        filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className="bg-white shadow-sm hover:shadow-lg transition-all"
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary text-white rounded-full">
                  {getIcon(notification.type)}
                </div>

                <div>
                  <CardTitle className="font-semibold text-gray-900 mb-1">
                    {notification.title ||
                      (notification.titleKey
                        ? notificationSettings(notification.titleKey)
                        : notificationSettings("notification"))}
                  </CardTitle>

                  <p className="text-sm text-gray-500">
                    {notification.description ||
                      (notification.descriptionKey
                        ? notificationSettings(notification.descriptionKey)
                        : common("noDataFound"))}
                  </p>
                </div>
              </div>

              <span className="text-xs text-gray-400">
                {notification.createdAt
                  ? new Date(
                      notification.createdAt
                    ).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : ""}
              </span>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
