import { useEffect, useRef } from "react";
import { RouterProvider } from "react-router-dom";
 
import router from "./routes/AppRoutes";
import { useAppDispatch } from "./app/hooks";
import { getCurrentUserThunk } from "./features/auth/authSlice";
 
import "./App.css";
 
function App() {
    const dispatch = useAppDispatch();
    const initializedRef = useRef(false);
 
    useEffect(() => {
        if (initializedRef.current) return;
 
        initializedRef.current = true;
 
        dispatch(getCurrentUserThunk());
    }, [dispatch]);
 
    return <RouterProvider router={router} />;
}
 
export default App;