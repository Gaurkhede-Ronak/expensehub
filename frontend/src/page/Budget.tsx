import { useCallback, useEffect, useMemo, useState } from "react";

import {
    Badge,
    Button,
    Card,
    Form,
    InputGroup,
    Spinner,
    Table,
} from "react-bootstrap";

import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import CommonModal from "../components/common/CommonModal";
import { CustomSelect, type SelectOption } from "../components/common/CustomSelect";
import ReusableFormModal, {
    type FormField,
} from "../components/common/ReusableFormModal";

import {
    getAllBudgetsThunk,
    createBudgetThunk,
    updateBudgetThunk,
    deleteBudgetThunk,
    setSelectedBudget,
    clearSelectedBudget,
    clearBudgetError,
} from "../features/budget/budgetSlice";

import { getAllCategoriesThunk } from "../features/category/categorySlice";

import type {
    Budget,
    BudgetPayload,
} from "../features/budget/budgetTypes";

interface BudgetFormValues {
    categoryid: string;
    amount: string;
    month: string;
}

const getCurrentMonth = () => {
    const today = new Date();

    return `${today.getFullYear()}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}`;
};

const initialForm: BudgetFormValues = {
    categoryid: "",
    amount: "",
    month: getCurrentMonth(),
};

const BudgetPage = () => {
    const dispatch = useAppDispatch();

    const {
        budgets,
        selectedBudget,
        loading,
        error,
    } = useAppSelector((state) => state.budget);

    const { categories } = useAppSelector(
        (state) => state.category
    );

    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [monthFilter, setMonthFilter] = useState("all");

    const [formData, setFormData] =
        useState<BudgetFormValues>(initialForm);

    useEffect(() => {
        dispatch(getAllBudgetsThunk());
        dispatch(getAllCategoriesThunk());
    }, [dispatch]);

    const getCategoryObj = useCallback((budget: Budget) => {
        if (typeof budget.categoryid === "object" && budget.categoryid !== null) {
            return budget.categoryid as any;
        }
        const id = typeof budget.categoryid === "string" ? budget.categoryid : (budget as any)?.category_id;
        return categories.find((category) => category._id === id);
    }, [categories]);

    const getCategoryName = (budget: Budget) => {
        const cat = getCategoryObj(budget);
        return cat?.category_name || cat?.categories_name || "Unknown Category";
    };

    const getCategoryType = (budget: Budget) => {
        const cat = getCategoryObj(budget);
        return (cat?.type || "unknown").toLowerCase();
    };

    const filteredBudgets = useMemo(() => {
        const q = search.trim().toLowerCase();
        return budgets.filter((budget) => {
            const cat = getCategoryObj(budget);
            const categoryName = (cat?.category_name || cat?.categories_name || "").toLowerCase();
            const categoryType = (cat?.type || "").toLowerCase();
            const amountStr = String(budget.amount || "");
            const monthStr = (budget.month || "").toLowerCase();

            const matchesSearch =
                !q ||
                categoryName.includes(q) ||
                categoryType.includes(q) ||
                amountStr.includes(q) ||
                monthStr.includes(q);

            const matchesMonth =
                monthFilter === "all" || budget.month === monthFilter;

            return matchesSearch && matchesMonth;
        });
    }, [budgets, getCategoryObj, search, monthFilter]);

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatMonth = (month: string) => {
        if (!month || typeof month !== "string" || !month.includes("-")) {
            return month || "N/A";
        }
        const [year, monthNumber] = month.split("-").map(Number);
        if (!year || !monthNumber) return month;

        const d = new Date(year, monthNumber - 1);
        if (Number.isNaN(d.getTime())) return month;

        return d.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
        });
    };

    const budgetFields: FormField[] = [
        {
            name: "categoryid",
            label: "Category",
            type: "select",
            required: true,
            col: 12,
            options: categories.map((category) => ({
                label: `${category.category_name || category.categories_name || "Category"} (${category.type})`,
                value: category._id,
                color:
                    category.type === "income"
                        ? "#10b981"
                        : category.type === "investment"
                        ? "#3b82f6"
                        : "#ef4444",
            })),
        },
        {
            name: "month",
            label: "Budget Month",
            type: "month",
            required: true,
            col: 6,
        },
        {
            name: "amount",
            label: "Budget Amount (₹)",
            type: "number",
            placeholder: "Enter budget amount",
            required: true,
            col: 6,
        },
    ];

    const handleOpenAdd = () => {
        dispatch(clearSelectedBudget());
        dispatch(clearBudgetError());

        setFormData(initialForm);
        setShowModal(true);
    };

    const handleEdit = (budget: Budget) => {
        dispatch(setSelectedBudget(budget));
        dispatch(clearBudgetError());

        const catId =
            typeof budget.categoryid === "object" && budget.categoryid !== null
                ? (budget.categoryid as any)._id
                : budget.categoryid || "";

        setFormData({
            categoryid: catId,
            amount: String(budget.amount),
            month: budget.month,
        });

        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);

        dispatch(clearSelectedBudget());
        dispatch(clearBudgetError());

        setFormData(initialForm);
    };

    const handleChange = (name: string, value: string) => {
        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const amount = Number(formData.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        const payload: BudgetPayload = {
            categoryid: formData.categoryid,
            amount,
            month: formData.month,
        };

        try {
            if (selectedBudget) {
                await dispatch(
                    updateBudgetThunk({
                        id: selectedBudget._id,
                        data: payload,
                    })
                ).unwrap();
                toast.success("Budget updated successfully");
            } else {
                await dispatch(
                    createBudgetThunk(payload)
                ).unwrap();
                toast.success("Budget created successfully");
            }

            handleClose();
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : err?.message || "Failed to save budget");
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        dispatch(clearBudgetError());

        try {
            setDeleteLoading(true);
            await dispatch(deleteBudgetThunk(deleteId)).unwrap();
            toast.success("Budget deleted successfully");
            setDeleteId(null);
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : err?.message || "Failed to delete budget");
        } finally {
            setDeleteLoading(false);
        }
    };

    const totalBudget = filteredBudgets.reduce(
        (sum, budget) => sum + budget.amount,
        0
    );

    const monthOptions: SelectOption[] = useMemo(() => {
        const uniqueMonths = [...new Set(budgets.map((budget) => budget.month))]
            .sort()
            .reverse();
        return [
            { value: "all", label: "All Months", color: "#94a3b8" },
            ...uniqueMonths.map((m) => ({
                value: m,
                label: formatMonth(m),
                color: "#3b82f6",
            })),
        ];
    }, [budgets]);

    return (
        <div className="budget-page">

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Budgets</h3>
                    <p className="text-muted mb-0">
                        Plan and manage your monthly category budgets.
                    </p>
                </div>

                <Button onClick={handleOpenAdd}>
                    <FiPlus className="me-2" />
                    Add Budget
                </Button>
            </div>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <p className="text-muted mb-2">
                        Total Budget (Filtered)
                    </p>

                    <h3 className="fw-bold mb-0">
                        {formatAmount(totalBudget)}
                    </h3>

                    <small className="text-muted">
                        {filteredBudgets.length} budget records
                    </small>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4">
                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                            <h5 className="fw-semibold mb-0 text-nowrap">
                                All Budgets
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
                                {filteredBudgets.length !== budgets.length
                                    ? `${filteredBudgets.length} of ${budgets.length}`
                                    : budgets.length}
                            </span>
                        </div>

                        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto align-items-stretch">
                            <InputGroup
                                className="search-input-group flex-grow-1"
                                style={{ minWidth: 220, maxWidth: "100%" }}
                            >
                                <InputGroup.Text>
                                    <FiSearch />
                                </InputGroup.Text>

                                <Form.Control
                                    placeholder="Search category or month..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
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
                            </InputGroup>

                            <div style={{ minWidth: "165px" }}>
                                <CustomSelect
                                    value={monthFilter}
                                    onChange={setMonthFilter}
                                    options={monthOptions}
                                    ariaLabel="Filter budgets by month"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {loading && budgets.length === 0 ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive d-none d-md-block">
                                <Table hover className="align-middle">
                                    <thead>
                                        <tr>
                                            <th>No.</th>
                                            <th>Category</th>
                                            <th>Category Type</th>
                                            <th>Month</th>
                                            <th>Budget Amount</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredBudgets.length > 0 ? (
                                            filteredBudgets.map((budget, index) => {
                                                const catName = getCategoryName(budget);
                                                const catType = getCategoryType(budget);

                                                return (
                                                    <tr key={budget._id}>
                                                        <td>{index + 1}</td>

                                                        <td className="fw-semibold">
                                                            {catName}
                                                        </td>

                                                        <td>
                                                            <Badge
                                                                bg={
                                                                    catType === "expense"
                                                                        ? "danger"
                                                                        : catType === "income"
                                                                        ? "success"
                                                                        : catType === "investment"
                                                                        ? "primary"
                                                                        : "secondary"
                                                                }
                                                            >
                                                                {catType.charAt(0).toUpperCase() + catType.slice(1)}
                                                            </Badge>
                                                        </td>

                                                        <td>
                                                            {formatMonth(budget.month)}
                                                        </td>

                                                        <td className="fw-semibold">
                                                            {formatAmount(budget.amount)}
                                                        </td>

                                                        <td>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-primary"
                                                                className="me-2"
                                                                onClick={() =>
                                                                    handleEdit(budget)
                                                                }
                                                                disabled={loading}
                                                            >
                                                                <FiEdit2 />
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="outline-danger"
                                                                onClick={() =>
                                                                    handleDelete(budget._id)
                                                                }
                                                                disabled={loading}
                                                            >
                                                                <FiTrash2 />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="text-center text-muted py-4"
                                                >
                                                    {search.trim() ? (
                                                        <div>
                                                            <FiSearch size={22} className="mb-2 opacity-50" />
                                                            <p className="mb-0">
                                                                No budgets found matching "<strong>{search}</strong>"
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        "No budgets found."
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                            <div className="d-md-none">
                                {filteredBudgets.length > 0 ? (
                                    filteredBudgets.map((budget, index) => {
                                        const catName = getCategoryName(budget);
                                        const catType = getCategoryType(budget);
                                        const isLast = index === filteredBudgets.length - 1;

                                        return (
                                            <div
                                                key={budget._id}
                                                className={`py-3 ${!isLast ? "border-bottom" : ""}`}
                                                style={{ borderColor: "var(--border)" }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="me-2 text-truncate">
                                                        <div className="fw-bold text-dark text-truncate" style={{ fontSize: "15px" }}>
                                                            {catName}
                                                        </div>
                                                        <div className="text-muted small mt-1">
                                                            {formatMonth(budget.month)}
                                                        </div>
                                                        <div className="mt-1">
                                                            <Badge
                                                                bg={
                                                                    catType === "expense"
                                                                        ? "danger"
                                                                        : catType === "income"
                                                                        ? "success"
                                                                        : catType === "investment"
                                                                        ? "primary"
                                                                        : "secondary"
                                                                }
                                                            >
                                                                {catType.charAt(0).toUpperCase() + catType.slice(1)}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="text-end flex-shrink-0">
                                                        <div className="fw-bold text-primary" style={{ fontSize: "16px" }}>
                                                            {formatAmount(budget.amount)}
                                                        </div>
                                                        <small className="text-muted">Budget Limit</small>
                                                    </div>
                                                </div>

                                                <div className="d-flex justify-content-end gap-2 mt-2 pt-2 border-top" style={{ borderColor: "rgba(34, 50, 75, 0.4)" }}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        className="px-3 py-1 d-inline-flex align-items-center gap-1"
                                                        onClick={() => handleEdit(budget)}
                                                        disabled={loading}
                                                        style={{ fontSize: "12px" }}
                                                    >
                                                        <FiEdit2 size={13} />
                                                        <span>Edit</span>
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        className="px-3 py-1 d-inline-flex align-items-center gap-1"
                                                        onClick={() => handleDelete(budget._id)}
                                                        disabled={loading}
                                                        style={{ fontSize: "12px" }}
                                                    >
                                                        <FiTrash2 size={13} />
                                                        <span>Delete</span>
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
                                                    No budgets found matching "<strong>{search}</strong>"
                                                </p>
                                            </div>
                                        ) : (
                                            "No budgets found."
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>

            <ReusableFormModal
                show={showModal}
                title={
                    selectedBudget ? "Edit Budget" : "Add Budget"
                }
                fields={budgetFields}
                values={formData}
                loading={loading}
                error={error}
                submitText={
                    selectedBudget ? "Update Budget" : "Create Budget"
                }
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={handleClose}
            />

            <CommonModal
                show={Boolean(deleteId)}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Budget"
                confirmText="Delete"
                confirmVariant="danger"
                loading={deleteLoading}
            >
                <p className="mb-0 text-secondary">
                    Are you sure you want to delete this budget? This action cannot be undone.
                </p>
            </CommonModal>
        </div>
    );
};

export default BudgetPage;
