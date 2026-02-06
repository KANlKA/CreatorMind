import { Resend } from "resend"
import { render } from "@react-email/render"
import { WeeklyInsightsEmail } from "./weekly-insights"

import GeneratedIdea from "@/models/GeneratedIdea"
import CreatorInsight from "@/models/CreatorInsight"
import Video from "@/models/Video"
import connectDB from "@/lib/db/mongodb"

import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY!)

/* -------------------------------------------------- */
/* MAIN EMAIL SENDER                                  */
/* -------------------------------------------------- */

export async function sendWeeklyEmail({
  user,
  ideasDoc,
  ideas,
}: {
  user: any
  ideasDoc: any
  ideas: any[]
}) {
  await connectDB()

  const secret = process.env.UNSUBSCRIBE_SECRET || "default_unsub_secret"
  const unsubscribeToken = crypto
    .createHmac("sha256", secret)
    .update(user._id.toString())
    .digest("hex")

  const insightsDoc = await CreatorInsight.findOne({ userId: user._id }).lean()
  const insights = buildKeyInsights(ideasDoc, insightsDoc)
  const patterns = await detectPerformancePatterns(user._id, insightsDoc)
  const actions = generateActionItems(ideas, insights, patterns)

  const emailHtml = await render(
    <WeeklyInsightsEmail
      userName={user.name || "Creator"}
      ideas={ideas}
      insights={insights}
      patterns={patterns}
      actions={actions}
      unsubscribeUrl={`${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?uid=${user._id.toString()}&token=${unsubscribeToken}`}
    />
  )

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: user.email,
    subject: "Your Weekly Creator Intelligence",
    html: emailHtml,
  })

  await GeneratedIdea.updateOne(
    { _id: ideasDoc._id },
    {
      emailStatus: "sent",
      emailSentAt: new Date(),
    }
  )

  return result
}

/* -------------------------------------------------- */
/* HELPERS                                            */
/* -------------------------------------------------- */

function buildKeyInsights(ideasDoc: any, insightsDoc: any): string[] {
  const insights: string[] = []

  if (ideasDoc?.ideas?.length) {
    const topIdea = ideasDoc.ideas[0]
    if (topIdea?.title) {
      insights.push(`Top idea: "${topIdea.title}" (${topIdea.confidence}% confidence)`)
    }
  }

  if (insightsDoc?.patterns?.bestFormats?.length) {
    insights.push(`Best format: ${insightsDoc.patterns.bestFormats[0].format}`)
  }

  if (insightsDoc?.commentThemes?.topRequests?.length) {
    insights.push(
      `Audience wants more: ${insightsDoc.commentThemes.topRequests[0].theme}`
    )
  }

  return insights.slice(0, 5)
}

async function detectPerformancePatterns(
  userId: string,
  insightsDoc: any
): Promise<string[]> {
  const patterns: string[] = []

  if (insightsDoc?.patterns?.bestTopics?.length) {
    patterns.push(`Best topic: ${insightsDoc.patterns.bestTopics[0].topic}`)
  }
  if (insightsDoc?.patterns?.bestTones?.length) {
    patterns.push(`Best tone: ${insightsDoc.patterns.bestTones[0].tone}`)
  }
  if (insightsDoc?.patterns?.bestUploadTimes?.dayOfWeek) {
    patterns.push(
      `Best upload time: ${insightsDoc.patterns.bestUploadTimes.dayOfWeek} at ${insightsDoc.patterns.bestUploadTimes.timeOfDay}`
    )
  }

  const videos = await Video.find({ userId })
    .sort({ publishedAt: -1 })
    .limit(15)
    .lean()

  if (!videos.length) return patterns

  const avgEngagement =
    videos.reduce((sum: number, v: any) => {
      const engagement =
        v.viewCount > 0
          ? (v.likeCount + v.commentCount) / v.viewCount
          : 0
      return sum + engagement
    }, 0) / videos.length

  patterns.push(
    `Recent videos average ${(avgEngagement * 100).toFixed(1)}% engagement`
  )

  return patterns.slice(0, 5)
}

function generateActionItems(
  ideas: any[],
  insights: string[],
  patterns: string[]
): string[] {
  const actions: string[] = []

  if (ideas.length > 0) {
    actions.push(`Create: "${ideas[0].title}" this week`)
  }

  if (insights.length > 0) {
    actions.push(`Address insight: ${insights[0]}`)
  }

  if (patterns.length > 0) {
    actions.push(`Lean into pattern: ${patterns[0]}`)
  }

  actions.push("Reply to top comments within 24 hours")

  return actions
}
