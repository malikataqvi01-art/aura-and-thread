/* =========================================================
   Aura & Thread · main script
   Contact links are set here. Change a value to update the site.
   ========================================================= */
const SITE = {
  whatsapp: '923312483081',               // country code + number, no + or spaces
  phone:    '0331-2483081',
  instagram: 'https://www.instagram.com/aura.and.thread.pk',
};

(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Contact / social links ---------- */
  const builders = {
    instagram: v => v,
    whatsapp: v => 'https://wa.me/' + v.replace(/\D/g, ''),
    phone:    v => 'tel:' + v.replace(/[^\d+]/g, ''),
  };
  document.querySelectorAll('[data-config]').forEach(el => {
    const key = el.dataset.config;
    const val = (SITE[key] || '').trim();
    if (!val) return;
    el.href = builders[key](val);
    if (key === 'instagram' || key === 'whatsapp') { el.target = '_blank'; el.rel = 'noopener'; }
  });

  /* ---------- Load / intro ---------- */
  const markLoaded = () => setTimeout(() => document.body.classList.add('is-loaded'), reduce ? 0 : 900);
  if (document.readyState === 'complete') markLoaded();
  else addEventListener('load', markLoaded);
  setTimeout(() => document.body.classList.add('is-loaded'), 4000); // safety net

  // gold thread draws once its path length is known
  const thread = document.getElementById('thread');
  if (thread) thread.style.setProperty('--len', Math.ceil(thread.getTotalLength()));

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && hasGSAP && !reduce) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Navigation ---------- */
  const nav = document.getElementById('nav');
  const burger = nav.querySelector('.burger');
  const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = open => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));

  // smooth anchor links; closes the mobile menu
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      setMenu(false);
      if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1.4 });
      else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // highlight the nav link for the section in view
  const navLinks = [...document.querySelectorAll('.nav__links a')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => io.observe(s));

  /* ---------- Collection filter ---------- */
  const tabs = [...document.querySelectorAll('.tab')];
  const items = [...document.querySelectorAll('.item')];

  function setFilter(f) {
    tabs.forEach(t => t.setAttribute('aria-pressed', String(t.dataset.filter === f)));
    const shown = items.filter(it => {
      const ok = f === 'all' || it.dataset.cat === f;
      it.classList.toggle('is-hidden', !ok);
      return ok;
    });
    if (hasGSAP && !reduce) {
      gsap.fromTo(shown,
        { opacity: 0, y: 36, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.07, ease: 'expo.out', clearProps: 'transform,opacity' });
    }
  }
  tabs.forEach(t => t.addEventListener('click', () => setFilter(t.dataset.filter)));
  document.querySelectorAll('[data-go-filter]').forEach(b =>
    b.addEventListener('click', () => setFilter(b.dataset.goFilter)));

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById('lb');
  const lbImg = document.getElementById('lbImg');
  const lbTitle = document.getElementById('lbTitle');
  const lbCount = document.getElementById('lbCount');
  let idx = 0, lastFocus = null;

  const visibleItems = () => items.filter(i => !i.classList.contains('is-hidden'));

  function showAt(i) {
    const list = visibleItems();
    if (!list.length) return;
    idx = (i + list.length) % list.length;
    const item = list[idx];
    const img = item.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbTitle.textContent = item.querySelector('h3').textContent;
    lbCount.textContent = (idx + 1) + ' / ' + list.length;
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    showAt(i);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    if (lenis) lenis.stop();
    lb.querySelector('.lb__close').focus();
  }
  function closeLb() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lenis) lenis.start();
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  items.forEach(item => {
    item.querySelector('.item__btn').addEventListener('click', () => openLb(visibleItems().indexOf(item)));
  });
  lb.querySelector('.lb__close').addEventListener('click', closeLb);
  lb.querySelector('.lb__prev').addEventListener('click', () => showAt(idx - 1));
  lb.querySelector('.lb__next').addEventListener('click', () => showAt(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showAt(idx - 1);
    if (e.key === 'ArrowRight') showAt(idx + 1);
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Desktop-only refinements ---------- */
  if (fine && !reduce) {
    root.classList.add('has-cursor');
    const ring = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px)`;
    });
    (function loop() {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', e => {
      const t = e.target;
      ring.classList.toggle('is-link', !!t.closest('a, button, .tab, .channel'));
      ring.classList.toggle('is-view', !!t.closest('.item__btn'));
    });

    // magnetic buttons
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.25) + 'px');
        el.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.35) + 'px');
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });

    // 3D tilt on category cards
    document.querySelectorAll('.cat').forEach(c => {
      const inner = c.querySelector('.cat__inner');
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        inner.style.setProperty('--rx', (-py * 9) + 'deg');
        inner.style.setProperty('--ry', (px * 9) + 'deg');
      });
      c.addEventListener('pointerleave', () => {
        inner.style.setProperty('--rx', '0deg');
        inner.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- GSAP scroll choreography ---------- */
  if (hasGSAP && !reduce) {
    gsap.utils.toArray('[data-reveal]').forEach(el => {
      gsap.from(el, {
        y: 50, opacity: 0, duration: 1.3, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });

    gsap.utils.toArray('[data-stagger]').forEach(parent => {
      gsap.from(parent.children, {
        y: 44, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: parent, start: 'top 88%', once: true },
      });
    });

    const heroScroll = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.arch img', { yPercent: -10, ease: 'none', scrollTrigger: heroScroll });
    gsap.to('.float--1', { y: -90, ease: 'none', scrollTrigger: heroScroll });
    gsap.to('.float--2', { y: 70, ease: 'none', scrollTrigger: heroScroll });
    gsap.to('.thread', { y: 120, ease: 'none', scrollTrigger: heroScroll });

    gsap.fromTo('.seal', { rotate: -10, scale: 0.9 }, {
      rotate: 10, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    gsap.fromTo('.wordmark', { letterSpacing: '0.12em', opacity: 0.2 }, {
      letterSpacing: '0em', opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }
})();
