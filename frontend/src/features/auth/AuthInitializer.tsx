import { useEffect, type ReactNode } from "react";
import { useAppDispatch } from "../../app/hooks";
import { getCurrentUserThunk } from "./authSlice";
 
interface Props {
    children: ReactNode;
}
 
const AuthInitializer = ({ children }: Props) => {
    const dispatch = useAppDispatch();
 
    useEffect(() => {
        dispatch(getCurrentUserThunk());
    }, [dispatch]);
 
    return <>{children}</>;
};
 
export default AuthInitializer;