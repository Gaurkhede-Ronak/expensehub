import axiosInstance from "../../services/axiosInstance";

import type {
    Transaction,
    TransactionPayload,
    TransactionApiResponse,
} from "./transactionsTypes";

export const getAllTransactions = async () => {
    try {
        const response = await axiosInstance.get<
            TransactionApiResponse<Transaction[]>
        >("/api/transaction/getalltransactions");
        return response.data;
    } catch (error: any) {
        if (error?.response?.status === 404) {
            const fallback = await axiosInstance.get<
                TransactionApiResponse<Transaction[]>
            >("/api/transaction/getalltransaction");
            return fallback.data;
        }
        throw error;
    }
};

export const getSingleTransaction = async (id: string) => {
    try {
        const response = await axiosInstance.get<
            TransactionApiResponse<Transaction>
        >(`/api/transaction/getsingletransaction/${id}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.status === 404) {
            const fallback = await axiosInstance.get<
                TransactionApiResponse<Transaction>
            >(`/api/transaction/singletransaction/${id}`);
            return fallback.data;
        }
        throw error;
    }
};

export const createTransaction = async (data: TransactionPayload) => {
    const payload = {
        ...data,
        categoriesid: data.categoriesid || data.categoryid,
        categoryid: data.categoryid || data.categoriesid,
        party_id: data.party_id || data.partyid,
        partyid: data.partyid || data.party_id,
    };

    const response = await axiosInstance.post<
        TransactionApiResponse<Transaction>
    >("/api/transaction/createtransaction", payload);

    return response.data;
};

export const updateTransaction = async (
    id: string,
    data: Partial<TransactionPayload>
) => {
    const payload = {
        ...data,
        categoriesid: data.categoriesid || data.categoryid,
        categoryid: data.categoryid || data.categoriesid,
        party_id: data.party_id || data.partyid,
        partyid: data.partyid || data.party_id,
    };

    const response = await axiosInstance.patch<
        TransactionApiResponse<Transaction>
    >(`/api/transaction/updatetransaction/${id}`, payload);

    return response.data;
};

export const deleteTransaction = async (id: string) => {
    const response = await axiosInstance.delete<
        TransactionApiResponse<unknown>
    >(`/api/transaction/deletetransaction/${id}`);

    return response.data;
};
