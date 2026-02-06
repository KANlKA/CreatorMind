import User from "@/models/User"
import GeneratedIdea from "@/models/GeneratedIdea"
import { fetchWeeklyIdeas } from "./fetch-weekly-ideas"
import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { addEmailJob } from "@/lib/jobs/queue"
import connectDB from "@/lib/db/mongodb"

const DAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

export async function runEmailScheduler() {
  await connectDB()
  const users = await User.find({})
  const now = new Date()

  for (const user of users) {
    const {
      emailEnabled,
      emailFrequency,
      emailDay,
      emailTime,
      timezone,
      ideaCount,
    } = user.settings

    if (!emailEnabled) continue

    const userNow = toZonedTime(now, timezone)
    const [hour, minute] = emailTime.split(":").map(Number)

    const scheduledUserTime = new Date(userNow)
    scheduledUserTime.setHours(hour, minute, 0, 0)

    const scheduledUtc = fromZonedTime(scheduledUserTime, timezone)

    if (userNow.getDay() !== DAY_INDEX[emailDay]) continue
    if (Math.abs(now.getTime() - scheduledUtc.getTime()) > 5 * 60 * 1000) continue

    // Frequency check
    const lastEmail = await GeneratedIdea.findOne({
      userId: user._id,
      emailStatus: "sent",
    }).sort({ emailSentAt: -1 })

    if (lastEmail) {
      const diffDays =
        (now.getTime() - lastEmail.emailSentAt!.getTime()) /
        (1000 * 60 * 60 * 24)

      if (emailFrequency === "weekly" && diffDays < 6) continue
      if (emailFrequency === "biweekly" && diffDays < 13) continue
      if (emailFrequency === "monthly" && diffDays < 27) continue
    }

    const result = await fetchWeeklyIdeas(user._id.toString(), ideaCount)
    if (!result) continue

    await addEmailJob(user._id.toString(), result.doc._id.toString())
  }
}
