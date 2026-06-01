import type { UseMutationResult } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";
import { CvList } from "./CVList";
import { toast } from "sonner";
import { Check } from "lucide-react";

type UploadFileMutation = UseMutationResult<any, Error, File>;
type UploadTextMutation = UseMutationResult<any, Error, string>;

type Props = {
  label: string;
  placeholder?: string;
  uploadFile: UploadFileMutation;
  uploadText: UploadTextMutation;
  onSuccess?: (id?: string) => void;
  getId: (res: any) => string | undefined;
  showCvList?: boolean;
  onSelectCv?: (id: string) => void;
  onDeselectCv?: () => void;
  selectedCvId?: string | null;
};

export default function Uploader({
  label,
  placeholder = "Paste text here...",
  uploadFile,
  uploadText,
  onSuccess,
  getId,
  showCvList,
  onSelectCv,
  onDeselectCv,
  selectedCvId,
}: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"file" | "text">("file");
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  const isUploading = uploadFile.isPending || uploadText.isPending;
  const isSelected = !!uploadedId || !!selectedCvId;

  function handleClear() {
    setUploadedId(null);
    onDeselectCv?.();
    onSuccess?.(undefined);
  }

  async function handleFile(file: File) {
    try {
      onDeselectCv?.(); // clear any list selection
      const res = await uploadFile.mutateAsync(file);
      const id = getId(res);
      setUploadedId(id ?? null);
      onSuccess?.(id);
      toast.success(`${label} uploaded successfully`);
    } catch (err) {
      toast.error(`Failed to upload ${label.toLowerCase()}`);
    }
  }

  async function handleText() {
    if (!text.trim()) return;
    try {
      onDeselectCv?.(); // clear any list selection
      const res = await uploadText.mutateAsync(text);
      const id = getId(res);
      setUploadedId(id ?? null);
      onSuccess?.(id);
      setText("");
      toast.success(`${label} saved successfully`);
    } catch (err) {
      toast.error(`Failed to save ${label.toLowerCase()}`);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-5 h-122 bg-white/70">
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
              className="text-xs px-4 py-1.5 rounded-full text-[#166534] hover:text-tx-body hover:bg-transparent data-[state=on]:bg-white data-[state=on]:text-[#1fa028] data-[state=on]:shadow-sm"
            >
              Upload
            </ToggleGroupItem>
            <ToggleGroupItem
              value="text"
              className="text-xs px-4 py-1.5 rounded-full text-[#166534] hover:text-tx-body hover:bg-transparent data-[state=on]:bg-white data-[state=on]:text-[#1fa028] data-[state=on]:shadow-sm"
            >
              Paste
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* FILE MODE */}
      {mode === "file" && (
        <div className="space-y-4">
          <div
            onClick={() => !isUploading && !isSelected && fileRef.current?.click()}
            className={`
              border h-64 border-dashed rounded-xl p-10 text-center transition
              ${isUploading ? "opacity-60 cursor-not-allowed" : ""}
              ${isSelected ? "border-green-600 bg-green-50 cursor-default" : "border-border cursor-pointer hover:bg-surface-muted"}
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
            {isSelected ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center border-2 border-green-600">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-green-800 font-medium">{label} saved</p>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <p className="text-body">
                  {uploadFile.isPending ? "Uploading..." : `Drop your ${label.toLowerCase()} or click to upload`}
                </p>
                <p className="text-caption text-xs mt-1">PDF supported</p>
              </>
            )}
          </div>

          {showCvList && (
            <CvList
              onSelectCv={(id) => {
                setUploadedId(null);
                onSelectCv?.(id);
              }}
              onDeselectCv={onDeselectCv}
              selectedCvId={selectedCvId}
            />
          )}
        </div>
      )}

      {/* TEXT MODE */}
      {mode === "text" && (
        <div className="space-y-3">
          {isSelected ? (
            <div className="border border-green-600 bg-green-50 rounded-xl p-6 text-center h-80 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center border-2 border-green-600 mb-3">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-green-800 font-medium">{label} saved</p>
              <Button
                type="button"
                onClick={handleClear}
                className="text-xs text-muted-foreground underline mt-1 hover:text-foreground"
              >
                Remove
              </Button>
            </div>
          ) : (
            <>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                rows={10}
                disabled={isUploading}
                className="w-full h-80 bg-bg border border-border rounded-xl p-4 text-sm text-body focus:outline-none focus:border-primary/40 disabled:opacity-60 transition"
              />
              <Button
                type="button"
                onClick={handleText}
                disabled={!text.trim() || uploadText.isPending}
                className="w-full px-4 py-3 rounded-md btn-secondary text-white text-sm font-semibold hover:bg-primary-hover transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {uploadText.isPending ? `Processing ${label.toLowerCase()}...` : `Save ${label}`}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
