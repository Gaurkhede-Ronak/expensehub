import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Button, Card, Form, Table, Badge, Spinner } from "react-bootstrap";
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import {
    getAllCategoriesThunk,
    createCategoryThunk,
    updateCategoryThunk,
    deleteCategoryThunk,
} from "../features/category/categorySlice";

import type {
    Category,
    CategoryPayload,
    CategoryType,
} from "../features/category/categoryTypes";

import ReusableFormModal from "../components/common/ReusableFormModal";
import Modal from "../components/common/Modal";
import { CategoryIcon } from "../components/common/CategoryIcon";

const CategoryPage = () => {
    const dispatch = useAppDispatch();

    const { categories, loading, error } = useAppSelector(
        (state) => state.category
    );

    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] =
        useState<Category | null>(null);

    const [search, setSearch] = useState("");

    const initialFormData: CategoryPayload = {
        category_name: "",
        type: "expense",
    };

    const [formData, setFormData] =
        useState<CategoryPayload>(initialFormData);

    useEffect(() => {
        dispatch(getAllCategoriesThunk());
    }, [dispatch]);

    const filteredCategories = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return categories;
        return categories.filter((category) => {
            const name = (category.category_name || category.categories_name || "").toLowerCase();
            const type = (category.type || "").toLowerCase();
            return name.includes(q) || type.includes(q);
        });
    }, [categories, search]);

    const handleAdd = () => {
        setEditingCategory(null);
        setFormData(initialFormData);
        setShowModal(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);

        setFormData({
            category_name: category.category_name,
            type: category.type,
        });

        setShowModal(true);
    };

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleClose = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData(initialFormData);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!formData.category_name.trim()) {
            toast.error("Please enter category name");
            return;
        }

        const payload: CategoryPayload = {
            category_name: formData.category_name.trim(),
            type: formData.type,
        };

        try {
            if (editingCategory) {
                await dispatch(
                    updateCategoryThunk({
                        id: editingCategory._id,
                        data: payload,
                    })
                ).unwrap();

                toast.success("Category updated successfully");
            } else {
                await dispatch(
                    createCategoryThunk(payload)
                ).unwrap();

                toast.success("Category created successfully");
            }

            handleClose();
        } catch (err) {
            toast.error(
                typeof err === "string"
                    ? err
                    : "Something went wrong"
            );
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        try {
            await dispatch(deleteCategoryThunk(deleteId)).unwrap();
            toast.success("Category deleted successfully");
            setDeleteId(null);
        } catch (err) {
            toast.error(
                typeof err === "string"
                    ? err
                    : "Unable to delete category"
            );
        }
    };

    const getTypeBadge = (type: CategoryType) => {
        switch (type) {
            case "income":
                return <Badge bg="success">Income</Badge>;

            case "expense":
                return <Badge bg="danger">Expense</Badge>;

            case "investment":
                return <Badge bg="primary">Investment</Badge>;

            default:
                return <Badge bg="secondary">{type}</Badge>;
        }
    };

    const fields = [
        {
            name: "category_name",
            label: "Category Name",
            type: "text" as const,
            placeholder: "Enter category name",
            required: true,
        },
        {
            name: "type",
            label: "Category Type",
            type: "select" as const,
            required: true,
            dropUp: true,
            options: [
                { label: "Expense", value: "expense", color: "#ef4444" },
                { label: "Income", value: "income", color: "#10b981" },
                { label: "Investment", value: "investment", color: "#3b82f6" },
            ],
        },
    ];

    return (
        <div className="container-fluid py-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Categories</h3>
                    <p className="text-muted mb-0">
                        Manage your income, expense and investment categories
                    </p>
                </div>

                <Button variant="primary" onClick={handleAdd}>
                    <FiPlus className="me-2" />
                    Add Category
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4">
                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                            <h5 className="fw-semibold mb-0 text-nowrap">
                                All Categories
                            </h5>
                            <span
                                className="badge rounded-pill"
                                style={{
                                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                                    color: "#60a5fa",
                                    border: "1px solid rgba(59, 130, 246, 0.25)",
                                    fontSize: "12px",
                                    padding: "4px 9px",
                                }}
                            >
                                {filteredCategories.length !== categories.length
                                    ? `${filteredCategories.length} of ${categories.length}`
                                    : categories.length}
                            </span>
                        </div>

                        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto align-items-stretch">
                            <div className="search-input-group input-group flex-grow-1" style={{ minWidth: 240, maxWidth: "100%" }}>
                                <span className="input-group-text">
                                    <FiSearch />
                                </span>

                                <Form.Control
                                    type="text"
                                    placeholder="Search category or type..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />

                                {search && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary d-flex align-items-center"
                                        onClick={() => setSearch("")}
                                        style={{
                                            borderColor: "var(--input-border)",
                                            background: "var(--input-bg)",
                                            color: "var(--text-secondary)",
                                        }}
                                        aria-label="Clear search"
                                    >
                                        <FiX size={15} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                            <p className="mt-2 text-muted">
                                Loading categories...
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive d-none d-md-block">
                                <Table hover className="align-middle">
                                    <thead>
                                        <tr>
                                            <th>No.</th>
                                            <th>Icon</th>
                                            <th>Category Name</th>
                                            <th>Type</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map(
                                                (category, index) => (
                                                    <tr key={category._id}>
                                                        <td>{index + 1}</td>

                                                        <td>
                                                            <div className={`category-icon-box ${category.type || "expense"}`}>
                                                                <CategoryIcon
                                                                    icon={category.icon}
                                                                    categoryName={category.category_name}
                                                                    type={category.type}
                                                                    size={18}
                                                                />
                                                            </div>
                                                        </td>

                                                        <td className="fw-semibold">
                                                            {category.category_name}
                                                        </td>

                                                        <td>
                                                            {getTypeBadge(category.type)}
                                                        </td>

                                                        <td className="text-end">
                                                            <Button
                                                                size="sm"
                                                                variant="outline-primary"
                                                                className="me-2"
                                                                onClick={() =>
                                                                    handleEdit(category)
                                                                }
                                                            >
                                                                <FiEdit2 />
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="outline-danger"
                                                                onClick={() =>
                                                                    handleDelete(category._id)
                                                                }
                                                            >
                                                                <FiTrash2 />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="text-center py-4 text-muted"
                                                >
                                                    {search.trim() ? (
                                                        <div>
                                                            <FiSearch size={22} className="mb-2 opacity-50" />
                                                            <p className="mb-0">
                                                                No categories found matching "<strong>{search}</strong>"
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        "No categories found"
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                            <div className="d-md-none">
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map((category, index) => {
                                        const isLast = index === filteredCategories.length - 1;

                                        return (
                                            <div
                                                key={category._id}
                                                className={`d-flex justify-content-between align-items-center py-3 ${!isLast ? "border-bottom" : ""}`}
                                                style={{ borderColor: "var(--border)" }}
                                            >
                                                <div className="d-flex align-items-center gap-3 me-2 text-truncate">
                                                    <div className={`category-icon-box ${category.type || "expense"} flex-shrink-0`}>
                                                        <CategoryIcon
                                                            icon={category.icon}
                                                            categoryName={category.category_name}
                                                            type={category.type}
                                                            size={18}
                                                        />
                                                    </div>

                                                    <div className="text-truncate">
                                                        <div className="fw-semibold text-dark text-truncate" style={{ fontSize: "14.5px" }}>
                                                            {category.category_name}
                                                        </div>
                                                        <div className="mt-1">
                                                            {getTypeBadge(category.type)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        onClick={() => handleEdit(category)}
                                                        disabled={loading}
                                                        className="d-flex align-items-center justify-content-center"
                                                        style={{ width: 34, height: 34, padding: 0, borderRadius: 8 }}
                                                        aria-label="Edit category"
                                                    >
                                                        <FiEdit2 size={14} />
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        onClick={() => handleDelete(category._id)}
                                                        disabled={loading}
                                                        className="d-flex align-items-center justify-content-center"
                                                        style={{ width: 34, height: 34, padding: 0, borderRadius: 8 }}
                                                        aria-label="Delete category"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        {search.trim() ? (
                                            <div>
                                                <FiSearch size={22} className="mb-2 opacity-50" />
                                                <p className="mb-0">
                                                    No categories found matching "<strong>{search}</strong>"
                                                </p>
                                            </div>
                                        ) : (
                                            "No categories found"
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>

            <ReusableFormModal<CategoryPayload>
                show={showModal}
                title={
                    editingCategory
                        ? "Edit Category"
                        : "Add Category"
                }
                fields={fields}
                values={formData}
                loading={loading}
                error={error}
                submitText={
                    editingCategory
                        ? "Update Category"
                        : "Create Category"
                }
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={handleClose}
            />

            <Modal
                show={Boolean(deleteId)}
                onClose={() => setDeleteId(null)}
                title="Delete Category"
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                loading={loading}
            >
                Are you sure you want to delete this category? This action cannot be undone.
            </Modal>
        </div>
    );
};

export default CategoryPage;