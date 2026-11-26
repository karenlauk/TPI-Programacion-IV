export interface CategoriaProducto {
    id: number;
    nombre: string;
    descripcion: string;
    activo?: boolean;
}

export interface Producto {
    id: number;
    categoria_id: number;
    nombre: string;
    descripcion: string;
    precio_base: number;
    imagen_url: string;
    stock: number;
    disponible: boolean;
    activo: boolean;
    categoria?: CategoriaProducto;
}

export interface ProductoFormData {
    categoria_id: number;
    nombre: string;
    descripcion: string;
    precio_base: number;
    imagen_url: string;
    stock: number;
    disponible: boolean;
}

export interface ProductoStockUpdate {
    stock: number;
    disponible: boolean;
}