import { Button } from "../../ui/button";
import { TabsList, TabsTrigger } from "../../ui/tabs";

type Props = {
  activeTab: "letter" | "summary" | "email";
  setActiveTab: (v: "letter" | "summary" | "email") => void;
  copy: (text: string, key: string) => void;
  copied: string | null;
  activeContent: string;
};

export function ApplicationTabsHeader({ activeTab, setActiveTab, copy, copied, activeContent }: Props) {
  return (
    <div className="flex items-center border-b border-border px-0 overflow-x-auto">
      {/* Tabs */}
      <TabsList className="h-auto bg-transparent gap-0 p-0 flex">
        <TabsTrigger
          value="letter"
          onClick={() => setActiveTab("letter")}
          className="px-4 md:px-5 py-3.5 text-xs font-semibold tracking-wide rounded-none border-b-2 border-transparent data-[state=active]:border-b-green-800 data-[state=active]:text-green-800 data-[state=active]:shadow-none data-[state=active]:bg-transparent text-secondary hover:text-tx-h2 transition whitespace-nowrap"
        >
          Cover letter
        </TabsTrigger>

        <TabsTrigger
          value="summary"
          onClick={() => setActiveTab("summary")}
          className="px-4 md:px-5 py-3.5 text-xs font-semibold tracking-wide rounded-none border-b-2 border-transparent data-[state=active]:border-b-green-800 data-[state=active]:text-green-800 data-[state=active]:shadow-none data-[state=active]:bg-transparent text-secondary hover:text-tx-h2 transition whitespace-nowrap"
        >
          CV summary
        </TabsTrigger>

        <TabsTrigger
          value="email"
          onClick={() => setActiveTab("email")}
          className="px-4 md:px-5 py-3.5 text-xs font-semibold tracking-wide rounded-none border-b-2 border-transparent data-[state=active]:border-b-green-800 data-[state=active]:text-green-800 data-[state=active]:shadow-none data-[state=active]:bg-transparent text-secondary hover:text-tx-h2 transition whitespace-nowrap"
        >
          Email draft
        </TabsTrigger>
      </TabsList>

      {/* Copy button */}
      <div className="ml-auto flex items-center px-2 md:px-4">
        <Button
          type="button"
          onClick={() => copy(activeContent, activeTab)}
          className="text-xs text-secondary hover:text-h1 transition px-2 md:px-3 py-1.5"
        >
          {copied === activeTab ? "Copied ✓" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
