import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

type Props = {
  data: any;
};

export default function Result({ data }: Props) {
  const { match, tailored_cv_summary, cover_letter, application_email } = data;

  return (
    <div className="space-y-4 mt-6">
      {/* HEADER */}
      <Card>
        <CardHeader>
          <CardTitle>Application Result</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Match Score:</span>

            <Badge variant="secondary">{match?.score ?? 0}%</Badge>
          </div>
        </CardContent>
      </Card>

      {/* SKILLS */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Strengths</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-2">
            {match?.strengths?.map((s: string, i: number) => (
              <Badge key={i} variant="default">
                {s}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Missing Skills</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-2">
            {match?.missing_skills?.map((s: string, i: number) => (
              <Badge key={i} variant="destructive">
                {s}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* SUMMARY */}
      <Card>
        <CardHeader>
          <CardTitle>Tailored CV Summary</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{tailored_cv_summary}</p>
        </CardContent>
      </Card>

      {/* COVER LETTER */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Letter</CardTitle>
        </CardHeader>

        <CardContent>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed">{cover_letter}</pre>
        </CardContent>
      </Card>

      {/* EMAIL */}
      <Card>
        <CardHeader>
          <CardTitle>Email</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="text-sm">
            <b>Subject:</b> {application_email?.subject}
          </p>

          <Separator />

          <pre className="whitespace-pre-wrap text-sm leading-relaxed">{application_email?.body}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
