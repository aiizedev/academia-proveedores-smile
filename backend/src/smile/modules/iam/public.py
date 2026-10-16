"""API pública de `iam`: única superficie importable por otros módulos.

Expone fachadas de casos de uso, DTOs y nombres de eventos de dominio.
"""

from smile.modules.iam.api.authz import require
from smile.modules.iam.domain.permissions import Permission

__all__ = ["Permission", "require"]
