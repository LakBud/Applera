import { Trash2 } from 'lucide-react';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

type DeleteType = 'cv' | 'application';

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: DeleteType;
  name?: string;
  onConfirm: () => void;
}

const config: Record<DeleteType, { title: string; description: (name?: string) => string }> = {
  cv: {
    title: 'Delete CV',
    description: (name?) =>
      `Are you sure you want to delete "${name}"? This CV will be permanently removed and cannot be recovered.`,
  },
  application: {
    title: 'Delete Application',
    description: (name?) =>
      `Are you sure you want to delete your application to "${name}"? This action cannot be undone.`,
  },
};

export function DeleteModal({ open, onOpenChange, type, name, onConfirm }: DeleteModalProps) {
  const { title, description } = config[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#f7fff5] ring-[#c8dece]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1 bg-[f7fff5]">
            <div className="flex items-center justify-center w-9 h-9 rounded-md border bg-black/5">
              <Trash2 className="w-4 h-4 text-black" />
            </div>
            <DialogTitle className="text-tx-h2 text-green-900 bold">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-tx-secondary text-sm leading-relaxed">
            {description(name)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="text-green-700"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
