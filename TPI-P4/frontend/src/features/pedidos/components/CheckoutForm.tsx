import { useForm } from "@tanstack/react-form";
import type { FormaPago, PedidoCreate } from "../types/pedido";

type DatosCheckout = Omit<PedidoCreate, "items">;

interface CheckoutFormProps {
    onSubmit: (data: DatosCheckout) => Promise<void>;
    isSubmitting: boolean;
}

const inputClass =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-white";

function validarDireccion(value: string) {
    const direccion = value.trim();

    if (direccion.length < 5) {
        return "Ingresá una dirección válida (mínimo 5 caracteres).";
    }

    if (direccion.length > 200) {
        return "La dirección no puede superar los 200 caracteres.";
    }

    return undefined;
}

export function CheckoutForm({
    onSubmit,
    isSubmitting,
}: CheckoutFormProps) {
    const form = useForm({
        defaultValues: {
            direccion_entrega: "",
            forma_pago: "EFECTIVO" as FormaPago,
            notas: "",
        },

        onSubmit: async ({ value }) => {
            await onSubmit({
                direccion_entrega: value.direccion_entrega.trim(),
                forma_pago: value.forma_pago,
                notas: value.notas.trim() || null,
            });
        },
    });

    return (
        <form
            className="space-y-5"
            onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void form.handleSubmit();
            }}
        >
            <form.Field
                name="direccion_entrega"
                validators={{
                    onBlur: ({ value }) => validarDireccion(value),
                    onSubmit: ({ value }) => validarDireccion(value),
                }}
            >
                {(field) => (
                    <div>
                        <label
                            htmlFor={field.name}
                            className="mb-1 block text-sm font-medium"
                        >
                            Dirección de entrega
                        </label>

                        <input
                            id={field.name}
                            name={field.name}
                            type="text"
                            autoComplete="street-address"
                            value={field.state.value}
                            onChange={(event) =>
                                field.handleChange(event.target.value)
                            }
                            onBlur={field.handleBlur}
                            disabled={isSubmitting}
                            maxLength={200}
                            placeholder="Calle, número, localidad..."
                            className={inputClass}
                        />

                        {field.state.meta.errors.length > 0 && (
                            <p className="mt-1 text-sm text-red-600">
                                {field.state.meta.errors.join(", ")}
                            </p>
                        )}
                    </div>
                )}
            </form.Field>

            <form.Field name="forma_pago">
                {(field) => (
                    <div>
                        <label
                            htmlFor={field.name}
                            className="mb-1 block text-sm font-medium"
                        >
                            Forma de pago
                        </label>

                        <select
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onChange={(event) =>
                                field.handleChange(
                                    event.target.value as FormaPago
                                )
                            }
                            disabled={isSubmitting}
                            className={inputClass}
                        >
                            <option value="EFECTIVO">
                                Efectivo
                            </option>

                            <option value="TRANSFERENCIA">
                                Transferencia
                            </option>
                        </select>
                    </div>
                )}
            </form.Field>

            <form.Field name="notas">
                {(field) => (
                    <div>
                        <label
                            htmlFor={field.name}
                            className="mb-1 block text-sm font-medium"
                        >
                            Notas adicionales (opcional)
                        </label>

                        <textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onChange={(event) =>
                                field.handleChange(event.target.value)
                            }
                            disabled={isSubmitting}
                            rows={3}
                            placeholder="Indicaciones para la entrega..."
                            className={inputClass}
                        />
                    </div>
                )}
            </form.Field>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-blue-700 px-4 py-3 font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting
                    ? "Confirmando pedido..."
                    : "Confirmar pedido"}
            </button>
        </form>
    );
}