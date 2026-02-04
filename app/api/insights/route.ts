import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import CreatorInsight from "@/models/CreatorInsight";
import Video from "@/models/Video";
import { generateCreatorInsights } from "@/lib/ai/insights-generator";

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

    let insights = await CreatorInsight.findOne({ userId: user._id });

    // If no insights exist, generate them
    if (!insights) {
      const videoCount = await Video.countDocuments({ userId: user._id });

      if (videoCount === 0) {
        return NextResponse.json(
          { error: "No videos analyzed yet" },
          { status: 404 }
        );
      }

      insights = await generateCreatorInsights(user._id.toString());
    }

    // Get overall stats
    const totalVideos = await Video.countDocuments({ userId: user._id });
    const videos = await Video.find({ userId: user._id }).select(
      "engagementRate views"
    );

    const avgEngagement =
      videos.reduce((sum, v) => sum + v.engagementRate, 0) / videos.length;
    const totalViews = videos.reduce((sum, v) => sum + v.views, 0);

    return NextResponse.json({
      insights,
      stats: {
        totalVideos,
        avgEngagement,
        totalViews,
      },
    });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Regenerate insights
    const insights = await generateCreatorInsights(user._id.toString());

    return NextResponse.json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error("Error regenerating insights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}