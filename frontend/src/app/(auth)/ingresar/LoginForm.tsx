"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import { Button, Field } from "@/components/ui";
import { login, type LoginError } from "@/data/api/auth";
import { homeFor, parseIdentifier } from "@/domain/auth/identifier";
import { saveSession } from "@/lib/auth/session";

/* CU-02 · HU-IAM-02. Ingreso con celular o correo; los errores dicen qué pasó
   y qué hacer (guía de usabilidad §5). */
const MESSAGES: Record<LoginError, string> = {
  credentials: "Los datos no coinciden. Revise su celular o correo y la contraseña.",
  locked: "Por seguridad, su cuenta está en pausa 15 minutos.",
  rate_limited: "Hubo muchos intentos seguidos. Espere un minuto y vuelva a intentar.",
  offline: "Sin conexión. Para ingresar necesita señal una vez; después la app funciona sin ella.",
  unexpected: "No pudimos ingresar en este momento. Intente de nuevo en unos minutos.",
};

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const parsed = parseIdentifier(identifier);
    if (!parsed) {
      setIdentifierError("Escriba su celular de 10 dígitos o su correo.");
      return;
    }
    setIdentifierError(null);
    setSending(true);
    const result = await login(parsed.value, password);
    setSending(false);
    if (!result.ok) {
      setError(MESSAGES[result.error]);
      return;
    }
    saveSession(result.session);
    router.replace(homeFor(result.session.user.role, next));
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Field
        label="Celular o correo"
        name="identifier"
        autoComplete="username"
        inputMode="email"
        autoCapitalize="none"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        error={identifierError}
        required
      />
      <Field
        label="Contraseña"
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
            className="min-h-12 rounded-control px-3 text-app-small font-bold text-olive-700"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        }
      />
      {error ? (
        <p role="alert" className="rounded-button bg-rose-100 px-4 py-3 text-app-body font-bold text-rose-700">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={sending || !identifier || !password} icon={<Icon name="arrow" />}>
        {sending ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  );
}
