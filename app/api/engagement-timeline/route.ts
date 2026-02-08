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

    // Get time range from query params (default: 90 days)
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "90";

    let startDate: Date | null = null;
    if (range !== "all") {
      const rangeInDays = parseInt(range);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - rangeInDays);
    }

    console.log("[ENGAGEMENT TIMELINE] Query params:", {
      userId: user._id.toString(),
      range,
      startDate: startDate ? startDate.toISOString() : "all time",
    });

    // Fetch videos within the range
    const videos = await Video.find({
      userId: user._id,
      publishedAt: range === "all" ? { $exists: true } : { $gte: startDate! },
    }).select("publishedAt engagementRate views likes commentCount title videoId");

    console.log("[ENGAGEMENT TIMELINE] Videos found:", videos.length);
    if (videos.length > 0) {
      console.log("[ENGAGEMENT TIMELINE] Sample video:", {
        title: videos[0].title,
        publishedAt: videos[0].publishedAt,
        engagementRate: videos[0].engagementRate,
      });
    }

    if (videos.length === 0) {
      return NextResponse.json({
        success: true,
        monthlyData: [],
        dailyData: {},
      });
    }

    // Group by month for primary view
    const monthlyMap = new Map<
      string,
      {
        engagement: number[];
        videos: number;
        totalViews: number;
        bestVideo: { title: string; engagement: number; videoId: string } | null;
      }
    >();

    // Group by date for drill-down
    const dailyMap = new Map<string, any>();

    videos.forEach((video) => {
      const date = new Date(video.publishedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const dayKey = date.toISOString().split("T")[0];

      // Monthly aggregation
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          engagement: [],
          videos: 0,
          totalViews: 0,
          bestVideo: null,
        });
      }

      const monthData = monthlyMap.get(monthKey)!;
      monthData.engagement.push(video.engagementRate * 100);
      monthData.videos++;
      monthData.totalViews += video.views;

      // Track best video
      if (
        !monthData.bestVideo ||
        video.engagementRate > monthData.bestVideo.engagement
      ) {
        monthData.bestVideo = {
          title: video.title,
          engagement: video.engagementRate * 100,
          videoId: video.videoId,
        };
      }

      // Daily aggregation for drill-down
      if (!dailyMap.has(monthKey)) {
        dailyMap.set(monthKey, []);
      }

      dailyMap.get(monthKey)!.push({
        date: dayKey,
        engagement: video.engagementRate * 100,
        views: video.views,
        likes: video.likes,
        comments: video.commentCount,
        title: video.title,
        videoId: video.videoId,
      });
    });

    // Calculate monthly averages
    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, data]) => {
        const avgEngagement =
          data.engagement.reduce((sum, val) => sum + val, 0) /
          data.engagement.length;

        return {
          month,
          engagement: Number(avgEngagement.toFixed(2)),
          videos: data.videos,
          totalViews: data.totalViews,
          bestVideo: data.bestVideo,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));

    // Format daily data for drill-down
    const dailyData: Record<string, any[]> = {};
    dailyMap.forEach((days, month) => {
      // Group by day and calculate average if multiple videos on same day
      const dayAggregates = new Map<string, any>();

      days.forEach((video: any) => {
        if (!dayAggregates.has(video.date)) {
          dayAggregates.set(video.date, {
            date: video.date,
            engagements: [],
            videos: [],
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
          });
        }

        const dayData = dayAggregates.get(video.date)!;
        dayData.engagements.push(video.engagement);
        dayData.videos.push({
          title: video.title,
          videoId: video.videoId,
          engagement: video.engagement,
        });
        dayData.totalViews += video.views;
        dayData.totalLikes += video.likes;
        dayData.totalComments += video.comments;
      });

      dailyData[month] = Array.from(dayAggregates.values())
        .map((day) => ({
          date: day.date,
          engagement: Number(
            (
              day.engagements.reduce((sum: number, val: number) => sum + val, 0) /
              day.engagements.length
            ).toFixed(2)
          ),
          videosCount: day.videos.length,
          videos: day.videos,
          totalViews: day.totalViews,
          totalLikes: day.totalLikes,
          totalComments: day.totalComments,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    });

    return NextResponse.json({
      success: true,
      monthlyData,
      dailyData,
    });
  } catch (error) {
    console.error("Error fetching engagement timeline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}