"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  LogIn,
  RefreshCw,
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

// Dropdown options
const FOCUS_AREA_OPTIONS = [
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
  "Other"
];

const AVOID_TOPIC_OPTIONS = [
  "Politics",
  "Religion",
  "Violence",
  "Controversial Topics",
  "Adult Content",
  "Conspiracy Theories",
  "Negativity",
  "Misinformation",
  "Other"
];

const FORMAT_OPTIONS = [
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
  "Other"
];

function getClientTimezone(): string {
  if (typeof window === "undefined") return "UTC";
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [editedSettings, setEditedSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const timezones = useMemo(
    () => [
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
    ],
    []
  );

  // Load settings on mount
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      loadSettings();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session?.user?.email]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings/preferences", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to load settings");

      const data = await response.json();
      const clientTimezone = getClientTimezone();
      const settingsWithTimezone = {
        ...data.settings,
        timezone: data.settings.timezone || clientTimezone,
      };

      setSettings(settingsWithTimezone);
      setEditedSettings(settingsWithTimezone);
    } catch (error) {
      setAlertMessage({
        type: "error",
        message: (error as Error).message || "Failed to load settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!editedSettings) return;
    setSaving(true);
    try {
      const response = await fetch("/api/settings/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ settings: editedSettings }),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      const data = await response.json();
      setSettings(data.settings);
      setEditedSettings(data.settings);
      setIsEditMode(false);
      setAlertMessage({
        type: "success",
        message: "Changes have been saved",
      });
      setTimeout(() => setAlertMessage(null), 4000);
    } catch (error) {
      setAlertMessage({
        type: "error",
        message: (error as Error).message || "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedSettings(settings);
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <LogIn className="h-5 w-5" />
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                You need to be logged in to access settings.
              </p>
              <Button
                onClick={() => signIn()}
                className="bg-red-600 hover:bg-red-700"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!settings || !editedSettings) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                Error Loading Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                {alertMessage?.message || "Failed to load settings."}
              </p>
              <Button
                onClick={loadSettings}
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your email preferences and content filters
            </p>
          </div>
          {!isEditMode ? (
            <Button
              onClick={() => setIsEditMode(true)}
              size="lg"
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                size="lg"
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Alerts */}
        {alertMessage && (
          <Card
            className={
              alertMessage.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
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
                    : "text-red-800"
                }
              >
                {alertMessage.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Email Schedule */}
        <Card className="border-2 border-gray-200">
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
                  <span className="font-semibold text-gray-900">
                    Weekly Emails
                  </span>
                  <Badge
                    className={
                      editedSettings.emailEnabled
                        ? "bg-green-100 text-green-800 px-3 py-1"
                        : "bg-gray-100 text-gray-800 px-3 py-1"
                    }
                  >
                    {editedSettings.emailEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                {editedSettings.emailEnabled && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">
                        Frequency
                      </p>
                      <p className="font-semibold text-gray-900 mt-2 capitalize">
                        {editedSettings.emailFrequency}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">
                        Day
                      </p>
                      <p className="font-semibold text-gray-900 mt-2 capitalize">
                        {editedSettings.emailDay}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">
                        Time
                      </p>
                      <p className="font-semibold text-gray-900 mt-2">
                        {editedSettings.emailTime}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">
                        Timezone
                      </p>
                      <p className="font-semibold text-gray-900 mt-2">
                        {editedSettings.timezone}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">
                        Ideas per Email
                      </p>
                      <p className="font-semibold text-gray-900 mt-2">
                        {editedSettings.ideaCount}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition">
                  <input
                    type="checkbox"
                    checked={editedSettings.emailEnabled}
                    onChange={(e) =>
                      setEditedSettings({
                        ...editedSettings,
                        emailEnabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded cursor-pointer accent-purple-600"
                  />
                  <span className="font-semibold text-gray-900">
                    Enable weekly email ideas
                  </span>
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
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Day of Week
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
                          Time of Day
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
                        <input
                          type="text"
                          value={editedSettings.timezone}
                          disabled
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Auto-detected: {getClientTimezone()}
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Content Preferences */}
        <Card className="border-2 border-gray-200 bg-gradient-to-br from-white to-blue-50">
          <CardHeader>
            <CardTitle>🎯 Content Preferences</CardTitle>
            <p className="text-sm text-gray-600 mt-3">
              These preferences control which video ideas are generated and sent to your emails.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditMode ? (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-2">
                    📌 Focus Areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {editedSettings.preferences?.focusAreas &&
                    editedSettings.preferences.focusAreas.length > 0 ? (
                      editedSettings.preferences.focusAreas.map((area, i) => (
                        <Badge key={i} variant="secondary">
                          {area}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Not set</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-2">
                    Avoid Topics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {editedSettings.preferences?.avoidTopics &&
                    editedSettings.preferences.avoidTopics.length > 0 ? (
                      editedSettings.preferences.avoidTopics.map((topic, i) => (
                        <Badge key={i} variant="destructive">
                          {topic}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Not set</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-2">
                    Preferred Formats
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {editedSettings.preferences?.preferredFormats &&
                    editedSettings.preferences.preferredFormats.length > 0 ? (
                      editedSettings.preferences.preferredFormats.map((format, i) => (
                        <Badge key={i} variant="outline">
                          {format}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Not set</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Focus Areas Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Focus Areas (Select all that apply)
                  </label>
                  <div className="grid md:grid-cols-2 gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    {FOCUS_AREA_OPTIONS.map((area) => (
                      <label
                        key={area}
                        className="flex items-center gap-2 cursor-pointer hover:bg-blue-100 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={
                            editedSettings.preferences?.focusAreas?.includes(
                              area
                            ) || false
                          }
                          onChange={(e) => {
                            const areas =
                              editedSettings.preferences?.focusAreas || [];
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

                {/* Avoid Topics Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Avoid Topics (Select all that apply)
                  </label>
                  <div className="grid md:grid-cols-2 gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    {AVOID_TOPIC_OPTIONS.map((topic) => (
                      <label
                        key={topic}
                        className="flex items-center gap-2 cursor-pointer hover:bg-red-100 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={
                            editedSettings.preferences?.avoidTopics?.includes(
                              topic
                            ) || false
                          }
                          onChange={(e) => {
                            const topics =
                              editedSettings.preferences?.avoidTopics || [];
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

                {/* Preferred Formats Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Preferred Formats (Select all that apply)
                  </label>
                  <div className="grid md:grid-cols-2 gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    {FORMAT_OPTIONS.map((format) => (
                      <label
                        key={format}
                        className="flex items-center gap-2 cursor-pointer hover:bg-green-100 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={
                            editedSettings.preferences?.preferredFormats?.includes(
                              format
                            ) || false
                          }
                          onChange={(e) => {
                            const formats =
                              editedSettings.preferences?.preferredFormats || [];
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
      </div>
    </div>
  );
}