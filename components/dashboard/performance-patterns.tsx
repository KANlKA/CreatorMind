"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Video,
  Target,
  MessageSquare,
  Clock,
  Lightbulb,
} from "lucide-react";

interface PerformancePattern {
  bestFormats: FormatPerformance[];
  bestTopics: TopicPerformance[];
  bestTones: TonePerformance[];
  bestHooks: HookPerformance[];
  uploadTimeOptimization: UploadTimeAnalysis;
  overallMetrics: OverallMetrics;
  insights: string[];
}

interface FormatPerformance {
  format: string;
  videoCount: number;
  avgEngagement: number;
  avgViews: number;
  totalViews: number;
  topVideo: {
    title: string;
    videoId: string;
    engagement: number;
    views: number;
  } | null;
  comparisonToAverage: number;
}

interface TopicPerformance {
  topic: string;
  videoCount: number;
  avgEngagement: number;
  avgViews: number;
  totalViews: number;
  rank: number;
}

interface TonePerformance {
  tone: string;
  videoCount: number;
  avgEngagement: number;
  avgViews: number;
  comparisonToAverage: number;
}

interface HookPerformance {
  hookType: string;
  videoCount: number;
  avgEngagement: number;
  comparisonToAverage: number;
}

interface UploadTimeAnalysis {
  byDayOfWeek: DayPerformance[];
  byTimeOfDay: TimeOfDayPerformance[];
  bestDay: string;
  bestTime: string;
  bestCombination: {
    day: string;
    time: string;
    avgEngagement: number;
  };
}

interface DayPerformance {
  day: string;
  videoCount: number;
  avgEngagement: number;
  avgViews: number;
  totalViews: number;
}

interface TimeOfDayPerformance {
  timeSlot: string;
  timeRange: string;
  videoCount: number;
  avgEngagement: number;
  avgViews: number;
}

interface OverallMetrics {
  totalVideos: number;
  avgEngagement: number;
  totalViews: number;
  totalLikes: number;
  avgViewsPerVideo: number;
  engagementTrend: "up" | "down" | "stable";
}

export function PerformancePatterns() {
  const [patterns, setPatterns] = useState<PerformancePattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/patterns");
      if (!res.ok) throw new Error("Failed to fetch patterns");
      const data = await res.json();
      setPatterns(data.patterns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 bg-gray-100 animate-pulse rounded-lg" />
        <div className="h-40 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error || !patterns) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-500">
            {error || "No pattern data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            Key Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {patterns.insights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm bg-white/60 p-3 rounded-lg"
              >
                <div className="h-1.5 w-1.5 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-gray-800 font-medium">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Videos"
          value={patterns.overallMetrics.totalVideos.toLocaleString()}
          icon={<Video className="h-4 w-4" />}
        />
        <MetricCard
          label="Avg Engagement"
          value={`${(patterns.overallMetrics.avgEngagement * 100).toFixed(1)}%`}
          icon={<Target className="h-4 w-4" />}
          trend={patterns.overallMetrics.engagementTrend}
        />
        <MetricCard
          label="Total Views"
          value={formatNumber(patterns.overallMetrics.totalViews)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label="Avg Views/Video"
          value={formatNumber(patterns.overallMetrics.avgViewsPerVideo)}
          icon={<Video className="h-4 w-4" />}
        />
      </div>

      {/* Detailed Patterns */}
      <Tabs defaultValue="formats" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="formats">Formats</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="tones">Tones</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
        </TabsList>

        {/* Formats Tab */}
        <TabsContent value="formats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Best Performing Formats</CardTitle>
              <p className="text-sm text-gray-500">
                Which content formats get the highest engagement
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.bestFormats.map((format, i) => (
                  <FormatCard key={i} format={format} rank={i + 1} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics Tab */}
        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Best Performing Topics</CardTitle>
              <p className="text-sm text-gray-500">
                Topics ranked by average engagement rate
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.bestTopics.slice(0, 10).map((topic, i) => (
                  <TopicCard key={i} topic={topic} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tones Tab */}
        <TabsContent value="tones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Best Performing Tones</CardTitle>
              <p className="text-sm text-gray-500">
                Which tone resonates most with your audience
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.bestTones.map((tone, i) => (
                  <ToneCard key={i} tone={tone} rank={i + 1} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hooks Tab */}
        <TabsContent value="hooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Best Hook Types</CardTitle>
              <p className="text-sm text-gray-500">
                What gets people to click and watch
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.bestHooks.map((hook, i) => (
                  <HookCard key={i} hook={hook} rank={i + 1} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timing Tab */}
        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upload Time Optimization
              </CardTitle>
              <p className="text-sm text-gray-500">
                When your videos perform best
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Best Combination */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium mb-2">
                  🎯 Optimal Upload Time
                </p>
                <p className="text-2xl font-bold text-green-900 capitalize">
                  {patterns.uploadTimeOptimization.bestCombination.day}{" "}
                  {patterns.uploadTimeOptimization.bestCombination.time}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Avg engagement:{" "}
                  {(
                    patterns.uploadTimeOptimization.bestCombination
                      .avgEngagement * 100
                  ).toFixed(1)}
                  %
                </p>
              </div>

              {/* By Day of Week */}
              <div>
                <h3 className="font-semibold mb-3">By Day of Week</h3>
                <div className="space-y-2">
                  {patterns.uploadTimeOptimization.byDayOfWeek.map((day) => (
                    <DayCard key={day.day} day={day} />
                  ))}
                </div>
              </div>

              {/* By Time of Day */}
              <div>
                <h3 className="font-semibold mb-3">By Time of Day</h3>
                <div className="space-y-2">
                  {patterns.uploadTimeOptimization.byTimeOfDay.map((time) => (
                    <TimeSlotCard key={time.timeSlot} timeSlot={time} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{label}</span>
          <span className="text-gray-400">{icon}</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <span className="text-sm">
              {trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
              {trend === "down" && (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              {trend === "stable" && <Minus className="h-4 w-4 text-gray-400" />}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FormatCard({
  format,
  rank,
}: {
  format: FormatPerformance;
  rank: number;
}) {
  return (
    <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={rank === 1 ? "default" : "secondary"}>#{rank}</Badge>
          <h4 className="font-semibold capitalize">{format.format}</h4>
        </div>
        <span className="text-sm font-medium text-green-600">
          {format.comparisonToAverage.toFixed(1)}× avg
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
        <div>
          <p className="text-gray-500">Videos</p>
          <p className="font-semibold">{format.videoCount}</p>
        </div>
        <div>
          <p className="text-gray-500">Avg Engagement</p>
          <p className="font-semibold">
            {(format.avgEngagement * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-gray-500">Avg Views</p>
          <p className="font-semibold">{formatNumber(format.avgViews)}</p>
        </div>
      </div>
      {format.topVideo && (
        <div className="mt-3 pt-3 border-t text-sm">
          <p className="text-gray-500">Top video:</p>
          <p className="font-medium truncate">{format.topVideo.title}</p>
        </div>
      )}
    </div>
  );
}

function TopicCard({ topic }: { topic: TopicPerformance }) {
  return (
    <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge>#{topic.rank}</Badge>
          <h4 className="font-semibold">{topic.topic}</h4>
        </div>
        <span className="text-sm font-medium text-purple-600">
          {(topic.avgEngagement * 100).toFixed(1)}%
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
        <div>
          <p className="text-gray-500">Videos</p>
          <p className="font-semibold">{topic.videoCount}</p>
        </div>
        <div>
          <p className="text-gray-500">Avg Views</p>
          <p className="font-semibold">{formatNumber(topic.avgViews)}</p>
        </div>
        <div>
          <p className="text-gray-500">Total Views</p>
          <p className="font-semibold">{formatNumber(topic.totalViews)}</p>
        </div>
      </div>
    </div>
  );
}

function ToneCard({ tone, rank }: { tone: TonePerformance; rank: number }) {
  return (
    <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={rank === 1 ? "default" : "secondary"}>#{rank}</Badge>
          <h4 className="font-semibold capitalize">{tone.tone}</h4>
        </div>
        <span className="text-sm font-medium text-green-600">
          {tone.comparisonToAverage.toFixed(1)}× avg
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
        <div>
          <p className="text-gray-500">Videos</p>
          <p className="font-semibold">{tone.videoCount}</p>
        </div>
        <div>
          <p className="text-gray-500">Avg Engagement</p>
          <p className="font-semibold">
            {(tone.avgEngagement * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function HookCard({ hook, rank }: { hook: HookPerformance; rank: number }) {
  return (
    <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={rank === 1 ? "default" : "secondary"}>#{rank}</Badge>
          <h4 className="font-semibold capitalize">
            {hook.hookType.replace("-", " ")}
          </h4>
        </div>
        <span className="text-sm font-medium text-green-600">
          {hook.comparisonToAverage.toFixed(1)}× avg
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
        <div>
          <p className="text-gray-500">Videos</p>
          <p className="font-semibold">{hook.videoCount}</p>
        </div>
        <div>
          <p className="text-gray-500">Avg Engagement</p>
          <p className="font-semibold">
            {(hook.avgEngagement * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function DayCard({ day }: { day: DayPerformance }) {
  const maxEngagement = 0.15; // Assume max 15% for visualization
  const widthPercent = (day.avgEngagement / maxEngagement) * 100;

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium capitalize">{day.day}</span>
        <span className="text-sm text-gray-500">
          {(day.avgEngagement * 100).toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-purple-600 h-2 rounded-full transition-all"
          style={{ width: `${Math.min(widthPercent, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{day.videoCount} videos</span>
        <span>{formatNumber(day.avgViews)} avg views</span>
      </div>
    </div>
  );
}

function TimeSlotCard({ timeSlot }: { timeSlot: TimeOfDayPerformance }) {
  const maxEngagement = 0.15;
  const widthPercent = (timeSlot.avgEngagement / maxEngagement) * 100;

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-medium capitalize">{timeSlot.timeSlot}</span>
          <p className="text-xs text-gray-500">{timeSlot.timeRange}</p>
        </div>
        <span className="text-sm text-gray-500">
          {(timeSlot.avgEngagement * 100).toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${Math.min(widthPercent, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{timeSlot.videoCount} videos</span>
        <span>{formatNumber(timeSlot.avgViews)} avg views</span>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}