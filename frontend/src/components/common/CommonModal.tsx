import type { ReactNode } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";

export interface CommonModalProps {
    show: boolean;
    onClose: () => void;
    title?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    size?: "sm" | "lg" | "xl";
    centered?: boolean;
    confirmText?: string;
    confirmVariant?: "primary" | "danger" | "warning" | "success" | "secondary";
    cancelText?: string;
    onConfirm?: () => void;
    loading?: boolean;
}

const CommonModal = ({
    show,
    onClose,
    title,
    children,
    footer,
    size,
    centered = true,
    confirmText,
    confirmVariant = "primary",
    cancelText = "Cancel",
    onConfirm,
    loading = false,
}: CommonModalProps) => {
    return (
        <Modal
            show={show}
            onHide={onClose}
            size={size}
            centered={centered}
            scrollable
            className="modern-modal"
        >
            {title && (
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5 fw-semibold">{title}</Modal.Title>
                </Modal.Header>
            )}

            <Modal.Body>{children}</Modal.Body>

            {(footer || onConfirm) && (
                <Modal.Footer>
                    {footer ? (
                        footer
                    ) : (
                        <>
                            <Button
                                variant="secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                {cancelText}
                            </Button>

                            {onConfirm && (
                                <Button
                                    variant={confirmVariant}
                                    onClick={onConfirm}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        confirmText || "Confirm"
                                    )}
                                </Button>
                            )}
                        </>
                    )}
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default CommonModal;

