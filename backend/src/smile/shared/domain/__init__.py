"""Bloques de construcción de dominio compartidos."""

from smile.shared.domain.base import AggregateRoot, DomainEvent, Entity, ValueObject
from smile.shared.domain.errors import DomainError, NotFoundError, PermissionDeniedError
from smile.shared.domain.values import Money, Quantity

__all__ = [
    "AggregateRoot",
    "DomainError",
    "DomainEvent",
    "Entity",
    "Money",
    "NotFoundError",
    "PermissionDeniedError",
    "Quantity",
    "ValueObject",
]
