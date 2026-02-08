import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";

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

    const settings = {
      emailEnabled: user.emailSettings?.enabled || false,
      emailFrequency: user.emailSettings?.frequency || "weekly",
      emailDay: user.emailSettings?.day || "monday",
      emailTime: user.emailSettings?.time || "09:00",
      timezone: user.emailSettings?.timezone || "UTC",
      ideaCount: user.emailSettings?.ideaCount || 5,
      preferences: {
        focusAreas: user.emailSettings?.preferences?.focusAreas || [],
        avoidTopics: user.emailSettings?.preferences?.avoidTopics || [],
        preferredFormats: user.emailSettings?.preferences?.preferredFormats || [],
      },
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
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

    const { settings } = await request.json();

    await connectDB();

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        emailSettings: {
          enabled: settings.emailEnabled,
          frequency: settings.emailFrequency,
          day: settings.emailDay,
          time: settings.emailTime,
          timezone: settings.timezone,
          ideaCount: settings.ideaCount,
          preferences: {
            focusAreas: settings.preferences?.focusAreas || [],
            avoidTopics: settings.preferences?.avoidTopics || [],
            preferredFormats: settings.preferences?.preferredFormats || [],
          },
        },
      },
      { new: true }
    );

    const updatedSettings = {
      emailEnabled: user.emailSettings?.enabled || false,
      emailFrequency: user.emailSettings?.frequency || "weekly",
      emailDay: user.emailSettings?.day || "monday",
      emailTime: user.emailSettings?.time || "09:00",
      timezone: user.emailSettings?.timezone || "UTC",
      ideaCount: user.emailSettings?.ideaCount || 5,
      preferences: {
        focusAreas: user.emailSettings?.preferences?.focusAreas || [],
        avoidTopics: user.emailSettings?.preferences?.avoidTopics || [],
        preferredFormats: user.emailSettings?.preferences?.preferredFormats || [],
      },
    };

    return NextResponse.json({ settings: updatedSettings });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}