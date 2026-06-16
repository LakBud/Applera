import { BulletList, LegalPage } from '../components/ui/legalPage';

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="June 2026"
      intro="Your privacy matters. This policy explains what data we collect, how we use it, and your rights."
      sections={[
        {
          title: 'What We Collect',
          content: (
            <BulletList
              items={[
                'Account information — your name and email via Clerk authentication',
                'CV content — text and PDF files you upload to generate applications',
                'Job listings — text you paste or upload for matching',
                'Usage data — pages visited, features used, and request logs for debugging',
                'IP address — for rate limiting and abuse prevention',
              ]}
            />
          ),
        },
        {
          title: 'How We Use Your Data',
          content: (
            <BulletList
              items={[
                'To generate tailored cover letters, match scores, and email drafts',
                'To store and retrieve your CVs and applications',
                'To authenticate your account securely via Clerk',
                'To enforce rate limits and prevent abuse',
                'To improve the service based on aggregated usage patterns, using privacy-friendly analytics (Vercel Analytics)',
              ]}
            />
          ),
        },
        {
          title: 'Data Storage',
          content: (
            <p>
              Your CVs and application data are stored securely in our database. PDF files are
              stored on Cloudinary and are only accessible through authenticated endpoints — your
              files are never publicly accessible by URL. We use Redis for temporary caching of
              AI-generated content.
            </p>
          ),
        },
        {
          title: 'Third Parties',
          content: (
            <>
              <p className="mb-3">We use the following third-party services:</p>
              <BulletList
                items={[
                  'Clerk — authentication and user management',
                  'Cloudinary — secure file storage',
                  'Ollama — AI model for generating application content',
                  'MongoDB — database storage',
                  'Redis — caching',
                  'Vercel — deployment & analytics',
                ]}
              />
              <p>
                We do not sell your data to any third party. Data shared with the above services is
                limited to what is necessary to provide the service.
              </p>
            </>
          ),
        },
        {
          title: 'AI Processing',
          content: (
            <p>
              Your CV and job listing content is sent to Groq's API to generate application output.
              This data is processed in accordance with Groq's privacy policy. We do not use your
              content to train AI models.
            </p>
          ),
        },
        {
          title: 'Data Retention',
          content: (
            <p>
              Your data is retained as long as your account is active. You can delete your CVs and
              applications at any time from the app. To fully delete your account and all associated
              data, do it within account settings.
            </p>
          ),
        },
        {
          title: 'Your Rights',
          content: (
            <BulletList
              items={[
                'Access — you can view all your data within the app',
                'Deletion — you can delete your CVs and applications at any time',
                'Export — contact us to request a copy of your data',
                'Correction — contact us to correct inaccurate data',
              ]}
            />
          ),
        },
        {
          title: 'Cookies',
          content: (
            <p>
              We use a session cookie to authenticate your account. We do not use tracking or
              advertising cookies.
            </p>
          ),
        },
        {
          title: 'Changes to This Policy',
          content: (
            <p>
              We may update this policy from time to time. Continued use of the service after
              changes constitutes acceptance.
            </p>
          ),
        },
        {
          title: 'Contact',
          content: (
            <p>
              For privacy-related questions or data requests, reach out via{' '}
              <a
                href="https://github.com/LakBud/Applera"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                GitHub
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
