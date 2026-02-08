import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import { render } from "@react-email/render";
import { sendEmailViaMailjet } from "@/lib/email/mailjet";
import { WeeklyInsightsEmail } from "@/lib/email/weekly-insights-template";
import { generateVideoIdeas } from "@/lib/ai/email-idea-generator";

export async function GET(request: NextRequest) {
  try {
    console.log("=== SEND EMAIL + GENERATE IDEAS WITH PREFERENCES ===");

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated", hint: "Please sign in first" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.emailSettings?.enabled) {
      return NextResponse.json(
        {
          error: "Emails are disabled",
          hint: "Go to Settings and enable emails",
        },
        { status: 400 }
      );
    }

    console.log("✅ Emails enabled");

    const ideaCount = user.emailSettings?.ideaCount || 5;
    const preferences = user.emailSettings?.preferences || {};

    console.log(`\n📊 User Preferences:`);
    console.log(`- Ideas to generate: ${ideaCount}`);
    console.log(
      `- Focus areas: ${preferences.focusAreas?.join(", ") || "None"}`
    );
    console.log(
      `- Avoid topics: ${preferences.avoidTopics?.join(", ") || "None"}`
    );
    console.log(
      `- Preferred formats: ${preferences.preferredFormats?.join(", ") || "None"}`
    );

    // Generate ideas WITH PREFERENCES
    console.log(`\n🤖 Generating ${ideaCount} ideas with preferences...`);
    let generatedIdea;
    try {
      generatedIdea = await generateVideoIdeas(
        user._id.toString(),
        ideaCount,
        preferences
      );
      console.log(`✅ Generated ${generatedIdea.ideas.length} ideas`);
    } catch (genError) {
      console.error(
        "❌ Failed to generate ideas:",
        (genError as Error).message
      );
      return NextResponse.json(
        {
          error: "Failed to generate ideas",
          hint: (genError as Error).message,
        },
        { status: 500 }
      );
    }

    // Ideas are already filtered by preferences in the generator
    const ideasToSend = generatedIdea.ideas;

    if (ideasToSend.length === 0) {
      return NextResponse.json(
        {
          error: "No ideas generated",
          hint: "Generated ideas don't match your preferences",
        },
        { status: 400 }
      );
    }

    console.log(`\n📧 Rendering email with ${ideasToSend.length} ideas...`);

    const emailHtml = await render(
      WeeklyInsightsEmail({
        userName: user.name || "Creator",
        ideas: ideasToSend,
        timezone: user.emailSettings?.timezone || "UTC",
      })
    );

    console.log("Sending email via Mailjet...");

    const result = await sendEmailViaMailjet({
      to: user.email,
      subject: `Your ${ideasToSend.length} Weekly Video Ideas - ${new Date().toLocaleDateString()}`,
      htmlContent: emailHtml,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to send email",
          hint: "Check Mailjet configuration",
        },
        { status: 500 }
      );
    }

    console.log(`✅ Email sent successfully!`);

    return NextResponse.json({
      success: true,
      message: `✅ Email sent with ${ideasToSend.length} ideas!`,
      details: {
        sentTo: user.email,
        ideasGenerated: ideasToSend.length,
        timezone: user.emailSettings?.timezone,
        preferences: {
          focusAreas: preferences.focusAreas || [],
          avoidTopics: preferences.avoidTopics || [],
          preferredFormats: preferences.preferredFormats || [],
        },
        timestamp: new Date().toISOString(),
        ideas: ideasToSend.map((i: any) => ({
          title: i.title,
          confidence: (i.confidence * 100).toFixed(0) + "%",
          format: i.suggestedStructure?.format,
        })),
      },
      nextStep: "Check your email inbox in 30 seconds",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      {
        error: (error as Error).message,
        type: (error as Error).constructor.name,
      },
      { status: 500 }
    );
  }
}