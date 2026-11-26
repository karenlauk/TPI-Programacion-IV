import { useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";

export function CarritoPage() {
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const items = useCartStore((state) => state.items);
    const quitar = useCartStore((state) => state.quitar);
    const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
    const vaciar = useCartStore((state) => state.vaciar);
    const total = useCartStore((state) => state.total);

    const limpiarCarrito = () => {
        vaciar();
        setMostrarConfirmacion(false);
    };

    if (items.length === 0) {
        return (
            <section className="py-12 text-center">
                <h1 className="text-2xl font-bold">
                    Tu carrito está vacío
                </h1>

                <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Explorá el catálogo y agregá tus productos favoritos.
                </p>

                <Link
                    to="/"
                    className="mt-5 inline-block rounded-md bg-blue-700 px-5 py-2 text-white hover:bg-blue-800"
                >
                    Ir al catálogo
                </Link>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold">Mi carrito</h1>

                <button
                    type="button"
                    onClick={() => setMostrarConfirmacion(true)}
                    className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                >
                    Limpiar carrito
                </button>
            </div>

            <div className="space-y-4">
                {items.map((item) => (
                    <article
                        key={item.producto_id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                    >
                        <div>
                            <h2 className="font-semibold">{item.nombre}</h2>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                ${item.precio_unitario.toFixed(2)} por unidad
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                aria-label={`Disminuir cantidad de ${item.nombre}`}
                                onClick={() =>
                                    cambiarCantidad(
                                        item.producto_id,
                                        item.cantidad - 1
                                    )
                                }
                                disabled={item.cantidad <= 1}
                                className="rounded border px-3 py-1 disabled:opacity-40"
                            >
                                −
                            </button>

                            <span aria-live="polite">{item.cantidad}</span>

                            <button
                                type="button"
                                aria-label={`Aumentar cantidad de ${item.nombre}`}
                                onClick={() =>
                                    cambiarCantidad(
                                        item.producto_id,
                                        item.cantidad + 1
                                    )
                                }
                                className="rounded border px-3 py-1"
                            >
                                +
                            </button>

                            <button
                                type="button"
                                onClick={() => quitar(item.producto_id)}
                                className="ml-2 text-sm text-red-600 hover:underline"
                            >
                                Quitar
                            </button>
                        </div>

                        <p className="w-full text-right font-semibold sm:w-auto">
                            ${(item.precio_unitario * item.cantidad).toFixed(2)}
                        </p>
                    </article>
                ))}
            </div>

            <div className="flex flex-col items-end gap-4">
                <p className="text-xl font-bold">
                    Total: ${total().toFixed(2)}
                </p>

                <Link
                    to="/checkout"
                    className="rounded-md bg-blue-700 px-6 py-3 font-medium text-white hover:bg-blue-800"
                >
                    Continuar con la compra
                </Link>
            </div>

            {mostrarConfirmacion && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setMostrarConfirmacion(false)}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="titulo-confirmacion"
                        aria-describedby="descripcion-confirmacion"
                        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h2
                                id="titulo-confirmacion"
                                className="text-xl font-bold"
                            >
                                Limpiar carrito
                            </h2>

                            <button
                                type="button"
                                onClick={() => setMostrarConfirmacion(false)}
                                aria-label="Cerrar ventana"
                                className="text-xl text-slate-500 hover:text-slate-800 dark:hover:text-white"
                            >
                                ×
                            </button>
                        </div>

                        <div className="my-5">
                            <p
                                id="descripcion-confirmacion"
                                className="text-slate-600 dark:text-slate-300"
                            >
                                ¿Estás seguro de que querés eliminar todos
                                los productos del carrito?
                            </p>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Esta acción no se puede deshacer.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setMostrarConfirmacion(false)}
                                className="rounded-md border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={limpiarCarrito}
                                className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                            >
                                Sí, limpiar carrito
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}