from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categorias.routers import router as categorias_router
from app.modules.productos.routers import router as productos_router
from app.modules.pedidos.router import router as pedidos_router

# Importación de modelos para registrarlos en SQLModel.metadata antes de ejecutar create_all_tables().
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto, MovimientoStock
from app.modules.pedidos.models import Pedido, DetallePedido

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield

app = FastAPI(
    title="Food Store API",
    description="API REST del sistema de pedidos Food Store.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(usuarios_router, prefix="/api/v1")
app.include_router(categorias_router, prefix="/api/v1")
app.include_router(productos_router, prefix="/api/v1")
app.include_router(pedidos_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"message": "Food Store API funcionando"}