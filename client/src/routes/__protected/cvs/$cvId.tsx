import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/__protected/cvs/$cvId")({
  component: CVDetail,
});

function CVDetail() {
  const { cvId } = Route.useParams();
  return <div>{cvId}</div>;
}
