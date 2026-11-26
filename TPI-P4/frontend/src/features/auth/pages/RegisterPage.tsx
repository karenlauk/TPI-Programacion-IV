import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { isAxiosError } from "axios";
import { useRegister } from "../hooks/useRegister";

export function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useRegister();

    const [errorMessage, setErrorMessage] = useState("");

    const form = useForm({
        defaultValues: {
            username: "",
            nombre: "",
            apellido: "",
            email: "",
            password: "",
            confirmPassword: "",
        },

        onSubmit: async ({ value }) => {
            setErrorMessage("");

            try {
                await register({
                    username: value.username.trim(),
                    full_name: `${value.nombre.trim()} ${value.apellido.trim()}`,
                    email: value.email.trim(),
                    password: value.password,
                });

                navigate("/login", {
                    replace: true,
                    state: { registered: true },
                });
            } catch (error: unknown) {
                if (isAxiosError(error)) {
                    const status = error.response?.status;
                    const detail = error.response?.data?.detail;

                    if (status === 409) {
                        setErrorMessage(
                            "El correo electrónico o nombre de usuario ya está registrado."
                        );
                        return;
                    }

                    if (typeof detail === "string") {
                        setErrorMessage(detail);
                        return;
                    }

                    if (Array.isArray(detail)) {
                        setErrorMessage(
                            detail
                                .map((item: { msg?: string }) => item.msg)
                                .filter(Boolean)
                                .join(", ")
                        );
                        return;
                    }
                }

                setErrorMessage(
                    "No se pudo completar el registro. Intentá nuevamente."
                );
            }
        },
    });

    const inputClass =
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-900";

    const labelClass =
        "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

    const errorClass =
        "mt-1 text-sm text-red-600 dark:text-red-400";

    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-700 dark:bg-slate-800">

                <h1 className="mb-2 text-center text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Crear cuenta
                </h1>

                <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Registrate para comenzar a utilizar FoodStore.
                </p>

                {errorMessage && (
                    <div
                        role="alert"
                        className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                    >
                        {errorMessage}
                    </div>
                )}

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    {/* Nombre de usuario */}
                    <form.Field
                        name="username"
                        validators={{
                            onBlur: ({ value }) => {
                                if (!value.trim()) {
                                    return "El nombre de usuario es obligatorio.";
                                }

                                if (value.trim().length < 3) {
                                    return "Debe tener al menos 3 caracteres.";
                                }

                                return undefined;
                            },
                        }}
                    >
                        {(field) => (
                            <div>
                                <label
                                    htmlFor={field.name}
                                    className={labelClass}
                                >
                                    Nombre de usuario
                                </label>

                                <input
                                    id={field.name}
                                    type="text"
                                    autoComplete="username"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    className={inputClass}
                                />

                                {field.state.meta.errors.length > 0 && (
                                    <p className={errorClass}>
                                        {field.state.meta.errors.join(", ")}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    {/* Nombre */}
                    <form.Field
                        name="nombre"
                        validators={{
                            onBlur: ({ value }) =>
                                !value.trim()
                                    ? "El nombre es obligatorio."
                                    : undefined,
                        }}
                    >
                        {(field) => (
                            <div>
                                <label
                                    htmlFor={field.name}
                                    className={labelClass}
                                >
                                    Nombre
                                </label>

                                <input
                                    id={field.name}
                                    type="text"
                                    autoComplete="given-name"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    className={inputClass}
                                />

                                {field.state.meta.errors.length > 0 && (
                                    <p className={errorClass}>
                                        {field.state.meta.errors.join(", ")}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    {/* Apellido */}
                    <form.Field
                        name="apellido"
                        validators={{
                            onBlur: ({ value }) =>
                                !value.trim()
                                    ? "El apellido es obligatorio."
                                    : undefined,
                        }}
                    >
                        {(field) => (
                            <div>
                                <label
                                    htmlFor={field.name}
                                    className={labelClass}
                                >
                                    Apellido
                                </label>

                                <input
                                    id={field.name}
                                    type="text"
                                    autoComplete="family-name"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    className={inputClass}
                                />

                                {field.state.meta.errors.length > 0 && (
                                    <p className={errorClass}>
                                        {field.state.meta.errors.join(", ")}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    {/* Email */}
                    <form.Field
                        name="email"
                        validators={{
                            onBlur: ({ value }) =>
                                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                    value.trim()
                                )
                                    ? "Ingresá un correo electrónico válido."
                                    : undefined,
                        }}
                    >
                        {(field) => (
                            <div>
                                <label
                                    htmlFor={field.name}
                                    className={labelClass}
                                >
                                    Correo electrónico
                                </label>

                                <input
                                    id={field.name}
                                    type="email"
                                    autoComplete="email"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    className={inputClass}
                                />

                                {field.state.meta.errors.length > 0 && (
                                    <p className={errorClass}>
                                        {field.state.meta.errors.join(", ")}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    {/* Contraseña */}
                    <form.Field
                        name="password"
                        validators={{
                            onBlur: ({ value }) =>
                                value.length < 8
                                    ? "La contraseña debe tener al menos 8 caracteres."
                                    : undefined,
                        }}
                    >
                        {(field) => (
                            <div>
                                <label
                                    htmlFor={field.name}
                                    className={labelClass}
                                >
                                    Contraseña
                                </label>

                                <input
                                    id={field.name}
                                    type="password"
                                    autoComplete="new-password"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    className={inputClass}
                                />

                                {field.state.meta.errors.length > 0 && (
                                    <p className={errorClass}>
                                        {field.state.meta.errors.join(", ")}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    {/* Confirmar contraseña */}
                    <form.Field
                        name="confirmPassword"
                        validators={{
                            onBlur: ({ value, fieldApi }) =>
                                value !==
                                fieldApi.form.getFieldValue("password")
                                    ? "Las contraseñas no coinciden."
                                    : undefined,
                        }}
                    >
                        {(field) => (
                            <div>
                                <label
                                    htmlFor={field.name}
                                    className={labelClass}
                                >
                                    Confirmar contraseña
                                </label>

                                <input
                                    id={field.name}
                                    type="password"
                                    autoComplete="new-password"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    className={inputClass}
                                />

                                {field.state.meta.errors.length > 0 && (
                                    <p className={errorClass}>
                                        {field.state.meta.errors.join(", ")}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    {/* Botón de registro */}
                    <form.Subscribe
                        selector={(state) => [
                            state.canSubmit,
                            state.isSubmitting,
                        ]}
                    >
                        {([canSubmit, isSubmitting]) => (
                            <button
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                                className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? "Registrando..."
                                    : "Crear cuenta"}
                            </button>
                        )}
                    </form.Subscribe>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
                    ¿Ya tenés una cuenta?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                        Iniciá sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}