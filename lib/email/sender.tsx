import { sendEmailViaMailjet } from "./mailjet";
import { render } from "@react-email/render";
import { WeeklyInsightsEmailTemplate } from "./weekly-insights-template";
import GeneratedIdea from "@/models/GeneratedIdea";
import CreatorInsight from "@/models/CreatorInsight";
import EmailLog from "@/models/EmailLog";
import User from "@/models/User";
import connectDB from "@/lib/db/mongodb";
import crypto from "crypto";

export async function sendWeeklyEmail({
  user,
  ideasDoc,
  ideas,
}: {
  user: any;
  ideasDoc: any;
  ideas: any[];
}) {
  await connectDB();

  const secret = process.env.UNSUBSCRIBE_SECRET || "default_unsub_secret";
  const unsubscribeToken = crypto
    .createHmac("sha256", secret)
    .update(user._id.toString())
    .digest("hex");

  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?uid=${user._id.toString()}&token=${unsubscribeToken}`;

  const insightsDoc = await CreatorInsight.findOne({
    userId: user._id,
  }).lean();
  
  const insights = buildKeyInsights(ideasDoc, insightsDoc);
  const patterns = await detectPerformancePatterns(user._id, insightsDoc);
  const actions = generateActionItems(ideas, insights, patterns);

  // Render email template
  const emailHtml = await render(
    <WeeklyInsightsEmailTemplate
      userName={user.name || "Creator"}
      ideas={ideas}
      insights={insights}
      patterns={patterns}
      actions={actions}
      unsubscribeUrl={unsubscribeUrl}
    />
  );

  // Send via Mailjet
  const result = await sendEmailViaMailjet({
    to: user.email,
    subject: "Your Weekly Creator Intelligence 📊",
    htmlContent: emailHtml,
    unsubscribeUrl,
  });

  if (result.success) {
    // Log the email send
    await EmailLog.create({
      userId: user._id,
      recipientEmail: user.email,
      subject: "Your Weekly Creator Intelligence 📊",
      status: "sent",
      mailjetMessageId: result.messageId,
      ideaCount: ideas.length,
      sentAt: new Date(),
    });

    // Update GeneratedIdea status
    await GeneratedIdea.findByIdAndUpdate(ideasDoc._id, {
      emailStatus: "sent",
      emailSentAt: new Date(),
    });
  }

  return result;
}

function buildKeyInsights(ideasDoc: any, insightsDoc: any): string[] {
  const insights: string[] = [];

  if (ideasDoc?.ideas?.length) {
    const topIdea = ideasDoc.ideas[0];
    if (topIdea?.title) {
      const confidence = Math.round(topIdea.confidence * 100);
      insights.push(
        `🎯 Top idea this week: "${topIdea.title}" (${confidence}% confidence)`
      );
    }
  }

  if (insightsDoc?.patterns?.bestFormats?.length) {
    const format = insightsDoc.patterns.bestFormats[0];
    const engagement = Math.round(format.avgEngagement * 100);
    insights.push(
      `📹 Best format: ${format.format} gets ${engagement}% engagement`
    );
  }

  if (insightsDoc?.commentThemes?.topRequests?.length) {
    const request = insightsDoc.commentThemes.topRequests[0];
    insights.push(
      `💬 Audience wants: "${request.theme}" (${request.mentions} mentions)`
    );
  }

  if (insightsDoc?.patterns?.bestTones?.length) {
    const tone = insightsDoc.patterns.bestTones[0];
    const engagement = Math.round(tone.avgEngagement * 100);
    insights.push(`🎨 Best tone: ${tone.tone} (${engagement}% engagement)`);
  }

  return insights.slice(0, 5);
}

async function detectPerformancePatterns(
  userId: string,
  insightsDoc: any
): Promise<string[]> {
  const patterns: string[] = [];

  if (insightsDoc?.patterns?.bestTopics?.length) {
    const topic = insightsDoc.patterns.bestTopics[0];
    const engagement = Math.round(topic.avgEngagement * 100);
    patterns.push(`Best topic: "${topic.topic}" (${engagement}% engagement)`);
  }

  if (insightsDoc?.patterns?.bestHooks?.length) {
    const hook = insightsDoc.patterns.bestHooks[0];
    const engagement = Math.round(hook.avgEngagement * 100);
    patterns.push(`Best hook: "${hook.hookType}" (${engagement}% engagement)`);
  }

  if (insightsDoc?.patterns?.bestUploadTimes) {
    const { dayOfWeek, timeOfDay } = insightsDoc.patterns.bestUploadTimes;
    patterns.push(`📅 Best upload time: ${dayOfWeek}s at ${timeOfDay}`);
  }

  if (insightsDoc?.audience?.primaryIntent) {
    patterns.push(
      `👥 Audience intent: ${insightsDoc.audience.primaryIntent}`
    );
  }

  return patterns.slice(0, 5);
}

function generateActionItems(
  ideas: any[],
  insights: string[],
  patterns: string[]
): string[] {
  const actions: string[] = [];

  if (ideas.length > 0) {
    actions.push(`📝 Script & create: "${ideas[0].title}" this week`);
  }

  if (ideas.length > 1) {
    actions.push(`📊 Have backup idea: "${ideas[1].title}"`);
  }

  actions.push("💬 Reply to top 3 comments within 24 hours of upload");
  actions.push("🎬 Test 2 thumbnail variations before publishing");
  actions.push("📈 Track views & engagement in the first 24 hours");

  return actions.slice(0, 5);
}