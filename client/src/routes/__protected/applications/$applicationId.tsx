import { createFileRoute } from "@tanstack/react-router";
import { ApplicationIdPage } from "../../../pages/applicationDetail";

export const Route = createFileRoute("/__protected/applications/$applicationId")({
  component: ApplicationIdPage,
});
