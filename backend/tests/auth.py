"""Tokens de acceso para pruebas (mismo formato que `JwtTokenService`)."""

import uuid

import jwt

from smile.config import get_settings


def token_for(role: str, supplier_id: uuid.UUID | None = None) -> str:
    claims = {"sub": str(uuid.uuid4()), "role": role, "typ": "access"}
    if supplier_id:
        claims["supplier_id"] = str(supplier_id)
    return jwt.encode(claims, get_settings().jwt_secret, algorithm="HS256")


def bearer(role: str, supplier_id: uuid.UUID | None = None) -> dict[str, str]:
    return {"Authorization": f"Bearer {token_for(role, supplier_id)}"}
