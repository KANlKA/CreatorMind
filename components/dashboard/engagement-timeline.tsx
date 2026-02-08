"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { TrendingUp, ArrowLeft, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlyData {
  month: string;
  engagement: number;
  videos: number;
  totalViews: number;
  bestVideo: {
    title: string;
    engagement: number;
    videoId: string;
  } | null;
}

interface DailyData {
  date: string;
  engagement: number;
  videosCount: number;
  videos: Array<{
    title: string;
    videoId: string;
    engagement: number;
  }>;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

const chartConfig = {
  engagement: {
    label: "Avg Engagement",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function EngagementTimeline() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [dailyData, setDailyData] = useState<Record<string, DailyData[]>>({});
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"30" | "90" | "all">("90");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/engagement-timeline?range=${range}`);
      const data = await res.json();

      if (data.success) {
        setMonthlyData(data.monthlyData);
        setDailyData(data.dailyData);
      }
    } catch (error) {
      console.error("Error fetching engagement timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthClick = (month: string) => {
    setSelectedMonth(month);
  };

  const handleBackToMonthly = () => {
    setSelectedMonth(null);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Engagement Timeline
          </CardTitle>
          <CardDescription>No data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Start creating videos to see your engagement trends!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get current view data
  const currentData = selectedMonth
    ? (dailyData[selectedMonth] || [])
    : monthlyData;

  const currentChartData: Array<{ engagement: number; label: string }> = selectedMonth
    ? (currentData as DailyData[]).map((d) => ({
        engagement: d.engagement,
        label: formatDay(d.date),
      }))
    : (currentData as MonthlyData[]).map((d) => ({
        engagement: d.engagement,
        label: formatMonth(d.month),
      }));

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedMonth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMonthly}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                {selectedMonth
                  ? `Daily Engagement - ${formatMonth(selectedMonth)}`
                  : "Engagement Timeline"}
              </CardTitle>
              <CardDescription>
                {selectedMonth
                  ? "Click on a day to see video details"
                  : "Average engagement rate over time (click to drill down)"}
              </CardDescription>
            </div>
          </div>

          {!selectedMonth && (
            <div className="flex gap-2">
              <Button
                variant={range === "30" ? "default" : "outline"}
                size="sm"
                onClick={() => setRange("30")}
                className={
                  range === "30"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : ""
                }
              >
                30 Days
              </Button>
              <Button
                variant={range === "90" ? "default" : "outline"}
                size="sm"
                onClick={() => setRange("90")}
                className={
                  range === "90"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : ""
                }
              >
                90 Days
              </Button>
              <Button
                variant={range === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setRange("all")}
                className={
                  range === "all"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : ""
                }
              >
                All Time
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart
            data={currentChartData}
            onClick={(e: any) => {
              if (!selectedMonth && e && e.activeLabel) {
                const clickedData = monthlyData.find(
                  (d) => formatMonth(d.month) === e.activeLabel
                );
                if (clickedData) {
                  handleMonthClick(clickedData.month);
                }
              }
            }}
            style={{ cursor: selectedMonth ? "default" : "pointer" }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{
                value: "Engagement (%)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12 },
              }}
            />
            <ChartTooltip
              content={
                <CustomTooltip
                  monthlyData={monthlyData}
                  dailyData={dailyData}
                  selectedMonth={selectedMonth}
                />
              }
              cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
            />
            <Bar
              dataKey="engagement"
              fill="var(--color-engagement)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Custom Tooltip Component
function CustomTooltip({
  active,
  payload,
  monthlyData,
  dailyData,
  selectedMonth,
}: any) {
  if (!active || !payload || !payload[0]) {
    return null;
  }

  const data = payload[0].payload;

  if (selectedMonth) {
    // Daily view tooltip
    const dayData = dailyData[selectedMonth]?.find(
      (d: DailyData) => d.date === data.date
    );

    if (!dayData) return null;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-purple-600" />
          <p className="font-semibold">{formatDate(data.date)}</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Avg Engagement:</span>
            <span className="font-semibold text-purple-600">
              {dayData.engagement.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Videos Posted:</span>
            <span className="font-medium">{dayData.videosCount}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Total Views:</span>
            <span className="font-medium">
              {dayData.totalViews.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Engagement:</span>
            <span className="font-medium">
              {dayData.totalLikes + dayData.totalComments} (👍 {dayData.totalLikes}{" "}
              💬 {dayData.totalComments})
            </span>
          </div>
          {dayData.videos.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Videos:</p>
              {dayData.videos.map((video: any, i: number) => (
                <p key={i} className="text-xs truncate">
                  • {video.title} ({video.engagement.toFixed(1)}%)
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } else {
    // Monthly view tooltip
    const monthData = monthlyData.find((d: MonthlyData) => d.month === data.month);

    if (!monthData) return null;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-purple-600" />
          <p className="font-semibold">{formatMonth(data.month)}</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Avg Engagement:</span>
            <span className="font-semibold text-purple-600">
              {monthData.engagement.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Videos Posted:</span>
            <span className="font-medium">{monthData.videos}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Total Views:</span>
            <span className="font-medium">
              {monthData.totalViews.toLocaleString()}
            </span>
          </div>
          {monthData.bestVideo && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">
                Best Performing:
              </p>
              <p className="text-xs font-medium">
                {monthData.bestVideo.title}
              </p>
              <p className="text-xs text-purple-600">
                {monthData.bestVideo.engagement.toFixed(2)}% engagement
              </p>
            </div>
          )}
          <p className="text-xs text-muted-foreground italic pt-1">
            Click to see daily breakdown
          </p>
        </div>
      </div>
    );
  }
}

function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}