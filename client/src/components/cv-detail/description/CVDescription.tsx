import type { CVParsed } from '../../../api';

import { SummarySection } from './sections/SummarySection';
import { SkillsSection } from './sections/SkillsSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { ProjectsSection } from './sections/ProjectsSection';

export function CVDescription({ parsed }: { parsed: CVParsed }) {
  const skills = parsed.skills ?? [];
  const experience = parsed.experience ?? [];
  const education = parsed.education ?? [];
  const projects = parsed.projects ?? [];

  const hasContent =
    parsed.summary || skills.length || experience.length || education.length || projects.length;

  if (!hasContent) {
    return (
      <div className="text-center py-12 text-tx-muted text-sm">
        No content extracted from this CV yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-12 animate-fade-in">
      <SummarySection summary={parsed.summary} />
      <SkillsSection skills={skills} />
      <ExperienceSection experience={experience} />
      <EducationSection education={education} />
      <ProjectsSection projects={projects} />
    </div>
  );
}
