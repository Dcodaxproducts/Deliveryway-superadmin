import { Mail, MessageSquare, Slack, Users, HardDrive, AlertTriangle, Webhook, PowerOff } from 'lucide-react';

export const webhookLogsData = [
    { timestamp: "2025-12-26 14:32:15", eventType: "order.created", status: "Success", responseCode: 200, retryCount: 1 },
    { timestamp: "2025-12-26 14:32:15", eventType: "payment.completed", status: "Failed", responseCode: 400, retryCount: 0 },
    { timestamp: "2025-12-26 14:32:15", eventType: "order.updated", status: "Success", responseCode: 200, retryCount: 8 },
    { timestamp: "2025-12-26 14:32:15", eventType: "driver.assigned", status: "Success", responseCode: 400, retryCount: 4 },
    { timestamp: "2025-12-26 14:32:15", eventType: "invoice.generated", status: "Failed", responseCode: 200, retryCount: 3 },
];

export const notificationChannels = [
    { icon: Mail, label: "Email Alerts" },
    { icon: MessageSquare, label: "SMS Alerts" },
    { icon: Slack, label: "Slack Alerts" },
    { icon: Users, label: "Teams Alerts" },
];

export const alertTypes = [
    { icon: HardDrive, title: "Server Overload", description: "Notify when CPU or RAM exceeds critical threshold" },
    { icon: AlertTriangle, title: "API Failure Threshold", description: "Notify when API failure rate exceeds 2%" },
    { icon: Webhook, title: "Webhook Failures", description: "Notify when webhooks fail after 3 retry attempts" },
    { icon: PowerOff, title: "Printer Offline", description: "Notify when printers go offline or encounter errors" },
];

export const printerConnectivityLogsData = [
    { printerId: "PRT-001", restaurant: "Dragon Wok", location: "Los Angeles, CA", status: "Connected", lastConnected: "2 minutes ago", errorMessage: "---" },
    { printerId: "PRT-001", restaurant: "Bella Italia", location: "Los Angeles, CA", status: "Connected", lastConnected: "2 minutes ago", errorMessage: "---" },
    { printerId: "PRT-001", restaurant: "Bella Italia", location: "Los Angeles, CA", status: "Error", lastConnected: "2 hours ago", errorMessage: "Paper jam detected" },
    { printerId: "PRT-001", restaurant: "Bella Italia", location: "Los Angeles, CA", status: "Disconnected", lastConnected: "1 day ago", errorMessage: "Network connection lost" },
    { printerId: "PRT-001", restaurant: "Bella Italia", location: "Los Angeles, CA", status: "Connected", lastConnected: "2 minutes ago", errorMessage: "---" },
];
