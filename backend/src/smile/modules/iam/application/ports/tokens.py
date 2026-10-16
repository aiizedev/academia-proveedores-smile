"""Puerto de emisión de tokens (JWT de acceso y refresh opaco)."""

import uuid
from typing import Protocol

from smile.modules.iam.domain.user import User


class TokenService(Protocol):
    access_ttl_seconds: int
    refresh_ttl_days: int

    def issue_access(self, user: User, supplier_id: uuid.UUID | None) -> str: ...

    def new_refresh(self) -> tuple[str, bytes]:
        """Devuelve (token en claro para el cliente, hash para guardar)."""
        ...

    def hash_refresh(self, raw: str) -> bytes: ...
