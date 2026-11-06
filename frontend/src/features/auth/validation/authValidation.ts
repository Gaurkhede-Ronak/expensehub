import * as Yup from "yup";

export const loginValidationSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email("Enter a valid email")
        .required("Email is required"),

    password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),
});

export const registerValidationSchema = Yup.object({
    userName: Yup.string()
        .trim()
        .required("User name is required")
        .min(2, "User name must be at least 2 characters"),

    email: Yup.string()
        .trim()
        .email("Enter a valid email")
        .required("Email is required"),

    password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),

    confirmPassword: Yup.string()
        .required("Confirm password is required")
        .oneOf(
            [Yup.ref("password")],
            "Passwords do not match"
        ),
});

export type LoginFormValues =
    Yup.InferType<typeof loginValidationSchema>;

export type RegisterFormValues =
    Yup.InferType<typeof registerValidationSchema>;
