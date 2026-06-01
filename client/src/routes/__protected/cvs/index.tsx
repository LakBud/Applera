import { createFileRoute } from "@tanstack/react-router";
import { CVsPage } from "../../../pages/CVs";

export const Route = createFileRoute("/__protected/cvs/")({
  component: CVsPage,
});
