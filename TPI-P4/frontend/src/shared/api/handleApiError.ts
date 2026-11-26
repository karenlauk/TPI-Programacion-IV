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

export function handleApiError(error: unknown): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const detail = error.response?.data?.detail;

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
            return "No se pudo conectar con el servidor.";
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