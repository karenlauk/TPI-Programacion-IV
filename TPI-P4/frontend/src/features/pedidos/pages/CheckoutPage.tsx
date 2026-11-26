import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CheckoutForm } from "../components/CheckoutForm";
import { useCrearPedido } from "../hook/usePedidos";
import { useCartStore } from "@/store/cartStore";
import { handleApiError } from "@/shared/api/handleApiError";
import type { PedidoCreate } from "../types/pedido";

type DatosCheckout = Omit<PedidoCreate, "items">;

export function CheckoutPage() {
    const navigate = useNavigate();

    const items = useCartStore((state) => state.items);
    const total = useCartStore((state) => state.total);
    const vaciar = useCartStore((state) => state.vaciar);

    const crearPedidoMutation = useCrearPedido();

    const [errorMessage, setErrorMessage] = useState("");

    async function confirmarPedido(data: DatosCheckout) {
        setErrorMessage("");

        if (items.length === 0) {
            setErrorMessage("Tu carrito está vacío.");
            return;
        }

        try {
            const pedido = await crearPedidoMutation.mutateAsync({
                ...data,
                items: items.map((item) => ({
                    producto_id: item.producto_id,
                    cantidad: item.cantidad,
                })),
            });

            vaciar();

            navigate("/mis-pedidos", {
                replace: true,
                state: {
                    pedidoCreado: pedido.id,
                },
            });
        } catch (error) {
            setErrorMessage(handleApiError(error));
        }
    }

    if (items.length === 0) {
        return (
            <section className="py-12 text-center">
                <h1 className="text-2xl font-bold">
                    Tu carrito está vacío
                </h1>

                <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Agregá productos antes de confirmar tu pedido.
                </p>

                <Link
                    to="/"
                    className="mt-5 inline-block rounded-md bg-blue-700 px-5 py-2 text-white hover:bg-blue-800"
                >
                    Ir al catálogo
                </Link>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-3xl font-bold">
                Confirmar pedido
            </h1>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                <h2 className="mb-4 text-xl font-semibold">
                    Resumen de compra
                </h2>

                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.producto_id}
                            className="flex justify-between gap-4 text-sm"
                        >
                            <span>
                                {item.nombre} × {item.cantidad}
                            </span>

                            <span className="font-medium">
                                ${
                                    (
                                        item.precio_unitario *
                                        item.cantidad
                                    ).toFixed(2)
                                }
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-5 flex justify-between border-t border-slate-200 pt-4 text-lg font-bold dark:border-slate-600">
                    <span>Total estimado</span>
                    <span>${total().toFixed(2)}</span>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                    El total definitivo será calculado por el servidor al crear el pedido.
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                <h2 className="mb-5 text-xl font-semibold">
                    Datos de entrega y pago
                </h2>

                {errorMessage && (
                    <div
                        role="alert"
                        className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                    >
                        {errorMessage}
                    </div>
                )}

                <CheckoutForm
                    onSubmit={confirmarPedido}
                    isSubmitting={crearPedidoMutation.isPending}
                />
            </div>
        </section>
    );
}