import { useEffect } from "react";
import { useAuth } from "@/features/auth";
import { AppRouter } from "@/routes/AppRouter";
import { Toast } from "@/shared/components/Toast";

export default function App() {
    const { checkAuth, checking } = useAuth();

    useEffect(() => {
        void checkAuth();
    }, [checkAuth]);

    return (
        <>
            {checking ? (
                <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <p
                        role="status"
                        className="text-slate-600 dark:text-slate-300"
                    >
                        Verificando sesión...
                    </p>
                </div>
            ) : (
                <AppRouter />
            )}

            <Toast />
        </>
    );
}