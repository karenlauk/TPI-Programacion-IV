import type { KeyboardEvent, MouseEvent, ReactNode, } from "react";
import type { Pedido } from "../types/pedido";

interface PedidosTableProps {
    pedidos: Pedido[];
    acciones?: (pedido: Pedido) => ReactNode;
    onSeleccionar?: (pedido: Pedido) => void;
}

const estadosPedido: Record<Pedido["estado"], string> = {
    PENDIENTE: "Pendiente",
    EN_PREPARACION: "En preparación",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
};

const formasPago: Record<Pedido["forma_pago"], string> = {
    EFECTIVO: "Efectivo",
    TRANSFERENCIA: "Transferencia",
};

function formatearFecha(fecha: string): string {
    const fechaPedido = new Date(fecha);

    if (Number.isNaN(fechaPedido.getTime())) {
        return "No disponible";
    }

    return fechaPedido.toLocaleDateString("es-AR");
}

function seleccionarConTeclado(
    event: KeyboardEvent<HTMLTableRowElement>,
    pedido: Pedido,
    onSeleccionar?: (pedido: Pedido) => void,
): void {
    if (!onSeleccionar || event.target !== event.currentTarget) {
        return;
    }

    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSeleccionar(pedido);
    }
}

function seleccionarConClick(
    event: MouseEvent<HTMLTableRowElement>,
    pedido: Pedido,
    onSeleccionar?: (pedido: Pedido) => void,
): void {
    if (!onSeleccionar) {
        return;
    }

    const target = event.target;

    if (
        target instanceof Element &&
        target.closest("button, a, input, select")
    ) {
        return;
    }

    onSeleccionar(pedido);
}

export function PedidosTable({
    pedidos,
    acciones,
    onSeleccionar,
}: PedidosTableProps) {
    if (pedidos.length === 0) {
        return (
            <p className="rounded-lg bg-slate-100 p-6 text-center text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                No hay pedidos para mostrar.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                        <th className="p-3">Pedido</th>
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Pago</th>
                        <th className="p-3">Total</th>
                        {acciones && (
                            <th className="p-3">Acciones</th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {pedidos.map((pedido) => (
                        <tr
                            key={pedido.id}
                            tabIndex={onSeleccionar ? 0 : undefined}
                            onClick={(event) =>
                                seleccionarConClick(
                                    event,
                                    pedido,
                                    onSeleccionar,
                                )
                            }
                            onKeyDown={(event) =>
                                seleccionarConTeclado(
                                    event,
                                    pedido,
                                    onSeleccionar,
                                )
                            }
                            title={
                                onSeleccionar
                                    ? `Ver detalle del pedido #${pedido.id}`
                                    : undefined
                            }
                            className={`border-t border-slate-200 dark:border-slate-700 ${
                                onSeleccionar
                                    ? "cursor-pointer transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 dark:hover:bg-slate-800/70"
                                    : ""
                            }`}
                        >
                            <td className="p-3">
                                <span className="font-semibold text-blue-700 dark:text-blue-300">
                                    #{pedido.id}
                                </span>
                            </td>

                            <td className="p-3">
                                {formatearFecha(pedido.created_at)}
                            </td>

                            <td className="p-3">
                                {estadosPedido[pedido.estado]}
                            </td>

                            <td className="p-3">
                                {formasPago[pedido.forma_pago]}
                            </td>

                            <td className="p-3">
                                ${pedido.total.toFixed(2)}
                            </td>

                            {acciones && (
                                <td
                                    className="p-3"
                                    onClick={(event) =>
                                        event.stopPropagation()
                                    }
                                >
                                    {acciones(pedido)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {onSeleccionar && (
                <p className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                    Seleccioná una fila para consultar el detalle del pedido.
                </p>
            )}
        </div>
    );
}