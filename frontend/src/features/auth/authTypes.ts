import type {
    LoginFormValues,
} from "./validation/authValidation";

export type LoginPayload = LoginFormValues;

export interface RegisterPayload {
    name?: string;
    userName?: string;
    email?: string;
    password?: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    statusCode: number;
    success: boolean;
    message: string;
    data: any;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    initialized: boolean;
    error: string | null;
}
