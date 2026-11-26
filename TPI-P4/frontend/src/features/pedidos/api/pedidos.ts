import { axiosInstance } from "@/shared/api/axiosInstance";
import type { CambioEstado, EstadoPedido, Pedido, PedidoCreate, PedidosPaginados, ResumenPedidos, } from "../types/pedido";

interface ListarPedidosParams {
    skip?: number;
    limit?: number;
    estado?: EstadoPedido;
}

export async function listarPedidos(
    params: ListarPedidosParams = {}
): Promise<PedidosPaginados> {
    const { data } = await axiosInstance.get<PedidosPaginados>(
        "/pedidos",
        { params }
    );

    return data;
}

export async function obtenerPedido(
    pedidoId: number
): Promise<Pedido> {
    const { data } = await axiosInstance.get<Pedido>(
        `/pedidos/${pedidoId}`
    );

    return data;
}

export async function crearPedido(
    pedido: PedidoCreate
): Promise<Pedido> {
    const { data } = await axiosInstance.post<Pedido>(
        "/pedidos",
        pedido
    );

    return data;
}

export async function cancelarPedido(
    pedidoId: number
): Promise<Pedido> {
    const { data } = await axiosInstance.patch<Pedido>(
        `/pedidos/${pedidoId}/cancelar`
    );

    return data;
}

export async function cambiarEstadoPedido(
    pedidoId: number,
    estado: EstadoPedido
): Promise<Pedido> {
    const payload: CambioEstado = { estado };

    const { data } = await axiosInstance.patch<Pedido>(
        `/pedidos/${pedidoId}/estado`,
        payload
    );

    return data;
}

export async function obtenerResumenPedidos(): Promise<ResumenPedidos> {
    const { data } = await axiosInstance.get<ResumenPedidos>(
        "/pedidos/resumen"
    );

    return data;
}