"""Logs sin datos personales (HU-PLAT-06, RNF-OBS-001)."""

from smile.observability import REDACTED, redact_pii


def test_known_pii_keys_are_redacted() -> None:
    out = redact_pii(None, "info", {"event": "login", "phone": "3001234567", "password": "x"})
    assert out == {"event": "login", "phone": REDACTED, "password": REDACTED}


def test_phone_and_email_in_free_text_are_redacted() -> None:
    out = redact_pii(
        None,
        "info",
        {"event": "fallo para +57 3001234567 y ana@smile.test", "extra": {"email": "a@b.co"}},
    )
    assert "3001234567" not in out["event"]
    assert "ana@smile.test" not in out["event"]
    assert out["extra"] == {"email": REDACTED}


def test_ids_and_counts_are_kept() -> None:
    out = redact_pii(None, "info", {"event": "request", "status": 200, "route": "/api/v1/me"})
    assert out == {"event": "request", "status": 200, "route": "/api/v1/me"}
