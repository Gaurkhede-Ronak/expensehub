import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Form } from "react-bootstrap";
import { useFormik, FormikProvider } from "formik";
import { Eye, EyeOff } from "lucide-react";
import {
    FiCreditCard,
    FiTrendingUp,
    FiTarget,
    FiShield,
    FiLock,
} from "react-icons/fi";
import { toast } from "react-toastify";

import FormikInput from "../components/common/FormikInput";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { loginThunk } from "../features/auth/authSlice";

import {
    loginValidationSchema,
    type LoginFormValues,
} from "../features/auth/validation/authValidation";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state) => state.auth);

    const formik = useFormik<LoginFormValues>({
        initialValues: {
            email: "",
            password: "",
        },

        validationSchema: loginValidationSchema,

        onSubmit: async (values) => {
            try {
                await dispatch(loginThunk(values)).unwrap();
                toast.success("Login successful!");
            } catch (error) {
                toast.error(
                    typeof error === "string"
                        ? error
                        : "Login failed. Please try again."
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
                                ✦ Smart Financial Management
                            </div>
                        </div>

                        <div className="brand-content">
                            <h1>
                                Manage Your <br />
                                Money <span className="gradient-text">Smartly.</span>
                            </h1>

                            <p>
                                Track income & expenses, plan budgets with ease, and achieve financial freedom.
                            </p>
                        </div>

                        <div className="auth-feature-list">
                            <div className="auth-feature-card">
                                <div className="feature-icon blue">
                                    <FiTrendingUp size={18} />
                                </div>
                                <div>
                                    <h6 className="feature-title">Real-time Tracking</h6>
                                    <p className="feature-desc">
                                        Instant updates for income, expenses & investments
                                    </p>
                                </div>
                            </div>

                            <div className="auth-feature-card">
                                <div className="feature-icon green">
                                    <FiTarget size={18} />
                                </div>
                                <div>
                                    <h6 className="feature-title">Target-based Budgets</h6>
                                    <p className="feature-desc">
                                        Set monthly limits and keep your savings on target
                                    </p>
                                </div>
                            </div>

                            <div className="auth-feature-card">
                                <div className="feature-icon amber">
                                    <FiShield size={18} />
                                </div>
                                <div>
                                    <h6 className="feature-title">Secure & Private</h6>
                                    <p className="feature-desc">
                                        Your financial records are encrypted and protected
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="auth-form-wrapper">
                        <Card className="auth-card border-0">
                            <Card.Body className="p-4 p-sm-5">
                                <div className="form-header-badge">
                                    <FiLock size={22} />
                                </div>

                                <h2 className="auth-title">Welcome Back</h2>
                                <p className="auth-subtitle">
                                    Enter your credentials to access your account
                                </p>

                                <Form onSubmit={formik.handleSubmit}>
                                    <FormikInput
                                        name="email"
                                        label="Email Address"
                                        type="email"
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                    />

                                    <FormikInput
                                        name="password"
                                        label="Password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
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

                                    <Button
                                        type="submit"
                                        className="auth-submit w-100 mt-2"
                                        disabled={loading}
                                    >
                                        {loading ? "Signing In..." : "Sign In"}
                                    </Button>
                                </Form>

                                <div className="auth-footer">
                                    Don't have an account?{" "}
                                    <Link to="/register">Sign Up</Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        </FormikProvider>
    );
};

export default Login;
