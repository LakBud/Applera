import { UploaderHandlersProvider, UploaderStateProvider } from './context/UploaderProvider';
import { UploaderShell } from './ui/UploaderShell';

import { useUploader } from '@/hooks/common/useUploader';
import type { UseMutationResult } from '@tanstack/react-query';

type UploaderProps<T> = {
  label: string;
  placeholder?: string;
  uploadFile: UseMutationResult<T, Error, File>;
  uploadText: UseMutationResult<T, Error, string>;
  onSuccess?: (id?: string) => void;
  getId: (res: T) => string | undefined;
  showCvList?: boolean;
  onSelectCv?: (id: string) => void;
  onDeselectCv?: () => void;
  selectedCvId?: string | null;
};

export default function Uploader<T>(props: UploaderProps<T>) {
  const { state, handlers, fileRef } = useUploader(props);

  return (
    <UploaderStateProvider value={state}>
      <UploaderHandlersProvider value={handlers}>
        <UploaderShell
          label={props.label}
          placeholder={props.placeholder}
          fileRef={fileRef}
          showCvList={props.showCvList}
          selectedCvId={props.selectedCvId}
          onSelectCv={props.onSelectCv}
          onDeselectCv={props.onDeselectCv}
        />
      </UploaderHandlersProvider>
    </UploaderStateProvider>
  );
}
