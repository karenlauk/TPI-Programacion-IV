interface EstadoErrorProps {
    mensaje: string;
    titulo?: string;
}

export function EstadoError({
    mensaje,
    titulo = "Ocurrió un error",
}: EstadoErrorProps) {
    return (
        <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center dark:border-red-900 dark:bg-red-950"
        >
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">
                {titulo}
            </h2>

            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                {mensaje}
            </p>
        </div>
    );
}