from sqlmodel import Session, select
from app.core.database import engine, create_all_tables
from app.core.config import settings
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido, DetallePedido

CATEGORIAS_INICIALES = [
    {
        "nombre": "Pizzas",
        "descripcion": "Categoría Pizzas",
    },
    {
        "nombre": "Hamburguesas",
        "descripcion": "Categoría Hamburguesas",
    },
    {
        "nombre": "Bebidas",
        "descripcion": "Categoría Bebidas",
    },
]

PRODUCTOS_INICIALES = [
    {
        "nombre": "Pizza muzzarella",
        "precio_base": 8500,
        "stock": 15,
        "categoria": "Pizzas",
        "imagen_url": "/images/products/pizza-muzzarella.png",
    },
    {
        "nombre": "Pizza napolitana",
        "precio_base": 9200,
        "stock": 12,
        "categoria": "Pizzas",
        "imagen_url": "/images/products/pizza-napolitana.png",
    },
    {
        "nombre": "Pizza fugazzeta",
        "precio_base": 9800,
        "stock": 8,
        "categoria": "Pizzas",
        "imagen_url": "/images/products/pizza-fugazzeta.png",
    },
    {
        "nombre": "Hamburguesa clásica",
        "precio_base": 7500,
        "stock": 20,
        "categoria": "Hamburguesas",
        "imagen_url": "/images/products/hamburguesa-clasica.png",
    },
    {
        "nombre": "Hamburguesa doble",
        "precio_base": 9900,
        "stock": 10,
        "categoria": "Hamburguesas",
        "imagen_url": "/images/products/hamburguesa-doble.png",
    },
    {
        "nombre": "Hamburguesa completa",
        "precio_base": 10500,
        "stock": 9,
        "categoria": "Hamburguesas",
        "imagen_url": "/images/products/hamburguesa-completa.png",
    },
    {
        "nombre": "Gaseosa cola",
        "precio_base": 2500,
        "stock": 30,
        "categoria": "Bebidas",
        "imagen_url": "/images/products/gaseosa-cola.png",
    },
    {
        "nombre": "Agua mineral",
        "precio_base": 1800,
        "stock": 25,
        "categoria": "Bebidas",
        "imagen_url": "/images/products/agua-mineral.png",
    },
]

def crear_administrador(session: Session) -> None:
    """Garantiza la existencia de un administrador inicial activo."""

    admin = session.exec(
        select(Usuario).where(
            Usuario.username == settings.ADMIN_USERNAME
        )
    ).first()

    if admin is None:
        email_existente = session.exec(
            select(Usuario).where(
                Usuario.email == settings.ADMIN_EMAIL
            )
        ).first()

        if email_existente is not None:
            raise ValueError(
                "No se puede crear el administrador: "
                "el email configurado ya pertenece a otro usuario."
            )

        admin = Usuario(
            username=settings.ADMIN_USERNAME,
            full_name=(
                f"{settings.ADMIN_NOMBRE} "
                f"{settings.ADMIN_APELLIDO}"
            ).strip(),
            email=settings.ADMIN_EMAIL,
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
            role="admin",
            disabled=False,
        )

        session.add(admin)
        session.flush()

    else:
        # Se garantiza que el usuario configurado siga siendo administrador.
        # No se modifican su contraseña ni sus datos personales.
        admin.role = "admin"
        admin.disabled = False
        session.add(admin)

def crear_categorias(session: Session) -> dict[str, Categoria]:
    """Crea las categorías iniciales que todavía no existen.

    Conserva el estado de las categorías existentes.
    No reactiva categorías dadas de baja lógicamente.
    """

    categorias: dict[str, Categoria] = {}

    for datos in CATEGORIAS_INICIALES:
        nombre = datos["nombre"]

        categoria = session.exec(
            select(Categoria).where(
                Categoria.nombre == nombre
            )
        ).first()

        if categoria is None:
            categoria = Categoria(
                nombre=nombre,
                descripcion=datos["descripcion"],
                activo=True,
            )

            session.add(categoria)
            session.flush()

        # Si ya existe, no se modifica su estado ni sus datos.
        categorias[nombre] = categoria

    return categorias

def crear_productos(
    session: Session,
    categorias: dict[str, Categoria],
) -> None:
    """Crea los productos iniciales y actualiza imágenes placeholder.

    No reactiva productos dados de baja.
    No modifica precios, stock, categorías ni datos personalizados.
    Solo reemplaza imágenes vacías o provenientes de placehold.co.
    No crea productos para categorías inactivas.
    """

    for datos in PRODUCTOS_INICIALES:
        nombre = datos["nombre"]
        categoria = categorias[datos["categoria"]]

        # Si la categoría está inactiva, no se incorporan productos.
        if not categoria.activo:
            continue

        producto = session.exec(
            select(Producto).where(
                Producto.nombre == nombre
            )
        ).first()

        if producto is not None:
            imagen_actual = (producto.imagen_url or "").strip()

            # Actualiza solamente imágenes vacías o placeholders.
            # Conserva las imágenes personalizadas por el administrador.
            if (
                not imagen_actual
                or "placehold.co" in imagen_actual.lower()
            ):
                producto.imagen_url = datos["imagen_url"]
                session.add(producto)

            # No se modifican otros datos del producto existente.
            continue

        producto = Producto(
            categoria_id=categoria.id,
            nombre=nombre,
            descripcion=nombre,
            precio_base=datos["precio_base"],
            imagen_url=datos["imagen_url"],
            stock=datos["stock"],
            disponible=True,
            activo=True,
        )

        session.add(producto)

def seed() -> None:
    """Inicializa los datos básicos de FoodStore de forma idempotente."""

    create_all_tables()

    with Session(engine) as session:
        try:
            crear_administrador(session)

            categorias = crear_categorias(session)

            crear_productos(session, categorias)

            session.commit()

            print("Seed ejecutado correctamente.")
            print("Administrador inicial verificado.")
            print("Categorías iniciales verificadas.")
            print("Productos iniciales verificados.")
            print("Imágenes iniciales verificadas.")

        except Exception:
            session.rollback()
            raise

if __name__ == "__main__":
    seed()