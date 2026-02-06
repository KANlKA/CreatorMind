import { config } from "dotenv";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

config({ path: ".env.local" });
config();

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI is missing in worker environment");
} else {
  console.log("MONGODB_URI loaded for worker");
}

async function main() {
  const { generateVideoIdeas } = await import("@/lib/ai/idea-generator");
  const { generateCreatorInsights } = await import("@/lib/ai/insights-generator");
  const { sendWeeklyEmail } = await import("@/lib/email/sender");
  const { fetchWeeklyIdeas } = await import("@/lib/email/fetch-weekly-ideas");
  const connectDB = (await import("@/lib/db/mongodb")).default;
  const User = (await import("@/models/User")).default;
  const GeneratedIdea = (await import("@/models/GeneratedIdea")).default;

  // Redis connection for BullMQ (TCP URL)
  const connection = new Redis(process.env.UPSTASH_REDIS_URL || "", {
    maxRetriesPerRequest: null,
  });

  // Create queues
  const weeklyInsightsQueue = new Queue("weekly-insights", { connection });
  const emailQueue = new Queue("email", { connection });

  async function shouldSendEmail(userId: string, frequency: string, forceSend?: boolean) {
    if (forceSend) return true;
    const lastEmail = await GeneratedIdea.findOne({
      userId,
      emailStatus: "sent",
    }).sort({ emailSentAt: -1 });

    if (!lastEmail?.emailSentAt) return true;

    const diffDays =
      (Date.now() - lastEmail.emailSentAt.getTime()) / (1000 * 60 * 60 * 24);

    if (frequency === "weekly" && diffDays < 6) return false;
    if (frequency === "biweekly" && diffDays < 13) return false;
    if (frequency === "monthly" && diffDays < 27) return false;

    return true;
  }

  // Weekly Insights Worker
  const weeklyInsightsWorker = new Worker(
    "weekly-insights",
    async (job) => {
      const { userId, forceSend } = job.data;

      console.log(`Processing weekly insights for user ${userId}`);

      try {
        await connectDB();

        // Regenerate insights
        await generateCreatorInsights(userId);

        // Generate new ideas
        const ideas = await generateVideoIdeas(userId);

        const user = await User.findById(userId);
        if (!user || !user.settings?.emailEnabled) {
          console.log(`User ${userId} has email disabled; skipping email queue.`);
          return { success: true };
        }

        const frequencyOk = await shouldSendEmail(
          userId,
          user.settings.emailFrequency,
          forceSend
        );

        if (frequencyOk) {
          // Queue email
          await emailQueue.add("send-weekly-email", {
            userId,
            ideaId: ideas._id.toString(),
            forceSend,
          });
        } else {
          console.log(`Email frequency not due for user ${userId}; skipping queue.`);
        }

        console.log(`Weekly insights completed for user ${userId}`);
        return { success: true };
      } catch (error) {
        console.error(
          `Error processing weekly insights for user ${userId}:`,
          error,
        );
        throw error;
      }
    },
    { connection },
  );

  // Email Worker
  const emailWorker = new Worker(
    "email",
    async (job) => {
      const { userId, ideaId, forceSend } = job.data;

      console.log(`Sending weekly email to user ${userId}`);

      try {
        await connectDB();

        const user = await User.findById(userId);
        if (!user || !user.settings?.emailEnabled) {
          console.log(`User ${userId} has email disabled; skipping send.`);
          return { success: true };
        }

      const frequencyOk = await shouldSendEmail(
        userId,
        user.settings.emailFrequency,
        forceSend
      );
      if (!frequencyOk) {
        console.log(`User ${userId} frequency not due; skipping send.`);
        return { success: true };
      }

        let ideasDoc: any = null;
        let ideas: any[] = [];

        if (ideaId) {
          ideasDoc = await GeneratedIdea.findById(ideaId).lean();
          if (ideasDoc?.ideas?.length) {
            ideas = ideasDoc.ideas.slice(0, user.settings.ideaCount);
          }
        } else {
          const result = await fetchWeeklyIdeas(
            user._id.toString(),
            user.settings.ideaCount
          );
          if (!result) return { success: true };
          ideasDoc = result.doc;
          ideas = result.ideas;
        }

        if (!ideasDoc || ideas.length === 0) {
          throw new Error("Ideas not found");
        }

        await sendWeeklyEmail({ user, ideasDoc, ideas });

        console.log(`Weekly email sent to user ${userId}`);
        return { success: true };
      } catch (error) {
        console.error(`Error sending email to user ${userId}:`, error);

        if (ideaId) {
          await GeneratedIdea.findByIdAndUpdate(ideaId, {
            emailStatus: "failed",
          });
        }

        throw error;
      }
    },
    { connection },
  );

  // Schedule weekly insights for all users
  async function scheduleWeeklyInsights() {
    await connectDB();

    const users = await User.find({
      youtubeChannelId: { $exists: true },
      syncStatus: "completed",
      "settings.emailEnabled": true,
    });

    for (const user of users) {
      const { emailDay, emailTime, timezone } = user.settings;

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
      const [hours, minutes] = emailTime.split(":");

      const cronExpression = `${minutes} ${hours} * * ${dayNumber}`;

      await weeklyInsightsQueue.add(
        `weekly-insights-${user._id}`,
        { userId: user._id.toString() },
        {
          repeat: {
            pattern: cronExpression,
            tz: timezone,
          },
        },
      );

      console.log(
        `Scheduled weekly insights for user ${user._id} (${cronExpression} ${timezone})`,
      );
    }
  }

  weeklyInsightsWorker.on("failed", (job, err) => {
    console.error(`Weekly insights job ${job?.id} failed:`, err);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err);
  });

  weeklyInsightsWorker.on("completed", (job) => {
    console.log(`Weekly insights job ${job.id} completed`);
  });

  emailWorker.on("completed", (job) => {
    console.log(`Email job ${job.id} completed`);
  });

  if (process.env.NODE_ENV === "production") {
    scheduleWeeklyInsights().then(() => {
      console.log("Weekly insights scheduling initialized");
    });
  }
}

main().catch((error) => {
  console.error("Worker failed to start:", error);
  process.exit(1);
});
