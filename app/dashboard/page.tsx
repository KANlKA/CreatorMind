"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Video, MessageSquare, TrendingUp, Sparkles, BarChart3, ArrowRight, Briefcase, RefreshCw, ExternalLink, ChevronRight } from "lucide-react";
import { VideoCarousel } from "@/components/dashboard/video-carousel";
import { AudiencePulse } from "@/components/dashboard/audience-pulse";
import { EngagementTimeline } from "@/components/dashboard/engagement-timeline";
import GlareButton from "@/components/ui/GlareButton"


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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="h-20" />
      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 rounded-full border border-zinc-800 mb-6">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Connect Your Channel</h1>
          <p className="text-gray-400">
            Analyze your content to discover patterns and generate personalized video ideas.
          </p>
        </div>
        
        <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-white">
                <div className="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                  <span className="text-sm">1</span>
                </div>
                <p>Analyze your existing videos</p>
              </div>
              
              <div className="flex items-center space-x-3 text-white">
                <div className="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                  <span className="text-sm">2</span>
                </div>
                <p>Discover audience engagement patterns</p>
              </div>
              
              <div className="flex items-center space-x-3 text-white">
                <div className="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                  <span className="text-sm">3</span>
                </div>
                <p>Get AI-powered video ideas</p>
              </div>
            </div>
            
            <Button 
              onClick={onConnect} 
              size="lg" 
              className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white transition-all group"
            >
              <Video className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              Connect YouTube Channel
            </Button>
            
            <p className="text-center text-gray-500 text-sm mt-4">
              We only access your public video data
            </p>
          </CardContent>
        </Card>
      </div>
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

        if (data.status === 'completed') {
          setTimeout(() => {
            router.refresh();
          }, 2000);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    pollProgress();
    const interval = setInterval(pollProgress, 2000);

    return () => clearInterval(interval);
  }, [router]);

  const progressPercentage = progress?.totalVideos > 0
    ? Math.round((progress.processedVideos / progress.totalVideos) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="h-20" />
      <div className="relative z-10 max-w-lg w-full">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 border-4 border-zinc-800 rounded-full"></div>
                <div className="absolute top-0 left-0 w-24 h-24 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Channel</h2>
              <p className="text-gray-400 mb-6">{channelName}</p>
              
              {progress?.status === 'completed' ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-800 rounded-full border border-zinc-700">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-white">Redirecting to dashboard...</p>
                </div>
              ) : progress?.totalVideos > 0 ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Progress</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      Analyzing: {progress.currentVideo}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-white">{progress.processedVideos}</div>
                      <div className="text-xs text-gray-500">Processed</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-white">{progress.totalVideos}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-white">{progress.totalVideos - progress.processedVideos}</div>
                      <div className="text-xs text-gray-500">Remaining</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Fetching your videos and comments...</p>
              )}
              
              <div className="mt-8 space-y-3 text-left">
                <div className={`flex items-center space-x-3 ${progress?.status === 'fetching' ? 'text-white' : 'text-gray-600'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${progress?.status !== 'fetching' ? 'bg-zinc-800' : 'bg-purple-600'}`}>
                    {progress?.status !== 'fetching' ? '✓' : <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                  </div>
                  <span>Fetching videos</span>
                </div>
                
                <div className={`flex items-center space-x-3 ${progress?.status === 'analyzing' ? 'text-white' : 'text-gray-600'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${progress?.status === 'completed' ? 'bg-purple-600' : 'bg-zinc-800'}`}>
                    {progress?.status === 'completed' ? '✓' : progress?.status === 'analyzing' ? <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> : ''}
                  </div>
                  <span>Analyzing content</span>
                </div>
                
                <div className={`flex items-center space-x-3 ${progress?.status === 'completed' ? 'text-white' : 'text-gray-600'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${progress?.status === 'completed' ? 'bg-purple-600' : 'bg-zinc-800'}`}>
                    {progress?.status === 'completed' ? '✓' : <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                  </div>
                  <span>Generating insights</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
      const res = await fetch("/api/youtube/sync", { method: "POST" });
      const data = await res.json();

      if (data.error) {
        alert(`Sync error: ${data.error}`);
        setSyncing(false);
        return;
      }

      if (data.success) {
        let pollCount = 0;
        const maxPolls = 100;

        const checkSync = setInterval(async () => {
          pollCount++;

          try {
            const statusRes = await fetch("/api/youtube/sync");
            const statusData = await statusRes.json();

            if (statusData.syncStatus === "completed") {
              clearInterval(checkSync);
              setSyncing(false);
              setTimeout(() => window.location.reload(), 1000);
            } else if (statusData.syncStatus === "failed") {
              clearInterval(checkSync);
              setSyncing(false);
              alert("Sync failed. Please try again.");
            } else if (pollCount >= maxPolls) {
              clearInterval(checkSync);
              setSyncing(false);
              alert("Sync is taking longer than expected.");
            }
          } catch (error) {
            console.error("Error checking sync status:", error);
          }
        }, 3000);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setSyncing(false);
      alert("Failed to start sync. Please try again.");
    }
  };

  if (!stats || !insights) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="h-20" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Analytics and insights for your channel</p>
          </div>
          <Button
            onClick={handleRefreshData}
            disabled={syncing}
            variant="outline"
            className="border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-600"
          >
            {syncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Video className="h-5 w-5 text-white" />}
            label="Total Videos"
            value={stats.totalVideos}
            trend="+2.3%"
          />
          <StatCard
            icon={<MessageSquare className="h-5 w-5 text-white" />}
            label="Avg Engagement"
            value={`${(stats.avgEngagement * 100).toFixed(1)}%`}
            trend="+1.8%"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-white" />}
            label="Total Views"
            value={stats.totalViews.toLocaleString()}
            trend="+12.4%"
          />
          <StatCard
            icon={<Sparkles className="h-5 w-5 text-white" />}
            label="Ideas Generated"
            value={ideas?.ideas?.length || 0}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all">
            <CardHeader>
              <CardTitle className="text-white">Engagement Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <EngagementTimeline />
            </CardContent>
          </Card>

          {/* Performance Patterns Card */}
          <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-800 rounded-lg mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Performance Patterns</h3>
                <p className="text-gray-400 text-sm">
                  Analyze what formats, topics, and upload times work best for your audience.
                </p>
              </div>
              <Link href="/performance">
  <GlareButton className="w-full">
    View Analysis
  </GlareButton>
</Link>
            </CardContent>
          </Card>
        </div>

        {/* Brand Collaboration Card */}
        <Card className="mb-8 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all">
  <CardContent className="p-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-800 rounded-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Brand Collaboration Signals</h3>
          <p className="text-gray-400 text-sm">
            Discover sponsorship opportunities based on your content style and audience.
          </p>
        </div>
      </div>
      <Link href="/brand-collaboration">
  <GlareButton className="w-full">
    View Opportunities
  </GlareButton>
</Link>
    </div>
  </CardContent>
</Card>
        {/* Insights and Ideas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all">
            <CardHeader>
              <CardTitle className="text-white">Top Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.insights.patterns.bestFormats.slice(0, 3).map((format: any, i: number) => (
                <div 
                  key={i} 
                  className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                        <span className="text-sm text-white">{i + 1}</span>
                      </div>
                      <span className="font-medium text-white">{format.format} videos</span>
                    </div>
                    <span className="text-white font-semibold bg-zinc-700 px-3 py-1 rounded-full text-sm">
                      {(format.avgEngagement * 100).toFixed(1)}% engagement
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Latest Video Ideas</CardTitle>
              <Link href="/ideas">
                <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-zinc-700">
                  View All
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {ideas?.ideas?.slice(0, 3).map((idea: any, i: number) => (
                <div 
                  key={i} 
                  className="mb-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-2">
                        {idea.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center text-gray-400">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                          {(idea.predictedEngagement * 100).toFixed(1)}% predicted
                        </span>
                        <span className="flex items-center text-gray-400">
                          <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                          {(idea.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string | number; trend?: string }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          {trend && (
            <span className="text-xs px-2 py-1 bg-zinc-800 text-white rounded-full">
              {trend}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="h-20" />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-10 w-48 bg-zinc-800 mb-2" />
            <Skeleton className="h-4 w-64 bg-zinc-800" />
          </div>
          <Skeleton className="h-10 w-32 bg-zinc-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 bg-zinc-800 rounded-lg" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-80 bg-zinc-800 rounded-lg" />
          <Skeleton className="h-80 bg-zinc-800 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 bg-zinc-800 rounded-lg" />
          <Skeleton className="h-96 bg-zinc-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}