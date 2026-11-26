import { useMemo, useState } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable, } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { Producto } from "../types/producto";

interface ProductoListProps {
    productos: Producto[];
    onEdit: (producto: Producto) => void;
    onUpdateStock: (producto: Producto) => void;
    onDelete: (id: number) => void;
    isAdmin: boolean;
}

export function ProductoList({
    productos,
    onEdit,
    onUpdateStock,
    onDelete,
    isAdmin,
}: ProductoListProps) {
    const [busqueda, setBusqueda] = useState("");

    const formatearPrecio = (precio: number) =>
        new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
        }).format(precio);

    const columns = useMemo<ColumnDef<Producto>[]>(
        () => [
            {
                accessorKey: "id",
                header: "Número",
                cell: ({ row }) => row.original.id,
            },
            {
                accessorKey: "nombre",
                header: "Nombre",
                cell: ({ row }) => (
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                        {row.original.nombre}
                    </span>
                ),
            },
            {
                id: "categoria",
                header: "Categoría",
                accessorFn: (row) =>
                    row.categoria?.nombre ??
                    `Categoría #${row.categoria_id}`,
            },
            {
                accessorKey: "precio_base",
                header: "Precio",
                cell: ({ row }) =>
                    formatearPrecio(row.original.precio_base),
            },
            {
                accessorKey: "stock",
                header: "Stock",
                cell: ({ row }) => (
                    <span
                        className={
                            row.original.stock === 0
                                ? "font-semibold text-red-600 dark:text-red-400"
                                : "font-medium text-slate-700 dark:text-slate-200"
                        }
                    >
                        {row.original.stock}
                    </span>
                ),
            },
            {
                accessorKey: "disponible",
                header: "Disponible",
                cell: ({ row }) => (
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            row.original.disponible
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                    >
                        {row.original.disponible ? "Sí" : "No"}
                    </span>
                ),
            },
            ...(isAdmin
                ? [
                    {
                        id: "acciones",
                        header: "Acciones",
                        cell: ({ row }) => (
                            <div className="flex flex-wrap items-center justify-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => onEdit(row.original)}
                                    className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
                                >
                                    Editar
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onUpdateStock(row.original)}
                                    className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                                >
                                    Actualizar stock
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onDelete(row.original.id)}
                                    className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ),
                    } satisfies ColumnDef<Producto>,
                ]
                : []),
        ],
        [isAdmin, onEdit, onUpdateStock, onDelete]
    );

    const table = useReactTable({
        data: productos,
        columns,
        state: {
            globalFilter: busqueda,
        },
        onGlobalFilterChange: setBusqueda,
        globalFilterFn: (row, _columnId, filterValue) =>
            row.original.nombre
                .toLowerCase()
                .includes(String(filterValue).trim().toLowerCase()),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageIndex: 0,
                pageSize: 10,
            },
        },
    });

    const productosFiltrados = table.getFilteredRowModel().rows.length;

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 p-4 dark:border-slate-700">
                <label
                    htmlFor="buscar-producto"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                    Buscar producto por nombre
                </label>

                <input
                    id="buscar-producto"
                    type="search"
                    placeholder="Escribí el nombre de un producto..."
                    value={busqueda}
                    onChange={(event) => {
                        setBusqueda(event.target.value);
                        table.setPageIndex(0);
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-850px text-left">
                    <thead className="border-b border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/60"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={table.getVisibleLeafColumns().length}
                                    className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                                >
                                    {busqueda
                                        ? "No se encontraron productos con ese nombre."
                                        : "No hay productos registrados."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {productosFiltrados} producto(s) encontrados
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <label
                        htmlFor="productos-por-pagina"
                        className="text-sm text-slate-600 dark:text-slate-300"
                    >
                        Mostrar:
                    </label>

                    <select
                        id="productos-por-pagina"
                        value={table.getState().pagination.pageSize}
                        onChange={(event) =>
                            table.setPageSize(Number(event.target.value))
                        }
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    >
                        {[5, 10, 20, 50].map((cantidad) => (
                            <option key={cantidad} value={cantidad}>
                                {cantidad}
                            </option>
                        ))}
                    </select>

                    <span className="text-sm text-slate-600 dark:text-slate-300">
                        Página {table.getState().pagination.pageIndex + 1} de{" "}
                        {Math.max(table.getPageCount(), 1)}
                    </span>

                    <button
                        type="button"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        Anterior
                    </button>

                    <button
                        type="button"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
}