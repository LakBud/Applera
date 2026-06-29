import { createContext, useContext } from 'react';

export type UploaderState = {
  isUploading: boolean;
  isSelected: boolean;
  isDragging: boolean;
  error: string | null;
  text: string;
  mode: 'file' | 'text';
};

export type UploaderHandlers = {
  onZoneClick: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onPickerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onClearClick: (e: React.MouseEvent) => void;
  onTextChange: (text: string) => void;
  onTextSubmit: () => void;
  onModeChange: (mode: 'file' | 'text') => void;
  onCvSelect: (id: string, onSelectCv?: (id: string) => void) => void;
};

export const UploaderStateContext = createContext<UploaderState | null>(null);
export const UploaderHandlersContext = createContext<UploaderHandlers | null>(null);

export function useUploaderState() {
  const ctx = useContext(UploaderStateContext);
  if (!ctx) {
    throw new Error('useUploaderState must be used within UploaderStateProvider');
  }
  return ctx;
}

export function useUploaderHandlers() {
  const ctx = useContext(UploaderHandlersContext);
  if (!ctx) {
    throw new Error('useUploaderHandlers must be used within UploaderHandlersProvider');
  }
  return ctx;
}
