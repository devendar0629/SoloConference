import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { AUTH_NOT_REQUIRED_ROUTES } from "@/config/constants";
import { useStore } from "@/store";

type Props = {
    fallback?: ReactNode;
};

export default function Protected({ fallback = null }: Props) {
    const { isInitializing, isLoggedIn } = useStore((state) => state.auth);
    const location = useLocation();

    const isAuthNotReqd = AUTH_NOT_REQUIRED_ROUTES.includes(location.pathname);

    // While initializing, render fallback to avoid flash
    if (isInitializing) return <>{fallback}</>;

    if (!isAuthNotReqd && !isLoggedIn) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
    if (isAuthNotReqd && isLoggedIn) {
        return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }

    return <Outlet />;
}
