"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Video, MessageSquare, TrendingUp, Sparkles } from "lucide-react";
import { VideoCarousel } from "@/components/dashboard/video-carousel";
import { AudiencePulse } from "@/components/dashboard/audience-pulse";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [channelStatus, setChannelStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const checkChannelStatus = async () => {
      try {
        const res = await fetch("/api/youtube/connect");
        const data = await res.json();
        setChannelStatus(data);
      } catch (error) {
        console.error("Error checking channel status:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      checkChannelStatus();
    }
  }, [status]);

  const handleConnectChannel = async () => {
    try {
      const res = await fetch("/api/youtube/connect", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        setChannelStatus({ connected: true, syncStatus: "syncing" });
      }
    } catch (error) {
      console.error("Error connecting channel:", error);
    }
  };

  if (status === "loading" || loading) {
    return <DashboardSkeleton />;
  }

  if (!channelStatus?.connected) {
    return <ConnectChannelPrompt onConnect={handleConnectChannel} />;
  }

  if (channelStatus.syncStatus === "syncing" || channelStatus.syncStatus === "pending") {
    return <SyncingProgress channelName={channelStatus.channelName} />;
  }

  return <DashboardContent />;
}

function ConnectChannelPrompt({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center">
          <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <CardTitle className="text-3xl text-white">Connect Your YouTube Channel</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-300 mb-6 text-lg">
            Let's analyze your channel to discover what's working and generate personalized video ideas.
          </p>
          <Button onClick={onConnect} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
            <Video className="mr-2 h-5 w-5" />
            Connect YouTube Channel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SyncingProgress({ channelName }: { channelName: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="pt-6 text-center">
          <div className="animate-spin h-16 w-16 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing {channelName}...</h2>
          <p className="text-gray-300 mb-4">
            We're analyzing all your videos and comments. This usually takes 2-5 minutes.
          </p>
          <div className="space-y-2 text-left max-w-md mx-auto text-gray-400">
            <p>✓ Fetching videos...</p>
            <p>✓ Downloading comments...</p>
            <p>⏳ Analyzing content with AI...</p>
            <p className="text-gray-500">⏳ Generating insights...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [ideas, setIdeas] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsRes, ideasRes] = await Promise.all([
          fetch("/api/insights"),
          fetch("/api/ideas"),
        ]);

        const insightsData = await insightsRes.json();
        const ideasData = await ideasRes.json();

        setInsights(insightsData);
        setIdeas(ideasData);
        setStats(insightsData.stats);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  if (!stats || !insights) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Video className="h-6 w-6 text-blue-600" />}
            label="Total Videos"
            value={stats.totalVideos}
          />
          <StatCard
            icon={<MessageSquare className="h-6 w-6 text-green-600" />}
            label="Avg Engagement"
            value={`${(stats.avgEngagement * 100).toFixed(1)}%`}
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
            label="Total Views"
            value={stats.totalViews.toLocaleString()}
          />
          <StatCard
            icon={<Sparkles className="h-6 w-6 text-yellow-600" />}
            label="Ideas Generated"
            value={ideas?.ideas?.length || 0}
          />
        </div>
        {/* Video Carousel */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Videos</h2>
          <VideoCarousel />
        </div>
        <AudiencePulse />


        {/* Top Insights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🎯 Your Top Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.insights.patterns.bestFormats.slice(0, 3).map((format: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium">{format.format} videos</span>
                <span className="text-green-600 font-semibold">
                  {(format.avgEngagement * 100).toFixed(1)}% engagement
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Latest Ideas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>💡 Latest Video Ideas</CardTitle>
            <Link href="/ideas">
              <Button variant="outline">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {ideas?.ideas?.slice(0, 3).map((idea: any, i: number) => (
              <div key={i} className="mb-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                <h3 className="font-bold text-lg mb-2">{idea.title}</h3>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>📊 {(idea.predictedEngagement * 100).toFixed(1)}% predicted</span>
                  <span>🎯 {(idea.confidence * 100).toFixed(0)}% confidence</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}