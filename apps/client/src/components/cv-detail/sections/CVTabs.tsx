import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { CVApplications } from '../description/applications/CVApplications';
import { CVDescription } from '../description/CVDescription';

import type { CVParsed, DashboardCV } from '@applera/schemas';

interface CVTabsSectionProps {
  cv: { parsed: CVParsed };
  dashboard: DashboardCV;
  isLoading: boolean;
}

export default function CVTabsSection({ cv, dashboard, isLoading }: CVTabsSectionProps) {
  const tabBase =
    'relative rounded-lg text-xs font-medium px-4 py-2 transition-all duration-200 text-black hover:text-tx-body';

  return (
    <Tabs defaultValue="content" className="w-full animate-fade-in">
      <TabsList
        className="
        w-full
        justify-start
        gap-1
        bg-white/40
        border
        border-border
        backdrop-blur
        shadow-sm
        rounded-md
      "
      >
        {/* CONTENT */}
        <TabsTrigger
          value="content"
          className={`
          ${tabBase}
          data-[state=active]:bg-[#1fa028]
          data-[state=active]:text-white
          data-[state=active]:shadow-sm
          rounded-md
        `}
        >
          CV Content
        </TabsTrigger>

        {/* APPLICATIONS */}
        <TabsTrigger
          value="applications"
          className={`
          ${tabBase}
          data-[state=active]:bg-[#1fa028]
          data-[state=active]:text-white
          data-[state=active]:shadow-sm
        `}
        >
          <span className="flex items-center gap-2">Applications</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="mt-6 animate-fade-in">
        <CVDescription parsed={cv.parsed} />
      </TabsContent>

      <TabsContent value="applications" className="mt-6 animate-fade-in">
        <CVApplications applications={dashboard.applications} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
}
