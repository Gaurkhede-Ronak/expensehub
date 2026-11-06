export type CategoryType = "income" | "expense" | "investment";

export interface Category {
    _id: string;
    category_name?: string;
    categories_name?: string;
    userid: string;
    type: CategoryType;
    icon?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryPayload {
    category_name: string;
    categories_name?: string;
    type: CategoryType;
}

export interface CategoryApiResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
}

export interface CategoryState {
    categories: Category[];
    selectedCategory: Category | null;
    loading: boolean;
    error: string | null;
}
