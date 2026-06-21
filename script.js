const slides = document.querySelectorAll('.slide');
  const TOTAL = slides.length;
  let cur = 0;

  
  const bodies = document.querySelectorAll('.slide-body');
  bodies.forEach(body => {
    body.dataset.originalHTML = body.innerHTML;
  });

  let typewriteTimeout;
  function typewrite(element) {
    clearTimeout(typewriteTimeout);
    if (!element) return;
    element.innerHTML = element.dataset.originalHTML;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while(node = walker.nextNode()) textNodes.push(node);
    
    const originalTexts = textNodes.map(n => n.nodeValue);
    textNodes.forEach(n => n.nodeValue = '');
    
    let nodeIndex = 0;
    let charIndex = 0;
    
    function typeChar() {
      if (nodeIndex >= textNodes.length) return;
      const n = textNodes[nodeIndex];
      const text = originalTexts[nodeIndex];
      
      if (charIndex < text.length) {
        n.nodeValue += text[charIndex];
        charIndex++;
        typewriteTimeout = setTimeout(typeChar, 10);
      } else {
        nodeIndex++;
        charIndex = 0;
        typewriteTimeout = setTimeout(typeChar, 10);
      }
    }
    typeChar();
  }

  const dotsEl = document.getElementById('dots');
  for (let i = 0; i < TOTAL; i++) {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.onclick = () => go(i);
    dotsEl.appendChild(d);
  }

  function initHUD() {
    slides.forEach((slide, idx) => {
      const fill = slide.querySelector('.hud-fill');
      const label = slide.querySelector('.hud-label');
      if (fill && label) {
        let pct = Math.round(((TOTAL - 1 - idx) / (TOTAL - 1)) * 100);
        if (pct < 0) pct = 0;
        
        fill.style.width = pct + '%';
        label.innerHTML = `❤ HP [${TOTAL - 1 - idx}/${TOTAL - 1}]`;
        
        const hud = slide.querySelector('.hud');
        if (hud) {
          if (pct < 25) {
            hud.classList.add('hud-critical');
          } else {
            hud.classList.remove('hud-critical');
          }
        }

        // Dynamically color based on percentage
        if (pct < 25) {
          fill.style.backgroundColor = '#FF3333';
          fill.style.boxShadow = '0 0 8px rgba(255, 51, 51, 0.6)';
        } else if (pct < 60) {
          fill.style.backgroundColor = '#FFCC00';
          fill.style.boxShadow = '0 0 8px rgba(255, 204, 0, 0.6)';
        } else {
          fill.style.backgroundColor = '#00FF41';
          fill.style.boxShadow = '0 0 8px rgba(0, 255, 65, 0.6)';
        }
      }
    });
  }

  function go(n) {
    if (n < 0 || n >= TOTAL) return;
    document.getElementById('s' + cur).classList.remove('active');
    dotsEl.children[cur].classList.remove('active');
    
    cur = n;
    
    const nextSlide = document.getElementById('s' + cur);
    nextSlide.classList.add('active');
    
    // Add damage flash effect to HUD
    const hud = nextSlide.querySelector('.hud');
    if (hud) {
      hud.classList.add('damage-flash');
      setTimeout(() => {
        hud.classList.remove('damage-flash');
      }, 400);
    }

    // Trigger typewriter for this slide
    const bodyEl = nextSlide.querySelector('.slide-body');
    typewrite(bodyEl);
    
    dotsEl.children[cur].classList.add('active');
    document.getElementById('btn-prev').disabled = cur === 0;
    document.getElementById('btn-next').disabled = cur === TOTAL - 1;
    document.getElementById('counter').textContent = cur + ' / ' + (TOTAL - 1);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(cur + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    if (e.key === 'f' || e.key === 'F') toggleFS();
    if (e.key === 'h' || e.key === 'H') toggleUI();
  });

  function toggleFS() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }

  function toggleUI() {
    document.body.classList.toggle('ui-hidden');
  }

  // Initialize HUD for all slides on load
  initHUD();
  // Initialize typewriter for the first slide if it has a body
  typewrite(document.getElementById('s0').querySelector('.slide-body'));