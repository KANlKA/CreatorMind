import connectDB from "@/lib/db/mongodb";
import Video from "@/models/Video";
import CreatorInsight from "@/models/CreatorInsight";
import GeneratedIdea from "@/models/GeneratedIdea";
import mongoose from "mongoose";
import { generateJSON } from "./gemini";

export async function generateVideoIdeas(userId: string, desiredCount: number = 5, preferences?: any) {
  await connectDB();

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Get creator insights
  const insights = await CreatorInsight.findOne({ userId: userObjectId });

  if (!insights) {
    throw new Error("No insights found. Please analyze your channel first.");
  }

  // Get recent videos for context
  const recentVideos = await Video.find({ userId: userObjectId })
    .sort({ publishedAt: -1 })
    .limit(10);

  // Get all videos for average stats
  const allVideos = await Video.find({ userId: userObjectId });

  const avgEngagement =
    allVideos.reduce((sum, v) => sum + v.engagementRate, 0) / allVideos.length;

  // Build context for AI
  const context = {
    totalVideos: allVideos.length,
    avgEngagement: (avgEngagement * 100).toFixed(1),
    bestFormat: insights.patterns.bestFormats[0]?.format,
    bestFormatEngagement: (insights.patterns.bestFormats[0]?.avgEngagement * 100).toFixed(1),
    bestTopics: insights.patterns.bestTopics.slice(0, 5).map((t) => ({
      topic: t.topic,
      engagement: (t.avgEngagement * 100).toFixed(1),
    })),
    bestTone: insights.patterns.bestTones[0]?.tone,
    topRequests: insights.commentThemes.topRequests.slice(0, 5).map((r) => ({
      theme: r.theme,
      mentions: r.mentions,
    })),
    confusionAreas: insights.commentThemes.confusionAreas.map((c) => c.area),
    audienceIntent: insights.audience.primaryIntent,
    skillLevel: insights.audience.skillLevel,
    recentVideos: recentVideos.map((v) => ({
      title: v.title,
      topic: v.analysis.topic,
      engagement: (v.engagementRate * 100).toFixed(1),
    })),
  };

  // Build preference constraints for prompt
  let preferenceConstraints = "";

  if (preferences) {
    const focusAreas = preferences.focusAreas || [];
    const avoidTopics = preferences.avoidTopics || [];
    const preferredFormats = preferences.preferredFormats || [];

    if (focusAreas.length > 0) {
      preferenceConstraints += `\n\nFOCUS AREAS (MUST include these topics): ${focusAreas.join(", ")}`;
    }

    if (avoidTopics.length > 0) {
      preferenceConstraints += `\n\nAVOID TOPICS (MUST NOT include these): ${avoidTopics.join(", ")}`;
    }

    if (preferredFormats.length > 0) {
      preferenceConstraints += `\n\nPREFERRED FORMATS (MUST use these formats): ${preferredFormats.join(", ")}`;
    }
  }

  const prompt = `You are a YouTube content strategist. Generate ${desiredCount} video ideas for this creator based on their data.

Creator Profile:
- Total Videos: ${context.totalVideos}
- Average Engagement: ${context.avgEngagement}%
- Best Format: ${context.bestFormat} (${context.bestFormatEngagement}% engagement)
- Best Topics: ${context.bestTopics.map(t => `${t.topic} (${t.engagement}%)`).join(", ")}
- Best Tone: ${context.bestTone}
- Audience Intent: ${context.audienceIntent}
- Audience Skill Level: ${context.skillLevel}

What Audience Wants (from comments):
${context.topRequests.map((r) => `- ${r.theme} (${r.mentions} mentions)`).join("\n")}

Confusion Areas:
${context.confusionAreas.map((a) => `- ${a}`).join("\n")}

Recent Videos:
${context.recentVideos.map((v) => `- "${v.title}" (${v.engagement}% engagement)`).join("\n")}

${preferenceConstraints}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${desiredCount} ideas
${preferences?.focusAreas?.length > 0 ? `2. EVERY idea MUST include at least one of these topics: ${preferences.focusAreas.join(", ")}` : ""}
${preferences?.avoidTopics?.length > 0 ? `3. ABSOLUTELY NO ideas about: ${preferences.avoidTopics.join(", ")}` : ""}
${preferences?.preferredFormats?.length > 0 ? `4. ALL ideas MUST use ONLY these formats: ${preferences.preferredFormats.join(", ")}` : ""}

For each idea, provide:
- rank: 1-${desiredCount}
- title: Compelling video title
- reasoning: {
    commentDemand: string (why audience wants this),
    pastPerformance: string (what data supports this),
    audienceFit: string (how it matches their profile),
    trendingScore: number 0-1
  }
- evidence: Array of evidence items. Each item must have:
  * type: MUST be ONLY one of these exact values: "comment", "performance", or "trend"
  * text: string (supporting evidence text)
- predictedEngagement: 0-1 (decimal)
- confidence: 0-1 (decimal)
- suggestedStructure: {hook: string, format: string, length: string, tone: string}

CRITICAL: For evidence.type, use ONLY these exact strings: "comment", "performance", "trend"
Do NOT use "audienceFit" or any other value for evidence.type.

Return as JSON array with ${desiredCount} ideas.`;

  try {
    console.log("🤖 Generating ideas with Gemini...");
    console.log("Preferences:", preferences);
    const ideas = await generateJSON(prompt);

    // Validate and ensure we have the desired count
    if (!Array.isArray(ideas) || ideas.length === 0) {
      throw new Error("Invalid ideas generated");
    }

    // Clean up evidence types - remove any invalid types
    const validEvidenceTypes = ['comment', 'performance', 'trend'];
    const cleanedIdeas = ideas.slice(0, desiredCount).map((idea: any, index: number) => {
      // Filter evidence to only include valid types
      const cleanedEvidence = (idea.evidence || [])
        .filter((ev: any) => validEvidenceTypes.includes(ev.type))
        .map((ev: any) => ({
          type: ev.type,
          text: ev.text,
          ...(ev.videoId && { videoId: ev.videoId }),
          ...(ev.commentId && { commentId: ev.commentId })
        }));

      return {
        ...idea,
        rank: index + 1,
        evidence: cleanedEvidence
      };
    });

    // Get current Sunday
    const now = new Date();
    const weekOf = new Date(now);
    weekOf.setDate(now.getDate() - now.getDay()); // Go to Sunday of this week

    // Save generated ideas
    const generatedIdea = await GeneratedIdea.create({
      userId: userObjectId,
      generatedAt: new Date(),
      weekOf,
      ideas: cleanedIdeas,
      emailStatus: "pending",
    });

    console.log(`✅ Generated ${cleanedIdeas.length} ideas for user ${userId}`);
    return generatedIdea;
  } catch (error) {
    console.error("Error generating ideas:", error);
    throw error;
  }
}