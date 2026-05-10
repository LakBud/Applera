import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import type { CreateApplicationResponse } from "../api";

type Props = {
  data: CreateApplicationResponse;
};

export default function Result({ data }: Props) {
  const { match, tailored_cv_summary, cover_letter, application_email } = data.application;

  return (
    <div className="space-y-4">
      {/* Match score */}
      <Card>
        <CardHeader>
          <CardTitle>Match Score</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Badge variant="secondary">{match?.score ?? 0}%</Badge>
          <span className="text-sm text-muted-foreground capitalize">{match?.confidence} confidence</span>
        </CardContent>
      </Card>

      {/* Skills */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Strengths</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {match?.strengths?.length ? (
              match.strengths.map((s, i) => (
                <Badge key={i} variant="default">
                  {s}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">None found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Missing Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {match?.missing_skills?.length ? (
              match.missing_skills.map((s, i) => (
                <Badge key={i} variant="destructive">
                  {s}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">None — great match!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CV Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tailored CV Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{tailored_cv_summary || "—"}</p>
        </CardContent>
      </Card>

      {/* Cover Letter */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Letter</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed">{cover_letter || "—"}</pre>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle>Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Subject:</span> {application_email?.subject}
          </p>
          <Separator />
          <pre className="whitespace-pre-wrap text-sm leading-relaxed">{application_email?.body}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
