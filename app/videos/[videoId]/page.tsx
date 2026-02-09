"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ThumbsUp, Eye, MessageSquare, TrendingUp, Brain, Tag, BarChart3, Mic, Sparkles, Users, Target, Calendar, Clock, Lightbulb,Youtube } from "lucide-react";

interface VideoAnalysis {
  topic: string;
  subtopics: string[];
  tone: string;
  hookType: string;
  audienceIntent: string;
  complexity: string;
  format: string;
  structure?: string;
  visualStyle?: string;
}

interface VideoData {
  video: {
    videoId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    publishedAt: string;
    duration?: string;
    views: number;
    likes: number;
    commentCount: number;
    engagementRate: number;
    analysis?: VideoAnalysis;
    analyzedAt?: string;
  };
  comments: any[];
  analysis: {
    totalComments: number;
    sentiment: Record<string, number>;
    intents: [string, number][];
    topTopics: [string, number][];
  };
  error?: string;
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;
  const [data, setData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/videos/${videoId}/comments`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching video data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-red-600">Video not found</p>
        </div>
      </div>
    );
  }

  const { video, comments, analysis } = data;

  const sentimentColors = {
    positive: "bg-green-100 text-green-800 border-green-300",
    neutral: "bg-gray-100 text-gray-800 border-gray-300",
    negative: "bg-red-100 text-red-800 border-red-300",
  };

  const intentColors: Record<string, string> = {
    question: "bg-blue-100 text-blue-800 border-blue-300",
    praise: "bg-green-100 text-green-800 border-green-300",
    request: "bg-purple-100 text-purple-800 border-purple-300",
    criticism: "bg-red-100 text-red-800 border-red-300",
    confusion: "bg-yellow-100 text-yellow-800 border-yellow-300",
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar space */}
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {/* Video Header */}
        <Card className="mb-6 border-zinc-900">
          <CardContent className="pt-6 bg-zinc-900 border-zinc-900">
            <div className="flex gap-6">
              {video.thumbnailUrl && (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-64 h-36 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2 text-white">{video.title}</h1>
                <p className="text-zinc-400 mb-4 line-clamp-2">{video.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {video.views.toLocaleString()} views
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {video.likes.toLocaleString()} likes
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {video.commentCount} comments
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {(video.engagementRate * 100).toFixed(2)}% engagement
                  </div>
                  {video.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(video.duration)}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Video Intelligence */}
        {video.analysis && (
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              AI-Powered Video Intelligence
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 bg-zinc-900 p-4 rounded-lg border border-zinc-700">
              {/* Topic & Subtopics */}
              <IntelligenceCard
                title="Topic & Subtopics"
                primary={video.analysis.topic}
                items={video.analysis.subtopics}
                color="blue"
                containerClassName="bg-zinc-900 border border-zinc-700"
              />

              {/* Content Format */}
              <IntelligenceCard
                title="Content Format"
                primary={video.analysis.format}
                description={video.analysis.structure ? `Structured as: ${video.analysis.structure}` : undefined}
                color="purple"
              />

              {/* Tone */}
              <IntelligenceCard
                title="Tone"
                primary={video.analysis.tone}
                description="The emotional approach of the content"
                color="green"
              />

              {/* Hook Type */}
              <IntelligenceCard
                title="Hook Type"
                primary={video.analysis.hookType.replace("-", " ")}
                description="What grabs viewer attention"
                color="yellow"
              />

              {/* Audience Intent */}
              <IntelligenceCard
                title="Audience Intent"
                primary={video.analysis.audienceIntent}
                description="Why viewers watch this content"
                color="pink"
              />

              {/* Complexity Level */}
              <IntelligenceCard
                title="Complexity Level"
                primary={video.analysis.complexity}
                description="Content difficulty level"
                color="orange"
              />
            </div>

            {/* Watch on YouTube */}
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors mt-6"
            >
              <Youtube className="h-5 w-5" />
              Watch on YouTube
            </a>
          </div>
        )}

        {/* Comment Analysis Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Sentiment Distribution */}
          <Card className="mb-6 bg-zinc-900 border-zinc-900">
            <CardHeader>
              <CardTitle className="text-white">Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(analysis.sentiment).map(([sentiment, count]) => (
                  <div key={sentiment} className="flex items-center justify-between">
                    <span className="capitalize text-zinc-300">{sentiment}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            sentiment === "positive"
                              ? "bg-green-500"
                              : sentiment === "negative"
                              ? "bg-red-500"
                              : "bg-gray-400"
                          }`}
                          style={{
                            width: `${(count / analysis.totalComments) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold w-8 text-zinc-300">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Intent Distribution */}
          <Card className="mb-6 bg-zinc-900 border-zinc-900">
            <CardHeader>
              <CardTitle className="text-white">Comment Intents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.intents.slice(0, 5).map(([intent, count]: [string, number]) => (
                  <div key={intent} className="flex items-center justify-between">
                    <span className="capitalize text-zinc-300">{intent}</span>
                    <Badge variant="outline" className="text-zinc-300">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Topics */}
          <Card className="mb-6 bg-zinc-900 border-zinc-900">
            <CardHeader>
              <CardTitle className="text-white">Top Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.topTopics.map(([topic, count]: [string, number]) => (
                  <Badge key={topic} variant="secondary" className="text-zinc-300">
                    {topic} ({count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments List */}
        <Card className="mb-6 bg-zinc-900 border-zinc-900">
          <CardHeader>
            <CardTitle className="text-white">All Comments ({analysis.totalComments})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div
                  key={comment.commentId}
                  className="border-2 border-zinc-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white">{comment.authorName}</p>
                      <p className="text-sm text-zinc-400">
                        {new Date(comment.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        className={
                          sentimentColors[comment.sentiment as keyof typeof sentimentColors]
                        }
                      >
                        {comment.sentiment}
                      </Badge>
                      <Badge
                        className={intentColors[comment.intent] || "bg-gray-100"}
                      >
                        {comment.intent}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-zinc-300 mb-2">{comment.text}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {comment.topics.map((topic: string) => (
                        <Badge key={topic} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <ThumbsUp className="h-3 w-3" />
                      {comment.likes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function IntelligenceCard({
  icon,
  title,
  primary,
  items,
  description,
  color,
  containerClassName,
}: {
  icon?: React.ReactNode;
  title: string;
  primary: string;
  items?: string[];
  description?: string;
  color: string;
  containerClassName?: string;
}) {
  const colorClasses = {
    blue: "bg-zinc-800 text-zinc-200 border-zinc-500",
    purple: "bg-zinc-800 text-zinc-200 border-zinc-500",
    green: "bg-zinc-800 text-zinc-200 border-zinc-500",
    yellow: "bg-zinc-800 text-zinc-200 border-zinc-500",
    pink: "bg-zinc-800 text-zinc-200 border-zinc-500",
    orange: "bg-zinc-800 text-zinc-200 border-zinc-500",
  };

  return (
    <div className="bg-deepBlack rounded-lg p-4 border-zinc-700">
      <div className="flex items-center gap-2 mb-3 ">
        {icon}
        <h4 className="font-semibold text-sm text-zinc-300">{title}</h4>
      </div>

      <div className="mb-2">
        <Badge className={`${colorClasses[color as keyof typeof colorClasses]} capitalize text-sm`}>
          {primary}
        </Badge>
      </div>

      {items && items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {items.map((item, i) => (
            <span
              key={i}
              className="text-xs bg-zinc-400 text-black px-2 py-1 rounded-full"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {description && (
        <p className="text-xs text-zinc-300 mt-2">{description}</p>
      )}
    </div>
  );
}

function formatDuration(duration: string): string {
  // Parse ISO 8601 duration (PT12M34S)
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  if (!match) return "0:00";

  const hours = (match[1] || "").replace("H", "");
  const minutes = (match[2] || "").replace("M", "");
  const seconds = (match[3] || "").replace("S", "");

  if (hours) {
    return `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
  }

  return `${minutes || "0"}:${seconds.padStart(2, "0")}`;
}
