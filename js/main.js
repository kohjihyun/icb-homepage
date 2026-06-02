(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Zone 스크롤 진행도 0→1 ── */
  function getZoneProgress(zoneId, sectionId) {
    const zone    = document.getElementById(zoneId);
    const section = document.getElementById(sectionId);
    if (!zone || !section) return 0;
    const zoneTop    = zone.getBoundingClientRect().top + window.scrollY;
    const scrollRoom = zone.offsetHeight - section.offsetHeight;
    if (scrollRoom <= 0) return 0;
    return Math.min(1, Math.max(0, (window.scrollY - zoneTop) / scrollRoom));
  }

  /* ── section1 zone 높이: Seamless + Payments 애니메이션 분량만 ── */
  function updateSection1ZoneHeight() {
    const zone    = document.getElementById('zone-section1');
    const section = document.getElementById('section1-company-intro');
    if (!zone || !section) return;
    zone.style.height = (section.offsetHeight + window.innerHeight * 1.0) + 'px';
  }

  /* ── section2 zone 높이: 타이틀+첫줄 카드 애니메이션 분량만 ── */
  function updateSection2ZoneHeight() {
    const zone    = document.getElementById('zone-section2');
    const section = document.getElementById('section2-business-services');
    if (!zone || !section) return;
    zone.style.height = (section.offsetHeight + window.innerHeight * 0.8) + 'px';
  }

  /* ── section3 zone 높이: 1.5B USD + 2.1M 분량만 ── */
  function updateSection3ZoneHeight() {
    const zone    = document.getElementById('zone-section3');
    const section = document.getElementById('section3-count');
    if (!zone || !section) return;
    zone.style.height = (section.offsetHeight + window.innerHeight * 0.8) + 'px';
  }

  /* ── footer: 자연 흐름 (sticky/zone 높이 확장 없음) ── */

  /* ── section5 zone 높이: 자동 재생 시간 확보용 (vh×1) ── */
  function updateSection5ZoneHeight() {
    const zone    = document.getElementById('zone-section5');
    const section = document.getElementById('section5-remittance');
    if (!zone || !section) return;
    zone.style.height = (section.offsetHeight + window.innerHeight * 1.0) + 'px';
  }

  /* ── IntersectionObserver 헬퍼: zone이 뷰포트에 들어올 때 트리거 ── */
  function observeZone(zoneId, onEnter, onLeave) {
    const zone = document.getElementById(zoneId);
    if (!zone) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) onEnter();
        else onLeave();
      });
    }, { threshold: 0.01 });
    observer.observe(zone);
  }

  /* ── Section 1: 스크롤 연동 순차 등장 ──────────────────────────────
     zone progress 0→1 에 따라 각 라인·부제가 화면 아래에서 올라옴.
     opacity 없음, translateY만 사용. 부제는 등장 후 아래로 다시 내려감. */
  function setupSection1Intro() {
    const section = document.getElementById('section1-company-intro');
    if (!section) return;
    const lines = Array.from(section.querySelectorAll('.intro-line'));
    const sub   = section.querySelector('.intro-sub');
    if (!lines.length) return;

    /* 감속 이징 */
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    /* p를 [a,b] 구간에서 0→1로 변환 */
    function remap(p, a, b) { return Math.max(0, Math.min(1, (p - a) / (b - a))); }

    if (prefersReducedMotion) {
      lines.forEach(l => { l.style.transform = 'translateY(0)'; });
      if (sub) sub.style.transform = 'translateY(0)';
      return;
    }

    function update() {
      const SLIDE = window.innerHeight; // 뷰포트 밖에서 시작
      const p = getZoneProgress('zone-section1', 'section1-company-intro');

      // 0 Seamless : 히어로→섹션1 진입 시점에 올라옴. p 0.00 → 0.22
      lines[0] && (lines[0].style.transform =
        `translateY(${(1 - easeOut(remap(p, 0.00, 0.22))) * SLIDE}px)`);

      // 1 Payments : 스티키 구간 중반에 올라옴. p 0.30 → 0.60
      lines[1] && (lines[1].style.transform =
        `translateY(${(1 - easeOut(remap(p, 0.30, 0.60))) * SLIDE}px)`);

      // 2 Boundless : 스티키 해제 직전 자연스럽게 올라옴. p 0.70 → 0.95
      lines[2] && (lines[2].style.transform =
        `translateY(${(1 - easeOut(remap(p, 0.70, 0.95))) * SLIDE}px)`);

      // 부제 : 그 뒤를 따라 자연스럽게 등장. p 0.85 → 1.00
      if (sub) {
        sub.style.transform = `translateY(${(1 - easeOut(remap(p, 0.85, 1.00))) * SLIDE}px)`;
      }
    }

    // 초기값: 모두 화면 아래(뷰포트 높이만큼)
    const initialSlide = window.innerHeight;
    lines.forEach(l => { l.style.transform = `translateY(${initialSlide}px)`; });
    if (sub) sub.style.transform = `translateY(${initialSlide}px)`;

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', () => { updateSection1ZoneHeight(); update(); }, { passive: true });
    update();
  }

  /* ── Section 2: 스크롤 연동 sticky (타이틀+카드1·2) + 카드3·4 IntersectionObserver ── */
  function setupSection2Sticky() {
    const section = document.getElementById('section2-business-services');
    if (!section) return;
    const titleInners  = Array.from(section.querySelectorAll('.biz-title-inner'));
    const allCards     = Array.from(section.querySelectorAll('.biz-card'));
    const scrollCards  = allCards.slice(0, 2); // sticky 구간에서 scroll-linked
    const observeCards = allCards.slice(2);    // sticky 해제 후 IntersectionObserver
    if (!titleInners.length && !allCards.length) return;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function remap(p, a, b) { return Math.max(0, Math.min(1, (p - a) / (b - a))); }

    if (prefersReducedMotion) {
      titleInners.forEach(l => { l.style.transform = 'translateY(0)'; });
      allCards.forEach(c => { c.style.transform = 'translateY(0)'; c.style.opacity = '1'; });
      return;
    }

    /* 카드 3·4: 초기 숨김 + CSS transition으로 IntersectionObserver 트리거 */
    observeCards.forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(80px)';
      c.style.transition = `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s,
                             transform 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s`;
    });
    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    observeCards.forEach(c => cardObserver.observe(c));

    /* scroll-linked 초기값 */
    function initStyles() {
      const SLIDE = window.innerHeight;
      titleInners.forEach(l => { l.style.transition = 'none'; l.style.transform = `translateY(${SLIDE}px)`; });
      scrollCards.forEach(c => { c.style.transition = 'none'; c.style.opacity = '1'; c.style.transform = `translateY(${SLIDE}px)`; });
    }
    initStyles();

    function update() {
      const SLIDE = window.innerHeight;
      const p = getZoneProgress('zone-section2', 'section2-business-services');

      // 타이틀 2줄: 진입 초반
      titleInners[0] && (titleInners[0].style.transform = `translateY(${(1 - easeOut(remap(p, 0.00, 0.20))) * SLIDE}px)`);
      titleInners[1] && (titleInners[1].style.transform = `translateY(${(1 - easeOut(remap(p, 0.08, 0.28))) * SLIDE}px)`);

      // 카드 1·2 (첫줄): scroll-linked, 끝 무렵에 sticky 해제
      scrollCards[0] && (scrollCards[0].style.transform = `translateY(${(1 - easeOut(remap(p, 0.25, 0.65))) * SLIDE}px)`);
      scrollCards[1] && (scrollCards[1].style.transform = `translateY(${(1 - easeOut(remap(p, 0.40, 0.85))) * SLIDE}px)`);
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', () => { updateSection2ZoneHeight(); initStyles(); update(); }, { passive: true });
    update();
  }

  /* ── Section 3 카운트: sticky(1.5B·2.1M) + 이후 IntersectionObserver(3M+·18·35) ── */
  function setupSection3Count() {
    const section = document.getElementById('section3-count');
    if (!section) return;
    const items = Array.from(section.querySelectorAll('.count-reveal'));
    if (!items.length) return;

    if (prefersReducedMotion) { items.forEach(item => item.classList.add('is-set')); return; }

    items.forEach(item => item.classList.remove('is-set'));

    const stickyItems  = items.slice(0, 2); // 1.5B USD, 2.1M — scroll-linked
    const observeItems = items.slice(2);    // 3M+, 18 Countries, 35 Global — zone 완료 후

    /* sticky 구간: p=0.10 → 1.5B USD, p=0.35 → 2.1M */
    const triggers = [0.10, 0.35];
    let observerStarted = false;

    function update() {
      const p = getZoneProgress('zone-section3', 'section3-count');
      stickyItems.forEach((item, i) => {
        if (p >= triggers[i]) item.classList.add('is-set');
        else                  item.classList.remove('is-set');
      });

      /* zone 거의 완료(p≥0.95) 시점에 나머지 아이템 관찰 시작 */
      if (!observerStarted && p >= 0.95) {
        observerStarted = true;
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-set');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
        observeItems.forEach(item => observer.observe(item));
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', () => { updateSection3ZoneHeight(); update(); }, { passive: true });
    update();
  }

  /* ── Section 5 리밋: sticky 고정 시점 감지 후 자동 재생 ── */
  function setupSection5Remit() {
    const section = document.getElementById('section5-remittance');
    if (!section) return;
    const items = Array.from(section.querySelectorAll('.remit-reveal'));
    if (!items.length) return;

    if (prefersReducedMotion) { items.forEach(item => item.classList.add('is-set')); return; }

    items.forEach(item => item.classList.remove('is-set'));

    let played = false;
    let timers  = [];

    function play() {
      played = true;
      timers.forEach(clearTimeout);
      timers = [];
      items.forEach((item, i) => {
        timers.push(setTimeout(() => item.classList.add('is-set'), i * 280));
      });
      window.removeEventListener('scroll', check, true);
    }

    function check() {
      if (played) return;
      const rect = section.getBoundingClientRect();
      /* sticky top:0 에 고정된 순간 — rect.top이 0 이하이고 섹션이 충분히 보임 */
      if (rect.top <= 1 && rect.bottom > window.innerHeight * 0.4) {
        play();
      }
    }

    window.addEventListener('scroll', check, { passive: true, capture: true });
    check(); /* 초기 위치가 이미 조건을 만족하는 경우 대비 */
  }

  /* ── Footer: sticky 고정 시점 감지 후 자동 재생 ── */
  function setupFooter() {
    const footer = document.getElementById('section6-footer');
    if (!footer) return;
    const items = Array.from(footer.querySelectorAll('.reveal-up'));
    if (!items.length) return;

    if (prefersReducedMotion) { items.forEach(item => item.classList.add('is-visible')); return; }

    let played = false;
    let timers  = [];

    function play() {
      played = true;
      timers.forEach(clearTimeout);
      timers = [];
      items.forEach((item, i) => {
        timers.push(setTimeout(() => item.classList.add('is-visible'), i * 180));
      });
      window.removeEventListener('scroll', check, true);
    }

    function check() {
      if (played) return;
      const rect = footer.getBoundingClientRect();
      if (rect.top <= 1 && rect.bottom > footer.offsetHeight * 0.4) {
        play();
      }
    }

    window.addEventListener('scroll', check, { passive: true, capture: true });
    check();
  }

  /* ── Hero 텍스트 순차 등장 (페이지 로드 직후) ── */
  function setupHeroReveal() {
    const block = document.querySelector('.hero-reveal');
    if (!block) return;
    if (prefersReducedMotion) { block.classList.add('is-visible'); return; }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      block.classList.add('is-visible');
    }));
  }

  /* ── 섹션 타이틀 순차 등장 (뷰포트 진입 시 트리거) ── */
  function setupSectionReveal() {
    const blocks = document.querySelectorAll('.section-reveal');
    if (!blocks.length) return;
    if (prefersReducedMotion) { blocks.forEach(b => b.classList.add('is-visible')); return; }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    blocks.forEach(b => observer.observe(b));
  }

  /* ── Hero 타이틀: 스크롤 시 살짝 위로 ── */
  function setupHeroTitleMotion() {
    const hero  = document.getElementById('hero');
    const block = hero?.querySelector('[data-name="Hero Title EN"]');
    if (!hero || !block || prefersReducedMotion) return;

    const tick = () => {
      const r = hero.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, 1 - r.bottom / (r.height + 120)));
      block.style.transform = `translateY(${(1 - t) * 36}px)`;
    };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    tick();
  }

  /* ── 일반 reveal (IntersectionObserver) ── */
  function setupReveal(selector, options = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    const visibleClass = options.visibleClass || 'is-visible';

    if (prefersReducedMotion) { els.forEach(el => el.classList.add(visibleClass)); return; }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add(visibleClass);
        else entry.target.classList.remove(visibleClass);
      });
    }, {
      threshold:  options.threshold  ?? 0.06,
      rootMargin: options.rootMargin ?? '0px 0px 18% 0px',
    });
    els.forEach(el => observer.observe(el));
  }

  /* ── 3D 카드 캐러셀 ── */
  function initCarousel(opts) {
    const { hostEl, cards, cardW, cardH, overlayRight } = opts;
    const sceneEl = hostEl.querySelector('.carousel-scene');
    if (!sceneEl) return;

    let active = 0;
    let isAnimating = false;

    function getRelativePos(index) {
      const total = cards.length;
      let diff = index - active;
      if (diff >  total / 2) diff -= total;
      if (diff < -total / 2) diff += total;
      return diff;
    }

    function getCardStyle(position) {
      const abs = Math.abs(position);
      if (position === 0) {
        return { transform: 'translateX(0px) scale(1.12) rotateY(0deg)', zIndex: 100, opacity: 1, filter: 'brightness(1)' };
      }
      const dir = position > 0 ? 1 : -1;
      return {
        transform: `translate3d(${dir * (220 + (abs - 1) * 150)}px,0,${-abs * 120}px) scale(${1 - abs * 0.12}) rotateY(${dir * -32}deg)`,
        zIndex: 100 - abs, opacity: 1, filter: 'brightness(0.65)',
      };
    }

    function renderCards() {
      cards.forEach((card, index) => {
        const position = getRelativePos(index);
        const style    = getCardStyle(position);
        let el = sceneEl.querySelector(`[data-cid="${card.id}"]`);
        if (!el) {
          el = document.createElement('div');
          el.className = 'carousel-card';
          el.setAttribute('data-cid', card.id);
          el.style.width  = cardW + 'px';
          el.style.height = cardH + 'px';
          Object.assign(el.style, style);
          el.innerHTML = `
            <div style="background-color:${card.color};width:100%;height:100%;position:relative;">
              <img src="${card.icon}" class="carousel-card-icon" alt="" />
              <div class="carousel-overlay" style="${overlayRight ? `right:${overlayRight};` : ''}">
                <div class="carousel-num">0${card.id}</div>
                <div class="carousel-title">${card.title}</div>
              </div>
              <div class="carousel-reflection"></div>
            </div>`;
          sceneEl.appendChild(el);
        }
        requestAnimationFrame(() => Object.assign(el.style, style));
      });
    }

    renderCards();

    function onWheel(e) {
      const atEnd   = active === cards.length - 1;
      const atStart = active === 0;
      const down    = e.deltaY > 0;
      if ((atEnd && down) || (atStart && !down)) return;
      e.preventDefault();
      if (isAnimating) return;
      isAnimating = true;
      active = down ? (active + 1) % cards.length : (active - 1 + cards.length) % cards.length;
      renderCards();
      setTimeout(() => { isAnimating = false; }, 1150);
    }

    hostEl.addEventListener('pointerenter', () => { hostEl._carouselWheel = onWheel; });
    hostEl.addEventListener('pointerleave', () => { hostEl._carouselWheel = null; });
  }

  function setupCarousels() {
    const host1 = document.getElementById('carousel1-host');
    if (host1) {
      initCarousel({
        hostEl: host1, cardW: 250, cardH: 400,
        cards: [
          { id: 1, title: 'Electronic Payment Gateway (PG)',        color: '#EA4109', icon: 'assets/certificate.png' },
          { id: 2, title: 'Prepaid Electronic Payment Instrument',  color: '#E52006', icon: 'assets/certificate.png' },
          { id: 3, title: 'Foreign Exchange Business',              color: '#BC1313', icon: 'assets/certificate.png' },
          { id: 4, title: 'Currency Exchange',                      color: '#EA4109', icon: 'assets/certificate.png' },
          { id: 5, title: 'Small-Amount Overseas Remittance',       color: '#E52006', icon: 'assets/certificate.png' },
          { id: 6, title: 'Escrow<br>Service',                       color: '#BC1313', icon: 'assets/certificate.png' },
        ],
      });
    }

    const host2 = document.getElementById('carousel2-host');
    if (host2) {
      initCarousel({
        hostEl: host2, cardW: 320, cardH: 360, overlayRight: '32px',
        cards: [
          { id: 1, title: 'Financial<br>Transaction<br>Brokerage',       color: '#EA4109', icon: 'assets/certificate.png' },
          { id: 2, title: 'Duty-Free<br>Purchase<br>Settlement',       color: '#E52006', icon: 'assets/certificate.png' },
          { id: 3, title: 'Mobile Augmented<br>Space Acceleration',    color: '#BC1313', icon: 'assets/certificate.png' },
          { id: 4, title: 'Ultrasonic Payment<br>Technology',          color: '#EA4109', icon: 'assets/certificate.png' },
        ],
      });
    }

    window.addEventListener('wheel', (e) => {
      document.querySelectorAll('.carousel-host').forEach(h => { if (h._carouselWheel) h._carouselWheel(e); });
    }, { passive: false });
  }

  /* ── 임베드 카드 캐러셀 (auto-rotate + hover) ── */
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
      if (diff >  total / 2) diff -= total;
      if (diff < -total / 2) diff += total;
      return diff;
    }

    function getCardStyle(position) {
      const abs = Math.abs(position);
      if (position === 0) {
        return {
          transform: 'translate3d(0px, 0, 0) scale(1.12) rotateY(0deg)',
          zIndex: '100', opacity: '1', filter: 'brightness(1)'
        };
      }
      const dir = position > 0 ? 1 : -1;
      const x = dir * (baseX + (abs - 1) * stepX);
      const z = -abs * 120;
      const scale = 1 - abs * 0.12;
      const rotateY = dir * -32;
      return {
        transform: `translate3d(${x}px, 0, ${z}px) scale(${scale}) rotateY(${rotateY}deg)`,
        zIndex: String(100 - abs), opacity: '1', filter: 'brightness(0.65)'
      };
    }

    function render() {
      cards.forEach((card, index) => {
        const el = cardElements[index];
        const style = getCardStyle(getRelativePosition(index));
        el.style.transform = style.transform;
        el.style.zIndex   = style.zIndex;
        el.style.opacity  = style.opacity;
        el.style.filter   = style.filter;
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
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
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
        if (active !== index) { active = index; render(); }
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
    const cards1 = [
      { id: 1, title: 'Electronic Payment Gateway(PG)',         color: '#EA4109', icon: 'assets/certificate.png' },
      { id: 2, title: 'Prepaid Electronic Payment InstrumentE', color: '#E52006', icon: 'assets/certificate.png' },
      { id: 3, title: 'Foreign Exchange Business',              color: '#BC1313', icon: 'assets/certificate.png' },
      { id: 4, title: 'Currency Exchange',                      color: '#EA4109', icon: 'assets/certificate.png' },
      { id: 5, title: 'Small-Amount Overseas Remittance',       color: '#E52006', icon: 'assets/certificate.png' },
      { id: 6, title: 'Escrow<br />Service',                    color: '#BC1313', icon: 'assets/certificate.png' }
    ];
    const cards2 = [
      { id: 1, title: 'Financial<br />Transaction<br />Brokerage',    color: '#EA4109', icon: 'assets/certificate.png' },
      { id: 2, title: 'Duty-Free<br />Purchase<br />Settlement',       color: '#E52006', icon: 'assets/certificate.png' },
      { id: 3, title: 'Mobile<br />Augmented Space<br />Acceleration', color: '#BC1313', icon: 'assets/certificate.png' },
      { id: 4, title: 'Ultrasonic<br />Payment<br />Technology',       color: '#EA4109', icon: 'assets/certificate.png' }
    ];
    document.querySelectorAll('[data-carousel="1"]').forEach(host => {
      initEmbedCarousel(host, cards1, { baseX: 170, stepX: 140 });
    });
    document.querySelectorAll('[data-carousel="2"]').forEach(host => {
      initEmbedCarousel(host, cards2, { baseX: 220, stepX: 150 });
    });
  }

  /* ── section2-card: 4개 카드가 순서대로 올라오며 내부 이미지/텍스트 페이드인 ── */
  function setupSection2Card() {
    const wrap = document.getElementById('section2-card');
    if (!wrap) return;
    const cards = Array.from(wrap.querySelectorAll('.s2c-card'));
    if (!cards.length) return;

    if (prefersReducedMotion) {
      cards.forEach(c => c.classList.add('is-in'));
      return;
    }

    let started = false;
    function checkAndStart() {
      if (started) return;
      /* "One Platform. Every Payment." 타이틀이 settle된 시점(zone progress >= 0.30)
         부터 카드 시퀀스 시작 */
      const p = getZoneProgress('zone-section2', 'section2-business-services');
      if (p < 0.30) return;

      started = true;
      cards.forEach(c => c.classList.add('is-in'));
      window.removeEventListener('scroll', checkAndStart);
    }

    window.addEventListener('scroll', checkAndStart, { passive: true });
    checkAndStart();
  }

  /* ── Footer 자연 등장 (IntersectionObserver) ── */
  function setupFooterReveal() {
    const footer = document.getElementById('section6-footer');
    if (!footer) return;
    if (prefersReducedMotion) { footer.style.opacity = '1'; footer.style.transform = 'translateY(0)'; return; }
    footer.style.opacity = '0';
    footer.style.transform = 'translateY(48px)';
    footer.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)';
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(footer);
  }

  /* ── Init ── */
  updateSection1ZoneHeight();
  updateSection2ZoneHeight();
  updateSection3ZoneHeight();
  updateSection5ZoneHeight();
  setupSection1Intro();
  setupSection2Sticky();
  setupSection3Count();
  setupSection5Remit();
  setupHeroReveal();
  setupSectionReveal();
  setupHeroTitleMotion();
  setupReveal('.debunk-video-wrap', { threshold: 0.1 });
  setupFooterReveal();
  setupEmbeddedCarousels();
  setupSection2Card();

})();
