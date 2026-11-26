interface ResumenCardProps {
    titulo: string;
    valor: string | number;
    descripcion?: string;
}

export function ResumenCard({
    titulo,
    valor,
    descripcion,
}: ResumenCardProps) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {titulo}
            </p>

            <p className="mt-2 text-3xl font-bold">
                {valor}
            </p>

            {descripcion && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {descripcion}
                </p>
            )}
        </article>
    );
}