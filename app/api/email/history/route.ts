import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import EmailLog from "@/models/EmailLog";

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
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const skip = (page - 1) * limit;

    // Fetch email history from local EmailLog
    const emailLogs = await EmailLog.find({ userId: user._id })
      .sort({ sentAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const totalCount = await EmailLog.countDocuments({ userId: user._id });

    return NextResponse.json({
      success: true,
      emails: emailLogs.map((log) => ({
        id: log._id.toString(),
        subject: log.subject,
        recipientEmail: log.recipientEmail,
        status: log.status,
        ideaCount: log.ideaCount,
        sentAt: log.sentAt,
        deliveredAt: log.deliveredAt,
        openedAt: log.openedAt,
        failureReason: log.failureReason,
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching email history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}