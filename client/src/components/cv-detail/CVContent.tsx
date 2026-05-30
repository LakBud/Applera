import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CVContentTab } from "./CVContentTab";
import { CVApplicationsTab } from "./CVApplicationsTab";
import type { Dashboard } from "../../api/schemas";
import type { CVParsed } from "../../api";
import { Separator } from "../ui/separator";

// ─── Primitives ───────────────────────────────────────────────────────────────

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold tracking-widest uppercase text-tx-muted mb-3">{children}</p>;
}

export function SectionDivider() {
  return <Separator className="bg-border/50" />;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

interface CVContentProps {
  cv: { parsed: CVParsed };
  dashboard: Dashboard;
}

export default function CVContent({ cv, dashboard }: CVContentProps) {
  return (
    <Tabs defaultValue="content">
      <TabsList className="bg-surface-muted rounded-lg p-1 w-full justify-start gap-1 h-auto">
        <TabsTrigger
          value="content"
          className="rounded-md text-xs font-semibold px-4 py-2 data-[state=active]:bg-surface data-[state=active]:text-tx-h1 data-[state=active]:shadow-sm"
        >
          CV Content
        </TabsTrigger>
        <TabsTrigger
          value="applications"
          className="rounded-md text-xs font-semibold px-4 py-2 data-[state=active]:bg-surface data-[state=active]:text-tx-h1 data-[state=active]:shadow-sm"
        >
          Applications
          {dashboard.total > 0 && (
            <span className="ml-2 bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {dashboard.total}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="mt-6">
        <CVContentTab parsed={cv.parsed} />
      </TabsContent>

      <TabsContent value="applications" className="mt-6">
        <CVApplicationsTab applications={dashboard.applications} />
      </TabsContent>
    </Tabs>
  );
}
