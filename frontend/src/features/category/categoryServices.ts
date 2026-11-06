import axiosInstance from "../../services/axiosInstance";

import type {
    Category,
    CategoryPayload,
    CategoryApiResponse,
} from "./categoryTypes";

export const getAllCategories = async () => {
    try {
        const response = await axiosInstance.get<
            CategoryApiResponse<Category[]>
        >("/api/category/getallcategories");
        return response.data;
    } catch (error: any) {
        if (error?.response?.status === 404) {
            const fallback = await axiosInstance.get<
                CategoryApiResponse<Category[]>
            >("/api/category/getallcategory");
            return fallback.data;
        }
        throw error;
    }
};

export const createCategory = async (data: CategoryPayload) => {
    const payload = {
        ...data,
        category_name: data.category_name,
        categories_name: data.category_name,
    };
    const response = await axiosInstance.post<
        CategoryApiResponse<Category>
    >("/api/category/createcategory", payload);

    return response.data;
};

export const updateCategory = async (
    id: string,
    data: Partial<CategoryPayload>
) => {
    const payload = {
        ...data,
        category_name: data.category_name || data.categories_name,
        categories_name: data.categories_name || data.category_name,
    };

    try {
        const response = await axiosInstance.patch<
            CategoryApiResponse<Category>
        >(`/api/category/updatecategory/${id}`, payload);
        return response.data;
    } catch {
        const fallback = await axiosInstance.patch<
            CategoryApiResponse<Category>
        >(`/api/category/updatecatory/${id}`, payload);
        return fallback.data;
    }
};

export const deleteCategory = async (id: string) => {
    const response = await axiosInstance.delete<
        CategoryApiResponse<unknown>
    >(`/api/category/deletecategory/${id}`);

    return response.data;
};
