interface PaginacionProps {
    paginaActual: number;
    totalPaginas: number;
    onCambiarPagina: (pagina: number) => void;
}

export function Paginacion({
    paginaActual,
    totalPaginas,
    onCambiarPagina,
}: PaginacionProps) {
    if (totalPaginas <= 1) {
        return null;
    }

    const irPaginaAnterior = () => {
        if (paginaActual > 0) {
            onCambiarPagina(paginaActual - 1);
        }
    };

    const irPaginaSiguiente = () => {
        if (paginaActual < totalPaginas - 1) {
            onCambiarPagina(paginaActual + 1);
        }
    };

    return (
        <nav
            aria-label="Paginación del catálogo"
            className="mt-8 flex items-center justify-center gap-4"
        >
            <button
                type="button"
                onClick={irPaginaAnterior}
                disabled={paginaActual === 0}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
                Anterior
            </button>

            <span
                aria-live="polite"
                className="text-sm text-slate-600 dark:text-slate-300"
            >
                Página {paginaActual + 1} de {totalPaginas}
            </span>

            <button
                type="button"
                onClick={irPaginaSiguiente}
                disabled={paginaActual >= totalPaginas - 1}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
                Siguiente
            </button>
        </nav>
    );
}