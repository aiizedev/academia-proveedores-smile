"""Repositorios SQLAlchemy de `iam`."""

import uuid
from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from smile.modules.iam.domain.session import RefreshToken
from smile.modules.iam.domain.user import User
from smile.modules.iam.infrastructure.models import RefreshTokenModel, UserModel
from smile.shared.application.ports import Role


def _to_user(m: UserModel) -> User:
    return User(
        id=m.id,
        full_name=m.full_name,
        role=Role(m.role),
        password_hash=m.password_hash,
        phone=m.phone,
        email=m.email,
        is_active=m.is_active,
        failed_attempts=m.failed_attempts,
        locked_until=m.locked_until,
    )


class SqlUserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def _one(self, *where: object) -> User | None:
        row = await self._session.scalar(select(UserModel).where(*where))  # type: ignore[arg-type]
        return _to_user(row) if row else None

    async def get(self, user_id: uuid.UUID) -> User | None:
        return await self._one(UserModel.id == user_id)

    async def get_by_phone(self, phone: str) -> User | None:
        return await self._one(UserModel.phone == phone)

    async def get_by_email(self, email: str) -> User | None:
        return await self._one(UserModel.email == email)

    async def save_login_state(self, user: User) -> None:
        await self._session.execute(
            update(UserModel)
            .where(UserModel.id == user.id)
            .values(failed_attempts=user.failed_attempts, locked_until=user.locked_until)
        )


class SqlRefreshTokenRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, token: RefreshToken) -> None:
        self._session.add(
            RefreshTokenModel(
                id=token.id,
                user_id=token.user_id,
                family_id=token.family_id,
                token_hash=token.token_hash,
                issued_at=token.issued_at,
                expires_at=token.expires_at,
            )
        )

    async def get_by_hash(self, token_hash: bytes) -> RefreshToken | None:
        m = await self._session.scalar(
            select(RefreshTokenModel).where(RefreshTokenModel.token_hash == token_hash)
        )
        if m is None:
            return None
        return RefreshToken(
            id=m.id,
            user_id=m.user_id,
            family_id=m.family_id,
            token_hash=m.token_hash,
            issued_at=m.issued_at,
            expires_at=m.expires_at,
            revoked_at=m.revoked_at,
            replaced_by=m.replaced_by,
        )

    async def mark_replaced(self, token: RefreshToken, by: uuid.UUID, at: datetime) -> None:
        await self._session.flush()
        await self._session.execute(
            update(RefreshTokenModel)
            .where(RefreshTokenModel.id == token.id)
            .values(replaced_by=by, revoked_at=at)
        )

    async def revoke_family(self, family_id: uuid.UUID, at: datetime) -> None:
        await self._session.execute(
            update(RefreshTokenModel)
            .where(RefreshTokenModel.family_id == family_id, RefreshTokenModel.revoked_at.is_(None))
            .values(revoked_at=at)
        )
