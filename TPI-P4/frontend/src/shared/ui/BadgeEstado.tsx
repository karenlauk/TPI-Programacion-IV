type Estado =
    | "activo"
    | "inactivo"
    | "pendiente"
    | "en_preparacion"
    | "entregado"
    | "cancelado";

interface BadgeEstadoProps {
    estado: Estado | string;
    className?: string;
}

const estilosEstado: Record<Estado, string> = {
    activo: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    inactivo: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",

    pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    en_preparacion: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    entregado: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    cancelado: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const estiloPorDefecto =
    "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";

export function BadgeEstado({
    estado,
    className = "",
}: BadgeEstadoProps) {
    const estadoNormalizado = estado.trim().toLowerCase();

    const estilo =
        estilosEstado[estadoNormalizado as Estado] ?? estiloPorDefecto;

    return (
        <span
            className={`
                inline-flex items-center rounded-full
                px-3 py-1 text-xs font-semibold
                ${estilo}
                ${className}
            `}
        >
            {estado}
        </span>
    );
}