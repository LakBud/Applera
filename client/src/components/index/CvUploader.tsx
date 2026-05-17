import { useRef, useState } from "react";
import { useUploadCVFile, useUploadCVText } from "../../api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

type Props = {
  onSuccess?: (cvId?: string) => void;
};

export default function CvUploader({ onSuccess }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [text, setText] = useState("");
  const [mode, setMode] = useState<"file" | "text">("file");

  const uploadFile = useUploadCVFile();
  const uploadText = useUploadCVText();

  const isUploading = uploadFile.isPending || uploadText.isPending;

  async function handleFile(file: File) {
    try {
      const res = await uploadFile.mutateAsync(file);
      onSuccess?.(res.cv?._id);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleText() {
    if (!text.trim()) return;

    try {
      const res = await uploadText.mutateAsync(text);
      onSuccess?.(res.cv?._id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-overline"></span>

        <div className="flex gap-2 text-xs">
          <Button
            onClick={() => setMode("file")}
            className={`px-3 py-1 rounded-lg border transition ${
              mode === "file" ? "bg-primary text-white border-primary" : "border-border text-secondary hover:text-h2"
            }`}
          >
            Upload
          </Button>

          <Button
            onClick={() => setMode("text")}
            className={`px-3 py-1 rounded-lg border transition ${
              mode === "text" ? "bg-primary text-white border-primary" : "border-border text-secondary hover:text-h2"
            }`}
          >
            Paste
          </Button>
        </div>
      </div>

      {/* FILE MODE */}
      {mode === "file" && (
        <div
          onClick={() => fileRef.current?.click()}
          className="
            border border-dashed border-border
            rounded-xl p-10 text-center
            cursor-pointer hover:bg-surface-muted transition
          "
        >
          <Input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          <p className="text-body">Drop your CV or click to upload</p>
          <p className="text-caption text-xs mt-1">PDF supported</p>

          {uploadFile.isPending && <p className="text-primary text-xs mt-3">Uploading...</p>}
        </div>
      )}

      {/* TEXT MODE */}
      {mode === "text" && (
        <div className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your CV here..."
            rows={10}
            className="
              w-full bg-bg border border-border rounded-xl
              p-4 text-sm text-body
              focus:outline-none focus:border-primary/40
              transition
            "
          />

          <Button
            onClick={handleText}
            disabled={!text.trim() || uploadText.isPending}
            className="
              w-full px-4 py-3 rounded-xl
              bg-primary text-white text-sm font-semibold
              hover:bg-primary-hover transition
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {uploadText.isPending ? "Processing CV..." : "Save CV"}
          </Button>
        </div>
      )}

      {/* GLOBAL LOADING STATE */}
      {isUploading && <div className="text-xs text-secondary text-center">Processing your CV...</div>}
    </div>
  );
}
