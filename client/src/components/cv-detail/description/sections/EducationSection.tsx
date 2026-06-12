import { Card2 } from '../../../ui/card';
import { SectionHeading } from '../../../ui/section';

export function EducationSection({ education }: { education: any[] }) {
  if (!education.length) return null;

  return (
    <Card2 className="lg:col-span-4">
      <SectionHeading>
        <span className="text-primary">Education</span>
      </SectionHeading>

      <div className="mt-3 space-y-3">
        {education.map((edu, i) => (
          <div key={i}>
            <div className="text-sm font-medium text-tx-body">{edu.title}</div>
            {edu.school && <div className="text-xs text-tx-muted">{edu.school}</div>}
          </div>
        ))}
      </div>
    </Card2>
  );
}
