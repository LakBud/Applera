import { BulletList, LegalPage } from '../components/ui/legalPage';

export function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="July 2026"
      intro="By using Applera, you agree to these terms. If you disagree with any part, please do not use the service. This policy is effective as of July 2026."
      sections={[
        {
          title: 'What Applera Does',
          content: (
            <p>
              Applera is an AI-powered job application tool. You provide a CV and a job listing, and
              the service generates a tailored cover letter, match score, CV summary, email draft,
              and interview preparation materials.
            </p>
          ),
        },
        {
          title: 'Eligibility',
          content: (
            <p>
              You must be at least 16 years old to use Applera. By using the service, you represent
              that you meet this requirement and that any information you provide is accurate.
            </p>
          ),
        },
        {
          title: 'AI Disclaimer',
          content: (
            <p>
              All output is generated using a third-party AI model (currently provided by Groq) and
              may be inaccurate, incomplete, biased, or unsuitable for your specific situation. We
              do not control and are not responsible for the underlying model's behavior. You are
              responsible for reviewing all content before sending it to employers. Applera makes no
              guarantees about the quality or effectiveness of generated content.
            </p>
          ),
        },
        {
          title: 'Acceptable Use',
          content: (
            <>
              <p className="mb-3">
                You may use Applera for personal job applications. You may not:
              </p>
              <BulletList
                items={[
                  'Use the service for illegal purposes',
                  "Upload content you don't have rights to",
                  'Attempt to reverse engineer or abuse the service',
                  'Use the service to generate spam or bulk applications',
                  'Impersonate other people in generated content',
                  'Attempt to circumvent rate limits or AI usage quotas',
                ]}
              />
              <p className="mt-3">
                The service, including AI generation features, is subject to rate limits that may
                apply per account, per guest session, or per IP address, and may vary by feature. We
                may throttle, delay, or reject requests that exceed these limits, and may adjust
                limits at any time. We may log and review account and application activity to
                enforce these Terms and detect misuse.
              </p>
            </>
          ),
        },
        {
          title: 'Your Data',
          content: (
            <>
              <p>
                You retain ownership of all content you upload. By using Applera, you grant us the
                right to process your CV and job listing data solely to provide the service. We do
                not sell or share your data with third parties. See our{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  Privacy Policy
                </a>{' '}
                for full details.
              </p>
            </>
          ),
        },
        {
          title: 'Generated Content',
          content: (
            <p>
              As between you and Applera, you own the cover letters, match scores, CV summaries,
              email drafts, and interview preparation materials generated for your account, and you
              are free to use, edit, and share them as you wish. Because this content is
              AI-generated, we make no representation that it is original, accurate, or free of
              errors, and we are not responsible for how you use it.
            </p>
          ),
        },
        {
          title: 'Software License',
          content: (
            <p>
              These Terms govern your use of the hosted Applera service. The underlying source code
              is separately made available under the PolyForm Noncommercial License 1.0.0: personal
              and noncommercial use of the code is permitted free of charge, and commercial use of
              the code requires a separate paid license. See the{' '}
              <a
                href="https://github.com/LakBud/Applera/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                LICENSE
              </a>{' '}
              file for full terms. Using the hosted service does not grant you any rights to the
              source code beyond what the license provides.
            </p>
          ),
        },
        {
          title: 'Service Availability & Changes',
          content: (
            <p>
              We do not guarantee that Applera will be available at all times or free of errors. We
              may modify, suspend, or discontinue any part of the service, including specific
              features (such as interview preparation or a given AI provider), at any time without
              liability to you.
            </p>
          ),
        },
        {
          title: 'No Warranties',
          content: (
            <p>
              Applera is provided "as is" without warranties of any kind. We do not guarantee
              uptime, accuracy of AI output, or that the service will help you get a job.
            </p>
          ),
        },
        {
          title: 'Limitation of Liability',
          content: (
            <p>
              To the fullest extent permitted by law, Applera and its developers are not liable for
              any damages arising from your use of the service, including data loss, missed job
              opportunities, or reliance on AI-generated content.
            </p>
          ),
        },
        {
          title: 'Indemnification',
          content: (
            <p>
              You agree to indemnify and hold Applera and its developers harmless from any claims,
              damages, or expenses arising from your misuse of the service, violation of these
              Terms, or content you upload or generate, including content you don't have the rights
              to or that misrepresents another person.
            </p>
          ),
        },
        {
          title: 'Account Termination',
          content: (
            <p>
              You may delete your account at any time. Deleting your account triggers an automatic,
              near-immediate deletion of your data, as described in our Privacy Policy. We may
              suspend or terminate accounts that violate these terms. We will attempt to notify you
              before termination except in cases of clear abuse.
            </p>
          ),
        },
        {
          title: 'Governing Law & Disputes',
          content: (
            <p>
              These Terms are governed by the laws of the developer's jurisdiction of residence,
              without regard to conflict of law principles. Any dispute arising from these Terms or
              your use of Applera will first be attempted to be resolved informally by contacting us
              at the email below.
            </p>
          ),
        },
        {
          title: 'Severability & Entire Agreement',
          content: (
            <p>
              If any provision of these Terms is found unenforceable, the remaining provisions will
              remain in full effect. These Terms, together with our Privacy Policy, constitute the
              entire agreement between you and Applera regarding the service.
            </p>
          ),
        },
        {
          title: 'Changes to these Terms',
          content: (
            <p>
              We may update these terms from time to time. If we make material changes, we will
              update the "last updated" date above. Continued use of the service after changes
              constitutes acceptance. Significant changes will be communicated via email where
              possible.
            </p>
          ),
        },
        {
          title: 'Contact',
          content: (
            <p>
              For questions about these terms, email us at{' '}
              <a
                href="mailto:support@applera.site"
                className="text-primary underline underline-offset-2"
              >
                support@applera.site
              </a>
              , or reach out via{' '}
              <a
                href="https://github.com/LakBud/Applera"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                GitHub
              </a>{' '}
              by creating an issue.
            </p>
          ),
        },
      ]}
    />
  );
}
