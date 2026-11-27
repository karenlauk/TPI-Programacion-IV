import axios from "axios";

interface ApiValidationError {
    msg?: string;
}

interface ApiErrorResponse {
    detail?: unknown;
}

function isApiValidationError(
    value: unknown
): value is ApiValidationError {
    return (
        typeof value === "object" &&
        value !== null &&
        "msg" in value
    );
}

function isLoginEndpoint(url?: string): boolean {
    return url?.includes("/auth/token") ?? false;
}

export function handleApiError(error: unknown): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const status = error.response?.status;
        const detail = error.response?.data?.detail;

        // Credenciales incorrectas.
        if (status === 401 && isLoginEndpoint(error.config?.url)) {
            return "El nombre de usuario o la contraseña son incorrectos. Verificá tus datos e intentá nuevamente.";
        }

        // Cuenta desactivada.
        if (
            typeof detail === "string" &&
            detail.toLowerCase().includes("cuenta de usuario desactivada")
        ) {
            return "Tu cuenta está desactivada. Contactá al administrador.";
        }

        if (typeof detail === "string") {
            return detail;
        }

        if (Array.isArray(detail)) {
            return detail
                .map((item: unknown) => {
                    if (
                        isApiValidationError(item) &&
                        typeof item.msg === "string"
                    ) {
                        return item.msg;
                    }

                    return "Error de validación";
                })
                .join(", ");
        }

        if (!error.response) {
            return "No se pudo conectar con el servidor. Verificá que esté iniciado.";
        }

        return (
            error.message ||
            "Ocurrió un error al comunicarse con el servidor."
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Ocurrió un error inesperado.";
}