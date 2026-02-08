"use client";

import { PerformancePatterns } from "@/components/dashboard/performance-patterns";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PerformancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black">
      {/* Top spacing for navbar */}
      <div className="h-20" />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            className="gap-2 border-gray-700 text-gray-300 hover:bg-white hover:text-black hover:border-white"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-light text-white mb-2">Performance Patterns</h1>
          <p className="text-gray-400 font-light">
            Deep analysis of what's working for your channel based on all your historical data
          </p>
        </div>

        <PerformancePatterns />
      </div>
    </div>
  );
}