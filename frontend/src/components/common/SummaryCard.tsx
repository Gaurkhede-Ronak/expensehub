import { Card } from "react-bootstrap";
import type { IconType } from "react-icons";
 
interface SummaryCardProps {
  title: string;
  amount: string;
  icon: IconType;
  color?: "primary" | "success" | "danger" | "warning";
  description?: string;
}
 
const SummaryCard = ({
  title,
  amount,
  icon: Icon,
  color = "primary",
  description,
}: SummaryCardProps) => {
  return (
<Card className="border-0 shadow-sm h-100">
<Card.Body className="p-3 p-md-4">
<div className="d-flex justify-content-between align-items-center">
<span className="text-secondary small">{title}</span>
 
          <div
            className={`bg-${color}-subtle text-${color} rounded-3 p-2`}
>
<Icon size={22} />
</div>
</div>
 
        <h4 className="fw-bold mt-3 mb-1">{amount}</h4>
 
        {description && (
<small className="text-secondary">{description}</small>
        )}
</Card.Body>
</Card>
  );
};
 
export default SummaryCard;