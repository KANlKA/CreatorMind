import { Card, CardContent } from "@/components/ui/card";
import { Video, MessageSquare, TrendingUp, Sparkles } from "lucide-react";

interface OverviewStatsProps {
  totalVideos: number;
  avgEngagement: number;
  totalViews: number;
  ideasGenerated: number;
}

export function OverviewStats({
  totalVideos,
  avgEngagement,
  totalViews,
  ideasGenerated,
}: OverviewStatsProps) {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      <StatCard
        icon={<Video className="h-5 w-5 text-blue-600" />}
        label="Total Videos"
        value={totalVideos.toString()}
      />
      <StatCard
        icon={<MessageSquare className="bg-zinc-900 border-zinc-800" />}
        label="Avg Engagement"
        value={`${(avgEngagement * 100).toFixed(1)}%`}
      />
      <StatCard
        icon={<TrendingUp className="bg-zinc-900 border-zinc-800"/>}
        label="Total Views"
        value={totalViews.toLocaleString()}
      />
      <StatCard
        icon={<Sparkles className="h-5 w-5 text-yellow-600" />}
        label="Ideas Generated"
        value={ideasGenerated.toString()}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          
          {/* Icon container */}
          <div className="p-2 rounded-lg bg-primary/10">
            {icon}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
