import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Video from "@/models/Video";

export async function GET() {
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

    // Get video count and sample video
    const videoCount = await Video.countDocuments({ userId: user._id });
    const sampleVideo = await Video.findOne({ userId: user._id }).sort({ analyzedAt: -1 });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        youtubeChannelId: user.youtubeChannelId,
        youtubeChannelName: user.youtubeChannelName,
        syncStatus: user.syncStatus,
        lastSyncedAt: user.lastSyncedAt,
        hasAccessToken: !!user.youtubeAccessToken,
      },
      videos: {
        totalCount: videoCount,
        sampleVideo: sampleVideo ? {
          videoId: sampleVideo.videoId,
          title: sampleVideo.title,
          views: sampleVideo.views,
          likes: sampleVideo.likes,
          commentCount: sampleVideo.commentCount,
          analyzedAt: sampleVideo.analyzedAt,
        } : null,
      },
    });
  } catch (error) {
    console.error("Error fetching debug info:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
