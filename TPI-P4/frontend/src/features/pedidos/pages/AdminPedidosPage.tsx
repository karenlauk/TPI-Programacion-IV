import { useCallback, useState } from "react";
import { PedidosTable } from "../components/PedidosTable";
import { PedidoDetalle } from "../components/DetallePedido";
import { useCambiarEstadoPedido, usePedido, usePedidos, } from "../hook/usePedidos";
import type { EstadoPedido } from "../types/pedido";
import { handleApiError } from "@/shared/api/handleApiError";
import { Modal } from "@/shared/ui/Modal";

export function AdminPedidosPage() {
    const [estadoFiltro, setEstadoFiltro] =
        useState<EstadoPedido | "">("");

    const [pedidoSeleccionadoId, setPedidoSeleccionadoId] =
        useState<number | null>(null);

    const [pedidoAConfirmar, setPedidoAConfirmar] =
        useState<number | null>(null);

    const [errorMessage, setErrorMessage] = useState("");

    const pedidosQuery = usePedidos(
        0,
        100,
        estadoFiltro || undefined
    );

    const pedidoDetalleQuery = usePedido(
        pedidoSeleccionadoId ?? 0
    );

    const cambiarEstadoMutation = useCambiarEstadoPedido();

    const cerrarDetalle = useCallback(() => {
        setPedidoSeleccionadoId(null);
    }, []);

    const cerrarConfirmacion = useCallback(() => {
        if (cambiarEstadoMutation.isPending) return;

        setPedidoAConfirmar(null);
    }, [cambiarEstadoMutation.isPending]);

    // Cambia el estado de un pedido.
    // Si el nuevo estado es CANCELADO, primero solicita confirmación.
    async function cambiarEstado(
        pedidoId: number,
        estado: EstadoPedido
    ) {
        setErrorMessage("");

        if (estado === "CANCELADO") {
            setPedidoAConfirmar(pedidoId);
            return;
        }

        try {
            await cambiarEstadoMutation.mutateAsync({
                pedidoId,
                estado,
            });
        } catch (error) {
            setErrorMessage(handleApiError(error));
        }
    }

    // Ejecuta la cancelación únicamente después de confirmar.
    async function confirmarCancelacion() {
        if (pedidoAConfirmar === null) return;

        setErrorMessage("");

        try {
            await cambiarEstadoMutation.mutateAsync({
                pedidoId: pedidoAConfirmar,
                estado: "CANCELADO",
            });

            setPedidoAConfirmar(null);
        } catch (error) {
            setErrorMessage(handleApiError(error));
        }
    }

    if (pedidosQuery.isLoading) {
        return <p role="status">Cargando pedidos...</p>;
    }

    if (pedidosQuery.isError) {
        return (
            <p role="alert" className="text-red-600">
                {handleApiError(pedidosQuery.error)}
            </p>
        );
    }

    const pedidos = pedidosQuery.data?.items ?? [];
    const pedidoDetalle = pedidoDetalleQuery.data;

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    Administración de pedidos
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Consultá la información de cada compra y gestioná su estado.
                </p>
            </div>

            <div className="max-w-xs">
                <label
                    htmlFor="estadoFiltro"
                    className="mb-1 block text-sm font-medium"
                >
                    Filtrar por estado
                </label>

                <select
                    id="estadoFiltro"
                    value={estadoFiltro}
                    onChange={(event) =>
                        setEstadoFiltro(
                            event.target.value as EstadoPedido | ""
                        )
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                >
                    <option value="">Todos</option>
                    <option value="PENDIENTE">Pendientes</option>
                    <option value="EN_PREPARACION">
                        En preparación
                    </option>
                    <option value="ENTREGADO">Entregados</option>
                    <option value="CANCELADO">Cancelados</option>
                </select>
            </div>

            {errorMessage && (
                <p
                    role="alert"
                    className="rounded-lg bg-red-100 p-3 text-red-700 dark:bg-red-950 dark:text-red-300"
                >
                    {errorMessage}
                </p>
            )}

            <PedidosTable
                pedidos={pedidos}
                onSeleccionar={(pedido) =>
                    setPedidoSeleccionadoId(pedido.id)
                }
                acciones={(pedido) => {
                    if (pedido.estado === "PENDIENTE") {
                        return (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    disabled={cambiarEstadoMutation.isPending}
                                    onClick={() =>
                                        void cambiarEstado(
                                            pedido.id,
                                            "EN_PREPARACION"
                                        )
                                    }
                                    className="text-blue-700 hover:underline disabled:opacity-50 dark:text-blue-300"
                                >
                                    Preparar
                                </button>

                                <button
                                    type="button"
                                    disabled={cambiarEstadoMutation.isPending}
                                    onClick={() =>
                                        void cambiarEstado(
                                            pedido.id,
                                            "CANCELADO"
                                        )
                                    }
                                    className="text-red-600 hover:underline disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                            </div>
                        );
                    }

                    if (pedido.estado === "EN_PREPARACION") {
                        return (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    disabled={cambiarEstadoMutation.isPending}
                                    onClick={() =>
                                        void cambiarEstado(
                                            pedido.id,
                                            "ENTREGADO"
                                        )
                                    }
                                    className="text-green-700 hover:underline disabled:opacity-50 dark:text-green-300"
                                >
                                    Entregar
                                </button>

                                <button
                                    type="button"
                                    disabled={cambiarEstadoMutation.isPending}
                                    onClick={() =>
                                        void cambiarEstado(
                                            pedido.id,
                                            "CANCELADO"
                                        )
                                    }
                                    className="text-red-600 hover:underline disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                            </div>
                        );
                    }

                    return (
                        <span className="text-slate-400">
                            Sin acciones
                        </span>
                    );
                }}
            />

            {/* Modal de detalle del pedido */}
            <Modal
                isOpen={pedidoSeleccionadoId !== null}
                onClose={cerrarDetalle}
                title={
                    pedidoSeleccionadoId
                        ? `Detalle del pedido #${pedidoSeleccionadoId}`
                        : "Detalle del pedido"
                }
                size="lg"
            >
                {pedidoDetalleQuery.isLoading ? (
                    <p
                        role="status"
                        className="py-8 text-center text-slate-500"
                    >
                        Cargando detalle del pedido...
                    </p>
                ) : pedidoDetalleQuery.isError ? (
                    <div className="space-y-4">
                        <p role="alert" className="text-sm text-red-600">
                            {handleApiError(pedidoDetalleQuery.error)}
                        </p>

                        <button
                            type="button"
                            onClick={cerrarDetalle}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
                        >
                            Cerrar
                        </button>
                    </div>
                ) : pedidoDetalle ? (
                    <PedidoDetalle pedido={pedidoDetalle} />
                ) : null}
            </Modal>

            {/* Modal de confirmación de cancelación */}
            <Modal
                isOpen={pedidoAConfirmar !== null}
                onClose={cerrarConfirmacion}
                title="Confirmar cancelación"
                size="sm"
            >
                {pedidoAConfirmar !== null && (
                    <div className="space-y-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                                <span className="text-xl font-bold">
                                    !
                                </span>
                            </div>

                            <div className="flex-1">
                                <p className="font-semibold text-slate-800 dark:text-white">
                                    ¿Estás seguro de que querés cancelar
                                    el pedido #{pedidoAConfirmar}?
                                </p>

                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                    Esta acción cambiará el estado del
                                    pedido a CANCELADO. No podrás
                                    continuar con su preparación.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={cerrarConfirmacion}
                                disabled={cambiarEstadoMutation.isPending}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                                Volver
                            </button>

                            <button
                                type="button"
                                onClick={() => void confirmarCancelacion()}
                                disabled={cambiarEstadoMutation.isPending}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {cambiarEstadoMutation.isPending
                                    ? "Cancelando..."
                                    : "Sí, cancelar pedido"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </section>
    );
}
