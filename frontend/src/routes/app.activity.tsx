import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ActivityApi } from "@/lib/api";
import { getInitials } from "@/lib/formatters";

export const Route = createFileRoute("/app/activity")({ component: ActivityPage });

function ActivityPage() {
  const { data, isLoading } = useQuery({ queryKey: ["activity"], queryFn: () => ActivityApi.list({ page: 1, limit: 50 }) });
  const activities = data?.items ?? [];

  return (
    <>
      <PageHeader title="Activity" description="Everything that's happened in your workspace recently." />
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading activity…</div>
          ) : (
            <div className="divide-y divide-border">
              {activities.map((a) => {
                const name = a.user?.name ?? "Someone";
                return (
                  <div key={a.id} className="px-6 py-4 flex gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-accent text-accent-foreground">{getInitials(name)}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <div className="text-sm leading-snug"><span className="font-medium">{name}</span> <span className="text-muted-foreground">{a.action}</span> <span className="font-medium">{a.entityType}</span></div>
                      <div className="text-xs text-muted-foreground mt-0.5">{new Date(a.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
