import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PedidosTable } from "../components/PedidosTable";
import { PedidoDetalle } from "../components/DetallePedido";
import { useCancelarPedido, usePedidos } from "../hook/usePedidos";
import type { Pedido } from "../types/pedido";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { EstadoError } from "@/shared/components/EstadoError";

export function MisPedidosPage() {
    const [pedidoSeleccionado, setPedidoSeleccionado] =
        useState<Pedido | null>(null);

    const [errorMessage, setErrorMessage] = useState("");

    const pedidosQuery = usePedidos(0, 100);
    const cancelarMutation = useCancelarPedido();

    const pedidos = pedidosQuery.data?.items ?? [];

    useEffect(() => {
        if (!pedidoSeleccionado) return;

        const pedidoActualizado = pedidos.find(
            (pedido) => pedido.id === pedidoSeleccionado.id
        );

        if (pedidoActualizado) {
            setPedidoSeleccionado(pedidoActualizado);
        } else {
            setPedidoSeleccionado(null);
        }
    }, [pedidos, pedidoSeleccionado]);

    async function cancelarPedido(pedidoId: number) {
        setErrorMessage("");

        try {
            const pedidoActualizado =
                await cancelarMutation.mutateAsync(pedidoId);

            setPedidoSeleccionado((actual) =>
                actual?.id === pedidoActualizado.id
                    ? pedidoActualizado
                    : actual
            );
        } catch (error) {
            setErrorMessage(handleApiError(error));
        }
    }

    if (pedidosQuery.isLoading) {
        return <p role="status">Cargando tus pedidos...</p>;
    }

    if (pedidosQuery.isError) {
        return (
            <EstadoError
                mensaje={handleApiError(pedidosQuery.error)}
            />
        );
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Mis pedidos</h1>

                <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Consultá tus compras y el estado de cada pedido.
                </p>
            </div>

            {errorMessage && (
                <EstadoError mensaje={errorMessage} />
            )}

            {pedidos.length === 0 ? (
                <EstadoVacio
                    titulo="Todavía no tenés pedidos"
                    mensaje="Cuando confirmes una compra, vas a poder consultar su estado desde acá."
                    accion={() => {
                        window.location.assign("/");
                    }}
                    textoAccion="Ir al catálogo"
                />
            ) : (
                <PedidosTable
                    pedidos={pedidos}
                    onSeleccionar={setPedidoSeleccionado}
                    acciones={(pedido) =>
                        pedido.estado === "PENDIENTE" ? (
                            <button
                                type="button"
                                disabled={cancelarMutation.isPending}
                                onClick={() => {
                                    const confirmar = window.confirm(
                                        `¿Querés cancelar el pedido #${pedido.id}?`
                                    );

                                    if (confirmar) {
                                        void cancelarPedido(pedido.id);
                                    }
                                }}
                                className="font-medium text-red-600 hover:underline disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                        ) : (
                            <span className="text-slate-400">
                                Sin acciones
                            </span>
                        )
                    }
                />
            )}

            {pedidoSeleccionado && (
                <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold">
                            Detalle del pedido #{pedidoSeleccionado.id}
                        </h2>

                        <button
                            type="button"
                            onClick={() => setPedidoSeleccionado(null)}
                            className="text-sm text-blue-700 hover:underline dark:text-blue-300"
                        >
                            Cerrar
                        </button>
                    </div>

                    <PedidoDetalle pedido={pedidoSeleccionado} />

                    {pedidoSeleccionado.estado === "PENDIENTE" && (
                        <button
                            type="button"
                            disabled={cancelarMutation.isPending}
                            onClick={() => {
                                const confirmar = window.confirm(
                                    `¿Querés cancelar el pedido #${pedidoSeleccionado.id}?`
                                );

                                if (confirmar) {
                                    void cancelarPedido(pedidoSeleccionado.id);
                                }
                            }}
                            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            Cancelar pedido
                        </button>
                    )}
                </section>
            )}

            <div>
                <Link
                    to="/"
                    className="font-medium text-blue-700 hover:underline dark:text-blue-300"
                >
                    Volver al catálogo
                </Link>
            </div>
        </section>
    );
}