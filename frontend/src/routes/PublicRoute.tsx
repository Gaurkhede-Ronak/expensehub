import { Navigate, Outlet } from "react-router-dom";
import Loader from "../components/common/loader";
import { useAppSelector } from "../app/hooks";

const PublicRoute = () => {
    const { isAuthenticated, initialized } = useAppSelector(
        (state) => state.auth
    );

    if (!initialized) {
        return <Loader />;
    }

    return isAuthenticated
        ? <Navigate to="/dashboard" replace />
        : <Outlet />;
};

export default PublicRoute;