import { useRef, useState } from 'react';

import type {
  UploaderHandlers,
  UploaderState,
} from '@/components/common/generator/context/UploaderContext';

import type { UseMutationResult } from '@tanstack/react-query';

type UploadFileMutation<T> = UseMutationResult<T, Error, File>;
type UploadTextMutation<T> = UseMutationResult<T, Error, string>;

export function useUploader<T>({
  uploadFile,
  uploadText,
  onSuccess,
  getId,
  onDeselectCv,
  selectedCvId,
}: {
  uploadFile: UploadFileMutation<T>;
  uploadText: UploadTextMutation<T>;
  onSuccess?: (id?: string) => void;
  getId: (res: T) => string | undefined;
  onDeselectCv?: () => void;
  selectedCvId?: string | null;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [uploadedId, setUploadedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUploading = uploadFile.isPending || uploadText.isPending;
  const isSelected = !!uploadedId || !!selectedCvId;

  function validateAndHandleFile(file: File) {
    const isPdf =
      file.type === 'application/pdf' ||
      // file.type can be empty for drag-and-drop on some browsers/OSes;
      // fall back to extension check in that case only.
      (!file.type && file.name.toLowerCase().endsWith('.pdf'));

    if (!isPdf) {
      setError('Only PDFs are supported');
      return;
    }
    setError(null);
    handleFile(file);
  }

  function handleClear() {
    setUploadedId(null);
    onDeselectCv?.();
    onSuccess?.(undefined);
  }

  async function handleFile(file: File) {
    onDeselectCv?.();
    try {
      const res = await uploadFile.mutateAsync(file);
      const id = getId(res);
      setUploadedId(id ?? null);
      onSuccess?.(id);
    } catch {
      // error exposed via mutation state
    }
  }

  async function handleText() {
    if (!text.trim()) {
      return;
    }
    onDeselectCv?.();
    try {
      const res = await uploadText.mutateAsync(text);
      const id = getId(res);
      setUploadedId(id ?? null);
      onSuccess?.(id);
      setText('');
    } catch {
      // error exposed via mutation state
    }
  }

  const state: UploaderState = {
    isUploading,
    isSelected,
    isDragging,
    error,
    text,
    mode,
  };

  const handlers: UploaderHandlers = {
    onZoneClick() {
      if (!isUploading && !isSelected) {
        setError(null);
        fileRef.current?.click();
      }
    },
    onDragOver(e) {
      e.preventDefault();
      if (!isUploading && !isSelected) {
        setIsDragging(true);
        setError(null);
      }
    },
    onDragLeave() {
      setIsDragging(false);
    },
    onDrop(e) {
      e.preventDefault();
      setIsDragging(false);
      if (isUploading || isSelected) {
        return;
      }
      const file = e.dataTransfer.files?.[0];
      if (file) {
        validateAndHandleFile(file);
      }
    },
    onPickerChange(e) {
      const file = e.target.files?.[0];
      if (file) {
        validateAndHandleFile(file);
      }
      e.target.value = '';
    },
    onClear: handleClear,
    onClearClick(e) {
      e.stopPropagation();
      handleClear();
    },
    onTextChange: setText,
    onTextSubmit: handleText,
    onModeChange: setMode,
    onCvSelect(id, onSelectCv) {
      setUploadedId(null);
      setError(null);
      onSelectCv?.(id);
    },
  };

  return { state, handlers, fileRef };
}
