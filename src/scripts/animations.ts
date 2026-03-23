/**
 * animations.ts
 * GSAP 3 + Lenis smooth-scroll animation system for the EncuentraDoc landing page.
 *
 * Execution order:
 *  1. Lenis initialisation + RAF wiring
 *  2. prefers-reduced-motion guard (skips all GSAP work, keeps Lenis RAF)
 *  3. Navbar scroll class
 *  4. Hero entrance timeline (page-load, no ScrollTrigger)
 *  5. Section scroll-triggered timelines (TrustBar → Footer)
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// ---------------------------------------------------------------------------
// Plugin registration
// ---------------------------------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type LenisScrollEvent = { scroll: number; limit: number; velocity: number; direction: number; progress: number };

// ---------------------------------------------------------------------------
// 3-D mockup tilt — cursor-reactive on pointer devices
// ---------------------------------------------------------------------------
interface TiltOptions {
  restY: number;   // resting rotateY in degrees
  restX: number;   // resting rotateX in degrees
  rangeY?: number; // extra rotation range per side on Y (default 8)
  rangeX?: number; // extra rotation range per side on X (default 5)
}

function addTiltListeners(el: HTMLElement, opts: TiltOptions): void {
  // Skip on touch-only devices
  if (!window.matchMedia('(hover: hover)').matches) return;
  // Prevent double-binding (e.g., hot-reload)
  if (el.dataset.tiltActive === 'true') return;
  el.dataset.tiltActive = 'true';

  const { restY, restX, rangeY = 8, rangeX = 5 } = opts;

  el.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;   // -1..1
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;   // -1..1

    gsap.to(el, {
      rotateY: restY + nx * rangeY,
      rotateX: restX - ny * rangeX,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  });

  el.addEventListener('mouseleave', () => {
    gsap.to(el, {
      rotateY: restY,
      rotateX: restX,
      duration: 0.7,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  });
}

// ---------------------------------------------------------------------------
// Lenis initialisation
// ---------------------------------------------------------------------------
function initLenis(): Lenis {
  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
  });

  // Wire Lenis into GSAP's RAF so ScrollTrigger stays in sync.
  gsap.ticker.add((time: number) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Keep ScrollTrigger positions accurate on every Lenis scroll tick.
  lenis.on('scroll', (_e: LenisScrollEvent) => {
    ScrollTrigger.update();
  });

  return lenis;
}

// ---------------------------------------------------------------------------
// Reduced-motion: reveal all animated elements immediately and bail out.
// ---------------------------------------------------------------------------
function revealAllImmediately(): void {
  const targets: string[] = [
    '.card',
    '.faq-card',
    '[data-hero-badge]',
    '.hero-line',
    '[data-hero-sub]',
    '[data-hero-cta]',
    '[data-hero-proof]',
    '[data-hero-mockup]',
    '.trustbar-card',
    '[data-hiw-node]',
    '[data-hiw-step-content]',
    '[data-hiw-step]',
    '[data-dashboard-copy]',
    '[data-dashboard-callout]',
    '[data-dashboard-mockup]',
    '[data-fordoctors-copy] > *',
    '[data-privacy-list] .card',
    '[data-cta]',
    '[data-cta] a',
    '[data-footer-col]',
  ];

  targets.forEach((selector) => {
    const els = document.querySelectorAll<HTMLElement>(selector);
    els.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });

  // HowItWorks path progress bars: reveal fully
  document.querySelectorAll<HTMLElement>('[data-hiw-progress]').forEach((el) => {
    el.style.transform = 'scaleY(1)';
  });
}

// ---------------------------------------------------------------------------
// Navbar — scroll class toggle
// ---------------------------------------------------------------------------
function initNavbar(): void {
  const header = document.querySelector<HTMLElement>('header');
  if (!header) return;

  const THRESHOLD = 20;

  const update = (): void => {
    if (window.scrollY > THRESHOLD) {
      header.classList.add('navbar--scrolled');
    } else {
      header.classList.remove('navbar--scrolled');
    }
  };

  // Run once on load in case the page is already scrolled (e.g. refresh mid-page).
  update();
  window.addEventListener('scroll', update, { passive: true });
}

// ---------------------------------------------------------------------------
// Hero — entrance timeline (fires on page load, no ScrollTrigger)
// ---------------------------------------------------------------------------
function initHero(): void {
  const badge = document.querySelector<HTMLElement>('[data-hero-badge]');
  const heroLines = gsap.utils.toArray<HTMLElement>('.hero-line');
  const sub = document.querySelector<HTMLElement>('[data-hero-sub]');
  const ctaContainer = document.querySelector<HTMLElement>('[data-hero-cta]');
  const ctaChildren = ctaContainer ? gsap.utils.toArray<HTMLElement>('[data-hero-cta] > *') : [];
  const proof = document.querySelector<HTMLElement>('[data-hero-proof]');
  const mockup = document.querySelector<HTMLElement>('[data-hero-mockup]');

  // Pre-set 3D initial state before timeline starts (avoids from() snap)
  if (mockup) {
    gsap.set(mockup, {
      transformPerspective: 1200,
      rotateY: -28,
      rotateX: 10,
      y: 60,
      opacity: 0,
    });
  }

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // 1. Badge
  if (badge) {
    tl.from(badge, { y: 15, opacity: 0, duration: 0.5 }, 0.1);
  }

  // 2. Hero headline lines (clip-reveal from below — parent must have overflow:hidden)
  if (heroLines.length > 0) {
    tl.from(
      heroLines,
      {
        y: '110%',
        duration: 0.65,
        ease: 'power3.out',
        stagger: 0.08,
      },
      badge ? '>-0.3' : 0.1,
    );
  }

  // 3. Subheadline — starts 0.15 s after lines begin
  if (sub) {
    tl.from(sub, { y: 20, opacity: 0, duration: 0.5 }, `<+0.15`);
  }

  // 4. CTA children — clearProps frees CSS hover transforms after entrance
  if (ctaChildren.length > 0) {
    tl.from(
      ctaChildren,
      { y: 12, opacity: 0, scale: 0.97, duration: 0.5, stagger: 0.1, ease: 'back.out(1.3)', clearProps: 'transform,opacity' },
      '>-0.1',
    );
  }

  // 5. Social proof
  if (proof) {
    tl.from(proof, { opacity: 0, duration: 0.3 }, '>-0.05');
  }

  // 6. Mockup — 3D entrance from steep tilt to resting angle
  if (mockup) {
    tl.to(
      mockup,
      { y: 0, opacity: 1, rotateY: -12, rotateX: 5, duration: 0.9, ease: 'power2.out' },
      0.4,
    );
    // Wire cursor-reactive tilt after entrance completes
    tl.call(() => addTiltListeners(mockup, { restY: -12, restX: 5 }));
  }
}

// ---------------------------------------------------------------------------
// TrustBar — fullscreen scroll-driven carousel
// Active card = full viewport; next card = small preview peeking from the right.
// ---------------------------------------------------------------------------
function initTrustBar(): void {
  const section = document.querySelector<HTMLElement>('[data-trustbar]');
  const dots    = gsap.utils.toArray<HTMLElement>('[data-trustbar-dots] [data-dot]');
  const cards   = gsap.utils.toArray<HTMLElement>('.trustbar-card');

  if (!section || cards.length === 0) return;

  const CARD_COUNT    = cards.length;
  const PREVIEW_SCALE = 0.28;
  const getPreviewTx  = (): number => window.innerWidth * 0.30;

  // ── Update all card positions for a given scroll progress (0→1) ──────────
  const updateCards = (progress: number): void => {
    const vw         = window.innerWidth;
    const PREVIEW_TX = getPreviewTx();

    const activeFloat = progress * (CARD_COUNT - 1);
    const baseIndex   = Math.floor(activeFloat);
    const t           = activeFloat - baseIndex;

    cards.forEach((card, i) => {
      const el     = card as HTMLElement;
      const offset = i - baseIndex;
      let tx: number, sc: number, op: number;

      if (offset < 0) {
        tx = -vw * 1.05; sc = 0.95; op = 0;
      } else if (offset === 0) {
        tx = -t * vw * 1.05;
        sc = 1 - t * 0.04;
        op = Math.max(0, 1 - t * 1.6);
      } else if (offset === 1) {
        tx = PREVIEW_TX * (1 - t);
        sc = PREVIEW_SCALE + (1 - PREVIEW_SCALE) * t;
        op = 0.9 + 0.1 * t;
      } else {
        tx = PREVIEW_TX + (offset - 1) * vw * 0.12;
        sc = PREVIEW_SCALE * 0.8;
        op = 0;
      }

      el.style.transform = `translateX(${tx.toFixed(1)}px) scale(${sc.toFixed(3)})`;
      el.style.opacity   = op.toFixed(3);
      el.style.zIndex    = offset < 0 ? '1' : offset === 0 ? '3' : '2';
    });
  };

  updateCards(0);

  // ── Progress dots ────────────────────────────────────────────────────────
  const updateDots = (progress: number): void => {
    const active = Math.round(progress * (CARD_COUNT - 1));
    dots.forEach((dot, i) => {
      const on = i === active;
      (dot as HTMLElement).style.width           = on ? '1.5rem' : '0.375rem';
      (dot as HTMLElement).style.backgroundColor = on
        ? 'rgba(255, 255, 255, 0.9)'
        : 'rgba(255, 255, 255, 0.3)';
    });
  };

  // ── ScrollTrigger: one viewport height of scroll per card transition ──────
  const proxy       = { value: 0 };
  const totalScroll = () => (CARD_COUNT - 1) * window.innerHeight;

  gsap.to(proxy, {
    value: 1,
    ease: 'none',
    onUpdate: () => {
      updateCards(proxy.value);
      updateDots(proxy.value);
    },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${totalScroll()}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onRefresh: () => updateCards(proxy.value),
    },
  });
}

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------
function initFeatures(): void {
  const section = document.querySelector<HTMLElement>('#funcionalidades');
  if (!section) return;

  const headerBlock = section.querySelector<HTMLElement>('.max-w-2xl');
  const headerEls = headerBlock
    ? gsap.utils.toArray<HTMLElement>([
        headerBlock.querySelector('h2'),
        headerBlock.querySelector('p'),
      ].filter(Boolean) as HTMLElement[])
    : [];

  if (headerEls.length > 0) {
    gsap.from(headerEls, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true,
      },
    });
  }

  const cards = gsap.utils.toArray<HTMLElement>('#funcionalidades .card');
  if (cards.length === 0) return;

  gsap.to(cards, {
    y: 0,
    opacity: 1,
    duration: 0.55,
    ease: 'power2.out',
    stagger: { amount: 0.6 },
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      once: true,
    },
  });
}

// ---------------------------------------------------------------------------
// HowItWorks — scroll-driven path + per-step reveals
// ---------------------------------------------------------------------------
function initHowItWorks(): void {
  const section = document.querySelector<HTMLElement>('#como-funciona');
  if (!section) return;

  // Section header
  const headerBlock = section.querySelector<HTMLElement>('.max-w-2xl');
  const headerEls = headerBlock
    ? ([headerBlock.querySelector('h2'), headerBlock.querySelector('p')].filter(Boolean) as HTMLElement[])
    : [];

  if (headerEls.length > 0) {
    gsap.from(headerEls, {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.12,
      scrollTrigger: { trigger: section, start: 'top 80%', once: true },
    });
  }

  // Shared panel setup: path progress bar (scrub) + per-step node/content reveals
  const setupPanel = (panel: HTMLElement): void => {
    const progressBar = panel.querySelector<HTMLElement>('[data-hiw-progress]');
    const nodes    = gsap.utils.toArray<HTMLElement>(panel.querySelectorAll('[data-hiw-node]'));
    const contents = gsap.utils.toArray<HTMLElement>(panel.querySelectorAll('[data-hiw-step-content]'));
    const steps    = gsap.utils.toArray<HTMLElement>(panel.querySelectorAll('[data-hiw-step]'));

    // Pre-hide nodes + content before first paint
    gsap.set(nodes,    { scale: 0.4, opacity: 0 });
    gsap.set(contents, { x: 24, opacity: 0 });

    // Path draws itself as section scrolls through the viewport
    if (progressBar) {
      gsap.fromTo(
        progressBar,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            start: 'top 68%',
            end:   'bottom 55%',
            scrub: 0.6,
          },
        },
      );
    }

    // Each step: node pops, content slides in when step enters viewport
    steps.forEach((_step, i) => {
      const node    = nodes[i];
      const content = contents[i];

      const tl = gsap.timeline({
        scrollTrigger: { trigger: _step, start: 'top 76%', once: true },
      });

      if (node) {
        tl.to(node, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.5)' }, 0);
      }
      if (content) {
        tl.to(content, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.08);
      }
    });
  };

  // Patient panel: always visible — set up immediately
  const patientPanel = document.querySelector<HTMLElement>('#panel-patient');
  if (patientPanel) setupPanel(patientPanel);

  // Doctor panel: hidden until tab is clicked — set up on first change
  const tabDoctor  = document.querySelector<HTMLInputElement>('#tab-doctor');
  const doctorPanel = document.querySelector<HTMLElement>('#panel-doctor');

  if (tabDoctor && doctorPanel) {
    let doctorSetup = false;
    tabDoctor.addEventListener('change', () => {
      if (tabDoctor.checked && !doctorSetup) {
        doctorSetup = true;
        setupPanel(doctorPanel);
        ScrollTrigger.refresh();
      }
    });
  }
}

// ---------------------------------------------------------------------------
// DoctorDashboard
// ---------------------------------------------------------------------------
function initDoctorDashboard(): void {
  // Use the bg-slate-50 section that wraps the dashboard.
  // Target via data attributes added to the component.
  const copy = document.querySelector<HTMLElement>('[data-dashboard-copy]');
  const callouts = gsap.utils.toArray<HTMLElement>('[data-dashboard-callout]');
  const mockup = document.querySelector<HTMLElement>('[data-dashboard-mockup]');

  if (!copy && callouts.length === 0 && !mockup) return;

  // Find a common trigger — use the section ancestor of whichever element exists.
  const trigger =
    (copy ?? callouts[0] ?? mockup)?.closest('section') ??
    (copy ?? callouts[0] ?? mockup);

  if (!trigger) return;

  // Pre-set 3D initial state before ScrollTrigger fires
  if (mockup) {
    gsap.set(mockup, {
      transformPerspective: 1200,
      rotateY: -22,
      rotateX: 8,
      x: 40,
      opacity: 0,
    });
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: 'top 70%',
      once: true,
    },
  });

  if (copy) {
    tl.from(copy, { x: -40, opacity: 0, duration: 0.65, ease: 'power2.out' }, 0);
  }

  if (callouts.length > 0) {
    tl.from(
      callouts,
      { x: -30, opacity: 0, duration: 0.5, stagger: 0.12, clearProps: 'transform,opacity' },
      copy ? 0.2 : 0,
    );
  }

  if (mockup) {
    tl.to(
      mockup,
      { x: 0, opacity: 1, rotateY: -8, rotateX: 3, duration: 0.8, ease: 'power2.out' },
      0,
    );
    tl.call(() => addTiltListeners(mockup, { restY: -8, restX: 3 }));
  }
}

// ---------------------------------------------------------------------------
// ForDoctors
// ---------------------------------------------------------------------------
function initForDoctors(): void {
  const section = document.querySelector<HTMLElement>('#para-doctores');
  if (!section) return;

  const copyEl = section.querySelector<HTMLElement>('[data-fordoctors-copy]');
  const cardsContainer = section.querySelector<HTMLElement>('[data-fordoctors-cards]');
  const cards = cardsContainer
    ? gsap.utils.toArray<HTMLElement>(cardsContainer.querySelectorAll('.card'))
    : [];

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
      once: true,
    },
  });

  if (copyEl) {
    const copyChildren = gsap.utils.toArray<HTMLElement>(copyEl.children as unknown as HTMLElement[]);
    if (copyChildren.length > 0) {
      tl.from(
        copyChildren,
        { x: -40, opacity: 0, duration: 0.55, stagger: 0.1, clearProps: 'transform,opacity' },
        0,
      );
    }
  }

  if (cards.length > 0) {
    tl.to(
      cards,
      { y: 0, opacity: 1, duration: 0.5, stagger: { amount: 0.5 } },
      copyEl ? 0.15 : 0,
    );
  }
}

// ---------------------------------------------------------------------------
// PrivacySection
// ---------------------------------------------------------------------------
function initPrivacySection(): void {
  // The section has no id — locate it by data-privacy-list's ancestor.
  const listEl = document.querySelector<HTMLElement>('[data-privacy-list]');
  const section = listEl?.closest('section') ?? null;

  const trigger = section ?? listEl;
  if (!trigger) return;

  // Header h2 + p sit in a .text-center div inside the section.
  const headerBlock = section?.querySelector<HTMLElement>('.text-center');
  const headerEls = headerBlock
    ? ([headerBlock.querySelector('h2'), headerBlock.querySelector('p')].filter(
        Boolean,
      ) as HTMLElement[])
    : [];

  const cards = listEl
    ? gsap.utils.toArray<HTMLElement>(listEl.querySelectorAll('.card'))
    : [];

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: 'top 80%',
      once: true,
    },
  });

  if (headerEls.length > 0) {
    tl.from(headerEls, { y: 30, opacity: 0, duration: 0.6, stagger: 0.12 }, 0);
  }

  if (cards.length > 0) {
    tl.to(
      cards,
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.15 },
      headerEls.length > 0 ? 0.2 : 0,
    );
  }
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------
function initFAQ(): void {
  const section = document.querySelector<HTMLElement>('#faq');
  if (!section) return;

  const headerBlock = section.querySelector<HTMLElement>('.text-center');
  const headerEls = headerBlock
    ? ([headerBlock.querySelector('h2'), headerBlock.querySelector('p')].filter(
        Boolean,
      ) as HTMLElement[])
    : [];

  const faqCards = gsap.utils.toArray<HTMLElement>('#faq .faq-card');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      once: true,
    },
  });

  if (headerEls.length > 0) {
    tl.from(headerEls, { y: 30, opacity: 0, duration: 0.6, stagger: 0.12 }, 0);
  }

  if (faqCards.length > 0) {
    tl.to(
      faqCards,
      { y: 0, opacity: 1, duration: 0.45, stagger: { amount: 0.5 } },
      headerEls.length > 0 ? 0.2 : 0,
    );
  }
}

// ---------------------------------------------------------------------------
// CTA
// ---------------------------------------------------------------------------
function initCTA(): void {
  const ctaBlock = document.querySelector<HTMLElement>('[data-cta]');
  if (!ctaBlock) return;

  const section = ctaBlock.closest('section') ?? ctaBlock;
  const buttons = gsap.utils.toArray<HTMLElement>(ctaBlock.querySelectorAll('a'));

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      once: true,
    },
  });

  tl.from(
    ctaBlock,
    { scale: 0.96, opacity: 0, duration: 0.65, ease: 'power3.out' },
    0,
  );

  if (buttons.length > 0) {
    tl.from(
      buttons,
      { y: 12, opacity: 0, scale: 0.97, duration: 0.5, stagger: 0.12, ease: 'back.out(1.3)', clearProps: 'transform,opacity' },
      0.2,
    );
  }
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function initFooter(): void {
  const cols = gsap.utils.toArray<HTMLElement>('[data-footer-col]');
  if (cols.length === 0) return;

  const footer = document.querySelector<HTMLElement>('footer');

  gsap.from(cols, {
    y: 20,
    opacity: 0,
    duration: 0.4,
    stagger: 0.08,
    scrollTrigger: {
      trigger: footer ?? cols[0],
      start: 'top 90%',
      once: true,
    },
  });
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
function init(): void {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  // Navbar is functional (scroll-based background), not decorative motion — always runs.
  initNavbar();

  if (prefersReducedMotion) {
    revealAllImmediately();
    return;
  }

  // Lenis smooth-scroll is a motion effect — only init when motion is preferred.
  const lenis = initLenis();
  void lenis;

  initHero();
  initTrustBar();
  initFeatures();
  initHowItWorks();
  initDoctorDashboard();
  initForDoctors();
  initPrivacySection();
  initFAQ();
  initCTA();
  initFooter();
}

// Run after the DOM is ready. In Astro, client scripts run after hydration,
// so DOMContentLoaded may have already fired — handle both cases.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
