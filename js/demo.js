/**
 * Matchic — Interactive Product Demo
 * Phone mockup with 4 states: Empty → Scan → Closet → Occasion → Outfit
 * No backend, pure HTML/CSS/JS, accessible
 */

(function() {
  'use strict';

  const DEMO_ITEMS = [
    { id: 'shirt1', name: 'White Shirt', emoji: '👔', color: '#fff', textColor: '#333', tags: ['Top', 'White', 'Casual'] },
    { id: 'pants1', name: 'Black Trousers', emoji: '👖', color: '#2d2d2d', textColor: '#fff', tags: ['Bottom', 'Black', 'Formal'] },
    { id: 'jacket1', name: 'Denim Jacket', emoji: '🧥', color: '#5B7FA3', textColor: '#fff', tags: ['Outer', 'Blue', 'Casual'] },
    { id: 'shoes1', name: 'Sneakers', emoji: '👟', color: '#f0f0f0', textColor: '#333', tags: ['Shoes', 'White', 'Casual'] },
    { id: 'sweater1', name: 'Cream Sweater', emoji: '🧶', color: '#F5DEB3', textColor: '#5a4a3a', tags: ['Top', 'Cream', 'Cozy'] },
    { id: 'skirt1', name: 'Midi Skirt', emoji: '👗', color: '#8B4513', textColor: '#fff', tags: ['Bottom', 'Brown', 'Elegant'] }
  ];

  const OUTFITS = {
    work: {
      name: 'Work Day',
      items: ['shirt1', 'pants1'],
      desc: 'Professional \u0026 polished'
    },
    weekend: {
      name: 'Weekend Vibe',
      items: ['jacket1', 'sweater1', 'shoes1'],
      desc: 'Relaxed \u0026 stylish'
    },
    date: {
      name: 'Date Night',
      items: ['skirt1', 'shirt1'],
      desc: 'Elegant \u0026 confident'
    },
    rainy: {
      name: 'Rainy Day',
      items: ['jacket1', 'pants1', 'shoes1'],
      desc: 'Practical \u0026 dry'
    }
  };

  const STATES = ['empty', 'scan', 'closet', 'occasion', 'outfit'];
  let currentState = 0;
  let collectedItems = [];
  let currentOutfit = null;

  // Insert demo HTML into page
  function initDemo() {
    const container = document.getElementById('interactive-demo');
    if (!container) return;

    container.innerHTML = `
      <div class="demo-phone" role="region" aria-label="Matchic app demo">
        <div class="demo-phone-notch"></div>
        <div class="demo-screen" id="demo-screen">
          <!-- State 1: Empty -->
          <div class="demo-state demo-state-empty" data-state="empty">
            <div class="demo-empty-illustration">
              <div class="demo-hanger"></div>
              <p class="demo-empty-text">Your closet is empty</p>
              <p class="demo-empty-sub">Add your first item to get outfit ideas</p>
            </div>
            <button class="demo-btn demo-btn-primary" onclick="window.matchicDemo.addItem()">
              <span aria-hidden="true">+</span> Add Item
            </button>
          </div>

          <!-- State 2: Scanning -->
          <div class="demo-state demo-state-scan" data-state="scan" hidden>
            <div class="demo-scan-header">Scanning...</div>
            <div class="demo-scan-frame">
              <div class="demo-scan-corner demo-scan-tl"></div>
              <div class="demo-scan-corner demo-scan-tr"></div>
              <div class="demo-scan-corner demo-scan-bl"></div>
              <div class="demo-scan-corner demo-scan-br"></div>
              <div class="demo-scan-item" id="demo-scan-item"></div>
              <div class="demo-scan-bar"></div>
            </div>
            <div class="demo-tags" id="demo-tags" aria-live="polite"></div>
          </div>

          <!-- State 3: Closet -->
          <div class="demo-state demo-state-closet" data-state="closet" hidden>
            <div class="demo-closet-header">My Closet <span class="demo-closet-count" id="demo-closet-count">0 items</span></div>
            <div class="demo-closet-grid" id="demo-closet-grid"></div>
            <button class="demo-btn demo-btn-secondary" onclick="window.matchicDemo.addItem()">+ Add Another</button>
            <button class="demo-btn demo-btn-primary" onclick="window.matchicDemo.pickOccasion()">✨ Get Outfit Idea</button>
          </div>

          <!-- State 4: Occasion -->
          <div class="demo-state demo-state-occasion" data-state="occasion" hidden>
            <div class="demo-occasion-title">Where are you going?</div>
            <div class="demo-occasion-grid">
              <button class="demo-occasion-card" onclick="window.matchicDemo.generateOutfit('work')">
                <span class="demo-occasion-emoji">💼</span>
                <span class="demo-occasion-name">Work</span>
              </button>
              <button class="demo-occasion-card" onclick="window.matchicDemo.generateOutfit('weekend')">
                <span class="demo-occasion-emoji">🌴</span>
                <span class="demo-occasion-name">Weekend</span>
              </button>
              <button class="demo-occasion-card" onclick="window.matchicDemo.generateOutfit('date')">
                <span class="demo-occasion-emoji">🌙</span>
                <span class="demo-occasion-name">Date Night</span>
              </button>
              <button class="demo-occasion-card" onclick="window.matchicDemo.generateOutfit('rainy')">
                <span class="demo-occasion-emoji">🌧️</span>
                <span class="demo-occasion-name">Rainy Day</span>
              </button>
            </div>
            <button class="demo-btn demo-btn-ghost" onclick="window.matchicDemo.goTo('closet')">← Back to Closet</button>
          </div>

          <!-- State 5: Outfit -->
          <div class="demo-state demo-state-outfit" data-state="outfit" hidden>
            <div class="demo-outfit-label" id="demo-outfit-label"></div>
            <div class="demo-outfit-desc" id="demo-outfit-desc"></div>
            <div class="demo-outfit-pieces" id="demo-outfit-pieces"></div>
            <div class="demo-outfit-actions">
              <button class="demo-btn demo-btn-secondary" onclick="window.matchicDemo.shuffleOutfit()">🔀 Shuffle</button>
              <button class="demo-btn demo-btn-primary" onclick="window.matchicDemo.saveOutfit()">💾 Save</button>
            </div>
            <button class="demo-btn demo-btn-ghost" onclick="window.matchicDemo.pickOccasion()">← Pick Another Occasion</button>
          </div>
        </div>

        <div class="demo-nav">
          <button class="demo-nav-btn active" data-nav="closet" onclick="window.matchicDemo.goTo('closet')">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Closet
          </button>
          <button class="demo-nav-btn" data-nav="outfit" onclick="window.matchicDemo.goTo('occasion')">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            Outfit
          </button>
        </div>
      </div>

      <div class="demo-controls">
        <button class="demo-ctrl-btn" onclick="window.matchicDemo.reset()">🔄 Reset Demo</button>
        <div class="demo-hint">Tip: Try adding items, then pick an occasion to see outfit suggestions.</div>
      </div>
    `;

    renderCloset();
  }

  function showState(name) {
    document.querySelectorAll('.demo-state').forEach(s => {
      s.hidden = s.dataset.state !== name;
    });

    // Update nav
    document.querySelectorAll('.demo-nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.nav === name || (name === 'outfit' && b.dataset.nav === 'outfit'));
    });

    currentState = STATES.indexOf(name);
  }

  function renderCloset() {
    const grid = document.getElementById('demo-closet-grid');
    const count = document.getElementById('demo-closet-count');
    if (!grid) return;

    if (collectedItems.length === 0) {
      grid.innerHTML = '<p class="demo-closet-empty">Tap "Add Item" to start building your closet.</p>';
    } else {
      grid.innerHTML = collectedItems.map(id => {
        const item = DEMO_ITEMS.find(i => i.id === id);
        return `
          <div class="demo-closet-item" style="--item-bg:${item.color};--item-text:${item.textColor}">
            <span class="demo-closet-emoji" aria-hidden="true">${item.emoji}</span>
            <span class="demo-closet-name">${item.name}</span>
            <div class="demo-closet-tags">${item.tags.map(t=>`<span>${t}</span>`).join('')}</div>
          </div>
        `;
      }).join('');
    }

    if (count) count.textContent = `${collectedItems.length} item${collectedItems.length !== 1 ? 's' : ''}`;
  }

  function addItem() {
    if (collectedItems.length >= DEMO_ITEMS.length) {
      alert('Demo closet is full! Try generating an outfit.');
      return;
    }

    showState('scan');

    const nextItem = DEMO_ITEMS[collectedItems.length];
    const scanItem = document.getElementById('demo-scan-item');
    const tagsEl = document.getElementById('demo-tags');

    if (scanItem) {
      scanItem.style.background = nextItem.color;
      scanItem.textContent = nextItem.emoji;
    }

    if (tagsEl) tagsEl.innerHTML = '';

    // Simulate scanning with staggered tags
    setTimeout(() => {
      if (tagsEl) tagsEl.innerHTML += `<span class="demo-tag">${nextItem.tags[0]}</span>`;
    }, 600);
    setTimeout(() => {
      if (tagsEl) tagsEl.innerHTML += `<span class="demo-tag">${nextItem.tags[1]}</span>`;
    }, 1200);
    setTimeout(() => {
      if (tagsEl) tagsEl.innerHTML += `<span class="demo-tag">${nextItem.tags[2]}</span>`;
    }, 1800);

    // Finish scan
    setTimeout(() => {
      collectedItems.push(nextItem.id);
      renderCloset();
      showState('closet');
    }, 2500);
  }

  function pickOccasion() {
    if (collectedItems.length < 2) {
      alert('Add at least 2 items first!');
      showState('closet');
      return;
    }
    showState('occasion');
  }

  function generateOutfit(type) {
    currentOutfit = OUTFITS[type];
    renderOutfit();
    showState('outfit');
  }

  function renderOutfit() {
    if (!currentOutfit) return;

    const label = document.getElementById('demo-outfit-label');
    const desc = document.getElementById('demo-outfit-desc');
    const pieces = document.getElementById('demo-outfit-pieces');

    if (label) label.textContent = currentOutfit.name;
    if (desc) desc.textContent = currentOutfit.desc;

    if (pieces) {
      pieces.innerHTML = currentOutfit.items.map((id, idx) => {
        const item = DEMO_ITEMS.find(i => i.id === id);
        return `
          <div class="demo-outfit-piece" style="animation-delay:${idx * 0.15}s"
               role="img" aria-label="${item.name}">
            <span class="demo-outfit-emoji" aria-hidden="true">${item.emoji}</span>
            <span class="demo-outfit-piece-name">${item.name}</span>
          </div>
        `;
      }).join('');
    }
  }

  function shuffleOutfit() {
    const keys = Object.keys(OUTFITS);
    let next = keys[Math.floor(Math.random() * keys.length)];
    // Pick a different one
    while (OUTFITS[next].name === currentOutfit?.name && keys.length > 1) {
      next = keys[Math.floor(Math.random() * keys.length)];
    }
    currentOutfit = OUTFITS[next];
    renderOutfit();
  }

  function saveOutfit() {
    const btn = document.querySelector('.demo-state-outfit .demo-btn-primary');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ Saved!';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
      }, 1500);
    }
  }

  function goTo(state) {
    if (state === 'closet' && collectedItems.length === 0) {
      showState('empty');
    } else {
      showState(state);
    }
  }

  function reset() {
    collectedItems = [];
    currentOutfit = null;
    renderCloset();
    showState('empty');
  }

  // Expose globally
  window.matchicDemo = {
    init: initDemo,
    addItem,
    pickOccasion,
    generateOutfit,
    shuffleOutfit,
    saveOutfit,
    goTo,
    reset,
    showState
  };

  // Auto-init if container exists
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemo);
  } else {
    initDemo();
  }
})();
