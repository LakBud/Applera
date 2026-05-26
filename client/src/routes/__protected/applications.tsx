import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/__protected/applications")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/__protected/application"!</div>;
}
