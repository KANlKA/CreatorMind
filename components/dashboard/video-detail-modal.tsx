"use client";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  Target,
  Sparkles,
  Users,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Eye,
  Calendar,
  Clock,
  Tag,
  Lightbulb,
  Mic,
  BarChart3,
} from "lucide-react";

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

interface VideoDetail {
  _id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  views: number;
  likes: number;
  commentCount: number;
  engagementRate: number;
  analysis: VideoAnalysis;
  transcript?: string;
  analyzedAt?: string;
}

interface VideoDetailModalProps {
  videoId: string | null;
  open: boolean;
  onClose: () => void;
}

export function VideoDetailModal({ videoId, open, onClose }: VideoDetailModalProps) {
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && videoId) {
      fetchVideoDetail(videoId);
    }
  }, [open, videoId]);

  const fetchVideoDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/videos/${id}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch video details");
      }
      
      const data = await res.json();
      setVideo(data.video);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        {loading && <LoadingSkeleton />}
        
        {error && (
          <div className="p-6 text-center">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}
        
        {!loading && !error && video && (
          <>
            <DialogHeader>
                <VisuallyHidden>
                <DialogTitle>
                    {video?.title || "Video details"}
                </DialogTitle>
                </VisuallyHidden>
            </DialogHeader>

            <div className="space-y-6">
              {/* Video Preview */}
              <div className="relative">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-lg font-semibold">
                  {(video.engagementRate * 100).toFixed(1)}% Engagement
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <StatCard
                  icon={<Eye className="h-5 w-5 text-blue-600" />}
                  label="Views"
                  value={video.views.toLocaleString()}
                />
                <StatCard
                  icon={<ThumbsUp className="h-5 w-5 text-green-600" />}
                  label="Likes"
                  value={video.likes.toLocaleString()}
                />
                <StatCard
                  icon={<MessageSquare className="h-5 w-5 text-purple-600" />}
                  label="Comments"
                  value={video.commentCount.toLocaleString()}
                />
                <StatCard
                  icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
                  label="Engagement"
                  value={`${(video.engagementRate * 100).toFixed(1)}%`}
                />
              </div>

              {/* AI-Powered Intelligence Section */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  AI-Powered Video Intelligence
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Topic & Subtopics */}
                  <IntelligenceCard
                    icon={<Tag className="h-5 w-5 text-blue-600" />}
                    title="Topic & Subtopics"
                    primary={video.analysis.topic}
                    items={video.analysis.subtopics}
                    color="blue"
                  />

                  {/* Content Format */}
                  <IntelligenceCard
                    icon={<BarChart3 className="h-5 w-5 text-purple-600" />}
                    title="Content Format"
                    primary={video.analysis.format}
                    description={`Structured as: ${video.analysis.structure || 'N/A'}`}
                    color="purple"
                  />

                  {/* Tone */}
                  <IntelligenceCard
                    icon={<Mic className="h-5 w-5 text-green-600" />}
                    title="Tone"
                    primary={video.analysis.tone}
                    description="The emotional approach of the content"
                    color="green"
                  />

                  {/* Hook Type */}
                  <IntelligenceCard
                    icon={<Sparkles className="h-5 w-5 text-yellow-600" />}
                    title="Hook Type"
                    primary={video.analysis.hookType.replace("-", " ")}
                    description="What grabs viewer attention"
                    color="yellow"
                  />

                  {/* Audience Intent */}
                  <IntelligenceCard
                    icon={<Users className="h-5 w-5 text-pink-600" />}
                    title="Audience Intent"
                    primary={video.analysis.audienceIntent}
                    description="Why viewers watch this content"
                    color="pink"
                  />

                  {/* Complexity Level */}
                  <IntelligenceCard
                    icon={<Target className="h-5 w-5 text-orange-600" />}
                    title="Complexity Level"
                    primary={video.analysis.complexity}
                    description="Content difficulty level"
                    color="orange"
                  />
                </div>
              </div>

              {/* Description */}
              {video.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">
                      {video.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Published: {new Date(video.publishedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duration: {formatDuration(video.duration)}
                </div>
                {video.analyzedAt && (
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Analyzed: {new Date(video.analyzedAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Watch on YouTube Button */}
              <a
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded-lg font-semibold transition-colors"
              >
                Watch on YouTube →
              </a>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center gap-2">
          {icon}
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function IntelligenceCard({
  icon,
  title,
  primary,
  items,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  primary: string;
  items?: string[];
  description?: string;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    green: "bg-green-100 text-green-800 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    pink: "bg-pink-100 text-pink-800 border-pink-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
  };

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="font-semibold text-sm text-gray-700">{title}</h4>
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
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-80 w-full" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
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