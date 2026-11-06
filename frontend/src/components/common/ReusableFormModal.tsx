import type { ChangeEvent, FormEvent } from "react";
import {
    Button,
    Form,
    Spinner,
    Row,
    Col,
} from "react-bootstrap";
import CommonModal from "./CommonModal";
import { CustomSelect } from "./CustomSelect";

export interface FormField {
    name: string;
    label: string;
    type?:
        | "text"
        | "number"
        | "email"
        | "date"
        | "month"
        | "url"
        | "select"
        | "textarea";
    placeholder?: string;
    required?: boolean;
    col?: number;
    dropUp?: boolean;
    options?: {
        label: string;
        value: string;
        color?: string;
    }[];
}

import { DEFAULT_OPTION_COLORS } from "../../constants/optionColors";

interface ReusableFormModalProps<T extends object> {
    show: boolean;
    title: string;
    fields: FormField[];
    values: T;
    loading?: boolean;
    error?: string | null;
    submitText?: string;
    size?: "sm" | "lg" | "xl";
    onChange: (name: string, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
}

const ReusableFormModal = <T extends object>({
    show,
    title,
    fields,
    values,
    loading = false,
    error,
    submitText = "Save",
    size,
    onChange,
    onSubmit,
    onClose,
}: ReusableFormModalProps<T>) => {
    const getValue = (name: string): string => {
        const record = values as Record<string, unknown>;
        return String(record[name] ?? "");
    };

    const handleChange = (
        event: ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        onChange(event.target.name, event.target.value);
    };

    const formId = "reusable-modal-form";
    const isMultiColumn = fields.length > 3;
    const effectiveSize = size || (isMultiColumn ? "lg" : undefined);

    return (
        <CommonModal
            show={show}
            onClose={onClose}
            title={title}
            size={effectiveSize}
            footer={
                <>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button type="submit" form={formId} disabled={loading} variant="primary">
                        {loading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Saving...
                            </>
                        ) : (
                            submitText
                        )}
                    </Button>
                </>
            }
        >
            <Form id={formId} onSubmit={onSubmit}>
                <Row className="g-3">
                    {fields.map((field) => {
                        const colSpan =
                            field.col ??
                            (field.type === "textarea" ? 12 : isMultiColumn ? 6 : 12);

                        return (
                            <Col xs={12} md={colSpan} key={field.name}>
                                <Form.Group>
                                    <Form.Label className="modern-form-label">
                                        {field.label}
                                        {field.required && (
                                            <span className="text-danger ms-1">*</span>
                                        )}
                                    </Form.Label>

                                    {field.type === "select" ? (
                                        <>
                                            <CustomSelect
                                                value={getValue(field.name)}
                                                onChange={(selectedVal) =>
                                                    onChange(field.name, selectedVal)
                                                }
                                                placeholder={`Select ${field.label}`}
                                                dropUp={field.dropUp}
                                                options={(field.options || []).map((opt) => {
                                                    let color: string | undefined = opt.color;
                                                    const val = opt.value.toLowerCase().trim();
                                                    const lbl = opt.label.toLowerCase().trim();

                                                    if (!color) {
                                                        if (DEFAULT_OPTION_COLORS[val]) {
                                                            color = DEFAULT_OPTION_COLORS[val];
                                                        } else {
                                                            for (const [key, cVal] of Object.entries(DEFAULT_OPTION_COLORS)) {
                                                                if (lbl.includes(`(${key})`) || lbl.includes(key)) {
                                                                    color = cVal;
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }

                                                    if (!color) {
                                                        color = "#38bdf8";
                                                    }

                                                    return {
                                                        value: opt.value,
                                                        label: opt.label,
                                                        color,
                                                    };
                                                })}
                                                ariaLabel={field.label}
                                            />
                                            <input
                                                type="text"
                                                tabIndex={-1}
                                                autoComplete="off"
                                                style={{
                                                    opacity: 0,
                                                    width: 0,
                                                    height: 0,
                                                    position: "absolute",
                                                    pointerEvents: "none",
                                                }}
                                                name={field.name}
                                                value={getValue(field.name)}
                                                onChange={() => {}}
                                                required={field.required}
                                            />
                                        </>
                                    ) : field.type === "textarea" ? (
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name={field.name}
                                            value={getValue(field.name)}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                        />
                                    ) : (
                                        <Form.Control
                                            type={field.type || "text"}
                                            name={field.name}
                                            value={getValue(field.name)}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            min={
                                                field.type === "number" ? 0 : undefined
                                            }
                                        />
                                    )}
                                </Form.Group>
                            </Col>
                        );
                    })}
                </Row>

                {error && (
                    <div className="alert alert-danger mt-3 mb-0 py-2">
                        {error}
                    </div>
                )}
            </Form>
        </CommonModal>
    );
};

export default ReusableFormModal;
