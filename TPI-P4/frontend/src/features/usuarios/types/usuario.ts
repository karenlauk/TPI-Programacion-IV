export type RolUsuario = "user" | "admin";

export interface Usuario {
    id: number;
    username: string;
    full_name: string;
    email: string;
    role: RolUsuario;
    disabled: boolean;
    created_at: string;
}