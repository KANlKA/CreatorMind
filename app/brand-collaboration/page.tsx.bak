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
} from "lucide-react";
import Link from "next/link";

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
    } catch (error) {
      console.error("Error fetching brand collaboration data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center">Loading brand collaboration insights...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-red-600">Failed to load data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-purple-600" />
              Brand Collaboration Signals
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered insights into industries, brands, and content styles that attract sponsorships
            </p>
          </div>
        </div>

        {/* Industries Attracted by Your Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Industries Attracted by Your Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.industries.length === 0 ? (
              <p className="text-sm text-gray-500">
                Create more videos with AI analysis to discover industry opportunities
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {data.industries.map((industry, index) => (
                  <div
                    key={industry.name}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          {index === 0 && (
                            <Award className="h-5 w-5 text-yellow-500" />
                          )}
                          {industry.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {industry.reason}
                        </p>
                      </div>
                      <Badge className="bg-blue-600 text-white">
                        Score: {industry.score}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                      <BarChart3 className="h-4 w-4" />
                      {industry.videoCount} video{industry.videoCount !== 1 ? "s" : ""} in this space
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Potential Brand Partners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Potential Brand Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.potentialBrands.length === 0 ? (
              <p className="text-sm text-gray-500">
                Build your content library to unlock brand partnership opportunities
              </p>
            ) : (
              <div className="space-y-4">
                {data.potentialBrands.map((brand) => (
                  <div
                    key={brand.industry}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{brand.industry}</h3>
                      <Badge className={`${brand.fitScore >= 7 ? "bg-green-600" : brand.fitScore >= 5 ? "bg-yellow-600" : "bg-blue-600"} text-white`}>
                        Fit Score: {brand.fitScore}/10
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {brand.contentAlignment}
                    </p>
                    <p className="text-xs text-gray-600 italic mb-3">
                      {brand.reasoning}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-semibold text-gray-600">
                        Example Brands:
                      </span>
                      {brand.brandExamples.map((example) => (
                        <Badge
                          key={example}
                          variant="outline"
                          className="bg-white"
                        >
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Styles That Trigger Sponsorship Interest */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Content Styles That Trigger Sponsorship Interest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {data.contentStyles.map((style) => (
                <div
                  key={style.style}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{style.style}</h3>
                    <Badge className="bg-purple-600 text-white capitalize">
                      {style.metric}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{style.value}</p>
                  <div className="bg-white/50 rounded p-2 mt-3">
                    <p className="text-xs text-gray-700 italic">
                      💡 {style.sponsorshipAppeal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audience Insights */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Top Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                Top Audience Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.audienceInsights.topInterests.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Analyzing audience interests...
                  </p>
                ) : (
                  data.audienceInsights.topInterests.map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="capitalize"
                    >
                      {interest}
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Demographic Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-blue-600" />
                Demographic Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.audienceInsights.demographicIndicators.length === 0 ? (
                  <li className="text-sm text-gray-500">
                    Building demographic insights...
                  </li>
                ) : (
                  data.audienceInsights.demographicIndicators.map((indicator, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      {indicator}
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Engagement Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-green-600" />
                Engagement Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.audienceInsights.engagementPatterns.length === 0 ? (
                  <li className="text-sm text-gray-500">
                    Analyzing engagement patterns...
                  </li>
                ) : (
                  data.audienceInsights.engagementPatterns.map((pattern, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      {pattern}
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold mb-2">Ready to Reach Out?</h2>
              <p className="mb-4 opacity-90">
                Use these insights to craft personalized pitches to potential brand partners
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                Export Brand Collaboration Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
