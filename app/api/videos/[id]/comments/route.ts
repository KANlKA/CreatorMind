import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import Video from "@/models/Video";
import Comment from "@/models/Comment";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Await params in Next.js 15+
    const { id } = await params;

    // Get the video by YouTube videoId
    const video = await Video.findOne({ videoId: id });
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Get comments for this video
    const comments = await Comment.find({ videoId: video._id }).sort({ publishedAt: -1 });

    // Aggregate comment analysis
    const sentimentCount = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    const intentCount: Record<string, number> = {};
    const topicCount: Record<string, number> = {};

    comments.forEach((comment) => {
      sentimentCount[comment.sentiment]++;
      intentCount[comment.intent] = (intentCount[comment.intent] || 0) + 1;
      comment.topics.forEach((topic: string) => {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      });
    });

    return NextResponse.json({
      video: {
        videoId: video.videoId,
        title: video.title,
        description: video.description,
        views: video.views,
        likes: video.likes,
        commentCount: video.commentCount,
        publishedAt: video.publishedAt,
        thumbnailUrl: video.thumbnailUrl,
        engagementRate: video.engagementRate,
        duration: video.duration,
        analysis: video.analysis,
        analyzedAt: video.analyzedAt,
      },
      comments: comments.map((c) => ({
        commentId: c.commentId,
        authorName: c.authorName,
        text: c.text,
        likes: c.likes,
        publishedAt: c.publishedAt,
        sentiment: c.sentiment,
        intent: c.intent,
        topics: c.topics,
      })),
      analysis: {
        totalComments: comments.length,
        sentiment: sentimentCount,
        intents: Object.entries(intentCount).sort((a, b) => b[1] - a[1]),
        topTopics: Object.entries(topicCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Error fetching video comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
