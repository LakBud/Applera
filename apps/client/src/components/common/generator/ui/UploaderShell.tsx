import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { useUploaderHandlers, useUploaderState } from '../context/UploaderContext';
import { FileModePanel } from '../file/FileModePanel';
import { TextModePanel } from '../text/TextModePanel';

export function UploaderShell({
  label,
  placeholder,
  fileRef,
  showCvList,
  selectedCvId,
  onSelectCv,
  onDeselectCv,
}: {
  label: string;
  placeholder?: string | undefined;
  fileRef: React.RefObject<HTMLInputElement | null>;
  showCvList?: boolean;
  selectedCvId?: string | null;
  onSelectCv?: (id: string) => void;
  onDeselectCv?: () => void;
}) {
  const { mode } = useUploaderState();
  const { onModeChange } = useUploaderHandlers();

  const toggleItemClass =
    'text-[#166534] hover:text-tx-body hover:bg-transparent data-[state=on]:bg-white data-[state=on]:text-[#1fa028] data-[state=on]:shadow-sm text-xs px-3 md:px-4 py-2 rounded-full flex-1 md:flex-none';

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 flex flex-col gap-4 md:gap-5 md:h-122 bg-white/70 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-overline text-green-800">{label}</span>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => v && onModeChange(v as 'file' | 'text')}
          className="bg-[#1fa028]/20 rounded-full p-1 flex gap-1 w-full md:w-auto"
        >
          <ToggleGroupItem value="file" className={toggleItemClass}>
            Upload
          </ToggleGroupItem>
          <ToggleGroupItem value="text" className={toggleItemClass}>
            Paste
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div key={mode} className="animate-fade-in">
        {mode === 'file' && (
          <FileModePanel
            label={label}
            fileRef={fileRef}
            showCvList={showCvList}
            selectedCvId={selectedCvId}
            onSelectCv={onSelectCv}
            onDeselectCv={onDeselectCv}
          />
        )}
        {mode === 'text' && <TextModePanel label={label} placeholder={placeholder} />}
      </div>
    </div>
  );
}
