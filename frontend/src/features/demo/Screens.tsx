import { Icon } from "@/components/icons";
import { Card, Chip } from "@/components/ui";
import { formatNumber } from "@/lib/format";
import { BENEFITS, CLIPS, DEMO_FARM, LOTS, MESSAGES, RECEPTIONS, RECOGNITIONS, SCORE } from "@/mocks/app";
import { DemoNote, ScreenTitle, TextLink, day } from "./parts";

/* Pantallas de demo (POC) con datos fijos de src/mocks/app.ts. */

const daysUntil = (iso: string) => Math.max(0, Math.ceil((new Date(`${iso}T00:00:00-05:00`).getTime() - Date.now()) / 86_400_000));

export function ErpHubScreen() {
  const links = [
    ["/app/erp/ventas", "Ventas", "Registre lo que vende en menos de un minuto."],
    ["/app/erp/costos", "Costos", "Insumos, mano de obra, transporte y empaques."],
    ["/app/erp/mermas", "Mermas", "Lo que se pierde y por qué."],
    ["/app/erp/inventario", "Inventario", "Lo que tiene listo para vender."],
  ] as const;
  return (
    <section className="flex flex-col gap-5">
      <ScreenTitle eyebrow="Mini ERP">
        Ventas y <em>costos</em>
      </ScreenTitle>
      <ul className="flex flex-col gap-3">
        {links.map(([href, title, detail]) => (
          <li key={href}>
            <a href={href} className="flex min-h-[3.7rem] items-center justify-between gap-3 rounded-card border-[1.5px] border-line bg-white p-4">
              <span className="flex flex-col">
                <span className="font-display text-app-h3">{title}</span>
                <span className="text-app-caption text-ink-soft">{detail}</span>
              </span>
              <Icon name="arrow" size="1.3rem" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LotsScreen() {
  return (
    <section className="flex flex-col gap-5">
      <ScreenTitle eyebrow="Trazabilidad" intro="Cada aplicación de agroquímico fija una fecha segura para cosechar.">
        Sus <em>lotes</em>
      </ScreenTitle>
      {LOTS.map((lot) => (
        <Card key={lot.code} className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-app-h3">{lot.product}</span>
            <span className={lot.status === "bloqueado" ? "rounded-pill bg-rose-100 px-3 py-1 text-app-chip font-extrabold uppercase text-rose-700" : "rounded-pill bg-olive-800 px-3 py-1 text-app-chip font-extrabold uppercase text-cream"}>
              {lot.status === "bloqueado" ? "Bloqueado" : "Liberado"}
            </span>
          </div>
          <p className="text-app-small text-ink-soft">
            {lot.code} · {lot.plot}
          </p>
          <p className="text-app-body">
            Última aplicación: {lot.lastApplication.product}, {day(lot.lastApplication.date)} · carencia de {lot.lastApplication.withholdingDays} días antes de cosechar.
          </p>
          {lot.status === "bloqueado" ? (
            <p role="alert" className="rounded-button bg-rose-100 p-3 font-bold text-rose-700">
              Faltan {daysUntil(lot.safeOn)} días para cosechar este lote sin riesgo. Fecha segura: {day(lot.safeOn)}.
            </p>
          ) : lot.label ? (
            <div className="flex flex-col gap-2 rounded-button border-[1.5px] border-dashed border-olive-300 p-3">
              <span className="text-app-caption text-ink-soft">Rótulo del lote</span>
              <span className="font-display text-app-h3 tracking-[var(--tracking-title)]">{lot.label.code}</span>
              <code className="break-all text-app-caption">{lot.label.qrText}</code>
              <span className="text-app-caption text-ink-soft">Cosechado el {day(lot.harvestedOn)}. El QR se genera en el teléfono (R2).</span>
            </div>
          ) : null}
        </Card>
      ))}
      <DemoNote />
    </section>
  );
}

export function ScoreScreen() {
  return (
    <section className="flex flex-col gap-5">
      <ScreenTitle eyebrow="Mi score" intro="50 % sostenibilidad, 30 % desempeño en recepción y 20 % plan y evidencias.">
        {SCORE.total} <em>de 100</em>
      </ScreenTitle>
      <Card strong className="flex flex-col gap-1">
        <span className="text-app-caption text-olive-300">Etapa actual</span>
        <span className="font-display text-app-h3">
          {SCORE.stage.code} · {SCORE.stage.name}
        </span>
      </Card>
      <ul className="flex flex-col gap-4">
        {SCORE.pillars.map((p) => (
          <li key={p.name} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold">
                {p.name} <span className="text-app-caption text-ink-soft">({p.weight} %)</span>
              </span>
              <span className="font-display text-app-h3 tabular-nums">{p.score}</span>
            </div>
            <div className="h-[7px] overflow-hidden rounded-pill bg-olive-100">
              <div className="h-full rounded-pill bg-olive-600" style={{ width: `${p.score}%` }} />
            </div>
            <span className="text-app-caption text-ink-soft">{p.why}</span>
          </li>
        ))}
      </ul>
      <p className="rounded-button bg-rose-100 p-3 text-app-body">
        <strong>Lo que más le sube:</strong> {SCORE.boost}
      </p>
      <TextLink href="/app/plan">Ver mi plan</TextLink>
      <DemoNote />
    </section>
  );
}

export function ReceptionsScreen() {
  return (
    <section className="flex flex-col gap-5">
      <ScreenTitle eyebrow="Recepciones" intro="Lo que Smile recibió de sus entregas.">
        Sus <em>entregas</em>
      </ScreenTitle>
      <ul className="flex flex-col gap-3">
        {RECEPTIONS.map((r) => {
          const pct = (r.rejectedKg / r.receivedKg) * 100;
          return (
            <li key={r.id}>
              <Card className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold">{r.product}</span>
                  <span className="text-app-caption text-ink-soft">{day(r.date)}</span>
                </div>
                <span className="text-app-body">
                  Recibidos {formatNumber(r.receivedKg)} kg · rechazados {formatNumber(r.rejectedKg)} kg ({formatNumber(pct, 1)} %)
                </span>
                {r.cause ? <span className="text-app-caption text-ink-soft">Causa: {r.cause}</span> : null}
                <span className={r.labelValid ? "text-app-caption font-bold text-olive-700" : "text-app-caption font-bold text-rose-700"}>
                  {r.labelValid ? "Rótulo válido" : "Rótulo con datos incompletos"}
                </span>
              </Card>
            </li>
          );
        })}
      </ul>
      <DemoNote />
    </section>
  );
}

export function MessagesScreen() {
  return (
    <section className="flex flex-col gap-5">
      <ScreenTitle eyebrow="Mensajes">
        Su <em>bandeja</em>
      </ScreenTitle>
      <ul className="flex flex-col gap-3">
        {MESSAGES.map((m) => (
          <li key={m.id}>
            <Card className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold">
                  {m.unread ? <span className="mr-1 inline-block size-2 rounded-full bg-rose-500 align-middle" aria-label="Sin leer" /> : null}
                  {m.subject}
                </span>
                <span className="text-app-caption text-ink-soft">{day(m.date)}</span>
              </div>
              <span className="text-app-caption text-ink-soft">{m.from}</span>
              <p className="text-app-body">{m.body}</p>
            </Card>
          </li>
        ))}
      </ul>
      <DemoNote />
    </section>
  );
}

export function LearnScreen() {
  return (
    <section className="flex flex-col gap-5">
      <ScreenTitle eyebrow="Aprender" intro="Videos cortos de sus metas; los descargados se ven sin señal.">
        Aprenda en <em>minutos</em>
      </ScreenTitle>
      <ul className="flex flex-col gap-3">
        {CLIPS.map((c) => (
          <li key={c.id}>
            <Card className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-pill bg-rose-100 px-3 py-1 text-app-chip font-extrabold uppercase text-rose-700">{c.goal}</span>
                <span className="text-app-caption text-ink-soft">
                  {c.minutes} min · {c.offline ? "Descargado" : "Se descarga con Wi‑Fi"}
                </span>
              </div>
              <span className="font-display text-app-h3">{c.title}</span>
              <div className="h-1.5 overflow-hidden rounded-pill bg-olive-100">
                <div className="h-full rounded-pill bg-olive-600" style={{ width: `${c.progress}%` }} />
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <DemoNote />
    </section>
  );
}

export function BenefitsScreen() {
  return (
    <section className="flex flex-col gap-5">
      <ScreenTitle eyebrow="Beneficios" intro={`Lleva ${RECOGNITIONS.flowers} Flores este ciclo.`}>
        Su ruta de <em>beneficios</em>
      </ScreenTitle>
      <ol className="flex flex-col gap-3">
        {BENEFITS.map((b, i) => (
          <li key={b.id} className="flex gap-3">
            <span className={b.unlocked ? "grid size-10 shrink-0 place-items-center rounded-full bg-olive-800 text-cream" : "grid size-10 shrink-0 place-items-center rounded-full border-[1.5px] border-olive-300 text-ink-soft"}>
              <Icon name={b.unlocked ? "check" : "lock"} size="1.2rem" />
            </span>
            <div className="flex flex-col">
              <span className="font-bold">
                {i + 1}. {b.title}
              </span>
              <span className="text-app-caption text-ink-soft">{b.unlocked ? "Desbloqueado" : `Le falta: ${b.condition}`}</span>
            </div>
          </li>
        ))}
      </ol>
      <DemoNote />
    </section>
  );
}

export function ProfileScreen() {
  return (
    <section className="flex flex-col gap-5">
      <ScreenTitle eyebrow="Perfil">{DEMO_FARM.owner}</ScreenTitle>
      <Card className="flex flex-col gap-2">
        <span className="font-display text-app-h3">{DEMO_FARM.name}</span>
        <span className="text-app-body">{DEMO_FARM.place}</span>
        <span className="text-app-caption text-ink-soft">Celular 300 123 4567 · proveedor@smile.test</span>
      </Card>
      <div className="flex flex-col gap-1">
        <TextLink href="/app/ficha">Ver o editar mi ficha</TextLink>
        <TextLink href="/app/ficha/resumen">Imprimir o compartir mi ficha resumen</TextLink>
        <TextLink href="/app/consentimiento">Mi autorización de datos</TextLink>
      </div>
      <a href="https://wa.me/573001234567" className="inline-flex min-h-[3.7rem] items-center justify-center gap-3 rounded-button border-[1.5px] border-line px-[1.4rem] text-app-button font-extrabold">
        Hablar con Smile
        <Icon name="chat" size="1.3rem" />
      </a>
      <Chip priority="mantener">Demo: la sesión no se cierra</Chip>
    </section>
  );
}
