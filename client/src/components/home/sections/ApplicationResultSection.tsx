import PreviewMock from '../PreviewMock';
import ApplicationResult from '../application/ApplicationResult';
import type { HomeState } from './Generator';

type Props = {
  state: HomeState;
};

export default function ApplicationResultSection({ state }: Props) {
  const { result, isPending } = state;

  return (
    <section className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        {/* Section header */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-overline text-h1">Output</span>
            <h2 className="font-display text-3xl text-h2">Your application</h2>
          </div>
        </div>

        {/* Result / empty / loading state */}
        {result ? (
          <ApplicationResult data={result} />
        ) : (
          <PreviewMock skeleton={isPending || !result} />
        )}
      </div>
    </section>
  );
}
