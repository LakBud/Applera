import { useState } from "react";
import { useUploadCVFile, useUploadCVText } from "../../api";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

export function UploadCVCard() {
  const [cvText, setCvText] = useState("");

  const uploadFile = useUploadCVFile();
  const uploadText = useUploadCVText();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadFile.mutate(file);
  }

  function handleTextUpload() {
    if (!cvText.trim()) return;

    uploadText.mutate(cvText);
    setCvText("");
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Upload new CV</h2>
          <p className="text-sm text-muted-foreground">Upload a PDF or paste plain text</p>
        </div>

        {/* PDF */}
        <div className="space-y-2">
          <label className="text-sm font-medium">PDF Upload</label>

          <input type="file" accept=".pdf" onChange={handleFileChange} />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Paste CV text</label>

          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            className="w-full min-h-48 rounded-lg border p-3"
            placeholder="Paste your CV..."
          />
        </div>

        <Button onClick={handleTextUpload} disabled={uploadText.isPending}>
          {uploadText.isPending ? "Uploading..." : "Upload text"}
        </Button>
      </CardContent>
    </Card>
  );
}
