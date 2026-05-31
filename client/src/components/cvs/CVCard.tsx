import { Link } from "@tanstack/react-router";
import { useDeleteCV } from "../../api";
import type { CVDocument } from "../../api/schemas";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "../ui/card";
import { Button } from "../ui/button";

export function CVCard({ cv }: { cv: CVDocument }) {
  const del = useDeleteCV();

  const latestExp = cv.parsed.experience?.[0];
  const topSkills = cv.parsed.skills?.slice(0, 5) || [];

  const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString() : "");

  const showSeniority = cv.parsed.seniority_level && cv.parsed.seniority_level !== "unknown";

  return (
    <Link to="/cvs/$cvId" params={{ cvId: cv._id }}>
      <Card className="hover:shadow-md transition cursor-pointer group bg-white/40">
        {/* IMAGE */}
        {cv.previewImageUrl && <img src={cv.previewImageUrl} alt="CV preview" className="w-full h-56 object-cover border-b" />}

        {/* HEADER */}
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-tx-h1 text-xl">{cv.parsed.name || "Untitled CV"}</CardTitle>

              <CardDescription className="text-sm text-tx-secondary">Updated {formatDate(cv.updatedAt)}</CardDescription>
            </div>

            {showSeniority && (
              <span className="text-xs px-2 py-1 rounded-full bg-muted whitespace-nowrap">{cv.parsed.seniority_level}</span>
            )}
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-4">
          {/* Skills */}
          {topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {topSkills.map((skill, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-md bg-muted text-tx-secondary border border-rounded-2xl">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {cv.applicationsCount !== undefined && <p className="text-green-900">Used in {cv.applicationsCount} applications</p>}

            {latestExp && cv.parsed.experience.length > 1 && (
              <p className="text-green-900">{cv.parsed.experience.length} experiences</p>
            )}
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="flex justify-between">
          {/* IMPORTANT: prevent navigation on delete */}
          <div onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" className="text-green-900" onClick={() => del.mutate(cv._id)}>
              Delete
            </Button>
          </div>

          <CardAction className="pt-1">
            <span className="text-xs text-muted-foreground">Click to view →</span>
          </CardAction>
        </CardFooter>
      </Card>
    </Link>
  );
}
