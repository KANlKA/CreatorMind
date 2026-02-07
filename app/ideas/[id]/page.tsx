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
import { ArrowLeft, TrendingUp, Sparkles, FileText } from "lucide-react";
import Link from "next/link";

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [idea, setIdea] = useState<any>(null);
  const [aiContent, setAiContent] = useState<any>(null);
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

          // 👇 call AI generator
          const aiRes = await fetch("/api/ai/generate-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "all",
              idea: selectedIdea,
            }),
          });

          const aiData = await aiRes.json();
          console.log("AI RESPONSE:", aiData);
          setAiContent(aiData);
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
    const contentPack =
      idea.contentPack &&
      (idea.contentPack.hashtags?.length ||
        idea.contentPack.titleVariants?.length ||
        idea.contentPack.script)
        ? idea.contentPack
        : generateHeuristicContent(idea);

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <p>Idea not found</p>
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

  const rankEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
  const confidenceColor =
    idea.confidence >= 0.8
      ? "text-green-600"
      : idea.confidence >= 0.6
        ? "text-yellow-600"
        : "text-orange-600";
  const geoRecommendations = generateIdeaGeoRecommendation(idea);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/ideas">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Ideas
          </Button>
        </Link>

        {/* Title */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{rankEmojis[ideaIndex]}</span>
              <Badge variant="outline" className="text-lg px-3 py-1">
                Idea #{idea.rank}
              </Badge>
            </div>
            <CardTitle className="text-3xl mb-4">{idea.title}</CardTitle>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Predicted Engagement</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(idea.predictedEngagement * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className={`h-5 w-5 ${confidenceColor}`} />
                <div>
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className={`text-2xl font-bold ${confidenceColor}`}>
                    {(idea.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Geography Recommendation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Where This Idea Will Perform Best</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {geoRecommendations.map((geo: any, i: number) => (
              <div
                key={i}
                className="p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <p className="font-semibold">{geo.country}</p>
                <p className="text-sm text-gray-600">{geo.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Why This Will Work */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle> Why This Will Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-orange-500">1.</span>
                Strong Audience Demand
              </h3>
              <p className="text-gray-700 ml-6">
                {idea.reasoning.commentDemand}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-blue-500">2.</span>
                Proven Topic Performance
              </h3>
              <p className="text-gray-700 ml-6">
                {idea.reasoning.pastPerformance}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-green-500">3.</span>
                Fits Your Style
              </h3>
              <p className="text-gray-700 ml-6">{idea.reasoning.audienceFit}</p>
            </div>
            {idea.reasoning.trendingScore > 0.5 && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-purple-500">4.</span>
                  Trending Now
                </h3>
                <p className="text-gray-700 ml-6">
                  This topic has{" "}
                  {(idea.reasoning.trendingScore * 100).toFixed(0)}% trending
                  momentum right now
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evidence */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle> Evidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {idea.evidence.map((ev: any, i: number) => (
              <div
                key={i}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={
                      ev.type === "comment"
                        ? "bg-orange-100"
                        : ev.type === "performance"
                          ? "bg-blue-100"
                          : "bg-green-100"
                    }
                  >
                    {ev.type}
                  </Badge>
                </div>
                <p className="text-gray-700">{ev.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Suggested Structure */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Suggested Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold mb-2">Hook (First 30 seconds)</h3>
              <p className="text-gray-700 italic">
                "{idea.suggestedStructure.hook}"
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Format</p>
                <p className="font-semibold capitalize">
                  {idea.suggestedStructure.format}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Length</p>
                <p className="font-semibold">
                  {idea.suggestedStructure.length}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Tone</p>
                <p className="font-semibold capitalize">
                  {idea.suggestedStructure.tone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {aiContent && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle> AI Content Pack</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-6">
                {/* HASHTAGS */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-3">
                    Suggested Hashtags
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {contentPack?.hashtags?.length ? (
                      contentPack.hashtags.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">
                        Generating hashtags...
                      </p>
                    )}
                  </div>
                </div>

                {/* TITLES */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-3">
                    Alternative Titles
                  </p>

                  <div className="space-y-2">
                    {contentPack?.titleVariants?.length ? (
                      contentPack.titleVariants.map(
                        (title: string, i: number) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-gray-50 border text-sm"
                          >
                            {title}
                          </div>
                        ),
                      )
                    ) : (
                      <p className="text-gray-400 text-sm">
                        Generating titles...
                      </p>
                    )}
                  </div>
                </div>

                {/* SCRIPT */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-3">
                    Draft Script
                  </p>

                  {contentPack?.script ? (
                    <div className="p-4 rounded-lg bg-gray-50 border whitespace-pre-line text-sm">
                      {contentPack.script}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Generating script...
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="flex-1 bg-green-600 hover:bg-green-700">
            Mark as "Made This Video"
          </Button>
          <Button variant="outline" className="flex-1">
            Save for Later
          </Button>
          <Button variant="outline">Dismiss</Button>
        </div>
      </div>
    </div>
  );
}

function IdeaDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-64 mb-6" />
        <Skeleton className="h-96 mb-6" />
        <Skeleton className="h-64 mb-6" />
      </div>
    </div>
  );
}
