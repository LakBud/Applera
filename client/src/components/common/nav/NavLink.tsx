import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "../../../lib/utils";

export function NavLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) {
  const location = useLocation();
  const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "relative text-sm font-medium transition-colors duration-200",
        "text-[#3d5a45] hover:text-[#1fa028]",
        "after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:scale-x-0 after:origin-center after:bg-[#1fa028] after:transition-transform",

        isActive && "text-[#1fa028] after:scale-x-100",
      )}
    >
      {children}
    </Link>
  );
}
