import { Card2 } from '../../../ui/card';
import { SectionHeading } from '../../../ui/section';

export function SkillsSection({ skills }: { skills: string[] }) {
  if (!skills.length) return null;

  return (
    <Card2 className="lg:col-span-4">
      <SectionHeading>
        <span className="text-primary">Skills</span>
      </SectionHeading>

      <div className="flex flex-wrap gap-2 mt-3">
        {skills.slice(0, 14).map((skill) => (
          <span
            key={skill}
            className="
              px-2.5 py-1
              text-xs
              rounded-lg
              bg-primary/10
              text-primary
              border
              border-primary/20
            "
          >
            {skill}
          </span>
        ))}
      </div>
    </Card2>
  );
}
