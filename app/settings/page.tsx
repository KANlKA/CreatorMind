"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<{
    lastSentAt: string | null;
    queueCounts: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings/preferences")
      .then(res => res.json())
      .then(data => {
        setSettings(data.settings);
        setEmailStatus(data.emailStatus || null);
      });
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch("/api/youtube/history");
        if (!res.ok) return;
        const text = await res.text();
        if (!text) return;
        const data = JSON.parse(text);
        setSyncStatus(data.syncStatus || null);
        setLastSyncedAt(data.lastSyncedAt || null);
      } catch {
        // ignore transient parse/network errors
      }
    };
    loadHistory();
  }, []);

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

  if (!settings) return <p>Loading...</p>;

  const splitList = (value: string) =>
    value
      .split(",")
      .map(v => v.trim())
      .filter(Boolean);

  const joinList = (values?: string[]) => (values?.length ? values.join(", ") : "");

  const refreshEmailStatus = async () => {
    const res = await fetch("/api/settings/preferences");
    const data = await res.json();
    setEmailStatus(data.emailStatus || null);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Email Preferences</h2>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.emailEnabled}
            onChange={(e) =>
              setSettings({ ...settings, emailEnabled: e.target.checked })
            }
          />
          Enable weekly email insights
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm text-gray-600">Frequency</span>
            <select
              value={settings.emailFrequency}
              onChange={(e) =>
                setSettings({ ...settings, emailFrequency: e.target.value as Settings["emailFrequency"] })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-600">Day of week</span>
            <select
              value={settings.emailDay}
              onChange={(e) =>
                setSettings({ ...settings, emailDay: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            >
              {["sunday","monday","tuesday","wednesday","thursday","friday","saturday"].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-600">Time of day</span>
            <input
              type="time"
              value={settings.emailTime}
              onChange={(e) =>
                setSettings({ ...settings, emailTime: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-600">Timezone</span>
            <select
              value={settings.timezone}
              onChange={(e) =>
                setSettings({ ...settings, timezone: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-600">Number of ideas</span>
            <select
              value={settings.ideaCount}
              onChange={(e) =>
                setSettings({ ...settings, ideaCount: Number(e.target.value) })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value={3}>3 ideas</option>
              <option value={5}>5 ideas</option>
              <option value={10}>10 ideas</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              await fetch("/api/email/send-test", { method: "POST" });
              alert("Test email sent!");
              await refreshEmailStatus();
            }}
            className="border px-4 py-2 rounded"
          >
            Send test email
          </button>
          <button
            onClick={async () => {
              await fetch("/api/jobs/weekly-insights", { method: "POST" });
              alert("Weekly insights job queued!");
              await refreshEmailStatus();
            }}
            className="border px-4 py-2 rounded"
          >
            Queue weekly insights
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Email Status</h2>
        <div className="text-sm text-gray-600">
          Last sent:{" "}
          {emailStatus?.lastSentAt
            ? new Date(emailStatus.lastSentAt).toLocaleString()
            : "N/A"}
        </div>
        <div className="text-sm text-gray-600">
          Queue:{" "}
          {emailStatus?.queueCounts
            ? Object.entries(emailStatus.queueCounts)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" | ")
            : "N/A"}
        </div>
        <button
          onClick={refreshEmailStatus}
          className="border px-4 py-2 rounded"
        >
          Refresh email status
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Content Preferences</h2>

        <label className="space-y-1 block">
          <span className="text-sm text-gray-600">Focus areas (comma-separated)</span>
          <input
            type="text"
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
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-sm text-gray-600">Avoid topics (comma-separated)</span>
          <input
            type="text"
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
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-sm text-gray-600">Preferred formats (comma-separated)</span>
          <input
            type="text"
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
            className="w-full border rounded px-3 py-2"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Channel Management</h2>
        <div className="text-sm text-gray-600">
          Sync status: {syncStatus || "unknown"} | Last synced: {lastSyncedAt || "N/A"}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              await fetch("/api/youtube/sync", { method: "POST" });
              const res = await fetch("/api/youtube/history");
              const data = await res.json();
              setSyncStatus(data.syncStatus || null);
              setLastSyncedAt(data.lastSyncedAt || null);
            }}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Re-sync channel data
          </button>
          <button
            onClick={async () => {
              await fetch("/api/youtube/disconnect", { method: "POST" });
            }}
            className="border px-4 py-2 rounded"
          >
            Disconnect channel
          </button>
          <button
            onClick={async () => {
              const res = await fetch("/api/youtube/history");
              const data = await res.json();
              setSyncStatus(data.syncStatus || null);
              setLastSyncedAt(data.lastSyncedAt || null);
            }}
            className="border px-4 py-2 rounded"
          >
            View sync history
          </button>
        </div>
      </section>

      <button
        onClick={async () => {
          await fetch("/api/settings/preferences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ settings }),
          });
          alert("Saved!");
          await refreshEmailStatus();
        }}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Save Settings
      </button>
    </div>
  );
}
