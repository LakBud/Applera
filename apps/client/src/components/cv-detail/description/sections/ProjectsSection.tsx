import { ExternalLink } from 'lucide-react';

import { Card2 } from '../../../ui/card';
import { SectionHeading } from '../../../ui/section';

import type { CVDocument } from '@applera/schemas';

function normalizeUrl(url?: string) {
  const value = url?.trim();
  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

type Project = CVDocument['parsed']['projects'][number];

export function ProjectsSection({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return null;
  }

  return (
    <Card2 className="lg:col-span-12">
      <SectionHeading>
        <span className="text-primary">Projects</span>
      </SectionHeading>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {projects.map((project, i) => (
          <div
            key={i}
            className="
              rounded-md
              border
              border-border
              bg-white/30
              p-3
              hover:border-primary/30
              hover:shadow-sm
              transition
            "
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-tx-h3">{project.name}</span>

              {project.url && (
                <a
                  href={normalizeUrl(project.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline shrink-0 flex items-center gap-1"
                >
                  Visit
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Description */}
            {project.description && (
              <p className="text-xs text-tx-secondary mt-1">{project.description}</p>
            )}

            {/* Tech pills (aligned with SkillsSection style) */}
            {project.tech?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.tech.map((t: string) => (
                  <span
                    key={t}
                    className="
                      text-[11px]
                      px-2 py-0.5
                      rounded-md
                      bg-primary/10
                      text-primary
                      border border-primary/20
                    "
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card2>
  );
}
