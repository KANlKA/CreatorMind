"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { VideoCarousel } from "@/components/dashboard/video-carousel";
import { AudiencePulse } from "@/components/dashboard/audience-pulse";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Clock,
  Target,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

export default function InsightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch("/api/insights");
        const data = await res.json();
        setInsights(data);
      } catch (error) {
        console.error("Error fetching insights:", error);
        toast.error("Failed to load insights");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchInsights();
    }
  }, [status]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch("/api/insights", { method: "POST" });
      const data = await res.json();
      
      if (res.ok) {
        setInsights(data);
        toast.success("Insights regenerated successfully!");
      } else {
        toast.error("Failed to regenerate insights");
      }
    } catch (error) {
      console.error("Error regenerating insights:", error);
      toast.error("Failed to regenerate insights");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return <InsightsSkeleton />;
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-black">
        {/* Space for navbar */}
        <div className="h-20" />
        
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-12 pb-12 text-center">
              <Brain className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Insights Available</h2>
              <p className="text-gray-400">Please connect your YouTube channel to see insights.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { insights: creatorInsights, stats } = insights;

  return (
    <div className="min-h-screen bg-black">
      {/* 🎯 NAVBAR SPACE - This creates space for the floating header */}
      <div className="h-20" />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1">Your Creator Insights</h1>
              <p className="text-gray-400">
                Deep analysis of your {stats.totalVideos} videos
              </p>
            </div>
          </div>
          <Button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white"
          >
            {regenerating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Refresh Insights
              </>
            )}
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-950/30 to-green-900/20 border-green-900/50 hover:border-green-700/50 transition-all">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-green-400 mb-2 font-medium">Average Engagement</p>
                <p className="text-5xl font-bold text-green-500">
                  {(stats.avgEngagement * 100).toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-950/30 to-blue-900/20 border-blue-900/50 hover:border-blue-700/50 transition-all">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-blue-400 mb-2 font-medium">Total Videos</p>
                <p className="text-5xl font-bold text-blue-500">{stats.totalVideos}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-950/30 to-purple-900/20 border-purple-900/50 hover:border-purple-700/50 transition-all">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-purple-400 mb-2 font-medium">Total Views</p>
                <p className="text-5xl font-bold text-purple-500">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Patterns */}
        <Card className="mb-8 bg-zinc-900 border-zinc-800">
          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="flex items-center gap-2 text-white text-2xl">
              <TrendingUp className="h-6 w-6 text-green-500" />
              What's Working Best
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {/* Best Formats */}
            <div>
              <h3 className="font-bold mb-4 text-xl text-gray-200 flex items-center gap-2">
                <span className="text-2xl">🎬</span>
                Best Formats
              </h3>
              <div className="space-y-3">
                {creatorInsights.patterns.bestFormats.map(
                  (format: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-5 bg-green-950/20 rounded-xl border-2 border-green-900/30 hover:border-green-700/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-green-600 text-white border-0 text-lg px-3 py-1">
                          #{i + 1}
                        </Badge>
                        <div>
                          <p className="font-semibold capitalize text-white text-lg">{format.format}</p>
                          <p className="text-sm text-gray-400">
                            {format.count} videos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-500">
                          {(format.avgEngagement * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">avg engagement</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Best Topics */}
            <div>
              <h3 className="font-bold mb-4 text-xl text-gray-200 flex items-center gap-2">
                <span className="text-2xl">📚</span>
                Best Topics
              </h3>
              <div className="space-y-3">
                {creatorInsights.patterns.bestTopics.slice(0, 5).map(
                  (topic: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-5 bg-blue-950/20 rounded-xl border-2 border-blue-900/30 hover:border-blue-700/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-blue-600 text-white border-0 text-lg px-3 py-1">
                          #{i + 1}
                        </Badge>
                        <div>
                          <p className="font-semibold text-white text-lg">{topic.topic}</p>
                          <p className="text-sm text-gray-400">
                            {topic.videos} videos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-500">
                          {(topic.avgEngagement * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">avg engagement</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Best Tones */}
            <div>
              <h3 className="font-bold mb-4 text-xl text-gray-200 flex items-center gap-2">
                <span className="text-2xl">🎭</span>
                Best Tones
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {creatorInsights.patterns.bestTones.map(
                  (tone: any, i: number) => (
                    <div
                      key={i}
                      className="p-6 bg-purple-950/20 rounded-xl border-2 border-purple-900/30 hover:border-purple-700/50 text-center transition-all"
                    >
                      <p className="font-semibold capitalize mb-3 text-white text-lg">{tone.tone}</p>
                      <p className="text-4xl font-bold text-purple-500">
                        {(tone.avgEngagement * 100).toFixed(1)}%
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Best Upload Time */}
            <div>
              <h3 className="font-bold mb-4 text-xl text-gray-200 flex items-center gap-2">
                <Clock className="h-6 w-6 text-yellow-500" />
                Best Upload Time
              </h3>
              <div className="p-8 bg-gradient-to-br from-yellow-950/30 to-orange-950/20 rounded-xl border-2 border-yellow-900/30 text-center">
                <p className="text-lg mb-3 text-gray-300">Your videos perform best when uploaded on:</p>
                <p className="text-5xl font-bold text-yellow-500 capitalize mb-2">
                  {creatorInsights.patterns.bestUploadTimes.dayOfWeek}s
                </p>
                <p className="text-2xl text-yellow-400 mt-2">
                  at {creatorInsights.patterns.bestUploadTimes.timeOfDay}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audience Intelligence */}
        <Card className="mb-8 bg-zinc-900 border-zinc-800">
          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="flex items-center gap-2 text-white text-2xl">
              <Target className="h-6 w-6 text-blue-500" />
              Your Audience Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-950/20 rounded-xl border-2 border-blue-900/30">
                <h3 className="font-semibold mb-3 text-blue-400">Primary Intent</h3>
                <p className="text-3xl font-bold capitalize text-white">
                  {creatorInsights.audience.primaryIntent}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  What your audience comes for
                </p>
              </div>
              <div className="p-6 bg-green-950/20 rounded-xl border-2 border-green-900/30">
                <h3 className="font-semibold mb-3 text-green-400">Skill Level</h3>
                <p className="text-3xl font-bold capitalize text-white">
                  {creatorInsights.audience.skillLevel}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Your audience's expertise level
                </p>
              </div>
              <div className="p-6 bg-purple-950/20 rounded-xl border-2 border-purple-900/30">
                <h3 className="font-semibold mb-3 text-purple-400">Engagement Quality</h3>
                <p className="text-3xl font-bold capitalize text-white">
                  {creatorInsights.audience.engagementQuality}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Based on comment depth and interaction
                </p>
              </div>
              {creatorInsights.audience.demographics && (
                <div className="p-6 bg-orange-950/20 rounded-xl border-2 border-orange-900/30">
                  <h3 className="font-semibold mb-3 text-orange-400">Demographics</h3>
                  <p className="text-3xl font-bold text-white">
                    {creatorInsights.audience.demographics}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Inferred from content and engagement
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Video Carousel */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
            <span className="text-2xl">🎥</span>
            Your Videos
          </h2>
          <VideoCarousel />
        </div>

        {/* Audience Pulse */}
        <AudiencePulse />

        {/* Comment Intelligence */}
        <Card className="mt-8 bg-zinc-900 border-zinc-800">
          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="flex items-center gap-2 text-white text-2xl">
              <MessageSquare className="h-6 w-6 text-orange-500" />
              What Your Audience Wants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {/* Top Requests */}
            <div>
              <h3 className="font-bold mb-4 text-xl text-gray-200 flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                Top Requests
              </h3>
              <div className="space-y-3">
                {creatorInsights.commentThemes.topRequests
                  .slice(0, 5)
                  .map((request: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-5 bg-orange-950/20 rounded-xl border-2 border-orange-900/30 hover:border-orange-700/50 transition-all"
                    >
                      <div>
                        <p className="font-semibold text-white text-lg">{request.theme}</p>
                        <p className="text-sm text-gray-400">
                          Mentioned in {request.videoIds.length} videos
                        </p>
                      </div>
                      <Badge className="bg-orange-600 text-white text-base px-4 py-2">
                        {request.mentions} mentions
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>

            {/* Confusion Areas */}
            {creatorInsights.commentThemes.confusionAreas.length > 0 && (
              <div>
                <h3 className="font-bold mb-4 text-xl text-gray-200 flex items-center gap-2">
                  <span className="text-2xl">❓</span>
                  Confusion Areas
                </h3>
                <div className="space-y-3">
                  {creatorInsights.commentThemes.confusionAreas.map(
                    (area: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-5 bg-red-950/20 rounded-xl border-2 border-red-900/30 hover:border-red-700/50 transition-all"
                      >
                        <p className="font-semibold text-white text-lg">{area.area}</p>
                        <Badge className="bg-red-600 text-white text-base px-4 py-2">
                          {area.mentions} confused viewers
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Praise Patterns */}
            {creatorInsights.commentThemes.praisePatterns.length > 0 && (
              <div>
                <h3 className="font-bold mb-4 text-xl text-gray-200 flex items-center gap-2">
                  <span className="text-2xl">💚</span>
                  What They Love
                </h3>
                <div className="space-y-3">
                  {creatorInsights.commentThemes.praisePatterns.map(
                    (pattern: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-5 bg-green-950/20 rounded-xl border-2 border-green-900/30 hover:border-green-700/50 transition-all"
                      >
                        <p className="font-semibold text-white text-lg">{pattern.pattern}</p>
                        <Badge className="bg-green-600 text-white text-base px-4 py-2">
                          {pattern.mentions} praises
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      {/* Space for navbar */}
      <div className="h-20" />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Skeleton className="h-12 w-96 mb-2 bg-zinc-800" />
        <Skeleton className="h-6 w-64 mb-8 bg-zinc-800" />
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 bg-zinc-800" />
          ))}
        </div>
        
        <Skeleton className="h-96 mb-8 bg-zinc-800" />
        <Skeleton className="h-64 mb-8 bg-zinc-800" />
        <Skeleton className="h-96 bg-zinc-800" />
      </div>
    </div>
  );
}