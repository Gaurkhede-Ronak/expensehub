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
import { DEFAULT_OPTION_COLORS } from "../constants/optionColors";

import {
    getAllTransactionsThunk,
    createTransactionThunk,
    updateTransactionThunk,
    deleteTransactionThunk,
    setSelectedTransaction,
    clearSelectedTransaction,
    clearTransactionError,
} from "../features/transactions/transactionsSlice";

import { getAllCategoriesThunk } from "../features/category/categorySlice";
import { getAllPartiesThunk } from "../features/party/partySlice";
import { getAllBudgetsThunk } from "../features/budget/budgetSlice";

import type {
    Transaction,
    TransactionPayload,
    TransactionType,
} from "../features/transactions/transactionsTypes";

interface TransactionFormValues {
    categoryid: string;
    partyid: string;
    type: TransactionType;
    title: string;
    amount: string;
    date: string;
    description: string;
}

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const initialForm: TransactionFormValues = {
    categoryid: "",
    partyid: "",
    type: "expense",
    title: "",
    amount: "",
    date: getTodayDate(),
    description: "",
};

const TransactionPage = () => {
    const dispatch = useAppDispatch();

    const {
        transactions,
        selectedTransaction,
        loading,
        error,
    } = useAppSelector((state) => state.transaction);

    const { categories } = useAppSelector((state) => state.category);
    const { parties } = useAppSelector((state) => state.party);
    const { budgets } = useAppSelector((state) => state.budget);

    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    const [formData, setFormData] =
        useState<TransactionFormValues>(initialForm);

    useEffect(() => {
        dispatch(getAllTransactionsThunk());
        dispatch(getAllCategoriesThunk());
        dispatch(getAllPartiesThunk());
        dispatch(getAllBudgetsThunk());
    }, [dispatch]);

    const getCategoryName = useCallback((transaction: Transaction) => {
        if (typeof transaction.categoriesid === "object" && transaction.categoriesid !== null) {
            return (
                (transaction.categoriesid as any).categories_name ||
                (transaction.categoriesid as any).category_name ||
                "Unknown"
            );
        }
        const id = transaction.categoryid || transaction.categoriesid;
        const cat = categories.find((c) => c._id === id);
        return cat?.category_name || (cat as any)?.categories_name || "Unknown";
    }, [categories]);

    const getPartyName = useCallback((transaction: Transaction) => {
        if (typeof transaction.party_id === "object" && transaction.party_id !== null) {
            return (transaction.party_id as any).party_name || "Unknown";
        }
        const id = transaction.partyid || transaction.party_id;
        const party = parties.find((p) => p._id === id);
        return party?.party_name || "Unknown";
    }, [parties]);

    const filteredTransactions = useMemo(() => {
        const query = search.trim().toLowerCase();
        return transactions.filter((transaction) => {
            const catName = getCategoryName(transaction).toLowerCase();
            const prtName = getPartyName(transaction).toLowerCase();
            const title = (transaction.title || "").toLowerCase();
            const desc = (transaction.description || "").toLowerCase();
            const amountStr = String(transaction.amount || "");

            const matchesSearch =
                !query ||
                title.includes(query) ||
                catName.includes(query) ||
                prtName.includes(query) ||
                desc.includes(query) ||
                amountStr.includes(query);

            const matchesType =
                typeFilter === "all" || transaction.type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [transactions, search, typeFilter, getCategoryName, getPartyName]);

    const handleOpenAdd = () => {
        dispatch(clearSelectedTransaction());
        dispatch(clearTransactionError());

        setFormData(initialForm);
        setShowModal(true);
    };

    const handleEdit = (transaction: Transaction) => {
        dispatch(setSelectedTransaction(transaction));
        dispatch(clearTransactionError());

        const catId =
            typeof transaction.categoriesid === "object" && transaction.categoriesid !== null
                ? (transaction.categoriesid as any)._id
                : transaction.categoriesid || transaction.categoryid || "";

        const prtId =
            typeof transaction.party_id === "object" && transaction.party_id !== null
                ? (transaction.party_id as any)._id
                : transaction.party_id || transaction.partyid || "";

        setFormData({
            categoryid: catId,
            partyid: prtId,
            type: transaction.type,
            title: transaction.title,
            amount: String(transaction.amount),
            date: transaction.date ? transaction.date.slice(0, 10) : getTodayDate(),
            description: transaction.description || "",
        });

        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);

        dispatch(clearSelectedTransaction());
        dispatch(clearTransactionError());

        setFormData(initialForm);
    };

    const handleChange = (name: string, value: string) => {
        if (name === "categoryid") {
            const selectedCat = categories.find((c) => c._id === value);
            setFormData((previous) => ({
                ...previous,
                categoryid: value,
                ...(selectedCat?.type ? { type: selectedCat.type } : {}),
            }));
            return;
        }

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const payload: TransactionPayload = {
            ...formData,
            categoriesid: formData.categoryid,
            categoryid: formData.categoryid,
            party_id: formData.partyid,
            partyid: formData.partyid,
            amount: Number(formData.amount),
            date: formData.date,
        };

        if (
            !Number.isFinite(payload.amount) ||
            payload.amount < 0
        ) {
            return;
        }

        try {
            let result: any;
            if (selectedTransaction) {
                result = await dispatch(
                    updateTransactionThunk({
                        id: selectedTransaction._id,
                        data: payload,
                    })
                ).unwrap();
                toast.success("Transaction updated successfully");
            } else {
                result = await dispatch(
                    createTransactionThunk(payload)
                ).unwrap();
                toast.success("Transaction created successfully");
            }

            const backendAlert = (result as any)?.budgetAlert;
            if (backendAlert?.exceeded) {
                toast.warning(`⚠️ ${backendAlert.message}`, {
                    autoClose: 6000,
                });
            } else if (payload.type === "expense") {
                const targetMonth = (payload.date || "").slice(0, 7);
                const matchingBudget = budgets.find((b) => {
                    const bCatId =
                        typeof b.categoryid === "object" && b.categoryid !== null
                            ? (b.categoryid as any)._id
                            : b.categoryid;
                    return bCatId === payload.categoryid && b.month === targetMonth;
                });

                if (matchingBudget) {
                    const existingExpenses = transactions
                        .filter((t) => {
                            const tCatId =
                                typeof t.categoriesid === "object" && t.categoriesid !== null
                                    ? (t.categoriesid as any)._id
                                    : t.categoryid || t.categoriesid;
                            const tMonth = (t.date || "").slice(0, 7);
                            const isNotCurrent = !selectedTransaction || t._id !== selectedTransaction._id;
                            return (
                                t.type === "expense" &&
                                tCatId === payload.categoryid &&
                                tMonth === targetMonth &&
                                isNotCurrent
                            );
                        })
                        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

                    const totalAfter = existingExpenses + Number(payload.amount);

                    if (totalAfter > matchingBudget.amount) {
                        const catObj = categories.find((c) => c._id === payload.categoryid);
                        const catName = catObj?.category_name || catObj?.categories_name || "Category";
                        toast.warning(
                            `⚠️ Your budget for ${catName} was ₹${matchingBudget.amount.toLocaleString("en-IN")}, but total expense reached ₹${totalAfter.toLocaleString("en-IN")}!`,
                            { autoClose: 6000 }
                        );
                    }
                }
            }

            handleClose();
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : err?.message || "Failed to save transaction");
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        dispatch(clearTransactionError());

        try {
            setDeleteLoading(true);
            await dispatch(deleteTransactionThunk(deleteId)).unwrap();
            toast.success("Transaction deleted successfully");
            setDeleteId(null);
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : err?.message || "Failed to delete transaction");
        } finally {
            setDeleteLoading(false);
        }
    };

    const transactionFields: FormField[] = [
        {
            name: "type",
            label: "Transaction Type",
            type: "select",
            required: true,
            col: 6,
            options: [
                { label: "Expense", value: "expense", color: "#ef4444" },
                { label: "Income", value: "income", color: "#10b981" },
                { label: "Investment", value: "investment", color: "#3b82f6" },
            ],
        },
        {
            name: "date",
            label: "Transaction Date",
            type: "date",
            required: true,
            col: 6,
        },
        {
            name: "categoryid",
            label: "Category",
            type: "select",
            required: true,
            col: 6,
            options: categories.map((category) => ({
                label: category.category_name || category.categories_name || "Category",
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
            name: "partyid",
            label: "Party",
            type: "select",
            required: true,
            col: 6,
            options: parties.map((party) => ({
                label: `${party.party_name} (${party.party_type})`,
                value: party._id,
                color:
                    DEFAULT_OPTION_COLORS[(party.party_type || "").toLowerCase()] ||
                    "#38bdf8",
            })),
        },
        {
            name: "title",
            label: "Transaction Title",
            type: "text",
            placeholder: "e.g. October Salary",
            required: true,
            col: 6,
        },
        {
            name: "amount",
            label: "Amount (₹)",
            type: "number",
            placeholder: "Enter amount",
            required: true,
            col: 6,
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Enter description (optional)",
            col: 12,
        },
    ];

    const formatAmount = (amount: number) => {
        const val = Number(amount) || 0;
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(val);
    };

    const formatDate = (date: string) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return Number.isNaN(d.getTime()) ? String(date) : d.toLocaleDateString("en-IN");
    };

    const typeVariant = (type: TransactionType) => {
        if (type === "income") return "success";
        if (type === "expense") return "danger";
        return "primary";
    };

    const typeOptions: SelectOption[] = [
        { value: "all", label: "All Types", color: "#94a3b8" },
        { value: "income", label: "Income", color: "#10b981" },
        { value: "expense", label: "Expense", color: "#ef4444" },
        { value: "investment", label: "Investment", color: "#3b82f6" },
    ];

    return (
        <div className="transaction-page">

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Transactions</h3>
                    <p className="text-muted mb-0">
                        Track all your income, expenses and investments.
                    </p>
                </div>

                <Button onClick={handleOpenAdd}>
                    <FiPlus className="me-2" />
                    Add Transaction
                </Button>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <p className="text-muted mb-2">Total Income</p>
                            <h4 className="fw-bold text-success mb-0">
                                {formatAmount(
                                    transactions
                                        .filter((item) => item.type === "income")
                                        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
                                )}
                            </h4>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-md-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <p className="text-muted mb-2">Total Expenses</p>
                            <h4 className="fw-bold text-danger mb-0">
                                {formatAmount(
                                    transactions
                                        .filter((item) => item.type === "expense")
                                        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
                                )}
                            </h4>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-md-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <p className="text-muted mb-2">Total Investments</p>
                            <h4 className="fw-bold text-primary mb-0">
                                {formatAmount(
                                    transactions
                                        .filter((item) => item.type === "investment")
                                        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
                                )}
                            </h4>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4">
                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                            <h5 className="fw-semibold mb-0 text-nowrap">
                                All Transactions
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
                                {filteredTransactions.length !== transactions.length
                                    ? `${filteredTransactions.length} of ${transactions.length}`
                                    : transactions.length}
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
                                    placeholder="Search transaction..."
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
                                    value={typeFilter}
                                    onChange={setTypeFilter}
                                    options={typeOptions}
                                    ariaLabel="Filter transactions by type"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {loading && transactions.length === 0 ? (
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
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Party</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredTransactions.length > 0 ? (
                                            filteredTransactions.map((transaction, index) => (
                                                <tr key={transaction._id}>
                                                    <td>{index + 1}</td>

                                                    <td>
                                                        <div className="fw-semibold">
                                                            {transaction.title}
                                                        </div>
                                                        <small className="text-muted">
                                                            {transaction.description}
                                                        </small>
                                                    </td>

                                                    <td>
                                                        {getCategoryName(transaction)}
                                                    </td>

                                                    <td>
                                                        {getPartyName(transaction)}
                                                    </td>

                                                    <td>
                                                        <Badge bg={typeVariant(transaction.type)}>
                                                            {transaction.type}
                                                        </Badge>
                                                    </td>

                                                    <td className="fw-semibold">
                                                        {formatAmount(transaction.amount)}
                                                    </td>

                                                    <td>{formatDate(transaction.date)}</td>

                                                    <td>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            className="me-2"
                                                            onClick={() => handleEdit(transaction)}
                                                            disabled={loading}
                                                        >
                                                            <FiEdit2 />
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="outline-danger"
                                                            onClick={() => handleDelete(transaction._id)}
                                                            disabled={loading}
                                                        >
                                                            <FiTrash2 />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="text-center text-muted py-4"
                                                >
                                                    {search.trim() ? (
                                                        <div>
                                                            <FiSearch size={22} className="mb-2 opacity-50" />
                                                            <p className="mb-0">
                                                                No transactions found matching "<strong>{search}</strong>"
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        "No transactions found."
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                            <div className="d-md-none">
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((transaction, index) => {
                                        const catName = getCategoryName(transaction);
                                        const prtName = getPartyName(transaction);
                                        const dateStr = formatDate(transaction.date);
                                        const isLast = index === filteredTransactions.length - 1;

                                        return (
                                            <div
                                                key={transaction._id}
                                                className={`py-3 ${!isLast ? "border-bottom" : ""}`}
                                                style={{ borderColor: "var(--border)" }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="me-2 text-truncate">
                                                        <div className="fw-bold text-dark text-capitalize text-truncate" style={{ fontSize: "15px" }}>
                                                            {transaction.title}
                                                        </div>
                                                        <div className="text-muted small mt-1 text-truncate" style={{ fontSize: "13px" }}>
                                                            {catName} • {prtName} • {dateStr}
                                                        </div>
                                                        {transaction.description && (
                                                            <div className="text-secondary small mt-1 text-truncate" style={{ fontSize: "12px", opacity: 0.85 }}>
                                                                {transaction.description}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="text-end flex-shrink-0">
                                                        <div
                                                            className={`fw-bold ${
                                                                transaction.type === "expense"
                                                                    ? "text-danger"
                                                                    : transaction.type === "income"
                                                                    ? "text-success"
                                                                    : "text-primary"
                                                            }`}
                                                            style={{ fontSize: "15px" }}
                                                        >
                                                            {transaction.type === "expense"
                                                                ? `-₹${Number(transaction.amount).toLocaleString("en-IN")}`
                                                                : transaction.type === "income"
                                                                ? `+₹${Number(transaction.amount).toLocaleString("en-IN")}`
                                                                : `₹${Number(transaction.amount).toLocaleString("en-IN")}`}
                                                        </div>

                                                        <Badge
                                                            bg={typeVariant(transaction.type)}
                                                            className="rounded-pill mt-1 px-2 py-1"
                                                            style={{ fontSize: "11px" }}
                                                        >
                                                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="d-flex justify-content-end gap-2 mt-2 pt-2 border-top" style={{ borderColor: "rgba(34, 50, 75, 0.4)" }}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        className="px-3 py-1 d-inline-flex align-items-center gap-1"
                                                        onClick={() => handleEdit(transaction)}
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
                                                        onClick={() => handleDelete(transaction._id)}
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
                                                    No transactions found matching "<strong>{search}</strong>"
                                                </p>
                                            </div>
                                        ) : (
                                            "No transactions found."
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
                    selectedTransaction
                        ? "Edit Transaction"
                        : "Add Transaction"
                }
                fields={transactionFields}
                values={formData}
                loading={loading}
                error={error}
                submitText={
                    selectedTransaction
                        ? "Update Transaction"
                        : "Create Transaction"
                }
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={handleClose}
            />

            <CommonModal
                show={Boolean(deleteId)}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Transaction"
                confirmText="Delete"
                confirmVariant="danger"
                loading={deleteLoading}
            >
                <p className="mb-0 text-secondary">
                    Are you sure you want to delete this transaction? This action cannot be undone.
                </p>
            </CommonModal>
        </div>
    );
};

export default TransactionPage;
