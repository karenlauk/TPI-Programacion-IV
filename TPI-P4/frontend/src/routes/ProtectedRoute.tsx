import { Navigate, Outlet, useLocation, } from "react-router-dom";
import { useAuth } from "@/features/auth";
import type { UserRole } from "@/features/auth/types/auth.types";

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

function SessionLoading() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <p
                role="status"
                className="text-slate-600 dark:text-slate-300"
            >
                Verificando sesión...
            </p>
        </div>
    );
}

export function ProtectedRoute({
    allowedRoles,
}: ProtectedRouteProps) {
    const { user, checking } = useAuth();
    const location = useLocation();

    if (checking) {
        return <SessionLoading />;
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: {
                        pathname: location.pathname,
                        search: location.search,
                    },
                }}
            />
        );
    }

    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}

// Evita que un usuario autenticado vuelva a login o registro
export function GuestOnlyRoute() {
    const { user, checking } = useAuth();

    if (checking) {
        return <SessionLoading />;
    }

    if (user) {
        return (
            <Navigate
                to={
                    user.role === "admin"
                        ? "/admin/resumen"
                        : "/"
                }
                replace
            />
        );
    }

    return <Outlet />;
}