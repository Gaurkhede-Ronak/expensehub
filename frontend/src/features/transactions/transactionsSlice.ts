import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import {
    getAllTransactions,
    getSingleTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
} from "./transactionsServices";

import type {
    Transaction,
    TransactionPayload,
    TransactionState,
} from "./transactionsTypes";

const initialState: TransactionState = {
    transactions: [],
    selectedTransaction: null,
    loading: false,
    error: null,
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

const normalizeTransaction = (t: any): Transaction => {
    const categoryId =
        typeof t.categoriesid === "object" && t.categoriesid !== null
            ? t.categoriesid._id
            : t.categoriesid || t.categoryid || "";

    const partyId =
        typeof t.party_id === "object" && t.party_id !== null
            ? t.party_id._id
            : t.party_id || t.partyid || "";

    return {
        ...t,
        categoryid: categoryId,
        categoriesid: t.categoriesid || categoryId,
        partyid: partyId,
        party_id: t.party_id || partyId,
    };
};

export const getAllTransactionsThunk = createAsyncThunk<
    Transaction[],
    void,
    { rejectValue: string }
>("transaction/getAll", async (_, { rejectWithValue }) => {
    try {
        const response = await getAllTransactions();

        if (!Array.isArray(response.data)) {
            return rejectWithValue("Invalid transaction response");
        }

        return response.data.map(normalizeTransaction);
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to fetch transactions")
        );
    }
});

export const getSingleTransactionThunk = createAsyncThunk<
    Transaction,
    string,
    { rejectValue: string }
>("transaction/getSingle", async (id, { rejectWithValue }) => {
    try {
        const response = await getSingleTransaction(id);
        return normalizeTransaction(response.data);
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to fetch transaction")
        );
    }
});

export const createTransactionThunk = createAsyncThunk<
    Transaction,
    TransactionPayload,
    { rejectValue: string }
>("transaction/create", async (data, { rejectWithValue }) => {
    try {
        const response = await createTransaction(data);
        return normalizeTransaction(response.data);
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to create transaction")
        );
    }
});

export const updateTransactionThunk = createAsyncThunk<
    Transaction,
    { id: string; data: Partial<TransactionPayload> },
    { rejectValue: string }
>("transaction/update", async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await updateTransaction(id, data);
        return normalizeTransaction(response.data);
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to update transaction")
        );
    }
});

export const deleteTransactionThunk = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("transaction/delete", async (id, { rejectWithValue }) => {
    try {
        await deleteTransaction(id);
        return id;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to delete transaction")
        );
    }
});

const transactionSlice = createSlice({
    name: "transaction",
    initialState,

    reducers: {
        clearTransactionError: (state) => {
            state.error = null;
        },

        setSelectedTransaction: (state, action) => {
            state.selectedTransaction = action.payload;
        },

        clearSelectedTransaction: (state) => {
            state.selectedTransaction = null;
        },
    },

    extraReducers: (builder) => {
        builder

            .addCase(getAllTransactionsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllTransactionsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(getAllTransactionsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch transactions";
            })

            .addCase(getSingleTransactionThunk.fulfilled, (state, action) => {
                state.selectedTransaction = action.payload;
            })
            .addCase(getSingleTransactionThunk.rejected, (state, action) => {
                state.error = action.payload || "Failed to fetch transaction";
            })

            .addCase(createTransactionThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTransactionThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions.unshift(action.payload);
            })
            .addCase(createTransactionThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create transaction";
            })

            .addCase(updateTransactionThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTransactionThunk.fulfilled, (state, action) => {
                state.loading = false;

                const index = state.transactions.findIndex(
                    (transaction) => transaction._id === action.payload._id
                );

                if (index !== -1) {
                    state.transactions[index] = action.payload;
                }

                state.selectedTransaction = null;
            })
            .addCase(updateTransactionThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update transaction";
            })

            .addCase(deleteTransactionThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTransactionThunk.fulfilled, (state, action) => {
                state.loading = false;

                state.transactions = state.transactions.filter(
                    (transaction) => transaction._id !== action.payload
                );
            })
            .addCase(deleteTransactionThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to delete transaction";
            });
    },
});

export const {
    clearTransactionError,
    setSelectedTransaction,
    clearSelectedTransaction,
} = transactionSlice.actions;

export default transactionSlice.reducer;
