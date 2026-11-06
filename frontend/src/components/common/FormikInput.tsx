 
import React from "react";
import { Form } from "react-bootstrap";
import { useField } from "formik";

interface FormikInputProps {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    autoComplete?: string;
    disabled?: boolean;
    rightElement?: React.ReactNode;
}

const FormikInput = ({
    label,
    type = "text",
    rightElement,
    ...props
}: FormikInputProps) => {
    const [field, meta] = useField(props.name);
    const showError = meta.touched && Boolean(meta.error);

    return (
        <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
                {label}
            </Form.Label>

            <div className="position-relative d-flex align-items-center">
                <Form.Control
                    {...field}
                    {...props}
                    type={type}
                    disabled={props.disabled}
                    isInvalid={showError}
                    className={`auth-input w-100 ${rightElement ? "pe-5" : ""}`}
                />

                {rightElement && (
                    <div
                        className="position-absolute end-0 d-flex align-items-center justify-content-center me-2"
                        style={{
                            height: "100%",
                            top: 0,
                            bottom: 0,
                            zIndex: 5,
                        }}
                    >
                        {rightElement}
                    </div>
                )}
            </div>

            {showError && (
                <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
                    {meta.error}
                </Form.Control.Feedback>
            )}
        </Form.Group>
    );
};

export default FormikInput;
 
 