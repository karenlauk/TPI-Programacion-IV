import { useMutation, useQuery, useQueryClient, } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/axiosInstance";
import type { Producto, ProductoFormData, ProductoStockUpdate, } from "../types/producto";

export interface FiltrosProductos {
    skip: number;
    limit: number;
    search?: string;
    categoria_id?: number;
    disponible?: boolean;
}

export interface ProductosPaginados {
    total: number;
    items: Producto[];
}

const PRODUCTOS_QUERY_KEY = ["productos"];

async function obtenerProductos(
    filtros: FiltrosProductos
): Promise<ProductosPaginados> {
    const response = await axiosInstance.get<ProductosPaginados>(
        "/productos",
        {
            params: {
                skip: filtros.skip,
                limit: filtros.limit,
                search: filtros.search || undefined,
                categoria_id: filtros.categoria_id || undefined,
                disponible: filtros.disponible,
            },
        }
    );

    return response.data;
}

export function useProductos(filtros?: FiltrosProductos) {
    const queryClient = useQueryClient();

    const filtrosConsulta: FiltrosProductos = filtros ?? {
        skip: 0,
        limit: 100,
    };

    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: [...PRODUCTOS_QUERY_KEY, filtrosConsulta],
        queryFn: () => obtenerProductos(filtrosConsulta),
        placeholderData: (datosAnteriores) => datosAnteriores,
    });

    // Si el backend responde 404, actualizamos las listas
    // para retirar los registros que ya no están activos.
    const actualizarListados = async () => {
        await queryClient.invalidateQueries({
            queryKey: PRODUCTOS_QUERY_KEY,
        });
    };

    const crearMutation = useMutation({
        mutationFn: async (datos: ProductoFormData) => {
            const response = await axiosInstance.post<Producto>(
                "/productos",
                datos
            );

            return response.data;
        },
        onSuccess: actualizarListados,
    });

    const actualizarMutation = useMutation({
        mutationFn: async ({
            id,
            datos,
        }: {
            id: number;
            datos: ProductoFormData;
        }) => {
            const response = await axiosInstance.put<Producto>(
                `/productos/${id}`,
                datos
            );

            return response.data;
        },
        onSuccess: actualizarListados,
        onError: async (error) => {
            if (
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                (error as { response?: { status?: number } })
                    .response?.status === 404
            ) {
                await actualizarListados();
            }
        },
    });

    const actualizarStockMutation = useMutation({
        mutationFn: async ({
            id,
            datos,
        }: {
            id: number;
            datos: ProductoStockUpdate;
        }) => {
            const response = await axiosInstance.patch<Producto>(
                `/productos/${id}/stock`,
                datos
            );

            return response.data;
        },
        onSuccess: actualizarListados,
        onError: async (error) => {
            if (
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                (error as { response?: { status?: number } })
                    .response?.status === 404
            ) {
                await actualizarListados();
            }
        },
    });

    const eliminarMutation = useMutation({
        mutationFn: async (id: number) => {
            await axiosInstance.delete(`/productos/${id}`);
        },
        onSuccess: actualizarListados,
        onError: async (error) => {
            if (
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                (error as { response?: { status?: number } })
                    .response?.status === 404
            ) {
                await actualizarListados();
            }
        },
    });

    return {
        productos: data?.items ?? [],
        total: data?.total ?? 0,
        isLoading,
        isError,
        error,
        isFetching,
        crearMutation,
        actualizarMutation,
        actualizarStockMutation,
        eliminarMutation,
    };
}