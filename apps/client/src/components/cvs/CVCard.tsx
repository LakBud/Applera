import { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { FileText, Pin } from 'lucide-react';

import { useDeleteCV } from '../../api';
import { DeleteModal } from '../common/DeleteModal';
import { Button } from '../ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

import { useAuthenticatedCVImage } from '@/hooks/common/useAuthenticatedCVImage';
import type { CVDocument } from '@repo/schemas';

type CVCardProps = {
  cv: CVDocument;
  onPin?: () => void;
  isPinning?: boolean;
  canPin?: boolean; // true when limit reached and this cv is not pinned
};

export function CVCard({ cv, onPin, isPinning, canPin }: CVCardProps) {
  const del = useDeleteCV();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const latestExp = cv.parsed.experience?.[0];
  const topSkills =
    cv.parsed.skills?.reduce<string[]>((acc, skill) => {
      const total = acc.join('').length + skill.length;
      return total < 60 ? [...acc, skill] : acc;
    }, []) ?? [];

  const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString() : '');

  const showSeniority = cv.parsed.seniority_level && cv.parsed.seniority_level !== 'unknown';
  const previewSrc = useAuthenticatedCVImage(cv.previewUrl ?? null);

  return (
    <Card
      style={{ '--tw-ring-color': '#1fa028' } as React.CSSProperties}
      onClick={() => navigate({ to: '/cvs/$cvId', params: { cvId: cv._id } })}
      className="w-full h-full hover:shadow-md transition cursor-pointer group bg-white/40 overflow-hidden flex flex-col ring-1 animate-fade-in-up"
    >
      {/* IMAGE */}
      <div className="w-full h-56 border-b overflow-hidden bg-muted flex items-center justify-center">
        {previewSrc ? (
          <img
            src={previewSrc}
            alt="CV preview"
            className="w-full h-full object-cover object-top block"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="w-10 h-10 opacity-30" />
            <span className="text-xs opacity-50">{cv.parsed?.name || 'No preview'}</span>
          </div>
        )}
      </div>

      {/* HEADER */}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle style={{ color: '#1fa028' }}>{cv.parsed.name || 'Untitled CV'}</CardTitle>

            <CardDescription style={{ color: '#1fa028', opacity: 0.7 }}>
              Updated {formatDate(cv.updatedAt)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            {showSeniority && (
              <span className="text-xs px-2 py-1 rounded-full bg-muted whitespace-nowrap capitalize text-[#1fa028] font-normal">
                {cv.parsed.seniority_level}
              </span>
            )}

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPin?.();
              }}
              disabled={isPinning || canPin}
              title={canPin ? 'Unpin a CV first' : cv.pinned ? 'Unpin' : 'Pin'}
              className={`p-1.5 rounded-md transition
                ${cv.pinned ? 'text-green-600 bg-green-50' : 'text-muted-foreground hover:text-foreground'}
                ${canPin ? 'opacity-30 cursor-not-allowed' : ''}
              `}
            >
              <Pin
                className={`w-3.5 h-3.5 transition-transform duration-200 ${cv.pinned ? 'scale-110' : 'scale-100'}`}
                fill={cv.pinned ? 'currentColor' : 'none'}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-4 flex-1 overflow-hidden">
        {/* Skills */}
        {topSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {topSkills.map((skill, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-md bg-muted text-tx-secondary border border-rounded-2xl"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground justify-between">
          <div className="flex items-center gap-2">
            {cv.applicationsCount !== undefined && (
              <span className="flex items-center gap-2">
                Used in {cv.applicationsCount} application
                {cv.applicationsCount !== 1 ? 's' : ''}
              </span>
            )}

            {cv.applicationsCount !== undefined && latestExp && <span>·</span>}

            {latestExp && cv.parsed.experience.length > 0 && (
              <span className="flex items-center gap-2">
                {cv.parsed.experience.length} experience
                {cv.parsed.experience.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex justify-between">
        {/* IMPORTANT: prevent navigation on delete */}

        <Button
          type="button"
          variant="outline"
          className="text-green-900"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteModal(true);
          }}
        >
          Delete
        </Button>

        <DeleteModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          type="cv"
          name={cv.parsed?.name}
          onConfirm={() => del.mutate(cv._id)}
        />

        <CardAction className="pt-1">
          <span style={{ color: '#1fa028', opacity: 1 }} className="text-xs">
            Click to view →
          </span>
        </CardAction>
      </CardFooter>
    </Card>
  );
}
