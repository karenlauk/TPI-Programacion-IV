from app.modules.categorias.schemas import ( CategoriaCreate, CategoriaRead, CategoriaUpdate, )
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.categorias.models import Categoria

class CategoriaNoEncontrada(Exception):
    pass

class NombreDuplicado(Exception):
    pass

class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar_categorias(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.get_all_active()

            return [
                CategoriaRead.model_validate(categoria)
                for categoria in categorias
            ]

    def obtener_categoria(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)

            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada.")

            return CategoriaRead.model_validate(categoria)

    def crear_categoria(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            nombre = datos.nombre.strip()
            existente = uow.categorias.get_by_nombre(nombre)

            if existente is not None:
                raise NombreDuplicado(
                    "Ya existe una categoría con ese nombre."
                )

            categoria = Categoria(
                nombre=nombre,
                descripcion=datos.descripcion,
                activo=True,
            )

            categoria = uow.categorias.add(categoria)

            return CategoriaRead.model_validate(categoria)

    def actualizar_categoria(
        self,
        categoria_id: int,
        datos: CategoriaUpdate,
    ) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)

            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada.")

            cambios = datos.model_dump(
                exclude_unset=True,
                exclude_none=True,
            )

            if "nombre" in cambios:
                nombre = cambios["nombre"].strip()
                existente = uow.categorias.get_by_nombre(nombre)

                if existente is not None and existente.id != categoria_id:
                    raise NombreDuplicado(
                        "Ya existe una categoría con ese nombre."
                    )

                cambios["nombre"] = nombre

            categoria.sqlmodel_update(cambios)
            categoria = uow.categorias.add(categoria)

            return CategoriaRead.model_validate(categoria)

    def eliminar_categoria(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)

            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada.")

            # Obtener todos los productos asociados.
            productos = uow.productos.get_by_categoria_id(
                categoria_id
            )

            # Dar de baja la categoría.
            categoria.activo = False
            uow.categorias.add(categoria)

            # Dar de baja todos sus productos asociados.
            for producto in productos:
                producto.activo = False
                uow.productos.add(producto)