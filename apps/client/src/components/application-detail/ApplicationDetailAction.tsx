import { useState } from 'react';

import { Link } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';

import { STATUS_STYLES } from '@/utils/ui/statusStyles';

import { cn } from '../../lib/utils';
import { DeleteModal } from '../common/DeleteModal';
import { Loader } from '../common/Loader';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import type { ApplicationStatus } from '@repo/schemas';

type Props = {
  jobTitle?: string;
  status: ApplicationStatus;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
  onStatusChange: (status: ApplicationStatus) => void;
  onDelete: () => void;
};

export function ApplicationActionSection({
  jobTitle,
  status,
  isUpdatingStatus,
  isDeleting,
  onStatusChange,
  onDelete,
}: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-tx-muted flex-wrap">
        <Link to="/applications" className="hover:text-primary transition-colors">
          Applications
        </Link>

        <span className="text-tx-muted/50">›</span>

        <span className="text-tx-body font-medium truncate max-w-50 sm:max-w-50">
          {jobTitle ?? 'Untitled Role'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:justify-end w-full sm:w-auto">
        <Select value={status} disabled={isUpdatingStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="text-xs h-8 w-full sm:w-36 ring-[#c8dece]">
            <SelectValue>
              <span className={cn('font-medium', STATUS_STYLES[status]?.selectClass)}>
                {STATUS_STYLES[status]?.label ?? status}
              </span>
            </SelectValue>
          </SelectTrigger>

          <SelectContent
            position="popper"
            align="start"
            className="bg-[#f7fff5] ring-[#c8dece] w-36"
          >
            {Object.entries(STATUS_STYLES).map(([s, { label, selectClass }]) => (
              <SelectItem
                key={s}
                value={s}
                className={cn('text-xs font-medium cursor-pointer', selectClass)}
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant="outline"
          disabled={isDeleting}
          onClick={() => setShowDeleteModal(true)}
          className="text-black border-border hover:bg-black/10 shrink-0"
        >
          {isDeleting ? <Loader size="sm" /> : <Trash2 className="w-3.5 h-3.5" />}
        </Button>

        <DeleteModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          type="application"
          name={jobTitle}
          onConfirm={onDelete}
        />
      </div>
    </div>
  );
}
