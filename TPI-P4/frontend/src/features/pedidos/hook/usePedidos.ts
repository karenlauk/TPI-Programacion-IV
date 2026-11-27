import { useMutation, useQuery, useQueryClient, } from "@tanstack/react-query";
import { listarPedidos, obtenerPedido, crearPedido, cancelarPedido, cambiarEstadoPedido, obtenerResumenPedidos, } from "../api/pedidos";
import type { EstadoPedido, PedidoCreate, } from "../types/pedido";
import { useAuthStore } from "@/features/auth/store/authStore";

const pedidosKey = ["pedidos"] as const;

export function usePedidos(
    skip = 0,
    limit = 20,
    estado?: EstadoPedido
) {
    const usuarioId = useAuthStore(
        (state) => state.user?.id
    );

    return useQuery({
        queryKey: [
            ...pedidosKey,
            usuarioId,
            { skip, limit, estado },
        ],

        queryFn: () =>
            listarPedidos({ skip, limit, estado }),

        enabled: usuarioId !== undefined,

        // Los pedidos se consultan nuevamente al entrar.
        staleTime: 0,
        refetchOnMount: "always",
    });
}

export function usePedido(pedidoId: number) {
    const usuarioId = useAuthStore(
        (state) => state.user?.id
    );

    return useQuery({
        queryKey: [
            ...pedidosKey,
            usuarioId,
            pedidoId,
        ],

        queryFn: () => obtenerPedido(pedidoId),

        enabled:
            usuarioId !== undefined &&
            pedidoId > 0,

        staleTime: 0,
    });
}

export function useCrearPedido() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (pedido: PedidoCreate) =>
            crearPedido(pedido),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: pedidosKey,
            });
        },
    });
}

export function useCancelarPedido() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (pedidoId: number) =>
            cancelarPedido(pedidoId),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: pedidosKey,
            });
        },
    });
}

export function useCambiarEstadoPedido() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pedidoId,
            estado,
        }: {
            pedidoId: number;
            estado: EstadoPedido;
        }) => cambiarEstadoPedido(pedidoId, estado),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: pedidosKey,
            });
        },
    });
}

export function useResumenPedidos() {
    return useQuery({
        queryKey: [...pedidosKey, "resumen"],
        queryFn: obtenerResumenPedidos,
    });
}