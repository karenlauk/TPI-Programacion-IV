interface EstadoVacioProps {
    titulo?: string;
    mensaje: string;
    accion?: () => void;
    textoAccion?: string;
}

export function EstadoVacio({
    titulo,
    mensaje,
    accion,
    textoAccion = "Volver",
}: EstadoVacioProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800">
            {titulo && (
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {titulo}
                </h2>
            )}

            <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
                {mensaje}
            </p>

            {accion && (
                <button
                    type="button"
                    onClick={accion}
                    className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                    {textoAccion}
                </button>
            )}
        </div>
    );
}