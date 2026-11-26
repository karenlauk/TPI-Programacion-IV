import { useState } from "react";
import type { FormEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { useCategories } from "@/features/categorias/hooks/useCategorias";
import { EstadoError } from "@/shared/components/EstadoError";
import type { Producto, ProductoFormData, ProductoStockUpdate,} from "../types/producto";

export type ProductoModalMode = "create" | "edit" | "stock";

interface ProductoModalProps {
    isOpen: boolean;
    mode: ProductoModalMode;
    producto: Producto | null;
    onClose: () => void;
    onSubmit: (datos: ProductoFormData) => Promise<void>;
    onUpdateStock: (datos: ProductoStockUpdate) => Promise<void>;
    isSubmitting: boolean;
    errorMessage?: string;
}

const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

const labelClass =
    "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200";

const sectionClass =
    "rounded-xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-800";

export function ProductoModal({
    isOpen,
    mode,
    producto,
    onClose,
    onSubmit,
    onUpdateStock,
    isSubmitting,
    errorMessage,
}: ProductoModalProps) {
    const {
        categorias,
        isLoading: cargandoCategorias,
        isError: errorCategorias,
    } = useCategories();

    const [nuevoStock, setNuevoStock] = useState(
        String(producto?.stock ?? 0)
    );
    const [errorStock, setErrorStock] = useState("");

    const form = useForm({
        defaultValues: {
            nombre: producto?.nombre ?? "",
            descripcion: producto?.descripcion ?? "",
            categoria_id: String(producto?.categoria_id ?? ""),
            precio_base: String(producto?.precio_base ?? ""),
            imagen_url: producto?.imagen_url ?? "",
            stock: String(producto?.stock ?? 0),
            disponible: producto?.disponible ?? true,
        },

        onSubmit: async ({ value }) => {
            const datos: ProductoFormData = {
                categoria_id: Number(value.categoria_id),
                nombre: value.nombre.trim(),
                descripcion: value.descripcion.trim(),
                precio_base: Number(value.precio_base),
                imagen_url: value.imagen_url.trim(),

                // Al editar no se modifica el stock.
                stock:
                    mode === "edit" && producto
                        ? producto.stock
                        : Number(value.stock),

                disponible: value.disponible,
            };

            await onSubmit(datos);
        },
    });

    if (!isOpen) {
        return null;
    }

    const titulo =
        mode === "create"
            ? "Nuevo producto"
            : mode === "edit"
                ? "Editar producto"
                : "Actualizar stock";

    const cerrarSiCorresponde = () => {
        if (isSubmitting || form.state.isSubmitting) {
            return;
        }

        onClose();
    };

    const handleActualizarStock = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setErrorStock("");

        const cantidad = Number(nuevoStock);

        if (
            nuevoStock.trim() === "" ||
            !Number.isInteger(cantidad) ||
            cantidad < 0
        ) {
            setErrorStock(
                "El stock debe ser un número entero mayor o igual a cero."
            );
            return;
        }

        try {
            await onUpdateStock({
                stock: cantidad,
                disponible: producto?.disponible ?? true,
            });
        } catch {
            // ProductsPage muestra el error de la mutation.
        }
    };

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    cerrarSiCorresponde();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="producto-modal-title"
                className={`my-6 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl dark:border-slate-700 dark:bg-slate-900 ${
                    mode === "stock" ? "max-w-md" : "max-w-2xl"
                }`}
            >
                {/* Encabezado */}
                <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-6 dark:border-slate-700 dark:bg-slate-800">
                    <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                            FoodStore / Productos
                        </p>

                        <h2
                            id="producto-modal-title"
                            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            {titulo}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {mode === "stock"
                                ? "Modificá las unidades disponibles."
                                : mode === "edit"
                                    ? "Actualizá la información del producto."
                                    : "Completá los datos para registrar un producto."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={cerrarSiCorresponde}
                        disabled={isSubmitting || form.state.isSubmitting}
                        aria-label="Cerrar"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-white"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m6 6 12 12M18 6 6 18"
                            />
                        </svg>
                    </button>
                </header>

                {/* Contenido */}
                <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
                    {errorMessage && (
                        <div className="mb-5">
                            <EstadoError mensaje={errorMessage} />
                        </div>
                    )}

                    {mode === "stock" ? (
                        <div className="space-y-5">
                            <div className={sectionClass}>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Producto seleccionado
                                </p>

                                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                                    {producto?.nombre}
                                </p>

                                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Stock actual
                                    </span>

                                    <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                                        {producto?.stock ?? 0} unidades
                                    </span>
                                </div>
                            </div>

                            <form
                                onSubmit={handleActualizarStock}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="producto-nuevo-stock"
                                        className={labelClass}
                                    >
                                        Nuevo stock
                                    </label>

                                    <input
                                        id="producto-nuevo-stock"
                                        type="number"
                                        min="0"
                                        step="1"
                                        required
                                        autoFocus
                                        disabled={isSubmitting}
                                        value={nuevoStock}
                                        onChange={(event) => {
                                            setNuevoStock(event.target.value);
                                            setErrorStock("");
                                        }}
                                        className={inputClass}
                                    />

                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                        Ingresá un número entero igual o mayor a cero.
                                    </p>
                                </div>

                                {errorStock && (
                                    <div
                                        role="alert"
                                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                                    >
                                        {errorStock}
                                    </div>
                                )}

                                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={cerrarSiCorresponde}
                                        disabled={isSubmitting}
                                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            isSubmitting ||
                                            nuevoStock.trim() === ""
                                        }
                                        className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isSubmitting
                                            ? "Guardando..."
                                            : "Guardar stock"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Vista previa del producto en edición */}
                            {mode === "edit" && producto && (
                                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700">
                                        {producto.imagen_url ? (
                                            <img
                                                src={producto.imagen_url}
                                                alt={producto.nombre}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                className="h-7 w-7 text-slate-400"
                                                aria-hidden="true"
                                            >
                                                <rect
                                                    x="3"
                                                    y="3"
                                                    width="18"
                                                    height="18"
                                                    rx="2"
                                                />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <path d="m21 15-5-5L5 21" />
                                            </svg>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-bold text-slate-900 dark:text-white">
                                            {producto.nombre}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            ID de producto: {producto.id}
                                        </p>

                                        <span
                                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                producto.disponible
                                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                            }`}
                                        >
                                            {producto.disponible
                                                ? "Disponible"
                                                : "No disponible"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {errorCategorias && (
                                <EstadoError mensaje="No se pudieron cargar las categorías." />
                            )}

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    void form.handleSubmit();
                                }}
                                className="space-y-4"
                            >
                                {/* Información general */}
                                <section className={sectionClass}>
                                    <div className="mb-4">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Información general
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Datos principales del producto.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <form.Field
                                            name="nombre"
                                            validators={{
                                                onSubmit: ({ value }) =>
                                                    !value.trim()
                                                        ? "El nombre del producto es obligatorio."
                                                        : undefined,
                                            }}
                                        >
                                            {(field) => (
                                                <div>
                                                    <label
                                                        htmlFor="producto-nombre"
                                                        className={labelClass}
                                                    >
                                                        Nombre del producto
                                                    </label>

                                                    <input
                                                        id="producto-nombre"
                                                        type="text"
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) =>
                                                            field.handleChange(event.target.value)
                                                        }
                                                        className={inputClass}
                                                    />

                                                    {field.state.meta.errors.length > 0 && (
                                                        <p className="mt-1 text-sm text-red-600">
                                                            {field.state.meta.errors.join(", ")}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </form.Field>

                                        <form.Field name="descripcion">
                                            {(field) => (
                                                <div>
                                                    <label
                                                        htmlFor="producto-descripcion"
                                                        className={labelClass}
                                                    >
                                                        Descripción
                                                    </label>

                                                    <textarea
                                                        id="producto-descripcion"
                                                        rows={3}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) =>
                                                            field.handleChange(event.target.value)
                                                        }
                                                        className={`${inputClass} resize-y`}
                                                    />
                                                </div>
                                            )}
                                        </form.Field>

                                        <form.Field
                                            name="imagen_url"
                                            validators={{
                                                onSubmit: ({ value }) => {
                                                    if (!value.trim()) {
                                                        return undefined;
                                                    }

                                                    try {
                                                        const url = new URL(value);

                                                        if (
                                                            url.protocol !== "http:" &&
                                                            url.protocol !== "https:"
                                                        ) {
                                                            return "La URL debe comenzar con http:// o https://.";
                                                        }

                                                        return undefined;
                                                    } catch {
                                                        return "Ingresá una URL válida.";
                                                    }
                                                },
                                            }}
                                        >
                                            {(field) => (
                                                <div>
                                                    <label
                                                        htmlFor="producto-imagen"
                                                        className={labelClass}
                                                    >
                                                        URL de imagen
                                                    </label>

                                                    <input
                                                        id="producto-imagen"
                                                        type="url"
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) =>
                                                            field.handleChange(event.target.value)
                                                        }
                                                        placeholder="https://..."
                                                        className={inputClass}
                                                    />

                                                    {field.state.meta.errors.length > 0 && (
                                                        <p className="mt-1 text-sm text-red-600">
                                                            {field.state.meta.errors.join(", ")}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </form.Field>
                                    </div>
                                </section>

                                {/* Clasificación y precio */}
                                <section className={sectionClass}>
                                    <div className="mb-4">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Clasificación y precio
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Categoría y valor comercial.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <form.Field
                                            name="categoria_id"
                                            validators={{
                                                onSubmit: ({ value }) => {
                                                    const categoria = Number(value);

                                                    return (
                                                        !value ||
                                                        !Number.isInteger(categoria) ||
                                                        categoria <= 0
                                                    )
                                                        ? "Seleccioná una categoría."
                                                        : undefined;
                                                },
                                            }}
                                        >
                                            {(field) => (
                                                <div>
                                                    <label
                                                        htmlFor="producto-categoria"
                                                        className={labelClass}
                                                    >
                                                        Categoría
                                                    </label>

                                                    <select
                                                        id="producto-categoria"
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) =>
                                                            field.handleChange(event.target.value)
                                                        }
                                                        disabled={
                                                            cargandoCategorias ||
                                                            errorCategorias
                                                        }
                                                        className={inputClass}
                                                    >
                                                        <option value="">
                                                            {cargandoCategorias
                                                                ? "Cargando categorías..."
                                                                : "Seleccioná una categoría"}
                                                        </option>

                                                        {categorias.map((categoria) => (
                                                            <option
                                                                key={categoria.id}
                                                                value={categoria.id}
                                                            >
                                                                {categoria.nombre}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {field.state.meta.errors.length > 0 && (
                                                        <p className="mt-1 text-sm text-red-600">
                                                            {field.state.meta.errors.join(", ")}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </form.Field>

                                        <form.Field
                                            name="precio_base"
                                            validators={{
                                                onSubmit: ({ value }) => {
                                                    const precio = Number(value);

                                                    if (!value.trim()) {
                                                        return "El precio es obligatorio.";
                                                    }

                                                    if (
                                                        !Number.isFinite(precio) ||
                                                        precio < 0
                                                    ) {
                                                        return "Ingresá un precio válido mayor o igual a cero.";
                                                    }

                                                    return undefined;
                                                },
                                            }}
                                        >
                                            {(field) => (
                                                <div>
                                                    <label
                                                        htmlFor="producto-precio"
                                                        className={labelClass}
                                                    >
                                                        Precio base
                                                    </label>

                                                    <input
                                                        id="producto-precio"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) =>
                                                            field.handleChange(event.target.value)
                                                        }
                                                        className={inputClass}
                                                    />

                                                    {field.state.meta.errors.length > 0 && (
                                                        <p className="mt-1 text-sm text-red-600">
                                                            {field.state.meta.errors.join(", ")}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </form.Field>
                                    </div>
                                </section>

                                {/* Stock inicial: solo al crear */}
                                {mode === "create" && (
                                    <section className={sectionClass}>
                                        <div className="mb-4">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                Inventario inicial
                                            </h3>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                Definí las unidades disponibles al crear el producto.
                                            </p>
                                        </div>

                                        <form.Field
                                            name="stock"
                                            validators={{
                                                onSubmit: ({ value }) => {
                                                    const cantidad = Number(value);

                                                    if (!value.trim()) {
                                                        return "El stock es obligatorio.";
                                                    }

                                                    if (
                                                        !Number.isInteger(cantidad) ||
                                                        cantidad < 0
                                                    ) {
                                                        return "El stock debe ser un número entero mayor o igual a cero.";
                                                    }

                                                    return undefined;
                                                },
                                            }}
                                        >
                                            {(field) => (
                                                <div>
                                                    <label
                                                        htmlFor="producto-stock"
                                                        className={labelClass}
                                                    >
                                                        Stock inicial
                                                    </label>

                                                    <input
                                                        id="producto-stock"
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) =>
                                                            field.handleChange(event.target.value)
                                                        }
                                                        className={inputClass}
                                                    />

                                                    {field.state.meta.errors.length > 0 && (
                                                        <p className="mt-1 text-sm text-red-600">
                                                            {field.state.meta.errors.join(", ")}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </form.Field>
                                    </section>
                                )}

                                {/* Disponibilidad */}
                                <section className={sectionClass}>
                                    <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
                                        Estado y disponibilidad
                                    </h3>

                                    <form.Field name="disponible">
                                        {(field) => (
                                            <label className="flex cursor-pointer items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={field.state.value}
                                                    onChange={(event) =>
                                                        field.handleChange(event.target.checked)
                                                    }
                                                    className="h-4 w-4 rounded border-slate-300 accent-teal-500"
                                                />

                                                <span>
                                                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                        Disponible para la venta
                                                    </span>
                                                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                                                        El producto puede mostrarse como disponible para los clientes.
                                                    </span>
                                                </span>
                                            </label>
                                        )}
                                    </form.Field>
                                </section>

                                {/* Aclaración de stock en edición */}
                                {mode === "edit" && (
                                    <div className="flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400"
                                            aria-hidden="true"
                                        >
                                            <circle cx="12" cy="12" r="9" />
                                            <path
                                                strokeLinecap="round"
                                                d="M12 11v5m0-8h.01"
                                            />
                                        </svg>

                                        <div>
                                            <p className="text-sm font-semibold text-sky-900 dark:text-sky-200">
                                                El stock se administra por separado
                                            </p>
                                            <p className="mt-1 text-xs leading-relaxed text-sky-800 dark:text-sky-300">
                                                Para modificar las unidades disponibles, utilizá la opción «Actualizar stock» del producto.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Acciones */}
                                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={cerrarSiCorresponde}
                                        disabled={
                                            isSubmitting ||
                                            form.state.isSubmitting
                                        }
                                        className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            isSubmitting ||
                                            form.state.isSubmitting ||
                                            (mode === "create" &&
                                                (cargandoCategorias || errorCategorias))
                                        }
                                        className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isSubmitting || form.state.isSubmitting
                                            ? "Guardando..."
                                            : mode === "create"
                                                ? "Crear producto"
                                                : "Guardar cambios"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}