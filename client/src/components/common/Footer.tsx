import { Link } from "@tanstack/react-router";
import { FaGithub } from "react-icons/fa";
import { Logo } from "./Logo";

const PRODUCT_LINKS = [
  { label: "Try it", href: "/#generator" },
  { label: "Applications", to: "/applications" },
  { label: "CVs", to: "/cvs" },
];

const COMPANY_LINKS = [
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 px-6 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Logo + description + socials */}
        <div className="space-y-4">
          <Logo />
          <p className="text-xs text-tx-muted leading-relaxed max-w-xs">
            Tailor your job applications in seconds. Cover letters, match scores, and email drafts — all in one place.
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
                  <Link to={to} className="text-xs text-tx-muted hover:text-tx-body transition-colors">
                    {label}
                  </Link>
                ) : (
                  <a href={href} className="text-xs text-tx-muted hover:text-tx-body transition-colors">
                    {label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-tx-muted">Company</p>
          <ul className="space-y-2">
            {COMPANY_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-xs text-tx-muted hover:text-tx-body transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-border/50">
        <p className="text-xs text-tx-muted">© {new Date().getFullYear()} Applera. All rights reserved.</p>
      </div>
    </footer>
  );
}
