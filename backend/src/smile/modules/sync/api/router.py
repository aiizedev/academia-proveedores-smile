"""Router FastAPI de `sync` (montado bajo /api/v1): pull y push (HU-SYN-02)."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from smile.modules.iam.public import Permission, require
from smile.modules.sync.api.schemas import PullOut, PushIn, PushOut
from smile.modules.sync.application.commands.push import Push, PushCommand
from smile.modules.sync.application.ports.tables import TableChanges
from smile.modules.sync.application.queries.pull import Pull
from smile.shared.application.ports import CurrentUser

router = APIRouter(prefix="/sync", tags=["sync"])
Supplier = Annotated[CurrentUser, Depends(require(Permission.SUPPLIER_SELF_SERVICE))]


def get_push() -> Push:
    """Puntos de inyección; `module.py` los reemplaza por la implementación concreta."""
    raise NotImplementedError("sync no está cableado: falta module.dependency_overrides")


def get_pull() -> Pull:
    raise NotImplementedError("sync no está cableado: falta module.dependency_overrides")


@router.post("/push", response_model=PushOut)
async def push(
    body: PushIn, user: Supplier, use_case: Annotated[Push, Depends(get_push)]
) -> PushOut:
    """Aplica el lote registro por registro; reenviar el mismo `mutation_id` devuelve el
    resultado guardado (RF-SYN-002). Acepta `Content-Encoding: gzip`."""
    result = await use_case(
        user,
        PushCommand(
            mutation_id=body.mutation_id,
            priority=int(body.priority[1]),
            changes={
                table: TableChanges(created=c.created, updated=c.updated, deleted=c.deleted)
                for table, c in body.changes.items()
            },
        ),
    )
    return PushOut.model_validate(result)


@router.get("/pull", response_model=PullOut)
async def pull(
    user: Supplier,
    use_case: Annotated[Pull, Depends(get_pull)],
    last_pulled_at: Annotated[int, Query(ge=0)] = 0,
    schema_version: Annotated[int | None, Query(ge=1)] = None,
) -> PullOut:
    """Cambios del proveedor posteriores a `last_pulled_at` (ms) y el nuevo `timestamp`."""
    return PullOut.model_validate(await use_case(user, last_pulled_at))
