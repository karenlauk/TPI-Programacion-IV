from sqlmodel import Session
from app.core.database import engine

class UnitOfWork:
    """Administra una transacción y su sesión."""

    def __init__(self) -> None:
        self.session: Session | None = None

    def __enter__(self) -> "UnitOfWork":
        self.session = Session(engine, expire_on_commit=False)
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> bool:
        if self.session is None:
            return False

        try:
            if exc_type is None:
                try:
                    self.session.commit()
                except Exception:
                    self.session.rollback()
                    raise
            else:
                self.session.rollback()
        finally:
            self.session.close()
            self.session = None

        return False