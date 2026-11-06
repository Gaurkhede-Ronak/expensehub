import type { ReactNode } from "react";
import { Modal as BsModal, Button, Spinner } from "react-bootstrap";

export interface ModalProps {
  show: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "lg" | "xl";
  centered?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  confirmVariant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "dark";
  loading?: boolean;
}

const Modal = ({
  show,
  onClose,
  title,
  children,
  footer,
  size,
  centered = true,
  confirmText,
  cancelText = "Cancel",
  onConfirm,
  confirmVariant = "primary",
  loading = false,
}: ModalProps) => {
  return (
    <BsModal
      show={show}
      onHide={onClose}
      size={size}
      centered={centered}
      scrollable
      className="modern-modal"
    >
      {title && (
        <BsModal.Header closeButton>
          <BsModal.Title as="h5" className="fw-semibold mb-0">
            {title}
          </BsModal.Title>
        </BsModal.Header>
      )}

      <BsModal.Body>{children}</BsModal.Body>

      {(footer !== undefined || onConfirm) && (
        <BsModal.Footer>
          {footer !== undefined ? (
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
                      Loading...
                    </>
                  ) : (
                    confirmText || "Confirm"
                  )}
                </Button>
              )}
            </>
          )}
        </BsModal.Footer>
      )}
    </BsModal>
  );
};

export default Modal;