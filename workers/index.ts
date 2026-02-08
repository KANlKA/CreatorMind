import { config } from "dotenv";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

config({ path: ".env.local" });
config();

async function main() {
  const { sendWeeklyEmail } = await import("@/lib/email/sender");
  const { generateVideoIdeas } = await import("@/lib/ai/idea-generator");
  const { generateCreatorInsights } = await import(
    "@/lib/ai/insights-generator"
  );
  const connectDB = (await import("@/lib/db/mongodb")).default;
  const User = (await import("@/models/User")).default;
  const GeneratedIdea = (await import("@/models/GeneratedIdea")).default;

  const connection = new Redis(process.env.UPSTASH_REDIS_URL || "", {
    maxRetriesPerRequest: null,
  });

  const emailQueue = new Queue("weekly-emails", { connection });

  // Email Worker - Processes scheduled emails
  const emailWorker = new Worker(
    "weekly-emails",
    async (job) => {
      const { userId } = job.data;

      console.log(`📧 Sending scheduled email to user ${userId}`);

      try {
        await connectDB();

        const user = await User.findById(userId);
        if (!user || !user.settings?.emailEnabled) {
          console.log(`  ⚠️  User ${userId} has email disabled; skipping.`);
          return { success: true };
        }

        // Generate fresh ideas
        console.log(`  → Generating ideas with preferences...`);
        const ideasDoc = await generateVideoIdeas(userId);

        if (!ideasDoc?.ideas?.length) {
          console.log(`  ⚠️  No ideas generated for user ${userId}`);
          return { success: true };
        }

        // Filter ideas by content preferences AFTER generation
        let filteredIdeas = [...ideasDoc.ideas];

        // Apply focus areas filter
        if (
          user.settings.preferences?.focusAreas &&
          user.settings.preferences.focusAreas.length > 0
        ) {
          const focusAreas = user.settings.preferences.focusAreas.map((f: string) =>
            f.toLowerCase()
          );
          filteredIdeas = filteredIdeas.filter((idea: any) => {
            const ideaTitle = idea.title?.toLowerCase() || "";
            return focusAreas.some((area: string) => ideaTitle.includes(area));
          });
        }

        // Apply avoid topics filter
        if (
          user.settings.preferences?.avoidTopics &&
          user.settings.preferences.avoidTopics.length > 0
        ) {
          const avoidTopics = user.settings.preferences.avoidTopics.map((t: string) =>
            t.toLowerCase()
          );
          filteredIdeas = filteredIdeas.filter((idea: any) => {
            const ideaTitle = idea.title?.toLowerCase() || "";
            return !avoidTopics.some((topic: string) => ideaTitle.includes(topic));
          });
        }

        // Apply format filter
        if (
          user.settings.preferences?.preferredFormats &&
          user.settings.preferences.preferredFormats.length > 0
        ) {
          const preferredFormats = user.settings.preferences.preferredFormats.map(
            (f: string) => f.toLowerCase()
          );
          // Prioritize preferred formats
          filteredIdeas = filteredIdeas.sort((a: any, b: any) => {
            const aFormat = a.suggestedStructure?.format?.toLowerCase() || "";
            const bFormat = b.suggestedStructure?.format?.toLowerCase() || "";
            const aMatch = preferredFormats.some((f: string) => aFormat.includes(f)) ? 1 : 0;
            const bMatch = preferredFormats.some((f: string) => bFormat.includes(f)) ? 1 : 0;
            return bMatch - aMatch;
          });
        }

        // If no ideas after filtering, use original ideas
        if (filteredIdeas.length === 0) {
          console.log(
            `  ℹ️  No ideas matched preferences, using generated ideas`
          );
          filteredIdeas = ideasDoc.ideas;
        }

        // Generate insights
        console.log(`  → Generating insights...`);
        await generateCreatorInsights(userId);

        // Get ideas limited to user preference
        const ideas = filteredIdeas.slice(0, user.settings.ideaCount || 5);

        // Send email
        console.log(`  → Sending email...`);
        const result = await sendWeeklyEmail({
          user,
          ideasDoc: { ...ideasDoc, ideas },
          ideas,
        });

        if (result.success) {
          console.log(
            `✅ Email sent to ${user.email} (ID: ${result.messageId})`
          );
          return { success: true };
        } else {
          throw new Error("Failed to send email");
        }
      } catch (error) {
        console.error(`❌ Error processing email for user ${userId}:`, error);
        throw error;
      }
    },
    { connection }
  );

  // Schedule jobs for all users based on their preferences
  async function scheduleUserEmails() {
    await connectDB();

    const users = await User.find({
      youtubeChannelId: { $exists: true },
      syncStatus: "completed",
      "settings.emailEnabled": true,
    });

    console.log(`\n📅 Scheduling emails for ${users.length} users...`);

    for (const user of users) {
      const { emailDay, emailTime, timezone, emailFrequency } =
        user.settings;

      if (!emailDay || !emailTime || !timezone) {
        console.log(
          `  ⚠️  ${user.email}: Missing email settings, skipping`
        );
        continue;
      }

      const dayMap: { [key: string]: number } = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };

      const dayNumber = dayMap[emailDay.toLowerCase()] || 0;
      const timeParts = emailTime.split(":");

      if (timeParts.length < 2) {
        console.log(
          `  ⚠️  ${user.email}: Invalid time format, skipping`
        );
        continue;
      }

      const [hours, minutes] = timeParts;

      // Calculate cron expression based on frequency
      let cronPattern: string;
      if (emailFrequency === "weekly") {
        cronPattern = `${minutes} ${hours} * * ${dayNumber}`;
      } else if (emailFrequency === "biweekly") {
        // For biweekly, use a more complex pattern (every 2 weeks)
        // Using day of month approach as fallback
        cronPattern = `${minutes} ${hours} * * ${dayNumber}`;
      } else if (emailFrequency === "monthly") {
        cronPattern = `${minutes} ${hours} 1 * *`;
      } else {
        cronPattern = `${minutes} ${hours} * * ${dayNumber}`;
      }

      try {
        // Remove existing job if any
        const existingJobs = await emailQueue.getRepeatableJobs();
        for (const job of existingJobs) {
          if (job.name === `email-${user._id}`) {
            await emailQueue.removeRepeatableByKey(job.key);
          }
        }

        // Add new scheduled job
        await emailQueue.add(
          `email-${user._id}`,
          { userId: user._id.toString() },
          {
            repeat: {
              pattern: cronPattern,
              tz: timezone,
            },
            jobId: `email-${user._id}`,
          }
        );

        console.log(
          `  ✅ ${user.email}: ${emailFrequency} on ${emailDay}s at ${emailTime} (${timezone})`
        );
      } catch (error) {
        console.error(
          `  ❌ Error scheduling for ${user.email}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    console.log(`\n✅ Email scheduling complete\n`);
  }

  emailWorker.on("completed", (job) => {
    console.log(`✅ Email job ${job.id} completed successfully`);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(
      `❌ Email job ${job?.id} failed:`,
      err instanceof Error ? err.message : "Unknown error"
    );
  });

  // Schedule on startup
  if (process.env.NODE_ENV === "production") {
    console.log("🚀 Starting email worker in production mode...");
    await scheduleUserEmails();
  } else {
    console.log("🔧 Email worker ready in development mode");
    console.log("  (To test scheduling, set NODE_ENV=production)");
  }

  console.log("✨ Email worker initialized and listening for jobs...\n");
}

main().catch((error) => {
  console.error("❌ Worker failed to start:", error);
  process.exit(1);
});