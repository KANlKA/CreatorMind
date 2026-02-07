"use client";

import { PerformancePatterns } from "@/components/dashboard/performance-patterns";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PerformancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Performance Patterns</h1>
        <p className="text-gray-600">
          Deep analysis of what's working for your channel based on all your historical data
        </p>
      </div>
      
      <PerformancePatterns />
    </div>
  );
}