import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/app" || location.pathname === "/app/") {
      throw redirect({ to: "/app/dashboard" });
    }
  },
  component: AppLayout,
});
