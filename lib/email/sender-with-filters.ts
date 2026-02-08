import { render } from "@react-email/render";
import { sendEmailViaMailjet } from "@/lib/email/mailjet";
import { WeeklyInsightsEmail } from "@/lib/email/weekly-insights-template";
import User from "@/models/User";
import connectDB from "@/lib/db/mongodb";
import mongoose from "mongoose";

export async function sendWeeklyEmailToUser(userId: string) {
  try {
    await connectDB();

    const user = await User.findById(userId);

    if (!user || !user.emailSettings?.enabled) {
      console.log(`Email disabled for user ${userId}`);
      return false;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch GeneratedIdea - the latest one
    let GeneratedIdea;
    try {
      GeneratedIdea = (await import("@/models/GeneratedIdea")).default;
    } catch {
      console.error("GeneratedIdea model not found");
      return false;
    }

    const generatedIdea = await GeneratedIdea.findOne({ userId: userObjectId })
      .sort({ generatedAt: -1 })
      .lean();

    if (!generatedIdea || !generatedIdea.ideas || generatedIdea.ideas.length === 0) {
      console.log(`No ideas found in GeneratedIdea for user ${userId}`);
      console.log(`Available GeneratedIdea documents:`, await GeneratedIdea.find({ userId: userObjectId }).select("_id generatedAt ideas").lean());
      return false;
    }

    console.log(`Found ${generatedIdea.ideas.length} ideas for user ${userId}`);

    // Filter ideas based on preferences
    const filteredIdeas = filterIdeas(
      generatedIdea.ideas,
      user.emailSettings.preferences
    );

    console.log(`After filtering: ${filteredIdeas.length} ideas match preferences`);

    // Get desired number of ideas
    const desiredCount = user.emailSettings.ideaCount || 5;
    const ideasToSend = filteredIdeas.slice(0, desiredCount);

    if (ideasToSend.length === 0) {
      console.log(`No ideas match preferences for user ${userId}`);
      return false;
    }

    console.log(`Sending ${ideasToSend.length} ideas to ${user.email}`);

    // Generate email
    const emailHtml = await render(
      WeeklyInsightsEmail({
        userName: user.name || "Creator",
        ideas: ideasToSend,
        timezone: user.emailSettings.timezone || "UTC",
      })
    );

    // Send email
    const result = await sendEmailViaMailjet({
      to: user.email,
      subject: `Your ${user.emailSettings.emailFrequency} Video Ideas`,
      htmlContent: emailHtml,
    });

    if (result.success) {
      console.log(`✅ Email sent successfully to ${user.email}`);
      
      // Update email status in GeneratedIdea
      try {
        await GeneratedIdea.updateOne(
          { _id: generatedIdea._id },
          {
            emailStatus: "sent",
            emailSentAt: new Date(),
          }
        );
        console.log(`Updated emailStatus for GeneratedIdea ${generatedIdea._id}`);
      } catch (updateError) {
        console.log("Could not update emailStatus (not critical):", updateError);
      }

      return true;
    } else {
      console.error(`❌ Failed to send email to ${user.email}`);
      return false;
    }
  } catch (error) {
    console.error("Error sending weekly email:", error);
    return false;
  }
}

function filterIdeas(
  ideas: any[],
  preferences?: {
    focusAreas?: string[];
    avoidTopics?: string[];
    preferredFormats?: string[];
  }
) {
  if (!preferences) {
    console.log("No preferences set, returning all ideas");
    return ideas;
  }

  console.log("Filtering ideas with preferences:", preferences);

  return ideas.filter((idea) => {
    // Check if idea should be avoided
    if (preferences.avoidTopics && preferences.avoidTopics.length > 0) {
      const avoidLower = preferences.avoidTopics.map((t) => t.toLowerCase());
      const ideaText = `${idea.title} ${idea.reasoning?.commentDemand || ""} ${idea.reasoning?.pastPerformance || ""}`.toLowerCase();

      const shouldAvoid = avoidLower.some((topic) => ideaText.includes(topic));
      if (shouldAvoid) {
        console.log(`Filtering out: "${idea.title}" (matches avoid topics)`);
        return false;
      }
    }

    // Check if idea matches focus areas
    if (preferences.focusAreas && preferences.focusAreas.length > 0) {
      const focusLower = preferences.focusAreas.map((f) => f.toLowerCase());
      const ideaText = `${idea.title} ${idea.reasoning?.commentDemand || ""} ${idea.reasoning?.pastPerformance || ""}`.toLowerCase();

      const hasMatch = focusLower.some((focus) => ideaText.includes(focus));
      if (!hasMatch) {
        console.log(`Filtering out: "${idea.title}" (doesn't match focus areas)`);
        return false;
      }
    }

    // Check if format matches
    if (preferences.preferredFormats && preferences.preferredFormats.length > 0) {
      const formatLower = preferences.preferredFormats.map((f) =>
        f.toLowerCase()
      );
      const ideaFormat = (idea.suggestedStructure?.format || "").toLowerCase();

      const hasMatch = formatLower.some((fmt) =>
        ideaFormat.includes(fmt)
      );
      if (!hasMatch) {
        console.log(`Filtering out: "${idea.title}" (format "${ideaFormat}" not in ${formatLower})`);
        return false;
      }
    }

    console.log(`✅ Keeping: "${idea.title}"`);
    return true;
  });
}