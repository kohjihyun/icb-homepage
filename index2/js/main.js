/* ================================================================
   index2 — Figma "home2" 모션 스크립트
   - 각 섹션 sticky 제거 → 스크롤 연동 sticky 로직 모두 제거
   - IntersectionObserver 기반 reveal로 통일
   - 카드 캐러셀(section004/005) 카드 크기·색상은 index.html과 동일
================================================================ */
(function () {
  'use strict';

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── GNB: 스크롤 내려가면 GNB-sub 숨김 ── */
  function setupGnbScroll() {
    const gnb = document.querySelector('.gnb');
    if (!gnb) return;
    const TRIGGER = 40; // 40px 스크롤하면 sub 숨김

    let raf = 0;
    function update() {
      raf = 0;
      if (window.scrollY > TRIGGER) gnb.classList.add('is-scrolled');
      else gnb.classList.remove('is-scrolled');
    }
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  /* ── Hero 텍스트 순차 등장 (로드 직후) ── */
  function setupHeroReveal() {
    const block = document.querySelector('.hero-reveal');
    if (!block) return;
    if (prefersReducedMotion) { block.classList.add('is-visible'); return; }
    requestAnimationFrame(() =>
      requestAnimationFrame(() => block.classList.add('is-visible'))
    );
  }

  /* ── 섹션 타이틀(.section-reveal / .section-title-reveal) IntersectionObserver ── */
  function setupSectionReveal() {
    const blocks = document.querySelectorAll(
      '.section-reveal, .section-title-reveal'
    );
    if (!blocks.length) return;

    if (prefersReducedMotion) {
      blocks.forEach((b) => b.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    blocks.forEach((b) => observer.observe(b));
  }

  /* ── 일반 reveal-up (요소가 뷰포트에 들어오면 등장) ── */
  function setupRevealUp() {
    const els = document.querySelectorAll('.reveal-up');
    if (!els.length) return;

    if (prefersReducedMotion) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    els.forEach((el) => observer.observe(el));
  }

  /* ── section001 intro lines: 순차 등장 ── */
  function setupIntroLines() {
    const lines = document.querySelectorAll('.section001 .intro-line');
    if (!lines.length) return;

    // 스태거 딜레이
    lines.forEach((el, i) => el.style.setProperty('--rd', i * 0.18 + 's'));

    if (prefersReducedMotion) {
      lines.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    lines.forEach((el) => observer.observe(el));
  }

  /* ── section003 count: 항목 단위 등장 ── */
  function setupCountReveal() {
    const items = document.querySelectorAll('.count-reveal');
    if (!items.length) return;

    if (prefersReducedMotion) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ── section007 remit reveal: 요소 진입 시 스태거 ── */
  function setupRemit() {
    const section = document.getElementById('section007');
    if (!section) return;
    const items = Array.from(section.querySelectorAll('.reveal-up'));
    if (!items.length) return;

    // 스태거 딜레이
    items.forEach((el, i) => el.style.setProperty('--rd', i * 0.12 + 's'));
  }

  /* ── section002 사진 카드: 카드 이미지+텍스트 순차 등장
        - .s2-card에 is-in이 붙으면 이미지 → 제목 → 설명 순으로 reveal
        - 카드별로 --s2c-delay 스태거 적용 (HTML에서 0/0.15/0.30/0.45s) */
  function setupSection2Cards() {
    const cards = document.querySelectorAll('.s2-card');
    if (!cards.length) return;

    if (prefersReducedMotion) {
      cards.forEach((c) => c.classList.add('is-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    cards.forEach((c) => observer.observe(c));
  }

  /* ── 임베드 카드 캐러셀 (auto-rotate + hover; index.html과 동일) ── */
  function initEmbedCarousel(host, cards, opts) {
    const AUTO_ROTATE_MS = 1500;
    const { baseX, stepX } = opts;

    const scene = document.createElement('div');
    scene.className = 'ec-scene';
    host.appendChild(scene);

    const cardElements = [];
    let active = 0;
    let autoTimer = null;
    let isHovering = false;

    function getRelativePosition(index) {
      const total = cards.length;
      let diff = index - active;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;
      return diff;
    }

    function getCardStyle(position) {
      const abs = Math.abs(position);
      if (position === 0) {
        return {
          transform: 'translate3d(0px, 0, 0) scale(1.12) rotateY(0deg)',
          zIndex: '100',
          opacity: '1',
          filter: 'brightness(1)',
        };
      }
      const dir = position > 0 ? 1 : -1;
      const x = dir * (baseX + (abs - 1) * stepX);
      const z = -abs * 120;
      const scale = 1 - abs * 0.12;
      const rotateY = dir * -32;
      return {
        transform: `translate3d(${x}px, 0, ${z}px) scale(${scale}) rotateY(${rotateY}deg)`,
        zIndex: String(100 - abs),
        opacity: '1',
        filter: 'brightness(0.65)',
      };
    }

    function render() {
      cards.forEach((_, index) => {
        const el = cardElements[index];
        const style = getCardStyle(getRelativePosition(index));
        el.style.transform = style.transform;
        el.style.zIndex = style.zIndex;
        el.style.opacity = style.opacity;
        el.style.filter = style.filter;
      });
    }

    function startAutoRotate() {
      stopAutoRotate();
      if (isHovering) return;
      autoTimer = setInterval(() => {
        active = (active + 1) % cards.length;
        render();
      }, AUTO_ROTATE_MS);
    }
    function stopAutoRotate() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    cards.forEach((card, index) => {
      const el = document.createElement('div');
      el.className = 'ec-card';
      el.dataset.id = card.id;

      const content = document.createElement('div');
      content.className = 'ec-content';
      content.style.backgroundColor = card.color;

      const icon = document.createElement('img');
      icon.src = card.icon;
      icon.className = 'ec-icon';
      icon.alt = '';

      const overlay = document.createElement('div');
      overlay.className = 'ec-overlay';

      const num = document.createElement('div');
      num.className = 'ec-num';
      num.textContent = '0' + card.id;

      const title = document.createElement('div');
      title.className = 'ec-title';
      title.innerHTML = card.title;

      overlay.appendChild(num);
      overlay.appendChild(title);

      const reflection = document.createElement('div');
      reflection.className = 'ec-reflection';

      content.appendChild(icon);
      content.appendChild(overlay);
      content.appendChild(reflection);
      el.appendChild(content);

      el.addEventListener('mouseenter', () => {
        isHovering = true;
        stopAutoRotate();
        if (active !== index) {
          active = index;
          render();
        }
      });
      el.addEventListener('mouseleave', () => {
        isHovering = false;
        startAutoRotate();
      });

      scene.appendChild(el);
      cardElements.push(el);
    });

    render();
    startAutoRotate();
  }

  function setupEmbeddedCarousels() {
    // section004 — 6 cards, Figma 색상 (teal/blue 톤)
    const cards1 = [
      { id: 1, title: 'Electronic Payment Gateway(PG)',         color: '#619dc4', icon: './assets/certificate.png' },
      { id: 2, title: 'Prepaid Electronic Payment Instrument',  color: '#70c0bb', icon: './assets/certificate.png' },
      { id: 3, title: 'Foreign Exchange Business',              color: '#2b8892', icon: './assets/certificate.png' },
      { id: 4, title: 'Currency Exchange',                      color: '#70a4c0', icon: './assets/certificate.png' },
      { id: 5, title: 'Small-Amount Overseas Remittance',       color: '#70c0bb', icon: './assets/certificate.png' },
      { id: 6, title: 'Escrow<br />Service',                    color: '#2b8892', icon: './assets/certificate.png' },
    ];
    // section005 — 4 cards, Figma 색상 (brown/orange 톤)
    const cards2 = [
      { id: 1, title: 'Financial<br />Transaction<br />Brokerage',    color: '#dd8c49', icon: './assets/certificate.png' },
      { id: 2, title: 'Duty-Free<br />Purchase<br />Settlement',       color: '#d16f32', icon: './assets/certificate.png' },
      { id: 3, title: 'Mobile<br />Augmented Space<br />Acceleration', color: '#a2641b', icon: './assets/certificate.png' },
      { id: 4, title: 'Ultrasonic<br />Payment<br />Technology',       color: '#bd7a71', icon: './assets/certificate.png' },
    ];

    document.querySelectorAll('[data-carousel="1"]').forEach((host) => {
      initEmbedCarousel(host, cards1, { baseX: 170, stepX: 140 });
    });
    document.querySelectorAll('[data-carousel="2"]').forEach((host) => {
      initEmbedCarousel(host, cards2, { baseX: 220, stepX: 150 });
    });
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    setupGnbScroll();
    setupHeroReveal();
    setupSectionReveal();
    setupIntroLines();
    setupCountReveal();
    setupRemit();
    setupRevealUp();
    setupSection2Cards();
    setupEmbeddedCarousels();
  });
})();
