"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
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
    color: "#ffffff",
  },
} satisfies ChartConfig;

export function EngagementTimeline() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [dailyData, setDailyData] = useState<Record<string, DailyData[]>>({});
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"30" | "90" | "all">("all");
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
    } finally {
      setLoading(false);
    }
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

  const currentData = selectedMonth
    ? dailyData[selectedMonth] || []
    : monthlyData;

  const currentChartData = selectedMonth
    ? (currentData as DailyData[]).map((d) => ({
        engagement: d.engagement,
        label: formatDay(d.date),
        date: d.date,
      }))
    : (currentData as MonthlyData[]).map((d) => ({
        engagement: d.engagement,
        label: formatMonth(d.month),
        month: d.month,
      }));

  if (loading) {
    return (
      <Card className="bg-black border border-white/20">
        <CardContent className="p-6">
          <Skeleton className="h-[300px] w-full bg-white/10" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-black border border-white/20 text-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {selectedMonth && (
              <Button
                size="sm"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => setSelectedMonth(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5" />
                {selectedMonth
                  ? `Daily Engagement`
                  : "Engagement Timeline"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedMonth
                  ? "Daily engagement breakdown"
                  : "Click a bar to drill into daily data"}
              </CardDescription>
            </div>
          </div>

          {!selectedMonth && (
            <div className="flex gap-2">
              {["30", "90", "all"].map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant="outline"
                  onClick={() => setRange(r as any)}
                  className={`border border-white/30 text-white hover:bg-white/10 ${
                    range === r ? "bg-white text-black" : ""
                  }`}
                >
                  {r === "all" ? "All Time" : `${r} Days`}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart
            data={currentChartData}
            onClick={(e: any) => {
              if (!selectedMonth && e?.activeLabel) {
                const m = monthlyData.find(
                  (d) => formatMonth(d.month) === e.activeLabel
                );
                if (m) setSelectedMonth(m.month);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis tick={{ fill: "#aaa", fontSize: 12 }} dataKey="label" />
            <YAxis tick={{ fill: "#aaa", fontSize: 12 }} />
            <ChartTooltip
              content={
                <TooltipContent
                  monthlyData={monthlyData}
                  dailyData={dailyData}
                  selectedMonth={selectedMonth}
                />
              }
            />
            <Bar dataKey="engagement" fill="#ffffff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function TooltipContent({ active, payload, selectedMonth, dailyData, monthlyData }: any) {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-black border border-white/20 rounded-lg p-3 text-white shadow-xl">
      <p className="text-sm text-gray-400 mb-1">
        {data.label}
      </p>
      <p className="text-lg font-semibold">
        {data.engagement.toFixed(2)}%
      </p>
    </div>
  );
}
