import { useUploaderHandlers } from '../context/UploaderContext';
import { CvList } from '../cv/CVList';
import { FileDropZone } from './FileDropZone';

export function FileModePanel({
  label,
  fileRef,
  showCvList,
  selectedCvId,
  onSelectCv,
  onDeselectCv,
}: {
  label: string;
  fileRef: React.RefObject<HTMLInputElement | null>;
  showCvList?: boolean;
  selectedCvId?: string | null;
  onSelectCv?: (id: string) => void;
  onDeselectCv?: () => void;
}) {
  const { onCvSelect } = useUploaderHandlers();

  return (
    <div className="space-y-4">
      <FileDropZone label={label} fileRef={fileRef} />

      {showCvList && (
        <div className="mt-4 md:mt-0">
          <CvList
            onSelectCv={(id) => onCvSelect(id, onSelectCv)}
            onDeselectCv={onDeselectCv}
            selectedCvId={selectedCvId}
          />
        </div>
      )}
    </div>
  );
}
