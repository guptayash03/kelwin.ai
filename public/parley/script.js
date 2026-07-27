// ============================================================
// PARLEY home — merged interactions
// nav hide/show + hero expand (from parley-hero), why-cards hover
// settle (from parley-cards-v2), delegation scrollytelling (from
// parley-hero), testimonial marquee duplication, pricing toggle,
// how-it-works scroll pan, FAQ accordion animation.
// ============================================================

(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ============ NAV: hide on scroll down, show on scroll up; bg-aware ============
  const navBar = document.querySelector(".parley-page .nav-bar");
  const heroSection = document.getElementById("hero");
  if (navBar) {
    const REVEAL_AT_TOP = 80;
    const DELTA = 6;
    let lastY = window.scrollY;
    let lastDir = 0;

    const onNav = () => {
      const y = window.scrollY;
      const dy = y - lastY;

      if (y <= REVEAL_AT_TOP) {
        navBar.classList.remove("is-hidden");
        lastDir = 0;
      } else if (Math.abs(dy) >= DELTA) {
        const dir = dy > 0 ? 1 : -1;
        if (dir !== lastDir) {
          if (dir === 1) navBar.classList.add("is-hidden");
          else navBar.classList.remove("is-hidden");
          lastDir = dir;
        }
      }

      if (heroSection) {
        const navH = navBar.offsetHeight || 60;
        const heroBottomInViewport = heroSection.getBoundingClientRect().bottom;
        navBar.classList.toggle("is-over-hero", heroBottomInViewport > navH);
      }

      lastY = y;
    };
    window.addEventListener("scroll", onNav, { passive: true });
    onNav();
  }

  // ============ HERO BG IMAGE EXPANSION (scroll, no hijack) ============
  const hero = document.getElementById("hero");
  const media = document.getElementById("hero-media");
  const heroImg = document.querySelector(".parley-page .hero__img");

  if (hero && media && heroImg && !reduced) {
    const INITIAL_H = 600;
    const INITIAL_RADIUS = 18;
    const INITIAL_IMG_SCALE = 1.8;
    const FINAL_IMG_SCALE = 1.0;

    const lerp = (a, b, t) => a + (b - a) * t;

    const sticky = hero.querySelector(".hero__sticky");

    const updateHero = () => {
      const scrolled = Math.max(0, window.scrollY);
      const p = Math.min(1, scrolled / 500);
      const eased = p * p * (3 - 2 * p);

      const vw = window.innerWidth;
      const heroH = hero.offsetHeight;
      // Actual left edge of the hero's positioning context. Accounts for
      // both the centered 1200 container AND its responsive side padding.
      const containerL = Math.max(0, sticky.getBoundingClientRect().left);
      const startW = vw - containerL * 2;
      const finalW = vw;

      const w = lerp(startW, finalW, eased);
      const h = lerp(INITIAL_H, heroH, eased);
      const l = lerp(0, -containerL, eased);
      const t = lerp(0, -80, eased);
      const radius = lerp(INITIAL_RADIUS, 0, eased);
      const imgScale = lerp(INITIAL_IMG_SCALE, FINAL_IMG_SCALE, eased);

      media.style.setProperty("--w", `${w}px`);
      media.style.setProperty("--h", `${h}px`);
      media.style.setProperty("--l", `${l}px`);
      media.style.setProperty("--t", `${t}px`);
      media.style.setProperty("--radius", `${radius}px`);
      heroImg.style.setProperty("--img-scale", imgScale.toFixed(3));
    };

    let heroTick = false;
    const onHeroScroll = () => {
      if (heroTick) return;
      heroTick = true;
      requestAnimationFrame(() => {
        updateHero();
        heroTick = false;
      });
    };

    window.addEventListener("scroll", onHeroScroll, { passive: true });
    window.addEventListener("resize", onHeroScroll, { passive: true });
    updateHero();
  }

  // ============ WHY-CARDS: sticky hover (exact framer Benefit cards) ============
  const whyRow = document.getElementById("why-cards");
  if (whyRow) {
    const wcards = Array.from(whyRow.querySelectorAll(".wcard"));
    const activate = (card) => {
      if (card.classList.contains("is-active")) return;
      wcards.forEach((c) => c.classList.toggle("is-active", c === card));
    };
    wcards.forEach((card) => {
      card.addEventListener("pointerenter", () => activate(card));
      card.addEventListener("focus", () => activate(card));
    });
  }

  // ============ DELEGATION STEP DETECTION ============
  const scroll = document.getElementById("delegation-scroll");
  if (scroll) {
    const buttons = Array.from(document.querySelectorAll(".parley-page .feature__btn"));
    const mocks = Array.from(document.querySelectorAll(".parley-page .mock"));
    const triggers = Array.from(document.querySelectorAll(".parley-page .trigger"));
    const stepCount = buttons.length;

    let currentStep = 0;
    let lockUntil = 0;

    const setStep = (next) => {
      next = Math.max(0, Math.min(stepCount - 1, next));
      if (next === currentStep) return;
      currentStep = next;

      buttons.forEach((b, i) => {
        b.setAttribute("aria-selected", i === next ? "true" : "false");
      });
      mocks.forEach((m, i) => {
        const active = i === next;
        m.classList.toggle("is-active", active);
        if (active) m.removeAttribute("hidden");
        else m.setAttribute("hidden", "");
      });
    };

    const computeStepFromTriggers = () => {
      const middle = window.innerHeight / 2;
      let next = 0;
      for (let i = 0; i < triggers.length; i++) {
        const r = triggers[i].getBoundingClientRect();
        if (r.top <= middle) next = i;
      }
      return next;
    };

    const onUpdate = () => {
      if (performance.now() < lockUntil) return;
      setStep(computeStepFromTriggers());
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onUpdate();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    buttons.forEach((b, i) => {
      b.addEventListener("click", () => {
        const target = scroll.offsetTop + (i / stepCount) * (scroll.offsetHeight - window.innerHeight) + 20;
        lockUntil = performance.now() + 700;
        setStep(i);
        window.scrollTo({
          top: target,
          behavior: reduced ? "auto" : "smooth",
        });
      });

      b.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          const next = (i + 1) % stepCount;
          buttons[next].click();
          buttons[next].focus();
        }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          const next = (i - 1 + stepCount) % stepCount;
          buttons[next].click();
          buttons[next].focus();
        }
      });
    });

    onUpdate();
  }

  // ============ TESTIMONIAL MARQUEE: duplicate track for seamless loop ============
  const track = document.getElementById("track");
  if (track) {
    const originals = Array.from(track.children);
    originals.forEach((node) => {
      const clone = node.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
  }

  // ============ PRICING TOGGLE ============
  const toggleBtns = Array.from(document.querySelectorAll(".parley-page .toggle__btn"));
  toggleBtns.forEach((b) => {
    b.addEventListener("click", () => {
      toggleBtns.forEach((other) => {
        const active = other === b;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-selected", active ? "true" : "false");
      });
    });
  });

  // ============ HOW IT WORKS: Lottie tabs (exact framer Tab+images) ============
  const hiwPanel = document.getElementById("hiw-panel");
  if (hiwPanel && window.lottie) {
    const pills = Array.from(hiwPanel.querySelectorAll(".hiw__pill"));
    const stages = Array.from(hiwPanel.querySelectorAll(".hiw__lottie"));
    const ASSETS = "https://parley-home.vercel.app/assets/";
    const files = [ASSETS + "hiw-1.json", ASSETS + "hiw-2.json", ASSETS + "hiw-3.json"];
    const players = new Array(files.length).fill(null);

    const load = (i) => {
      if (players[i]) return players[i];
      players[i] = lottie.loadAnimation({
        container: stages[i],
        renderer: "svg",
        loop: true,
        autoplay: false,
        path: files[i],
      });
      return players[i];
    };

    let current = 0;
    const setStep = (next) => {
      if (next === current && players[next]) return;
      current = next;
      pills.forEach((p, i) => {
        p.classList.toggle("is-active", i === next);
        p.setAttribute("aria-pressed", i === next ? "true" : "false");
      });
      stages.forEach((s, i) => {
        const active = i === next;
        s.classList.toggle("is-active", active);
        if (active) s.removeAttribute("hidden");
        else s.setAttribute("hidden", "");
        const pl = players[i];
        if (pl) { if (active) pl.play(); else pl.pause(); }
      });
      const pl = load(next);
      if (!reduced) pl.play();
    };

    pills.forEach((p, i) => p.addEventListener("click", () => setStep(i)));

    // lazy-init the first animation when the panel approaches the viewport
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        const pl = load(0);
        if (!reduced) pl.play();
        io.disconnect();
      }
    }, { rootMargin: "600px" });
    io.observe(hiwPanel);
  }

  // ============ FAQ: animate open/close of <details> ============
  const faqItems = Array.from(document.querySelectorAll(".parley-page .faq__item"));
  faqItems.forEach((item) => {
    const summary = item.querySelector("summary");
    const answer = item.querySelector(".faq__answer");
    if (!summary || !answer) return;

    let anim = null;

    const collapse = () => {
      const startH = answer.offsetHeight;
      if (anim) anim.cancel();
      anim = answer.animate(
        [{ height: `${startH}px`, opacity: 1 }, { height: "0px", opacity: 0 }],
        { duration: reduced ? 0 : 280, easing: "cubic-bezier(0.2, 0, 0, 1)" }
      );
      anim.onfinish = () => {
        item.removeAttribute("open");
        answer.style.height = "";
        anim = null;
      };
    };

    const expand = () => {
      item.setAttribute("open", "");
      const endH = answer.scrollHeight;
      if (anim) anim.cancel();
      anim = answer.animate(
        [{ height: "0px", opacity: 0 }, { height: `${endH}px`, opacity: 1 }],
        { duration: reduced ? 0 : 320, easing: "cubic-bezier(0.32, 0.72, 0, 1)" }
      );
      anim.onfinish = () => {
        answer.style.height = "";
        anim = null;
      };
    };

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (item.hasAttribute("open")) {
        collapse();
      } else {
        // close any other open item first
        faqItems.forEach((other) => {
          if (other !== item && other.hasAttribute("open")) {
            other.removeAttribute("open");
          }
        });
        expand();
      }
    });
  });
})();
