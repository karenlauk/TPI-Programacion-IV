import { useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, } from "@tanstack/react-table";
import { useAuth } from "@/features/auth";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import { useUsuarios } from "../hooks/useUsuarios";
import type { Usuario } from "../types/usuario";

export function AdminUsuariosPage() {
    const { user: usuarioActual } = useAuth();

    const showNotification = useNotificationStore(
        (state) => state.showNotification
    );

    const {
        usuarios,
        isLoading,
        isError,
        error,
        refetch,
        activarUsuario,
        desactivarUsuario,
        isMutating,
    } = useUsuarios();

    const [mutationError, setMutationError] = useState("");

    async function handleActivar(usuario: Usuario) {
        setMutationError("");

        try {
            await activarUsuario(usuario.id);

            showNotification(
                `El usuario ${usuario.username} fue activado correctamente.`
            );
        } catch (error) {
            setMutationError(handleApiError(error));
        }
    }

    async function handleDesactivar(usuario: Usuario) {
        const confirmado = window.confirm(
            `¿Querés desactivar la cuenta de ${usuario.username}?`
        );

        if (!confirmado) {
            return;
        }

        setMutationError("");

        try {
            await desactivarUsuario(usuario.id);

            showNotification(
                `El usuario ${usuario.username} fue desactivado correctamente.`
            );
        } catch (error) {
            setMutationError(handleApiError(error));
        }
    }

    const columns = useMemo<ColumnDef<Usuario>[]>(
        () => [
            {
                accessorKey: "username",
                header: "Username",
                cell: ({ row }) => (
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                        {row.original.username}
                    </span>
                ),
            },
            {
                accessorKey: "full_name",
                header: "Nombre",
            },
            {
                accessorKey: "email",
                header: "Email",
            },
            {
                accessorKey: "role",
                header: "Rol",
                cell: ({ row }) => {
                    const esAdmin = row.original.role === "admin";

                    return (
                        <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                esAdmin
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                            }`}
                        >
                            {esAdmin ? "Administrador" : "Cliente"}
                        </span>
                    );
                },
            },
            {
                accessorKey: "disabled",
                header: "Estado",
                cell: ({ row }) => {
                    const estaActivo = !row.original.disabled;

                    return (
                        <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                estaActivo
                                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                            }`}
                        >
                            {estaActivo ? "Activo" : "Desactivado"}
                        </span>
                    );
                },
            },
            {
                id: "acciones",
                header: "Acciones",
                enableSorting: false,
                cell: ({ row }) => {
                    const usuario = row.original;

                    const esUsuarioActual =
                        usuario.id === usuarioActual?.id;

                    if (esUsuarioActual && !usuario.disabled) {
                        return (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Cuenta actual
                            </span>
                        );
                    }

                    if (usuario.disabled) {
                        return (
                            <button
                                type="button"
                                disabled={isMutating}
                                onClick={() => void handleActivar(usuario)}
                                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Activar
                            </button>
                        );
                    }

                    return (
                        <button
                            type="button"
                            disabled={isMutating || esUsuarioActual}
                            onClick={() =>
                                void handleDesactivar(usuario)
                            }
                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Desactivar
                        </button>
                    );
                },
            },
        ],
        [
            usuarioActual?.id,
            isMutating,
        ]
    );

    const table = useReactTable({
        data: usuarios,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) {
        return (
            <section className="space-y-4">
                <h1 className="text-2xl font-bold">
                    Administración de usuarios
                </h1>

                <div
                    role="status"
                    className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                    Cargando usuarios...
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="space-y-4">
                <h1 className="text-2xl font-bold">
                    Administración de usuarios
                </h1>

                <div
                    role="alert"
                    className="rounded-md bg-red-100 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                >
                    {handleApiError(error)}
                </div>

                <button
                    type="button"
                    onClick={() => void refetch()}
                    className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                >
                    Reintentar
                </button>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Administración de usuarios
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Consultá las cuentas registradas y administrá
                    su estado de acceso.
                </p>
            </header>

            {mutationError && (
                <div
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                >
                    {mutationError}
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        scope="col"
                                        className="px-4 py-3 font-semibold"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="px-4 py-3 text-slate-600 dark:text-slate-300"
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {usuarios.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-10 text-center text-slate-500 dark:text-slate-400"
                                >
                                    No hay usuarios registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>
                    Total de usuarios: {usuarios.length}
                </span>

                <span>
                    Activos:{" "}
                    {usuarios.filter((usuario) => !usuario.disabled).length}
                    {" · "}
                    Desactivados:{" "}
                    {usuarios.filter((usuario) => usuario.disabled).length}
                </span>
            </div>
        </section>
    );
}