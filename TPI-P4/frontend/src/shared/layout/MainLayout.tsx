import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { CartDrawer } from "@/features/pedidos/components/CartDrawer";

export function MainLayout() {
    return (
        <>
            <Navbar />

            <main className="mx-auto w-full max-w-7xl p-6">
                <Outlet />
            </main>

            {/* Panel lateral del carrito */}
            <CartDrawer />
        </>
    );
}
