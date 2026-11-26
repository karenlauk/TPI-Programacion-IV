import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/axiosInstance";
import { useNotificationStore } from "@/store/notificationStore";

export interface RegistroData {
    username: string;
    full_name: string;
    email: string;
    password: string;
}

async function registrarUsuario(data: RegistroData): Promise<void> {
    await axiosInstance.post("/auth/register", data);
}

export function useRegister() {
    const showNotification = useNotificationStore(
        (state) => state.showNotification
    );

    const mutation = useMutation({
        mutationFn: registrarUsuario,
        onSuccess: () => {
            showNotification("Registro realizado correctamente");
        },
    });

    return {
        register: mutation.mutateAsync,
        isPending: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        reset: mutation.reset,
    };
}