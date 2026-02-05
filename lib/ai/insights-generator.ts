import connectDB from "@/lib/db/mongodb";
import Video from "@/models/Video";
import Comment from "@/models/Comment";
import CreatorInsight from "@/models/CreatorInsight";
import mongoose from "mongoose";

export async function generateCreatorInsights(userId: string) {
  await connectDB();

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const videos = await Video.find({ userId: userObjectId });
  if (videos.length === 0) {
    throw new Error("No videos found for analysis");
  }

  const videoIds = videos.map((v) => v._id);
  const comments = await Comment.find({ videoId: { $in: videoIds } });

  // Best formats
  const formatStats = new Map<string, { engagement: number; count: number }>();

  videos.forEach((video) => {
    const format = video.analysis.format || "general";
    const current = formatStats.get(format) || { engagement: 0, count: 0 };
    formatStats.set(format, {
      engagement: current.engagement + (video.engagementRate || 0),
      count: current.count + 1,
    });
  });

  const bestFormats = Array.from(formatStats.entries())
    .map(([format, stats]) => ({
      format,
      avgEngagement: Math.min((stats.engagement / stats.count) || 0, 1),
      count: stats.count,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);

  // Best topics
  const topicStats = new Map<string, { engagement: number; videos: number }>();

  videos.forEach((video) => {
    const topic = video.analysis.topic || "general";
    const current = topicStats.get(topic) || { engagement: 0, videos: 0 };
    topicStats.set(topic, {
      engagement: current.engagement + (video.engagementRate || 0),
      videos: current.videos + 1,
    });
  });

  const bestTopics = Array.from(topicStats.entries())
    .map(([topic, stats]) => ({
      topic,
      videos: stats.videos,
      avgEngagement: Math.min((stats.engagement / stats.videos) || 0, 1),
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);

  // Best tones
  const toneStats = new Map<string, { engagement: number; count: number }>();

  videos.forEach((video) => {
    const tone = video.analysis.tone || "general";
    const current = toneStats.get(tone) || { engagement: 0, count: 0 };
    toneStats.set(tone, {
      engagement: current.engagement + (video.engagementRate || 0),
      count: current.count + 1,
    });
  });

  const bestTones = Array.from(toneStats.entries())
    .map(([tone, stats]) => ({
      tone,
      avgEngagement: Math.min((stats.engagement / stats.count) || 0, 1),
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);

  // Best hooks
  const hookStats = new Map<string, { engagement: number; count: number }>();

  videos.forEach((video) => {
    const hook = video.analysis.hookType || "general";
    const current = hookStats.get(hook) || { engagement: 0, count: 0 };
    hookStats.set(hook, {
      engagement: current.engagement + (video.engagementRate || 0),
      count: current.count + 1,
    });
  });

  const bestHooks = Array.from(hookStats.entries())
    .map(([hookType, stats]) => ({
      hookType,
      avgEngagement: Math.min((stats.engagement / stats.count) || 0, 1),
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);

  const dayStats = new Map<string, number>();
  videos.forEach((video) => {
    const day = new Date(video.publishedAt)
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    dayStats.set(day, (dayStats.get(day) || 0) + 1);
  });

  const bestDay =
    Array.from(dayStats.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "thursday";

  const intentCounts = new Map<string, number>();
  videos.forEach((video) => {
    const intent = video.analysis.audienceIntent || "learning";
    intentCounts.set(intent, (intentCounts.get(intent) || 0) + 1);
  });

  const primaryIntent =
    Array.from(intentCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "learning";

  const complexityCounts = new Map<string, number>();
  videos.forEach((video) => {
    const complexity = video.analysis.complexity || "intermediate";
    complexityCounts.set(complexity, (complexityCounts.get(complexity) || 0) + 1);
  });

  const skillLevel =
    Array.from(complexityCounts.entries()).sort((a, b) => b[1] - a[1])[0]
      ?.[0] || "intermediate";

  let topRequests: any[] = [];
  let confusionAreas: any[] = [];
  let praisePatterns: any[] = [];

  if (comments.length > 0) {
    const requestThemes = new Map<
      string,
      { mentions: number; videoIds: Set<mongoose.Types.ObjectId> }
    >();
    const confusionThemes = new Map<string, number>();
    const praiseThemes = new Map<string, number>();

    comments.forEach((comment) => {
      if (comment.intent === "request" || comment.intent === "question") {
        comment.topics.forEach((topic) => {
          const current = requestThemes.get(topic) || {
            mentions: 0,
            videoIds: new Set(),
          };
          current.mentions++;
          current.videoIds.add(comment.videoId);
          requestThemes.set(topic, current);
        });
      }

      if (comment.intent === "confusion") {
        comment.topics.forEach((topic) => {
          confusionThemes.set(topic, (confusionThemes.get(topic) || 0) + 1);
        });
      }

      if (comment.intent === "praise") {
        comment.topics.forEach((topic) => {
          praiseThemes.set(topic, (praiseThemes.get(topic) || 0) + 1);
        });
      }
    });

    topRequests = Array.from(requestThemes.entries())
      .map(([theme, data]) => ({
        theme,
        mentions: data.mentions,
        videoIds: Array.from(data.videoIds),
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 10);

    confusionAreas = Array.from(confusionThemes.entries())
      .map(([area, mentions]) => ({ area, mentions }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5);

    praisePatterns = Array.from(praiseThemes.entries())
      .map(([pattern, mentions]) => ({ pattern, mentions }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5);
  }


  const avgCommentLength =
    comments.reduce((sum, c) => sum + c.text.length, 0) /
    (comments.length || 1);

  const engagementQuality =
    avgCommentLength > 100 ? "high" : avgCommentLength > 50 ? "medium" : "low";

  const insights = await CreatorInsight.findOneAndUpdate(
    { userId: userObjectId },
    {
      patterns: {
        bestFormats: bestFormats.slice(0, 5),
        bestTopics: bestTopics.slice(0, 10),
        bestTones: bestTones.slice(0, 5),
        bestHooks: bestHooks.slice(0, 5),
        bestUploadTimes: {
          dayOfWeek: bestDay,
          timeOfDay: "14:00",
        },
      },
      audience: {
        primaryIntent,
        skillLevel,
        engagementQuality,
      },
      commentThemes:
        comments.length > 0
          ? {
               topRequests,
               confusionAreas,
               praisePatterns,
            }
          : null,
      lastUpdatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return insights;
}
