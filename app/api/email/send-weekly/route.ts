import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import GeneratedIdea from "@/models/GeneratedIdea";
import { sendWeeklyEmail } from "@/lib/email/sender";

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

    if (!user.settings?.emailEnabled) {
      return NextResponse.json(
        { error: "Email is not enabled for this user" },
        { status: 400 }
      );
    }

    // Get the latest generated ideas
    const ideasDoc = await GeneratedIdea.findOne({ userId: user._id }).sort({
      generatedAt: -1,
    });

    if (!ideasDoc || !ideasDoc.ideas?.length) {
      return NextResponse.json(
        { error: "No ideas generated yet" },
        { status: 404 }
      );
    }

    // Limit ideas to user's preference
    const ideas = ideasDoc.ideas.slice(0, user.settings.ideaCount || 5);

    // Send email
    const result = await sendWeeklyEmail({
      user,
      ideasDoc,
      ideas,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        messageId: result.messageId,
        status: result.messageStatus,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending weekly email:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET: Manually trigger sending test email (for development)
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

    if (!user.settings?.emailEnabled) {
      return NextResponse.json(
        { error: "Email is not enabled for this user" },
        { status: 400 }
      );
    }

    // Get the latest generated ideas
    const ideasDoc = await GeneratedIdea.findOne({ userId: user._id }).sort({
      generatedAt: -1,
    });

    if (!ideasDoc || !ideasDoc.ideas?.length) {
      return NextResponse.json(
        { error: "No ideas generated yet" },
        { status: 404 }
      );
    }

    // Limit ideas to user's preference
    const ideas = ideasDoc.ideas.slice(0, user.settings.ideaCount || 5);

    // Send email
    const result = await sendWeeklyEmail({
      user,
      ideasDoc,
      ideas,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully",
        messageId: result.messageId,
        status: result.messageStatus,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send test email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}