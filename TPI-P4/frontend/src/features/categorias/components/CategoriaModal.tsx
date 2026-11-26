import { useForm } from "@tanstack/react-form";
import type { Categoria, CategoriaFormData, } from "../types/categoria";

type CategoriaModalProps = {
    isOpen: boolean;
    categoria: Categoria | null;
    onClose: () => void;
    onSubmit: (datos: CategoriaFormData) => Promise<void>;
    errorMessage?: string;
};

export function CategoriaModal({
    isOpen,
    categoria,
    onClose,
    onSubmit,
    errorMessage,
}: CategoriaModalProps) {
    const form = useForm({
        defaultValues: {
            nombre: categoria?.nombre ?? "",
            descripcion: categoria?.descripcion ?? "",
        },

        onSubmit: async ({ value }) => {
            const datos: CategoriaFormData = {
                nombre: value.nombre.trim(),
                descripcion: value.descripcion.trim(),
            };

            await onSubmit(datos);
        },
    });

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-titulo"
                className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-slate-800"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-6">
                    <h2
                        id="modal-titulo"
                        className="text-xl font-semibold text-slate-800 dark:text-slate-100"
                    >
                        {categoria
                            ? "Editar categoría"
                            : "Añadir categoría"}
                    </h2>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <form.Field
                        name="nombre"
                        validators={{
                            onChange: ({ value }) => {
                                const nombre = value.trim();

                                if (nombre.length === 0) {
                                    return "El nombre es obligatorio.";
                                }

                                if (nombre.length < 2) {
                                    return "El nombre debe tener al menos 2 caracteres.";
                                }

                                if (nombre.length > 100) {
                                    return "El nombre no puede superar los 100 caracteres.";
                                }

                                return undefined;
                            },
                        }}
                    >
                        {(field) => (
                            <div className="mb-5">
                                <label
                                    htmlFor={field.name}
                                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                                >
                                    Nombre de la categoría
                                </label>

                                <input
                                    id={field.name}
                                    name={field.name}
                                    type="text"
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    placeholder="Ingresá el nombre"
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900"
                                />

                                {field.state.meta.errors.length > 0 && (
                                    <p
                                        role="alert"
                                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                                    >
                                        {field.state.meta.errors.join(", ")}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="descripcion">
                        {(field) => (
                            <div className="mb-6">
                                <label
                                    htmlFor={field.name}
                                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                                >
                                    Descripción
                                </label>

                                <textarea
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    placeholder="Ingresá la descripción (opcional)"
                                    rows={3}
                                    className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900"
                                />
                            </div>
                        )}
                    </form.Field>

                    {errorMessage && (
                        <div
                            role="alert"
                            className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                        >
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                        >
                            Cancelar
                        </button>

                        <form.Subscribe
                            selector={(state) => ({
                                canSubmit: state.canSubmit,
                                isSubmitting: state.isSubmitting,
                            })}
                        >
                            {({ canSubmit, isSubmitting }) => (
                                <button
                                    type="submit"
                                    disabled={!canSubmit || isSubmitting}
                                    className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting
                                        ? "Guardando..."
                                        : "Guardar"}
                                </button>
                            )}
                        </form.Subscribe>
                    </div>
                </form>
            </div>
        </div>
    );
}