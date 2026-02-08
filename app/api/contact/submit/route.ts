import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import { generateContent } from "@/lib/ai/gemini";
import { sendEmailViaMailjet } from "@/lib/email/mailjet";
import { render } from "@react-email/render";
import { ContactResponseEmail } from "@/lib/email/contact-response-template";
import { SupportNotificationEmail } from "@/lib/email/support-notification-template";

// Queries that should be forwarded to support team
const COLLABORATION_KEYWORDS = [
  "collaboration",
  "brand deal",
  "sponsorship",
  "partnership",
  "business",
  "custom",
  "enterprise",
  "dedicated",
  "team",
  "paid",
];

const REQUIRES_MANUAL_REVIEW = [
  "refund",
  "subscription",
  "payment",
  "billing",
  "cancel",
  "upgrade",
  "downgrade",
];

// Pre-written responses for common questions
const COMMON_RESPONSES: Record<string, string> = {
  "how to set up email": `Here's exactly how to set up weekly email notifications:

Step-by-Step Setup:
1. Go to Settings page (from Dashboard or profile menu)
2. Look for "Weekly Email Intelligence" section
3. Check the box for "Enable Weekly Email Insights"
4. Select Frequency: Choose Weekly, Bi-weekly, or Monthly
5. Choose Day: Pick your preferred day (Sunday through Saturday)
6. Set Time: Enter the time you want emails (e.g., 09:00 AM)
7. Choose Timezone: Select your timezone from the dropdown
8. Click Save button

What You'll Receive:
- Top 5 video ideas ranked by confidence
- Key insights about what's working on your channel
- Performance patterns and trends
- Action items to try
- One-click unsubscribe link at bottom

Filter Your Emails:
After enabling emails, set your Content Preferences:
1. Still in Settings, find Content Preferences
2. Enter Focus Areas: Topics you want emphasized (e.g., "AI, Machine Learning")
3. Enter Avoid Topics: Topics to exclude (e.g., "Politics, Controversy")
4. Enter Preferred Formats: Video types you like (e.g., "Tutorial, Deep-dive")
5. Click Save

Your weekly emails will now only show ideas matching these preferences!

Pro Tip: You can change these settings anytime, and your next email will reflect the new preferences.`,

  "how to generate ideas": `Here's how to access and use video ideas:

Finding Your Ideas:
1. Click "Ideas" in the top navigation menu
2. You'll see a ranked list of AI-generated video ideas
3. Ideas are ranked by confidence score (best first)

Understanding Each Idea:
Each idea shows you:
- Title: The video idea or concept
- Confidence Score: Percentage likelihood it will work (85% = very likely)
- Comment Demand: What your audience specifically wants
- Past Performance: How similar videos performed
- Predicted Engagement: Expected percentage of views that will engage
- Suggested Structure: Recommended video format, length, and tone

Using the Ideas:
1. Click any idea to see the full breakdown
2. Read "Why It Works" to understand the reasoning
3. Review the suggested structure (format, length, tone)
4. Use this when planning your content calendar
5. Create videos based on these data-backed ideas

Get Ideas in Your Email:
1. Go to Settings → Enable Weekly Email Insights
2. Choose frequency, day, and time
3. Top 5 ideas will be sent to your email every week
4. Ideas are filtered by your Content Preferences (focus areas, topics to avoid, formats)

Pro Tip: Sort ideas by confidence score to find the most likely winners first. Focus on ideas with 85%+ confidence for highest chance of success.`,

  "how to understand audience": `Here's how to analyze your audience in CreatorMind:

View Dashboard Overview:
1. Go to Dashboard (main landing page after login)
2. See quick stats:
   - Total Videos: Your complete video count
   - Avg Engagement: Percentage of viewers who engage
   - Total Views: Sum of all your views
   - Ideas Generated: Number of AI ideas created

Explore Insights Page:
1. Click "Insights" in navigation
2. Review key patterns:
   - Best Formats: Which video types get most engagement
   - Top Topics: What subjects your audience engages with most
   - Best Tones and Hooks: What emotional approach works
   - Audience Themes: Common topics in comments
   - Performance Patterns: Trends showing what's working
   - Collaboration Signals: Brands or industries interested in your content

Analyze Individual Videos:
1. Go to Dashboard
2. Click any video in the carousel
3. View Comment Analysis:
   - Sentiment Distribution: Positive, negative, neutral comments
   - Comment Intent: Questions, praise, criticism, feature requests
   - Top Comment Topics: What audiences discuss most
   - Full Comment List: Read all comments

Take Action:
1. Identify top-performing formats and create more of them
2. See top topics and build content series
3. Find best tones and apply them
4. Read audience comments to understand pain points
5. Use insights in Content Preferences for personalized email ideas

Pro Tip: Check Insights monthly to track trends. What works changes as your audience grows.`,

  "how to connect youtube": `Here's how to connect your YouTube channel:

Connection Steps:
1. Log into CreatorMind (sign in with Google)
2. You'll land on Dashboard
3. Click the "Connect YouTube Channel" button
4. A popup appears asking for YouTube permissions
5. Click "Approve" to grant access
6. System fetches all your videos and comments
7. AI analysis begins automatically

What Happens Next:
- Videos are indexed
- Comments are analyzed
- AI creates initial set of ideas
- You can see progress on Dashboard
- Takes 2 to 5 minutes depending on channel size

What Gets Synced:
- All your published videos
- Video titles and descriptions
- View counts and engagement metrics
- Comments from all videos
- Comment sentiment and themes

Privacy:
- CreatorMind only reads your data
- Doesn't modify or post to your channel
- You can disconnect anytime in Settings

Pro Tip: After connecting, wait 5 to 10 minutes for full analysis.`,

  "content preferences": `Here's how to set up content preferences:

What Are Content Preferences?
These filter which video ideas appear in your weekly emails.

Where to Find Them:
1. Go to Settings page
2. Look for Content Preferences section

Set Your Focus Areas:
1. Enter topics you want emphasized
2. Separate topics with commas

Set Topics to Avoid:
1. Enter topics you don't want included
2. Separate with commas

Set Preferred Formats:
1. Enter video formats you prefer
2. Separate with commas

Save Your Preferences:
1. Click Save
2. Preferences apply immediately

How It Works:
- CreatorMind generates ideas
- Filters by your focus areas
- Removes avoid topics
- Prioritizes your formats
- Sends top matched ideas

Pro Tip: Be specific with focus areas for better filtering.`,

  "weekly email": `Here's everything about weekly email intelligence:

Enable Emails:
1. Go to Settings page
2. Find Weekly Email Intelligence section
3. Enable Weekly Email Insights
4. Choose frequency, day, time, and timezone
5. Click Save

Email Content:
- Top 5 video ideas
- Why each idea works
- Suggested structure
- Key insights
- Performance trends
- Action items
- Unsubscribe link

Email Schedule:
- Weekly: Every 7 days
- Bi-weekly: Every 14 days
- Monthly: Every 30 days

Change Anytime:
1. Go to Settings
2. Modify preferences
3. Click Save

Unsubscribe:
- Click unsubscribe link in email
- Or disable in Settings

Pro Tip: Set emails for early morning so you see ideas first.Use Content Preferences to get hyper-focused, relevant ideas.`
};

// Function to find best matching pre-written response
function findMatchingResponse(subject: string, message: string): string | null {
  const query = `${subject} ${message}`.toLowerCase();

  for (const [key, response] of Object.entries(COMMON_RESPONSES)) {
    if (query.includes(key)) {
      return response;
    }
  }

  return null;
}

function shouldForwardToSupport(subject: string, message: string): boolean {
  const combinedText = `${subject} ${message}`.toLowerCase();

  const isCollaboration = COLLABORATION_KEYWORDS.some((keyword) =>
    combinedText.includes(keyword)
  );

  const requiresReview = REQUIRES_MANUAL_REVIEW.some((keyword) =>
    combinedText.includes(keyword)
  );

  return isCollaboration || requiresReview;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to submit a query" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message, userEmail } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if query requires manual review
    if (shouldForwardToSupport(subject, message)) {
      const supportEmailHtml = await render(
        SupportNotificationEmail({
          userName: name,
          userEmail: email,
          subject: subject,
          message: message,
        })
      );

      await sendEmailViaMailjet({
        to: process.env.MAILJET_SENDER_EMAIL!,
        subject: `[SUPPORT NEEDED] Query from ${name}: ${subject}`,
        htmlContent: supportEmailHtml,
      });

      const userAckHtml = await render(
        ContactResponseEmail({
          userName: name,
          queryType: "forwarded_to_support",
          subject: subject,
        })
      );

      await sendEmailViaMailjet({
        to: email,
        subject: `We received your inquiry: ${subject}`,
        htmlContent: userAckHtml,
      });

      return NextResponse.json({
        success: true,
        message:
          "Your inquiry has been forwarded to our support team. You'll receive a response shortly.",
        type: "forwarded",
      });
    }

    // Try to find pre-written response first (no API call needed!)
    let aiResponse: string | null = findMatchingResponse(subject, message);

    // If no matching pre-written response, try Gemini API
    if (!aiResponse) {
      try {
        const systemPrompt = `You are CreatorMind expert support assistant. Your ONLY job is to answer this user's SPECIFIC question.

⚠️ CRITICAL: DO NOT give generic responses. Answer THEIR EXACT question directly and specifically.

USER'S SPECIFIC QUESTION:
Subject: "${subject}"
Message: "${message}"

---

CREATORMIND FEATURES:

**1. SIGN IN** - Click "Sign In" → Google auth

**2. CONNECT YOUTUBE** - Dashboard → "Connect YouTube Channel" → Approve

**3. DASHBOARD** - Shows: Total Videos, Avg Engagement %, Total Views, Ideas count

**4. INSIGHTS** - Shows: Best Formats, Top Topics, Best Tones, Audience Themes

**5. IDEAS** - Ranked ideas with Confidence Score, Comment Demand, Past Performance

**6. VIDEO COMMENTS** - Click video → See Sentiment, Intent, Top Topics

**7. WEEKLY EMAILS** - Settings → Enable → Choose Frequency/Day/Time/Timezone

**8. CONTENT PREFERENCES** - Settings → Focus Areas, Avoid Topics, Preferred Formats

**9. CHANNEL MANAGEMENT** - Settings → Re-sync, Disconnect, Sync History

**10. CONTACT** - /contact → Submit → Auto-response

---

ANSWER THEIR SPECIFIC QUESTION WITH STEPS AND DETAILS.`;

        aiResponse = await generateContent(systemPrompt);

        if (!aiResponse || aiResponse.trim().length < 50) {
          throw new Error("Response too short");
        }
      } catch (apiError: any) {
        // Handle API errors gracefully - just set aiResponse to null for fallback
        console.error("Gemini API error:", apiError?.message);
        aiResponse = null;
      }
    }

    // Fallback if no response found (pre-written or Gemini)
    if (!aiResponse) {
      aiResponse = `We received your question: "${subject}"

Our team is reviewing your inquiry and will provide a detailed response shortly. In the meantime, we recommend:

1. Checking our documentation for feature guides and tutorials
2. Exploring the Help section in the Settings page
3. Reviewing FAQs on our support page

We appreciate your patience and will get back to you soon with a comprehensive answer to your question.

Best regards,
CreatorMind Support Team`;
    }

    // Send response email
    const responseEmailHtml = await render(
      ContactResponseEmail({
        userName: name,
        queryType: "ai_response",
        subject: subject,
        response: aiResponse,
      })
    );

    const emailResult = await sendEmailViaMailjet({
      to: email,
      subject: `Your question has been answered`,
      htmlContent: responseEmailHtml,
    });

    if (!emailResult.success) {
      throw new Error("Failed to send email response");
    }

    // Save to database
    try {
      const ContactInquiry = (await import("@/models/ContactInquiry")).default;
      await ContactInquiry.create({
        userId: session.user.id || userEmail,
        name,
        email,
        subject,
        message,
        aiResponse,
        type: "ai_response",
        status: "resolved",
        createdAt: new Date(),
      });
    } catch (dbError) {
      console.log("Note: Could not save to database:", dbError);
    }

    return NextResponse.json({
      success: true,
      message:
        "Your query has been received! Check your email for our response.",
      type: "ai_response",
      messageId: emailResult.messageId,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process your query",
      },
      { status: 500 }
    );
  }
}