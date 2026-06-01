import { useNavigate } from "@tanstack/react-router";
import { Badge } from "../../ui/badge";
import { STATUS_STYLES } from "../../../utils/statusStyles";
import { TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { RowBase } from "../../common/RowBase";

export function CVApplicationRow({ application }: { application: any }) {
  const navigate = useNavigate();

  const status = STATUS_STYLES[application.status] ?? {
    label: application.status,
    className: "bg-gray-100 text-gray-600",
  };

  const jobTitle = application.job_title;
  const company = application.company;

  const score = application.score;

  return (
    <RowBase
      onClick={() =>
        navigate({
          to: "/applications/$applicationId",
          params: { applicationId: application._id },
        })
      }
      left={
        <>
          <p className="text-sm font-medium truncate">{jobTitle}</p>
          <p className="text-xs text-muted-foreground truncate">{company}</p>
        </>
      }
      middle={
        <>
          {score !== undefined && (
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {score}%
            </span>
          )}
        </>
      }
      right={
        <>
          <span className="hidden sm:block text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(application.createdAt), {
              addSuffix: true,
            })}
          </span>

          <Badge variant="outline" className={`text-xs font-medium ${status.className}`}>
            {status.label}
          </Badge>
        </>
      }
    />
  );
}
