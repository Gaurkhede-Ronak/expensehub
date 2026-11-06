import { Badge } from "react-bootstrap";
 
type StatusType =
  | "income"
  | "expense"
  | "investment"
  | "paid"
  | "pending"
  | "overdue";
 
interface StatusBadgeProps {
  status: StatusType;
}
 
const statusConfig: Record<
  StatusType,
  { label: string; variant: string }
> = {
  income: { label: "Income", variant: "success" },
  expense: { label: "Expense", variant: "danger" },
  investment: { label: "Investment", variant: "primary" },
  paid: { label: "Paid", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  overdue: { label: "Overdue", variant: "danger" },
};
 
const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];
 
  return (
<Badge bg={config.variant} className="fw-medium px-3 py-2">
      {config.label}
</Badge>
  );
};
 
export default StatusBadge;