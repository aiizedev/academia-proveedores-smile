/* ==========================================================
   Landing — motion
   GSAP 3.13 (ScrollTrigger, SplitText, DrawSVG) + Lenis
   ========================================================== */
(() => {
  const html = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Utilidades sin dependencias ---------- */
  function injectIcons() {
    $$("[data-icon]").forEach((el) => {
      const svg = window.ICONS && window.ICONS[el.dataset.icon];
      if (svg) el.innerHTML = `<span class="ico">${svg}</span>`;
    });
  }

  // Divide el texto en caracteres para el efecto "btn-animate-chars"
  function splitChars() {
    $$("[data-chars]").forEach((el) => {
      const text = el.textContent.trim();
      el.setAttribute("aria-label", text);
      el.innerHTML = [...text]
        .map((c, i) => `<span class="ch" aria-hidden="true" style="--ci:${i}">${c === " " ? "&nbsp;" : c}</span>`)
        .join("");
    });
  }

  function basicMenu() {
    const btn = $(".nav__burger");
    const menu = $("#menu");
    const nav = $(".nav");
    const set = (open) => {
      btn.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      menu.style.visibility = open ? "visible" : "hidden";
      $(".menu__tile").style.clipPath = open ? "none" : "";
      nav.classList.toggle("is-menu-open", open);
    };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    $$(".menu a").forEach((a) => a.addEventListener("click", () => set(false)));
  }

  function fallback() {
    html.classList.add("no-anim");
    html.classList.remove("is-loading");
    const pre = $(".preloader");
    if (pre) pre.remove();
    basicMenu();
  }

  injectIcons();
  splitChars();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const libsReady = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  if (!libsReady || reduceMotion) {
    fallback();
    return;
  }

  try {
    init();
  } catch (err) {
    console.error("[landing] animación desactivada:", err);
    fallback();
  }

  /* ==========================================================
     INIT
     ========================================================== */
  function init() {
    const hasSplit = typeof SplitText !== "undefined";
    const hasDraw = typeof DrawSVGPlugin !== "undefined";
    gsap.registerPlugin(ScrollTrigger, ...(hasSplit ? [SplitText] : []), ...(hasDraw ? [DrawSVGPlugin] : []));
    gsap.defaults({ ease: "expo.out", duration: 1.1 });

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* ---------- Lenis (scroll suave) ---------- */
    let lenis = null;
    if (typeof Lenis !== "undefined") {
      lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
    }
    const scrollTo = (target) => {
      if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
      else $(target)?.scrollIntoView({ behavior: "smooth" });
    };

    /* ---------- Nav ---------- */
    const nav = $(".nav");
    let menuOpen = false;

    if (lenis) {
      lenis.on("scroll", ({ direction, scroll }) => {
        if (menuOpen) return;
        nav.classList.toggle("is-hidden", direction === 1 && scroll > 240);
      });
    }

    // Color del nav según la sección que tiene debajo
    const darkActive = new Set();
    $$(".manifesto, .how, .cta, .footer").forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec,
        start: "top 44px",
        end: "bottom 44px",
        onToggle: (self) => {
          self.isActive ? darkActive.add(sec) : darkActive.delete(sec);
          nav.classList.toggle("is-dark", darkActive.size > 0);
        },
      });
    });

    /* ---------- Menú pantalla completa ---------- */
    const menu = $("#menu");
    const burger = $(".nav__burger");
    const menuTl = gsap.timeline({ paused: true, defaults: { ease: "expo.inOut" } })
      .set(menu, { visibility: "visible" })
      .fromTo(".menu__tile",
        { clipPath: "inset(0% 0% 100% 0% round 0px 0px 60px 60px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)", duration: 0.95 })
      .from(".menu__link", { yPercent: 115, rotate: 3, duration: 1, stagger: 0.055, ease: "expo.out" }, 0.45)
      .from(".menu__num", { opacity: 0, x: -10, duration: 0.6, stagger: 0.055, ease: "power2.out" }, 0.55)
      .from(".menu__nav li", { borderColor: "rgba(250,244,236,0)", duration: 0.6, stagger: 0.05 }, 0.5)
      .from(".menu__aside > *", { y: 30, opacity: 0, duration: 0.9, stagger: 0.07, ease: "expo.out" }, 0.6);

    function toggleMenu(open = !menuOpen) {
      menuOpen = open;
      burger.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      nav.classList.toggle("is-menu-open", open);
      nav.classList.remove("is-hidden");
      if (open) {
        lenis?.stop();
        menuTl.timeScale(1).play();
      } else {
        lenis?.start();
        menuTl.timeScale(1.6).reverse();
      }
    }
    burger.addEventListener("click", () => toggleMenu());
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) toggleMenu(false); });

    // Anclas internas con Lenis
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2 || !$(id)) return;
        e.preventDefault();
        if (menuOpen) {
          toggleMenu(false);
          gsap.delayedCall(0.55, () => scrollTo(id));
        } else scrollTo(id);
      });
    });

    /* ---------- Cursor burbuja ---------- */
    if (finePointer) {
      const dot = $(".cursor__dot");
      const bubble = $(".cursor__bubble");
      const text = $(".cursor__text");
      const dx = gsap.quickTo(dot, "x", { duration: 0.18, ease: "power3" });
      const dy = gsap.quickTo(dot, "y", { duration: 0.18, ease: "power3" });
      const bx = gsap.quickTo(bubble, "x", { duration: 0.6, ease: "power3" });
      const by = gsap.quickTo(bubble, "y", { duration: 0.6, ease: "power3" });
      window.addEventListener("pointermove", (e) => {
        dx(e.clientX); dy(e.clientY); bx(e.clientX); by(e.clientY);
      });
      $$("[data-cursor]").forEach((el) => {
        el.addEventListener("pointerenter", () => {
          text.textContent = el.dataset.cursor;
          gsap.to(bubble, { scale: 1, duration: 0.6, ease: "expo.out", overwrite: "auto" });
          gsap.to(dot, { scale: 0, duration: 0.3, overwrite: "auto" });
        });
        el.addEventListener("pointerleave", () => {
          gsap.to(bubble, { scale: 0, duration: 0.45, ease: "expo.out", overwrite: "auto" });
          gsap.to(dot, { scale: 1, duration: 0.3, overwrite: "auto" });
        });
      });
      html.classList.add("has-cursor");

      // Botones magnéticos
      $$(".btn-pill").forEach((btn) => {
        const mx = gsap.quickTo(btn, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
        const my = gsap.quickTo(btn, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
        btn.addEventListener("pointermove", (e) => {
          const r = btn.getBoundingClientRect();
          mx((e.clientX - (r.left + r.width / 2)) * 0.22);
          my((e.clientY - (r.top + r.height / 2)) * 0.32);
        });
        btn.addEventListener("pointerleave", () => { mx(0); my(0); });
      });
    }

    /* ---------- Preloader + entrada del hero ---------- */
    let seen = false;
    try { seen = sessionStorage.getItem("smile-intro") === "1"; } catch (_) {}
    const speed = seen ? 2.6 : 1;

    const heroWords = $$(".hero__word");
    gsap.set(heroWords, { yPercent: 112 });
    const heroImgW = getComputedStyle($(".hero__img")).width; // respeta el ancho responsive del CSS
    gsap.set(".hero__img", { width: 0 });
    gsap.set(".hero [data-reveal]", { y: 26, opacity: 0 });
    gsap.set(nav, { yPercent: -120 });

    const petals = $$(".petal");
    const counter = { v: 0 };
    const countEl = $("[data-count]");

    const intro = gsap.timeline({
      onComplete: () => {
        html.classList.remove("is-loading");
        $(".preloader")?.remove();
        lenis?.start();
        ScrollTrigger.refresh();
        try { sessionStorage.setItem("smile-intro", "1"); } catch (_) {}
      },
    });
    intro.timeScale(speed);

    if (hasDraw) gsap.set(petals, { drawSVG: "0% 0%" });

    intro
      .to(counter, {
        v: 100, duration: 2.1, ease: "power2.inOut",
        onUpdate: () => { countEl.textContent = Math.round(counter.v); },
      }, 0)
      .to(petals, hasDraw ? { drawSVG: "0% 100%", duration: 1.3, stagger: 0.14, ease: "power2.inOut" } : { opacity: 1, duration: 0.6 }, 0.1)
      .to(petals, { fillOpacity: 0.95, duration: 0.7, stagger: 0.1, ease: "power2.out" }, 1.05)
      .to(".preloader__seed", { scale: 1, duration: 0.8, ease: "back.out(3)" }, 1.4)
      .from(".preloader__word", { yPercent: 100, opacity: 0, duration: 1, ease: "expo.out" }, 1.25)
      // los pétalos se abren y giran
      .to(".preloader__petals", { rotate: 45, duration: 1.1, ease: "expo.inOut", svgOrigin: "0 0" }, 2.15)
      .to(petals, { y: -60, opacity: 0, duration: 0.9, ease: "expo.in" }, 2.35)
      .to(".preloader__seed", { scale: 0, duration: 0.5, ease: "power3.in" }, 2.55)
      .to(".preloader__word, .preloader__count", { yPercent: -60, opacity: 0, duration: 0.6, ease: "power3.in" }, 2.45)
      .fromTo(".preloader",
        { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)" },
        { clipPath: "inset(0% 0% 100% 0% round 0px 0px 80px 80px)", duration: 1.15, ease: "expo.inOut" }, 2.85)
      // hero
      .to(heroWords, { yPercent: 0, duration: 1.5, stagger: 0.11, ease: "expo.out" }, 3.45)
      .to(".hero__img", { width: heroImgW, duration: 1.6, ease: "expo.inOut", clearProps: "width" }, 3.5)
      .from(".hero__img-inner", { scale: 1.5, duration: 2, ease: "expo.out" }, 3.6)
      .to(".hero [data-reveal]", { y: 0, opacity: 1, duration: 1.2, stagger: 0.08 }, 3.9)
      .to(nav, { yPercent: 0, duration: 1.2, clearProps: "transform" }, 3.9);

    /* ---------- Ticker de categorías (hero) ---------- */
    const track = $(".ticker__track");
    if (track) {
      const n = track.children.length - 1; // el último duplica el primero
      const tickTl = gsap.timeline({ repeat: -1, delay: 4 / speed });
      for (let i = 1; i <= n; i++) {
        tickTl.to(track, { yPercent: (-100 / (n + 1)) * i, duration: 0.85, ease: "expo.inOut" }, `+=1.3`);
      }
      tickTl.set(track, { yPercent: 0 });
    }

    /* ---------- Hero: salida con scroll ---------- */
    const heroOut = gsap.timeline({
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      defaults: { ease: "none" },
    });
    heroOut
      .to(".hero__row:nth-child(1)", { xPercent: -7 }, 0)
      .to(".hero__row:nth-child(3)", { xPercent: 7 }, 0)
      .to(".hero__img-inner", { yPercent: 14 }, 0)
      .to(".scene__sun", { y: 40 }, 0)
      .to(".hero__bottom", { opacity: 0, y: -40 }, 0);

    /* ---------- Titulares con máscara por línea ---------- */
    document.fonts.ready.then(() => {
      if (hasSplit) {
        $$("[data-split]").forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line-inner",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                rotate: 2.5,
                duration: 1.3,
                stagger: 0.1,
                scrollTrigger: { trigger: el, start: "top 86%", once: true },
              }),
          });
        });

        // Manifiesto: palabras que se encienden con el scroll
        const mText = $(".manifesto__text");
        SplitText.create(mText, {
          type: "words",
          wordsClass: "w",
          autoSplit: true,
          onSplit: (self) =>
            gsap.to(self.words, {
              opacity: 1,
              stagger: 0.08,
              ease: "none",
              scrollTrigger: { trigger: mText, start: "top 78%", end: "bottom 42%", scrub: 0.6 },
            }),
        });

        // Footer: letras gigantes
        const fw = $(".footer__display-word");
        SplitText.create(fw, { type: "chars", charsClass: "ch" });
        gsap.from($$(".ch", fw), {
          yPercent: 100,
          duration: 1.4,
          stagger: 0.06,
          scrollTrigger: { trigger: ".footer__display", start: "top 92%", once: true },
        });
      } else {
        $$(".manifesto__text").forEach((el) => (el.style.opacity = 1));
        $$(".manifesto__text .w").forEach((w) => (w.style.opacity = 1));
      }
      gsap.from(".footer__display .dot", {
        y: "-1.2em", opacity: 0, duration: 1.2, ease: "bounce.out",
        scrollTrigger: { trigger: ".footer__display", start: "top 92%", once: true },
        delay: 0.5,
      });
      ScrollTrigger.refresh();
    });

    /* ---------- Revelados genéricos ---------- */
    ScrollTrigger.batch("main section:not(.hero) [data-reveal]", {
      start: "top 90%",
      once: true,
      onEnter: (els) => gsap.fromTo(els, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.08 }),
    });

    /* ---------- Manifiesto: parallax + trazos ---------- */
    gsap.to(".manifesto__bg", {
      yPercent: 18, rotate: 6, ease: "none",
      scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: true },
    });
    if (hasDraw) {
      gsap.from(".manifesto__leaves path", {
        drawSVG: "0%", stagger: 0.15, ease: "none",
        scrollTrigger: { trigger: ".manifesto", start: "top 70%", end: "bottom 60%", scrub: 1 },
      });
      gsap.from(".manifesto__sprout .draw", {
        drawSVG: "0%", duration: 1.6, stagger: 0.25, ease: "power2.inOut",
        scrollTrigger: { trigger: ".manifesto__foot", start: "top 88%", once: true },
      });
    }
    gsap.from(".manifesto__foot p", {
      y: 30, opacity: 0, duration: 1.2,
      scrollTrigger: { trigger: ".manifesto__foot", start: "top 88%", once: true },
    });

    /* ---------- Tarjetas de ejes ---------- */
    ScrollTrigger.batch(".axis-card", {
      start: "top 88%",
      once: true,
      onEnter: (els) =>
        gsap.fromTo(els,
          { y: 80, opacity: 0, rotate: 1.5 },
          { y: 0, opacity: 1, rotate: 0, duration: 1.4, stagger: 0.09, clearProps: "transform" }),
    });

    // Inclinación sutil siguiendo el puntero
    if (finePointer) {
      $$(".axis-card").forEach((card) => {
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.7, ease: "power3" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.7, ease: "power3" });
        gsap.set(card, { transformPerspective: 900 });
        card.addEventListener("pointermove", (e) => {
          const r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 7);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
        });
        card.addEventListener("pointerleave", () => { rx(0); ry(0); });
      });
    }

    /* ---------- Cómo funciona: scroll horizontal ---------- */
    const mm = gsap.matchMedia();
    mm.add("(min-width: 861px)", () => {
      const howTrack = $(".how__track");
      const dist = () => howTrack.scrollWidth - window.innerWidth;
      const horiz = gsap.to(howTrack, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: ".how",
          start: "top top",
          end: () => "+=" + dist(),
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => gsap.set(".how__progress-bar", { scaleX: self.progress }),
        },
      });

      $$(".how__panel:not(.how__panel--intro)").forEach((panel) => {
        const mock = $(".mock", panel);
        const step = $(".how__step", panel);
        gsap.fromTo(mock,
          { rotate: 9, y: 90, scale: 0.9 },
          { rotate: -3, y: 0, scale: 1, ease: "none",
            scrollTrigger: { trigger: panel, containerAnimation: horiz, start: "left 95%", end: "center 55%", scrub: true } });
        gsap.from(step.children, {
          x: 80, opacity: 0, stagger: 0.08, duration: 1.2,
          scrollTrigger: { trigger: panel, containerAnimation: horiz, start: "left 70%", once: true },
        });
      });

      // Anillo del diagnóstico
      gsap.fromTo(".mock__ring-fg", { strokeDashoffset: 301.6 }, {
        strokeDashoffset: 96.5, duration: 1.8, ease: "expo.out",
        scrollTrigger: { trigger: ".mock--diag", containerAnimation: horiz, start: "left 70%", once: true },
      });
      gsap.from(".mock__bars span", {
        scaleX: 0, transformOrigin: "0 50%", stagger: 0.08, duration: 1.2,
        scrollTrigger: { trigger: ".mock--diag", containerAnimation: horiz, start: "left 70%", once: true },
      });
      gsap.from(".mock__guide", {
        x: 60, opacity: 0, stagger: 0.12, duration: 1.1,
        scrollTrigger: { trigger: ".mock--guides", containerAnimation: horiz, start: "left 75%", once: true },
      });
    });
    mm.add("(max-width: 860px)", () => {
      $$(".how__panel").forEach((panel) => {
        gsap.from(panel.children, {
          y: 60, opacity: 0, stagger: 0.12, duration: 1.2,
          scrollTrigger: { trigger: panel, start: "top 85%", once: true },
        });
      });
    });

    /* ---------- Categorías: vista previa que sigue al cursor ---------- */
    const preview = $(".cats__preview");
    if (finePointer && preview) {
      const px = gsap.quickTo(preview, "x", { duration: 0.65, ease: "power3" });
      const py = gsap.quickTo(preview, "y", { duration: 0.65, ease: "power3" });
      const prot = gsap.quickTo(preview, "rotation", { duration: 0.8, ease: "power3" });
      const pIcon = $(".cats__preview-icon", preview);
      const pLabel = $(".cats__preview-label", preview);
      let lastX = 0;
      const list = $(".cats__list");
      list.addEventListener("pointermove", (e) => {
        px(e.clientX + 40); py(e.clientY);
        prot(gsap.utils.clamp(-14, 14, (e.clientX - lastX) * 0.6));
        lastX = e.clientX;
      });
      $$(".cat-row").forEach((row) => {
        row.addEventListener("pointerenter", (e) => {
          const key = row.dataset.preview;
          preview.dataset.tone = row.dataset.tone;
          pIcon.innerHTML = `<span class="ico">${window.ICONS[key] || ""}</span>`;
          pLabel.textContent = row.classList.contains("is-pilot") ? "Piloto activo" : "Muy pronto";
          if (!gsap.getProperty(preview, "scale")) { gsap.set(preview, { x: e.clientX + 40, y: e.clientY }); }
          gsap.to(preview, { scale: 1, opacity: 1, duration: 0.6, ease: "expo.out", overwrite: "auto" });
          gsap.fromTo(pIcon, { scale: 0.6, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.7, ease: "back.out(2)" });
        });
      });
      list.addEventListener("pointerleave", () =>
        gsap.to(preview, { scale: 0, opacity: 0, duration: 0.45, ease: "expo.out", overwrite: "auto" }));
    }
    ScrollTrigger.batch(".cat-row", {
      start: "top 92%",
      once: true,
      onEnter: (els) => gsap.from(els, { y: 50, opacity: 0, duration: 1.2, stagger: 0.07 }),
    });

    /* ---------- Hoja de ruta ---------- */
    if (hasDraw) {
      gsap.fromTo(".roadmap__path", { drawSVG: "0%" }, {
        drawSVG: "100%", ease: "none",
        scrollTrigger: { trigger: ".roadmap", start: "top 62%", end: "bottom 62%", scrub: 0.6 },
      });
    }
    $$(".milestone").forEach((m) => {
      ScrollTrigger.create({
        trigger: m, start: "top 62%",
        onEnter: () => m.classList.add("is-active"),
        onLeaveBack: () => m.classList.remove("is-active"),
      });
      gsap.from(m.children[1], {
        x: 50, opacity: 0, duration: 1.3,
        scrollTrigger: { trigger: m, start: "top 82%", once: true },
      });
    });

    /* ---------- Contadores ---------- */
    $$("[data-counter]").forEach((el) => {
      const target = +el.dataset.counter;
      const o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: () => gsap.to(o, {
          v: target, duration: 2, ease: "power3.out",
          onUpdate: () => (el.textContent = Math.round(o.v)),
        }),
      });
    });
    gsap.from(".stat", {
      y: 40, opacity: 0, stagger: 0.1, duration: 1.2,
      scrollTrigger: { trigger: ".stats", start: "top 88%", once: true },
    });

    /* ---------- Marquee de aliados (reacciona a la velocidad del scroll) ---------- */
    const marquees = $$(".marquee").map((mq) => {
      const first = $(".marquee__track", mq);
      const clone = first.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      mq.appendChild(clone);
      const dir = +mq.dataset.dir || 1;
      const tracks = $$(".marquee__track", mq);
      const tl = gsap.fromTo(tracks,
        { xPercent: dir > 0 ? 0 : -100 },
        { xPercent: dir > 0 ? -100 : 0, duration: 38, ease: "none", repeat: -1 });
      return tl;
    });
    if (lenis) {
      let boost = 0;
      lenis.on("scroll", ({ velocity }) => { boost = gsap.utils.clamp(-6, 6, velocity * 0.35); });
      gsap.ticker.add(() => {
        boost *= 0.92;
        const ts = 1 + Math.abs(boost);
        const sign = boost < -0.3 ? -1 : 1;
        marquees.forEach((tl) => tl.timeScale(ts * sign));
      });
    }

    /* ---------- CTA: el fondo cambia a oliva oscuro ---------- */
    gsap.fromTo(document.body, { backgroundColor: "#faf4ec" }, {
      backgroundColor: "#2f3a1f", ease: "none",
      scrollTrigger: { trigger: ".cta", start: "top 85%", end: "top 25%", scrub: true },
    });
    gsap.from(".cta .btn-pill, .cta .eyebrow", {
      y: 40, opacity: 0, stagger: 0.1, duration: 1.2,
      scrollTrigger: { trigger: ".cta", start: "top 60%", once: true },
    });
    gsap.from(".footer__cols > div", {
      y: 40, opacity: 0, stagger: 0.1, duration: 1.2,
      scrollTrigger: { trigger: ".footer", start: "top 90%", once: true },
    });

    // Recalcular cuando carguen fuentes/imágenes
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }
})();
