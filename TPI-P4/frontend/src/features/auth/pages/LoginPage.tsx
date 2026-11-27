import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useAuth } from "../hooks/loginPage";
import { handleApiError } from "@/shared/api/handleApiError";

interface LoginNavigationState {
    from?: {
        pathname?: unknown;
    };
}

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const { login } = useAuth();

    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigationState =
        location.state as LoginNavigationState | null;

    const requestedPath = navigationState?.from?.pathname;

    const form = useForm({
        defaultValues: {
            username: "",
            password: "",
        },

        onSubmit: async ({ value }) => {
            setErrorMessage("");
            setIsSubmitting(true);

            try {
                const user = await login(
                    value.username,
                    value.password
                );

                const safeRequestedPath =
                    typeof requestedPath === "string" &&
                    requestedPath.startsWith("/") &&
                    !requestedPath.startsWith("//")
                        ? requestedPath
                        : null;

                const destination =
                    safeRequestedPath ??
                    (user.role === "admin"
                        ? "/admin/categorias"
                        : "/");

                navigate(destination, {
                    replace: true,
                });
            } catch (error) {
                console.error("Error al iniciar sesión:", error);

                setErrorMessage(handleApiError(error));
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-700 dark:bg-slate-800">
                <h1 className="mb-2 text-center text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Iniciar sesión
                </h1>

                <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Ingresá tus credenciales para acceder a FoodStore.
                </p>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void form.handleSubmit();
                    }}
                    className="space-y-5"
                >
                    <form.Field
                        name="username"
                        validators={{
                            onBlur: ({ value }) =>
                                !value.trim()
                                    ? "El nombre de usuario es obligatorio."
                                    : undefined,
                        }}
                    >
                        {(field) => (
                            <div>
                                <label
                                    htmlFor={field.name}
                                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Nombre de usuario
                                </label>

                                <input
                                    id={field.name}
                                    name={field.name}
                                    type="text"
                                    autoComplete="username"
                                    autoFocus
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={isSubmitting}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    placeholder="Ingresá tu usuario"
                                />

                                {field.state.meta.errors.length > 0 && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {field.state.meta.errors.join(", ")}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Field
                        name="password"
                        validators={{
                            onBlur: ({ value }) =>
                                !value
                                    ? "La contraseña es obligatoria."
                                    : undefined,
                        }}
                    >
                        {(field) => (
                            <div>
                                <label
                                    htmlFor={field.name}
                                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Contraseña
                                </label>

                                <input
                                    id={field.name}
                                    name={field.name}
                                    type="password"
                                    autoComplete="current-password"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={isSubmitting}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    placeholder="Ingresá tu contraseña"
                                />

                                {field.state.meta.errors.length > 0 && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {field.state.meta.errors.join(", ")}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-blue-700 px-4 py-2.5 font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting
                            ? "Ingresando..."
                            : "Iniciar sesión"}
                    </button>

                    {errorMessage && (
                        <div
                            role="alert"
                            className="rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                        >
                            {errorMessage}
                        </div>
                    )}
                </form>

                <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
                    ¿No tenés una cuenta?{" "}
                    <Link
                        to="/register"
                        className="font-medium text-blue-700 hover:underline dark:text-blue-300"
                    >
                        Registrate
                    </Link>
                </p>
            </div>
        </div>
    );
}