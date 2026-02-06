import { auth } from "@/app/api/auth/[...nextauth]/route"
import User from "@/models/User"
import connectDB from "@/lib/db/mongodb"
import { NextResponse } from "next/server"
import GeneratedIdea from "@/models/GeneratedIdea"
import { emailQueue } from "@/lib/jobs/queue"

const ALLOWED_FREQUENCIES = new Set(["weekly", "biweekly", "monthly"])
const ALLOWED_DAYS = new Set([
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
])
const ALLOWED_IDEA_COUNTS = new Set([3, 5, 10])
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

function normalizeStringArray(value: unknown) {
  const arr =
    Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(",")
        : []

  return Array.from(
    new Set(
      arr
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter(Boolean)
        .map((v) => v.slice(0, 80))
    )
  ).slice(0, 20)
}

function isValidTimeZone(tz: string) {
  try {
    if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
      // @ts-expect-error - supportedValuesOf is not in TS lib yet
      return Intl.supportedValuesOf("timeZone").includes(tz)
    }
  } catch {
    return false
  }
  return true
}

function validateSettings(input: any) {
  if (!input || typeof input !== "object") return null

  const emailEnabled = Boolean(input.emailEnabled)
  const emailFrequency = ALLOWED_FREQUENCIES.has(input.emailFrequency)
    ? input.emailFrequency
    : "weekly"
  const emailDay = ALLOWED_DAYS.has(input.emailDay) ? input.emailDay : "sunday"
  const emailTime = TIME_REGEX.test(input.emailTime) ? input.emailTime : "09:00"
  const timezone =
    typeof input.timezone === "string" && isValidTimeZone(input.timezone)
      ? input.timezone
      : "UTC"
  const ideaCount = ALLOWED_IDEA_COUNTS.has(Number(input.ideaCount))
    ? Number(input.ideaCount)
    : 5

  const preferences = {
    focusAreas: normalizeStringArray(input?.preferences?.focusAreas),
    avoidTopics: normalizeStringArray(input?.preferences?.avoidTopics),
    preferredFormats: normalizeStringArray(input?.preferences?.preferredFormats),
  }

  return {
    emailEnabled,
    emailFrequency,
    emailDay,
    emailTime,
    timezone,
    ideaCount,
    preferences,
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const user = await User.findOne({ email: session.user.email })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const lastEmail = await GeneratedIdea.findOne({
    userId: user._id,
    emailStatus: "sent",
  })
    .sort({ emailSentAt: -1 })
    .lean()

  const queueCounts = await emailQueue.getJobCounts()

  return NextResponse.json({
    settings: user.settings,
    emailStatus: {
      lastSentAt: lastEmail?.emailSentAt || null,
      queueCounts,
    },
  })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const body = await req.json()
  const settings = validateSettings(body?.settings)
  if (!settings) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 })
  }

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: { settings } },
    { new: true }
  )

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true, settings: user.settings })
}
