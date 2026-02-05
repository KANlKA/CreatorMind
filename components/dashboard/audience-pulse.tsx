"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockAudience = {
  intents: [
    { label: "Questions", value: 40 },
    { label: "Praise", value: 30 },
    { label: "Requests", value: 20 },
    { label: "Confusion", value: 10 },
  ],
  topRequests: ["AI agents tutorial", "Automation workflows", "Debugging help"],
  confusionAreas: ["Prompt engineering", "API setup", "LLM architecture"],
};

export function AudiencePulse() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>🤖 Audience Pulse</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Intent Distribution */}
        <div>
          <p className="font-semibold mb-2">Comment Intent Distribution</p>
          <div className="flex gap-3 flex-wrap">
            {mockAudience.intents.map((item, i) => (
              <div key={i} className="px-3 py-2 bg-muted rounded-lg text-sm">
                {item.label}: {item.value}%
              </div>
            ))}
          </div>
        </div>

        {/* Top Requests */}
        <div>
          <p className="font-semibold mb-2">🔥 Top Audience Requests</p>
          {mockAudience.topRequests.map((req, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {req}
            </p>
          ))}
        </div>

        {/* Confusion Areas */}
        <div>
          <p className="font-semibold mb-2">⚠️ Confusion Areas</p>
          {mockAudience.confusionAreas.map((c, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {c}
            </p>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}
