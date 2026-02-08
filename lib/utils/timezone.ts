/**
 * Get client timezone automatically
 * This is for frontend to get browser timezone
 */
export function getClientTimezoneFromBrowser(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Common timezones list
 */
export const COMMON_TIMEZONES = [
  { label: "UTC (GMT+0)", value: "UTC" },
  { label: "Eastern Time (EST/EDT)", value: "America/New_York" },
  { label: "Central Time (CST/CDT)", value: "America/Chicago" },
  { label: "Mountain Time (MST/MDT)", value: "America/Denver" },
  { label: "Pacific Time (PST/PDT)", value: "America/Los_Angeles" },
  { label: "London (GMT/BST)", value: "Europe/London" },
  { label: "Paris (CET/CEST)", value: "Europe/Paris" },
  { label: "India (IST)", value: "Asia/Kolkata" },
  { label: "Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Sydney (AEDT/AEST)", value: "Australia/Sydney" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Dubai (GST)", value: "Asia/Dubai" },
  { label: "Hong Kong (HKT)", value: "Asia/Hong_Kong" },
  { label: "Bangkok (ICT)", value: "Asia/Bangkok" },
  { label: "Melbourne (AEDT/AEST)", value: "Australia/Melbourne" },
];

/**
 * Convert time string to user's timezone
 */
export function convertTimeToTimezone(
  timeString: string, // "HH:MM" format
  fromTimezone: string = "UTC",
  toTimezone: string = "UTC"
): string {
  if (fromTimezone === toTimezone) {
    return timeString;
  }

  try {
    const [hours, minutes] = timeString.split(":").map(Number);

    // Create a date with the time in fromTimezone
    const dateStr = new Date().toLocaleString("en-US", {
      timeZone: fromTimezone,
    });
    const baseDate = new Date(dateStr);
    baseDate.setHours(hours, minutes, 0, 0);

    // Convert to toTimezone
    const convertedTimeStr = baseDate.toLocaleString("en-US", {
      timeZone: toTimezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return convertedTimeStr;
  } catch (error) {
    console.error("Error converting timezone:", error);
    return timeString;
  }
}

/**
 * Check if it's time to send email in user's timezone
 */
export function isTimeToSendEmail(
  scheduledTime: string, // "HH:MM" format
  timezone: string,
  toleranceMinutes: number = 5
): boolean {
  try {
    const [hours, minutes] = scheduledTime.split(":").map(Number);
    const scheduledMinutes = hours * 60 + minutes;

    // Get current time in user's timezone
    const now = new Date();
    const userTimeStr = now.toLocaleString("en-US", { timeZone: timezone });
    const userTime = new Date(userTimeStr);

    const currentHours = userTime.getHours();
    const currentMinutes = userTime.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    // Check if within tolerance window
    const diff = Math.abs(scheduledMinutes - currentTotalMinutes);
    return diff <= toleranceMinutes;
  } catch (error) {
    console.error("Error checking email time:", error);
    return false;
  }
}

/**
 * Get current time in specific timezone (for display)
 */
export function getCurrentTimeInTimezone(timezone: string): string {
  try {
    const now = new Date();
    return now.toLocaleString("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (error) {
    console.error("Error getting time in timezone:", error);
    return new Date().toLocaleTimeString();
  }
}

/**
 * Get display string for timezone
 */
export function getTimezoneDisplay(timezone: string): string {
  const tz = COMMON_TIMEZONES.find((t) => t.value === timezone);
  return tz ? tz.label : timezone;
}

// Export client-side function for auto-detecting timezone
export function getClientTimezone(): string {
  if (typeof window === "undefined") return "UTC";
  return getClientTimezoneFromBrowser();
}