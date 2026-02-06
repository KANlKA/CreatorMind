import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Video from "@/models/Video";
import { analyzePerformancePatterns } from "@/lib/ai/pattern-analyzer";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all videos for analysis
    const videos = await Video.find({ userId: user._id }).sort({ publishedAt: -1 });

    if (videos.length === 0) {
      return NextResponse.json(
        { error: "No videos found for analysis" },
        { status: 404 }
      );
    }

    // Analyze patterns
    const patterns = await analyzePerformancePatterns(videos);

    return NextResponse.json({
      success: true,
      patterns,
      totalVideos: videos.length,
    });
  } catch (error) {
    console.error("Error analyzing patterns:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}