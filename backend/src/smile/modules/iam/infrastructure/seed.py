"""Usuarios precreados para la demo (MODO_POC §3.2)."""

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from smile.modules.iam.domain.user import User
from smile.modules.iam.infrastructure.models import UserModel
from smile.modules.iam.infrastructure.passwords import Argon2PasswordHasher
from smile.shared.application.ports import Role
from smile.shared.infrastructure.seed import DEMO_PASSWORD, demo_id, demo_random

GENERATED_SUPPLIERS = 30

_FIRST = (
    "María",
    "José",
    "Luz Marina",
    "Carlos",
    "Ana Lucía",
    "Jorge",
    "Blanca",
    "Luis",
    "Rosa",
    "Pedro",
    "Gloria",
    "Fabio",
    "Martha",
    "Hernán",
    "Diana",
    "Óscar",
)
_LAST = (
    "Rodríguez",
    "Gómez",
    "Martínez",
    "Rojas",
    "Pérez",
    "Castro",
    "Moreno",
    "Vargas",
    "Suárez",
    "Cárdenas",
    "Ramírez",
    "Pinzón",
    "Torres",
    "Chaparro",
    "Beltrán",
    "Ávila",
)


def demo_users(password_hash: str) -> list[User]:
    """Usuarios fijos + `proveedor01…30` generados de forma determinista."""
    fixed = [
        ("admin", "Administración Smile", Role.ADMIN, None),
        ("reviewer", "Compras y Calidad Smile", Role.REVIEWER, None),
        ("proveedor", "María Fernanda Rojas", Role.PROVEEDOR, "3001234567"),
        ("nuevo", "Proveedor Nuevo", Role.PROVEEDOR, None),
    ]
    users = [
        User(
            id=demo_id(f"iam.user:{key}"),
            full_name=name,
            role=role,
            password_hash=password_hash,
            phone=phone,
            email=f"{key}@smile.test",
        )
        for key, name, role, phone in fixed
    ]
    rng = demo_random("iam")
    for n in range(1, GENERATED_SUPPLIERS + 1):
        key = f"proveedor{n:02d}"
        users.append(
            User(
                id=demo_id(f"iam.user:{key}"),
                full_name=f"{rng.choice(_FIRST)} {rng.choice(_LAST)} {rng.choice(_LAST)}",
                role=Role.PROVEEDOR,
                password_hash=password_hash,
                phone=f"31{n:08d}",
                email=f"{key}@smile.test",
            )
        )
    return users


async def seed_demo(session: AsyncSession) -> None:
    password_hash = Argon2PasswordHasher().hash(DEMO_PASSWORD)
    rows = [
        {
            "id": u.id,
            "full_name": u.full_name,
            "phone": u.phone,
            "email": u.email,
            "password_hash": u.password_hash,
            "role": u.role.value,
            "is_active": u.is_active,
        }
        for u in demo_users(password_hash)
    ]
    stmt = insert(UserModel).values(rows)
    # Re-ejecutar restaura los datos de demo (incluida la contraseña) sin duplicar.
    stmt = stmt.on_conflict_do_update(
        index_elements=[UserModel.id],
        set_={
            "full_name": stmt.excluded.full_name,
            "phone": stmt.excluded.phone,
            "email": stmt.excluded.email,
            "password_hash": stmt.excluded.password_hash,
            "role": stmt.excluded.role,
            "is_active": stmt.excluded.is_active,
            "failed_attempts": 0,
            "locked_until": None,
            "updated_at": func.now(),
        },
    )
    await session.execute(stmt)
