import { auth } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import connectDB from "@/lib/db/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return email settings with all fields
    const settings = {
      emailEnabled: user.emailSettings?.enabled || false,
      emailFrequency: user.emailSettings?.frequency || "weekly",
      emailDay: user.emailSettings?.day || "sunday",
      emailTime: user.emailSettings?.time || "09:00",
      timezone: user.emailSettings?.timezone || "UTC",
      ideaCount: user.emailSettings?.ideaCount || 5,
      preferences: {
        focusAreas: user.emailSettings?.preferences?.focusAreas || [],
        avoidTopics: user.emailSettings?.preferences?.avoidTopics || [],
        preferredFormats: user.emailSettings?.preferences?.preferredFormats || [],
      },
    };

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { settings } = await request.json();

    // Validate required fields
    if (!settings) {
      return NextResponse.json(
        { error: "Settings are required" },
        { status: 400 }
      );
    }

    // Update user with email settings
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        emailSettings: {
          enabled: settings.emailEnabled === true,
          frequency: settings.emailFrequency || "weekly",
          day: settings.emailDay || "sunday",
          time: settings.emailTime || "09:00",
          timezone: settings.timezone || "UTC",
          ideaCount: settings.ideaCount || 5,
          preferences: {
            focusAreas: settings.preferences?.focusAreas || [],
            avoidTopics: settings.preferences?.avoidTopics || [],
            preferredFormats: settings.preferences?.preferredFormats || [],
          },
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return saved settings
    const savedSettings = {
      emailEnabled: user.emailSettings?.enabled || false,
      emailFrequency: user.emailSettings?.frequency || "weekly",
      emailDay: user.emailSettings?.day || "sunday",
      emailTime: user.emailSettings?.time || "09:00",
      timezone: user.emailSettings?.timezone || "UTC",
      ideaCount: user.emailSettings?.ideaCount || 5,
      preferences: {
        focusAreas: user.emailSettings?.preferences?.focusAreas || [],
        avoidTopics: user.emailSettings?.preferences?.avoidTopics || [],
        preferredFormats: user.emailSettings?.preferences?.preferredFormats || [],
      },
    };

    console.log("✅ Settings saved successfully");
    console.log("Email Settings:", savedSettings);

    return NextResponse.json({
      success: true,
      settings: savedSettings,
      message: "Settings saved successfully",
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Internal server error", message: (error as Error).message },
      { status: 500 }
    );
  }
}