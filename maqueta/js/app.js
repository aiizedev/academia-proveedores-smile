/* ==========================================================
   Demo app — Autoevaluación → Diagnóstico → Guías (Fruver)
   Estado local en localStorage (offline-first).
   ========================================================== */
(() => {
  const D = window.SMILE_DATA;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const I = (name, cls) => window.icon(name, cls);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const hasGSAP = typeof gsap !== "undefined";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const anim = hasGSAP && !reduce;
  const hasSplit = hasGSAP && typeof SplitText !== "undefined";
  const hasDraw = hasGSAP && typeof DrawSVGPlugin !== "undefined";
  if (hasGSAP) gsap.registerPlugin(...[hasSplit && SplitText, hasDraw && DrawSVGPlugin].filter(Boolean));

  const phone = $(".phone__screen");
  const N = D.questions.length;
  const RING_C = 2 * Math.PI * 84;

  /* ==========================================================
     ESTADO
     ========================================================== */
  const KEY = "smile-demo-v1";
  const fresh = () => ({
    screen: "welcome",
    name: "",
    farm: "",
    category: null,
    answers: {},
    qIndex: 0,
    done: false,
    finishedAt: null,
    checks: {},
    calc: { diesel: "", gas: "", urea: "", kwh: "" },
    guide: null,
  });

  let state = load();
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && typeof s === "object") return { ...fresh(), ...s };
    } catch (_) {}
    return fresh();
  }
  function save(flash = true) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
    if (flash) pulseSave();
  }

  /* ==========================================================
     MOTOR DE DIAGNÓSTICO (reglas)
     ========================================================== */
  const axisById = (id) => D.axes.find((a) => a.id === id);
  const answerById = (id) => D.answers.find((a) => a.id === id);
  const levelFor = (pct) => [...D.levels].reverse().find((l) => pct >= l.min);

  function diagnose(answers = state.answers) {
    let gotAll = 0, maxAll = 0;
    const flags = [];
    const axes = D.axes.map((ax) => {
      let got = 0, max = 0;
      const axFlags = [];
      D.questions.filter((q) => q.axis === ax.id).forEach((q) => {
        const a = answerById(answers[q.id]);
        max += q.weight;
        got += q.weight * (a ? a.value : 0);
        if (q.critical && [].concat(q.critical.when).includes(answers[q.id])) {
          axFlags.push(q.critical.message);
        }
      });
      gotAll += got; maxAll += max;
      const pct = Math.round((got / max) * 100);
      let level = levelFor(pct);
      // Regla: una alerta crítica impide el nivel Avanzado en el eje
      if (axFlags.length && level.id === "avanzado") level = D.levels[1];
      flags.push(...axFlags.map((m) => ({ axis: ax, message: m })));
      return { axis: ax, pct, level, flags: axFlags, priority: axFlags.length ? "critica" : level.priority };
    });
    const total = Math.round((gotAll / maxAll) * 100);
    let level = levelFor(total);
    if (flags.length && level.id === "avanzado") level = D.levels[1];
    return { axes, total, level, flags };
  }

  const guideChecks = (g) => state.checks[g.id] || g.checklist.map(() => false);
  const guideProgress = (g) => {
    const c = guideChecks(g);
    const done = c.filter(Boolean).length;
    return { done, total: c.length, complete: done === c.length };
  };

  // Plan: guías ordenadas por prioridad del eje y puntaje
  function buildPlan(dg = diagnose()) {
    return D.guides
      .map((g) => {
        const res = dg.axes.find((r) => r.axis.id === g.axis);
        let priority = res.priority;
        if (g.bonus) priority = res.level.id === "avanzado" ? "media" : "mantener";
        return { guide: g, res, priority, progress: guideProgress(g) };
      })
      .sort((a, b) =>
        a.progress.complete - b.progress.complete ||
        D.priorities[a.priority].order - D.priorities[b.priority].order ||
        a.res.pct - b.res.pct ||
        (a.guide.bonus ? 1 : 0) - (b.guide.bonus ? 1 : 0));
  }

  function incentivesStatus(dg = diagnose()) {
    const completed = D.guides.filter((g) => guideProgress(g).complete);
    const axesCovered = D.axes.every((ax) => completed.some((g) => g.axis === ax.id));
    const rules = {
      diag: state.done,
      compras: completed.length >= 2,
      sello: axesCovered,
      mercados: state.done && dg.axes.every((r) => r.level.id === "avanzado"),
    };
    return D.incentives.map((inc) => ({ ...inc, unlocked: !!rules[inc.id] }));
  }

  /* ==========================================================
     UI GLOBAL: guardado, toast, confeti, reloj
     ========================================================== */
  const saveEl = $("[data-save]");
  function setNetState() {
    const off = !navigator.onLine;
    saveEl.classList.toggle("is-offline", off);
    $(".status__save-icon", saveEl).innerHTML = I(off ? "wifiOff" : "cloudOk");
    $(".status__save-text", saveEl).textContent = off ? "Sin conexión · guardado" : "Guardado";
  }
  function pulseSave() {
    if (!anim) return;
    gsap.fromTo(saveEl, { scale: 0.86 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.45)" });
  }
  window.addEventListener("online", () => { setNetState(); toast("Conexión recuperada · sincronizado", "cloudOk"); });
  window.addEventListener("offline", () => { setNetState(); toast("Sin conexión. Tu avance sigue guardado", "wifiOff"); });

  const toastEl = $(".toast");
  let toastTl;
  function toast(msg, ico = "check") {
    toastEl.innerHTML = `${I(ico)}<span>${esc(msg)}</span>`;
    if (!anim) {
      Object.assign(toastEl.style, { opacity: 1, transform: "none" });
      clearTimeout(toast._t);
      toast._t = setTimeout(() => { toastEl.style.opacity = 0; }, 2400);
      return;
    }
    toastTl?.kill();
    toastTl = gsap.timeline()
      .fromTo(toastEl, { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" })
      .to(toastEl, { y: 20, opacity: 0, duration: 0.4, ease: "power2.in" }, "+=2.3");
  }

  const confettiEl = $(".confetti");
  function confetti(count = 40) {
    if (!anim) return;
    const colors = ["#d4a5a0", "#5b6b3a", "#a3ae7a", "#e8c4bc", "#2f3a1f"];
    const h = phone.clientHeight;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("i");
      p.style.left = gsap.utils.random(4, 96) + "%";
      p.style.background = gsap.utils.random(colors);
      confettiEl.appendChild(p);
      const s = gsap.utils.random(0.6, 1.4);
      gsap.fromTo(p,
        { y: gsap.utils.random(-60, -10), scale: s, rotation: gsap.utils.random(0, 360) },
        {
          y: h + 40,
          x: `+=${gsap.utils.random(-70, 70)}`,
          rotation: `+=${gsap.utils.random(240, 720)}`,
          duration: gsap.utils.random(1.8, 3.2),
          delay: gsap.utils.random(0, 0.5),
          ease: "power1.in",
          onComplete: () => p.remove(),
        });
    }
  }

  function tickClock() {
    const d = new Date();
    $("[data-time]").textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  tickClock();
  setInterval(tickClock, 30000);

  /* ==========================================================
     NAVEGACIÓN ENTRE PANTALLAS
     ========================================================== */
  const screens = Object.fromEntries($$("[data-screen]").map((s) => [s.dataset.screen, s]));
  const ORDER = ["welcome", "category", "quiz", "loading", "diagnosis", "plan", "guide", "route", "ficha"];
  const TABS = ["diagnosis", "plan", "route", "ficha"];
  const STEP_OF = { welcome: "welcome", category: "category", quiz: "quiz", loading: "quiz", diagnosis: "diagnosis", plan: "plan", guide: "plan", route: "route", ficha: "route" };
  const STEPS = ["welcome", "category", "quiz", "diagnosis", "plan", "route"];
  let current = null;

  function go(name, opts = {}) {
    const next = screens[name];
    if (!next) return;
    const prev = current && current !== name ? screens[current] : null;
    const dir = opts.dir ?? (ORDER.indexOf(name) >= ORDER.indexOf(current) ? 1 : -1);

    render[name](next);

    if (prev) {
      if (anim) {
        gsap.to(prev, {
          xPercent: -12 * dir, opacity: 0, duration: 0.32, ease: "power2.in",
          onComplete: () => { prev.classList.remove("is-active"); gsap.set(prev, { clearProps: "transform,opacity" }); },
        });
      } else prev.classList.remove("is-active");
    }

    next.classList.add("is-active");
    next.scrollTop = 0;
    if (anim) {
      const delay = prev ? 0.2 : 0.05;
      gsap.fromTo(next, { xPercent: 14 * dir, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.75, ease: "expo.out", delay, clearProps: "transform,opacity" });
      const items = $$("[data-a]", next);
      if (items.length) gsap.from(items, { y: 30, opacity: 0, duration: 0.9, stagger: 0.05, ease: "expo.out", delay: delay + 0.06, clearProps: "transform,opacity" });
    }

    current = name;
    if (name !== "loading") { state.screen = name; save(false); }
    updateChrome(name);
    enter[name]?.(next, prev ? 0.25 : 0.1);
  }

  const tabbar = $(".tabbar");
  const pill = $(".tabbar__pill");
  function updateChrome(name) {
    const showTabs = TABS.includes(name) || name === "guide";
    tabbar.classList.toggle("is-visible", showTabs);
    phone.classList.toggle("has-tabs", showTabs);
    const activeTab = name === "guide" ? "plan" : name;
    $$(".tab").forEach((t) => {
      const on = t.dataset.tab === activeTab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-current", on ? "page" : "false");
    });
    const idx = TABS.indexOf(activeTab);
    if (idx >= 0) pill.style.transform = `translateX(${idx * 100}%)`;

    // Panel lateral (escritorio)
    const stepIdx = STEPS.indexOf(STEP_OF[name]);
    $$(".stage__steps li").forEach((li, i) => {
      li.classList.toggle("is-current", i === stepIdx);
      li.classList.toggle("is-done", i < stepIdx || (state.done && i <= 3 && i !== stepIdx));
    });
  }

  /* ==========================================================
     RENDER DE PANTALLAS
     ========================================================== */
  const render = {};
  const enter = {};

  /* ---------- 1. Bienvenida ---------- */
  render.welcome = (el) => {
    if (anim) gsap.killTweensOf($$(".w-leaf", el));
    el.innerHTML = `
      <div class="welcome-art" data-a>
        <svg viewBox="0 0 600 440" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <defs>
            <linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#f3dcd4"/><stop offset="1" stop-color="#faf4ec"/>
            </linearGradient>
          </defs>
          <rect width="600" height="440" fill="url(#wsky)"/>
          <g class="sun-rays" stroke="#e8c4bc" stroke-width="5" stroke-linecap="round">
            ${Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const x1 = 300 + Math.cos(a) * 92, y1 = 150 + Math.sin(a) * 92;
              const x2 = 300 + Math.cos(a) * 118, y2 = 150 + Math.sin(a) * 118;
              return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
            }).join("")}
          </g>
          <circle class="w-sun" cx="300" cy="150" r="72" fill="#d4a5a0"/>
          <path class="w-far" d="M0 300 C 120 250, 220 270, 300 285 S 480 250, 600 270 V440 H0Z" fill="#a3ae7a"/>
          <path class="w-mid" d="M0 340 C 150 305, 300 320, 600 330 V440 H0Z" fill="#8a9760"/>
          <path d="M0 382 C 200 362, 400 362, 600 382 V440 H0Z" fill="#2f3a1f"/>
          <path class="w-stem" d="M300 374 C 300 344, 297 322, 300 288" fill="none" stroke="#2f3a1f" stroke-width="7" stroke-linecap="round"/>
          <path class="w-leaf w-leaf--l" d="M300 326 C 280 324, 256 310, 252 284 C 280 284, 298 300, 300 326Z" fill="#5b6b3a"/>
          <path class="w-leaf w-leaf--r" d="M300 304 C 318 298, 344 282, 348 252 C 320 254, 302 272, 300 304Z" fill="#5b6b3a"/>
        </svg>
      </div>
      <div class="stack gap-l" style="flex:1;padding-top:1.5rem">
        <div class="stack gap-s">
          <p class="brand welcome-brand" data-a>smile<span class="dot">.</span></p>
          <h1 class="a-title" data-a>Hola. Vamos a <em>cuidar</em> tu finca juntos.</h1>
          <p class="a-lead" data-a>En ${N} preguntas sabrás en qué vas bien y qué mejorar primero.</p>
        </div>
        <div class="stack gap-m" data-a>
          <div class="field">
            <label for="f-name">¿Cómo te llamas?</label>
            <input id="f-name" name="name" autocomplete="given-name" placeholder="Tu nombre" value="${esc(state.name)}">
          </div>
          <div class="field">
            <label for="f-farm">Nombre de tu finca <span style="font-weight:500;color:var(--ink-soft)">(opcional)</span></label>
            <input id="f-farm" name="farm" placeholder="Ej. Finca La Esperanza" value="${esc(state.farm)}">
          </div>
        </div>
        <div class="stack gap-m mt-auto" data-a>
          ${state.done
            ? `<button class="btn" type="button" data-go="diagnosis">Ver mi diagnóstico ${I("arrow")}</button>
               <button class="btn btn--ghost" type="button" data-go="category">Empezar de nuevo</button>`
            : `<button class="btn" type="button" data-go="category">Empezar ${I("arrow")}</button>`}
          <p class="offline-note">${I("wifiOff")} Funciona sin internet. Tu avance se guarda en el teléfono.</p>
        </div>
      </div>`;
  };
  enter.welcome = (el, d) => {
    if (!anim) return;
    const tl = gsap.timeline({ delay: d });
    tl.from($(".w-sun", el), { y: 60, scale: 0.7, transformOrigin: "50% 50%", duration: 1.6, ease: "expo.out" })
      .from($(".w-far", el), { y: 50, duration: 1.4, ease: "expo.out" }, 0.05)
      .from($(".w-mid", el), { y: 40, duration: 1.4, ease: "expo.out" }, 0.1);
    if (hasDraw) tl.from($(".w-stem", el), { drawSVG: "0%", duration: 1, ease: "power2.inOut" }, 0.35);
    gsap.set($$(".w-leaf", el), { transformOrigin: (i) => (i ? "0% 100%" : "100% 100%") });
    tl.from($$(".w-leaf", el), { scale: 0, duration: 1, stagger: 0.15, ease: "back.out(2.2)" }, 0.9);
    gsap.to($$(".w-leaf", el), { rotation: 4, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: d + 2, stagger: 0.4 });
  };

  /* ---------- 2. Categoría ---------- */
  render.category = (el) => {
    const tiles = D.categories.map((c) => c.active
      ? `<button class="tile is-pilot" type="button" data-a data-cat="${c.id}">
           <span class="tile__badge">Piloto</span>
           <span class="tile__icon">${I(c.icon)}</span>
           <span><span class="tile__name">${c.name}</span><span class="tile__desc">${c.desc}</span></span>
           <span class="tile__go">${I("arrow")}</span>
         </button>`
      : `<button class="tile is-locked" type="button" data-a data-locked="${c.name}" aria-disabled="true">
           <span class="tile__badge">${I("lock")} Pronto</span>
           <span class="tile__icon">${I(c.icon)}</span>
           <span><span class="tile__name">${c.name}</span><span class="tile__desc">${c.desc}</span></span>
         </button>`).join("");
    el.innerHTML = `
      <div class="q-top" data-a><button class="icon-btn" type="button" data-go="welcome" aria-label="Volver">${I("back")}</button></div>
      <div class="stack gap-s" style="margin:1.3rem 0 1.5rem">
        <p class="a-eyebrow" data-a>Antes de empezar</p>
        <h1 class="a-title" data-a>¿Qué <em>produces</em>?</h1>
        <p class="a-lead" data-a>Elige tu categoría. Hoy está disponible el piloto de Fruver.</p>
      </div>
      <div class="tiles">${tiles}</div>`;
  };

  /* ---------- 3. Autoevaluación ---------- */
  const LEAF = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#faf4ec"/><path d="M6 18c0-7 4.5-11.5 12-12 0 7.5-4.5 12-12 12Z" fill="currentColor"/><path d="M6.5 17.5 13 11" stroke="#faf4ec" stroke-width="1.4" stroke-linecap="round"/></svg>`;
  let answering = false;

  render.quiz = (el) => {
    el.innerHTML = `
      <div class="q-top" data-a>
        <button class="icon-btn" type="button" data-action="q-back" aria-label="Pregunta anterior">${I("back")}</button>
        <span class="q-count"><b data-qn>${state.qIndex + 1}</b> de ${N}</span>
      </div>
      <div class="leafbar" data-a aria-hidden="true"><span class="leafbar__fill"></span><span class="leafbar__leaf">${LEAF}</span></div>
      <div class="q-body" data-qbody></div>`;
    buildQuestion(el);
    setProgress(el, false);
  };
  enter.quiz = (el, d) => animateQuestionIn(el, d);

  function questionHTML(q) {
    const ax = axisById(q.axis);
    const chosen = state.answers[q.id];
    return `
      <span class="q-chip">${I(ax.icon)} ${ax.short}</span>
      <h2 class="q-text">${q.text}</h2>
      <p class="q-help">${I("sparkle")}<span>${q.help}</span></p>
      <div class="answers" role="radiogroup" aria-label="Tu respuesta">
        ${D.answers.map((a) => `
          <button class="answer${chosen === a.id ? " is-selected" : ""}" type="button" role="radio" aria-checked="${chosen === a.id}" data-ans="${a.id}">
            <span class="answer__fill"></span>
            <span class="answer__icon">${I(a.icon)}</span>
            <span class="answer__label">${a.label}</span>
            <span class="answer__check">${window.ICONS.check}</span>
          </button>`).join("")}
      </div>`;
  }

  function buildQuestion(el) {
    const body = $("[data-qbody]", el);
    body.innerHTML = questionHTML(D.questions[state.qIndex]);
    $("[data-qn]", el).textContent = state.qIndex + 1;
  }

  function animateQuestionIn(el, delay = 0) {
    if (!anim) return;
    const body = $("[data-qbody]", el);
    const text = $(".q-text", body);
    const tl = gsap.timeline({ delay });
    tl.from($(".q-chip", body), { x: 40, opacity: 0, duration: 0.7, ease: "expo.out" });
    if (hasSplit) {
      const split = SplitText.create(text, { type: "words", mask: "words" });
      tl.from(split.words, { yPercent: 110, duration: 0.8, stagger: 0.025, ease: "expo.out", onComplete: () => split.revert() }, 0.05);
    } else tl.from(text, { x: 40, opacity: 0, duration: 0.7, ease: "expo.out" }, 0.05);
    tl.from($(".q-help", body), { y: 16, opacity: 0, duration: 0.7, ease: "expo.out" }, 0.25)
      .from($$(".answer", body), { y: 40, opacity: 0, duration: 0.8, stagger: 0.07, ease: "expo.out", clearProps: "transform,opacity" }, 0.2);
  }

  function setProgress(el, animate = true) {
    const pct = (Object.keys(state.answers).filter((k) => D.questions.some((q) => q.id === k)).length / N) * 100;
    const fill = $(".leafbar__fill", el);
    const leaf = $(".leafbar__leaf", el);
    if (anim && animate) {
      gsap.to(fill, { width: pct + "%", duration: 0.9, ease: "expo.out" });
      gsap.to(leaf, { left: pct + "%", duration: 0.9, ease: "expo.out" });
      gsap.fromTo(leaf, { rotation: -25 }, { rotation: 0, duration: 1, ease: "elastic.out(1, 0.4)" });
    } else {
      fill.style.width = pct + "%";
      leaf.style.left = pct + "%";
    }
  }

  function changeQuestion(dir) {
    const el = screens.quiz;
    const body = $("[data-qbody]", el);
    const swap = () => { buildQuestion(el); animateQuestionIn(el); answering = false; };
    if (anim) {
      gsap.to(body.children, { x: -50 * dir, opacity: 0, duration: 0.28, stagger: 0.03, ease: "power2.in", onComplete: () => { gsap.set(body.children, { clearProps: "all" }); swap(); } });
    } else swap();
  }

  function onAnswer(btn, e) {
    if (answering) return;
    answering = true;
    const q = D.questions[state.qIndex];
    state.answers[q.id] = btn.dataset.ans;
    save();

    $$(".answer", btn.parentElement).forEach((b) => {
      b.classList.toggle("is-selected", b === btn);
      b.setAttribute("aria-checked", String(b === btn));
      if (b !== btn) $(".answer__fill", b).style.clipPath = "";
    });

    if (anim) {
      const r = btn.getBoundingClientRect();
      const x = e && e.clientX ? e.clientX - r.left : r.width / 2;
      const y = e && e.clientY ? e.clientY - r.top : r.height / 2;
      gsap.fromTo($(".answer__fill", btn), { clipPath: `circle(0% at ${x}px ${y}px)` }, { clipPath: `circle(150% at ${x}px ${y}px)`, duration: 0.65, ease: "power3.out" });
      gsap.fromTo($(".answer__check", btn), { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(3)" });
      gsap.fromTo($(".answer__icon", btn), { scale: 0.8 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    }
    setProgress(screens.quiz);

    setTimeout(() => {
      if (state.qIndex < N - 1) {
        state.qIndex++;
        save(false);
        changeQuestion(1);
      } else {
        state.done = true;
        state.finishedAt = Date.now();
        save();
        answering = false;
        go("loading");
      }
    }, anim ? 560 : 150);
  }

  /* ---------- 4. Analizando ---------- */
  render.loading = (el) => {
    const petal = "M0 -8 C 22 -30, 24 -64, 0 -88 C -24 -64, -22 -30, 0 -8 Z";
    el.innerHTML = `
      <svg class="loader-mark" viewBox="-100 -100 200 200" aria-hidden="true">
        <g class="loader-petals">${[0, 90, 180, 270].map((r) => `<g transform="rotate(${r})"><path class="petal" d="${petal}"/></g>`).join("")}</g>
        <circle class="seed" r="7"/>
      </svg>
      <h2 class="a-title" style="font-size:1.9rem">Preparando tu<br><em>diagnóstico</em></h2>
      <div class="loader-lines" style="width:100%;margin-top:1rem">
        ${D.axes.map((a) => `<span>Revisando ${a.short.toLowerCase()}…</span>`).join("")}
      </div>`;
  };
  enter.loading = (el) => {
    const lines = $$(".loader-lines span", el);
    if (!anim) {
      lines.forEach((l, i) => (l.style.display = i ? "none" : ""));
      setTimeout(() => go("diagnosis"), 700);
      return;
    }
    gsap.set(lines, { yPercent: 100, opacity: 0 });
    const petals = $$(".petal", el);
    const tl = gsap.timeline({ onComplete: () => go("diagnosis") });
    tl.from(petals, { scale: 0, transformOrigin: "50% 100%", duration: 0.7, stagger: 0.08, ease: "back.out(2)" })
      .to($(".loader-petals", el), { rotation: 360, svgOrigin: "0 0", duration: 2.6, ease: "power2.inOut" }, 0);
    lines.forEach((l, i) => {
      tl.to(l, { yPercent: 0, opacity: 1, duration: 0.35, ease: "expo.out" }, 0.15 + i * 0.45)
        .to(l, { yPercent: -100, opacity: 0, duration: 0.3, ease: "power2.in" }, 0.15 + i * 0.45 + 0.38);
    });
    tl.to(petals, { y: -30, opacity: 0, duration: 0.4, stagger: 0.05, ease: "power2.in" }, "-=0.1");
  };

  /* ---------- 5. Diagnóstico ---------- */
  render.diagnosis = (el) => {
    const dg = diagnose();
    const first = (state.name || "").trim().split(/\s+/)[0];
    const tick = (p) => {
      const a = p * Math.PI * 2;
      return `<line x1="${(100 + Math.cos(a) * 75).toFixed(1)}" y1="${(100 + Math.sin(a) * 75).toFixed(1)}" x2="${(100 + Math.cos(a) * 93).toFixed(1)}" y2="${(100 + Math.sin(a) * 93).toFixed(1)}"/>`;
    };
    const alerts = dg.flags.map((f) => `
      <div class="alert" data-a>${I("alert")}<p><b>${f.axis.short}: revisa esto primero</b>${f.message}</p></div>`).join("");

    el.innerHTML = `
      <div class="diag-hero">
        <p class="a-eyebrow" data-a>Tu diagnóstico${first ? `, ${esc(first)}` : ""}</p>
        <div class="ring" data-a>
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#d4a5a0"/><stop offset="1" stop-color="#5b6b3a"/>
              </linearGradient>
            </defs>
            <circle class="ring__bg" cx="100" cy="100" r="84"/>
            <circle class="ring__fg" cx="100" cy="100" r="84" stroke-dasharray="${RING_C.toFixed(1)}" stroke-dashoffset="${(RING_C * (1 - dg.total / 100)).toFixed(1)}"/>
            <g class="ring__ticks">${tick(0.4)}${tick(0.75)}</g>
          </svg>
          <div class="ring__center">
            <span class="ring__num" data-num>${dg.total}</span>
            <span class="ring__of">de 100 puntos</span>
          </div>
        </div>
        <span class="level-badge lvl-${dg.level.id}" data-badge>Nivel ${dg.level.name}</span>
        <div class="levels-scale" data-a>
          ${D.levels.map((l) => `<span class="${l.id === dg.level.id ? "is-on" : ""}">${l.name}</span>`).join("")}
        </div>
      </div>
      <div class="stack gap-s">${alerts}</div>
      <div style="margin-top:1.4rem">
        <p class="g-section-title" data-a>Tu nivel en cada eje</p>
        <div class="axis-list">
          ${dg.axes.map((r) => `
            <div class="axis-row" data-a>
              <span class="axis-row__icon">${I(r.axis.icon)}</span>
              <div>
                <p class="axis-row__name">${r.axis.short}</p>
                <div class="axis-row__bar"><i class="lvl-${r.level.id}" style="width:${r.pct}%"></i></div>
                <p class="axis-row__lvl">${r.level.name}${r.flags.length ? " · requiere atención" : ""}</p>
              </div>
              <span class="axis-row__pct"><span data-pct="${r.pct}">${r.pct}</span><small>%</small></span>
            </div>`).join("")}
        </div>
      </div>
      <div class="stack gap-s" style="margin-top:1.6rem">
        <button class="btn" type="button" data-go="plan" data-a>Ver mi plan de mejora ${I("arrow")}</button>
        <button class="btn btn--ghost" type="button" data-action="retake" data-a>Volver a evaluarme</button>
      </div>`;
  };
  enter.diagnosis = (el, d) => {
    if (!anim) return;
    const dg = diagnose();
    const num = $("[data-num]", el);
    const o = { v: 0 };
    gsap.fromTo($(".ring__fg", el), { strokeDashoffset: RING_C }, { strokeDashoffset: RING_C * (1 - dg.total / 100), duration: 2.2, ease: "expo.out", delay: d + 0.2 });
    gsap.to(o, { v: dg.total, duration: 2.2, ease: "expo.out", delay: d + 0.2, onUpdate: () => (num.textContent = Math.round(o.v)) });
    gsap.from($("[data-badge]", el), { scale: 0.3, opacity: 0, duration: 0.9, ease: "back.out(2.4)", delay: d + 1.1 });
    gsap.from($$(".axis-row__bar i", el), { scaleX: 0, duration: 1.6, stagger: 0.08, ease: "expo.out", delay: d + 0.6 });
    $$("[data-pct]", el).forEach((s, i) => {
      const t = +s.dataset.pct, p = { v: 0 };
      gsap.to(p, { v: t, duration: 1.6, ease: "expo.out", delay: d + 0.6 + i * 0.08, onUpdate: () => (s.textContent = Math.round(p.v)) });
    });
    if (dg.level.id === "avanzado") gsap.delayedCall(d + 1.2, () => confetti(60));
  };

  /* ---------- 6. Plan de guías ---------- */
  render.plan = (el) => {
    const plan = buildPlan();
    const cards = plan.map((it, i) => {
      const { guide: g, res, priority, progress } = it;
      const chip = progress.complete
        ? `<span class="chip chip--done">${I("check")} Completa</span>`
        : `<span class="chip chip--${priority}">${D.priorities[priority].label}</span>`;
      return `
        <button class="g-card${i === 0 && !progress.complete ? " is-top" : ""}" type="button" data-guide="${g.id}" data-a>
          <span class="g-card__meta">${chip}<span class="chip">${I("clock")} ${g.minutes} min</span>${g.bonus ? `<span class="chip">Siguiente nivel</span>` : ""}</span>
          <span class="g-card__title">${g.title}</span>
          <span class="g-card__icon">${I(res.axis.icon)}</span>
          <span class="g-card__progress">
            <span class="g-card__track"><i style="width:${(progress.done / progress.total) * 100}%"></i></span>
            ${progress.done}/${progress.total}
          </span>
        </button>`;
    }).join("");
    el.innerHTML = `
      <div class="stack gap-s" style="margin:0.6rem 0 1.4rem">
        <p class="a-eyebrow" data-a>Tu plan de mejora · Fruver</p>
        <h1 class="a-title" data-a>Empieza<br>por <em>aquí.</em></h1>
        <p class="a-lead" data-a>Ordenado según tu diagnóstico: lo más urgente primero.</p>
      </div>
      <div class="g-list">${cards}</div>`;
  };

  /* ---------- 7. Detalle de guía ---------- */
  const CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`;
  render.guide = (el) => {
    const g = D.guides.find((x) => x.id === state.guide) || D.guides[0];
    const ax = axisById(g.axis);
    const item = buildPlan().find((p) => p.guide.id === g.id);
    const checks = guideChecks(g);
    const c = state.calc;
    el.innerHTML = `
      <header class="g-hero">
        <div class="g-hero__bar">
          <button class="icon-btn" type="button" data-go="plan" data-dir="-1" aria-label="Volver a mis guías">${I("back")}</button>
          <span class="chip" style="background:rgba(250,244,236,.12);color:var(--cream)">${ax.short}</span>
        </div>
        <span class="g-hero__icon" aria-hidden="true">${I(ax.icon)}</span>
        <h1 class="g-hero__title">${g.title}</h1>
        <div class="g-hero__meta">
          <span class="chip">${I("clock")} ${g.minutes} min</span>
          <span class="chip">${D.priorities[item.priority].label}</span>
        </div>
      </header>
      <div class="g-body">
        <p class="g-intro" data-a>${g.intro}</p>
        <div>
          <p class="g-section-title" data-a>Paso a paso</p>
          <ol class="steps">
            ${g.steps.map((s, i) => `
              <li class="step" data-a>
                <span class="step__num">${i + 1}</span>
                <div><p class="step__t">${s.t}</p><p class="step__d">${s.d}</p></div>
              </li>`).join("")}
          </ol>
        </div>
        ${g.calculator ? `
        <div data-a>
          <p class="g-section-title">Calcula tu huella del mes</p>
          <div class="calc">
            <label class="calc__row"><span>ACPM<small>litros al mes</small></span><input type="number" inputmode="decimal" min="0" data-calc="diesel" value="${esc(c.diesel)}" placeholder="0"></label>
            <label class="calc__row"><span>Gasolina<small>litros al mes</small></span><input type="number" inputmode="decimal" min="0" data-calc="gas" value="${esc(c.gas)}" placeholder="0"></label>
            <label class="calc__row"><span>Urea<small>kilos al mes</small></span><input type="number" inputmode="decimal" min="0" data-calc="urea" value="${esc(c.urea)}" placeholder="0"></label>
            <label class="calc__row"><span>Electricidad<small>kWh del recibo</small></span><input type="number" inputmode="decimal" min="0" data-calc="kwh" value="${esc(c.kwh)}" placeholder="0"></label>
            <div class="calc__out"><span>Tu huella estimada</span><span><b data-calc-out>0</b> kg CO₂e</span></div>
          </div>
        </div>` : ""}
        <div>
          <p class="g-section-title" data-a>Lista de chequeo · <span data-checkcount>${checks.filter(Boolean).length}/${checks.length}</span></p>
          <div class="checklist" role="group" aria-label="Lista de chequeo">
            ${g.checklist.map((t, i) => `
              <button class="check" type="button" role="checkbox" aria-checked="${!!checks[i]}" data-check="${i}" data-a>
                <span class="check__box">${CHECK_SVG}</span>
                <span class="check__label">${t}</span>
              </button>`).join("")}
          </div>
        </div>
        <div class="tip" data-a>${I("sparkle")}<p>${g.tip}</p></div>
        <p class="source" data-a>${g.source}</p>
        <button class="btn btn--ghost" type="button" data-go="plan" data-dir="-1" data-a>Volver a mis guías</button>
      </div>`;
    if (g.calculator) updateCalc(el, false);
  };
  enter.guide = (el, d) => {
    if (!anim) return;
    gsap.from($(".g-hero__icon", el), { rotation: -30, scale: 0.6, opacity: 0, duration: 1.4, ease: "expo.out", delay: d });
    if (hasSplit) {
      const split = SplitText.create($(".g-hero__title", el), { type: "words", mask: "words" });
      gsap.from(split.words, { yPercent: 110, duration: 0.9, stagger: 0.04, ease: "expo.out", delay: d + 0.05, onComplete: () => split.revert() });
    }
  };

  function updateCalc(el, animate = true) {
    const n = (k) => Math.max(0, parseFloat(state.calc[k]) || 0);
    // Urea: N₂O directo e indirecto + CO₂ de hidrólisis (IPCC 2019, clima húmedo, GWP AR5)
    const kg = n("diesel") * 2.7 + n("gas") * 2.3 + n("urea") * 4.7 + n("kwh") * 0.13;
    const out = $("[data-calc-out]", el);
    if (!out) return;
    const fmt = (v) => Math.round(v).toLocaleString("es-CO");
    if (anim && animate) {
      const o = { v: parseFloat(out.dataset.v || 0) };
      gsap.to(o, { v: kg, duration: 0.8, ease: "expo.out", overwrite: true, onUpdate: () => (out.textContent = fmt(o.v)) });
    } else out.textContent = fmt(kg);
    out.dataset.v = kg;
  }

  function toggleCheck(btn) {
    const g = D.guides.find((x) => x.id === state.guide);
    if (!g) return;
    const i = +btn.dataset.check;
    const before = incentivesStatus().filter((x) => x.unlocked).map((x) => x.id);
    const checks = guideChecks(g).slice();
    checks[i] = !checks[i];
    state.checks[g.id] = checks;
    save();
    btn.setAttribute("aria-checked", String(checks[i]));
    const done = checks.filter(Boolean).length;
    $("[data-checkcount]", screens.guide).textContent = `${done}/${checks.length}`;
    if (anim) gsap.fromTo($(".check__box", btn), { scale: 0.7 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" });

    if (checks[i] && done === checks.length) {
      confetti(50);
      toast("¡Guía completa! Bien hecho", "star");
      const after = incentivesStatus().filter((x) => x.unlocked);
      const fresh = after.filter((x) => !before.includes(x.id));
      if (fresh.length) setTimeout(() => toast(`Desbloqueaste: ${fresh[0].title}`, fresh[0].icon), 2900);
    }
  }

  /* ---------- 8. Hoja de ruta ---------- */
  render.route = (el) => {
    const inc = incentivesStatus();
    const unlocked = inc.filter((x) => x.unlocked).length;
    const next = inc.find((x) => !x.unlocked);
    el.innerHTML = `
      <div class="stack gap-s" style="margin:0.6rem 0 1.4rem">
        <p class="a-eyebrow" data-a>Hoja de ruta</p>
        <h1 class="a-title" data-a>Crecer tiene<br><em>recompensa.</em></h1>
      </div>
      <div class="route-summary" data-a>
        <b><span data-unlocked>${unlocked}</span>/${inc.length}</b>
        <p>beneficios desbloqueados.${next ? ` Siguiente: <strong style="color:var(--rose-300)">${next.req.toLowerCase()}</strong>.` : " ¡Lo lograste todo!"}</p>
      </div>
      <div class="route" style="margin-top:1.6rem">
        <span class="route__line" aria-hidden="true"><span class="route__fill" style="height:${routeFill(inc)}%"></span></span>
        ${inc.map((x) => `
          <div class="reward${x.unlocked ? " is-unlocked" : ""}" data-a>
            <span class="reward__node">${I(x.unlocked ? x.icon : "lock")}</span>
            <div class="reward__card">
              <p class="reward__title">${x.title}</p>
              <p class="reward__req">${I(x.unlocked ? "check" : "lock")} ${x.unlocked ? "Desbloqueado" : x.req}</p>
            </div>
          </div>`).join("")}
      </div>
      <button class="btn" type="button" data-go="plan" style="margin-top:1.8rem" data-a>Seguir con mis guías ${I("arrow")}</button>`;
  };
  function routeFill(inc) {
    let last = -1;
    inc.forEach((x, i) => { if (x.unlocked) last = i; });
    return last <= 0 ? 0 : (last / (inc.length - 1)) * 100;
  }
  enter.route = (el, d) => {
    if (!anim) return;
    gsap.from($(".route__fill", el), { height: 0, duration: 1.6, ease: "expo.inOut", delay: d + 0.2 });
    gsap.from($$(".reward.is-unlocked .reward__node", el), { scale: 0, rotation: -90, duration: 0.9, stagger: 0.18, ease: "back.out(2.2)", delay: d + 0.3 });
  };

  /* ---------- 9. Ficha resumen ---------- */
  function fichaHTML() {
    const dg = diagnose();
    const plan = buildPlan(dg).filter((p) => !p.progress.complete).slice(0, 3);
    const date = new Date(state.finishedAt || Date.now()).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
    const dotColor = { inicial: "#d4a5a0", desarrollo: "#8a9760", avanzado: "#2f3a1f" };
    const actions = plan.map((p) => {
      const c = guideChecks(p.guide);
      const idx = c.findIndex((v) => !v);
      return `<li><span><b>${p.guide.title}:</b> ${p.guide.checklist[idx < 0 ? 0 : idx]}.</span></li>`;
    }).join("");
    return `
      <div class="ficha__head">
        <p class="brand ficha__brand">smile<span class="dot">.</span> <span style="font-family:var(--font-body);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--olive-300)">Academia Proveedores</span></p>
        <p class="ficha__who">${esc(state.name || "Productor(a)")}</p>
        <p class="ficha__sub">${state.farm ? esc(state.farm) + " · " : ""}Fruver · ${date}</p>
      </div>
      <div class="ficha__body">
        <div class="ficha__score">
          <div><p class="g-section-title" style="margin:0 0 .4rem">Nivel general</p><span class="level-badge lvl-${dg.level.id}">${dg.level.name}</span></div>
          <b>${dg.total}<small style="font-size:.9rem;color:var(--ink-soft)">/100</small></b>
        </div>
        <table class="ficha__table">
          ${dg.axes.map((r) => `<tr><td><span class="dotlvl" style="background:${dotColor[r.level.id]}"></span>${r.axis.short}</td><td>${r.pct}% · ${r.level.name}</td></tr>`).join("")}
        </table>
        <div>
          <p class="g-section-title">Mis próximas acciones</p>
          <ol class="ficha__actions">${actions || "<li><span>¡Todas las guías completas! Mantén tus prácticas y vuelve a evaluarte.</span></li>"}</ol>
        </div>
      </div>
      <div class="ficha__foot"><span>Grupo Smile · Red de Valor Compartido</span><span>Línea ICBF 141</span></div>`;
  }
  render.ficha = (el) => {
    el.innerHTML = `
      <div class="stack gap-s" style="margin:0.6rem 0 1.4rem">
        <p class="a-eyebrow" data-a>Ficha resumen</p>
        <h1 class="a-title" data-a>Tu plan,<br><em>siempre contigo.</em></h1>
        <p class="a-lead" data-a>Guárdala o imprímela para consultarla sin internet.</p>
      </div>
      <article class="ficha" data-a>${fichaHTML()}</article>
      <div class="stack gap-s" style="margin-top:1.4rem">
        <button class="btn" type="button" data-action="print" data-a>${I("download")} Descargar o imprimir</button>
        <p class="ficha-note" data-a>En el celular elige “Guardar como PDF” en el menú de impresión.</p>
        <button class="btn btn--ghost" type="button" data-action="whatsapp" data-a>${I("chat")} Enviar por WhatsApp</button>
        <p class="ficha-note" data-a>Solo texto, pesa menos de 1 KB. Compártela con tu asociación o con el técnico que te acompaña.</p>
        <button class="btn btn--ghost" type="button" data-action="reset" data-a>Reiniciar demo</button>
      </div>`;
  };

  /* ==========================================================
     ACCIONES
     ========================================================== */
  function reset() {
    state = fresh();
    try { localStorage.removeItem(KEY); } catch (_) {}
    go("welcome", { dir: -1 });
    toast("Demo reiniciada", "sparkle");
  }

  function fillSample() {
    state = {
      ...fresh(),
      name: state.name || "Rosa",
      farm: state.farm || "Finca La Esperanza",
      category: "fruver",
      answers: { q1: "si", q2: "aveces", q3: "aveces", q4: "no", q5: "no", q6: "si", q7: "si", q8: "si", q9: "aveces", q10: "si" },
      qIndex: N - 1,
      done: true,
      finishedAt: Date.now(),
    };
    save();
    go("loading");
  }

  // Ficha en texto plano para WhatsApp: canal que el productor ya usa, sin descargar nada
  function fichaText() {
    const dg = diagnose();
    const plan = buildPlan(dg).filter((p) => !p.progress.complete).slice(0, 3);
    return [
      `*Mi plan de mejora · Academia Proveedores Smile*`,
      `${state.name || "Productor(a)"}${state.farm ? " · " + state.farm : ""} · Fruver`,
      ``,
      `Nivel general: ${dg.level.name} (${dg.total}/100)`,
      ...dg.axes.map((r) => `- ${r.axis.short}: ${r.pct}% · ${r.level.name}`),
      ``,
      `*Próximas acciones*`,
      ...(plan.length ? plan.map((p, i) => {
        const idx = guideChecks(p.guide).findIndex((v) => !v);
        return `${i + 1}. ${p.guide.title}: ${p.guide.checklist[idx < 0 ? 0 : idx]}`;
      }) : ["Todas las guías completas. Mantén tus prácticas y vuelve a evaluarte."]),
    ].join("\n");
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(fichaText())}`, "_blank", "noopener");
  }

  function printFicha() {
    $("#print-root").innerHTML = `<article class="ficha">${fichaHTML()}</article>`;
    window.print();
  }

  // Ondas al tocar botones
  document.addEventListener("pointerdown", (e) => {
    if (!anim) return;
    const b = e.target.closest(".btn, .tile, .g-card");
    if (!b) return;
    const r = b.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const rp = document.createElement("span");
    rp.className = "ripple";
    Object.assign(rp.style, { width: size + "px", height: size + "px", left: e.clientX - r.left + "px", top: e.clientY - r.top + "px" });
    b.appendChild(rp);
    gsap.to(rp, { scale: 1, opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => rp.remove() });
  });

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go],[data-action],[data-cat],[data-locked],[data-guide],[data-tab],[data-ans],[data-check]");
    if (!t) return;

    if (t.dataset.ans) return onAnswer(t, e);
    if (t.dataset.check !== undefined) return toggleCheck(t);
    if (t.dataset.go) return go(t.dataset.go, t.dataset.dir ? { dir: +t.dataset.dir } : {});
    if (t.dataset.tab) {
      const from = TABS.indexOf(current === "guide" ? "plan" : current);
      const to = TABS.indexOf(t.dataset.tab);
      if (current === t.dataset.tab) return;
      return go(t.dataset.tab, { dir: to >= from ? 1 : -1 });
    }
    if (t.dataset.cat) {
      state.category = t.dataset.cat;
      if (state.done) { state.answers = {}; state.qIndex = 0; state.done = false; }
      save();
      return go("quiz");
    }
    if (t.dataset.locked) {
      if (anim) gsap.fromTo(t, { x: -6 }, { x: 0, duration: 0.6, ease: "elastic.out(1.2, 0.3)" });
      return toast(`${t.dataset.locked} llegará pronto`, "lock");
    }
    if (t.dataset.guide) {
      state.guide = t.dataset.guide;
      save(false);
      return go("guide");
    }
    switch (t.dataset.action) {
      case "q-back":
        if (answering) return;
        if (state.qIndex > 0) { state.qIndex--; save(false); changeQuestion(-1); }
        else go("category", { dir: -1 });
        break;
      case "retake":
        state.answers = {}; state.qIndex = 0; state.done = false; save();
        go("quiz");
        break;
      case "sample": fillSample(); break;
      case "reset": reset(); break;
      case "print": printFicha(); break;
      case "whatsapp": shareWhatsApp(); break;
    }
  });

  // Campos de texto y calculadora
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.id === "f-name") { state.name = t.value; save(false); }
    if (t.id === "f-farm") { state.farm = t.value; save(false); }
    if (t.dataset.calc) { state.calc[t.dataset.calc] = t.value; save(false); updateCalc(screens.guide); }
  });

  /* ==========================================================
     ARRANQUE: restaurar donde quedó
     ========================================================== */
  $$("[data-icon]").forEach((el) => { el.innerHTML = I(el.dataset.icon); });
  setNetState();

  let start = state.screen;
  if (!screens[start] || start === "loading") start = state.done ? "diagnosis" : "welcome";
  if (["diagnosis", "plan", "guide", "route", "ficha"].includes(start) && !state.done) start = "welcome";
  if (start === "guide" && !state.guide) start = "plan";
  if (start === "quiz" && !state.category) start = "category";
  go(start);

  if (anim) {
    gsap.from(".phone", { y: 60, rotation: 2, opacity: 0, duration: 1.4, ease: "expo.out" });
    gsap.from(".stage__info > *", { y: 40, opacity: 0, duration: 1.2, stagger: 0.08, ease: "expo.out", delay: 0.1 });
  }
})();
