// Minimal wiki search bar: prefix search, keyboard nav, clear, recents

if (!window.Fuse) {
  const s = document.createElement('script');
  s.src = window.location.pathname.includes('/wiki/') ? '../js/fuse.js' : 'js/fuse.js';
  document.head.appendChild(s);
}

document.addEventListener('DOMContentLoaded', () => {

  const searchInput = document.querySelector('.nav-search input');
  if (!searchInput) return;

  // Helper to create or get a single element
  function getOrCreate(selector, createFn, parent) {
    let el = document.querySelector(selector);
    if (!el) {
      el = createFn();
      (parent || document.body).appendChild(el);
    }
    return el;
  }

  let dropdown = getOrCreate('.search-dropdown', () => {
    const d = document.createElement('div');
    d.className = 'search-dropdown';
    d.style.position = 'absolute';
    d.style.zIndex = '3002';
    d.style.left = '0';
    d.style.right = '0';
    d.style.top = '100%';
    d.style.width = '100%';
    d.style.marginTop = '2px';
    return d;
  }, searchInput.closest('.nav-search'));

  let clearBtn = getOrCreate('.search-clear-btn', () => {
    const b = document.createElement('button');
    b.className = 'search-clear-btn';
    b.innerHTML = '&times;';
    b.title = 'Clear search';
    b.style.display = 'none';
    return b;
  }, searchInput.closest('.nav-search'));

  let suggestionList = getOrCreate('.suggestion-list', () => {
    const ul = document.createElement('ul');
    ul.className = 'suggestion-list';
    return ul;
  }, dropdown);

  let fuse = null, selectedIdx = -1, debounceTimer = null;
  let recentPages = JSON.parse(localStorage.getItem('recentPages') || '[]');
  const contentPath = window.location.pathname.includes('/wiki/') ? '../json/wiki_content_index.json' : 'json/wiki_content_index.json';
  const taxonomyPath = window.location.pathname.includes('/wiki/') ? '../json/wiki_taxonomy_index.json' : 'json/wiki_taxonomy_index.json';

  // Debounce helper
  function debounce(fn, delay) {
    return function(...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function waitForFuse(cb) { window.Fuse ? cb() : setTimeout(() => waitForFuse(cb), 50); }

  // Load both content and taxonomy, then merge taxonomy into content for search
  // Show loading indicator while fetching
  dropdown.innerHTML = '<div class="search-loading">Loading...</div>';
  Promise.all([
    fetch(contentPath).then(r => r.json()),
    fetch(taxonomyPath).then(r => r.json()).catch(() => ([]))
  ]).then(([content, taxonomy]) => {
    if (Array.isArray(taxonomy)) {
      content.forEach(page => {
        const tax = taxonomy.find(t => t.file === page.file);
        if (tax) page.taxons = tax.taxons || [];
      });
    }
    waitForFuse(() => {
      fuse = new Fuse(content, {
        keys: [
          { name: 'title', weight: 8 },
          { name: 'headings', weight: 1.5 },
          { name: 'taxons', weight: 1 }
        ],
        includeMatches: true,
        threshold: 0.35,
        minMatchCharLength: 1,
        ignoreLocation: true,
        useExtendedSearch: true,
        findAllMatches: true,
        tokenize: true,
      });
      dropdown.innerHTML = '';
      dropdown.appendChild(suggestionList);
      displayRecent();
    });
  });

  function highlight(text, matches) {
    if (!matches?.length) return text;
    let indices = matches.flatMap(m => m.indices).sort((a, b) => a[0] - b[0]);
    let result = '', last = 0;
    for (const [start, end] of indices) {
      result += text.slice(last, start) + '<mark>' + text.slice(start, end + 1) + '</mark>';
      last = end + 1;
    }
    return result + text.slice(last);
  }

  function displayRecent() {
    suggestionList.innerHTML = '';
    dropdown.style.display = 'none';
    if (!recentPages.length) return;
    if (document.activeElement === searchInput) {
      dropdown.style.display = 'block';
      recentPages.slice(-5).reverse().forEach(page => {
        const li = document.createElement('li');
        li.textContent = page.title;
        li.className = 'search-suggestion';
        li.addEventListener('mousedown', e => { e.preventDefault(); goToPage(page.file); });
        suggestionList.appendChild(li);
      });
    }
  }

  // Improved: Debounced, highlights all fields, ARIA roles
  function updateSuggestions(query) {
    suggestionList.innerHTML = '';
    selectedIdx = -1;
    if (!query) { displayRecent(); clearBtn.style.display = 'none'; return; }
    clearBtn.style.display = 'block';
    let results = fuse ? fuse.search(query, { limit: 100, minMatchCharLength: 1 }) : [];
    if (!results.length) { dropdown.style.display = 'none'; return; }

    const lowerQuery = query.toLowerCase();
    const titleMatches = results.filter(r => r.item.title.toLowerCase().includes(lowerQuery));
    const otherMatches = results.filter(r => !r.item.title.toLowerCase().includes(lowerQuery));
    const sortedResults = [...titleMatches, ...otherMatches];

    dropdown.style.display = 'block';
    suggestionList.setAttribute('role', 'listbox');
    sortedResults.slice(0, 10).forEach((res, idx) => {
      const { item, matches } = res;
      const li = document.createElement('li');
      li.tabIndex = 0;
      li.setAttribute('role', 'option');
      li.className = 'search-suggestion' + (idx === selectedIdx ? ' selected' : '');
      // Highlight all fields
      let titleMatch = matches?.find(m => m.key === 'title');
      let headingsMatch = matches?.find(m => m.key === 'headings');
      let taxonsMatch = matches?.find(m => m.key === 'taxons');
      let taxBadges = '';
      if (item.taxons && item.taxons.length) {
        taxBadges = item.taxons.map(t => `<span class="tax-badge">${highlight(t, taxonsMatch ? [taxonsMatch] : [])}</span>`).join(' ');
      }
      li.innerHTML = '<span class="suggest-title">' + highlight(item.title, titleMatch ? [titleMatch] : []) + '</span>'
        + (item.headings ? '<span class="suggest-headings">' + highlight(item.headings, headingsMatch ? [headingsMatch] : []) + '</span>' : '')
        + (taxBadges ? ' <span class="suggest-taxons">' + taxBadges + '</span>' : '');
      li.addEventListener('mousedown', e => {
        e.preventDefault();
        addRecentPage(item.title, item.file);
        goToPage(item.file);
      });
      suggestionList.appendChild(li);
    });
  }

  function goToPage(file) {
    let url = window.location.pathname.includes('/wiki/') ? encodeURIComponent(file) : 'wiki/' + encodeURIComponent(file);
    window.location.href = url;
  }

  function addRecentPage(title, file) {
    if (!title || !file) return;
    recentPages = recentPages.filter(x => x.file !== file);
    recentPages.push({ title, file });
    if (recentPages.length > 10) recentPages.shift();
    localStorage.setItem('recentPages', JSON.stringify(recentPages));
    displayRecent();
  }

  function openDropdown() {
    dropdown.style.display = 'block';
  }
  function closeDropdown() { dropdown.style.display = 'none'; }

  searchInput.addEventListener('focus', () => {
    if (!searchInput.value.trim()) { displayRecent(); clearBtn.style.display = 'none'; }
    else openDropdown();
  });
  // Debounced input for performance
  searchInput.addEventListener('input', debounce(() => {
    openDropdown();
    updateSuggestions(searchInput.value.trim());
  }, 120));

  document.addEventListener('mousedown', e => {
    if (!dropdown.contains(e.target) && e.target !== searchInput) closeDropdown();
  });
  // Close dropdown/advanced on Esc
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDropdown();
      advBox.style.display = 'none';
      searchInput.blur();
    }
  });

  searchInput.addEventListener('keydown', e => {
    const items = suggestionList.querySelectorAll('li');
    if (!items.length) return;
    if (e.key === 'ArrowDown') { selectedIdx = (selectedIdx + 1) % items.length; updateSelected(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { selectedIdx = (selectedIdx - 1 + items.length) % items.length; updateSelected(); e.preventDefault(); }
    else if (e.key === 'Enter') {
      if (selectedIdx >= 0 && items[selectedIdx]) {
        items[selectedIdx].dispatchEvent(new MouseEvent('mousedown'));
        e.preventDefault();
      }
    }
  });

  function updateSelected() {
    suggestionList.querySelectorAll('li').forEach((li, idx) => {
      li.classList.toggle('selected', idx === selectedIdx);
    });
  }

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    updateSuggestions('');
    searchInput.focus();
  });



  // --- Advanced Search Dropdown (Taxonomy-based) ---
  // Create advanced search button
  let advBtn = getOrCreate('.search-advanced-btn', () => {
    const btn = document.createElement('button');
    btn.className = 'search-advanced-btn';
    btn.title = 'Advanced search';
    btn.innerHTML = '<span class="adv-icon">&#9881;</span>';
    btn.style.marginLeft = '8px';
    return btn;
  }, searchInput.closest('.nav-search'));

  // Create advanced search dropdown
  let advDropdown = getOrCreate('.advanced-search-dropdown', () => {
    const d = document.createElement('div');
    d.className = 'advanced-search-dropdown';
    Object.assign(d.style, {
      display: 'none',
      position: 'fixed',
      left: '50%',
      top: '0',
      transform: 'translate(-50%, -40px) scaleY(0.8)',
      transition: 'transform 0.32s cubic-bezier(.4,1.4,.6,1), opacity 0.32s cubic-bezier(.4,1.4,.6,1)',
      opacity: '0',
      zIndex: '3003',
      background: '#1e1e1e',
      color: '#ffe066',
      borderRadius: '0 0 16px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.22)'
    });
    d.innerHTML = `
      <div class="adv-search-inner" style="padding:18px 22px 20px 22px; position:relative;">
        <button class="adv-search-x" aria-label="Close advanced search" style="position:absolute; top:10px; right:10px; background:none; border:none; color:#ffe066; font-size:1.3em; cursor:pointer;">&times;</button>
        <h3 style="margin:0 0 10px 0; color:#5D3FD3; font-size:1em; font-weight:500;">Advanced Search</h3>
      <div class="adv-fields" style="padding-bottom:8px;">
        <label style="display:block; margin-bottom:10px;">Title: <input type="text" class="adv-title" placeholder="Title contains..." style="width:180px; padding:4px 8px;"></label>
        <label style="display:block; margin-bottom:12px;">Content: <input type="text" class="adv-content" placeholder="Content contains..." style="width:180px; padding:4px 8px;"></label>
        <div class="adv-conditions"></div>
        <button class="adv-add-condition" style="margin-top:6px; margin-bottom:8px; padding:2px 10px; font-size:0.95em;">+ Add Condition</button>
      </div>
        <div style="padding-bottom:8px;">
          <button class="adv-search-btn" style="margin-top:8px; padding:4px 14px;">Search</button>
        </div>
        <div class="adv-search-results" style="margin-top:14px;"></div>
      </div>
    `;
    (searchInput.closest('.nav-search') || document.body).appendChild(d);

    // --- Multi-field & Boolean Search UI logic ---
    const taxonOrder = ["Bin","Basin","Eco","Kingdom","Phylum","Class","Order","Family","Essa"];
    const taxonOptions = taxonOrder.map(t => `<option value="${t}">${t}</option>`).join("");
    const advFields = d.querySelector('.adv-fields');
    const advConditions = advFields.querySelector('.adv-conditions');
    const addCondBtn = advFields.querySelector('.adv-add-condition');

    function makeConditionRow(idx, op = "AND", field = "Bin", val = "") {
      return `<div class="adv-cond-row" style="margin-bottom:6px; display:flex; align-items:center; gap:6px;">
        ${idx > 0 ? `<select class="adv-cond-op" style="padding:2px 6px;">
          <option value="AND"${op==="AND"?" selected":""}>AND</option>
          <option value="OR"${op==="OR"?" selected":""}>OR</option>
          <option value="NOT"${op==="NOT"?" selected":""}>NOT</option>
        </select>` : ""}
        <select class="adv-cond-field" style="padding:2px 6px;">
          <option value="">-- Select Field --</option>
          ${taxonOptions}
        </select>
        <input type="text" class="adv-cond-value" placeholder="Value..." value="${val||""}" style="width:120px; padding:2px 6px;">
        <button class="adv-cond-remove" title="Remove" style="background:none; border:none; color:#ffe066; font-size:1.1em; cursor:pointer;">&times;</button>
      </div>`;
    }

    // State: array of {op, field, value}
    let condState = [{op:"AND", field:"Bin", value:""}];

    function renderConditions() {
      advConditions.innerHTML = condState.map((c, i) => makeConditionRow(i, c.op, c.field, c.value)).join("");
      advConditions.querySelectorAll('.adv-cond-row').forEach((row, i) => {
        if (i > 0) row.querySelector('.adv-cond-op').value = condState[i].op;
        row.querySelector('.adv-cond-field').value = condState[i].field;
        row.querySelector('.adv-cond-value').value = condState[i].value;
      });
    }
    renderConditions();

    // Add condition
    addCondBtn.addEventListener('click', e => {
      e.preventDefault();
      condState.push({op:"AND", field:"Bin", value:""});
      renderConditions();
    });
    // Remove condition
    advConditions.addEventListener('click', e => {
      if (e.target.classList.contains('adv-cond-remove')) {
        const idx = Array.from(advConditions.children).indexOf(e.target.closest('.adv-cond-row'));
        if (idx > -1) { condState.splice(idx, 1); renderConditions(); }
      }
    });
    // Change field/op/value
    advConditions.addEventListener('input', e => {
      const row = e.target.closest('.adv-cond-row');
      const idx = Array.from(advConditions.children).indexOf(row);
      if (row && idx > -1) {
        if (e.target.classList.contains('adv-cond-op')) condState[idx].op = e.target.value;
        if (e.target.classList.contains('adv-cond-field')) condState[idx].field = e.target.value;
        if (e.target.classList.contains('adv-cond-value')) condState[idx].value = e.target.value;
      }
    });
    return d;
  }, searchInput.closest('.nav-search'));

  // Show/hide advanced search dropdown
  advBtn.addEventListener('click', e => {
    e.preventDefault();
    if (advDropdown.style.display === 'block') {
      advDropdown.style.transform = 'translate(-50%, -40px) scaleY(0.8)';
      advDropdown.style.opacity = '0';
      setTimeout(() => { advDropdown.style.display = 'none'; }, 300);
    } else {
      advDropdown.style.display = 'block';
      void advDropdown.offsetWidth;
      advDropdown.style.transform = 'translate(-50%, 0) scaleY(1)';
      advDropdown.style.opacity = '1';
      advDropdown.querySelector('.adv-title').focus();
    }
  });

  // Add close handler for the new X button (ensure it works after dynamic HTML)
  advDropdown.addEventListener('click', function(e) {
    if (e.target.classList.contains('adv-search-x')) {
      advDropdown.style.transform = 'translate(-50%, -40px) scaleY(0.8)';
      advDropdown.style.opacity = '0';
      setTimeout(() => { advDropdown.style.display = 'none'; }, 300);
    }
  });
  document.addEventListener('mousedown', e => {
    if (!advDropdown.contains(e.target) && e.target !== advBtn) {
      // Do nothing: keep advanced search open unless closed by gear or X
    }
  });

  // Advanced search logic
  advDropdown.querySelector('.adv-search-btn').addEventListener('click', () => {
    const titleVal = advDropdown.querySelector('.adv-title').value.trim().toLowerCase();
    const contentVal = advDropdown.querySelector('.adv-content').value.trim().toLowerCase();
    const resultsDiv = advDropdown.querySelector('.adv-search-results');
    resultsDiv.innerHTML = '<span style="color:#888;">Searching...</span>';
    // Fetch both taxonomy and content index for content search
    Promise.all([
      fetch(taxonomyPath).then(r => r.json()),
      fetch(contentPath).then(r => r.json())
    ]).then(([taxonomy, contentIndex]) => {
      function getLastFilledTaxon(entry) {
        for (let i = taxonOrder.length - 1; i >= 0; i--) {
          if (entry[taxonOrder[i]] && entry[taxonOrder[i]].trim() !== "") return taxonOrder[i];
        }
        return null;
      }
      let filtered = taxonomy.filter(entry => !entry.noSearch);
      if (titleVal) {
        filtered = filtered.filter(entry => entry.file && entry.file.toLowerCase().includes(titleVal));
      }
      // Content contains logic
      if (contentVal) {
        // Build a map for fast lookup
        const contentMap = {};
        contentIndex.forEach(page => { contentMap[page.file] = page; });
        const words = contentVal.split(/\s+/).filter(Boolean);
        filtered = filtered.filter(entry => {
          const page = contentMap[entry.file];
          if (!page || !page.content) return false;
          const text = page.content.toLowerCase();
          // All words must be present
          return words.every(word => text.includes(word));
        });
      }
      function entryMatches(entry) {
        let result = true;
        for (let i = 0; i < condState.length; i++) {
          const {op, field, value} = condState[i];
          if (!field) continue;
          const entryVal = (entry[field] || '').toLowerCase();
          const match = value ? entryVal.includes(value.toLowerCase()) : false;
          if (i === 0) {
            result = match;
          } else if (op === "AND") {
            result = result && match;
          } else if (op === "OR") {
            result = result || match;
          } else if (op === "NOT") {
            result = result && !match;
          }
        }
        return result;
      }
      filtered = filtered.filter(entryMatches);
      filtered = filtered.sort((a, b) => {
        const aIdx = taxonOrder.indexOf(getLastFilledTaxon(a));
        const bIdx = taxonOrder.indexOf(getLastFilledTaxon(b));
        if (aIdx !== bIdx) return aIdx - bIdx;
        if (taxonOrder[aIdx] === "Bin") {
          const aCount = taxonOrder.reduce((acc, t) => acc + (!!a[t] && a[t].trim() !== "" ? 1 : 0), 0);
          const bCount = taxonOrder.reduce((acc, t) => acc + (!!b[t] && b[t].trim() !== "" ? 1 : 0), 0);
          return aCount - bCount;
        }
        return 0;
      });
      if (!filtered.length) {
        resultsDiv.innerHTML = '<span style="color:#b00;">No results found.</span>';
        return;
      }
      resultsDiv.innerHTML = '<ul style="list-style:none; padding:0; margin:0;">' +
        filtered.slice(0, 30).map(entry =>
          `<li style='margin-bottom:6px;'><a href="wiki/${encodeURIComponent(entry.file)}" style="color:#5D3FD3; text-decoration:underline;">${entry.file.replace(/\.md$/i, '')}</a>` +
            Object.entries(entry).filter(([k,v]) => k!=='file' && v).map(([k,v]) =>
              ` <span class='tax-badge' style='background:#e6e3f7;color:#5D3FD3;border-radius:4px;padding:2px 7px;font-size:0.92em;margin-right:4px;'>${k}: ${v}</span>`
            ).join('') +
          `</li>`
        ).join('') + '</ul>';
    });
  });

// Debug: Confirm script loaded
// console.debug('search.js: Script loaded and initialized');
}); // <-- Close DOMContentLoaded handler
