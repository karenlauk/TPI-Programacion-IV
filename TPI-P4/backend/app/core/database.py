from collections.abc import Generator
from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, SQLModel, create_engine
from app.core.config import settings

_connect_args = (
    {"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=_connect_args,
)

session_factory = sessionmaker(
    bind=engine,
    class_=Session,
    expire_on_commit=False,
)

def get_session() -> Generator[Session, None, None]:
    """Provee una sesión de base de datos por petición."""
    with session_factory() as session:
        yield session

def create_all_tables() -> None:
    """Crea las tablas registradas en SQLModel.metadata."""
    SQLModel.metadata.create_all(engine)