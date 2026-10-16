"""Módulo `sync` — Sincronización offline: protocolo pull/push de WatermelonDB, idempotencia por
mutation_id, orden P1/P2/P3.

Requerimientos: RF-SYN-001…008. Esquema PostgreSQL: `sync`.
Regla (ADR-0002): otros módulos solo importan `smile.modules.sync.public`.
"""
