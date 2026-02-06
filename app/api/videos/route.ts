import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Video from "@/models/Video";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json({ videos: [] });
  }

  const videos = await Video.find({ userId: user._id })
    .sort({ publishedAt: -1 })
    .limit(20)
    .select("videoId title thumbnailUrl views likes commentCount engagementRate")

  return NextResponse.json({ videos });
}
