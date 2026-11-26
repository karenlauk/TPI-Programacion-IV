import { ResumenCard } from "../components/ResumenCard";
import { useResumenPedidos } from "../hook/usePedidos";
import { handleApiError } from "@/shared/api/handleApiError";

export function AdminResumenPage() {
    const resumenQuery = useResumenPedidos();

    if (resumenQuery.isLoading) {
        return <p role="status">Cargando resumen...</p>;
    }

    if (resumenQuery.isError || !resumenQuery.data) {
        return (
            <p role="alert" className="text-red-600">
                {resumenQuery.isError
                    ? handleApiError(resumenQuery.error)
                    : "No se pudo cargar el resumen de pedidos."}
            </p>
        );
    }

    const resumen = resumenQuery.data;

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    Resumen de pedidos
                </h1>

                <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Indicadores generales de actividad.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ResumenCard
                    titulo="Pendientes"
                    valor={resumen.pendientes}
                />

                <ResumenCard
                    titulo="En preparación"
                    valor={resumen.en_preparacion}
                />

                <ResumenCard
                    titulo="Entregados"
                    valor={resumen.entregados}
                />

                <ResumenCard
                    titulo="Cancelados"
                    valor={resumen.cancelados}
                />

                <ResumenCard
                    titulo="Pedidos de hoy"
                    valor={resumen.pedidos_hoy}
                />

                <ResumenCard
                    titulo="Ingresos por pedidos entregados"
                    valor={`$${resumen.ingresos_entregados.toFixed(2)}`}
                />
            </div>
        </section>
    );
}