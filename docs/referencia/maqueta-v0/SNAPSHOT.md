# Snapshot — maqueta v0

Copia **congelada** de `maqueta/` tal como estaba en el commit `0d70c11` (15 de octubre de 2026).

- **No editar.** Es la referencia visual y de movimiento a partir de la cual se escribió la guía.
- La fuente de verdad es [`docs/diseno/GUIA_VISUAL.md`](../../diseno/GUIA_VISUAL.md). Si esta copia y la guía no coinciden, gana la guía.
- La maqueta de trabajo sigue en `maqueta/` y puede evolucionar; esta copia no.

## Ejecutar

```bash
cd docs/referencia/maqueta-v0
python3 -m http.server 8766
```

- Landing: http://localhost:8766/index.html
- Demo: http://localhost:8766/app.html

Necesita internet la primera vez (GSAP, Lenis y Google Fonts por CDN). La documentación completa de la maqueta está en [`README.md`](README.md).
