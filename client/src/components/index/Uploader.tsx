import type { UseMutationResult } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

type UploadFileMutation = UseMutationResult<any, Error, File>;
type UploadTextMutation = UseMutationResult<any, Error, string>;

type Props = {
  label: string;
  placeholder?: string;
  uploadFile: UploadFileMutation;
  uploadText: UploadTextMutation;
  onSuccess?: (id?: string) => void;
  getId: (res: any) => string | undefined;
};

export default function Uploader({ label, placeholder = "Paste text here...", uploadFile, uploadText, onSuccess, getId }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"file" | "text">("file");

  const isUploading = uploadFile.isPending || uploadText.isPending;

  async function handleFile(file: File) {
    try {
      const res = await uploadFile.mutateAsync(file);
      onSuccess?.(getId(res));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleText() {
    if (!text.trim()) return;
    try {
      const res = await uploadText.mutateAsync(text);
      onSuccess?.(getId(res));
      setText("");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-5 h-120 bg-white/70">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <span className="text-overline text-green-800">{label}</span>

        <div className="flex gap-2 text-xs">
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => v && setMode(v as "file" | "text")}
            className="bg-[#1fa028]/20 rounded-full p-0.75 gap-0.5"
          >
            <ToggleGroupItem
              value="file"
              className="text-xs px-4 py-1.5 rounded-full text-[#166534]
               hover:text-body hover:bg-transparent
               data-[state=on]:bg-white data-[state=on]:text-[#1fa028]
               data-[state=on]:shadow-sm"
            >
              Upload
            </ToggleGroupItem>
            <ToggleGroupItem
              value="text"
              className="text-xs px-4 py-1.5 rounded-full text-[#166534]
               hover:text-body hover:bg-transparent
               data-[state=on]:bg-white data-[state=on]:text-[#1fa028]
               data-[state=on]:shadow-sm"
            >
              Paste
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* FILE MODE */}
      {mode === "file" && (
        <div
          onClick={() => !isUploading && fileRef.current?.click()}
          className={`
            border h-80 border-dashed border-border rounded-xl p-10 text-center transition
            ${isUploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-surface-muted"}
          `}
        >
          <Input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <p className="text-body">
            {uploadFile.isPending ? "Uploading..." : `Drop your ${label.toLowerCase()} or click to upload`}
          </p>
          <p className="text-caption text-xs mt-1">PDF supported</p>
        </div>
      )}

      {/* TEXT MODE */}
      {mode === "text" && (
        <div className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={10}
            disabled={isUploading}
            className="
              w-full h-80 bg-bg border border-border rounded-xl
              p-4 text-sm text-body
              focus:outline-none focus:border-primary/40
              disabled:opacity-60 transition
            "
          />

          <Button
            type="button"
            onClick={handleText}
            disabled={!text.trim() || uploadText.isPending}
            className="
              w-full px-4 py-3 rounded-md
              btn-secondary text-white text-sm font-semibold
              hover:bg-primary-hover transition
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {uploadText.isPending ? `Processing ${label.toLowerCase()}...` : `Save ${label}`}
          </Button>
        </div>
      )}
    </div>
  );
}
