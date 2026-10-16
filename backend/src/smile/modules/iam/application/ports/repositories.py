"""Puertos de persistencia de `iam`."""

import uuid
from datetime import datetime
from typing import Protocol

from smile.modules.iam.domain.session import RefreshToken
from smile.modules.iam.domain.user import User


class UserRepository(Protocol):
    async def get(self, user_id: uuid.UUID) -> User | None: ...

    async def get_by_phone(self, phone: str) -> User | None: ...

    async def get_by_email(self, email: str) -> User | None: ...

    async def save_login_state(self, user: User) -> None: ...


class RefreshTokenRepository(Protocol):
    async def add(self, token: RefreshToken) -> None: ...

    async def get_by_hash(self, token_hash: bytes) -> RefreshToken | None: ...

    async def mark_replaced(self, token: RefreshToken, by: uuid.UUID, at: datetime) -> None: ...

    async def revoke_family(self, family_id: uuid.UUID, at: datetime) -> None: ...
