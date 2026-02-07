"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Video, MessageSquare, TrendingUp, Sparkles, BarChart3, ArrowRight, Briefcase } from "lucide-react";
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
    <div className="min-h-[calc(100vh-4rem)] pt-24
 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
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
  const [progress, setProgress] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const pollProgress = async () => {
      try {
        const res = await fetch('/api/youtube/progress');
        const data = await res.json();
        setProgress(data);

        // If completed, refresh the page to show dashboard
        if (data.status === 'completed') {
          setTimeout(() => {
            router.refresh();
          }, 2000);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    // Poll every 2 seconds
    pollProgress();
    const interval = setInterval(pollProgress, 2000);

    return () => clearInterval(interval);
  }, [router]);

  const progressPercentage = progress?.totalVideos > 0
    ? Math.round((progress.processedVideos / progress.totalVideos) * 100)
    : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-24
 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="pt-6 text-center">
          <div className="animate-spin h-16 w-16 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing {channelName}...</h2>

          {progress?.status === 'completed' ? (
            <div className="mb-4">
              <p className="text-green-400 text-xl mb-2">✓ Analysis Complete!</p>
              <p className="text-gray-300">Redirecting to dashboard...</p>
            </div>
          ) : progress?.totalVideos > 0 ? (
            <div className="mb-4">
              <p className="text-purple-300 text-xl mb-2">
                {progress.processedVideos} of {progress.totalVideos} videos analyzed
              </p>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-gray-300 text-sm truncate max-w-md mx-auto">
                Currently analyzing: {progress.currentVideo}
              </p>
            </div>
          ) : (
            <p className="text-gray-300 mb-4">
              Fetching your videos and comments...
            </p>
          )}

          <div className="space-y-2 text-left max-w-md mx-auto text-gray-400 mt-6">
            <p className={progress?.status === 'fetching' ? 'text-purple-300' : 'text-gray-500'}>
              {progress?.status !== 'fetching' ? '✓' : '⏳'} Fetching videos
            </p>
            <p className={progress?.status === 'analyzing' ? 'text-purple-300' : 'text-gray-500'}>
              {progress?.status === 'completed' ? '✓' : progress?.status === 'analyzing' ? '⏳' : ''} Analyzing content with AI
            </p>
            <p className={progress?.status === 'completed' ? 'text-green-400' : 'text-gray-500'}>
              {progress?.status === 'completed' ? '✓' : '⏳'} Generating insights
            </p>
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
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

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

  const handleRefreshData = async () => {
    try {
      setSyncing(true);
      console.log("[DASHBOARD] Initiating sync...");

      const res = await fetch("/api/youtube/sync", { method: "POST" });
      const data = await res.json();

      console.log("[DASHBOARD] Sync response:", data);

      if (data.error) {
        console.error("[DASHBOARD] Sync error:", data.error);
        alert(`Sync error: ${data.error}`);
        setSyncing(false);
        return;
      }

      if (data.success) {
        // Poll for sync completion
        let pollCount = 0;
        const maxPolls = 100; // 100 * 3 seconds = 5 minutes max

        const checkSync = setInterval(async () => {
          pollCount++;
          console.log(`[DASHBOARD] Polling sync status (${pollCount}/${maxPolls})...`);

          try {
            const statusRes = await fetch("/api/youtube/sync");
            const statusData = await statusRes.json();

            console.log("[DASHBOARD] Sync status:", statusData);

            if (statusData.syncStatus === "completed") {
              console.log("[DASHBOARD] Sync completed! Refreshing...");
              clearInterval(checkSync);
              setSyncing(false);

              // Refresh the page data
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } else if (statusData.syncStatus === "failed") {
              console.error("[DASHBOARD] Sync failed!");
              clearInterval(checkSync);
              setSyncing(false);
              alert("Sync failed. Please try again.");
            } else if (pollCount >= maxPolls) {
              console.error("[DASHBOARD] Sync timeout!");
              clearInterval(checkSync);
              setSyncing(false);
              alert("Sync is taking longer than expected. It may still complete in the background.");
            }
          } catch (error) {
            console.error("[DASHBOARD] Error checking sync status:", error);
          }
        }, 3000);
      }
    } catch (error) {
      console.error("[DASHBOARD] Error refreshing data:", error);
      setSyncing(false);
      alert("Failed to start sync. Please try again.");
    }
  };

  if (!stats || !insights) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-24
 bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="flex gap-3">
            <Button
              onClick={handleRefreshData}
              disabled={syncing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {syncing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Refresh Data
                </>
              )}
            </Button>
          </div>
        </div>

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

        {/* Performance Patterns CTA Card */}
        <Card className="mb-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Performance Patterns Analysis</h3>
                  <p className="text-sm text-gray-300">
                    See what's working best: formats, topics, tones, hooks, and optimal upload times
                  </p>
                </div>
              </div>
              <Link href="/performance">
                <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                  View Analysis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Brand Collaboration Signals CTA Card */}
        <Card className="mb-8 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <Briefcase className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Brand Collaboration Signals</h3>
                  <p className="text-sm text-gray-300">
                    Discover industries, brands, and content styles that attract sponsorships
                  </p>
                </div>
              </div>
              <Link href="/brand-collaboration">
                <Button className="bg-green-600 hover:bg-green-700 gap-2">
                  View Opportunities
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Top Insights */}
        <Card className="mb-8 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">🎯 Your Top Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.insights.patterns.bestFormats.slice(0, 3).map((format: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="font-medium text-white">{format.format} videos</span>
                <span className="text-green-400 font-semibold">
                  {(format.avgEngagement * 100).toFixed(1)}% engagement
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Latest Ideas */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">💡 Latest Video Ideas</CardTitle>
            <Link href="/ideas">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {ideas?.ideas?.slice(0, 3).map((idea: any, i: number) => (
              <div key={i} className="mb-4 p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                <h3 className="font-bold text-lg mb-2 text-white">{idea.title}</h3>
                <div className="flex gap-4 text-sm text-gray-400">
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
    <Card className="bg-white/5 border-white/10">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-[calc(100vh-6rem)] pt-24
bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64 mb-8 bg-white/10" />
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 bg-white/10" />
          ))}
        </div>
        <Skeleton className="h-64 mb-8 bg-white/10" />
        <Skeleton className="h-96 bg-white/10" />
      </div>
    </div>
  );
}