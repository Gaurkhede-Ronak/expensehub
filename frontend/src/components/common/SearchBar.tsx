import { Form, InputGroup } from "react-bootstrap";
import { FiSearch } from "react-icons/fi";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) => {
  return (
    <InputGroup>
      <InputGroup.Text>
        <FiSearch />
      </InputGroup.Text>

      <Form.Control
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </InputGroup>
  );
};

export default SearchBar;
