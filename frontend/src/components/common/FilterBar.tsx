import { Form, Row, Col } from "react-bootstrap";
 
interface FilterBarProps {

  type: string;

  onTypeChange: (value: string) => void;

  dateFrom: string;

  onDateFromChange: (value: string) => void;

  dateTo: string;

  onDateToChange: (value: string) => void;

}
 
const FilterBar = ({

  type,

  onTypeChange,

  dateFrom,

  onDateFromChange,

  dateTo,

  onDateToChange,

}: FilterBarProps) => {

  return (
<Row className="g-2">
<Col xs={12} md={4}>
<Form.Select

          value={type}

          onChange={(e) => onTypeChange(e.target.value)}
>
<option value="">All Types</option>
<option value="income">Income</option>
<option value="expense">Expense</option>
<option value="investment">Investment</option>
</Form.Select>
</Col>
 
      <Col xs={6} md={4}>
<Form.Control

          type="date"

          value={dateFrom}

          onChange={(e) => onDateFromChange(e.target.value)}

        />
</Col>
 
      <Col xs={6} md={4}>
<Form.Control

          type="date"

          value={dateTo}

          onChange={(e) => onDateToChange(e.target.value)}

          min={dateFrom || undefined}

        />
</Col>
</Row>

  );

};
 
export default FilterBar;
 