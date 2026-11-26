import { useState } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
    type ColumnDef,
    type SortingState,
    type Row,
} from "@tanstack/react-table";
import type { Categoria } from "../types/categoria";

type CategoriaListProps = {
    categorias: Categoria[];
    onEdit: (categoria: Categoria) => void;
    onDelete: (id: number) => void;
    isAdmin: boolean;
};

export function CategoriaList({
    categorias,
    onEdit,
    onDelete,
    isAdmin,
}: CategoriaListProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const columns: ColumnDef<Categoria>[] = [
        {
            accessorKey: "id",
            header: "Número",
        },
        {
            accessorKey: "nombre",
            header: "Nombre",
        },
        {
            accessorKey: "descripcion",
            header: "Descripción",
        },
        ...(isAdmin
            ? [
                {
                    id: "acciones",
                    header: "Acciones",
                    enableSorting: false,
                    cell: ({ row }: { row: Row<Categoria> }) => (
                        <div className="flex items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => onEdit(row.original)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Editar
                            </button>

                            <button
                                type="button"
                                onClick={() => onDelete(row.original.id)}
                                className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline dark:text-red-400 dark:hover:text-red-300"
                            >
                                Eliminar
                            </button>
                        </div>
                    ),
                } satisfies ColumnDef<Categoria>,
            ]
            : []),
    ];

    const table = useReactTable({
        data: categorias,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
        globalFilterFn: (row, columnId, filterValue) => {
            if (columnId !== "nombre") return false;

            const valor = row.getValue(columnId);

            return String(valor ?? "")
                .toLowerCase()
                .includes(String(filterValue).toLowerCase());
        },
    });

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 p-4 dark:border-slate-700">
                <label
                    htmlFor="buscar-categoria"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                    Buscar categoría por nombre
                </label>

                <input
                    id="buscar-categoria"
                    type="text"
                    placeholder="Escribí el nombre de una categoría..."
                    value={globalFilter}
                    onChange={(event) => {
                        setGlobalFilter(event.target.value);
                        table.setPageIndex(0);
                    }}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-175 table-fixed border-collapse text-left">
                    <colgroup>
                        <col style={{ width: isAdmin ? "10%" : "12%" }} />
                        <col style={{ width: isAdmin ? "25%" : "30%" }} />
                        <col style={{ width: isAdmin ? "35%" : "58%" }} />
                        {isAdmin && <col style={{ width: "30%" }} />}
                    </colgroup>

                    <thead className="border-b border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        scope="col"
                                        className={`px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 ${
                                            header.id === "acciones"
                                                ? "text-center"
                                                : "text-left"
                                        }`}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <button
                                                type="button"
                                                disabled={!header.column.getCanSort()}
                                                onClick={header.column.getToggleSortingHandler()}
                                                className="inline-flex items-center gap-2 disabled:cursor-default"
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}

                                                {{
                                                    asc: "↑",
                                                    desc: "↓",
                                                }[
                                                    header.column.getIsSorted() as string
                                                ] ?? ""}
                                            </button>
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
                                    className="border-b border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className={`px-5 py-4 text-sm text-slate-600 dark:text-slate-300 ${
                                                cell.column.id === "acciones"
                                                    ? "text-center"
                                                    : "text-left"
                                            }`}
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
                                    colSpan={columns.length}
                                    className="px-5 py-12 text-center"
                                >
                                    {globalFilter ? (
                                        <>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                No se encontraron categorías.
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                Probá con otro nombre.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                No hay categorías registradas.
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                {isAdmin
                                                    ? "Utilizá el botón Nueva categoría para comenzar."
                                                    : "Todavía no hay categorías disponibles para consultar."}
                                            </p>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                    Página {table.getState().pagination.pageIndex + 1} de{" "}
                    {Math.max(table.getPageCount(), 1)}
                </span>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        Anterior
                    </button>

                    <button
                        type="button"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
}