"""Puerto de hashing de contraseñas (RNF-SEC-002)."""

from typing import Protocol


class PasswordHasher(Protocol):
    def hash(self, password: str) -> str: ...

    def verify(self, password_hash: str, password: str) -> bool: ...
