import { useMutation, useQuery, useQueryClient, } from "@tanstack/react-query";
import { listarPedidos, obtenerPedido, crearPedido, cancelarPedido, cambiarEstadoPedido, obtenerResumenPedidos, } from "../api/pedidos";
import type { EstadoPedido, PedidoCreate, } from "../types/pedido";

const pedidosKey = ["pedidos"];

export function usePedidos(
    skip = 0,
    limit = 20,
    estado?: EstadoPedido
) {
    return useQuery({
        queryKey: [...pedidosKey, { skip, limit, estado }],
        queryFn: () => listarPedidos({ skip, limit, estado }),
    });
}

export function usePedido(pedidoId: number) {
    return useQuery({
        queryKey: [...pedidosKey, pedidoId],
        queryFn: () => obtenerPedido(pedidoId),
        enabled: pedidoId > 0,
    });
}

export function useCrearPedido() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (pedido: PedidoCreate) =>
            crearPedido(pedido),

        onSuccess: () => {
            queryClient.invalidateQueries({
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

        onSuccess: () => {
            queryClient.invalidateQueries({
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

        onSuccess: () => {
            queryClient.invalidateQueries({
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