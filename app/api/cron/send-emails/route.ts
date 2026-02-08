import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import { generateVideoIdeas } from "@/lib/ai/email-idea-generator";
import { sendWeeklyEmailToUser } from "@/lib/email/sender-with-filters";

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("\n=== CRON JOB: Generate Ideas + Send Emails ===");
    const serverTime = new Date();
    console.log(`Server UTC time: ${serverTime.toISOString()}`);

    await connectDB();

    // Get all users with email enabled
    const users = await User.find({
      "emailSettings.enabled": true,
    });

    console.log(`Found ${users.length} users with emails enabled`);

    let generatedCount = 0;
    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const emailSettings = user.emailSettings;
        const userTimezone = emailSettings.timezone || "UTC";

        // ✅ CORRECT WAY: Convert server time to user's timezone
        const userTimeStr = serverTime.toLocaleString("en-US", {
          timeZone: userTimezone,
        });
        const userTime = new Date(userTimeStr);

        // Get day of week in user's timezone
        const dayOfWeek = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ][userTime.getDay()];

        // Get hours and minutes in user's timezone
        const userHours = userTime.getHours();
        const userMinutes = userTime.getMinutes();
        const userTimeFormatted = `${String(userHours).padStart(2, "0")}:${String(userMinutes).padStart(2, "0")}`;

        console.log(`\n👤 ${user.email}`);
        console.log(`   Timezone: ${userTimezone}`);
        console.log(`   User's local time: ${userTimeFormatted} (${dayOfWeek})`);
        console.log(`   Scheduled: ${emailSettings.day} at ${emailSettings.time}`);

        // Check if it's the right day
        if (emailSettings.day !== dayOfWeek) {
          console.log(
            `   ⏭️  Skipped: Wrong day (today is ${dayOfWeek}, scheduled for ${emailSettings.day})`
          );
          skippedCount++;
          continue;
        }

        // Check if it's the right time (within 5-minute window)
        const [schedHours, schedMinutes] = emailSettings.time
          .split(":")
          .map(Number);

        const scheduledTotalMinutes = schedHours * 60 + schedMinutes;
        const currentTotalMinutes = userHours * 60 + userMinutes;
        const timeDiff = Math.abs(scheduledTotalMinutes - currentTotalMinutes);

        console.log(
          `   Checking time: ${emailSettings.time} vs ${userTimeFormatted} (diff: ${timeDiff} minutes)`
        );

        if (timeDiff > 5) {
          console.log(`   ⏭️  Skipped: Wrong time (need to match within 5 min window)`);
          skippedCount++;
          continue;
        }

        console.log(`   ✅ Right day and time! Sending email...`);

        // STEP 1: Generate ideas
        console.log(`   🤖 Generating ${emailSettings.ideaCount} ideas...`);

        const preferences = emailSettings.preferences || {};
        let generatedIdea;

        try {
          generatedIdea = await generateVideoIdeas(
            user._id.toString(),
            emailSettings.ideaCount,
            preferences
          );
          console.log(`   ✅ Generated ${generatedIdea.ideas.length} ideas`);
          generatedCount++;
        } catch (genError) {
          console.error(
            `   ❌ Failed to generate ideas:`,
            (genError as Error).message
          );
          errorCount++;
          continue;
        }

        // STEP 2: Send email
        console.log(`   📧 Sending email...`);

        const emailSent = await sendWeeklyEmailToUser(user._id.toString());

        if (emailSent) {
          console.log(`   ✅ Email sent!`);
          sentCount++;
        } else {
          console.log(`   ❌ Failed to send email`);
          errorCount++;
        }
      } catch (error) {
        console.error(
          `❌ Error processing ${user.email}:`,
          (error as Error).message
        );
        errorCount++;
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Users checked: ${users.length}`);
    console.log(`Ideas generated: ${generatedCount}`);
    console.log(`Emails sent: ${sentCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);

    return NextResponse.json({
      success: true,
      message: "Cron job completed",
      summary: {
        usersChecked: users.length,
        ideasGenerated: generatedCount,
        emailsSent: sentCount,
        skipped: skippedCount,
        errors: errorCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Cron job error:", error);
    return NextResponse.json(
      {
        error: "Failed to process cron job",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}