import { useState } from "react";
import type { Producto } from "../types/producto";
import { useCartStore } from "@/store/cartStore";

interface ProductoCardProps {
    producto: Producto;
    cantidadEnCarrito: number;
    onAgregar: (cantidad: number) => void;
}

export function ProductoCard({
    producto,
    cantidadEnCarrito,
    onAgregar,
}: ProductoCardProps) {
    const [imagenError, setImagenError] = useState(false);

    const abrirPanel = useCartStore((state) => state.abrirPanel);

    const sinStock = producto.stock <= 0;
    const noDisponible = !producto.disponible || !producto.activo;

    const stockRestante = Math.max(
        0,
        producto.stock - cantidadEnCarrito
    );

    const noSePuedeAgregar =
        sinStock || noDisponible || stockRestante <= 0;

    const precioFormateado = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2,
    }).format(producto.precio_base);

    function agregarProducto() {
        if (noSePuedeAgregar) return;

        onAgregar(1);
        abrirPanel();
    }

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-teal-800">
            {/* Imagen */}
            <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-700">
                {producto.imagen_url && !imagenError ? (
                    <img
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImagenError(true)}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400 dark:text-slate-300">
                        Imagen no disponible
                    </div>
                )}

                <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold text-teal-900 shadow-sm backdrop-blur">
                    {producto.categoria?.nombre ?? "Sin categoría"}
                </span>

                {noSePuedeAgregar && (
                    <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">
                        {sinStock || stockRestante <= 0
                            ? "Agotado"
                            : "No disponible"}
                    </span>
                )}
            </div>

            {/* Información */}
            <div className="flex flex-1 flex-col p-5">
                <div className="mb-3">
                    <h2 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">
                        {producto.nombre}
                    </h2>

                    <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {producto.descripcion ||
                            "Una opción deliciosa para disfrutar."}
                    </p>
                </div>

                {/* Precio y disponibilidad */}
                <div className="mb-4 mt-auto">
                    <p className="text-2xl font-extrabold tracking-tight text-teal-800 dark:text-teal-300">
                        {precioFormateado}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {noSePuedeAgregar
                            ? sinStock || stockRestante <= 0
                                ? "Sin unidades disponibles"
                                : "Producto no disponible"
                            : `Stock disponible: ${stockRestante}`}
                    </p>
                </div>

                {/* Acción única */}
                <button
                    type="button"
                    onClick={agregarProducto}
                    disabled={noSePuedeAgregar}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-3 font-bold text-[#062b35] shadow-sm transition hover:bg-teal-400 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none dark:focus:ring-offset-slate-800 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                >
                    <span aria-hidden="true">＋</span>
                    Agregar al carrito
                </button>
            </div>
        </article>
    );
}