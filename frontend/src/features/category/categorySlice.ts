import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "./categoryServices";

import type {
    Category,
    CategoryPayload,
    CategoryState,
} from "./categoryTypes";

const initialState: CategoryState = {
    categories: [],
    selectedCategory: null,
    loading: false,
    error: null,
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
};

const normalizeCategory = (cat: Category): Category => ({
    ...cat,
    category_name: cat.category_name || cat.categories_name || "Unnamed Category",
    categories_name: cat.categories_name || cat.category_name || "Unnamed Category",
});

export const getAllCategoriesThunk = createAsyncThunk<
    Category[],
    void,
    { rejectValue: string }
>(
    "category/getAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllCategories();

            if (!Array.isArray(response.data)) {
                return rejectWithValue("Invalid category response");
            }

            return response.data.map(normalizeCategory);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to fetch categories")
            );
        }
    }
);

export const createCategoryThunk = createAsyncThunk<
    Category,
    CategoryPayload,
    { rejectValue: string }
>(
    "category/create",
    async (data, { rejectWithValue }) => {
        try {
            const response = await createCategory(data);

            if (!response.data || !("_id" in response.data)) {
                return rejectWithValue("Failed to create category");
            }

            return normalizeCategory(response.data as Category);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to create category")
            );
        }
    }
);

export const updateCategoryThunk = createAsyncThunk<
    Category,
    { id: string; data: Partial<CategoryPayload> },
    { rejectValue: string }
>(
    "category/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await updateCategory(id, data);

            if (!response.data || !("_id" in response.data)) {
                return rejectWithValue("Failed to update category");
            }

            return normalizeCategory(response.data as Category);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to update category")
            );
        }
    }
);

export const deleteCategoryThunk = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>(
    "category/delete",
    async (id, { rejectWithValue }) => {
        try {
            await deleteCategory(id);
            return id;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to delete category")
            );
        }
    }
);

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        clearCategoryError: (state) => {
            state.error = null;
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },
        clearSelectedCategory: (state) => {
            state.selectedCategory = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllCategoriesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllCategoriesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(getAllCategoriesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch categories";
            })

            .addCase(createCategoryThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCategoryThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.categories.unshift(action.payload);
            })
            .addCase(createCategoryThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create category";
            })

            .addCase(updateCategoryThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategoryThunk.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.categories.findIndex(
                    (category) => category._id === action.payload._id
                );
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
                state.selectedCategory = null;
            })
            .addCase(updateCategoryThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update category";
            })

            .addCase(deleteCategoryThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = state.categories.filter(
                    (category) => category._id !== action.payload
                );
            })
            .addCase(deleteCategoryThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to delete category";
            });
    },
});

export const {
    clearCategoryError,
    setSelectedCategory,
    clearSelectedCategory,
} = categorySlice.actions;

export default categorySlice.reducer;
