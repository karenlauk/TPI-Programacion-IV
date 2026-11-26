export type EstadoPedido =
    | "PENDIENTE"
    | "EN_PREPARACION"
    | "ENTREGADO"
    | "CANCELADO";

export type FormaPago =
    | "EFECTIVO"
    | "TRANSFERENCIA";

export interface ItemPedidoCreate {
    producto_id: number;
    cantidad: number;
}

export interface PedidoCreate {
    items: ItemPedidoCreate[];
    forma_pago: FormaPago;
    direccion_entrega: string;
    notas: string | null;
}

export interface CambioEstado {
    estado: EstadoPedido;
}

export interface DetallePedido {
    producto_id: number;
    nombre_producto: string;
    precio_unitario: number;
    cantidad: number;
    subtotal: number;
}

export interface UsuarioPedido {
    id: number;
    username: string;
    full_name: string;
    email: string;
}

export interface Pedido {
    id: number;
    usuario_id: number;
    usuario: UsuarioPedido;
    estado: EstadoPedido;
    forma_pago: FormaPago;
    direccion_entrega: string;
    notas: string | null;
    total: number;
    created_at: string;
    updated_at: string;
    items: DetallePedido[];
}

export interface PedidosPaginados {
    total: number;
    items: Pedido[];
}

export interface ResumenPedidos {
    pendientes: number;
    en_preparacion: number;
    entregados: number;
    cancelados: number;
    pedidos_hoy: number;
    ingresos_entregados: number;
}