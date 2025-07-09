// Visual Timeline for Toman Ecoss Timeline Page
// This script expects a <div id="visual-timeline"></div> in the HTML
// It parses the timeline events from the markdown (or you can define them here for now)

const timelineData = [
  // Insert a Gyre Shift marker before the first line
  {
    label: "Gyre Shift",
    isGyreShift: true,
    description: "A Gyre Shift marks the end of one Line and the beginning of another. The World Gyre changes rotation, triggering a new age.",
    icon: "<svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='18' cy='18' r='16' stroke='#5D3FD3' stroke-width='4' fill='#f8f7fc'/><path d='M18 6v6m0 12v6m6-12h6m-18 0H6m15.5-7.5l4.5 4.5m-13 13l-4.5 4.5m13-13l4.5-4.5m-13 13l-4.5-4.5' stroke='#8e44ad' stroke-width='2'/></svg>"
  },
  {
    label: "Point Zero",
    year: "Before Creation",
    title: "Cosmic Origins",
    link: null,
    description: "Zlellis and O'numeume meet in the Sourcewaters, establishing the duality that will become Toma."
  },
  {
    label: "Line from Origin",
    year: "0 R.T. - 634 R.T.",
    title: "The Beginning",
    link: "Line from Origin.html",
    description: "Creation of the plane by the Goda. The Nesa are birthed, and the Decara Kingdom worships Scream."
  },
  {
    label: "Gyre Shift",
    isGyreShift: true,
    description: "A Gyre Shift marks the end of one Line and the beginning of another. The World Gyre changes rotation, triggering a new age.",
    icon: "<svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='18' cy='18' r='16' stroke='#5D3FD3' stroke-width='4' fill='#f8f7fc'/><path d='M18 6v6m0 12v6m6-12h6m-18 0H6m15.5-7.5l4.5 4.5m-13 13l-4.5 4.5m13-13l4.5-4.5m-13 13l-4.5-4.5' stroke='#8e44ad' stroke-width='2'/></svg>"
  },
  {
    label: "Versagoth Line",
    year: "634 R.T. - 835 R.T.",
    title: "Natural War",
    link: "Versagoth Line.html",
    description: "Decara and Natura fight the Natural War. Gorisain achieves Nascension. Creation of Dar as a counterbalance."
  },
  {
    label: "Gyre Shift",
    isGyreShift: true,
    description: "A Gyre Shift marks the end of one Line and the beginning of another. The World Gyre changes rotation, triggering a new age.",
    icon: "<svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='18' cy='18' r='16' stroke='#5D3FD3' stroke-width='4' fill='#f8f7fc'/><path d='M18 6v6m0 12v6m6-12h6m-18 0H6m15.5-7.5l4.5 4.5m-13 13l-4.5 4.5m13-13l4.5-4.5m-13 13l-4.5-4.5' stroke='#8e44ad' stroke-width='2'/></svg>"
  },
  {
    label: "Line from Maturation",
    year: "835 R.T. - 1,386 R.T.",
    title: "Line of Nature Harmony",
    link: "Line from Maturation.html",
    description: "Balance between Bluma, Natura, Ferra, Celia. Huma and Monstra introduced. Goda return."
  },
  {
    label: "Gyre Shift",
    isGyreShift: true,
    description: "A Gyre Shift marks the end of one Line and the beginning of another. The World Gyre changes rotation, triggering a new age.",
    icon: "<svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='18' cy='18' r='16' stroke='#5D3FD3' stroke-width='4' fill='#f8f7fc'/><path d='M18 6v6m0 12v6m6-12h6m-18 0H6m15.5-7.5l4.5 4.5m-13 13l-4.5 4.5m13-13l4.5-4.5m-13 13l-4.5-4.5' stroke='#8e44ad' stroke-width='2'/></svg>"
  },
  {
    label: "Truthsayer Line",
    year: "1,386 R.T. - 1,698 R.T.",
    title: "Age of Voices",
    link: "Truthsayer Line.html",
    description: "Godan Voices rule through Nesa. Gorisain spreads corruption. First Chain of Delta forms."
  },
  {
    label: "Gyre Shift",
    isGyreShift: true,
    description: "A Gyre Shift marks the end of one Line and the beginning of another. The World Gyre changes rotation, triggering a new age.",
    icon: "<svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='18' cy='18' r='16' stroke='#5D3FD3' stroke-width='4' fill='#f8f7fc'/><path d='M18 6v6m0 12v6m6-12h6m-18 0H6m15.5-7.5l4.5 4.5m-13 13l-4.5 4.5m13-13l4.5-4.5m-13 13l-4.5-4.5' stroke='#8e44ad' stroke-width='2'/></svg>"
  },
  {
    label: "Phan Tenscia Line",
    year: "1,698 R.T. - 1,972 R.T.",
    title: "Era of Instability",
    link: "Phan Tenscia Line.html",
    description: "Gradient destabilized. Spira and magic spiral out of control. Magical phenomena become unpredictable."
  },
  {
    label: "Gyre Shift",
    isGyreShift: true,
    description: "A Gyre Shift marks the end of one Line and the beginning of another. The World Gyre changes rotation, triggering a new age.",
    icon: "<svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='18' cy='18' r='16' stroke='#5D3FD3' stroke-width='4' fill='#f8f7fc'/><path d='M18 6v6m0 12v6m6-12h6m-18 0H6m15.5-7.5l4.5 4.5m-13 13l-4.5 4.5m13-13l4.5-4.5m-13 13l-4.5-4.5' stroke='#8e44ad' stroke-width='2'/></svg>"
  },
  {
    label: "Line from Loss",
    year: "?",
    title: "Period of Rebirth",
    link: "Line from Loss.html",
    description: "Growth from loss. Societies rebuild. Structured spiritual and material development."
  },
  {
    label: "Gyre Shift",
    isGyreShift: true,
    description: "A Gyre Shift marks the end of one Line and the beginning of another. The World Gyre changes rotation, triggering a new age.",
    icon: "<svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='18' cy='18' r='16' stroke='#5D3FD3' stroke-width='4' fill='#f8f7fc'/><path d='M18 6v6m0 12v6m6-12h6m-18 0H6m15.5-7.5l4.5 4.5m-13 13l-4.5 4.5m13-13l4.5-4.5m-13 13l-4.5-4.5' stroke='#8e44ad' stroke-width='2'/></svg>"
  },
  {
    label: "Taxotheir Line",
    year: "?",
    title: "Systematic Classification",
    link: "Taxotheir Line.html",
    description: "Purpose Taxonomy begins. War over Hollow Resource. Systematic categorization."
  },
  {
    label: "Gyre Shift",
    isGyreShift: true,
    description: "A Gyre Shift marks the end of one Line and the beginning of another. The World Gyre changes rotation, triggering a new age.",
    icon: "<svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='18' cy='18' r='16' stroke='#5D3FD3' stroke-width='4' fill='#f8f7fc'/><path d='M18 6v6m0 12v6m6-12h6m-18 0H6m15.5-7.5l4.5 4.5m-13 13l-4.5 4.5m13-13l4.5-4.5m-13 13l-4.5-4.5' stroke='#8e44ad' stroke-width='2'/></svg>"
  },
  {
    label: "Cel Blindbirth Line",
    year: "?",
    title: "Celia Dominance",
    link: "Cel Blindbirth Line.html",
    description: "Celia forces dominate. Huma forced underground. Cultural transformation."
  },
  {
    label: "Gyre Shift",
    isGyreShift: true,
    description: "A Gyre Shift marks the end of one Line and the beginning of another. The World Gyre changes rotation, triggering a new age.",
    icon: "<svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='18' cy='18' r='16' stroke='#5D3FD3' stroke-width='4' fill='#f8f7fc'/><path d='M18 6v6m0 12v6m6-12h6m-18 0H6m15.5-7.5l4.5 4.5m-13 13l-4.5 4.5m13-13l4.5-4.5m-13 13l-4.5-4.5' stroke='#8e44ad' stroke-width='2'/></svg>"
  },
  {
    label: "Line from Few",
    year: "?",
    title: "Reclamation and Rebuilding",
    link: "Line from Few.html",
    description: "Huma emerge, reclaim surface. War of Conclusions. Recovery and adaptation."
  },
  {
    label: "Gyre Shift",
    isGyreShift: true,
    description: "A Gyre Shift marks the end of one Line and the beginning of another. The World Gyre changes rotation, triggering a new age.",
    icon: "<svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='18' cy='18' r='16' stroke='#5D3FD3' stroke-width='4' fill='#f8f7fc'/><path d='M18 6v6m0 12v6m6-12h6m-18 0H6m15.5-7.5l4.5 4.5m-13 13l-4.5 4.5m13-13l4.5-4.5m-13 13l-4.5-4.5' stroke='#8e44ad' stroke-width='2'/></svg>"
  },
  {
    label: "Current Line",
    year: "?",
    title: "Technological Advancement",
    link: "Current Line.html",
    description: "Automata introduced. Rapid advancement."
  },
  {
    label: "Gyre Shift",
    isGyreShift: true,
    description: "A Gyre Shift marks the end of one Line and the beginning of another. The World Gyre changes rotation, triggering a new age.",
    icon: "<svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='18' cy='18' r='16' stroke='#5D3FD3' stroke-width='4' fill='#f8f7fc'/><path d='M18 6v6m0 12v6m6-12h6m-18 0H6m15.5-7.5l4.5 4.5m-13 13l-4.5 4.5m13-13l4.5-4.5m-13 13l-4.5-4.5' stroke='#8e44ad' stroke-width='2'/></svg>"
  },
  {
    label: "Autka Hostilis Line",
    year: "Projected Future",
    title: "Virus Dominance",
    link: "Autka Hostilis Line.html",
    description: "Constructs and machines rise. Nadie dominate Wyldere. Gorisain's ambitions."
  }
];


function renderTimeline(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<div class="timeline-outer">
    ${timelineData.map((event, i) => {
      if (event.isGyreShift) {
        return `<div class="timeline-event gyre-shift">
          <div class="timeline-content timeline-gyre-shift">
            <div class="gyre-shift-icon">${event.icon || ''}</div>
            <div class="gyre-shift-label"><a href='Line.html' class='timeline-link'>Gyre Shift</a></div>
            <div class="gyre-shift-desc">${event.description}</div>
          </div>
        </div>`;
      } else {
        return `<div class="timeline-event${i%2===0 ? ' left' : ' right'}">
          <div class="timeline-content">
            <h3>${event.link ? `<a href="${event.link}" class="timeline-link">${event.label}</a>` : event.label} <span class="timeline-year">${event.year || ''}</span></h3>
            <h4>${event.title}</h4>
            <p>${event.description}</p>
          </div>
        </div>`;
      }
    }).join('')}
  </div>`;
}


document.addEventListener('DOMContentLoaded', function() {
  // Only render the draggable timeline panel if on scape_timeline.html
  if (window.location.pathname.endsWith('scape_timeline.html')) {
    renderTimelinePanel();
  } else if (document.getElementById('visual-timeline')) {
    renderTimeline('visual-timeline');
  }
});

// --- INTERACTIVE TIMELINE PANEL (BOTTOM PULL-UP) ---
function renderTimelinePanel() {
  // Insert panel HTML at end of body
  const panel = document.createElement('div');
  panel.className = 'timeline-panel';
  panel.innerHTML = `
    <div class="timeline-panel-bg" id="timeline-panel-bg"></div>
    <div class="timeline-panel-tab" id="timeline-panel-tab"></div>
    <div class="timeline-panel-content">
      <div class="timeline-slider">
        <div class="timeline-ticks" id="timeline-ticks"></div>
      </div>
      <div class="timeline-panel-event-content" id="timeline-panel-event-content"></div>
    </div>
  `;
  document.body.appendChild(panel);

  // Panel drag logic
  let isDragging = false, startY = 0, startPanelY = 0;
  const tab = document.getElementById('timeline-panel-tab');
  tab.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    startPanelY = panel.getBoundingClientRect().top;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let dy = e.clientY - startY;
    let vh = window.innerHeight;
    let newTop = Math.max(startPanelY + dy, vh * 0.2);
    let maxTop = vh - 80;
    if (newTop > maxTop) newTop = maxTop;
    panel.style.transition = 'none';
    panel.style.transform = `translateY(${((newTop - (vh * 0.2)) / (vh * 0.8)) * 70}%)`;
  });
  document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.userSelect = '';
    // Snap open/closed
    let panelRect = panel.getBoundingClientRect();
    let vh = window.innerHeight;
    if (panelRect.top < vh * 0.6) {
      panel.classList.add('open');
      panel.style.transition = '';
      panel.style.transform = '';
    } else {
      panel.classList.remove('open');
      panel.style.transition = '';
      panel.style.transform = '';
    }
  });
  // Click tab toggles
  tab.addEventListener('click', () => {
    panel.classList.toggle('open');
    panel.style.transition = '';
    panel.style.transform = '';
  });

  // Timeline ticks (horizontal slider)
  const ticks = document.getElementById('timeline-ticks');
  let firstGyreShiftShown = false;
  timelineData.forEach((event, i) => {
    let type = event.isGyreShift ? 'line' : (event.label && event.label.toLowerCase().includes('line') ? 'major' : 'minor');
    if (event.isGyreShift && !firstGyreShiftShown) {
      firstGyreShiftShown = true;
      type = 'line';
    } else if (event.isGyreShift) {
      type = 'minor';
    }
    const tick = document.createElement('div');
    tick.className = `timeline-tick ${type}`;
    tick.innerHTML = `<div class=\"timeline-tick-dot\"></div><div class=\"timeline-tick-label\">${event.label}</div>`;
    tick.addEventListener('click', () => selectTimelineEvent(i));
    ticks.appendChild(tick);
  });
  // Make ticks scrollable to active
  function scrollTickIntoView(idx) {
    const tick = ticks.children[idx];
    if (tick && typeof tick.scrollIntoView === 'function') {
      tick.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
    }
  }

  // State
  let currentIdx = 0;
  function selectTimelineEvent(idx) {
    currentIdx = idx;
    // Highlight tick
    Array.from(ticks.children).forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
    // Set content
    const event = timelineData[idx];
    let html = '';
    if (event.isGyreShift) {
      // Only show World Gyre caption for first Gyre Shift
      if (idx === timelineData.findIndex(e => e.isGyreShift)) {
        html += `<div class='gyre-shift-caption'>World Gyre Shift</div>`;
      }
      html += `<div class='gyre-shift-icon'>${event.icon || ''}</div>`;
      html += `<div class='gyre-shift-label'>Gyre Shift</div>`;
      html += `<div class='gyre-shift-desc'>${event.description}</div>`;
    } else {
      html += `<h3>${event.link ? `<a href='${event.link}' class='timeline-link'>${event.label}</a>` : event.label} <span class='timeline-year'>${event.year || ''}</span></h3>`;
      html += `<h4>${event.title}</h4>`;
      html += `<p>${event.description}</p>`;
    }
    document.getElementById('timeline-panel-event-content').innerHTML = html;
    // Set background (optional: add bgImage property to timelineData)
    const bg = document.getElementById('timeline-panel-bg');
    if (event.bgImage) {
      bg.style.backgroundImage = `url('${event.bgImage}')`;
      bg.style.opacity = 0.18;
    } else {
      bg.style.backgroundImage = '';
      bg.style.opacity = 0;
    }
    scrollTickIntoView(idx);
  }
  // Initial select
  selectTimelineEvent(0);
}
