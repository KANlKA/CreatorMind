"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ThumbsUp, Eye, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;
  const [data, setData] = useState<any>(null);
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

  if (!data || data.error) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Video Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-6">
              {video.thumbnailUrl && (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-64 h-36 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                <p className="text-gray-600 mb-4 line-clamp-2">{video.description}</p>
                <div className="flex gap-4 text-sm text-gray-600">
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comment Analysis Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Sentiment Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(analysis.sentiment).map(([sentiment, count]) => (
                  <div key={sentiment} className="flex items-center justify-between">
                    <span className="capitalize">{sentiment}</span>
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
                      <span className="text-sm font-semibold w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Intent Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Comment Intents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.intents.slice(0, 5).map(([intent, count]: [string, number]) => (
                  <div key={intent} className="flex items-center justify-between">
                    <span className="capitalize">{intent}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Top Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.topTopics.map(([topic, count]: [string, number]) => (
                  <Badge key={topic} variant="secondary">
                    {topic} ({count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments List */}
        <Card>
          <CardHeader>
            <CardTitle>All Comments ({analysis.totalComments})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div
                  key={comment.commentId}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{comment.authorName}</p>
                      <p className="text-sm text-gray-500">
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
                  <p className="text-gray-700 mb-2">{comment.text}</p>
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
