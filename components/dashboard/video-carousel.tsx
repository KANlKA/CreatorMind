"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Video {
  title: string;
  thumbnailUrl: string;
  views: number;
}

const mockVideos: Video[] = [
  {
    title: "AI Agents Explained",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    views: 1200,
  },
  {
    title: "Automation Tutorial",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    views: 950,
  },
  {
    title: "LLM Basics",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    views: 2100,
  },
];

export function VideoCarousel() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {mockVideos.map((video, i) => (
        <motion.div
          key={video.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
        <Card
          key={i}
          className="min-w-[260px] overflow-hidden transition-all hover:scale-105"
        >
          <img
            src={video.thumbnailUrl}
            className="w-full h-40 object-cover"
          />

          <div className="p-3">
            <p className="font-semibold line-clamp-2">{video.title}</p>
            <p className="text-sm text-muted-foreground">
              {video.views} views
            </p>
          </div>
        </Card>
        </motion.div>
      ))}
    </div>
  );
}
