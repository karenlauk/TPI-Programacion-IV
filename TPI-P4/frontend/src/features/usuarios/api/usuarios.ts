import { axiosInstance } from "@/shared/api/axiosInstance";
import type { Usuario } from "../types/usuario";

// GET: listar todos los usuarios.
export async function listarUsuarios(): Promise<Usuario[]> {
    const { data } = await axiosInstance.get<Usuario[]>(
        "/admin/usuarios"
    );

    return data;
}

// POST: activar un usuario.
export async function activarUsuario(
    usuarioId: number
): Promise<Usuario> {
    const { data } = await axiosInstance.post<Usuario>(
        `/admin/usuarios/${usuarioId}/activar`
    );

    return data;
}

// POST: desactivar un usuario.
export async function desactivarUsuario(
    usuarioId: number
): Promise<Usuario> {
    const { data } = await axiosInstance.post<Usuario>(
        `/admin/usuarios/${usuarioId}/desactivar`
    );

    return data;
}