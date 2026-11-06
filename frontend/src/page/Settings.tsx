import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Col, Form, Row, Spinner } from "react-bootstrap";
import {
    FiLock,
    FiKey,
    FiCheckCircle,
    FiEye,
    FiEyeOff,
    FiShield,
    FiInfo,
} from "react-icons/fi";
import { toast } from "react-toastify";
import axios from "axios";

import axiosInstance from "../services/axiosInstance";
import { useAppDispatch } from "../app/hooks";
import { logoutThunk } from "../features/auth/authSlice";

interface PasswordForm {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const Settings = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [formData, setFormData] = useState<PasswordForm>({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (
            !formData.oldPassword ||
            !formData.newPassword ||
            !formData.confirmPassword
        ) {
            toast.error("Please fill all password fields");
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }

        if (formData.oldPassword === formData.newPassword) {
            toast.error("New password must be different from old password");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New password and confirm password do not match");
            return;
        }

        try {
            setLoading(true);

            const response = await axiosInstance.patch(
                "/api/v1/users/reset-password",
                {
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword,
                }
            );

            toast.success(
                response.data?.message ||
                "Password changed successfully! Please log in with your new password."
            );

            setFormData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            await dispatch(logoutThunk()).unwrap().catch(() => {});
            navigate("/login", { replace: true });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                    "Unable to change password"
                );
            } else {
                toast.error("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-3">
            <div className="mb-4">
                <h3 className="fw-bold mb-1">Settings</h3>
                <p className="text-muted mb-0">
                    Manage your account security and password.
                </p>
            </div>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="settings-header-icon-box">
                                    <FiLock size={22} />
                                </div>

                                <div>
                                    <h5 className="fw-bold mb-1">
                                        Change Password
                                    </h5>
                                    <p className="text-muted mb-0 small">
                                        Update your account password securely.
                                    </p>
                                </div>
                            </div>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <label className="modern-input-label">
                                        Current Password
                                    </label>

                                    <div className="modern-input-wrapper">
                                        <FiLock className="input-leading-icon" />

                                        <input
                                            type={
                                                showOldPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="oldPassword"
                                            className="modern-input-control"
                                            value={formData.oldPassword}
                                            onChange={handleChange}
                                            placeholder="Enter current password"
                                            autoComplete="current-password"
                                        />

                                        <button
                                            type="button"
                                            className="modern-input-eye-btn"
                                            onClick={() =>
                                                setShowOldPassword(!showOldPassword)
                                            }
                                            aria-label={
                                                showOldPassword
                                                    ? "Hide current password"
                                                    : "Show current password"
                                            }
                                        >
                                            {showOldPassword ? (
                                                <FiEyeOff size={18} />
                                            ) : (
                                                <FiEye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <label className="modern-input-label">
                                        New Password
                                    </label>

                                    <div className="modern-input-wrapper">
                                        <FiKey className="input-leading-icon" />

                                        <input
                                            type={
                                                showNewPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="newPassword"
                                            className="modern-input-control"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                            autoComplete="new-password"
                                        />

                                        <button
                                            type="button"
                                            className="modern-input-eye-btn"
                                            onClick={() =>
                                                setShowNewPassword(!showNewPassword)
                                            }
                                            aria-label={
                                                showNewPassword
                                                    ? "Hide new password"
                                                    : "Show new password"
                                            }
                                        >
                                            {showNewPassword ? (
                                                <FiEyeOff size={18} />
                                            ) : (
                                                <FiEye size={18} />
                                            )}
                                        </button>
                                    </div>

                                    <div className="modern-input-hint">
                                        <FiInfo
                                            size={14}
                                            className="text-primary flex-shrink-0"
                                        />
                                        <span>
                                            Must be at least 6 characters long.
                                        </span>
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <label className="modern-input-label">
                                        Confirm New Password
                                    </label>

                                    <div className="modern-input-wrapper">
                                        <FiCheckCircle className="input-leading-icon" />

                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="confirmPassword"
                                            className="modern-input-control"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm new password"
                                            autoComplete="new-password"
                                        />

                                        <button
                                            type="button"
                                            className="modern-input-eye-btn"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide confirm password"
                                                    : "Show confirm password"
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <FiEyeOff size={18} />
                                            ) : (
                                                <FiEye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </Form.Group>

                                <button
                                    type="submit"
                                    className="btn btn-update-password d-inline-flex align-items-center justify-content-center"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                size="sm"
                                                className="me-2"
                                            />
                                            Updating Password...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div
                                className="rounded-3 p-3 mb-3 d-inline-flex"
                                style={{
                                    background: "rgba(59, 130, 246, 0.15)",
                                    color: "#60a5fa",
                                }}
                            >
                                <FiShield size={25} />
                            </div>

                            <h5 className="fw-bold">
                                Account Security
                            </h5>

                            <p className="text-muted small mb-3">
                                Keep your account safe by using a strong,
                                unique password.
                            </p>

                            <ul className="text-muted small ps-3 mb-0">
                                <li className="mb-2">
                                    Use at least 6 characters.
                                </li>
                                <li className="mb-2">
                                    Avoid sharing your password.
                                </li>
                                <li>
                                    Change your password if you suspect
                                    unauthorized access.
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Settings;