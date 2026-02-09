"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateHeuristicContent } from "@/lib/content/heuristic-generator";
import { generateIdeaGeoRecommendation } from "@/lib/content/idea-geo-recommendation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, Sparkles } from "lucide-react";
import GlareButton from "@/components/ui/GlareButton";
import Link from "next/link";

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const ideaIndex = parseInt(params.id as string);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const res = await fetch("/api/ideas");
        const data = await res.json();

        if (data.ideas && data.ideas[ideaIndex]) {
          const selectedIdea = data.ideas[ideaIndex];
          setIdea(selectedIdea);
        }
      } catch (error) {
        console.error("Error fetching idea:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchIdea();
    }
  }, [status, ideaIndex]);

  if (loading) {
    return <IdeaDetailSkeleton />;
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-black pt-24 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-white">Idea not found</p>
          <Link href="/ideas">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ideas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const contentPack = generateHeuristicContent(idea);
  const confidenceColor = "text-white";
  const geoRecommendations = generateIdeaGeoRecommendation(idea);

  return (
    <div className="min-h-screen bg-black">
      <div className="h-20" />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="lg:col-span-2 mb-6">
          {/* Back Button */}
          <Link href="/ideas">
            <GlareButton className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4 inline" />
              Back to All Ideas
            </GlareButton>
          </Link>

          {/* Title */}
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  Idea #{idea.rank}
                </Badge>
              </div>
              <CardTitle className="text-3xl mb-4">{idea.title}</CardTitle>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-white" />
                  <div>
                    <p className="text-sm text-gray-400">
                      Predicted Engagement
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {(idea.predictedEngagement * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className={`h-5 w-5 ${confidenceColor}`} />
                  <div>
                    <p className="text-sm text-gray-400">Confidence</p>
                    <p className={`text-2xl font-bold ${confidenceColor}`}>
                      {(idea.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6 pr-2">
            {/* Why This Will Work */}
            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader>
                <CardTitle> Why This Will Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-gray-400">1.</span>
                    Strong Audience Demand
                  </h3>
                  <p className="text-gray-200 ml-6">
                    {idea.reasoning.commentDemand}
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-gray-00">2.</span>
                    Proven Topic Performance
                  </h3>
                  <p className="text-gray-200 ml-6">
                    {idea.reasoning.pastPerformance}
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-gray-400">3.</span>
                    Fits Your Style
                  </h3>
                  <p className="text-gray-200 ml-6">
                    {idea.reasoning.audienceFit}
                  </p>
                </div>
                {idea.reasoning.trendingScore > 0.5 && (
                  <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-gray-400">4.</span>
                      Trending Now
                    </h3>
                    <p className="text-gray-200 ml-6">
                      This topic has{" "}
                      {(idea.reasoning.trendingScore * 100).toFixed(0)}%
                      trending momentum right now
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evidence */}
            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader className="border-b border-zinc-800">
                <CardTitle className="text-white text-xl">Evidence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {idea.evidence.map((ev: any, i: number) => (
                  <div
                    key={i}
                    className="p-5 bg-zinc-900/60 rounded-xl border-2 border-zinc-800 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="border-zinc-700 text-gray-300"
                      >
                        {ev.type}
                      </Badge>
                    </div>
                    <p className="text-gray-200">{ev.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Suggested Structure */}
            <Card className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
              <CardHeader className="border-b border-zinc-800">
                <CardTitle className="flex items-center gap-2 text-white text-xl">
                  Suggested Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
                  <h3 className="font-semibold mb-2">
                    Hook (First 30 seconds)
                  </h3>
                  <p className="text-gray-200 italic">
                    "{idea.suggestedStructure.hook}"
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-6 bg-zinc-900/60 rounded-xl border-2 border-zinc-800">
                    <p className="text-sm text-gray-400 mb-1">Format</p>
                    <p className="font-semibold text-white capitalize">
                      {idea.suggestedStructure.format}
                    </p>
                  </div>
                  <div className="p-6 bg-zinc-900/60 rounded-xl border-2 border-zinc-800">
                    <p className="text-sm text-gray-400 mb-1">Length</p>
                    <p className="font-semibold text-white">
                      {idea.suggestedStructure.length}
                    </p>
                  </div>
                  <div className="p-6 bg-zinc-900/60 rounded-xl border-2 border-zinc-800">
                    <p className="text-sm text-gray-400 mb-1">Tone</p>
                    <p className="font-semibold text-white capitalize">
                      {idea.suggestedStructure.tone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Pack */}
            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader className="border-b border-zinc-800">
                <CardTitle className="text-white text-xl">
                  Content Pack
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* HASHTAGS */}
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-3">
                    Suggested Hashtags
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {contentPack?.hashtags?.map((tag: string, i: number) => (
                      <Badge key={i} className="border-zinc-700 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* TITLES */}
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-3">
                    Alternative Titles
                  </p>

                  <div className="space-y-2">
                    {contentPack?.titleVariants?.map(
                      (title: string, i: number) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-zinc-900/60 border-2 border-zinc-800 hover:border-zinc-700 transition-all text-sm text-gray-200"
                        >
                          {title}
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* SCRIPT */}
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-3">
                    Draft Script
                  </p>

                  <div className="p-6 rounded-xl bg-zinc-950 border-2 border-zinc-800 whitespace-pre-line text-sm text-gray-200">
                    {contentPack?.script}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <GlareButton className="flex-1 text-center">
                Mark as "Made This Video"
              </GlareButton>

              <GlareButton className="flex-1 text-center">
                Save for Later
              </GlareButton>

              <GlareButton>Dismiss</GlareButton>
            </div>
          </div>
          {/* Geography Recommendation */}
          <div className="space-y-6 lg:sticky lg:top-24 self-start">
            <Card className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-white">
                  Where This Idea Will Perform Best
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {geoRecommendations.map((geo: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border border-zinc-800 bg-zinc-950"
                  >
                    <p className="font-semibold">{geo.country}</p>
                    <p className="text-sm text-gray-400">{geo.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function IdeaDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-6 pb-6">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-64 mb-6" />
        <Skeleton className="h-96 mb-6" />
        <Skeleton className="h-64 mb-6" />
      </div>
    </div>
  );
}
