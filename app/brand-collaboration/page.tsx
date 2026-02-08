"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  TrendingUp,
  Target,
  Users,
  Sparkles,
  ArrowLeft,
  Building2,
  Award,
  BarChart3,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface Industry {
  name: string;
  score: number;
  reason: string;
  videoCount: number;
}

interface PotentialBrand {
  industry: string;
  brandExamples: string[];
  contentAlignment: string;
  fitScore: number;
  reasoning: string;
}

interface ContentStyle {
  style: string;
  metric: string;
  value: string;
  sponsorshipAppeal: string;
}

interface AudienceInsights {
  topInterests: string[];
  demographicIndicators: string[];
  engagementPatterns: string[];
}

interface BrandCollaborationData {
  industries: Industry[];
  potentialBrands: PotentialBrand[];
  contentStyles: ContentStyle[];
  audienceInsights: AudienceInsights;
}

export default function BrandCollaborationPage() {
  const router = useRouter();
  const [data, setData] = useState<BrandCollaborationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrandCollaborationData();
  }, []);

  const fetchBrandCollaborationData = async () => {
    try {
      const res = await fetch("/api/brand-collaboration");
      const result = await res.json();
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="h-24" />
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <Skeleton className="h-10 w-64 bg-white/10" />
          <Skeleton className="h-4 w-96 bg-white/10" />
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black">
        <div className="h-24" />
        <div className="max-w-7xl mx-auto p-6">
          <Card className="bg-black border border-white/15">
            <CardContent className="p-12 text-center text-gray-400">
              Failed to load data
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="h-24" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div>
            <h1 className="text-3xl font-light text-white flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-gray-400" />
              Brand Collaboration Signals
            </h1>
            <p className="text-gray-400">
              AI-powered sponsorship intelligence
            </p>
          </div>
        </div>

        {/* Industries */}
        <SectionCard title="Industries Attracted" icon={<Building2 />}>
          <div className="grid md:grid-cols-2 gap-4">
            {data.industries.map((industry, index) => (
              <div
                key={industry.name}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 hover:border-white/25 transition"
              >
                <div className="flex justify-between mb-2">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    {index === 0 && <Award className="h-4 w-4" />}
                    {industry.name}
                  </h3>
                  <Badge className="bg-white text-black">
                    {industry.score}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm">{industry.reason}</p>
                <p className="text-gray-500 text-xs mt-2">
                  {industry.videoCount} videos
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Brands */}
        <SectionCard title="Potential Brand Partners" icon={<Target />}>
          <div className="space-y-4">
            {data.potentialBrands.map((brand) => (
              <div
                key={brand.industry}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5 hover:border-white/25 transition"
              >
                <div className="flex justify-between mb-2">
                  <h3 className="text-white font-semibold">{brand.industry}</h3>
                  <Badge className="bg-white text-black">
                    {brand.fitScore}/10
                  </Badge>
                </div>
                <p className="text-gray-300">{brand.contentAlignment}</p>
                <p className="text-gray-500 text-sm mt-2">{brand.reasoning}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {brand.brandExamples.map((b) => (
                    <Badge key={b} className="bg-white/10 text-gray-300 border border-white/20">
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* CTA */}
        <Card className="bg-black border border-white/20">
          <CardContent className="p-10 text-center">
            <Sparkles className="h-10 w-10 mx-auto mb-4 text-white" />
            <h2 className="text-2xl text-white">Ready to reach out?</h2>
            <p className="text-gray-400 max-w-md mx-auto mt-2">
              Export your brand-fit report and pitch like a pro
            </p>
            <Button
              size="lg"
              className="mt-6 bg-white text-black border border-gray-300 hover:bg-gray-100"
            >
              Export Report <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children }: any) {
  return (
    <Card className="bg-black border border-white/15">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-300">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
