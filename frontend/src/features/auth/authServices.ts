import axiosInstance from "../../services/axiosInstance";

import type {
    LoginPayload,
    RegisterPayload,
    AuthResponse,
} from "./authTypes";

export const loginUser = async (
    data: LoginPayload
): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
        "/api/v1/users/login",
        data
    );

    return response.data;
};

export const registerUser = async (
    data: RegisterPayload
): Promise<AuthResponse> => {
    const payload = {
        name: (data as any).name || (data as any).userName,
        userName: (data as any).userName || (data as any).name,
        email: data.email,
        password: data.password,
    };

    const response = await axiosInstance.post<AuthResponse>(
        "/api/v1/users/register",
        payload
    );

    return response.data;
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
    const response = await axiosInstance.get<AuthResponse>(
        "/api/v1/users/get-me"
    );

    return response.data;
};

export const logoutUser = async (): Promise<AuthResponse> => {
    const response = await axiosInstance.get<AuthResponse>(
        "/api/v1/users/logout"
    );

    return response.data;
};
