import type { CVParsed } from "../../api";
import { SectionDivider, SectionHeading } from "./CVContent";

interface CVContentTabProps {
  parsed: CVParsed;
}

export function CVContentTab({ parsed }: CVContentTabProps) {
  const skills = parsed.skills ?? [];
  const hasContent = parsed.summary || skills.length || parsed.experience?.length || parsed.projects?.length;

  if (!hasContent) {
    return <div className="text-center py-12 text-tx-muted text-sm">No content extracted from this CV yet.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {parsed.summary && (
        <div>
          <SectionHeading>Summary</SectionHeading>
          <p className="text-sm text-tx-body leading-relaxed font-display">{parsed.summary}</p>
        </div>
      )}

      {parsed.summary && skills.length > 0 && <SectionDivider />}

      {/* Skills — flat string[], no pills */}
      {skills.length > 0 && (
        <div>
          <SectionHeading>Skills</SectionHeading>
          <p className="text-sm text-tx-body leading-relaxed">{skills.join(", ")}</p>
        </div>
      )}

      {skills.length > 0 && parsed.experience.length > 0 && <SectionDivider />}

      {/* Experience */}
      {parsed.experience.length > 0 && (
        <div>
          <SectionHeading>Experience</SectionHeading>
          <div className="space-y-5">
            {parsed.experience.map((exp, i) => (
              <div
                key={i}
                className="pl-3 border-l-2 border-border hover:border-primary/40 transition-colors"
                style={{ borderRadius: 0 }}
              >
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-tx-h3">{exp.title ?? "Untitled role"}</span>
                  {exp.company && (
                    <>
                      <span className="text-tx-muted text-xs">·</span>
                      <span className="text-xs text-tx-secondary">{exp.company}</span>
                    </>
                  )}
                </div>

                {exp.highlights.length > 0 &&
                  (exp.highlights.length === 1 ? (
                    <p className="text-xs text-tx-secondary leading-relaxed mt-1">{exp.highlights[0]}</p>
                  ) : (
                    <ul className="mt-1 space-y-0.5">
                      {exp.highlights.map((h, j) => (
                        <li key={j} className="text-xs text-tx-secondary leading-relaxed flex gap-1.5">
                          <span className="text-tx-muted select-none mt-0.5">–</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {parsed.experience.length > 0 && parsed.education.length > 0 && <SectionDivider />}

      {/* Education */}
      {parsed.education.length > 0 && (
        <div>
          <SectionHeading>Education</SectionHeading>
          <div className="space-y-2.5">
            {parsed.education.map((edu, i) => (
              <div key={i} className="flex gap-3 items-baseline">
                <span className="text-sm font-medium text-tx-body">{edu.title}</span>
                {edu.school && (
                  <>
                    <span className="text-tx-muted text-xs">·</span>
                    <span className="text-xs text-tx-muted">{edu.school}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {parsed.education.length > 0 && parsed.projects.length > 0 && <SectionDivider />}

      {/* Projects */}
      {parsed.projects.length > 0 && (
        <div>
          <SectionHeading>Projects</SectionHeading>
          <div className="space-y-4">
            {parsed.projects.map((project, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-tx-h3">{project.name}</span>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-tx-muted hover:text-primary transition-colors"
                    >
                      ↗
                    </a>
                  )}
                </div>
                {project.description && <p className="text-xs text-tx-secondary leading-relaxed mt-0.5">{project.description}</p>}
                {project.tech.length > 0 && <p className="text-[11px] text-tx-muted mt-1">{project.tech.join(" · ")}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
