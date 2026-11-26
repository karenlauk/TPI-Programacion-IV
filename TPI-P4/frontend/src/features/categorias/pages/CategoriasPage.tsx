import { useState } from "react";
import { isAxiosError } from "axios";
import { CategoriaList } from "../components/CategoriaList";
import { CategoriaModal } from "../components/CategoriaModal";
import { useCategories } from "../hooks/useCategorias";
import { useAuth } from "@/features/auth";
import { LoadingState } from "@/shared/components/LoadingState";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { handleApiError } from "@/shared/api/handleApiError";
import type { Categoria, CategoriaFormData, } from "../types/categoria";

function obtenerMensajeError(error: unknown): string {
    const status = isAxiosError(error)
        ? error.response?.status
        : undefined;

    switch (status) {
        case 401:
            return "Tu sesión expiró. Iniciá sesión nuevamente.";

        case 403:
            return "No tenés permisos para realizar esta acción.";

        case 404:
            return handleApiError(error) ===
                "Request failed with status code 404"
                ? "La categoría ya no existe o fue dada de baja. Se actualizará el listado."
                : handleApiError(error);

        case 409:
        case 422:
        default:
            return handleApiError(error);
    }
}

export function CategoriasPage() {
    const { isAdmin } = useAuth();

    const {
        categorias,
        isLoading,
        isError,
        error,
        crearMutation,
        actualizarMutation,
        eliminarMutation,
    } = useCategories();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [categoriaSeleccionada, setCategoriaSeleccionada] =
        useState<Categoria | null>(null);

    const errorGuardado =
        crearMutation.error || actualizarMutation.error;

    const mensajeErrorGuardado = errorGuardado
        ? obtenerMensajeError(errorGuardado)
        : undefined;

    const abrirModalCrear = () => {
        crearMutation.reset();
        actualizarMutation.reset();

        setCategoriaSeleccionada(null);
        setIsModalOpen(true);
    };

    const abrirModalEditar = (categoria: Categoria) => {
        crearMutation.reset();
        actualizarMutation.reset();

        setCategoriaSeleccionada(categoria);
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setCategoriaSeleccionada(null);
    };

    const handleSubmit = async (
        datos: CategoriaFormData
    ): Promise<void> => {
        if (categoriaSeleccionada) {
            await actualizarMutation.mutateAsync({
                id: categoriaSeleccionada.id,
                datos,
            });
        } else {
            await crearMutation.mutateAsync(datos);
        }

        cerrarModal();
    };

    const handleDelete = (id: number) => {
        const confirmar = window.confirm(
            "¿Estás segura de que querés eliminar esta categoría?"
        );

        if (confirmar) {
            eliminarMutation.mutate(id);
        }
    };

    if (isLoading) {
        return <LoadingState mensaje="Cargando categorías..." />;
    }

    if (isError) {
        return (
            <EstadoError mensaje={obtenerMensajeError(error)} />
        );
    }

    return (
        <div className="space-y-6">
            <section className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Categorías
                    </h1>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Administrá las categorías de productos.
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                        Total de categorías: {categorias.length}
                    </p>
                </div>

                {isAdmin && (
                    <button
                        type="button"
                        onClick={abrirModalCrear}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                    >
                        + Nueva categoría
                    </button>
                )}
            </section>

            {eliminarMutation.isError && (
                <EstadoError
                    mensaje={obtenerMensajeError(eliminarMutation.error)}
                />
            )}

            {categorias.length === 0 ? (
                <EstadoVacio
                    mensaje="Todavía no hay categorías registradas."
                />
            ) : (
                <CategoriaList
                    categorias={categorias}
                    onEdit={abrirModalEditar}
                    onDelete={handleDelete}
                    isAdmin={isAdmin}
                />
            )}

            {isModalOpen && (
                <CategoriaModal
                    key={categoriaSeleccionada?.id ?? "nueva"}
                    isOpen={isModalOpen}
                    categoria={categoriaSeleccionada}
                    onClose={cerrarModal}
                    onSubmit={handleSubmit}
                    errorMessage={mensajeErrorGuardado}
                />
            )}
        </div>
    );
}