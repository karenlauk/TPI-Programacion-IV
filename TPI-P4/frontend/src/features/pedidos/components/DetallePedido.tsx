import type { ReactNode } from "react";
import type { Pedido } from "../types/pedido";

interface PedidoDetalleProps {
    pedido: Pedido;
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

const estilosEstado: Record<Pedido["estado"], string> = {
    PENDIENTE:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    EN_PREPARACION:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    ENTREGADO:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    CANCELADO:
        "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

const moneda = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
});

function formatearFecha(fecha: string): string {
    const fechaPedido = new Date(fecha);

    if (Number.isNaN(fechaPedido.getTime())) {
        return "Fecha no disponible";
    }

    return fechaPedido.toLocaleString("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function Seccion({
    titulo,
    children,
}: {
    titulo: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {titulo}
            </h3>
            {children}
        </section>
    );
}

export function PedidoDetalle({ pedido }: PedidoDetalleProps) {
    return (
        <div className="space-y-4">
            {/* Encabezado del pedido */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Fecha del pedido
                    </p>
                    <p className="font-medium">
                        {formatearFecha(pedido.created_at)}
                    </p>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${estilosEstado[pedido.estado]}`}
                >
                    {estadosPedido[pedido.estado]}
                </span>
            </div>

            {/* Datos del cliente */}
            <Seccion titulo="Datos del cliente">
                <dl className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">
                            Nombre
                        </dt>
                        <dd className="font-medium">
                            {pedido.usuario.full_name}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">
                            Usuario
                        </dt>
                        <dd className="font-medium">
                            {pedido.usuario.username}
                        </dd>
                    </div>

                    <div className="sm:col-span-2">
                        <dt className="text-xs text-slate-500 dark:text-slate-400">
                            Email
                        </dt>
                        <dd className="break-all font-medium">
                            {pedido.usuario.email}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">
                            ID de cliente
                        </dt>
                        <dd className="font-medium">
                            #{pedido.usuario_id}
                        </dd>
                    </div>
                </dl>
            </Seccion>

            {/* Dirección de entrega */}
            <Seccion titulo="Dirección de entrega">
                <p className="whitespace-pre-wrap font-medium">
                    {pedido.direccion_entrega || "No especificada"}
                </p>
            </Seccion>

            {/* Productos */}
            <Seccion titulo="Productos del pedido">
                {pedido.items.length === 0 ? (
                    <p className="py-3 text-sm text-slate-500">
                        Este pedido no tiene productos registrados.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-440px text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                    <th className="py-2 pr-3 font-semibold">
                                        Producto
                                    </th>
                                    <th className="px-3 py-2 text-center font-semibold">
                                        Cantidad
                                    </th>
                                    <th className="px-3 py-2 text-right font-semibold">
                                        Precio unitario
                                    </th>
                                    <th className="py-2 pl-3 text-right font-semibold">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {pedido.items.map((item, index) => (
                                    <tr
                                        key={`${item.producto_id}-${index}`}
                                        className="border-b border-slate-100 last:border-0 dark:border-slate-700/70"
                                    >
                                        <td className="py-3 pr-3 font-medium">
                                            {item.nombre_producto}
                                        </td>

                                        <td className="px-3 py-3 text-center">
                                            {item.cantidad}
                                        </td>

                                        <td className="px-3 py-3 text-right">
                                            {moneda.format(item.precio_unitario)}
                                        </td>

                                        <td className="py-3 pl-3 text-right font-medium">
                                            {moneda.format(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Notas */}
                {pedido.notas && (
                    <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Notas del pedido
                        </p>
                        <p className="whitespace-pre-wrap text-sm">
                            {pedido.notas}
                        </p>
                    </div>
                )}

                {/* Total */}
                <div className="mt-4 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-700">
                    <div className="text-right">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Total del pedido
                        </p>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {moneda.format(pedido.total)}
                        </p>
                    </div>
                </div>
            </Seccion>

            {/* Información del pago */}
            <Seccion titulo="Información del pago">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Forma de pago
                        </p>
                        <p className="font-medium">
                            {formasPago[pedido.forma_pago]}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Identificador
                        </p>
                        <p className="font-medium">
                            Pedido #{pedido.id}
                        </p>
                    </div>
                </div>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    El sistema registra la forma de pago seleccionada; no
                    procesa pagos mediante una pasarela.
                </p>
            </Seccion>
        </div>
    );
}