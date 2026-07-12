import { useState } from 'react';

import { Briefcase, Building2, Calendar, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

import { ApplicationAccordion } from '../ui/accordion';
import { Button } from '../ui/button';
import { SectionHeading } from '../ui/section';

type JobParsed = {
  title?: string;
  required_skills?: string[];
  responsibilities?: string[];
  seniority?: string;
  location?: string;
};

type Props = {
  company?: string;
  location?: string;
  rawText?: string;
  parsed?: JobParsed;
  createdAt?: string;
};

export function JobListingSection({ company, location, rawText, parsed, createdAt }: Props) {
  const [showRaw, setShowRaw] = useState(false);
  const resolvedLocation = location ?? parsed?.location;

  return (
    <ApplicationAccordion title="Job listing">
      <div className="p-4 sm:p-5 space-y-6">
        {/* Title + meta */}
        <div className="space-y-2">
          {parsed?.title && (
            <p className="text-sm sm:text-base font-medium text-green-700 wrap-break-words">
              {parsed.title}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {company && (
              <span className="flex items-center gap-1 text-tx-secondary min-w-0">
                <Building2 className="w-3 h-3 shrink-0" />
                <span className="wrap-break-words">{company}</span>
              </span>
            )}

            {resolvedLocation && (
              <span className="flex items-center gap-1 text-tx-secondary min-w-0">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="wrap-break-words">{resolvedLocation}</span>
              </span>
            )}

            {parsed?.seniority && parsed.seniority !== 'unknown' && (
              <span className="flex items-center gap-1 text-tx-secondary">
                <Briefcase className="w-3 h-3 shrink-0" />
                <span className="capitalize">{parsed.seniority}</span>
              </span>
            )}

            {createdAt && (
              <span className="flex items-center gap-1 text-tx-caption">
                <Calendar className="w-3 h-3 shrink-0" />
                <span>
                  {new Date(createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Skills */}
        {(parsed?.required_skills?.length ?? 0) > 0 && (
          <div className="space-y-2">
            <SectionHeading>Required skills</SectionHeading>

            <div className="flex flex-wrap gap-2">
              {parsed?.required_skills?.map((skill) => (
                <span
                  key={skill}
                  className="
                    text-xs px-2 py-1
                    border border-border
                    rounded-md
                    bg-surface-muted
                    text-tx-secondary
                    wrap-break-words
                  "
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Responsibilities */}
        {(parsed?.responsibilities?.length ?? 0) > 0 && (
          <div className="space-y-2">
            <SectionHeading>Responsibilities</SectionHeading>

            <ul className="space-y-2">
              {parsed?.responsibilities?.map((r, i) => (
                <li
                  key={i}
                  className="text-xs sm:text-sm text-tx-muted flex items-start gap-2 leading-relaxed"
                >
                  <span className="shrink-0 text-tx-caption">•</span>
                  <span className="wrap-break-word">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Raw description */}
        {rawText && (
          <div className="space-y-3">
            <Button
              onClick={() => setShowRaw((v) => !v)}
              className="
                  flex items-center gap-1
                  text-xs
                  text-tx-muted hover:text-tx-body
                  transition-colors
                  px-0 py-0
                  min-h-0
                  h-auto
                  font-normal break-all"
            >
              {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}

              <span>{showRaw ? 'Hide' : 'Show'} full description</span>
            </Button>

            {showRaw && (
              <pre
                className="
                whitespace-pre-wrap
                text-xs sm:text-sm
                text-tx-muted
                leading-relaxed
                border border-border
                rounded-md
                p-3 sm:p-4
                bg-surface-muted
                wrap-break-words
              "
              >
                {rawText}
              </pre>
            )}
          </div>
        )}
      </div>
    </ApplicationAccordion>
  );
}
