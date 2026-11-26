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

    async function cambiarEstado(
        pedidoId: number,
        estado: EstadoPedido
    ) {
        setErrorMessage("");

        if (estado === "CANCELADO") {
            const confirmar = window.confirm(
                `¿Querés cancelar el pedido #${pedidoId}?`
            );

            if (!confirmar) return;
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
        </section>
    );
}