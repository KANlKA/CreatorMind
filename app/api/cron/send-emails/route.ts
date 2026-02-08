import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import EmailLog from "@/models/EmailLog";
import { generateVideoIdeas } from "@/lib/ai/email-idea-generator";
import { sendWeeklyEmailToUser } from "@/lib/email/sender-with-filters";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("\n=== CRON JOB: Generate Ideas + Send Emails ===");
    const serverTime = new Date();
    console.log(`Server UTC time: ${serverTime.toISOString()}`);

    await connectDB();

    const users = await User.find({ "emailSettings.enabled": true });

    console.log(`Found ${users.length} users with emails enabled`);

    let generatedCount = 0;
    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const emailSettings = user.emailSettings;
        const userTimezone = emailSettings.timezone || "UTC";

        // ✅ CORRECT: Convert server UTC time to user's local timezone
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

        console.log(`\n👤 ${user.email}`);
        console.log(`   Timezone: ${userTimezone}`);
        console.log(`   User's local time: ${userHours}:${String(userMinutes).padStart(2, "0")} (${dayOfWeek})`);
        console.log(`   Scheduled: ${emailSettings.day} at ${emailSettings.time}`);

        // Check if it's the right day
        if (emailSettings.day !== dayOfWeek) {
          console.log(`   ⏭️  Skipped: Wrong day`);
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

        console.log(`   Time diff: ${timeDiff} minutes`);

        if (timeDiff > 5) {
          console.log(`   ⏭️  Skipped: Wrong time`);
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

          // STEP 2: Send email
          console.log(`   📧 Sending email...`);

          const emailSent = await sendWeeklyEmailToUser(user._id.toString());

          if (emailSent) {
            console.log(`   ✅ Email sent!`);
            sentCount++;

            // Log successful email
            await EmailLog.create({
              userId: user._id,
              subject: `Your ${generatedIdea.ideas.length} Weekly Video Ideas`,
              recipientEmail: user.email,
              status: "delivered",
              ideaCount: generatedIdea.ideas.length,
              sentAt: new Date(),
              deliveredAt: new Date(),
            });
          } else {
            console.log(`   ❌ Failed to send email`);
            errorCount++;

            // Log failed email
            await EmailLog.create({
              userId: user._id,
              subject: `Your Weekly Video Ideas (Failed)`,
              recipientEmail: user.email,
              status: "failed",
              ideaCount: emailSettings.ideaCount,
              sentAt: new Date(),
              failureReason: "Email sending failed",
            });
          }
        } catch (genError) {
          console.error(`   ❌ Failed to generate ideas:`, (genError as Error).message);
          errorCount++;

          // Log failed email due to generation error
          await EmailLog.create({
            userId: user._id,
            subject: `Your Weekly Video Ideas (Generation Failed)`,
            recipientEmail: user.email,
            status: "failed",
            ideaCount: 0,
            sentAt: new Date(),
            failureReason: "Idea generation failed",
          });
        }
      } catch (error) {
        console.error(`❌ Error processing ${user.email}:`, (error as Error).message);
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
      { error: "Failed to process cron job", message: (error as Error).message },
      { status: 500 }
    );
  }
}