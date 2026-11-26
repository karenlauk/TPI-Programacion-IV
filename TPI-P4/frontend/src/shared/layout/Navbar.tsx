import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useThemeStore } from "@/store/themeStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useCartStore } from "@/store/cartStore";

export function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const cantidadEnCarrito = useCartStore((state) =>
        state.items.reduce((total, item) => total + item.cantidad, 0)
    );

    const abrirPanel = useCartStore((state) => state.abrirPanel);
    const panelAbierto = useCartStore((state) => state.panelAbierto);

    const showNotification = useNotificationStore(
        (state) => state.showNotification
    );

    const darkMode = useThemeStore((state) => state.darkMode);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);

    const isAdmin = user?.role === "admin";

    const linkClass = (path: string) => {
        const activo =
            path === "/"
                ? location.pathname === "/"
                : location.pathname === path ||
                    location.pathname.startsWith(`${path}/`);

        return `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            activo
                ? "bg-teal-400/15 text-teal-300"
                : "text-slate-200 hover:bg-white/10 hover:text-white"
        }`;
    };

    const adminLinkClass = ({ isActive }: { isActive: boolean }) =>
        `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive
                ? "bg-teal-400/15 text-teal-300"
                : "text-slate-200 hover:bg-white/10 hover:text-white"
        }`;

    const handleLogout = async () => {
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
    };

    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071b31]/95 text-white shadow-lg shadow-slate-950/10 backdrop-blur-md">
            <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                {/* Marca */}
                <Link to="/" className="group flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-teal-300/30 bg-teal-400/10 text-xl font-black text-teal-300 transition group-hover:bg-teal-400/20">
                        F
                    </span>

                    <span>
                        <span className="block text-xl font-bold tracking-tight">
                            Food<span className="text-teal-300">Store</span>
                        </span>
                        <span className="block text-[11px] tracking-wide text-slate-400">
                            TU TIENDA DE COMIDAS
                        </span>
                    </span>
                </Link>

                {/* Navegación principal */}
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <Link to="/" className={linkClass("/")}>
                        Catálogo
                    </Link>

                    {user && !isAdmin && (
                        <Link
                            to="/mis-pedidos"
                            className={linkClass("/mis-pedidos")}
                        >
                            Mis pedidos
                        </Link>
                    )}

                    {/* Menú administrativo desplegable */}
                    {isAdmin && (
                        <details className="group relative">
                            <summary
                                className={`flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors marker:hidden ${
                                    location.pathname.startsWith("/admin")
                                        ? "bg-teal-400/15 text-teal-300"
                                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                Administración

                                <svg
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-4 w-4 transition-transform group-open:rotate-180"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="m5 7.5 5 5 5-5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </summary>

                            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-700 bg-[#0d2943] p-2 shadow-xl shadow-slate-950/30">
                                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                    Panel de administración
                                </p>

                                <NavLink
                                    to="/admin/resumen"
                                    className={adminLinkClass}
                                >
                                    Resumen
                                </NavLink>

                                <NavLink
                                    to="/admin/pedidos"
                                    className={adminLinkClass}
                                >
                                    Pedidos
                                </NavLink>

                                <NavLink
                                    to="/admin/productos"
                                    className={adminLinkClass}
                                >
                                    Productos
                                </NavLink>

                                <NavLink
                                    to="/admin/categorias"
                                    className={adminLinkClass}
                                >
                                    Categorías
                                </NavLink>

                                <NavLink
                                    to="/admin/usuarios"
                                    className={adminLinkClass}
                                >
                                    Usuarios
                                </NavLink>
                            </div>
                        </details>
                    )}

                    {/* Abrir carrito lateral */}
                    <button
                        type="button"
                        onClick={abrirPanel}
                        aria-label={`Abrir carrito, ${cantidadEnCarrito} unidades`}
                        aria-expanded={panelAbierto}
                        className={`relative ml-1 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                            panelAbierto
                                ? "border-teal-300/40 bg-teal-400/15 text-teal-200"
                                : "border-white/10 bg-white/5 text-white hover:border-teal-300/40 hover:bg-white/10"
                        }`}
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-5 w-5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 3h2l2.2 11.1a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L21 7H6"
                            />
                            <circle cx="10" cy="20" r="1.2" />
                            <circle cx="18" cy="20" r="1.2" />
                        </svg>

                        <span>Carrito</span>

                        {cantidadEnCarrito > 0 && (
                            <span className="flex min-w-5 items-center justify-center rounded-full bg-teal-400 px-1.5 py-0.5 text-[11px] font-bold text-[#071b31]">
                                {cantidadEnCarrito > 99
                                    ? "99+"
                                    : cantidadEnCarrito}
                            </span>
                        )}
                    </button>
                </div>

                {/* Usuario y configuración */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Cambiar tema"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                    >
                        {darkMode ? "☀ Tema claro" : "☾ Tema oscuro"}
                    </button>

                    {user ? (
                        <>
                            <div className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 sm:block">
                                <p className="max-w-36 truncate text-sm font-semibold text-white">
                                    {user.full_name}
                                </p>

                                <p className="text-xs text-slate-400">
                                    {isAdmin ? "Administrador" : "Cliente"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-500/20 hover:text-red-200"
                            >
                                Cerrar sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:text-white"
                            >
                                Iniciar sesión
                            </Link>

                            <Link
                                to="/register"
                                className="rounded-lg bg-teal-400 px-3 py-2 text-sm font-bold text-[#071b31] transition hover:bg-teal-300"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}