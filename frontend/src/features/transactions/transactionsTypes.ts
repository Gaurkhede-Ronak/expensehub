export type TransactionType = "income" | "expense" | "investment";

export interface Transaction {
    _id: string;
    userid: string;
    categoryid: string;
    categoriesid?: any;
    partyid: string;
    party_id?: any;
    type: TransactionType;
    title: string;
    amount: number;
    date: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TransactionPayload {
    categoryid?: string;
    categoriesid?: string;
    partyid?: string;
    party_id?: string;
    type: TransactionType;
    title: string;
    amount: number;
    date: string;
    description: string;
}

export interface TransactionApiResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
}

export interface TransactionState {
    transactions: Transaction[];
    selectedTransaction: Transaction | null;
    loading: boolean;
    error: string | null;
}
