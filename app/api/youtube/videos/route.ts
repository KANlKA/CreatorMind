import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Video from "@/models/Video";

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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    const videos = await Video.find({ userId: user._id })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Video.countDocuments({ userId: user._id });

    return NextResponse.json({
      videos,
      total,
      hasMore: skip + videos.length < total,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}