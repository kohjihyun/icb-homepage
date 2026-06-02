(function () {
  const cards = [
    { id: 1, title: 'Financial<br />Transaction<br />Brokerage',          color: '#EA4109', icon: 'assets/certificate.png' },
    { id: 2, title: 'Duty-Free<br />Purchase<br />Settlement',             color: '#E52006', icon: 'assets/certificate.png' },
    { id: 3, title: 'Mobile<br />Augmented Space<br />Acceleration',       color: '#BC1313', icon: 'assets/certificate.png' },
    { id: 4, title: 'Ultrasonic<br />Payment<br />Technology',             color: '#EA4109', icon: 'assets/certificate.png' }
  ];

  const AUTO_ROTATE_MS = 1500;

  const scene = document.getElementById('scene');
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
        filter: 'brightness(1)'
      };
    }
    const direction = position > 0 ? 1 : -1;
    const x = direction * (220 + (abs - 1) * 150);
    const z = -abs * 120;
    const scale = 1 - abs * 0.12;
    const rotateY = direction * -32;
    return {
      transform: `translate3d(${x}px, 0, ${z}px) scale(${scale}) rotateY(${rotateY}deg)`,
      zIndex: String(100 - abs),
      opacity: '1',
      filter: 'brightness(0.65)'
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

  function buildCards() {
    cards.forEach((card, index) => {
      const el = document.createElement('div');
      el.className = 'card';
      el.dataset.id = card.id;

      const content = document.createElement('div');
      content.className = 'card-content';
      content.style.backgroundColor = card.color;

      const icon = document.createElement('img');
      icon.src = card.icon;
      icon.className = 'card-icon';
      icon.alt = '';

      const overlay = document.createElement('div');
      overlay.className = 'overlay';

      const num = document.createElement('div');
      num.className = 'small-text';
      num.textContent = '0' + card.id;

      const title = document.createElement('div');
      title.className = 'title';
      title.innerHTML = card.title;

      overlay.appendChild(num);
      overlay.appendChild(title);

      const reflection = document.createElement('div');
      reflection.className = 'reflection';

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

  buildCards();
  render();
  startAutoRotate();
})();
