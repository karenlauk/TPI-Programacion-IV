interface SkeletonProps {
    cantidad?: number;
}

export function Skeleton({ cantidad = 8 }: SkeletonProps) {
    return (
        <div
            role="status"
            aria-label="Cargando productos"
            aria-busy="true"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
            {Array.from({ length: cantidad }).map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                >
                    <div className="h-48 bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-3 p-4">
                        <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-6 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-10 w-full rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                </div>
            ))}

            <span className="sr-only">
                Cargando productos...
            </span>
        </div>
    );
}