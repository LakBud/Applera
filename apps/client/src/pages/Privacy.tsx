import { BulletList, LegalPage } from '../components/ui/legalPage';

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="July 2026"
      intro="Your privacy matters. This policy explains what data we collect, how we use it, and your rights. This policy is effective as of July 2026."
      sections={[
        {
          title: 'What We Collect',
          content: (
            <BulletList
              items={[
                'Account information: your name and email via Clerk authentication',
                'CV content: text and PDF files you upload to generate applications',
                'Job listings: text you paste or upload for matching',
                'Generated content: cover letters, match scores, email drafts, and interview preparation materials produced from your CVs and job listings',
                'Usage data: pages visited, features used, and request logs for debugging',
                'IP address: for rate limiting, abuse prevention, and included (in masked form) in server logs and audit logs',
                'AI usage counters: a per-account count of weekly AI generation quota used, so we can enforce fair usage limits',
                'Audit logs: records of key account and application actions (such as CV uploads, application generation, sign-ins, and rate-limit events), including a masked IP address, browser/device information, and a user or guest identifier, kept for security and abuse-prevention purposes',
                'Guest identifiers: if you use Applera without an account, we assign a random guest ID stored in a cookie so we can apply rate limits and quotas to your session',
              ]}
            />
          ),
        },
        {
          title: 'How We Use Your Data',
          content: (
            <BulletList
              items={[
                'To generate tailored cover letters, match scores, email drafts, and interview preparation guides',
                'To store and retrieve your CVs, applications, and interview preparation materials',
                'To authenticate your account securely via Clerk, including processing account lifecycle events (such as account deletion) sent to us by Clerk via webhook',
                'To enforce rate limits, AI usage quotas, and prevent abuse',
                'To cache CV/job match results so identical CV–job pairs are not reprocessed or re-billed unnecessarily',
                'To improve the service based on aggregated usage patterns, using privacy-friendly analytics (Cloudflare Analytics)',
                'To detect abuse, fraud, and security incidents, and to maintain an audit trail of account and application activity',
              ]}
            />
          ),
        },
        {
          title: 'Data Storage',
          content: (
            <p>
              Your CVs, applications, and interview preparation materials are stored securely in our
              database. PDF files are stored on Cloudinary and are only accessible through
              authenticated endpoints: your files are never publicly accessible by URL. We use Redis
              to temporarily cache AI-generated content and match results, keyed to a hash of the
              underlying CV and job content, so the same pair is not reprocessed. Cached entries
              expire automatically and do not persist indefinitely. We use industry-standard
              security measures, including encryption in transit (HTTPS/TLS) for all data sent to
              and from our servers, and access controls restricting who can access production data.
              No method of transmission or storage is 100% secure, and we cannot guarantee absolute
              security.
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
                  'Clerk: authentication and user management, including sending us account lifecycle events (such as account creation and deletion) via signed webhook',
                  'Cloudinary: secure file storage',
                  'Groq: AI model used for CV extraction, job listing extraction, match scoring, application generation, and interview preparation',
                  'MongoDB: database storage',
                  'Redis: caching and rate/usage limiting',
                  'Cloudflare Pages: deployment & analytics',
                ]}
              />
              <p className="mt-3">
                We do not sell your data to any third party. Data shared with the above services is
                limited to what is necessary to provide the service. Some of these providers may
                process or store data outside of your country of residence, including in the United
                States. Where required, we rely on appropriate safeguards (such as standard
                contractual clauses or equivalent mechanisms offered by our providers) to protect
                data transferred internationally.
              </p>
            </>
          ),
        },
        {
          title: 'AI Processing',
          content: (
            <p>
              Your CV and job listing content is sent to Groq's API to extract structured data,
              generate match scores, and produce application and interview preparation output. This
              data is processed in accordance with Groq's privacy policy. We do not use your content
              to train AI models. To reduce redundant processing and cost, match and generation
              results may be cached temporarily as described in "Data Storage" above.
            </p>
          ),
        },
        {
          title: 'Data Retention',
          content: (
            <p>
              Your data is retained as long as your account is active. You can delete individual
              CVs, applications, and interview preparation materials at any time from the app. When
              you delete your account through Clerk, we receive a webhook notification that
              automatically and immediately triggers a full deletion of your data from our systems:
              including all stored PDF files on Cloudinary, and all CVs, applications, and interview
              preparation records in our database. This deletion is not delayed or partial and
              typically completes within minutes of the webhook being received. If you delete
              individual CVs, applications, or interview preparation materials without deleting your
              account, those records are permanently removed from our database immediately;
              associated cached AI outputs expire automatically on their own short cache window
              regardless. Audit logs are retained separately for up to 90 days for security and
              abuse-prevention purposes, and are not deleted immediately when you delete your
              account or individual records, since their purpose is to help us detect and
              investigate misuse. Audit log IP addresses are always stored in masked form. In the
              unlikely event of a data breach affecting your personal data, we will notify affected
              users and relevant authorities as required by applicable law.
            </p>
          ),
        },
        {
          title: 'Your Rights',
          content: (
            <>
              <BulletList
                items={[
                  'Access: you can view all your data within the app, or contact us for a full copy of the data we hold about you',
                  'Deletion: you can delete your CVs, applications, and interview preparation materials at any time; deleting your account triggers automatic deletion of all associated data',
                  'Export / Portability: contact us to request a copy of your data in a structured, commonly used format',
                  'Correction: contact us to correct inaccurate or incomplete data',
                  'Restriction / Objection: where applicable under your local law, you may ask us to restrict or object to certain processing of your data',
                  'Withdraw consent: where we rely on your consent for processing, you may withdraw it at any time without affecting the lawfulness of processing before withdrawal',
                ]}
              />
              <p className="mt-3">
                <strong>If you are located in the European Economic Area or UK:</strong> our legal
                basis for processing your data is generally your consent (when you upload a CV or
                job listing) or our legitimate interest in providing and improving the service. You
                have the right to lodge a complaint with your local data protection supervisory
                authority if you believe your data has been mishandled.
              </p>
              <p className="mt-3">
                <strong>
                  If you are located in California or another U.S. state with a comprehensive
                  privacy law:
                </strong>{' '}
                we do not sell or share your personal information for cross-context behavioral
                advertising, and we have not done so in the preceding 12 months. You have the right
                to know, delete, and correct your personal information, and to non-discrimination
                for exercising these rights. To exercise any of these rights, contact us using the
                details below.
              </p>
              <p className="mt-3">
                We will respond to verifiable requests within the timeframe required by applicable
                law, and may need to verify your identity before fulfilling a request.
              </p>
            </>
          ),
        },
        {
          title: "Children's Privacy",
          content: (
            <p>
              Applera is not directed at, and is not intended for use by, anyone under the age of
              16. We do not knowingly collect personal data from children. If you believe a child
              has provided us with personal data, please contact us and we will take steps to delete
              it.
            </p>
          ),
        },
        {
          title: 'Cookies',
          content: (
            <p>
              We use a small number of cookies to run the service:
              <br />
              <br />
              <strong>CSRF token:</strong> a short-lived cookie used as part of a double-submit
              protection mechanism to secure your requests.
              <br />
              <strong>Guest identifier:</strong> if you use Applera without signing in, we set a
              signed cookie containing a random guest ID, valid for 30 days, so we can apply rate
              limits and quotas consistently to your session. This cookie does not identify you
              personally and is not linked to an account you may create later.
              <br />
              <br />
              If you sign in, authentication itself is handled via a token sent in request headers
              rather than a cookie. None of these cookies are used for tracking or advertising
              purposes.
            </p>
          ),
        },
        {
          title: 'Changes to This Policy',
          content: (
            <p>
              We may update this policy from time to time. If we make material changes, we will
              update the "last updated" date above. Continued use of the service after changes
              constitutes acceptance.
            </p>
          ),
        },
        {
          title: 'Contact',
          content: (
            <p>
              For privacy-related questions, data requests, or to exercise any of the rights above,
              email us at{' '}
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
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
