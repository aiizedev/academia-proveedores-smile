"""Módulo `iam` — Identidad, acceso y roles: usuarios, credenciales Argon2id, JWT de
acceso/refresh, bloqueo por intentos.

Requerimientos: RF-IAM-001…009. Esquema PostgreSQL: `iam`.
Regla (ADR-0002): otros módulos solo importan `smile.modules.iam.public`.
"""
