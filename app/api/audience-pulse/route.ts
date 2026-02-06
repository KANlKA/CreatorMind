import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Video from "@/models/Video";
import Comment from "@/models/Comment";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({});

  // Get all user's videos first
  const videos = await Video.find({ userId: user._id }).select('_id');
  const videoIds = videos.map(v => v._id);

  // Get comments for those videos
  const comments = await Comment.find({ videoId: { $in: videoIds } });
  console.log("COMMENTS FOUND:", comments.length);

  const intentCount: Record<string, number> = {};
  const topicCount: Record<string, number> = {};

  comments.forEach((c) => {
    intentCount[c.intent] = (intentCount[c.intent] || 0) + 1;
    c.topics.forEach((t: string) => {
      topicCount[t] = (topicCount[t] || 0) + 1;
    });
  });

  return NextResponse.json({
    intents: Object.entries(intentCount),
    topTopics: Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
  });
}
