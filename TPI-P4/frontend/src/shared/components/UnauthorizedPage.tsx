import { Link } from "react-router-dom";

export function UnauthorizedPage() {
    return (
        <section
            aria-labelledby="unauthorized-title"
            className="flex min-h-[60vh] flex-col items-center justify-center text-center"
        >
            <h1
                id="unauthorized-title"
                className="mb-3 text-3xl font-bold text-slate-800 dark:text-slate-100"
            >
                Acceso no autorizado
            </h1>

            <p className="mb-6 text-slate-600 dark:text-slate-400">
                No tenés permisos para acceder a esta sección.
            </p>

            <Link
                to="/"
                className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
                Volver al inicio
            </Link>
        </section>
    );
}