"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Video,
  Brain,
  Mail,
  BarChart3,
  Settings,
  Zap,
  Shield,
  HelpCircle,
} from "lucide-react";

export default function DocumentationPage() {
  const router = useRouter();

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      title: "AI-Powered Video Ideas",
      description:
        "Get intelligent video content suggestions based on your channel's performance, audience comments, and trending topics. Each idea includes predicted engagement rates and confidence scores.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Performance Analytics",
      description:
        "Analyze your top-performing content formats, tones, hooks, and upload times. Discover patterns in what resonates with your audience and optimize your content strategy.",
    },
    {
      icon: <Mail className="h-8 w-8 text-green-600" />,
      title: "Weekly Email Insights",
      description:
        "Receive personalized weekly emails with your top 5 video ideas, key insights from your data, performance patterns, and actionable recommendations. Fully customizable frequency and preferences.",
    },
    {
      icon: <Video className="h-8 w-8 text-indigo-600" />,
      title: "Channel Management",
      description:
        "Connect your YouTube channel, manage your content, and control how often we sync your data. Monitor sync status and keep your information up-to-date.",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Real-Time Recommendations",
      description:
        "Get instant access to video ideas and insights based on your latest video performance and audience feedback. Powered by advanced AI analysis.",
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Privacy & Security",
      description:
        "Your data is secure and encrypted. We only access publicly available YouTube data and use industry-standard security practices to protect your information.",
    },
  ];

  const emailFeatures = [
    {
      title: "Top Video Ideas",
      description: "Get 3-10 AI-generated video ideas based on your preferences",
    },
    {
      title: "Confidence Scores",
      description: "Each idea includes predicted engagement and confidence metrics",
    },
    {
      title: "Why It Works",
      description: "Understand the reasoning behind each recommendation",
    },
    {
      title: "Action Items",
      description: "Get practical steps to implement and track your new video content",
    },
    {
      title: "Content Filtering",
      description:
        "Ideas are filtered based on your focus areas, avoided topics, and preferred formats",
    },
    {
      title: "One-Click Unsubscribe",
      description: "Manage your email preferences anytime with a single click",
    },
  ];

  const contentPreferences = [
    {
      title: "Focus Areas",
      description:
        "Specify topics you want to focus on. Ideas will prioritize these subjects (e.g., AI, Machine Learning, Python)",
    },
    {
      title: "Avoid Topics",
      description:
        "Tell us which topics to skip. We'll exclude these from all recommendations (e.g., Politics, Religion)",
    },
    {
      title: "Preferred Formats",
      description:
        "Choose the video formats you like creating (e.g., tutorials, vlogs, deep-dives, shorts, compilations)",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-10 w-10 text-purple-600" />
            <h1 className="text-4xl font-bold">CreatorMind Documentation</h1>
          </div>
          <p className="text-xl text-gray-600">
            Master the features that help you create better content
          </p>
        </div>

        {/* Quick Navigation */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("getting-started")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Getting Started
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Features
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("email-setup")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Email Setup
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("faq")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                FAQ
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <section id="getting-started" className="scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <div className="text-3xl font-bold text-purple-600">1</div>
                <CardTitle>Connect Your Channel</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Go to Dashboard and click "Connect YouTube Channel" to link your
                YouTube account. You'll need to authorize CreatorMind to access
                your channel data.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="text-3xl font-bold text-blue-600">2</div>
                <CardTitle>Set Your Preferences</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Visit Settings to customize your email frequency, content
                preferences, focus areas, and avoided topics. These settings
                directly impact the ideas you receive.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="text-3xl font-bold text-green-600">3</div>
                <CardTitle>Receive Ideas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Get personalized video ideas via email on your chosen schedule.
                Every idea includes why it will work and how to implement it.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Core Features */}
        <section id="features" className="scroll-mt-20">
          <h2 className="text-2xl font-bold mb-6">Core Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  {feature.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Email Features */}
        <section id="email-setup" className="scroll-mt-20">
          <h2 className="text-2xl font-bold mb-6">Weekly Email Insights</h2>
          <p className="text-gray-600 mb-6">
            Your weekly emails include everything you need to plan your next
            videos. Here's what you'll receive:
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {emailFeatures.map((feature, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  {feature.description}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Content Preferences in Emails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700">
                Your content preferences (focus areas, avoided topics, and
                preferred formats) are applied to all ideas sent via email. This
                ensures you only receive relevant suggestions.
              </p>
              <p className="text-sm font-medium text-gray-900">
                Update your preferences in Settings anytime:
              </p>
              <div className="grid gap-3">
                {contentPreferences.map((pref, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium text-gray-900">
                      {pref.title}:
                    </span>{" "}
                    <span className="text-gray-700">{pref.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Email Customization */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Customize Your Emails</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Email Frequency Options
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>
                  <span className="font-medium">Weekly:</span> Get fresh ideas
                  every 7 days
                </p>
                <p>
                  <span className="font-medium">Bi-Weekly:</span> Receive ideas
                  every 14 days
                </p>
                <p>
                  <span className="font-medium">Monthly:</span> Monthly digest
                  of ideas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Scheduling Your Emails
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>
                  <span className="font-medium">Day:</span> Choose any day of
                  the week
                </p>
                <p>
                  <span className="font-medium">Time:</span> Set your preferred
                  time
                </p>
                <p>
                  <span className="font-medium">Timezone:</span> Automatic
                  timezone detection
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                  How often is my channel data updated?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Your channel data syncs automatically. You can manually refresh
                by clicking "Re-sync Channel" in Settings at any time.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  Can I change my content preferences anytime?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Yes! Your content preferences update immediately. Future ideas
                will reflect your new focus areas, avoided topics, and preferred
                formats.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-green-600" />
                  What if I want to unsubscribe from emails?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                You can disable emails in Settings, or click the unsubscribe
                link at the bottom of any email. No questions asked!
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-yellow-600" />
                  How are video ideas generated?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Ideas are generated using AI analysis of your channel's
                performance, audience comments, trending topics, and your
                content preferences. Each idea includes a confidence score and
                reasoning.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-red-600" />
                  Is my data secure?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Yes! We use industry-standard encryption and only access publicly
                available YouTube data. Your privacy is our priority.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Support */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Can't find what you're looking for? Check out our support channels:
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() =>
                  (window.location.href = "mailto:support@creatormind.ai")
                }
                className="bg-purple-600 hover:bg-purple-700"
              >
                Contact Support
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/settings")}
              >
                Go to Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
}