import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import { fetchChannelData } from "@/lib/youtube/fetcher";
import { initiateChannelSync } from "@/lib/youtube/sync";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const accessToken = (session as any).accessToken as string;

    if (!accessToken) {
      return NextResponse.json(
        { error: "No YouTube access token found. Please sign in again." },
        { status: 400 }
      );
    }

    // Get user's YouTube channel ID from their account
    const channelResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=id,snippet,statistics&mine=true",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!channelResponse.ok) {
      const errorData = await channelResponse.json();
      console.error("YouTube API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch YouTube channel", details: errorData },
        { status: 400 }
      );
    }

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];

    if (!channel) {
      return NextResponse.json(
        { error: "No YouTube channel found for this account" },
        { status: 404 }
      );
    }

    const channelId = channel.id;
    const channelName = channel.snippet.title;
    const subscriberCount = parseInt(channel.statistics.subscriberCount || "0");

    // Update user with channel info
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        youtubeChannelId: channelId,
        youtubeChannelName: channelName,
        youtubeSubscriberCount: subscriberCount,
        youtubeAccessToken: accessToken,
        syncStatus: "pending",
      },
      { new: true }
    );

    // Initiate background sync
    await initiateChannelSync(user._id.toString(), channelId, accessToken);

    return NextResponse.json({
      success: true,
      channelId,
      channelName,
      subscriberCount,
      message: "Channel connected successfully. Sync started in background.",
    });
  } catch (error) {
    console.error("Error connecting YouTube channel:", error);
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

    // If not connected, return disconnected status
    if (!user.youtubeChannelId) {
      return NextResponse.json({
        connected: false,
        syncStatus: "disconnected",
        lastSyncedAt: null,
      });
    }

    // Connected - return full status
    console.log("User sync status:", user.syncStatus);
    console.log("User last synced:", user.lastSyncedAt);

    return NextResponse.json({
      connected: true,
      channelId: user.youtubeChannelId,
      channelName: user.youtubeChannelName,
      subscriberCount: user.youtubeSubscriberCount,
      syncStatus: user.syncStatus || "synced",
      lastSyncedAt: user.lastSyncedAt || null,
    });
  } catch (error) {
    console.error("Error checking connection status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}