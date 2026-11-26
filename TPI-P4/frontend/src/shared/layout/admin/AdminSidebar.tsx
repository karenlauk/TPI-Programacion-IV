import { NavLink, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/features/auth";
import { useThemeStore } from "@/store/themeStore";
import { useNotificationStore } from "@/store/notificationStore";

const enlaces = [
    {
        to: "/admin/resumen",
        label: "Resumen",
        icon: "layout-dashboard",
    },
    {
        to: "/admin/pedidos",
        label: "Pedidos",
        icon: "shopping-bag",
    },
    {
        to: "/admin/productos",
        label: "Productos",
        icon: "package",
    },
    {
        to: "/admin/categorias",
        label: "Categorías",
        icon: "tags",
    },
    {
        to: "/admin/usuarios",
        label: "Usuarios",
        icon: "users",
    },
];

function Icono({ nombre }: { nombre: string }) {
    const paths: Record<string, ReactNode> = {
        "layout-dashboard": (
            <>
                <rect x="3" y="3" width="8" height="8" rx="1.5" />
                <rect x="13" y="3" width="8" height="5" rx="1.5" />
                <rect x="13" y="10" width="8" height="11" rx="1.5" />
                <rect x="3" y="13" width="8" height="8" rx="1.5" />
            </>
        ),
        "shopping-bag": (
            <>
                <path d="M5 8h14l1 13H4L5 8Z" />
                <path d="M9 8a3 3 0 0 1 6 0" />
            </>
        ),
        package: (
            <>
                <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                <path d="M3 8v9l9 5 9-5V8" />
                <path d="M12 13v9" />
            </>
        ),
        tags: (
            <>
                <path d="m20 13-7 7-10-10V3h7l10 10Z" />
                <circle cx="7.5" cy="7.5" r="1" />
            </>
        ),
        users: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </>
        ),
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-5 w-5 shrink-0"
        >
            {paths[nombre] ?? null}
        </svg>
    );
}

export function AdminSidebar() {
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const darkMode = useThemeStore((state) => state.darkMode);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);

    const showNotification = useNotificationStore(
        (state) => state.showNotification
    );

    const nombreUsuario = user?.full_name?.trim() || "Administrador";
    const inicialUsuario = nombreUsuario.charAt(0).toUpperCase();

    async function handleLogout() {
        try {
            await logout();
            showNotification("Sesión cerrada correctamente.");
        } catch {
            showNotification(
                "Se cerró la sesión local, pero no se pudo confirmar el cierre en el servidor."
            );
        } finally {
            navigate("/login", { replace: true });
        }
    }

    return (
        <aside className="z-30 flex w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r dark:border-slate-700 dark:bg-slate-900">
            {/* Marca */}
            <div className="flex items-center gap-3 px-5 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#071b31] text-lg font-black text-teal-300">
                    F
                </div>

                <div className="min-w-0">
                    <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Food
                        <span className="text-teal-600 dark:text-teal-400">
                            Store
                        </span>
                    </p>

                    <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400">
                        ADMINISTRACIÓN
                    </p>
                </div>
            </div>

            {/* Navegación */}
            <nav
                aria-label="Menú administrativo"
                className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:px-3 lg:py-4"
            >
                <p className="hidden px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:block">
                    Menú principal
                </p>

                {enlaces.map((enlace) => (
                    <NavLink
                        key={enlace.to}
                        to={enlace.to}
                        className={({ isActive }) =>
                            `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                                isActive
                                    ? "bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                            }`
                        }
                    >
                        <Icono nombre={enlace.icon} />
                        <span>{enlace.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Acciones para pantallas pequeñas */}
            <div className="flex gap-2 px-4 pb-3 lg:hidden">
                <NavLink
                    to="/"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    <span aria-hidden="true">↗</span>
                    Tienda
                </NavLink>

                <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    {darkMode ? "☀ Tema claro" : "☾ Tema oscuro"}
                </button>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
                >
                    Cerrar sesión
                </button>
            </div>

            {/* Acciones inferiores para escritorio */}
            <div className="hidden space-y-2 border-t border-slate-200 p-4 lg:block dark:border-slate-700">
                <NavLink
                    to="/"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    <span aria-hidden="true">↗</span>
                    Volver a la tienda
                </NavLink>

                <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    <span aria-hidden="true">
                        {darkMode ? "☀" : "☾"}
                    </span>
                    {darkMode ? "Tema claro" : "Tema oscuro"}
                </button>

                {/* Usuario y cierre de sesión */}
                <div className="mt-3 flex items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                        {inicialUsuario}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800 dark:text-white">
                            {nombreUsuario}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Administrador
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        title="Cerrar sesión"
                        aria-label="Cerrar sesión"
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="h-5 w-5"
                        >
                            <path d="M10 17l5-5-5-5M15 12H3" />
                            <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
}