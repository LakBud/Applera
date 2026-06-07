import { Link, useLocation } from "@tanstack/react-router";
import { UserButton } from "@clerk/clerk-react";
import { Logo } from "./Logo";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaGithub } from "react-icons/fa";
import { Star } from "lucide-react";
import { clerkUserButtonAppearance } from "../../utils/clerkStyle";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={[
        "text-sm font-medium transition-all duration-200 pb-0.75",
        isActive ? "text-[#1fa028] border-b border-[#1fa028]" : "text-[#3d5a45] hover:text-[#1fa028] border-b border-transparent",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function Nav({ isSignedIn, isLoaded }: { isSignedIn: boolean; isLoaded: boolean }) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    axios.get("https://api.github.com/repos/LakBud/Applera").then((res) => setStars(res.data.stargazers_count));
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1fa028]/15 bg-[#f7fff5] backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 grid grid-cols-3 items-center">
        {/* LEFT: Logo */}
        <Link to="/">
          <Logo />
        </Link>

        {/* CENTER: Nav */}
        <div className="hidden md:flex justify-center items-center gap-8">
          {isLoaded && (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/applications">Applications</NavLink>
              <NavLink to="/cvs">CVs</NavLink>
            </>
          )}
        </div>

        {/* RIGHT: Account */}
        <div className="flex items-center justify-self-end h-10 gap-4">
          <a
            href="https://github.com/LakBud/Applera"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border text-tx-muted hover:text-tx-body hover:bg-muted/40 transition-colors"
          >
            <FaGithub size={12} />
            Star on GitHub
            {stars !== null && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-muted text-tx-muted/70">
                <Star className="w-3 h-3 pb-0.5" />
                {stars}
              </span>
            )}
          </a>

          {!isLoaded ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : isSignedIn ? (
            <UserButton appearance={clerkUserButtonAppearance} />
          ) : (
            <>
              {/* secondary action */}
              <Link
                to="/auth/sign-in"
                className="text-sm font-medium text-tx-muted hover:text-tx-body transition whitespace-nowrap"
              >
                Sign in
              </Link>

              {/* primary CTA */}
              <Link
                to="/auth/sign-up"
                className="text-sm font-semibold px-3 py-1.5 rounded-md bg-[#1fa028] text-white hover:bg-[#166534] transition whitespace-nowrap"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
