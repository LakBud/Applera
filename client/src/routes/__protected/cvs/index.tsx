import { createFileRoute } from "@tanstack/react-router";
import { CVsPage } from "../../../pages/cvs";

export const Route = createFileRoute("/__protected/cvs/")({
  component: CVsPage,
});
