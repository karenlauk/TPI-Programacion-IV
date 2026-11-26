import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ItemCarrito {
    producto_id: number;
    nombre: string;
    precio_unitario: number;
    cantidad: number;
    imagen_url?: string;
}

interface ProductoParaCarrito {
    id: number;
    nombre: string;
    precio_base: number;
    imagen_url?: string;
}

interface CartStore {
    items: ItemCarrito[];

    panelAbierto: boolean;
    abrirPanel: () => void;
    cerrarPanel: () => void;

    agregar: (producto: ProductoParaCarrito, cantidad?: number) => void;
    quitar: (productoId: number) => void;
    cambiarCantidad: (productoId: number, cantidad: number) => void;
    vaciar: () => void;
    total: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            panelAbierto: false,

            abrirPanel: () => set({ panelAbierto: true }),

            cerrarPanel: () => set({ panelAbierto: false }),

            agregar: (producto, cantidad = 1) => {
                if (cantidad < 1) return;

                set((state) => {
                    const existente = state.items.find(
                        (item) => item.producto_id === producto.id
                    );

                    if (existente) {
                        return {
                            items: state.items.map((item) =>
                                item.producto_id === producto.id
                                    ? {
                                            ...item,
                                            cantidad: item.cantidad + cantidad,
                                        }
                                    : item
                            ),
                        };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                producto_id: producto.id,
                                nombre: producto.nombre,
                                precio_unitario: producto.precio_base,
                                cantidad,
                                imagen_url: producto.imagen_url,
                            },
                        ],
                    };
                });
            },

            quitar: (productoId) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) => item.producto_id !== productoId
                    ),
                }));
            },

            cambiarCantidad: (productoId, cantidad) => {
                if (cantidad < 1) return;

                set((state) => ({
                    items: state.items.map((item) =>
                        item.producto_id === productoId
                            ? { ...item, cantidad }
                            : item
                    ),
                }));
            },

            vaciar: () => {
                set({ items: [] });
            },

            total: () =>
                get().items.reduce(
                    (acumulado, item) =>
                        acumulado + item.precio_unitario * item.cantidad,
                    0
                ),
        }),
        {
            name: "foodstore-cart",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                items: state.items,
            }),
        }
    )
);