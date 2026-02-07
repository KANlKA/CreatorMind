"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

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
      setIdeas(data);
    } catch (error) {
      console.error("Error generating ideas:", error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <IdeasSkeleton />;
  }

  if (!ideas || !ideas.ideas || ideas.ideas.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <Lightbulb className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Ideas Yet</h2>
              <p className="text-gray-600 mb-6">
                Generate your first set of video ideas based on your channel data.
              </p>
              <Button
                onClick={handleGenerateNew}
                disabled={generating}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {generating ? "Generating..." : "Generate Ideas"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Video Ideas</h1>
            <p className="text-gray-600">
              Generated on {new Date(ideas.generatedAt).toLocaleDateString()}
            </p>
          </div>
          <Button
            onClick={handleGenerateNew}
            disabled={generating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {generating ? "Generating..." : "Generate New Ideas"}
          </Button>
        </div>

        {/* Ideas Grid */}
        <div className="space-y-6">
          {ideas.ideas.map((idea: any, index: number) => (
            <IdeaCard key={index} idea={idea} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function IdeaCard({ idea, index }: { idea: any; index: number }) {
  const rankEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
  const confidenceColor =
    idea.confidence >= 0.8
      ? "bg-green-100 text-green-700 border-green-300"
      : idea.confidence >= 0.6
      ? "bg-yellow-100 text-yellow-700 border-yellow-300"
      : "bg-orange-100 text-orange-700 border-orange-300";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{rankEmojis[index]}</span>
              <Badge variant="outline">Idea #{idea.rank}</Badge>
            </div>
            <CardTitle className="text-2xl mb-3">{idea.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Predicted Engagement</p>
              <p className="text-2xl font-bold text-blue-600">
                {(idea.predictedEngagement * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-3 p-4 rounded-lg border ${confidenceColor}`}
          >
            <Sparkles className="h-8 w-8" />
            <div>
              <p className="text-sm">Confidence Score</p>
              <p className="text-2xl font-bold">
                {(idea.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Why It Will Work */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-lg">💡 Why This Will Work</h3>
          <div className="space-y-2 bg-slate-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <p className="text-gray-700">{idea.reasoning.commentDemand}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <p className="text-gray-700">{idea.reasoning.pastPerformance}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <p className="text-gray-700">{idea.reasoning.audienceFit}</p>
            </div>
          </div>
        </div>

        {/* Evidence Preview */}
        {idea.evidence && idea.evidence.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-lg">📚 Evidence</h3>
            <div className="space-y-2">
              {idea.evidence.slice(0, 2).map((ev: any, i: number) => (
                <div
                  key={i}
                  className="p-3 bg-gray-50 rounded border border-gray-200 text-sm"
                >
                  <Badge variant="outline" className="mb-2">
                    {ev.type}
                  </Badge>
                  <p className="text-gray-700">{ev.text}</p>
                </div>
              ))}
              {idea.evidence.length > 2 && (
                <p className="text-sm text-gray-500">
                  +{idea.evidence.length - 2} more pieces of evidence
                </p>
              )}
            </div>
          </div>
        )}

        {/* Suggested Structure */}
        {idea.suggestedStructure && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-lg">🎬 Suggested Structure</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {idea.suggestedStructure.hook && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-600 mb-1">Hook</p>
                  <p className="font-medium text-sm">{idea.suggestedStructure.hook}</p>
                </div>
              )}
              {idea.suggestedStructure.format && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-600 mb-1">Format</p>
                  <p className="font-medium text-sm capitalize">
                    {idea.suggestedStructure.format}
                  </p>
                </div>
              )}
              {idea.suggestedStructure.length && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-600 mb-1">Length</p>
                  <p className="font-medium text-sm">{idea.suggestedStructure.length}</p>
                </div>
              )}
              {idea.suggestedStructure.tone && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-600 mb-1">Tone</p>
                  <p className="font-medium text-sm capitalize">
                    {idea.suggestedStructure.tone}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link href={`/ideas/${index}`} className="flex-1">
            <Button className="w-full" variant="outline">
              View Full Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function IdeasSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    </div>
  );
}