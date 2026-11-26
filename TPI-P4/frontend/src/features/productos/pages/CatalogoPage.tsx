import { useState } from "react";
import { useProductos } from "../hooks/useProductos";
import { useCategories } from "@/features/categorias/hooks/useCategorias";
import { useCartStore } from "@/store/cartStore";
import { ProductoCard } from "../components/ProductoCard";
import { Paginacion } from "@/shared/components/Paginacion";
import { Skeleton } from "@/shared/components/Skeleton";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { EstadoError } from "@/shared/components/EstadoError";

const PRODUCTOS_POR_PAGINA = 9;

export function CatalogoPage() {
    const [busqueda, setBusqueda] = useState("");
    const [categoriaId, setCategoriaId] = useState<number | undefined>();
    const [pagina, setPagina] = useState(0);

    const agregar = useCartStore((state) => state.agregar);
    const itemsCarrito = useCartStore((state) => state.items);

    const {
        productos,
        total,
        isLoading,
        isError,
    } = useProductos({
        skip: pagina * PRODUCTOS_POR_PAGINA,
        limit: PRODUCTOS_POR_PAGINA,
        search: busqueda.trim() || undefined,
        categoria_id: categoriaId,
    });

    const {
        categorias,
        isLoading: cargandoCategorias,
    } = useCategories();

    const totalPaginas = Math.ceil(total / PRODUCTOS_POR_PAGINA);

    function cambiarBusqueda(valor: string) {
        setBusqueda(valor);
        setPagina(0);
    }

    function cambiarCategoria(valor: string) {
        setCategoriaId(valor ? Number(valor) : undefined);
        setPagina(0);
    }

    function limpiarFiltros() {
        setBusqueda("");
        setCategoriaId(undefined);
        setPagina(0);
    }

    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
            {/* Presentación */}
            <section className="mb-7 overflow-hidden rounded-2xl border border-teal-100 bg-linear-to-r from-[#eafaf8] via-white to-white px-5 py-5 dark:border-teal-900/60 dark:from-[#102d36] dark:via-slate-900 dark:to-slate-900 sm:px-7">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                            FoodStore · Nuestro catálogo
                        </p>

                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                            Algo rico te está esperando.
                        </h1>

                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Explorá nuestros productos y elegí tus favoritos.
                        </p>
                    </div>

                    <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-3xl text-teal-700 dark:bg-teal-400/10 dark:text-teal-300 sm:flex">
                        ✦
                    </div>
                </div>
            </section>

            {/* Filtros */}
            <section
                aria-label="Filtros del catálogo"
                className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5"
            >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 className="font-bold text-slate-900 dark:text-white">
                            Encontrá lo que buscás
                        </h2>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Buscá por nombre o explorá por categoría.
                        </p>
                    </div>

                    {(busqueda || categoriaId !== undefined) && (
                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="text-sm font-semibold text-teal-700 transition hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="buscar-productos"
                            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                        >
                            Buscar productos
                        </label>

                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                                ⌕
                            </span>

                            <input
                                id="buscar-productos"
                                type="search"
                                value={busqueda}
                                onChange={(event) =>
                                    cambiarBusqueda(event.target.value)
                                }
                                placeholder="Ej. pizza, hamburguesa..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-teal-500 dark:focus:bg-slate-900 dark:focus:ring-teal-900/40"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="filtro-categoria"
                            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                        >
                            Categoría
                        </label>

                        <select
                            id="filtro-categoria"
                            value={categoriaId ?? ""}
                            onChange={(event) =>
                                cambiarCategoria(event.target.value)
                            }
                            disabled={cargandoCategorias}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-teal-500 dark:focus:bg-slate-900 dark:focus:ring-teal-900/40"
                        >
                            <option value="">Todas las categorías</option>

                            {categorias.map((categoria) => (
                                <option
                                    key={categoria.id}
                                    value={categoria.id}
                                >
                                    {categoria.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* Productos */}
            {isLoading ? (
                <Skeleton cantidad={PRODUCTOS_POR_PAGINA} />
            ) : isError ? (
                <EstadoError mensaje="No pudimos cargar los productos. Intentá nuevamente." />
            ) : productos.length === 0 ? (
                <EstadoVacio
                    titulo="No encontramos productos"
                    mensaje="Probá cambiar la búsqueda o seleccionar otra categoría."
                    accion={limpiarFiltros}
                    textoAccion="Limpiar filtros"
                />
            ) : (
                <>
                    <section aria-label="Listado de productos">
                        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                            <div>
                                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                    Nuestros productos
                                </h2>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Encontramos {total}{" "}
                                    {total === 1 ? "producto" : "productos"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {productos.map((producto) => {
                                const itemCarrito = itemsCarrito.find(
                                    (item) =>
                                        item.producto_id === producto.id
                                );

                                return (
                                    <ProductoCard
                                        key={producto.id}
                                        producto={producto}
                                        cantidadEnCarrito={
                                            itemCarrito?.cantidad ?? 0
                                        }
                                        onAgregar={(cantidad) =>
                                            agregar(producto, cantidad)
                                        }
                                    />
                                );
                            })}
                        </div>
                    </section>

                    <div className="mt-8">
                        <Paginacion
                            paginaActual={pagina}
                            totalPaginas={totalPaginas}
                            onCambiarPagina={setPagina}
                        />
                    </div>
                </>
            )}
        </main>
    );
}