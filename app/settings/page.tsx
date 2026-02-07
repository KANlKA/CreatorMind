"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Settings as SettingsIcon,
  RotateCcw,
  Trash2,
  Eye,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Settings = {
  emailEnabled: boolean;
  emailFrequency: "weekly" | "biweekly" | "monthly";
  emailDay: string;
  emailTime: string;
  timezone: string;
  ideaCount: number;
  preferences?: {
    focusAreas?: string[];
    avoidTopics?: string[];
    preferredFormats?: string[];
  };
};

type EmailLog = {
  id: string;
  subject: string;
  recipientEmail: string;
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed";
  ideaCount: number;
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  failureReason?: string;
};

type SyncStatus = {
  syncStatus: string;
  lastSyncedAt: string;
  channelName?: string;
  isConnected: boolean;
};


export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [emailHistory, setEmailHistory] = useState<EmailLog[]>([]);
  const [syncData, setSyncData] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sending, setSending] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [disconnectMessage, setDisconnectMessage] = useState<string | null>(null);
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false);
  const router = useRouter();

  const timezones = useMemo(() => {
    if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
      return Intl.supportedValuesOf("timeZone") as string[];
    }
    return [
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Paris",
      "Asia/Kolkata",
      "Asia/Singapore",
      "Australia/Sydney",
    ];
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prefRes, historyRes, syncRes] = await Promise.all([
          fetch("/api/settings/preferences"),
          fetch("/api/email/history?limit=10&page=1"),
          fetch("/api/youtube/history"),
        ]);

        if (prefRes.ok) {
          const prefData = await prefRes.json();
          setSettings(prefData.settings);
        }

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setEmailHistory(historyData.emails);
          setTotalPages(historyData.pagination.pages);
        }

        if (syncRes.ok) {
          const syncData = await syncRes.json();
          setSyncData(syncData);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load email history for different page
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(
          `/api/email/history?limit=10&page=${historyPage}`
        );
        if (res.ok) {
          const data = await res.json();
          setEmailHistory(data.emails);
        }
      } catch (error) {
        console.error("Error loading email history:", error);
      }
    };

    loadHistory();
  }, [historyPage]);

  const splitList = (value: string) =>
    value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  const joinList = (values?: string[]) =>
    values?.length ? values.join(", ") : "";

  const handleSendTestEmail = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/email/send-weekly", {
        method: "GET",
      });
      const data = await res.json();

      if (data.success) {
        setSaveMessage("Test email sent! Check your inbox.");
        setTimeout(() => setSaveMessage(null), 3000);

        // Refresh email history
        const historyRes = await fetch("/api/email/history?limit=10&page=1");
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setEmailHistory(historyData.emails);
        }
      } else {
        setSaveMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setSaveMessage("Error sending test email");
    } finally {
      setSending(false);
    }
  };

  const handleDisconnectChannel = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect your YouTube channel? You'll need to reconnect to continue using the app."
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/youtube/disconnect", {
        method: "POST",
      });

      if (res.ok) {
        setDisconnectMessage("Channel disconnected successfully");
        setSyncData({
          syncStatus: "disconnected",
          lastSyncedAt: "",
          channelName: "",
          isConnected: false,
        });
        setTimeout(() => {
          setDisconnectMessage(null);
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error) {
      setDisconnectMessage("Error disconnecting channel");
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      const res = await fetch("/api/settings/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        setSaveMessage("Settings saved successfully!");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage("Error saving settings");
      }
    } catch (error) {
      setSaveMessage("Error saving settings");
    }
  };

  const getStatusColor = (
    status: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed"
  ) => {
    switch (status) {
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "opened":
        return "bg-green-100 text-green-800";
      case "clicked":
        return "bg-green-100 text-green-800";
      case "bounced":
        return "bg-orange-100 text-orange-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">Error loading settings</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your preferences and email settings</p>
        </div>

        {saveMessage && (
          <Card
            className={`${
              saveMessage.includes("Error")
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <CardContent className="pt-6">
              <p
                className={
                  saveMessage.includes("Error")
                    ? "text-red-800"
                    : "text-green-800"
                }
              >
                {saveMessage}
              </p>
            </CardContent>
          </Card>
        )}

        {disconnectMessage && (
          <Card
            className={`${
              disconnectMessage.includes("Error")
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <CardContent className="pt-6">
              <p
                className={
                  disconnectMessage.includes("Error")
                    ? "text-red-800"
                    : "text-green-800"
                }
              >
                {disconnectMessage}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Email Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.emailEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, emailEnabled: e.target.checked })
                }
                className="w-4 h-4 rounded"
              />
              <span className="font-medium">Enable weekly email insights</span>
            </label>

            {settings.emailEnabled && (
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={settings.emailFrequency}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailFrequency: e.target.value as any,
                      })
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of week
                  </label>
                  <select
                    value={settings.emailDay}
                    onChange={(e) =>
                      setSettings({ ...settings, emailDay: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    {[
                      "sunday",
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time of day
                  </label>
                  <input
                    type="time"
                    value={settings.emailTime}
                    onChange={(e) =>
                      setSettings({ ...settings, emailTime: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings({ ...settings, timezone: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of ideas
                  </label>
                  <select
                    value={settings.ideaCount}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ideaCount: Number(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value={3}>3 ideas</option>
                    <option value={5}>5 ideas</option>
                    <option value={10}>10 ideas</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSendTestEmail}
                disabled={sending}
                variant="outline"
              >
                {sending ? "Sending..." : "Send Test Email"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content Preferences - WILL FILTER IDEAS SENT */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Content Preferences (Applied to Emails)</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              These preferences will filter which video ideas are generated and sent to you via email
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus areas (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g., AI, Machine Learning, Python"
                value={joinList(settings.preferences?.focusAreas)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    preferences: {
                      ...settings.preferences,
                      focusAreas: splitList(e.target.value),
                    },
                  })
                }
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Topics you want to prioritize in idea generation
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avoid topics (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g., Politics, Religion"
                value={joinList(settings.preferences?.avoidTopics)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    preferences: {
                      ...settings.preferences,
                      avoidTopics: splitList(e.target.value),
                    },
                  })
                }
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Topics to exclude from suggestions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred formats (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g., tutorial, vlog, deep-dive"
                value={joinList(settings.preferences?.preferredFormats)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    preferences: {
                      ...settings.preferences,
                      preferredFormats: splitList(e.target.value),
                    },
                  })
                }
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Video formats you prefer to create
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emailHistory.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No emails sent yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-3 font-semibold">
                        Status
                      </th>
                      <th className="text-left py-3 px-3 font-semibold">
                        Subject
                      </th>
                      <th className="text-left py-3 px-3 font-semibold">
                        Ideas Sent
                      </th>
                      <th className="text-left py-3 px-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailHistory.map((email) => (
                      <tr key={email.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <Badge className={getStatusColor(email.status)}>
                            {email.status.charAt(0).toUpperCase() +
                              email.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-medium">{email.subject}</p>
                            <p className="text-xs text-gray-500">
                              {email.recipientEmail}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-3">{email.ideaCount}</td>
                        <td className="py-3 px-3">
                          <div>
                            <p>
                              {new Date(email.sentAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(email.sentAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage === 1}
                      onClick={() =>
                        setHistoryPage(Math.max(1, historyPage - 1))
                      }
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Page {historyPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage === totalPages}
                      onClick={() =>
                        setHistoryPage(
                          Math.min(totalPages, historyPage + 1)
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

 {/* Channel Management */}
 
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <SettingsIcon className="h-5 w-5" />
      Channel Management
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">
    {/* Status box */}
    <div className="p-4 bg-slate-50 rounded-lg">
      <p className="text-sm text-gray-700 mb-2">
        <span className="font-medium">Sync Status:</span>{" "}
        {syncData?.syncStatus || "unknown"}
      </p>

      <p className="text-sm text-gray-700">
        <span className="font-medium">Last Synced:</span>{" "}
        {syncData?.lastSyncedAt
          ? new Date(syncData.lastSyncedAt).toLocaleString()
          : "Never"}
      </p>

      {/* Disconnected text — shown ONLY when disconnected */}
      {!syncData?.isConnected && (
        <p className="text-sm text-gray-700 mt-3">
          <strong>Your YouTube channel is disconnected.</strong>{" "}
          Connect again to keep using CreatorMind and receive personalized video
          ideas in your emails.
        </p>
      )}
    </div>

    {/* Action buttons */}
    <div className="flex gap-2 flex-wrap">
      {/* Re-sync button (always visible) */}
      <Button
        onClick={async () => {
          await fetch("/api/youtube/sync", { method: "POST" });
          const res = await fetch("/api/youtube/history");
          const data = await res.json();
          setSyncData(data);
        }}
        className="bg-purple-600 hover:bg-purple-700"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Re-sync Channel
      </Button>

      {/* Toggle Connect / Disconnect button */}
      <Button
        onClick={async () => {
          if (syncData?.isConnected) {
            // DISCONNECT
            if (
              confirm(
                "Are you sure you want to disconnect your YouTube channel?"
              )
            ) {
              await fetch("/api/youtube/disconnect", { method: "POST" });
              alert("Channel disconnected");

              // 🔥 update UI immediately
              setSyncData((prev) => ({
                ...(prev as SyncStatus),
                isConnected: false,
                syncStatus: "disconnected",
              }));
            }
          } else {
            // CONNECT
            await fetch("/api/youtube/connect", { method: "POST" });
            alert("Channel connected");

            // 🔥 update UI immediately
            setSyncData((prev) => ({
              ...(prev as SyncStatus),
              isConnected: true,
              syncStatus: "connected",
              lastSyncedAt: new Date().toISOString(),
            }));
          }
        }}
        variant="outline"
        className={
          syncData?.isConnected
            ? "text-red-600 hover:text-red-700 border-red-200"
            : "text-purple-600 hover:text-purple-700 border-purple-200"
        }
      >
        {syncData?.isConnected ? (
          <>
            <Trash2 className="mr-2 h-4 w-4" />
            Disconnect Channel
          </>
        ) : (
          <>
            <RotateCcw className="mr-2 h-4 w-4" />
            Connect Channel
          </>
        )}
      </Button>
    </div>
  </CardContent>
</Card>


        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleSaveSettings}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}