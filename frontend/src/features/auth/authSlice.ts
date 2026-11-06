import {
    createSlice,
    createAsyncThunk,
} from "@reduxjs/toolkit";

import axios from "axios";

import {
    loginUser,
    registerUser,
    logoutUser,
    getCurrentUser,
} from "./authServices";

import type {
    AuthState,
    LoginPayload,
    RegisterPayload,
    User,
} from "./authTypes";

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    initialized: false,
    error: null,
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

export const loginThunk = createAsyncThunk<
    User,
    LoginPayload,
    { rejectValue: string }
>("auth/login", async (data, { rejectWithValue }) => {
    try {
        const response = await loginUser(data);
        const resData = response.data || {};
        const user = resData.user || (resData._id ? resData : null);

        if (!user) {
            return rejectWithValue("User data not found");
        }

        const token = resData.accesstoken || resData.accessToken;
        const refreshToken = resData.refreshtoken || resData.refreshToken;

        if (token) {
            localStorage.setItem("accesstoken", token);
        }
        if (refreshToken) {
            localStorage.setItem("refreshtoken", refreshToken);
        }

        return user as User;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error, "Login failed"));
    }
});

export const registerThunk = createAsyncThunk<
    User,
    RegisterPayload,
    { rejectValue: string }
>("auth/register", async (data, { rejectWithValue }) => {
    try {
        const response = await registerUser(data);
        const resData = response.data || {};
        const user = resData.user || (resData._id ? resData : null);

        if (!user) {
            return rejectWithValue("User data not found");
        }

        const token = resData.accesstoken || resData.accessToken;
        const refreshToken = resData.refreshtoken || resData.refreshToken;

        if (token) {
            localStorage.setItem("accesstoken", token);
        }
        if (refreshToken) {
            localStorage.setItem("refreshtoken", refreshToken);
        }

        return user as User;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Registration failed")
        );
    }
});

export const getCurrentUserThunk = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>("auth/getCurrentUser", async (_, { rejectWithValue }) => {
    try {
        const token =
            localStorage.getItem("accesstoken") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token");

        if (!token) {
            return rejectWithValue("No active session");
        }

        const response = await getCurrentUser();
        const resData = response.data || {};
        const user = resData.user || (resData._id ? resData : null);

        if (!user || !user._id) {
            localStorage.removeItem("accesstoken");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshtoken");
            localStorage.removeItem("refreshToken");
            return rejectWithValue("User data not found");
        }

        return user as User;
    } catch (error) {
        localStorage.removeItem("accesstoken");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshtoken");
        localStorage.removeItem("refreshToken");
        return rejectWithValue(
            getErrorMessage(error, "Session expired")
        );
    }
});

export const logoutThunk = createAsyncThunk<
    void,
    void,
    { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
    try {
        await logoutUser();
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Logout failed")
        );
    } finally {
        localStorage.removeItem("accesstoken");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshtoken");
        localStorage.removeItem("refreshToken");
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.initialized = true;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Login failed";
            })

            .addCase(registerThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.initialized = true;
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Registration failed";
            })

            .addCase(getCurrentUserThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCurrentUserThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.initialized = true;
            })
            .addCase(getCurrentUserThunk.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.initialized = true;
            })
            .addCase(logoutThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutThunk.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.initialized = true;
            })
            .addCase(logoutThunk.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload || "Logout failed";
            });
    },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
