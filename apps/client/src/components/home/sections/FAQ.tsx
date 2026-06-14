import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';

const FAQ = [
  {
    q: 'Is my data stored?',
    a: 'Yes. Your CVs and generated applications are securely saved to your account so you can reuse them anytime from your dashboard. You can delete everything, including your account, at any time.',
  },
  {
    q: 'What language is the application written in?',
    a: 'It automatically matches the job listing. English job → English application, Norwegian job → Norwegian application, and so on.',
  },
  {
    q: 'How does the match score work?',
    a: 'It compares your CV against the job description using skills, keywords, and experience. It highlights your strengths and gaps — not to decide your eligibility, but to help you apply smarter.',
  },
  {
    q: 'Can I use the generated cover letter directly?',
    a: 'Yes, but we recommend reviewing and adjusting it so it reflects your own voice. The AI gives you a strong draft — the finishing touches are yours.',
  },
  {
    q: 'Do I need to upload my CV every time?',
    a: 'No. Once uploaded, your CV is saved to your account and automatically available for future applications.',
  },
  {
    q: 'What AI model powers Applera?',
    a: 'Applera uses a large language model via Groq for fast, high-quality generation of cover letters, application emails, and match analysis.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. You can get started for free with core features included. No credit card required.',
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="px-2 py-20 border-t border-border ">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12 space-y-2">
          <span className="text-overline text-h1">Questions</span>
          <h2 className="font-display text-3xl md:text-4xl text-h2">FAQ</h2>
        </div>

        <div className="bg-surface border border-border rounded-2xl px-6 bg-white/70">
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-sm font-medium text-h2">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-secondary leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
