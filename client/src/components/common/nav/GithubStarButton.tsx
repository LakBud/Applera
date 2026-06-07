import { FaGithub } from "react-icons/fa";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

type Props = {
  className?: string;
};

export function GithubStarButton({ className = "" }: Props) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    axios.get("https://api.github.com/repos/LakBud/Applera").then((res) => setStars(res.data.stargazers_count));
  }, []);
  return (
    <a href="https://github.com/LakBud/Applera" target="_blank" rel="noopener noreferrer" className={className}>
      <FaGithub size={12} />
      Star on GitHub
      {stars !== null && (
        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-muted text-tx-muted/70">
          <Star className="w-3 h-3 pb-0.5" />
          {stars}
        </span>
      )}
    </a>
  );
}
