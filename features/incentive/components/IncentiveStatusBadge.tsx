import Badge from "@/components/ui/Badge";

import {
  INCENTIVE_STATUS,
  IncentiveStatus,
} from "../incentive.types";

export default function IncentiveStatusBadge({
  status,
}: {
  status: IncentiveStatus;
}) {
  if (status === INCENTIVE_STATUS.APPROVED) {
    return <Badge variant="success">{status}</Badge>;
  }

  if (status === INCENTIVE_STATUS.REJECTED) {
    return <Badge variant="danger">{status}</Badge>;
  }

  return <Badge variant="warning">{status}</Badge>;
}
