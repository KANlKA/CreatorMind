"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import GlareButton from "@/components/ui/GlareButton";
import {
  Lightbulb,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function IdeasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ideas, setIdeas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const res = await fetch("/api/ideas");
        const data = await res.json();
        setIdeas(data);
      } catch (error) {
        console.error("Error fetching ideas:", error);
        toast.error("Failed to load ideas");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchIdeas();
    }
  }, [status]);

  const handleGenerateNew = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ideas", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setIdeas(data);
        toast.success("New ideas generated successfully!");
      } else {
        toast.error(data.error || "Failed to generate ideas");
      }
    } catch (error) {
      console.error("Error generating ideas:", error);
      toast.error("Failed to generate ideas");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <IdeasSkeleton />;
  }

  if (!ideas || !ideas.ideas || ideas.ideas.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        {/* Space for navbar */}
        <div className="h-20" />

        <div className="max-w-7xl mx-auto px-6 py-12">
          <Card className="max-w-2xl mx-auto bg-zinc-900 border-zinc-800 shadow-2xl">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-32 w-32 bg-yellow-900/200/20 rounded-full blur-3xl"></div>
                </div>
                <Lightbulb className="h-20 w-20 text-yellow-500 mx-auto mb-6 relative animate-pulse" />
              </div>

              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                No Ideas Yet
              </h2>
              <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
                Generate your first set of AI-powered video ideas based on your
                channel's data and audience insights.
              </p>

              <Button
                onClick={handleGenerateNew}
                disabled={generating}
                size="lg"
                className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-all"
              >
                {generating ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    Generating Ideas...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Generate Your First Ideas
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Space for floating navbar */}
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    Your Video Ideas
                  </h1>
                  <p className="text-gray-400 mt-1">
                    Generated on{" "}
                    {new Date(ideas.generatedAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerateNew}
              disabled={generating}
              className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-all"
              size="lg"
            >
              {generating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate New Ideas
                </>
              )}
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-gray-400">Total Ideas</p>
                    <p className="text-2xl font-bold text-white">
                      {ideas.ideas.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-gray-400">Avg. Predicted</p>
                    <p className="text-2xl font-bold text-white">
                      {(
                        (ideas.ideas.reduce(
                          (sum: number, idea: any) =>
                            sum + idea.predictedEngagement,
                          0,
                        ) /
                          ideas.ideas.length) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-gray-400">Avg. Confidence</p>
                    <p className="text-2xl font-bold text-white">
                      {(
                        (ideas.ideas.reduce(
                          (sum: number, idea: any) => sum + idea.confidence,
                          0,
                        ) /
                          ideas.ideas.length) *
                        100
                      ).toFixed(0)}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ideas Grid */}
        <div className="space-y-8">
          {ideas.ideas.map((idea: any, index: number) => (
            <IdeaCard key={index} idea={idea} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function IdeaCard({ idea, index }: { idea: any; index: number }) {
  return (
    <Card className="transition-all duration-300 border-zinc-800 bg-zinc-900 hover:border-zinc-700">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex flex-col gap-2">
                <Badge
                  variant="outline"
                  className="w-fit text-gray-400 border-zinc-700 bg-transparent"
                >
                  Idea #{idea.rank}
                </Badge>
              </div>
            </div>
            <CardTitle className="text-3xl mb-2 leading-tight text-white hover:text-zinc-300 transition-colors">
              {idea.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metrics */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="group relative overflow-hidden rounded-xl p-5 bg-zinc-900 border-2 border-zinc-800 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-900/200/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
            <div className="relative flex items-center gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-300 mb-1">
                  Predicted Engagement
                </p>
                <p className="text-3xl font-bold text-white">
                  {(idea.predictedEngagement * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl p-5 border-2 border-zinc-800 bg-zinc-900 transition-all">
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-20 group-hover:scale-150 transition-transform"
              style={{ backgroundColor: "currentColor" }}
            ></div>
            <div className="relative flex items-center gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-300 mb-1">
                  Confidence Score
                </p>
                <p className="text-3xl font-bold text-white">
                  {(idea.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why It Will Work */}
        <div className="bg-zinc-900 rounded-xl p-6 border-2 border-zinc-800">
          <h3 className="font-bold mb-4 text-xl text-white">
            Why This Will Work
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-zinc-800 p-4 rounded-lg border border-zinc-700">
              <p className="text-gray-300 leading-relaxed">
                {idea.reasoning.commentDemand}
              </p>
            </div>
            <div className="flex items-start gap-3 bg-zinc-900 p-4 rounded-lg border border-zinc-700">
              <p className="text-gray-300 leading-relaxed">
                {idea.reasoning.pastPerformance}
              </p>
            </div>
            <div className="flex items-start gap-3 bg-zinc-900 p-4 rounded-lg border border-zinc-700">
              <p className="text-gray-300 leading-relaxed">
                {idea.reasoning.audienceFit}
              </p>
            </div>
          </div>
        </div>

        {/* Evidence Preview */}
        {idea.evidence && idea.evidence.length > 0 && (
          <div className="bg-zinc-800/30 rounded-xl p-6 border-2 border-zinc-800">
            <h3 className="font-bold mb-4 text-xl flex items-center gap-2 text-gray-200">
              Evidence
            </h3>
            <div className="space-y-3">
              {idea.evidence.slice(0, 2).map((ev: any, i: number) => (
                <div
                  key={i}
                  className="p-4 bg-zinc-900 rounded-lg border-2 border-zinc-800 hover:border-purple-800 transition-colors"
                >
                  <Badge
                    variant="outline"
                    className="mb-2 capitalize text-gray-400 border-gray-700"
                  >
                    {ev.type}
                  </Badge>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {ev.text}
                  </p>
                </div>
              ))}
              {idea.evidence.length > 2 && (
                <p className="text-sm font-medium text-white">
                  +{idea.evidence.length - 2} more pieces of evidence
                </p>
              )}
            </div>
          </div>
        )}

        {/* Suggested Structure */}
        {idea.suggestedStructure && (
          <div className="bg-zinc-900 rounded-xl p-6 border-2 border-zinc-800">
            <h3 className="font-bold mb-4 text-xl flex items-center gap-2 text-white">
              Suggested Structure
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {idea.suggestedStructure.hook && (
                <StructureItem
                  label="Hook"
                  value={idea.suggestedStructure.hook}
                />
              )}
              {idea.suggestedStructure.format && (
                <StructureItem
                  label="Format"
                  value={idea.suggestedStructure.format}
                  capitalize
                />
              )}
              {idea.suggestedStructure.length && (
                <StructureItem
                  label="Length"
                  value={idea.suggestedStructure.length}
                />
              )}
              {idea.suggestedStructure.tone && (
                <StructureItem
                  label="Tone"
                  value={idea.suggestedStructure.tone}
                  capitalize
                />
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link href={`/ideas/${index}`} className="block">
          <Button
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-all py-6 text-lg rounded-xl"
            size="lg"
          >
            View Full Details & Evidence
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function StructureItem({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="p-4 bg-zinc-900/50 rounded-lg border-2 border-zinc-800 hover:border-purple-700/50 transition-colors">
      <p className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`font-medium text-gray-300 ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function IdeasSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <div className="h-20" />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Skeleton className="h-12 w-96 mb-2 bg-zinc-800" />
        <Skeleton className="h-6 w-64 mb-12 bg-zinc-800" />

        <div className="grid grid-cols-3 gap-4 mb-12">
          <Skeleton className="h-24 bg-zinc-800" />
          <Skeleton className="h-24 bg-zinc-800" />
          <Skeleton className="h-24 bg-zinc-800" />
        </div>

        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[600px] rounded-xl bg-zinc-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
