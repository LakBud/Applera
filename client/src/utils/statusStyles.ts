export const STATUS_STYLES: Record<string, { label: string; className: string; selectClass: string }> = {
  generated: { label: "Generated", className: "bg-blue-50 text-blue-700 border-blue-200", selectClass: "text-blue-700" },
  applied: { label: "Applied", className: "bg-amber-50 text-amber-700 border-amber-200", selectClass: "text-amber-700" },
  interviewing: {
    label: "Interviewing",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    selectClass: "text-purple-700",
  },
  offered: { label: "Offered", className: "bg-green-50 text-green-700 border-green-200", selectClass: "text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200", selectClass: "text-red-700" },
  withdrawn: { label: "Withdrawn", className: "bg-slate-50 text-slate-500 border-slate-200", selectClass: "text-slate-500" },
};
