import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Import Idea model
    let Idea;
    try {
      Idea = (await import("@/models/Idea")).default;
    } catch {
      return NextResponse.json(
        {
          error: "Idea model not found",
          hint: "Make sure models/Idea.ts exists",
        },
        { status: 500 }
      );
    }

    // Clear old ideas (optional)
    await Idea.deleteMany({ userId: user._id });

    // Create sample ideas
    const sampleIdeas = [
      {
        userId: user._id.toString(),
        title: "Top 10 AI Tools That Will Change Your Life in 2025",
        description:
          "A comprehensive review of the latest AI tools and how they can improve productivity",
        confidence: 0.95,
        suggestedFormat: "tutorial",
        suggestedLength: "12-15 minutes",
        suggestedTone: "informative and engaging",
        audienceDemand: "Very High - 50+ comments asking for this",
        commentDemand:
          "Users asking for AI tool recommendations and reviews",
        pastPerformance:
          "Similar videos got 85K+ views with 12% engagement rate",
      },
      {
        userId: user._id.toString(),
        title: "How to Automate Your Entire Workflow with ChatGPT",
        description: "Step-by-step guide to using ChatGPT for automation",
        confidence: 0.92,
        suggestedFormat: "how-to",
        suggestedLength: "10-12 minutes",
        suggestedTone: "educational",
        audienceDemand: "High - 35+ comments",
        commentDemand:
          "People asking how to use ChatGPT for work automation",
        pastPerformance:
          "Previous tutorial got 72K views with 10% engagement",
      },
      {
        userId: user._id.toString(),
        title: "AI vs Human Creativity - The Future of Content Creation",
        description: "Deep dive into AI capabilities and limitations",
        confidence: 0.88,
        suggestedFormat: "deep-dive",
        suggestedLength: "18-22 minutes",
        suggestedTone: "thought-provoking",
        audienceDemand: "High - Trending topic",
        commentDemand: "Debates about AI future",
        pastPerformance: "Similar content averages 65K views",
      },
      {
        userId: user._id.toString(),
        title: "5 AI Prompts That Will Blow Your Mind",
        description: "Awesome ChatGPT prompts for different use cases",
        confidence: 0.85,
        suggestedFormat: "tips-tricks",
        suggestedLength: "8-10 minutes",
        suggestedTone: "casual and exciting",
        audienceDemand: "Very High - Trending",
        commentDemand: "Users requesting more prompt ideas",
        pastPerformance: "Trending videos in this category get 90K+ views",
      },
      {
        userId: user._id.toString(),
        title: "Building Your Own AI Assistant in 2025",
        description: "Tutorial on creating custom AI tools",
        confidence: 0.82,
        suggestedFormat: "tutorial",
        suggestedLength: "15-18 minutes",
        suggestedTone: "technical but accessible",
        audienceDemand: "High - Tech audience interested",
        commentDemand: "Technical questions and requests",
        pastPerformance: "Technical tutorials average 55K views",
      },
      {
        userId: user._id.toString(),
        title: "The Real Cost of Using AI Tools - Honest Review",
        description: "Breakdown of costs, pros and cons of different AI tools",
        confidence: 0.80,
        suggestedFormat: "review",
        suggestedLength: "12-14 minutes",
        suggestedTone: "honest and balanced",
        audienceDemand: "Medium-High - People want to know costs",
        commentDemand: "Questions about pricing and value",
        pastPerformance: "Review videos get good engagement",
      },
    ];

    const createdIdeas = await Idea.insertMany(sampleIdeas);

    return NextResponse.json({
      success: true,
      message: `✅ Created ${createdIdeas.length} sample ideas for testing!`,
      ideaCount: createdIdeas.length,
      ideas: createdIdeas.map((idea: any) => ({
        id: idea._id,
        title: idea.title,
        confidence: idea.confidence,
        format: idea.suggestedFormat,
      })),
      nextStep: "Now visit /api/debug/send-email-now to send a test email!",
    });
  } catch (error) {
    console.error("Error creating ideas:", error);
    return NextResponse.json(
      {
        error: (error as Error).message,
        type: (error as Error).constructor.name,
      },
      { status: 500 }
    );
  }
}