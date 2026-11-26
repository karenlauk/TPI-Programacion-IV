import { useMutation, useQuery, useQueryClient, } from "@tanstack/react-query";
import { activarUsuario, desactivarUsuario, listarUsuarios, } from "../api/usuarios";

const USUARIOS_QUERY_KEY = ["usuarios"];

export function useUsuarios() {
    const queryClient = useQueryClient();

    // Consultar usuarios.
    const usuariosQuery = useQuery({
        queryKey: USUARIOS_QUERY_KEY,
        queryFn: listarUsuarios,
    });

    // Activar usuario.
    const activarMutation = useMutation({
        mutationFn: activarUsuario,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: USUARIOS_QUERY_KEY,
            });
        },
    });

    // Desactivar usuario.
    const desactivarMutation = useMutation({
        mutationFn: desactivarUsuario,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: USUARIOS_QUERY_KEY,
            });
        },
    });

    return {
        usuarios: usuariosQuery.data ?? [],

        isLoading: usuariosQuery.isLoading,
        isError: usuariosQuery.isError,
        error: usuariosQuery.error,
        refetch: usuariosQuery.refetch,

        activarUsuario: activarMutation.mutateAsync,
        desactivarUsuario: desactivarMutation.mutateAsync,

        isMutating:
            activarMutation.isPending ||
            desactivarMutation.isPending,
    };
}