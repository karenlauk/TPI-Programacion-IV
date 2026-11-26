import { useState } from "react";
import { ProductoList } from "../components/ProductoList";
import { ProductoModal } from "../components/ProductoModal";
import type { ProductoModalMode } from "../components/ProductoModal";
import { useProductos } from "../hooks/useProductos";
import { useAuth } from "@/features/auth";
import { LoadingState } from "@/shared/components/LoadingState";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { handleApiError } from "@/shared/api/handleApiError";
import type { Producto, ProductoFormData, ProductoStockUpdate, } from "../types/producto";

export function ProductsPage() {
    const { isAdmin } = useAuth();

    const {
        productos,
        total,
        isLoading,
        isError,
        error,
        crearMutation,
        actualizarMutation,
        actualizarStockMutation,
        eliminarMutation,
    } = useProductos();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [modalMode, setModalMode] =
        useState<ProductoModalMode>("create");

    const [productoSeleccionado, setProductoSeleccionado] =
        useState<Producto | null>(null);

    const errorGuardado =
        crearMutation.error || actualizarMutation.error;

    const mensajeErrorGuardado = errorGuardado
        ? handleApiError(errorGuardado)
        : undefined;

    const mensajeErrorStock = actualizarStockMutation.error
        ? handleApiError(actualizarStockMutation.error)
        : undefined;

    const abrirModalCrear = () => {
        crearMutation.reset();
        actualizarMutation.reset();
        actualizarStockMutation.reset();

        setProductoSeleccionado(null);
        setModalMode("create");
        setIsModalOpen(true);
    };

    const abrirModalEditar = (producto: Producto) => {
        actualizarMutation.reset();
        actualizarStockMutation.reset();

        setProductoSeleccionado(producto);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const abrirModalStock = (producto: Producto) => {
        actualizarStockMutation.reset();

        setProductoSeleccionado(producto);
        setModalMode("stock");
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        if (
            crearMutation.isPending ||
            actualizarMutation.isPending ||
            actualizarStockMutation.isPending
        ) {
            return;
        }

        setIsModalOpen(false);
        setProductoSeleccionado(null);

        crearMutation.reset();
        actualizarMutation.reset();
        actualizarStockMutation.reset();
    };

    const handleSubmit = async (
        datos: ProductoFormData
    ): Promise<void> => {
        if (modalMode === "edit" && productoSeleccionado) {
            await actualizarMutation.mutateAsync({
                id: productoSeleccionado.id,
                datos,
            });
        } else if (modalMode === "create") {
            await crearMutation.mutateAsync(datos);
        }

        cerrarModal();
    };

    const handleUpdateStock = async (
        datos: ProductoStockUpdate
    ): Promise<void> => {
        if (!productoSeleccionado) {
            return;
        }

        await actualizarStockMutation.mutateAsync({
            id: productoSeleccionado.id,
            datos,
        });

        cerrarModal();
    };

    const handleDelete = (id: number) => {
        const confirmar = window.confirm(
            "¿Estás seguro de que deseas eliminar este producto?"
        );

        if (confirmar) {
            eliminarMutation.reset();
            eliminarMutation.mutate(id);
        }
    };

    if (isLoading) {
        return <LoadingState mensaje="Cargando productos..." />;
    }

    if (isError) {
        return <EstadoError mensaje={handleApiError(error)} />;
    }

    const modalEnviando =
        crearMutation.isPending ||
        actualizarMutation.isPending ||
        actualizarStockMutation.isPending;

    return (
        <div className="space-y-6">
            <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Productos
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Administrá los productos registrados en el sistema.
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                        Total de productos: {total}
                    </p>
                </div>

                {isAdmin && (
                    <button
                        type="button"
                        onClick={abrirModalCrear}
                        className="rounded-lg bg-teal-500 px-5 py-3 font-semibold text-slate-950 shadow-sm transition hover:bg-teal-400"
                    >
                        + Nuevo producto
                    </button>
                )}
            </section>

            {eliminarMutation.isError && (
                <EstadoError
                    mensaje={handleApiError(eliminarMutation.error)}
                />
            )}

            {productos.length === 0 ? (
                <EstadoVacio
                    mensaje="Todavía no hay productos registrados."
                />
            ) : (
                <ProductoList
                    productos={productos}
                    onEdit={abrirModalEditar}
                    onUpdateStock={abrirModalStock}
                    onDelete={handleDelete}
                    isAdmin={isAdmin}
                />
            )}

            {isAdmin && isModalOpen && (
                <ProductoModal
                    key={`${modalMode}-${productoSeleccionado?.id ?? "nuevo"}`}
                    isOpen={isModalOpen}
                    mode={modalMode}
                    producto={productoSeleccionado}
                    onClose={cerrarModal}
                    onSubmit={handleSubmit}
                    onUpdateStock={handleUpdateStock}
                    isSubmitting={modalEnviando}
                    errorMessage={
                        modalMode === "stock"
                            ? mensajeErrorStock
                            : mensajeErrorGuardado
                    }
                />
            )}
        </div>
    );
}