import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
 
import {
    getAllParties,
    getSingleParty,
    createParty,
    updateParty,
    deleteParty,
} from "./partyServices";
 
import type {
    Party,
    PartyPayload,
    PartyState,
} from "./partyTypes";
 
const initialState: PartyState = {
    parties: [],
    selectedParty: null,
    loading: false,
    error: null,
};
 
const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }
 
    return fallback;
};
 
export const getAllPartiesThunk = createAsyncThunk<
    Party[],
    void,
    { rejectValue: string }
>("party/getAll", async (_, { rejectWithValue }) => {
    try {
        const response = await getAllParties();
 
        if (!Array.isArray(response.data)) {
            return rejectWithValue("Invalid party response");
        }
 
        return response.data;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to fetch parties")
        );
    }
});
 
export const getSinglePartyThunk = createAsyncThunk<
    Party,
    string,
    { rejectValue: string }
>("party/getSingle", async (id, { rejectWithValue }) => {
    try {
        const response = await getSingleParty(id);
        return response.data;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to fetch party")
        );
    }
});
 
export const createPartyThunk = createAsyncThunk<
    Party,
    PartyPayload,
    { rejectValue: string }
>("party/create", async (data, { rejectWithValue }) => {
    try {
        const response = await createParty(data);
        return response.data;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to create party")
        );
    }
});
 
export const updatePartyThunk = createAsyncThunk<
    Party,
    { id: string; data: Partial<PartyPayload> },
    { rejectValue: string }
>("party/update", async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await updateParty(id, data);
        return response.data;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to update party")
        );
    }
});
 
export const deletePartyThunk = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("party/delete", async (id, { rejectWithValue }) => {
    try {
        await deleteParty(id);
        return id;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Failed to delete party")
        );
    }
});
 
const partySlice = createSlice({
    name: "party",
    initialState,
 
    reducers: {
        clearPartyError: (state) => {
            state.error = null;
        },
 
        setSelectedParty: (state, action) => {
            state.selectedParty = action.payload;
        },
 
        clearSelectedParty: (state) => {
            state.selectedParty = null;
        },
    },
 
    extraReducers: (builder) => {
        builder
 
            .addCase(getAllPartiesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllPartiesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.parties = action.payload;
            })
            .addCase(getAllPartiesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch parties";
            })
 
            .addCase(getSinglePartyThunk.fulfilled, (state, action) => {
                state.selectedParty = action.payload;
            })
            .addCase(getSinglePartyThunk.rejected, (state, action) => {
                state.error = action.payload || "Failed to fetch party";
            })
 
            .addCase(createPartyThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPartyThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.parties.unshift(action.payload);
            })
            .addCase(createPartyThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create party";
            })
 
            .addCase(updatePartyThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePartyThunk.fulfilled, (state, action) => {
                state.loading = false;
 
                const index = state.parties.findIndex(
                    (party) => party._id === action.payload._id
                );
 
                if (index !== -1) {
                    state.parties[index] = action.payload;
                }
 
                state.selectedParty = null;
            })
            .addCase(updatePartyThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update party";
            })
 
            .addCase(deletePartyThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePartyThunk.fulfilled, (state, action) => {
                state.loading = false;
 
                state.parties = state.parties.filter(
                    (party) => party._id !== action.payload
                );
            })
            .addCase(deletePartyThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to delete party";
            });
    },
});
 
export const {
    clearPartyError,
    setSelectedParty,
    clearSelectedParty,
} = partySlice.actions;
 
export default partySlice.reducer;
 