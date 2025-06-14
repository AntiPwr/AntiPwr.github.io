// Minimal wiki search bar: prefix search, keyboard nav, clear, recents

if (!window.Fuse) {
  const s = document.createElement('script');
  s.src = window.location.pathname.includes('/wiki/') ? '../js/fuse.js' : 'js/fuse.js';
  document.head.appendChild(s);
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.nav-search input');
  if (!searchInput) return;

  let dropdown = document.querySelector('.search-dropdown') ||
    (() => { const d = document.createElement('div'); d.className = 'search-dropdown'; (searchInput.closest('.nav-search') || document.body).appendChild(d); return d; })();
  let clearBtn = document.querySelector('.search-clear-btn') ||
    (() => { const b = document.createElement('button'); b.className = 'search-clear-btn'; b.innerHTML = '&times;'; b.title = 'Clear search'; b.style.display = 'none'; (searchInput.closest('.nav-search') || document.body).appendChild(b); return b; })();
  let suggestionList = dropdown.querySelector('.suggestion-list') ||
    (() => { const ul = document.createElement('ul'); ul.className = 'suggestion-list'; dropdown.appendChild(ul); return ul; })();

  let fuse = null, selectedIdx = -1;
  let recentPages = JSON.parse(localStorage.getItem('recentPages') || '[]');
  let contentPath = window.location.pathname.includes('/wiki/') ? '../json/wiki_content_index.json' : 'json/wiki_content_index.json';

  function waitForFuse(cb) { window.Fuse ? cb() : setTimeout(() => waitForFuse(cb), 50); }

  fetch(contentPath).then(r => r.json()).then(content => {
    waitForFuse(() => {
      fuse = new Fuse(content, {
        keys: [{ name: 'title', weight: 2 }, { name: 'headings', weight: 1.5 }],
        includeMatches: true, threshold: 0.4, minMatchCharLength: 1, ignoreLocation: true,
      });
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

  function updateSuggestions(query) {
    suggestionList.innerHTML = '';
    selectedIdx = -1;
    if (!query) { displayRecent(); clearBtn.style.display = 'none'; return; }
    clearBtn.style.display = 'block';
    let results = fuse ? fuse.search(query, { limit: 100, minMatchCharLength: 1 }) : [];
    if (!results.length) { dropdown.style.display = 'none'; return; }
    const lowerQuery = query.toLowerCase();
    const prefixMatches = results.filter(r => r.item.title.toLowerCase().startsWith(lowerQuery));
    if (!prefixMatches.length) { dropdown.style.display = 'none'; return; }
    prefixMatches.sort((a, b) => a.item.title.localeCompare(b.item.title, undefined, { sensitivity: 'base' }));
    dropdown.style.display = 'block';
    prefixMatches.slice(0, 10).forEach((res, idx) => {
      const { item, matches } = res;
      const li = document.createElement('li');
      li.tabIndex = 0;
      li.className = 'search-suggestion' + (idx === selectedIdx ? ' selected' : '');
      let titleMatch = matches?.find(m => m.key === 'title');
      li.innerHTML = '<span class="suggest-title">' + highlight(item.title, titleMatch ? [titleMatch] : []) + '</span>';
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

  function openDropdown() { dropdown.style.display = 'block'; }
  function closeDropdown() { dropdown.style.display = 'none'; }

  searchInput.addEventListener('focus', () => {
    if (!searchInput.value.trim()) { displayRecent(); clearBtn.style.display = 'none'; }
    else openDropdown();
  });
  searchInput.addEventListener('input', () => {
    openDropdown();
    updateSuggestions(searchInput.value.trim());
  });

  document.addEventListener('mousedown', e => {
    if (!dropdown.contains(e.target) && e.target !== searchInput) closeDropdown();
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

  // Debug: Confirm script loaded
  // console.debug('search.js: Script loaded and initialized');
});
