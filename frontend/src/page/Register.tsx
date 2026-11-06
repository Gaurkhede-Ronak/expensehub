import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Form } from "react-bootstrap";
import { useFormik, FormikProvider } from "formik";
import { Eye, EyeOff } from "lucide-react";
import {
    FiCreditCard,
    FiLayers,
    FiUsers,
    FiShield,
    FiUserCheck,
} from "react-icons/fi";
import { toast } from "react-toastify";

import FormikInput from "../components/common/FormikInput";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { registerThunk } from "../features/auth/authSlice";

import {
    registerValidationSchema,
    type RegisterFormValues,
} from "../features/auth/validation/authValidation";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { loading } = useAppSelector((state) => state.auth);

    const formik = useFormik<RegisterFormValues>({
        initialValues: {
            userName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },

        validationSchema: registerValidationSchema,

        onSubmit: async (values) => {
            try {
                const payload = {
                    name: values.userName.trim(),
                    userName: values.userName.trim(),
                    email: values.email.trim(),
                    password: values.password,
                };

                const registeredUser = await dispatch(registerThunk(payload)).unwrap();
                toast.success(`Welcome, ${registeredUser.name || values.userName}! Account created.`);
                navigate("/dashboard");
            } catch (error) {
                toast.error(
                    typeof error === "string"
                        ? error
                        : "Registration failed. Please try again."
                );
            }
        },
    });

    return (
        <FormikProvider value={formik}>
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-brand">
                        <div className="auth-header-row">
                            <div className="brand-logo">
                                <div
                                    className="brand-icon-box"
                                    style={{
                                        width: "42px",
                                        height: "42px",
                                        minWidth: "42px",
                                        minHeight: "42px",
                                        maxWidth: "42px",
                                        maxHeight: "42px",
                                        aspectRatio: "1 / 1",
                                        borderRadius: "12px",
                                        flexShrink: 0,
                                    }}
                                >
                                    <FiCreditCard size={21} />
                                </div>
                                <h4 className="brand-title">
                                    Expense<span>Hub</span>
                                </h4>
                            </div>

                            <div className="auth-tag-pill">
                                ✦ Join ExpenseHub Today
                            </div>
                        </div>

                        <div className="brand-content">
                            <h1>
                                Start Your <br />
                                Financial <span className="gradient-text">Journey.</span>
                            </h1>

                            <p>
                                Create an account in seconds and unlock automated insights for all your expenses.
                            </p>
                        </div>

                        <div className="auth-feature-list">
                            <div className="auth-feature-card">
                                <div className="feature-icon blue">
                                    <FiLayers size={18} />
                                </div>
                                <div>
                                    <h6 className="feature-title">Ready-made Categories</h6>
                                    <p className="feature-desc">
                                        Pre-configured with essential expense & income tags
                                    </p>
                                </div>
                            </div>

                            <div className="auth-feature-card">
                                <div className="feature-icon green">
                                    <FiUsers size={18} />
                                </div>
                                <div>
                                    <h6 className="feature-title">Multi-Party Tracking</h6>
                                    <p className="feature-desc">
                                        Organize transactions by banks, merchants & friends
                                    </p>
                                </div>
                            </div>

                            <div className="auth-feature-card">
                                <div className="feature-icon amber">
                                    <FiShield size={18} />
                                </div>
                                <div>
                                    <h6 className="feature-title">Instant Dashboard</h6>
                                    <p className="feature-desc">
                                        Direct access right after registration
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="auth-form-wrapper">
                        <Card className="auth-card border-0">
                            <Card.Body className="p-4 p-sm-5">
                                <div className="form-header-badge">
                                    <FiUserCheck size={22} />
                                </div>

                                <h2 className="auth-title">Create Account</h2>
                                <p className="auth-subtitle">
                                    Join us and take control of your finances
                                </p>

                                <Form onSubmit={formik.handleSubmit}>
                                    <FormikInput
                                        label="Username"
                                        name="userName"
                                        type="text"
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                    />

                                    <FormikInput
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                    />

                                    <FormikInput
                                        label="Password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create password"
                                        autoComplete="new-password"
                                        rightElement={
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        }
                                    />

                                    <FormikInput
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm password"
                                        autoComplete="new-password"
                                        rightElement={
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        }
                                    />

                                    <Button
                                        type="submit"
                                        className="auth-submit w-100 mt-2"
                                        disabled={loading}
                                    >
                                        {loading ? "Creating Account..." : "Create Account"}
                                    </Button>
                                </Form>

                                <div className="auth-footer">
                                    Already have an account?{" "}
                                    <Link to="/login">Sign In</Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        </FormikProvider>
    );
};

export default Register;
