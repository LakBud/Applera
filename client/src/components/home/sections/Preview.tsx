import PreviewMock from '../PreviewMock';

export default function PreviewSection() {
  return (
    <section className="px-6 py-20 w-full border-t border-border bg-surface-muted">
      <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1.5fr] gap-12 items-center">
        <div className="space-y-5">
          <span className="text-overline text-h1">Preview</span>

          <h2 className="font-display text-3xl md:text-4xl text-tx-h2 leading-tight">
            See what you get
            <br />
            <span className="text-h1">before you try it</span>
          </h2>

          <p className="text-secondary text-sm leading-relaxed max-w-sm">
            The match score gives you an instant read on your strengths and gaps. Keywords and
            missing requirements are surfaced clearly.
          </p>

          <a
            href="#"
            className="inline-block text-sm font-semibold text-secondary bg-primary hover:scale-98 duration-300 px-6 py-2.5 transition ease-out"
          >
            Try it yourself →
          </a>
        </div>

        <PreviewMock />
      </div>
    </section>
  );
}
