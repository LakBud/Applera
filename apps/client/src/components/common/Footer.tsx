import { Link } from '@tanstack/react-router';
import { FaGithub } from 'react-icons/fa';

import { Logo } from './Logo';

const PRODUCT_LINKS = [
  { label: 'Try it', href: '/#generator' },
  { label: 'Applications', to: '/applications' },
  { label: 'CVs', to: '/cvs' },
];

const OTHER_LINKS = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Contact', href: 'mailto:support@applera.site' },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 px-6 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Logo + description + socials */}
        <div className="space-y-4">
          <Logo />
          <p className="text-xs text-tx-muted leading-relaxed max-w-xs">
            Tailor your job applications in seconds. Cover letters, match scores, and email drafts —
            all in one place.
          </p>
          <a
            href="https://github.com/LakBud/Applera"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-tx-muted hover:text-tx-body transition-colors"
          >
            <FaGithub size={14} />
            GitHub
          </a>
        </div>

        {/* Product */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-tx-muted">Product</p>
          <ul className="space-y-2">
            {PRODUCT_LINKS.map(({ label, href, to }) => (
              <li key={label}>
                {to ? (
                  <Link
                    to={to}
                    className="text-xs text-tx-muted hover:text-tx-body transition-colors"
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    href={href}
                    className="text-xs text-tx-muted hover:text-tx-body transition-colors"
                  >
                    {label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-tx-muted">Other</p>
          <ul className="space-y-2">
            {OTHER_LINKS.map(({ label, href, to }) => (
              <li key={label}>
                {to ? (
                  <Link
                    to={to}
                    className="text-xs text-tx-muted hover:text-tx-body transition-colors"
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    href={href}
                    className="text-xs text-tx-muted hover:text-tx-body transition-colors"
                  >
                    {label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-border/50 flex items-center justify-between">
        <p className="text-xs text-tx-muted">
          © {new Date().getFullYear()} Applera. All rights reserved.
        </p>

        <div className="flex gap-3">
          <a
            href="https://open-launch.com/projects/applera"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://open-launch.com/api/badge/cd998bd8-05dd-4336-ace6-724b45f5b5a7/featured-light.svg"
              alt="Featured on Open-Launch"
              width="200"
              height="50"
            />
          </a>
          <a
            href="https://www.producthunt.com/products/applera/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-applera"
            target="_blank"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1260265&theme=neutral"
              alt="Applera - Turn&#0032;any&#0032;CV&#0032;&#0043;&#0032;job&#0032;post&#0032;into&#0032;a&#0032;tailored&#0032;application | Product Hunt"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
