import { Card2 } from '../../../ui/card';
import { SectionHeading } from '../../../ui/section';

export function SummarySection({ summary }: { summary?: string }) {
  if (!summary) {
    return null;
  }

  return (
    <Card2 className="lg:col-span-8">
      <SectionHeading>
        <span className="text-primary">Summary</span>
      </SectionHeading>

      <p className="text-sm text-green-800 font-semibold">{summary}</p>
    </Card2>
  );
}
