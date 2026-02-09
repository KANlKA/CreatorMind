"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AudiencePulse() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
      fetch("/api/audience-pulse")
        .then(res => res.json())
        .then(setData);
    }, []);
    const hasAudienceData =
      data &&
      (
        (data.intents && data.intents.length > 0) ||
        (data.topTopics && data.topTopics.length > 0)
      );

    if (!hasAudienceData) {
      return null;
    }

   return (
    <Card className="mb-8 bg-zinc-900 border-zinc-800">
      <CardHeader className="text-white text-xl font-bold mb-3">
        <CardTitle>Audience Pulse</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Intent Distribution */}
        <div>
          <p className="font-semibold mb-2 text-zinc-400">Comment Intent Distribution</p>
          <div className="flex gap-3 flex-wrap">
            {data?.intents?.map(([label, value]: any, i: number) => (
              <div key={i} className="text-white text-muted-foreground">
               {label}: {value}
              </div>
            ))}
          </div>
        </div>

        {/* Top Requests */}
        <div>
          <p className="font-semibold mb-2 text-zinc-400">Top Audience Requests</p>
           {data?.topTopics?.map(([topic, count]: any, i: number) => (
            <p key={i} className="text-white text-muted-foreground">
              {topic} ({count})
            </p>
           ))}
        </div>

      </CardContent>
    </Card>
  );
}
