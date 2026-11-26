type LoadingStateProps = {
    mensaje?: string;
};

export function LoadingState({
    mensaje = "Cargando..."
}: LoadingStateProps) {
    return (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
            {mensaje}
        </div>
    );
}