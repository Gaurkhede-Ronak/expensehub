import { Button } from "react-bootstrap";

import type { ReactNode } from "react";

import { FiPlus } from "react-icons/fi";
 
interface PageHeaderProps {

  title: string;

  subtitle?: string;

  buttonText?: string;

  onButtonClick?: () => void;

  children?: ReactNode;

}
 
const PageHeader = ({

  title,

  subtitle,

  buttonText,

  onButtonClick,

  children,

}: PageHeaderProps) => {

  return (
<div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
<div>
<h4 className="fw-bold mb-1">{title}</h4>

        {subtitle && (
<p className="text-secondary small mb-0">{subtitle}</p>

        )}
</div>
 
      <div className="d-flex align-items-center gap-2">

        {children}
 
        {buttonText && (
<Button variant="primary" onClick={onButtonClick}>
<FiPlus className="me-2" />

            {buttonText}
</Button>

        )}
</div>
</div>

  );

};
 
export default PageHeader;
 