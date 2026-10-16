"""Descomprime cuerpos `Content-Encoding: gzip` (la PWA envía el push comprimido, arquitectura §5).

Tope de tamaño descomprimido para evitar bombas de compresión (413).
"""

import gzip
import json
import zlib

from starlette.types import ASGIApp, Message, Receive, Scope, Send

MAX_DECOMPRESSED_BYTES = 1024 * 1024


class GzipRequestMiddleware:
    def __init__(self, app: ASGIApp, max_bytes: int = MAX_DECOMPRESSED_BYTES) -> None:
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        headers = dict(scope.get("headers") or [])
        if scope["type"] != "http" or headers.get(b"content-encoding", b"").lower() != b"gzip":
            await self.app(scope, receive, send)
            return
        compressed = b""
        more = True
        while more:
            message = await receive()
            compressed += message.get("body", b"")
            more = message.get("more_body", False)
        try:
            decoder = zlib.decompressobj(wbits=16 + zlib.MAX_WBITS)
            body = decoder.decompress(compressed, self.max_bytes + 1)
        except (zlib.error, gzip.BadGzipFile):
            await _reject(send, 400, "bad_request", "El cuerpo comprimido no es válido")
            return
        if len(body) > self.max_bytes or decoder.unconsumed_tail:
            await _reject(send, 413, "payload_too_large", "El lote es demasiado grande")
            return
        scope["headers"] = [
            (k, v) for k, v in scope["headers"] if k not in (b"content-encoding", b"content-length")
        ] + [(b"content-length", str(len(body)).encode())]
        sent = False

        async def replay() -> Message:
            nonlocal sent
            if sent:
                return await receive()
            sent = True
            return {"type": "http.request", "body": body, "more_body": False}

        await self.app(scope, replay, send)


async def _reject(send: Send, status: int, code: str, message: str) -> None:
    payload = json.dumps(
        {"error": {"code": code, "message": message, "details": None, "request_id": None}}
    ).encode()
    await send(
        {
            "type": "http.response.start",
            "status": status,
            "headers": [(b"content-type", b"application/json")],
        }
    )
    await send({"type": "http.response.body", "body": payload})
