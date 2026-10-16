"""DTOs HTTP de `suppliers` (Pydantic)."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class ProfileOut(BaseModel):
    person_type: Literal["natural", "juridica"]
    tax_id: str
    tax_dv: str
    legal_name: str
    legal_rep: str | None
    department_code: str
    municipality_code: str
    vereda: str | None
    latitude: Decimal | None
    longitude: Decimal | None
    contact_channel: Literal["whatsapp", "llamada", "correo"]
    main_category: str
    secondary_categories: list[str]


class MySupplierOut(BaseModel):
    id: uuid.UUID
    profile_completed_at: datetime | None
    profile: ProfileOut | None
