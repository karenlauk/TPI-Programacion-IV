export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
}

// Datos enviados al backend al crear o actualizar
export type CategoriaFormData = Pick<
    Categoria,
    "nombre" | "descripcion"
>;