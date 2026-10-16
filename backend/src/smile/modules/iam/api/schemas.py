"""DTOs HTTP de `iam` (Pydantic)."""

import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class LoginIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    identifier: str = Field(min_length=3, max_length=254, description="Celular o correo")
    password: str = Field(min_length=1, max_length=128)


class RefreshIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    refresh_token: str = Field(min_length=16, max_length=128)


class MeOut(BaseModel):
    id: uuid.UUID
    full_name: str
    role: Literal["PROVEEDOR", "REVIEWER", "ADMIN"]
    phone: str | None
    email: str | None


class SessionOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: MeOut
