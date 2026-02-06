import { IVideo } from "@/models/Video";

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
  avgLikes: number;
  totalViews: number;
  topVideo: {
    title: string;
    videoId: string;
    engagement: number;
    views: number;
  } | null;
  comparisonToAverage: number; // multiplier (e.g., 2.1x)
}

interface TopicPerformance {
  topic: string;
  videoCount: number;
  avgEngagement: number;
  avgViews: number;
  totalViews: number;
  topVideo: {
    title: string;
    videoId: string;
    engagement: number;
  } | null;
  rank: number;
}

interface TonePerformance {
  tone: string;
  videoCount: number;
  avgEngagement: number;
  avgViews: number;
  comparisonToAverage: number;
  topVideo: {
    title: string;
    videoId: string;
    engagement: number;
  } | null;
}

interface HookPerformance {
  hookType: string;
  videoCount: number;
  avgEngagement: number;
  avgClickThroughRate: number; // estimated based on views/impressions
  comparisonToAverage: number;
  topVideo: {
    title: string;
    videoId: string;
    engagement: number;
  } | null;
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
  timeSlot: string; // "morning", "afternoon", "evening", "night"
  timeRange: string; // "6:00 AM - 12:00 PM"
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

export async function analyzePerformancePatterns(
  videos: IVideo[]
): Promise<PerformancePattern> {
  // Calculate overall metrics first
  const overallMetrics = calculateOverallMetrics(videos);

  // Analyze formats
  const bestFormats = analyzeFormats(videos, overallMetrics.avgEngagement);

  // Analyze topics
  const bestTopics = analyzeTopics(videos);

  // Analyze tones
  const bestTones = analyzeTones(videos, overallMetrics.avgEngagement);

  // Analyze hooks
  const bestHooks = analyzeHooks(videos, overallMetrics.avgEngagement);

  // Analyze upload times
  const uploadTimeOptimization = analyzeUploadTimes(videos);

  // Generate insights
  const insights = generateInsights({
    bestFormats,
    bestTopics,
    bestTones,
    bestHooks,
    uploadTimeOptimization,
    overallMetrics,
  });

  return {
    bestFormats,
    bestTopics,
    bestTones,
    bestHooks,
    uploadTimeOptimization,
    overallMetrics,
    insights,
  };
}

function calculateOverallMetrics(videos: IVideo[]): OverallMetrics {
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0);
  const avgEngagement =
    videos.reduce((sum, v) => sum + v.engagementRate, 0) / videos.length;

  // Calculate engagement trend (compare last 25% vs first 25%)
  const quarterLength = Math.floor(videos.length / 4);
  const recentVideos = videos.slice(0, quarterLength);
  const oldVideos = videos.slice(-quarterLength);

  const recentAvgEngagement =
    recentVideos.reduce((sum, v) => sum + v.engagementRate, 0) /
    recentVideos.length;
  const oldAvgEngagement =
    oldVideos.reduce((sum, v) => sum + v.engagementRate, 0) / oldVideos.length;

  let engagementTrend: "up" | "down" | "stable";
  const trendDiff = recentAvgEngagement - oldAvgEngagement;
  if (trendDiff > avgEngagement * 0.1) {
    engagementTrend = "up";
  } else if (trendDiff < -avgEngagement * 0.1) {
    engagementTrend = "down";
  } else {
    engagementTrend = "stable";
  }

  return {
    totalVideos: videos.length,
    avgEngagement,
    totalViews,
    totalLikes,
    avgViewsPerVideo: totalViews / videos.length,
    engagementTrend,
  };
}

function analyzeFormats(
  videos: IVideo[],
  overallAvgEngagement: number
): FormatPerformance[] {
  const formatMap = new Map<string, IVideo[]>();

  // Group videos by format
  videos.forEach((video) => {
    const format = video.analysis.format || "general";
    if (!formatMap.has(format)) {
      formatMap.set(format, []);
    }
    formatMap.get(format)!.push(video);
  });

  // Calculate stats for each format
  const formatStats: FormatPerformance[] = [];

  formatMap.forEach((formatVideos, format) => {
    const avgEngagement =
      formatVideos.reduce((sum, v) => sum + v.engagementRate, 0) /
      formatVideos.length;
    const avgViews =
      formatVideos.reduce((sum, v) => sum + v.views, 0) / formatVideos.length;
    const avgLikes =
      formatVideos.reduce((sum, v) => sum + v.likes, 0) / formatVideos.length;
    const totalViews = formatVideos.reduce((sum, v) => sum + v.views, 0);

    // Find top video in this format
    const topVideo = formatVideos.reduce((best, current) =>
      current.engagementRate > best.engagementRate ? current : best
    );

    formatStats.push({
      format,
      videoCount: formatVideos.length,
      avgEngagement,
      avgViews,
      avgLikes,
      totalViews,
      topVideo: {
        title: topVideo.title,
        videoId: topVideo.videoId,
        engagement: topVideo.engagementRate,
        views: topVideo.views,
      },
      comparisonToAverage: avgEngagement / overallAvgEngagement,
    });
  });

  // Sort by average engagement
  return formatStats.sort((a, b) => b.avgEngagement - a.avgEngagement);
}

function analyzeTopics(videos: IVideo[]): TopicPerformance[] {
  const topicMap = new Map<string, IVideo[]>();

  // Group videos by topic
  videos.forEach((video) => {
    const topic = video.analysis.topic || "general";
    if (!topicMap.has(topic)) {
      topicMap.set(topic, []);
    }
    topicMap.get(topic)!.push(video);
  });

  // Calculate stats for each topic
  const topicStats: TopicPerformance[] = [];

  topicMap.forEach((topicVideos, topic) => {
    const avgEngagement =
      topicVideos.reduce((sum, v) => sum + v.engagementRate, 0) /
      topicVideos.length;
    const avgViews =
      topicVideos.reduce((sum, v) => sum + v.views, 0) / topicVideos.length;
    const totalViews = topicVideos.reduce((sum, v) => sum + v.views, 0);

    // Find top video in this topic
    const topVideo = topicVideos.reduce((best, current) =>
      current.engagementRate > best.engagementRate ? current : best
    );

    topicStats.push({
      topic,
      videoCount: topicVideos.length,
      avgEngagement,
      avgViews,
      totalViews,
      topVideo: {
        title: topVideo.title,
        videoId: topVideo.videoId,
        engagement: topVideo.engagementRate,
      },
      rank: 0, // Will be set after sorting
    });
  });

  // Sort by average engagement and assign ranks
  topicStats.sort((a, b) => b.avgEngagement - a.avgEngagement);
  topicStats.forEach((stat, index) => {
    stat.rank = index + 1;
  });

  return topicStats;
}

function analyzeTones(
  videos: IVideo[],
  overallAvgEngagement: number
): TonePerformance[] {
  const toneMap = new Map<string, IVideo[]>();

  // Group videos by tone
  videos.forEach((video) => {
    const tone = video.analysis.tone || "general";
    if (!toneMap.has(tone)) {
      toneMap.set(tone, []);
    }
    toneMap.get(tone)!.push(video);
  });

  // Calculate stats for each tone
  const toneStats: TonePerformance[] = [];

  toneMap.forEach((toneVideos, tone) => {
    const avgEngagement =
      toneVideos.reduce((sum, v) => sum + v.engagementRate, 0) /
      toneVideos.length;
    const avgViews =
      toneVideos.reduce((sum, v) => sum + v.views, 0) / toneVideos.length;

    // Find top video with this tone
    const topVideo = toneVideos.reduce((best, current) =>
      current.engagementRate > best.engagementRate ? current : best
    );

    toneStats.push({
      tone,
      videoCount: toneVideos.length,
      avgEngagement,
      avgViews,
      comparisonToAverage: avgEngagement / overallAvgEngagement,
      topVideo: {
        title: topVideo.title,
        videoId: topVideo.videoId,
        engagement: topVideo.engagementRate,
      },
    });
  });

  // Sort by average engagement
  return toneStats.sort((a, b) => b.avgEngagement - a.avgEngagement);
}

function analyzeHooks(
  videos: IVideo[],
  overallAvgEngagement: number
): HookPerformance[] {
  const hookMap = new Map<string, IVideo[]>();

  // Group videos by hook type
  videos.forEach((video) => {
    const hookType = video.analysis.hookType || "direct";
    if (!hookMap.has(hookType)) {
      hookMap.set(hookType, []);
    }
    hookMap.get(hookType)!.push(video);
  });

  // Calculate stats for each hook type
  const hookStats: HookPerformance[] = [];

  hookMap.forEach((hookVideos, hookType) => {
    const avgEngagement =
      hookVideos.reduce((sum, v) => sum + v.engagementRate, 0) /
      hookVideos.length;

    // Estimate CTR based on views (higher views suggest better hook)
    const avgClickThroughRate =
      hookVideos.reduce((sum, v) => sum + v.views, 0) / hookVideos.length;

    // Find top video with this hook
    const topVideo = hookVideos.reduce((best, current) =>
      current.engagementRate > best.engagementRate ? current : best
    );

    hookStats.push({
      hookType,
      videoCount: hookVideos.length,
      avgEngagement,
      avgClickThroughRate,
      comparisonToAverage: avgEngagement / overallAvgEngagement,
      topVideo: {
        title: topVideo.title,
        videoId: topVideo.videoId,
        engagement: topVideo.engagementRate,
      },
    });
  });

  // Sort by average engagement
  return hookStats.sort((a, b) => b.avgEngagement - a.avgEngagement);
}

function analyzeUploadTimes(videos: IVideo[]): UploadTimeAnalysis {
  const dayMap = new Map<string, IVideo[]>();
  const timeSlotMap = new Map<string, IVideo[]>();

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  // Group videos by day and time
  videos.forEach((video) => {
    const date = new Date(video.publishedAt);
    const dayOfWeek = days[date.getDay()];
    const hour = date.getHours();

    // Group by day
    if (!dayMap.has(dayOfWeek)) {
      dayMap.set(dayOfWeek, []);
    }
    dayMap.get(dayOfWeek)!.push(video);

    // Group by time slot
    let timeSlot: string;
    let timeRange: string;
    if (hour >= 6 && hour < 12) {
      timeSlot = "morning";
      timeRange = "6:00 AM - 12:00 PM";
    } else if (hour >= 12 && hour < 18) {
      timeSlot = "afternoon";
      timeRange = "12:00 PM - 6:00 PM";
    } else if (hour >= 18 && hour < 22) {
      timeSlot = "evening";
      timeRange = "6:00 PM - 10:00 PM";
    } else {
      timeSlot = "night";
      timeRange = "10:00 PM - 6:00 AM";
    }

    if (!timeSlotMap.has(timeSlot)) {
      timeSlotMap.set(timeSlot, []);
    }
    timeSlotMap.get(timeSlot)!.push(video);
  });

  // Analyze by day of week
  const byDayOfWeek: DayPerformance[] = days.map((day) => {
    const dayVideos = dayMap.get(day) || [];
    if (dayVideos.length === 0) {
      return {
        day,
        videoCount: 0,
        avgEngagement: 0,
        avgViews: 0,
        totalViews: 0,
      };
    }

    const avgEngagement =
      dayVideos.reduce((sum, v) => sum + v.engagementRate, 0) /
      dayVideos.length;
    const avgViews =
      dayVideos.reduce((sum, v) => sum + v.views, 0) / dayVideos.length;
    const totalViews = dayVideos.reduce((sum, v) => sum + v.views, 0);

    return {
      day,
      videoCount: dayVideos.length,
      avgEngagement,
      avgViews,
      totalViews,
    };
  });

  // Analyze by time of day
  const byTimeOfDay: TimeOfDayPerformance[] = [
    { timeSlot: "morning", timeRange: "6:00 AM - 12:00 PM" },
    { timeSlot: "afternoon", timeRange: "12:00 PM - 6:00 PM" },
    { timeSlot: "evening", timeRange: "6:00 PM - 10:00 PM" },
    { timeSlot: "night", timeRange: "10:00 PM - 6:00 AM" },
  ].map(({ timeSlot, timeRange }) => {
    const slotVideos = timeSlotMap.get(timeSlot) || [];
    if (slotVideos.length === 0) {
      return {
        timeSlot,
        timeRange,
        videoCount: 0,
        avgEngagement: 0,
        avgViews: 0,
      };
    }

    const avgEngagement =
      slotVideos.reduce((sum, v) => sum + v.engagementRate, 0) /
      slotVideos.length;
    const avgViews =
      slotVideos.reduce((sum, v) => sum + v.views, 0) / slotVideos.length;

    return {
      timeSlot,
      timeRange,
      videoCount: slotVideos.length,
      avgEngagement,
      avgViews,
    };
  });

  // Find best day
  const bestDay =
    byDayOfWeek.reduce((best, current) =>
      current.avgEngagement > best.avgEngagement ? current : best
    ).day;

  // Find best time
  const bestTimeSlot = byTimeOfDay.reduce((best, current) =>
    current.avgEngagement > best.avgEngagement ? current : best
  );
  const bestTime = bestTimeSlot.timeRange;

  return {
    byDayOfWeek: byDayOfWeek.filter((d) => d.videoCount > 0),
    byTimeOfDay: byTimeOfDay.filter((t) => t.videoCount > 0),
    bestDay,
    bestTime,
    bestCombination: {
      day: bestDay,
      time: bestTime,
      avgEngagement: bestTimeSlot.avgEngagement,
    },
  };
}

function generateInsights(data: {
  bestFormats: FormatPerformance[];
  bestTopics: TopicPerformance[];
  bestTones: TonePerformance[];
  bestHooks: HookPerformance[];
  uploadTimeOptimization: UploadTimeAnalysis;
  overallMetrics: OverallMetrics;
}): string[] {
  const insights: string[] = [];

  // Format insights
  if (data.bestFormats.length > 0 && data.bestFormats[0].videoCount >= 2) {
    const best = data.bestFormats[0];
    const multiplier = best.comparisonToAverage.toFixed(1);
    insights.push(
      `Your ${best.format} videos get ${multiplier}× your average engagement`
    );
  }

  // Topic insights
  if (data.bestTopics.length > 0 && data.bestTopics[0].videoCount >= 2) {
    const best = data.bestTopics[0];
    insights.push(
      `Videos about "${best.topic}" consistently perform well with ${best.videoCount} videos averaging ${(best.avgEngagement * 100).toFixed(1)}% engagement`
    );
  }

  // Tone insights
  if (data.bestTones.length > 0 && data.bestTones[0].videoCount >= 2) {
    const best = data.bestTones[0];
    const worst = data.bestTones[data.bestTones.length - 1];
    if (data.bestTones.length > 1 && worst.videoCount >= 2) {
      const improvement = (
        ((best.avgEngagement - worst.avgEngagement) / worst.avgEngagement) *
        100
      ).toFixed(0);
      insights.push(
        `${best.tone} tone outperforms ${worst.tone} by ${improvement}%`
      );
    }
  }

  // Upload time insights
  const { bestDay, bestTime } = data.uploadTimeOptimization;
  insights.push(
    `${bestDay.charAt(0).toUpperCase() + bestDay.slice(1)} ${bestTime} is your best upload time`
  );

  // Engagement trend insight
  if (data.overallMetrics.engagementTrend === "up") {
    insights.push("Your channel engagement is trending upward 📈");
  } else if (data.overallMetrics.engagementTrend === "down") {
    insights.push("Your engagement has been declining - time to try new formats");
  }

  // Hook insights
  if (data.bestHooks.length > 0 && data.bestHooks[0].videoCount >= 2) {
    const best = data.bestHooks[0];
    insights.push(
      `${best.hookType} hooks are most effective for your audience`
    );
  }

  return insights;
}