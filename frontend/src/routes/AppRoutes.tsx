import {
    createBrowserRouter,
    Navigate,
} from "react-router-dom";

import AuthLayout from "../components/layout/authLayout";
import MainLayout from "../components/layout/MainLayout";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../page/Login";
import Register from "../page/Register";
import CategoryPage from "../page/Category";
import PartyPage from "../page/party";
import TransactionPage from "../page/Transactions";
import BudgetPage from "../page/Budget";
import Dashboard from "../page/Dashboard";
import Settings from "../page/Settings";
import Profile from "../page/Profile";

const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        children: [
            {
                element: <AuthLayout />,
                children: [
                    {
                        path: "/login",
                        element: <Login />,
                    },
                    {
                        path: "/register",
                        element: <Register />,
                    },
                ],
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <MainLayout />,
                children: [
                    {
                        path: "/dashboard",
                        element: <Dashboard />,
                    },
                    {
                        path: "/categories",
                        element: <CategoryPage />,
                    },
                    {
                        path: "/parties",
                        element: <PartyPage />,
                    },
                    {
                        path: "/transactions",
                        element: <TransactionPage />,
                    },
                    {
                        path: "/budgets",
                        element: <BudgetPage />,
                    },
                    {
                        path: "/settings",
                        element: <Settings />,
                    },
                    {
                        path: "/profile",
                        element: <Profile />,
                    },
                ],
            },
        ],
    },
    {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
    },
    {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
    },
]);
 
export default router;