import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { createApplication, uploadCVFile, analyzeJobFile } from "../api";

import type { CreateApplicationResponse } from "../api";

type Props = {
  onResult: (data: CreateApplicationResponse) => void;
};

export default function JobForm({ onResult }: Props) {
  const [cvText, setCvText] = useState("");
  const [jobText, setJobText] = useState("");

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobFile, setJobFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      let finalCV = cvText;
      let finalJob = jobText;

      // upload CV PDF if selected
      if (cvFile) {
        const parsedCV = await uploadCVFile(cvFile);
        finalCV = parsedCV.rawText;
      }

      // upload job PDF if selected
      if (jobFile) {
        const parsedJob = await analyzeJobFile(jobFile);
        finalJob = parsedJob.rawText;
      }

      if (!finalCV.trim() || !finalJob.trim()) {
        throw new Error("Provide either text or PDF for both fields.");
      }

      const result = await createApplication({
        cvText: finalCV,
        jobText: finalJob,
      });

      onResult(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* CV */}
      <div className="space-y-2">
        <label className="text-sm font-medium">CV Text</label>
        <Textarea placeholder="Paste your CV here..." value={cvText} onChange={(e) => setCvText(e.target.value)} rows={6} />
        <Input type="file" accept=".pdf" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} />
      </div>

      {/* Job */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Job Description</label>
        <Textarea placeholder="Paste job description..." value={jobText} onChange={(e) => setJobText(e.target.value)} rows={6} />
        <Input type="file" accept=".pdf" onChange={(e) => setJobFile(e.target.files?.[0] ?? null)} />
      </div>

      <Separator />

      {error && <p className="text-sm text-red-500">{error}</p>}

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
    </div>
  );
}
