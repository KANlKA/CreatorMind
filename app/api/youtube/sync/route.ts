import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import { initiateChannelSync } from "@/lib/youtube/sync";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user || !user.youtubeChannelId) {
      return NextResponse.json(
        { error: "YouTube channel not connected" },
        { status: 400 }
      );
    }

    if (user.syncStatus === "syncing") {
      return NextResponse.json(
        { error: "Sync already in progress" },
        { status: 409 }
      );
    }

    const accessToken = session.accessToken as string;

    // Initiate sync
    await initiateChannelSync(
      user._id.toString(),
      user.youtubeChannelId,
      accessToken
    );

    return NextResponse.json({
      success: true,
      message: "Channel sync initiated",
    });
  } catch (error) {
    console.error("Error initiating sync:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    return NextResponse.json({
      syncStatus: user.syncStatus,
      lastSyncedAt: user.lastSyncedAt,
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}