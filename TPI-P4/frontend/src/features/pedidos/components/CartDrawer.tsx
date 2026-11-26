import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";

const formatoPrecio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
});

export function CartDrawer() {
    const items = useCartStore((state) => state.items);
    const abierto = useCartStore((state) => state.panelAbierto);
    const cerrarPanel = useCartStore((state) => state.cerrarPanel);
    const quitar = useCartStore((state) => state.quitar);
    const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
    const total = useCartStore((state) => state.total);

    useEffect(() => {
        if (!abierto) return;

        const cerrarConEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") cerrarPanel();
        };

        document.addEventListener("keydown", cerrarConEscape);

        const overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", cerrarConEscape);
            document.body.style.overflow = overflowAnterior;
        };
    }, [abierto, cerrarPanel]);

    if (!abierto) return null;

    const cantidadTotal = items.reduce(
        (suma, item) => suma + item.cantidad,
        0
    );

    return (
        <div className="fixed inset-0 z-60" aria-label="Carrito de compras">
            {/* Fondo oscuro */}
            <button
                type="button"
                aria-label="Cerrar carrito"
                onClick={cerrarPanel}
                className="absolute inset-0 h-full w-full cursor-default bg-slate-950/55 backdrop-blur-[2px]"
            />

            {/* Panel lateral */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-drawer-title"
                className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl cart-drawer-enter dark:border-slate-700 dark:bg-slate-900"
            >
                {/* Encabezado */}
                <header className="flex items-center justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-700">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
                            FoodStore
                        </p>

                        <h2
                            id="cart-drawer-title"
                            className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white"
                        >
                            Tu carrito
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {cantidadTotal}{" "}
                            {cantidadTotal === 1 ? "unidad" : "unidades"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={cerrarPanel}
                        aria-label="Cerrar panel"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                    >
                        ×
                    </button>
                </header>

                {/* Carrito vacío */}
                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-9 w-9"
                                stroke="currentColor"
                                strokeWidth="1.6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 3h2l2.2 11.1a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L21 7H6"
                                />
                                <circle cx="10" cy="20" r="1.2" />
                                <circle cx="18" cy="20" r="1.2" />
                            </svg>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Tu carrito está vacío
                        </h3>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Explorá el catálogo y agregá algo rico a tu pedido.
                        </p>

                        
                        <button
                            type="button"
                            onClick={cerrarPanel}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            Seguir comprando
                        </button>

                    </div>
                ) : (
                    <>
                        {/* Productos */}
                        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                            {items.map((item) => (
                                <article
                                    key={item.producto_id}
                                    className="flex gap-3 border-b border-slate-100 pb-4 dark:border-slate-800"
                                >
                                    {/* Imagen */}
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                                        {item.imagen_url ? (
                                            <img
                                                src={item.imagen_url}
                                                alt={item.nombre}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                                Sin imagen
                                            </div>
                                        )}
                                    </div>

                                    {/* Información */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="line-clamp-2 font-bold text-slate-900 dark:text-white">
                                                {item.nombre}
                                            </h3>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    quitar(item.producto_id)
                                                }
                                                aria-label={`Eliminar ${item.nombre} del carrito`}
                                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    className="h-5 w-5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            {formatoPrecio.format(item.precio_unitario)}{" "}
                                            c/u
                                        </p>

                                        {/* Cantidad y subtotal */}
                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        cambiarCantidad(
                                                            item.producto_id,
                                                            item.cantidad - 1
                                                        )
                                                    }
                                                    disabled={item.cantidad <= 1}
                                                    aria-label={`Disminuir cantidad de ${item.nombre}`}
                                                    className="h-8 w-9 rounded-l-lg text-lg font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
                                                >
                                                    −
                                                </button>

                                                <span
                                                    className="min-w-8 text-center text-sm font-bold tabular-nums text-slate-900 dark:text-white"
                                                    aria-live="polite"
                                                >
                                                    {item.cantidad}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        cambiarCantidad(
                                                            item.producto_id,
                                                            item.cantidad + 1
                                                        )
                                                    }
                                                    aria-label={`Aumentar cantidad de ${item.nombre}`}
                                                    className="h-8 w-9 rounded-r-lg text-lg font-semibold text-teal-800 transition hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/50"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <p className="font-extrabold text-slate-900 dark:text-white">
                                                {formatoPrecio.format(
                                                    item.precio_unitario *
                                                        item.cantidad
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Resumen y acciones */}
                        <footer className="border-t border-slate-200 bg-slate-50 px-5 py-5 dark:border-slate-700 dark:bg-slate-950">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="font-semibold text-slate-600 dark:text-slate-300">
                                    Total
                                </span>

                                <span className="text-2xl font-extrabold text-teal-800 dark:text-teal-300">
                                    {formatoPrecio.format(total())}
                                </span>
                            </div>

                            <Link
                                to="/carrito"
                                onClick={cerrarPanel}
                                className="flex w-full items-center justify-center rounded-xl bg-teal-400 px-5 py-3.5 font-extrabold text-[#071b31] shadow-sm transition hover:bg-teal-300 active:scale-[0.99]"
                            >
                                Ver carrito y finalizar
                            </Link>

                            <button
                                type="button"
                                onClick={cerrarPanel}
                                className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                            >
                                Seguir comprando
                            </button>
                        </footer>
                    </>
                )}
            </aside>
        </div>
    );
}