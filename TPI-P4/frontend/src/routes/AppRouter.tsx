import { Link, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, RegisterPage } from "@/features/auth";
import { AdminUsuariosPage } from "@/features/usuarios";
import { CategoriasPage } from "@/features/categorias";
import { CatalogoPage, ProductsPage } from "@/features/productos";
import { CarritoPage } from "@/features/pedidos/pages/CarritoPage";
import { CheckoutPage } from "@/features/pedidos/pages/CheckoutPage";
import { MisPedidosPage } from "@/features/pedidos/pages/MisPedidosPage";
import { AdminPedidosPage } from "@/features/pedidos/pages/AdminPedidosPage";
import { AdminResumenPage } from "@/features/pedidos/pages/AdminResumenPage";
import { GuestOnlyRoute, ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "@/shared/layout/MainLayout";
import { AdminLayout } from "@/shared/layout/admin/AdminLayout";
import { UnauthorizedPage } from "@/shared/components/UnauthorizedPage";
import { useThemeStore } from "@/store/themeStore";

function NotFoundPage() {
    return (
        <section className="py-16 text-center">
            <h1 className="text-2xl font-bold">
                Página no encontrada
            </h1>

            <p className="mt-3 text-slate-600 dark:text-slate-300">
                La dirección que ingresaste no existe.
            </p>

            <Link
                to="/"
                className="mt-5 inline-block text-blue-700 underline dark:text-blue-300"
            >
                Volver al inicio
            </Link>
        </section>
    );
}

export function AppRouter() {
    const darkMode = useThemeStore((state) => state.darkMode);

    return (
        <div
            className={`min-h-screen ${
                darkMode ? "dark" : ""
            } bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
        >
            <Routes>
                {/* Catálogo y rutas públicas con navegación de tienda */}
                <Route element={<MainLayout />}>
                    <Route
                        path="/"
                        element={<CatalogoPage />}
                    />

                    <Route
                        path="/carrito"
                        element={<CarritoPage />}
                    />

                    <Route
                        path="/unauthorized"
                        element={<UnauthorizedPage />}
                    />
                </Route>

                {/* Login y registro sin Navbar ni carrito */}
                <Route element={<GuestOnlyRoute />}>
                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/register"
                        element={<RegisterPage />}
                    />
                </Route>

                {/* Rutas que requieren sesión */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route
                            path="/checkout"
                            element={<CheckoutPage />}
                        />

                        <Route
                            path="/mis-pedidos"
                            element={<MisPedidosPage />}
                        />
                    </Route>
                </Route>

                {/* Rutas exclusivas de administradores */}
                <Route
                    element={
                        <ProtectedRoute allowedRoles={["admin"]} />
                    }
                >
                    <Route element={<AdminLayout />}>
                        <Route
                            path="/admin"
                            element={
                                <Navigate
                                    to="/admin/resumen"
                                    replace
                                />
                            }
                        />

                        <Route
                            path="/admin/resumen"
                            element={<AdminResumenPage />}
                        />

                        <Route
                            path="/admin/pedidos"
                            element={<AdminPedidosPage />}
                        />

                        <Route
                            path="/admin/categorias"
                            element={<CategoriasPage />}
                        />

                        <Route
                            path="/admin/productos"
                            element={<ProductsPage />}
                        />

                        <Route
                            path="/admin/usuarios"
                            element={<AdminUsuariosPage />}
                        />

                        {/* Compatibilidad con rutas anteriores */}
                        <Route
                            path="/categorias"
                            element={
                                <Navigate
                                    to="/admin/categorias"
                                    replace
                                />
                            }
                        />

                        <Route
                            path="/productos"
                            element={
                                <Navigate
                                    to="/admin/productos"
                                    replace
                                />
                            }
                        />

                        <Route
                            path="/admin/users"
                            element={
                                <Navigate
                                    to="/admin/usuarios"
                                    replace
                                />
                            }
                        />
                    </Route>
                </Route>

                {/* Ruta para direcciones inexistentes */}
                <Route
                    path="*"
                    element={<NotFoundPage />}
                />
            </Routes>
        </div>
    );
}