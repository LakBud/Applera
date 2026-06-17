import type { CVDocument } from '@/api/cv/cv.schemas';

import { Card2 } from '../../../ui/card';
import { SectionHeading } from '../../../ui/section';

type Experience = CVDocument['parsed']['experience'][number];

export function ExperienceSection({ experience }: { experience: Experience[] }) {
  if (!experience.length) return null;

  return (
    <Card2 className="lg:col-span-8">
      <SectionHeading>
        <span className="text-primary">Experience</span>
      </SectionHeading>

      <div className="mt-4 space-y-5">
        {experience.map((exp, i) => (
          <div key={i} className="relative pl-5 border-l-2 border-primary/20">
            <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-primary animate-pulse-green" />

            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-semibold text-tx-h3">
                {exp.title ?? 'Untitled role'}
              </span>

              {exp.company && <span className="text-xs text-primary/70">{exp.company}</span>}
            </div>

            {exp.highlights?.length > 0 && (
              <ul className="mt-2 space-y-1">
                {exp.highlights.map((h: string, j: number) => (
                  <li key={j} className="text-xs text-tx-secondary">
                    • {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Card2>
  );
}
