# ADR-0007 · Tareas asíncronas con outbox en PostgreSQL

- **Estado:** Aceptada · 2026-10-15
- **Contexto:** Se necesitan efectos entre módulos (generar plan tras la autoevaluación, recalcular score, otorgar reconocimientos), tareas programadas (cierre de ciclo, vencimientos) y reportes asíncronos (RF-RPT-005), sin sumar un broker a un sistema pequeño.
- **Decisión:** Eventos de dominio guardados en `shared.outbox` en la misma transacción que el cambio. Un proceso `worker` (misma imagen) los despacha con `SELECT … FOR UPDATE SKIP LOCKED`, con reintentos y *dead letter* tras 10 intentos. Tareas programadas con APScheduler dentro del worker. Los handlers son idempotentes (clave: id del evento).
- **Consecuencias:** (+) Sin Redis ni RabbitMQ; entrega al menos una vez y transaccional. (−) Latencia de despacho de ~1 s; aceptable. Si la carga crece, el outbox se puede publicar a un broker sin cambiar los módulos.
