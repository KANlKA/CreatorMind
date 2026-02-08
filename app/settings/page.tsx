"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Settings as SettingsIcon,
  RotateCcw,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

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
  status: "sent" | "delivered" | "failed";
  ideaCount: number;
  sentAt: string;
  deliveredAt?: string;
  failureReason?: string;
};

type ChannelStatus = {
  isConnected: boolean;
  channelName?: string;
  syncStatus?: "syncing" | "synced" | "failed" | "disconnected";
  lastSyncedAt?: string;
};

// FOCUS AREA, AVOID TOPICS, FORMATS DROPDOWNS
const FOCUS_AREAS = [
  "AI & Machine Learning",
  "Business & Entrepreneurship",
  "Cooking & Recipes",
  "Digital Marketing",
  "Education & Learning",
  "Entertainment",
  "Fitness & Health",
  "Gaming",
  "Personal Development",
  "Programming",
  "Social Media Tips",
  "Technology & Science",
  "Travel & Lifestyle",
];

const AVOID_TOPICS = [
  "Politics",
  "Religion",
  "Violence",
  "Controversial Topics",
  "Adult Content",
  "Conspiracy Theories",
  "Negativity",
  "Misinformation",
];

const PREFERRED_FORMATS = [
  "Tutorial",
  "How-To",
  "Vlog",
  "Deep-Dive",
  "Review",
  "Tips & Tricks",
  "Commentary",
  "Interview",
  "Storytelling",
  "Educational",
  "Entertainment",
  "Short-Form (Shorts)",
];

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [editedSettings, setEditedSettings] = useState<Settings | null>(null);
  const [emailHistory, setEmailHistory] = useState<EmailLog[]>([]);
  const [channelStatus, setChannelStatus] = useState<ChannelStatus>({
    isConnected: false,
  });
  const [loading, setLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [clientTimezone, setClientTimezone] = useState<string>("UTC");
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const timezones = useMemo(() => {
    if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
      return (Intl as any).supportedValuesOf("timeZone") as string[];
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
      "Asia/Calcutta",
    ];
  }, []);

  const getClientTimezone = () => {
    if (typeof window === "undefined") return "UTC";
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  };

  // Auto-detect timezone on mount
  useEffect(() => {
    const tz = getClientTimezone();
    setClientTimezone(tz);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [prefRes, historyRes, channelRes] = await Promise.all([
          fetch("/api/settings/preferences"),
          fetch("/api/email/history?limit=5&page=1"),
          fetch("/api/youtube/connect"),
        ]);

        if (prefRes.ok) {
          const prefData = await prefRes.json();
          const defaultTimezone = prefData.settings.timezone || clientTimezone;
          setSettings({
            ...prefData.settings,
            timezone: defaultTimezone,
          });
          setEditedSettings({
            ...prefData.settings,
            timezone: defaultTimezone,
          });
        }

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setEmailHistory(historyData.emails);
          setTotalPages(historyData.pagination.pages);
        }

        if (channelRes.ok) {
          const channelData = await channelRes.json();
          setChannelStatus({
            isConnected: channelData.connected,
            channelName: channelData.channelName,
            syncStatus: channelData.connected ? (channelData.syncStatus || "synced") : "disconnected",
            lastSyncedAt: channelData.lastSyncedAt,
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        showAlert("Error loading settings", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientTimezone]);

  // Load email history for different pages
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/email/history?limit=5&page=${historyPage}`);
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

  const showAlert = (message: string, type: "success" | "error" | "info" = "info") => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const handleSaveSettings = async () => {
    if (!editedSettings) return;

    // Use client timezone if not manually changed
    const settingsToSave = {
      ...editedSettings,
      timezone: editedSettings.timezone || clientTimezone,
    };

    try {
      const res = await fetch("/api/settings/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (res.ok) {
        setSettings(settingsToSave);
        setIsEditMode(false);
        showAlert("Settings saved successfully!", "success");
      } else {
        showAlert("Error saving settings", "error");
      }
    } catch (error) {
      showAlert("Error saving settings", "error");
    }
  };

  const handleCancel = () => {
    setEditedSettings(settings);
    setIsEditMode(false);
  };

  const handleSendTestEmail = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/debug/send-email-now");
      const data = await res.json();
      if (data.success) {
        showAlert("Test email sent! Check your inbox.", "success");
        // Refresh email history
        const historyRes = await fetch("/api/email/history?limit=5&page=1");
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setEmailHistory(historyData.emails);
          setTotalPages(historyData.pagination.pages);
          setHistoryPage(1);
        }
      } else {
        showAlert(`Error: ${data.error}`, "error");
      }
    } catch (error) {
      showAlert("Error sending test email", "error");
    } finally {
      setSending(false);
    }
  };

  const handleResyncChannel = async () => {
    if (!channelStatus.isConnected) {
      showAlert("Channel not connected", "error");
      return;
    }

    setSyncing(true);
    setChannelStatus((prev) => ({
      ...prev,
      syncStatus: "syncing",
    }));

    try {
      const res = await fetch("/api/youtube/sync", { method: "POST" });
      if (res.ok) {
        showAlert("Channel sync started!", "success");
        
        // Refresh channel status after a delay
        setTimeout(async () => {
          const channelRes = await fetch("/api/youtube/connect");
          if (channelRes.ok) {
            const data = await channelRes.json();
            setChannelStatus({
              isConnected: data.connected,
              channelName: data.channelName,
              syncStatus: data.connected ? (data.syncStatus || "synced") : "disconnected",
              lastSyncedAt: data.lastSyncedAt,
            });
          }
        }, 3000);
      } else {
        showAlert("Error syncing channel", "error");
        setChannelStatus((prev) => ({
          ...prev,
          syncStatus: "failed",
        }));
      }
    } catch (error) {
      showAlert("Error syncing channel", "error");
      setChannelStatus((prev) => ({
        ...prev,
        syncStatus: "failed",
      }));
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnectChannel = async () => {
    if (!confirm("Are you sure you want to disconnect your YouTube channel?")) {
      return;
    }

    setDisconnecting(true);
    try {
      const res = await fetch("/api/youtube/disconnect", { method: "POST" });
      if (res.ok) {
        setChannelStatus({
          isConnected: false,
          syncStatus: "disconnected",
          lastSyncedAt: undefined,
        });
        showAlert("Channel disconnected successfully", "success");
      } else {
        showAlert("Error disconnecting channel", "error");
      }
    } catch (error) {
      showAlert("Error disconnecting channel", "error");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleConnectChannel = () => {
    router.push("/dashboard");
  };

  const getStatusColor = (status: "sent" | "delivered" | "failed") => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSyncStatusColor = (status?: string) => {
    switch (status) {
      case "synced":
        return "bg-green-100 text-green-800";
      case "syncing":
        return "bg-blue-100 text-blue-800 animate-pulse";
      case "failed":
        return "bg-red-100 text-red-800";
      case "disconnected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 pt-32">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!settings || !editedSettings) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 pt-32">
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
    <div className="min-h-screen bg-slate-50 p-6 pt-32">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-600">Manage your preferences and email settings</p>
          </div>
          {!isEditMode ? (
            <Button
              onClick={() => setIsEditMode(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveSettings}
                className="bg-green-600 hover:bg-green-700"
              >
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Alerts */}
        {alertMessage && (
          <Card
            className={`${
              alertMessage.type === "success"
                ? "border-green-200 bg-green-50"
                : alertMessage.type === "error"
                ? "border-red-200 bg-red-50"
                : "border-blue-200 bg-blue-50"
            }`}
          >
            <CardContent className="pt-6 flex items-center gap-3">
              {alertMessage.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              )}
              <p
                className={
                  alertMessage.type === "success"
                    ? "text-green-800"
                    : alertMessage.type === "error"
                    ? "text-red-800"
                    : "text-blue-800"
                }
              >
                {alertMessage.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Email Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Email Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditMode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                  <span className="font-semibold">Weekly Emails</span>
                  <Badge
                    className={
                      editedSettings.emailEnabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {editedSettings.emailEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                {editedSettings.emailEnabled && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-gray-600 uppercase font-medium">Frequency</p>
                      <p className="font-semibold mt-2 capitalize">
                        {editedSettings.emailFrequency === "weekly" && "Every Week"}
                        {editedSettings.emailFrequency === "biweekly" && "Every 2 Weeks"}
                        {editedSettings.emailFrequency === "monthly" && "Every Month"}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-gray-600 uppercase font-medium">Day</p>
                      <p className="font-semibold mt-2 capitalize">
                        {editedSettings.emailDay}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-gray-600 uppercase font-medium">Time</p>
                      <p className="font-semibold mt-2">{editedSettings.emailTime}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-gray-600 uppercase font-medium">Timezone</p>
                      <p className="font-semibold mt-2">{editedSettings.timezone}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-gray-600 uppercase font-medium">Ideas per Email</p>
                      <p className="font-semibold mt-2">{editedSettings.ideaCount}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedSettings.emailEnabled}
                    onChange={(e) =>
                      setEditedSettings({
                        ...editedSettings,
                        emailEnabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded accent-purple-600"
                  />
                  <span className="font-semibold">Enable email ideas</span>
                </label>

                {editedSettings.emailEnabled && (
                  <div className="space-y-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-dashed border-slate-300">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Frequency
                        </label>
                        <select
                          value={editedSettings.emailFrequency}
                          onChange={(e) =>
                            setEditedSettings({
                              ...editedSettings,
                              emailFrequency: e.target.value as any,
                            })
                          }
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-purple-500"
                        >
                          <option value="weekly">Weekly (Every Week)</option>
                          <option value="biweekly">Bi-Weekly (Every 2 Weeks)</option>
                          <option value="monthly">Monthly (Every Month)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Email sent once per frequency</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Day
                        </label>
                        <select
                          value={editedSettings.emailDay}
                          onChange={(e) =>
                            setEditedSettings({
                              ...editedSettings,
                              emailDay: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-purple-500"
                        >
                          {[
                            "sunday",
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                          ].map((day) => (
                            <option key={day} value={day}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Time
                        </label>
                        <input
                          type="time"
                          value={editedSettings.emailTime}
                          onChange={(e) =>
                            setEditedSettings({
                              ...editedSettings,
                              emailTime: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Timezone
                        </label>
                        <select
                          value={editedSettings.timezone || clientTimezone}
                          onChange={(e) =>
                            setEditedSettings({
                              ...editedSettings,
                              timezone: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-purple-500 max-h-48 overflow-y-auto"
                        >
                          {timezones.map((tz) => (
                            <option key={tz} value={tz}>
                              {tz}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Auto-detected: <strong>{clientTimezone}</strong>
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Number of Ideas per Email
                        </label>
                        <select
                          value={editedSettings.ideaCount}
                          onChange={(e) =>
                            setEditedSettings({
                              ...editedSettings,
                              ideaCount: parseInt(e.target.value),
                            })
                          }
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-purple-500"
                        >
                          <option value={3}>3 ideas</option>
                          <option value={5}>5 ideas</option>
                          <option value={10}>10 ideas</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSendTestEmail}
                  disabled={sending}
                  variant="outline"
                  className="w-full"
                >
                  {sending ? "Sending..." : "Send Test Email"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Content Preferences - WITH CHECKBOXES */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Content Preferences</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Select preferences to filter which video ideas are generated and sent to you
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditMode ? (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-3">📌 Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {editedSettings.preferences?.focusAreas &&
                    editedSettings.preferences.focusAreas.length > 0 ? (
                      editedSettings.preferences.focusAreas.map((area, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Not selected</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-3">🚫 Avoid Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {editedSettings.preferences?.avoidTopics &&
                    editedSettings.preferences.avoidTopics.length > 0 ? (
                      editedSettings.preferences.avoidTopics.map((topic, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          {topic}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Not selected</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-3">📹 Formats</p>
                  <div className="flex flex-wrap gap-2">
                    {editedSettings.preferences?.preferredFormats &&
                    editedSettings.preferences.preferredFormats.length > 0 ? (
                      editedSettings.preferences.preferredFormats.map((format, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {format}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Not selected</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Focus Areas Checkboxes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    📌 Focus Areas
                  </label>
                  <div className="grid md:grid-cols-2 gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    {FOCUS_AREAS.map((area) => (
                      <label key={area} className="flex items-center gap-2 cursor-pointer hover:bg-blue-100 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={editedSettings.preferences?.focusAreas?.includes(area) || false}
                          onChange={(e) => {
                            const areas = editedSettings.preferences?.focusAreas || [];
                            if (e.target.checked) {
                              areas.push(area);
                            } else {
                              const idx = areas.indexOf(area);
                              if (idx > -1) areas.splice(idx, 1);
                            }
                            setEditedSettings({
                              ...editedSettings,
                              preferences: {
                                ...editedSettings.preferences,
                                focusAreas: areas,
                              },
                            });
                          }}
                          className="w-4 h-4 rounded accent-blue-600"
                        />
                        <span className="text-sm text-gray-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Avoid Topics Checkboxes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    🚫 Avoid Topics
                  </label>
                  <div className="grid md:grid-cols-2 gap-2 p-4 bg-red-50 rounded-lg border border-red-200">
                    {AVOID_TOPICS.map((topic) => (
                      <label key={topic} className="flex items-center gap-2 cursor-pointer hover:bg-red-100 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={editedSettings.preferences?.avoidTopics?.includes(topic) || false}
                          onChange={(e) => {
                            const topics = editedSettings.preferences?.avoidTopics || [];
                            if (e.target.checked) {
                              topics.push(topic);
                            } else {
                              const idx = topics.indexOf(topic);
                              if (idx > -1) topics.splice(idx, 1);
                            }
                            setEditedSettings({
                              ...editedSettings,
                              preferences: {
                                ...editedSettings.preferences,
                                avoidTopics: topics,
                              },
                            });
                          }}
                          className="w-4 h-4 rounded accent-red-600"
                        />
                        <span className="text-sm text-gray-700">{topic}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preferred Formats Checkboxes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    📹 Preferred Formats
                  </label>
                  <div className="grid md:grid-cols-2 gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                    {PREFERRED_FORMATS.map((format) => (
                      <label key={format} className="flex items-center gap-2 cursor-pointer hover:bg-green-100 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={editedSettings.preferences?.preferredFormats?.includes(format) || false}
                          onChange={(e) => {
                            const formats = editedSettings.preferences?.preferredFormats || [];
                            if (e.target.checked) {
                              formats.push(format);
                            } else {
                              const idx = formats.indexOf(format);
                              if (idx > -1) formats.splice(idx, 1);
                            }
                            setEditedSettings({
                              ...editedSettings,
                              preferences: {
                                ...editedSettings.preferences,
                                preferredFormats: formats,
                              },
                            });
                          }}
                          className="w-4 h-4 rounded accent-green-600"
                        />
                        <span className="text-sm text-gray-700">{format}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
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
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-3 font-semibold">Status</th>
                        <th className="text-left py-3 px-3 font-semibold">Subject</th>
                        <th className="text-left py-3 px-3 font-semibold">Ideas</th>
                        <th className="text-left py-3 px-3 font-semibold">Date & Time</th>
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
                              {email.failureReason && (
                                <p className="text-xs text-red-600 mt-1">
                                  ⚠️ {email.failureReason}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-semibold">{email.ideaCount}</td>
                          <td className="py-3 px-3">
                            <p className="text-sm">{new Date(email.sentAt).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(email.sentAt).toLocaleTimeString()}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage === 1}
                      onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                    >
                      ◀ Previous
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={historyPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setHistoryPage(page)}
                          className={`min-w-[40px] ${
                            historyPage === page
                              ? "bg-purple-600 hover:bg-purple-700"
                              : ""
                          }`}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage === totalPages}
                      onClick={() =>
                        setHistoryPage(Math.min(totalPages, historyPage + 1))
                      }
                    >
                      Next ▶
                    </Button>
                  </div>
                )}

                <div className="text-center text-xs text-gray-500 mt-4">
                  Page {historyPage} of {totalPages} • Showing 5 emails per page
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Channel Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              YouTube Channel Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {channelStatus.isConnected ? (
              <>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-semibold">
                    {channelStatus.channelName}
                  </p>
                  <p className="text-sm text-blue-700 mt-3">
                    <span className="font-medium">Sync Status:</span>{" "}
                    <Badge className={`ml-2 ${getSyncStatusColor(channelStatus.syncStatus)}`}>
                      {channelStatus.syncStatus?.charAt(0).toUpperCase() +
                        (channelStatus.syncStatus?.slice(1) || "")}
                    </Badge>
                  </p>
                  {channelStatus.lastSyncedAt && (
                    <p className="text-sm text-blue-700 mt-2">
                      <span className="font-medium">Last Synced:</span>{" "}
                      {new Date(channelStatus.lastSyncedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={handleResyncChannel}
                    disabled={syncing || !channelStatus.isConnected}
                    className={`${
                      syncing || !channelStatus.isConnected
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-60 hover:bg-gray-400"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {syncing ? "Syncing..." : "Re-sync Channel"}
                  </Button>
                  <Button
                    onClick={handleDisconnectChannel}
                    disabled={disconnecting}
                    className={`${
                      disconnecting
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-60 hover:bg-gray-400"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {disconnecting ? "Disconnecting..." : "Disconnect Channel"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-800 font-semibold flex items-center gap-2">
                    Sync Status:
                    <Badge className={getSyncStatusColor(channelStatus.syncStatus)}>
                      Disconnected
                    </Badge>
                  </p>
                </div>

                <Button
                  onClick={handleConnectChannel}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Connect YouTube Channel
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}