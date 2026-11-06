

import { Navigate, Outlet } from "react-router-dom";
import Loader from "../components/common/loader";
import { useAppSelector } from "../app/hooks";

const ProtectedRoute = () => {
    const { isAuthenticated, initialized } = useAppSelector(
        (state) => state.auth
    );

    if (!initialized) {
        return <Loader />;
    }

    return isAuthenticated
        ? <Outlet />
        : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

 