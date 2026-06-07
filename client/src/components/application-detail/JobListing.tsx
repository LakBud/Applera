import { useState } from "react";
import { MapPin, Building2, ChevronDown, ChevronUp, Briefcase, Calendar } from "lucide-react";
import { ApplicationAccordion } from "../ui/accordion";
import { SectionHeading } from "../ui/section";

type JobParsed = {
  title?: string;
  required_skills?: string[];
  responsibilities?: string[];
  seniority?: string;
  location?: string;
};

type Props = {
  company?: string;
  location?: string;
  rawText?: string;
  parsed?: JobParsed;
  createdAt?: string;
};

// ... types unchanged

export function JobListingSection({ company, location, rawText, parsed, createdAt }: Props) {
  const [showRaw, setShowRaw] = useState(false);
  const resolvedLocation = location ?? parsed?.location;

  return (
    <ApplicationAccordion title="Job listing">
      <div className="p-4 space-y-5">
        {/* Title + meta */}
        <div>
          {parsed?.title && <p className="text-sm font-medium  text-green-700">{parsed.title}</p>}
          <div className="flex items-center gap-3 flex-wrap mt-1">
            {company && (
              <span className="flex items-center gap-1 text-xs text-tx-secondary">
                <Building2 className="w-3 h-3" />
                {company}
              </span>
            )}
            {resolvedLocation && (
              <span className="flex items-center gap-1 text-xs text-tx-secondary">
                <MapPin className="w-3 h-3" />
                {resolvedLocation}
              </span>
            )}
            {parsed?.seniority && parsed.seniority !== "unknown" && (
              <span className="flex items-center gap-1 text-xs text-tx-secondary">
                <Briefcase className="w-3 h-3" />
                <span className="capitalize">{parsed.seniority}</span>
              </span>
            )}
            {createdAt && (
              <span className="flex items-center gap-1 text-xs text-tx-caption">
                <Calendar className="w-3 h-3" />
                {new Date(createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        {(parsed?.required_skills?.length ?? 0) > 0 && (
          <div>
            <SectionHeading>Required skills</SectionHeading>
            <div className="flex flex-wrap gap-1.5">
              {parsed?.required_skills?.map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-0.5 border border-border rounded-md bg-surface-muted text-tx-secondary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {(parsed?.responsibilities?.length ?? 0) > 0 && (
          <div>
            <SectionHeading>Responsibilities</SectionHeading>
            <ul className="space-y-1.5">
              {parsed?.responsibilities?.map((r, i) => (
                <li key={i} className="text-xs text-tx-muted flex gap-2">
                  <span className="mt-0.5 shrink-0 text-tx-caption">·</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {rawText && (
          <div>
            <button
              onClick={() => setShowRaw((v) => !v)}
              className="flex items-center gap-1 text-xs text-tx-muted hover:text-tx-body transition-colors"
            >
              {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showRaw ? "Hide" : "Show"} full description
            </button>
            {showRaw && (
              <pre className="mt-3 whitespace-pre-wrap text-xs text-tx-muted leading-relaxed border border-border rounded-md p-3 bg-surface-muted">
                {rawText}
              </pre>
            )}
          </div>
        )}
      </div>
    </ApplicationAccordion>
  );
}
