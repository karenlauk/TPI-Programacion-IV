import { create } from "zustand";
import { createJSONStorage, persist, } from "zustand/middleware";
import { axiosInstance } from "@/shared/api/axiosInstance";
import type { UsuarioAuth, } from "../types/auth.types";

interface AuthState {
    user: UsuarioAuth | null;
    checking: boolean;

    login: (
        username: string,
        password: string
    ) => Promise<UsuarioAuth>;

    logout: () => Promise<void>;

    checkAuth: () => Promise<void>;
}

function isUsuarioAuth(value: unknown): value is UsuarioAuth {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const user = value as Record<string, unknown>;

    return (
        typeof user.id === "number" &&
        typeof user.username === "string" &&
        typeof user.full_name === "string" &&
        typeof user.email === "string" &&
        (user.role === "user" || user.role === "admin") &&
        typeof user.disabled === "boolean" &&
        typeof user.created_at === "string"
    );
}

// Evita ejecutar varias consultas /auth/me simultáneas.
let checkAuthPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            checking: true,

            // Login mediante formulario OAuth2.
            login: async (username, password) => {
                set({
                    checking: true,
                    user: null,
                });

                try {
                    const formData = new URLSearchParams();

                    formData.set("username", username.trim());
                    formData.set("password", password);

                    await axiosInstance.post(
                        "/auth/token",
                        formData,
                        {
                            headers: {
                                "Content-Type":
                                    "application/x-www-form-urlencoded",
                            },
                        }
                    );

                    // El backend establece la cookie HttpOnly.
                    // El perfil se obtiene mediante /auth/me.
                    const response = await axiosInstance.get<unknown>(
                        "/auth/me"
                    );

                    if (
                        !isUsuarioAuth(response.data) ||
                        response.data.disabled
                    ) {
                        throw new Error(
                            "El servidor devolvió un perfil de usuario inválido."
                        );
                    }

                    const user = response.data;

                    set({
                        user,
                    });

                    return user;
                } catch (error) {
                    set({
                        user: null,
                    });

                    throw error;
                } finally {
                    set({
                        checking: false,
                    });
                }
            },

            // Cierre de sesión.
            logout: async () => {
                try {
                    await axiosInstance.post("/auth/logout");
                } finally {
                    // Aunque falle la comunicación con el servidor,
                    // se elimina la sesión local.
                    set({
                        user: null,
                        checking: false,
                    });
                }
            },

            // Comprueba la cookie al iniciar la aplicación.
            checkAuth: async () => {
                if (checkAuthPromise) {
                    return checkAuthPromise;
                }

                set({
                    checking: true,
                });

                checkAuthPromise = (async () => {
                    try {
                        const response = await axiosInstance.get<unknown>(
                            "/auth/me"
                        );

                        if (
                            !isUsuarioAuth(response.data) ||
                            response.data.disabled
                        ) {
                            set({
                                user: null,
                            });

                            return;
                        }

                        set({
                            user: response.data,
                        });
                    } catch {
                        // Sin cookie válida, no existe sesión.
                        set({
                            user: null,
                        });
                    } finally {
                        set({
                            checking: false,
                        });
                    }
                })().finally(() => {
                    checkAuthPromise = null;
                });

                return checkAuthPromise;
            },
        }),
        {
            name: "foodstore-auth",
            storage: createJSONStorage(() => localStorage),

            // Se persiste únicamente el perfil.
            // El JWT nunca se almacena en localStorage.
            partialize: (state) => ({
                user: state.user,
            }),
        }
    )
);