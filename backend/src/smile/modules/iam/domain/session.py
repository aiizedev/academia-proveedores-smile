"""Refresh token rotativo con detección de reutilización (RF-IAM-002, RNF-SEC-003)."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime


@dataclass(kw_only=True)
class RefreshToken:
    """Se guarda solo el hash. Todos los tokens de una sesión comparten `family_id`."""

    id: uuid.UUID
    user_id: uuid.UUID
    family_id: uuid.UUID
    token_hash: bytes
    issued_at: datetime
    expires_at: datetime
    revoked_at: datetime | None = None
    replaced_by: uuid.UUID | None = None

    def is_expired(self, now: datetime) -> bool:
        return self.expires_at <= now

    @property
    def was_used(self) -> bool:
        """Ya rotado o revocado: presentarlo otra vez es una reutilización."""
        return self.revoked_at is not None or self.replaced_by is not None
