"""Adaptador Argon2id del puerto `PasswordHasher` (RNF-SEC-002)."""

from argon2 import PasswordHasher as _Argon2
from argon2.exceptions import InvalidHashError, VerificationError


class Argon2PasswordHasher:
    def __init__(self) -> None:
        self._argon = _Argon2()  # Argon2id con los parámetros recomendados por argon2-cffi

    def hash(self, password: str) -> str:
        return self._argon.hash(password)

    def verify(self, password_hash: str, password: str) -> bool:
        try:
            return self._argon.verify(password_hash, password)
        except (VerificationError, InvalidHashError):
            return False
