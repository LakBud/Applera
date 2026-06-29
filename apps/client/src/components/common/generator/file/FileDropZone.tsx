import { CircleX } from 'lucide-react';

import { Input } from '../../../ui/input';
import { useUploaderHandlers, useUploaderState } from '../context/UploaderContext';
import { UploadSuccess } from '../ui/UploadSuccess';

import { cn } from '@/lib/utils';

export function FileDropZone({
  label,
  fileRef,
}: {
  label: string;
  fileRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { isUploading, isSelected, isDragging, error } = useUploaderState();
  const { onZoneClick, onDragOver, onDragLeave, onDrop, onPickerChange, onClear, onClearClick } =
    useUploaderHandlers();
  return (
    <div
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="button"
      tabIndex={0}
      onClick={onZoneClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onZoneClick();
        }
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      aria-disabled={isUploading || isSelected}
      className={cn(
        'border min-h-44 md:h-64 p-6 md:p-10 border-dashed rounded-xl text-center transition w-full flex flex-col justify-start',
        isUploading && 'opacity-60 cursor-not-allowed',
        isSelected && 'border-green-600 bg-green-50 cursor-default',
        !isSelected && !isUploading && 'cursor-pointer hover:bg-surface-muted',
        isDragging && 'border-green-600 bg-green-50 scale-[1.01]',
      )}
    >
      <Input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={onPickerChange} />

      {isSelected ? (
        <UploadSuccess label={label} onClear={onClear} onClick={onClearClick} />
      ) : (
        <div className="flex flex-col items-center justify-start pt-4 md:pt-8 -translate-y-2">
          <p className="text-body">
            {isUploading
              ? 'Uploading...'
              : isDragging
                ? `Drop your ${label.toLowerCase()} here`
                : `Drop your ${label.toLowerCase()} or click to upload`}
          </p>

          {error ? (
            <span className="flex items-center gap-1 text-caption text-xs mt-1">
              <CircleX className="w-3 h-3" />
              {error}
            </span>
          ) : (
            <p className="text-caption text-xs mt-1">PDF supported</p>
          )}
        </div>
      )}
    </div>
  );
}
