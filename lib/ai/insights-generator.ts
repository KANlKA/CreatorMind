import connectDB from "@/lib/db/mongodb";
import Video from "@/models/Video";
import Comment from "@/models/Comment";
import CreatorInsight from "@/models/CreatorInsight";
import mongoose from "mongoose";
import { analyzePerformancePatterns } from "./pattern-analyzer";

/**
 * Generate comprehensive creator insights using pattern analysis
 * This version uses the pattern-analyzer for better format/topic/tone/hook/timing analysis
 */
export async function generateCreatorInsights(userId: string) {
  await connectDB();

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Fetch all videos
  const videos = await Video.find({ userId: userObjectId });

  if (videos.length === 0) {
    throw new Error("No videos found for analysis");
  }

  // Fetch all comments
  const videoIds = videos.map((v) => v._id);
  const comments = await Comment.find({ videoId: { $in: videoIds } });

  // ========================================
  // USE PATTERN ANALYZER FOR PERFORMANCE METRICS
  // This replaces the manual calculation and provides better insights
  // ========================================
  const patternAnalysis = await analyzePerformancePatterns(videos);

  // Extract best formats from pattern analysis
  const bestFormats = patternAnalysis.bestFormats.slice(0, 5).map((f) => ({
    format: f.format,
    avgEngagement: f.avgEngagement,
    count: f.videoCount,
  }));

  // Extract best topics from pattern analysis
  const bestTopics = patternAnalysis.bestTopics.slice(0, 10).map((t) => ({
    topic: t.topic,
    videos: t.videoCount,
    avgEngagement: t.avgEngagement,
  }));

  // Extract best tones from pattern analysis
  const bestTones = patternAnalysis.bestTones.slice(0, 5).map((t) => ({
    tone: t.tone,
    avgEngagement: t.avgEngagement,
  }));

  // Extract best hooks from pattern analysis
  const bestHooks = patternAnalysis.bestHooks.slice(0, 5).map((h) => ({
    hookType: h.hookType,
    avgEngagement: h.avgEngagement,
  }));

  // Extract upload time optimization from pattern analysis
  const bestUploadTimes = {
    dayOfWeek: patternAnalysis.uploadTimeOptimization.bestDay,
    // Extract just the start time from "12:00 PM - 6:00 PM"
    timeOfDay: patternAnalysis.uploadTimeOptimization.bestTime.split(" - ")[0],
  };

  // ========================================
  // AUDIENCE ANALYSIS
  // ========================================
  const intentCounts = new Map<string, number>();

  videos.forEach((video) => {
    const intent = video.analysis.audienceIntent || "learning";
    intentCounts.set(intent, (intentCounts.get(intent) || 0) + 1);
  });

  const primaryIntent =
    Array.from(intentCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "learning";

  // Determine skill level (based on complexity)
  const complexityCounts = new Map<string, number>();

  videos.forEach((video) => {
    const complexity = video.analysis.complexity || "intermediate";
    complexityCounts.set(
      complexity,
      (complexityCounts.get(complexity) || 0) + 1
    );
  });

  const skillLevel =
    Array.from(complexityCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "intermediate";

  // ========================================
  // COMMENT THEME ANALYSIS
  // ========================================
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

  const topRequests = Array.from(requestThemes.entries())
    .map(([theme, data]) => ({
      theme,
      mentions: data.mentions,
      videoIds: Array.from(data.videoIds),
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 10);

  const confusionAreas = Array.from(confusionThemes.entries())
    .map(([area, mentions]) => ({ area, mentions }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5);

  const praisePatterns = Array.from(praiseThemes.entries())
    .map(([pattern, mentions]) => ({ pattern, mentions }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5);

  // Engagement quality (based on average comment length)
  const avgCommentLength =
    comments.length > 0
      ? comments.reduce((sum, c) => sum + c.text.length, 0) / comments.length
      : 0;
  const engagementQuality =
    avgCommentLength > 100 ? "high" : avgCommentLength > 50 ? "medium" : "low";

  // ========================================
  // SAVE TO DATABASE
  // ========================================
  const insights = await CreatorInsight.findOneAndUpdate(
    { userId: userObjectId },
    {
      patterns: {
        bestFormats,
        bestTopics,
        bestTones,
        bestHooks,
        bestUploadTimes,
      },
      audience: {
        primaryIntent,
        skillLevel,
        engagementQuality,
      },
      commentThemes: {
        topRequests,
        confusionAreas,
        praisePatterns,
      },
      lastUpdatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return insights;
}