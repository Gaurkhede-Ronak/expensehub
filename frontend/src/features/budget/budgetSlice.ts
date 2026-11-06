import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
 
import {
    getAllBudgets,
    getSingleBudget,
    createBudget,
    updateBudget,
    deleteBudget,
} from "./budgetServices";
 
import type {
    Budget,
    BudgetPayload,
    BudgetState,
} from "./budgetTypes";
 
const initialState: BudgetState = {
    budgets: [],
    selectedBudget: null,
    loading: false,
    error: null,
};
 
const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }
 
    return fallback;
};
 
export const getAllBudgetsThunk = createAsyncThunk<
    Budget[],
    void,
    { rejectValue: string }
>("budget/getAll", async (_, { rejectWithValue }) => {
    try {
        const response = await getAllBudgets();
 
        if (!Array.isArray(response.data)) {
            return rejectWithValue("Invalid budget response");
        }
 
        return response.data;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to fetch budgets")
        );
    }
});
 
export const getSingleBudgetThunk = createAsyncThunk<
    Budget,
    string,
    { rejectValue: string }
>("budget/getSingle", async (id, { rejectWithValue }) => {
    try {
        const response = await getSingleBudget(id);
        return response.data;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to fetch budget")
        );
    }
});
 
export const createBudgetThunk = createAsyncThunk<
    Budget,
    BudgetPayload,
    { rejectValue: string }
>("budget/create", async (data, { rejectWithValue }) => {
    try {
        const response = await createBudget(data);
        return response.data;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to create budget")
        );
    }
});
 
export const updateBudgetThunk = createAsyncThunk<
    Budget,
    { id: string; data: Partial<BudgetPayload> },
    { rejectValue: string }
>("budget/update", async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await updateBudget(id, data);
        return response.data;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to update budget")
        );
    }
});
 
export const deleteBudgetThunk = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("budget/delete", async (id, { rejectWithValue }) => {
    try {
        await deleteBudget(id);
        return id;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to delete budget")
        );
    }
});
 
const budgetSlice = createSlice({
    name: "budget",
    initialState,
 
    reducers: {
        clearBudgetError: (state) => {
            state.error = null;
        },
 
        setSelectedBudget: (state, action) => {
            state.selectedBudget = action.payload;
        },
 
        clearSelectedBudget: (state) => {
            state.selectedBudget = null;
        },
    },
 
    extraReducers: (builder) => {
        builder
 
            .addCase(getAllBudgetsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllBudgetsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.budgets = action.payload;
            })
            .addCase(getAllBudgetsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch budgets";
            })
 
            .addCase(getSingleBudgetThunk.fulfilled, (state, action) => {
                state.selectedBudget = action.payload;
            })
            .addCase(getSingleBudgetThunk.rejected, (state, action) => {
                state.error = action.payload || "Failed to fetch budget";
            })
 
            .addCase(createBudgetThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBudgetThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.budgets.unshift(action.payload);
            })
            .addCase(createBudgetThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create budget";
            })
 
            .addCase(updateBudgetThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBudgetThunk.fulfilled, (state, action) => {
                state.loading = false;
 
                const index = state.budgets.findIndex(
                    (budget) => budget._id === action.payload._id
                );
 
                if (index !== -1) {
                    state.budgets[index] = action.payload;
                }
 
                state.selectedBudget = null;
            })
            .addCase(updateBudgetThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update budget";
            })
 
            .addCase(deleteBudgetThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBudgetThunk.fulfilled, (state, action) => {
                state.loading = false;
 
                state.budgets = state.budgets.filter(
                    (budget) => budget._id !== action.payload
                );
            })
            .addCase(deleteBudgetThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to delete budget";
            });
    },
});
 
export const {
    clearBudgetError,
    setSelectedBudget,
    clearSelectedBudget,
} = budgetSlice.actions;
 
export default budgetSlice.reducer;