import { configureStore } from "@reduxjs/toolkit";
 
import authReducer from "../features/auth/authSlice";
import categoryReducer from "../features/category/categorySlice";
import partyReducer from "../features/party/partySlice";
import transactionReducer from "../features/transactions/transactionsSlice";
import budgetReducer from "../features/budget/budgetSlice";
 
export const store = configureStore({
    reducer: {
        auth: authReducer,
        category: categoryReducer,
        party: partyReducer,
        transaction: transactionReducer,
        budget: budgetReducer,
    },
});
 
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;