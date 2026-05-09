import { useState } from "react";
import { createApplication } from "../api/application";

import { Loader2 } from "lucide-react";
import { Separator } from "./ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

type Props = {
  onResult: (data: any) => void;
};

export default function JobForm({ onResult }: Props) {
  const [cvText, setCvText] = useState("");
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!cvText || !jobText) {
      setError("Please fill in both CV and job description");
      return;
    }

    setLoading(true);

    try {
      const result = await createApplication({
        cvText,
        jobText,
      });

      onResult(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Job Application</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* CV */}
        <div className="space-y-2">
          <label className="text-sm font-medium">CV Text</label>
          <Textarea
            placeholder="Paste your CV here..."
            value={cvText}
            onChange={(e: any) => setCvText(e.target.value)}
            rows={6}
          />
        </div>

        {/* Job */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Description</label>
          <Textarea
            placeholder="Paste job description..."
            value={jobText}
            onChange={(e: any) => setJobText(e.target.value)}
            rows={6}
          />
        </div>

        <Separator />

        {/* Error */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Submit */}
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Application"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
