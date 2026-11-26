import { useMutation, useQuery, useQueryClient, } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { axiosInstance } from "@/shared/api/axiosInstance";
import { useNotificationStore } from "@/store/notificationStore";
import type { Categoria, CategoriaFormData, } from "../types/categoria";

const CATEGORIES_QUERY_KEY = ["categorias"];

// GET: obtener categorías activas
async function obtenerCategorias(): Promise<Categoria[]> {
    const response = await axiosInstance.get<Categoria[]>(
        "/categorias"
    );

    return response.data;
}

// POST: crear categoría.
async function crearCategoria(
    datos: CategoriaFormData
): Promise<Categoria> {
    const response = await axiosInstance.post<Categoria>(
        "/categorias",
        datos
    );

    return response.data;
}

// PUT: actualizar categoría
async function actualizarCategoria(
    id: number,
    datos: CategoriaFormData
): Promise<Categoria> {
    const response = await axiosInstance.put<Categoria>(
        `/categorias/${id}`,
        datos
    );

    return response.data;
}

// DELETE: baja lógica
async function eliminarCategoria(id: number): Promise<void> {
    await axiosInstance.delete(`/categorias/${id}`);
}

export function useCategories() {
    const queryClient = useQueryClient();

    const showNotification = useNotificationStore(
        (state) => state.showNotification
    );

    const {
        data: categorias = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: CATEGORIES_QUERY_KEY,
        queryFn: obtenerCategorias,
    });

    const crearMutation = useMutation({
        mutationFn: crearCategoria,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: CATEGORIES_QUERY_KEY,
            });

            showNotification("Categoría creada correctamente.");
        },

        onError: (error) => {
            if (
                isAxiosError(error) &&
                error.response?.status === 403
            ) {
                return;
            }

            showNotification("No se pudo crear la categoría.");
        },
    });

    const actualizarMutation = useMutation({
        mutationFn: ({
            id,
            datos,
        }: {
            id: number;
            datos: CategoriaFormData;
        }) => actualizarCategoria(id, datos),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: CATEGORIES_QUERY_KEY,
            });

            showNotification("Categoría actualizada correctamente.");
        },

        onError: async (error) => {
            if (
                isAxiosError(error) &&
                error.response?.status === 404
            ) {
                await queryClient.invalidateQueries({
                    queryKey: CATEGORIES_QUERY_KEY,
                });
            }

            if (
                isAxiosError(error) &&
                error.response?.status === 403
            ) {
                return;
            }

            showNotification("No se pudo actualizar la categoría.");
        },
    });

    const eliminarMutation = useMutation({
        mutationFn: eliminarCategoria,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: CATEGORIES_QUERY_KEY,
            });

            showNotification("Categoría eliminada correctamente.");
        },

        onError: async (error) => {
            if (
                isAxiosError(error) &&
                error.response?.status === 404
            ) {
                await queryClient.invalidateQueries({
                    queryKey: CATEGORIES_QUERY_KEY,
                });
            }

            if (
                isAxiosError(error) &&
                error.response?.status === 403
            ) {
                return;
            }

            showNotification("No se pudo eliminar la categoría.");
        },
    });

    return {
        categorias,
        isLoading,
        isError,
        error,
        crearMutation,
        actualizarMutation,
        eliminarMutation,
    };
}