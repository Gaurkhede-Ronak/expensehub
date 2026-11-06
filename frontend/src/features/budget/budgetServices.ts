import axiosInstance from "../../services/axiosInstance";
 
import type {
    Budget,
    BudgetPayload,
    BudgetApiResponse,
} from "./budgetTypes";
 
export const getAllBudgets = async () => {
    const response = await axiosInstance.get<
        BudgetApiResponse<Budget[]>
>("/api/budgets/getallbudgets");
 
    return response.data;
};
 
export const getSingleBudget = async (id: string) => {
    const response = await axiosInstance.get<
        BudgetApiResponse<Budget>
>(`/api/budgets/singlebudget/${id}`);
 
    return response.data;
};
 
export const createBudget = async (data: BudgetPayload) => {
    const response = await axiosInstance.post<
        BudgetApiResponse<Budget>
>("/api/budgets/createbudget", data);
 
    return response.data;
};
 
export const updateBudget = async (
    id: string,
    data: Partial<BudgetPayload>
) => {
    const response = await axiosInstance.patch<
        BudgetApiResponse<Budget>
>(`/api/budgets/updatebudget/${id}`, data);
 
    return response.data;
};
 
export const deleteBudget = async (id: string) => {
    const response = await axiosInstance.delete<
        BudgetApiResponse<unknown>
>(`/api/budgets/deletebudget/${id}`);
 
    return response.data;
};

