import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import GeneratedIdea from "@/models/GeneratedIdea";
import { generateVideoIdeas } from "@/lib/ai/idea-generator";

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
    const limit = parseInt(searchParams.get("limit") || "5");

    // Get latest ideas
    const ideas = await GeneratedIdea.find({ userId: user._id })
      .sort({ generatedAt: -1 })
      .limit(1);

    if (ideas.length === 0) {
      return NextResponse.json({
        ideas: [],
        message: "No ideas generated yet",
      });
    }

    return NextResponse.json({
      ideas: ideas[0].ideas.slice(0, limit),
      generatedAt: ideas[0].generatedAt,
      weekOf: ideas[0].weekOf,
    });
  } catch (error) {
    console.error("Error fetching ideas:", error);
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

    // Generate new ideas
    const ideas = await generateVideoIdeas(user._id.toString());

    return NextResponse.json({
      success: true,
      ideas: ideas.ideas,
      generatedAt: ideas.generatedAt,
    });
  } catch (error) {
    console.error("Error generating ideas:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}