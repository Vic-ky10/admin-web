import Badge from "@/components/ui/Badge";

import {
  INCENTIVE_PAYMENT_STATUS,
  IncentivePaymentStatus,
} from "../incentive.types";

export default function PaymentStatusBadge({
  status,
}: {
  status: IncentivePaymentStatus;
}) {
  if (status === INCENTIVE_PAYMENT_STATUS.PAID) {
    return <Badge variant="success">{status}</Badge>;
  }

  return <Badge variant="info">{status}</Badge>;
}
