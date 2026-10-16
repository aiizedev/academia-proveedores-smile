"""JWT de acceso (HS256) y refresh opaco con hash SHA-256 (RF-IAM-002, RNF-SEC-003)."""

import hashlib
import secrets
from datetime import UTC, datetime, timedelta

import jwt

from smile.modules.iam.domain.user import User


class JwtTokenService:
    def __init__(self, secret: str, access_ttl_min: int, refresh_ttl_days: int) -> None:
        self._secret = secret
        self.access_ttl_seconds = access_ttl_min * 60
        self.refresh_ttl_days = refresh_ttl_days

    def issue_access(self, user: User) -> str:
        now = datetime.now(UTC)
        claims = {
            "sub": str(user.id),
            "role": user.role.value,
            "typ": "access",
            "iat": now,
            "exp": now + timedelta(seconds=self.access_ttl_seconds),
        }
        # supplier_id se agrega cuando `suppliers` exista (HU-PRV/HU-SUP).
        return jwt.encode(claims, self._secret, algorithm="HS256")

    def new_refresh(self) -> tuple[str, bytes]:
        raw = secrets.token_urlsafe(32)
        return raw, self.hash_refresh(raw)

    def hash_refresh(self, raw: str) -> bytes:
        return hashlib.sha256(raw.encode()).digest()
