import axios, { type AxiosError } from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (!configuredApiUrl) {
    throw new Error(
        "Falta configurar VITE_API_URL. Creá frontend/.env a partir de frontend/.env.example."
    );
}

const baseURL = configuredApiUrl.replace(/\/+$/, "");

export const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

function isDisabledAccountError(detail: unknown): boolean {
    return (
        typeof detail === "string" &&
        detail.toLowerCase().includes("cuenta de usuario desactivada")
    );
}

function isAuthenticationEndpoint(url: string): boolean {
    return (
        url.includes("/auth/token") ||
        url.includes("/auth/me")
    );
}

axiosInstance.interceptors.response.use(
    (response) => response,

    async (error: AxiosError<{ detail?: unknown }>) => {
        const status = error.response?.status;
        const url = error.config?.url ?? "";
        const detail = error.response?.data?.detail;

        const isUnauthorized = status === 401;
        const isDisabledAccount =
            status === 400 && isDisabledAccountError(detail);

        // Una sesión vencida o una cuenta desactivada
        // invalida el usuario almacenado en el frontend.
        if (
            (isUnauthorized && !isAuthenticationEndpoint(url)) ||
            isDisabledAccount
        ) {
            const { useAuthStore } = await import(
                "@/features/auth/store/authStore"
            );

            useAuthStore.setState({
                user: null,
                checking: false,
            });
        }

        // El backend rechazó la operación por permisos.
        if (status === 403) {
            const { useNotificationStore } = await import(
                "@/store/notificationStore"
            );

            useNotificationStore
                .getState()
                .showNotification(
                    "No tenés permisos para realizar esta acción."
                );
        }

        // No hubo respuesta: servidor apagado o problema de conexión.
        if (!error.response) {
            const { useNotificationStore } = await import(
                "@/store/notificationStore"
            );

            useNotificationStore
                .getState()
                .showNotification(
                    "No se pudo conectar con el servidor. Verificá que el backend esté iniciado."
                );
        }

        return Promise.reject(error);
    }
);