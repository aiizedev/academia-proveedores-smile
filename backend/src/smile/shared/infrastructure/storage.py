"""Adaptadores del puerto FileStorage (ADR-0004)."""

from __future__ import annotations

from typing import Any

import boto3
from botocore.client import Config
from botocore.exceptions import BotoCoreError, ClientError

from smile.config import Settings
from smile.shared.application.ports import FileStorage, PresignedUpload


class S3FileStorage:
    """Cualquier servidor S3: SeaweedFS en desarrollo/test (ADR-0008), MinIO, AWS…

    Usa dos clientes: uno con el endpoint interno (operaciones del servidor) y otro con
    el endpoint público para firmar URLs que el navegador pueda resolver.
    """

    def __init__(self, settings: Settings) -> None:
        common: dict[str, Any] = {
            "aws_access_key_id": settings.s3_access_key,
            "aws_secret_access_key": settings.s3_secret_key,
            "region_name": settings.s3_region,
            "config": Config(signature_version="s3v4", s3={"addressing_style": "path"}),
        }
        self._bucket = settings.s3_bucket
        self._client = boto3.client("s3", endpoint_url=settings.s3_endpoint_url, **common)
        self._signer = boto3.client("s3", endpoint_url=settings.s3_public_endpoint_url, **common)

    def presign_put(
        self, key: str, *, content_type: str, max_bytes: int, expires_in: int = 900
    ) -> PresignedUpload:
        post = self._signer.generate_presigned_post(
            self._bucket,
            key,
            Fields={"Content-Type": content_type},
            Conditions=[{"Content-Type": content_type}, ["content-length-range", 1, max_bytes]],
            ExpiresIn=expires_in,
        )
        return PresignedUpload(
            url=post["url"], fields=post["fields"], key=key, expires_in=expires_in
        )

    def presign_get(self, key: str, *, expires_in: int = 900) -> str:
        url: str = self._signer.generate_presigned_url(
            "get_object", Params={"Bucket": self._bucket, "Key": key}, ExpiresIn=expires_in
        )
        return url

    def head(self, key: str) -> dict[str, object] | None:
        try:
            meta = self._client.head_object(Bucket=self._bucket, Key=key)
        except ClientError:
            return None
        return dict(meta)

    def delete(self, key: str) -> None:
        self._client.delete_object(Bucket=self._bucket, Key=key)

    def ping(self) -> bool:
        try:
            self._client.head_bucket(Bucket=self._bucket)
            return True
        except (ClientError, BotoCoreError):
            return False


class GcsFileStorage:
    """Google Cloud Storage (backend de Firebase Storage) para producción.

    Pendiente: se implementa en la fase de despliegue (PLAN_INFRA) con
    `google-cloud-storage`, firmando URLs v4 con la cuenta de servicio. Debe pasar
    la misma suite de contrato que `S3FileStorage`.
    """

    def __init__(self, settings: Settings) -> None:
        raise NotImplementedError(
            "GcsFileStorage aún no está implementado; use STORAGE_PROVIDER=s3 (ADR-0004)."
        )


def build_file_storage(settings: Settings) -> FileStorage:
    if settings.storage_provider == "gcs":
        return GcsFileStorage(settings)  # type: ignore[return-value]
    return S3FileStorage(settings)
