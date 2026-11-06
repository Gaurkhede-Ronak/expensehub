import { useCallback, useEffect, useMemo } from "react";

import {
    Badge,
    Card,
    Col,
    Row,
    Spinner,
    Table,
} from "react-bootstrap";

import {
    FiTrendingUp,
    FiTrendingDown,
    FiPieChart,
} from "react-icons/fi";
import { FaIndianRupeeSign } from "react-icons/fa6";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import { getAllTransactionsThunk } from "../features/transactions/transactionsSlice";
import { getAllCategoriesThunk } from "../features/category/categorySlice";
import { getAllPartiesThunk } from "../features/party/partySlice";
import { getAllBudgetsThunk } from "../features/budget/budgetSlice";

import IncomeExpenseChart from "../components/charts/IncomeExpenseChart";
import CategoryExpenseChart from "../components/charts/CategoryExpenseChart";

const Dashboard = () => {
    const dispatch = useAppDispatch();

    const {
        transactions,
        loading: transactionLoading,
    } = useAppSelector((state) => state.transaction);

    const { categories } = useAppSelector((state) => state.category);
    const { parties } = useAppSelector((state) => state.party);
    const { budgets } = useAppSelector((state) => state.budget);

    useEffect(() => {
        dispatch(getAllTransactionsThunk());
        dispatch(getAllCategoriesThunk());
        dispatch(getAllPartiesThunk());
        dispatch(getAllBudgetsThunk());
    }, [dispatch]);

    const income = transactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const expense = transactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const investment = transactions
        .filter((item) => item.type === "investment")
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const balance = income - expense - investment;

    const formatAmount = (amount: number) => {
        const val = Number(amount) || 0;
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(val);
    };

    const formatAmountWithSign = (amount: number, type: string) => {
        const val = Number(amount) || 0;
        const formatted = new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 0,
        }).format(Math.abs(val));

        if (type === "expense") {
            return `-₹${formatted}`;
        }
        if (type === "income") {
            return `+₹${formatted}`;
        }
        return `₹${formatted}`;
    };

    const formatShortDate = (dateString?: string) => {
        if (!dateString) return "Recent";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "Recent";
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };

    const getCategoryName = useCallback((id: string, item?: any) => {
        if (item && typeof item.categoriesid === "object" && item.categoriesid !== null) {
            return (
                item.categoriesid.categories_name ||
                item.categoriesid.category_name ||
                "Unknown"
            );
        }
        const cat = categories.find((c) => c._id === id);
        return cat?.category_name || (cat as any)?.categories_name || "Unknown";
    }, [categories]);

    const getPartyName = useCallback((id: string, item?: any) => {
        if (item && typeof item.party_id === "object" && item.party_id !== null) {
            return item.party_id.party_name || "Unknown";
        }
        const prt = parties.find((p) => p._id === id);
        return prt?.party_name || "Unknown";
    }, [parties]);

    const chartData = useMemo(() => {
        const months = Array.from({ length: 6 }, (_, index) => {
            const date = new Date();
            date.setDate(1);
            date.setMonth(date.getMonth() - (5 - index));

            return {
                key: `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}`,
                label: date.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "2-digit",
                }),
            };
        });

        const getMonthKey = (dateVal: unknown) => {
            if (!dateVal) return "";
            if (typeof dateVal === "string") return dateVal.slice(0, 7);
            try {
                return new Date(dateVal as string | number | Date).toISOString().slice(0, 7);
            } catch {
                return "";
            }
        };

        return {
            labels: months.map((month) => month.label),
            income: months.map((month) =>
                transactions
                    .filter((item) =>
                        item.type === "income" &&
                        getMonthKey(item.date) === month.key
                    )
                    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
            ),
            expense: months.map((month) =>
                transactions
                    .filter((item) =>
                        item.type === "expense" &&
                        getMonthKey(item.date) === month.key
                    )
                    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
            ),
        };
    }, [transactions]);

    const categoryExpenses = useMemo(() => {
        const expenseTransactions = transactions.filter(
            (item) => item.type === "expense"
        );

        const totals = new Map<string, number>();

        expenseTransactions.forEach((item) => {
            const catId = item.categoryid || (typeof item.categoriesid === "object" && item.categoriesid ? item.categoriesid._id : item.categoriesid) || "unknown";
            totals.set(
                String(catId),
                (totals.get(String(catId)) || 0) + (Number(item.amount) || 0)
            );
        });

        return Array.from(totals.entries()).map(([id, amount]) => ({
            label: getCategoryName(id),
            amount,
        }));
    }, [transactions, getCategoryName]);

    const recentTransactions = [...transactions]
        .sort(
            (a, b) =>
                new Date(b.date).getTime() -
                new Date(a.date).getTime()
        )
        .slice(0, 5);

    const summaryCards = [
        {
            title: "Total Income",
            amount: income,
            icon: <FiTrendingUp size={22} />,
            color: "success",
        },
        {
            title: "Total Expenses",
            amount: expense,
            icon: <FiTrendingDown size={22} />,
            color: "danger",
        },
        {
            title: "Total Investment",
            amount: investment,
            icon: <FiPieChart size={22} />,
            color: "primary",
        },
        {
            title: "Available Balance",
            amount: balance,
            icon: <FaIndianRupeeSign size={20} />,
            color: "success",
        },
    ] as const;

    return (
        <div className="dashboard-page">

            <div className="mb-4">
                <h3 className="fw-bold mb-1">Dashboard</h3>
                <p className="text-muted mb-0">
                    Here's your financial overview.
                </p>
            </div>

            {transactionLoading && transactions.length === 0 ? (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                    <p className="text-muted mt-3">
                        Loading dashboard...
                    </p>
                </div>
            ) : (
                <>
                    <Row className="g-2 g-sm-3 mb-4">
                        {summaryCards.map((item) => (
                            <Col xs={6} sm={6} xl={3} key={item.title}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted small fw-medium text-truncate me-1">
                                                {item.title}
                                            </span>

                                            <span className={`text-${item.color} fs-5`}>
                                                {item.icon}
                                            </span>
                                        </div>

                                        <h4 className="fw-bold mb-0 fs-5 fs-sm-4 text-truncate">
                                            {formatAmount(item.amount)}
                                        </h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Row className="g-2 g-sm-3 mb-4">
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <h5 className="fw-semibold mb-4">
                                        Income vs Expenses
                                    </h5>

                                    <IncomeExpenseChart
                                        labels={chartData.labels}
                                        income={chartData.income}
                                        expense={chartData.expense}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <h5 className="fw-semibold mb-4">
                                        Expense by Category
                                    </h5>

                                    {categoryExpenses.length > 0 ? (
                                        <CategoryExpenseChart
                                            labels={categoryExpenses.map(
                                                (item) => item.label
                                            )}
                                            amounts={categoryExpenses.map(
                                                (item) => item.amount
                                            )}
                                        />
                                    ) : (
                                        <div className="text-center text-muted py-5">
                                            No expense data available.
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-3 p-sm-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="fw-bold mb-0 fs-5 text-dark">
                                    Recent Transactions
                                </h4>

                                <Badge bg="light" text="dark" className="px-2 py-1 border rounded-pill">
                                    Latest 5
                                </Badge>
                            </div>

                            <div className="table-responsive d-none d-md-block">
                                <Table hover className="align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Party</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {recentTransactions.length > 0 ? (
                                            recentTransactions.map((item) => (
                                                <tr key={item._id}>
                                                    <td className="fw-medium text-dark text-capitalize">{item.title}</td>

                                                    <td>
                                                        {getCategoryName(item.categoryid, item)}
                                                    </td>

                                                    <td>
                                                        {getPartyName(item.partyid, item)}
                                                    </td>

                                                    <td>
                                                        <Badge
                                                            bg={
                                                                item.type === "income"
                                                                    ? "success"
                                                                    : item.type === "expense"
                                                                    ? "danger"
                                                                    : "primary"
                                                            }
                                                            className="rounded-pill px-2 py-1"
                                                        >
                                                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                        </Badge>
                                                    </td>

                                                    <td className={`fw-bold ${item.type === "expense" ? "text-danger" : item.type === "income" ? "text-success" : "text-primary"}`}>
                                                        {formatAmountWithSign(Number(item.amount) || 0, item.type)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4 text-muted">
                                                    No transactions available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                            <div className="d-md-none">
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((item, index) => {
                                        const catName = getCategoryName(item.categoryid, item);
                                        const prtName = getPartyName(item.partyid, item);
                                        const dateStr = formatShortDate(item.date);
                                        const isLast = index === recentTransactions.length - 1;

                                        return (
                                            <div
                                                key={item._id}
                                                className={`d-flex justify-content-between align-items-center py-3 ${!isLast ? "border-bottom" : ""}`}
                                            >
                                                <div className="me-3 text-truncate">
                                                    <div className="fw-bold text-dark text-capitalize text-truncate" style={{ fontSize: "15px" }}>
                                                        {item.title}
                                                    </div>
                                                    <div className="text-muted small mt-1 text-truncate" style={{ fontSize: "13px" }}>
                                                        {catName} • {prtName} • {dateStr}
                                                    </div>
                                                </div>

                                                <div className="text-end flex-shrink-0">
                                                    <div
                                                        className={`fw-bold ${
                                                            item.type === "expense"
                                                                ? "text-danger"
                                                                : item.type === "income"
                                                                ? "text-success"
                                                                : "text-primary"
                                                        }`}
                                                        style={{ fontSize: "15px" }}
                                                    >
                                                        {formatAmountWithSign(Number(item.amount) || 0, item.type)}
                                                    </div>

                                                    <Badge
                                                        bg={
                                                            item.type === "income"
                                                                ? "success"
                                                                : item.type === "expense"
                                                                ? "danger"
                                                                : "primary"
                                                        }
                                                        className="rounded-pill mt-1 px-2 py-1"
                                                        style={{ fontSize: "11px" }}
                                                    >
                                                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        No transactions available.
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h5 className="fw-semibold mb-3">
                                Budget Overview
                            </h5>

                            <Row className="g-3">
                                <Col md={6}>
                                    <p className="text-muted mb-1">
                                        Total Budget Records
                                    </p>
                                    <h4 className="fw-bold">
                                        {budgets.length}
                                    </h4>
                                </Col>

                                <Col md={6}>
                                    <p className="text-muted mb-1">
                                        Total Budget Amount
                                    </p>
                                    <h4 className="fw-bold">
                                        {formatAmount(
                                            budgets.reduce(
                                                (sum, item) => sum + item.amount,
                                                0
                                            )
                                        )}
                                    </h4>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </>
            )}
        </div>
    );
};

export default Dashboard;
