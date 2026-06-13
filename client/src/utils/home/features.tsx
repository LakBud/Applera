import { BarChart2, FileText, Mail } from 'lucide-react';

export const FEATURES = ['Cover letter', 'Match score', 'Email draft', 'CV summary'];

export const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Paste your CV',
    desc: 'Copy the text from your existing CV — no formatting required.',
  },
  {
    n: '02',
    title: 'Paste the job listing',
    desc: 'Grab the text from the job posting. More detail means better tailoring.',
  },
  {
    n: '03',
    title: 'Get your tailored application',
    desc: 'The AI writes a cover letter, analyses the match, and drafts an email.',
  },
];

export const WHAT_YOU_GET = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Cover letter',
    desc: 'Tailored to the role and written in your tone — ready to send.',
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: 'Match analysis',
    desc: "A score, matched keywords, and an honest look at what you cover — and what you're missing.",
  },
  {
    icon: <Mail className="w-5 h-5" />,
    title: 'Email draft',
    desc: 'A short, professional email to send directly to the hiring manager.',
  },
];
