"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

interface Video {
  _id: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  views: number;
  likes?: number;
  commentCount?: number;
  engagementRate?: number;
}

export function VideoCarousel() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/videos");
        const data = await res.json();
        setVideos(data.videos || []);
      } catch (e) {
        console.error("Failed to fetch videos", e);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading videos…</p>;
  }

  if (videos.length === 0) {
    return <p className="text-sm text-muted-foreground">No videos found.</p>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth">
      {videos.map((video) => (
        <motion.div
          className="snap-center"
          key={video._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href={`/videos/${video.videoId}`}>
            <Card className="group relative min-w-[260px] overflow-hidden transition-all hover:scale-105 cursor-pointer">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-40 object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {(
                  ((video.likes ?? 0) + (video.commentCount ?? 0)) /
                  Math.max(video.views, 1) *
                  100
                ).toFixed(1)}% ENG
              </div>

              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3 text-white text-sm">
                <p className="font-semibold mb-2">Click to view comment analysis</p>
                <p>{video.views.toLocaleString()} views</p>
                <p>
                  {(
                    ((video.likes ?? 0) + (video.commentCount ?? 0)) /
                    Math.max(video.views, 1) *
                    100
                  ).toFixed(1)}% engagement
                </p>
              </div>

              <div className="p-3 space-y-1">
                <p className="font-semibold line-clamp-2">{video.title}</p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    👁 {video.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    👍 {video.likes?.toLocaleString() ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    💬 {video.commentCount?.toLocaleString() ?? 0}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
