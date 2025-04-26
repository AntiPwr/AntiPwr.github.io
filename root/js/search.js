// Enhanced wiki search bar with fuzzy/content search, keyboard nav, highlights, clear, recents

// Use local Fuse.js instead of CDN
if (!window.Fuse) {
  const fuseScript = document.createElement('script');
  // Dynamically resolve correct path based on current location
  // If running from /root/wiki/ use ../js/fuse.js, else use js/fuse.js
  let fusePath = 'js/fuse.js';
  if (window.location.pathname.includes('/wiki/')) {
    fusePath = '../js/fuse.js';
  }
  fuseScript.src = fusePath;
  fuseScript.type = 'text/javascript';
  document.head.appendChild(fuseScript);
}

// Debug: Global error handler for crash info
window.addEventListener('error', function(event) {
  console.error('Global JS Error:', event.message, 'at', event.filename, 'line', event.lineno, 'col', event.colno, event.error);
});
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled Promise Rejection:', event.reason);
});

document.addEventListener('DOMContentLoaded', () => {
  try {
    const searchInput = document.querySelector('.nav-search input');
    if (!searchInput) {
      console.error('search.js: No .nav-search input found');
      return;
    }

    // Use the existing .search-dropdown if present, otherwise create one
    let dropdown = document.querySelector('.search-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.classList.add('search-dropdown');
      const navSearch = searchInput.closest('.nav-search');
      if (navSearch) navSearch.appendChild(dropdown);
      else document.body.appendChild(dropdown);
    }

    // Only add resizer if not already present
    let resizer = dropdown.querySelector('.search-dropdown-resizer');
    if (!resizer) {
      resizer = document.createElement('div');
      resizer.className = 'search-dropdown-resizer';
      dropdown.appendChild(resizer);
    }

    // Only add clear button if not already present
    let clearBtn = document.querySelector('.search-clear-btn');
    if (!clearBtn) {
      clearBtn = document.createElement('button');
      clearBtn.className = 'search-clear-btn';
      clearBtn.innerHTML = '&times;';
      clearBtn.title = 'Clear search';
      clearBtn.style.display = 'none';
      const navSearch = searchInput.closest('.nav-search');
      if (navSearch) navSearch.appendChild(clearBtn);
      else document.body.appendChild(clearBtn);
    }

    // Only add recentSection and suggestionList if not already present
    let recentSection = dropdown.querySelector('.recent-section');
    if (!recentSection) {
      recentSection = document.createElement('div');
      recentSection.classList.add('recent-section');
      dropdown.appendChild(recentSection);
    }
    let suggestionList = dropdown.querySelector('.suggestion-list');
    if (!suggestionList) {
      suggestionList = document.createElement('ul');
      suggestionList.classList.add('suggestion-list');
      dropdown.appendChild(suggestionList);
    }

    // Data
    let allPages = [];
    let allContent = [];
    let fuse = null;
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    let pinnedPages = JSON.parse(localStorage.getItem('pinnedPages')) || [];
    let selectedIdx = -1;

    // Load wiki_pages.json and headings/content index
    let basePath = 'json/wiki_pages.json';
    let contentPath = 'json/wiki_content_index.json';
    if (window.location.pathname.includes('/wiki/')) {
      basePath = '../json/wiki_pages.json';
      contentPath = '../json/wiki_content_index.json';
    }

    function waitForFuse(cb) {
      if (window.Fuse) cb();
      else setTimeout(() => waitForFuse(cb), 50);
    }

    Promise.all([
      fetch(basePath).then(r => r.json()),
      fetch(contentPath).then(r => r.json()).catch(() => [])
    ]).then(([pages, content]) => {
      allPages = pages.map(f => ({ file: f, title: f.replace('.html', '') }));
      allContent = content;
      waitForFuse(() => {
        fuse = new Fuse(allContent, {
          keys: [
            { name: 'title', weight: 2 },
            { name: 'headings', weight: 1.5 },
            { name: 'content', weight: 1 }
          ],
          includeMatches: true,
          threshold: 0.4,
          minMatchCharLength: 2,
          ignoreLocation: true,
        });
        displayRecent();
      });
    });

    function highlight(text, matches) {
      if (!matches || !matches.length) return text;
      let indices = matches.flatMap(m => m.indices);
      indices.sort((a, b) => a[0] - b[0]);
      let result = '', last = 0;
      for (const [start, end] of indices) {
        result += text.slice(last, start) + '<mark>' + text.slice(start, end + 1) + '</mark>';
        last = end + 1;
      }
      result += text.slice(last);
      return result;
    }

    function displayRecent() {
      recentSection.innerHTML = '';
      if (!recentSearches.length) {
        recentSection.style.display = 'none';
        return;
      }
      recentSection.style.display = 'block';
      const title = document.createElement('h4');
      title.textContent = 'Recent Searches';
      recentSection.appendChild(title);
      const ul = document.createElement('ul');
      recentSection.appendChild(ul);
      recentSearches.slice(-5).reverse().forEach(q => {
        const li = document.createElement('li');
        li.textContent = q;
        li.addEventListener('mousedown', e => {
          e.preventDefault();
          searchInput.value = q;
          updateSuggestions(q);
        });
        ul.appendChild(li);
      });
    }

    function updateSuggestions(query) {
      suggestionList.innerHTML = '';
      selectedIdx = -1;
      if (!query) {
        dropdown.style.display = (recentSearches.length || pinnedPages.length) ? 'block' : 'none';
        clearBtn.style.display = 'none';
        return;
      }
      clearBtn.style.display = 'block';
      let results = fuse ? fuse.search(query, { limit: 10 }) : [];
      if (!results.length) {
        dropdown.style.display = 'none';
        return;
      }
      dropdown.style.display = 'block';
      results.forEach((res, idx) => {
        const { item, matches } = res;
        const li = document.createElement('li');
        li.tabIndex = 0;
        li.className = 'search-suggestion';
        if (idx === selectedIdx) li.classList.add('selected');
        let titleMatch = matches?.find(m => m.key === 'title');
        let headingMatch = matches?.find(m => m.key === 'headings');
        let contentMatch = matches?.find(m => m.key === 'content');
        let html = '';
        html += '<span class="suggest-title">' +
          highlight(item.title, titleMatch ? [titleMatch] : []) +
          '</span>';
        if (headingMatch) {
          html += '<span class="suggest-heading"> — ' +
            highlight(item.headings[headingMatch.refIndex], [headingMatch]) +
            '</span>';
        }
        if (contentMatch) {
          let snippet = item.content.slice(contentMatch.indices[0][0], contentMatch.indices[0][1] + 40);
          html += '<span class="suggest-snippet">...'
            + highlight(snippet, [contentMatch]) + '...</span>';
        }
        li.innerHTML = html;
        const isPinned = pinnedPages.includes(item.file);
        const pinBtn = document.createElement('button');
        pinBtn.className = 'pin-btn';
        pinBtn.textContent = isPinned ? '●' : '○';
        pinBtn.title = isPinned ? 'Unpin' : 'Pin';
        pinBtn.addEventListener('mousedown', evt => {
          evt.stopPropagation();
          if (!isPinned) pinnedPages.push(item.file);
          else pinnedPages = pinnedPages.filter(f => f !== item.file);
          localStorage.setItem('pinnedPages', JSON.stringify(pinnedPages));
          updateSuggestions(query);
        });
        li.appendChild(pinBtn);
        li.addEventListener('mousedown', e => {
          e.preventDefault();
          addRecent(query);
          goToPage(item.file, headingMatch ? item.headings[headingMatch.refIndex] : null);
        });
        suggestionList.appendChild(li);
      });
    }

    function goToPage(file, heading) {
      let url = window.location.pathname.includes('/wiki/')
        ? encodeURIComponent(file)
        : 'wiki/' + encodeURIComponent(file);
      if (heading) url += '#' + encodeURIComponent(heading.replace(/\s+/g, '-'));
      window.location.href = url;
    }

    function addRecent(q) {
      if (!q) return;
      recentSearches = recentSearches.filter(x => x !== q);
      recentSearches.push(q);
      if (recentSearches.length > 10) recentSearches.shift();
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
      displayRecent();
    }

    let dropdownOpen = false;
    function openDropdown() {
      dropdown.style.display = 'block';
      dropdownOpen = true;
    }
    function closeDropdown() {
      dropdown.style.display = 'none';
      dropdownOpen = false;
    }

    searchInput.addEventListener('focus', openDropdown);
    searchInput.addEventListener('input', openDropdown);
    document.addEventListener('mousedown', e => {
      if (!dropdown.contains(e.target) && e.target !== searchInput) {
        if (dropdownOpen) closeDropdown();
      }
    });

    let startY, startHeight, dragging = false;
    resizer.addEventListener('mousedown', e => {
      dragging = true;
      startY = e.clientY;
      startHeight = dropdown.offsetHeight;
      dropdown.classList.add('dragging');
      document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      let newHeight = Math.max(60, Math.min(window.innerHeight * 0.6, startHeight + (e.clientY - startY)));
      dropdown.style.height = newHeight + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (dragging) {
        dragging = false;
        dropdown.classList.remove('dragging');
        document.body.style.userSelect = '';
      }
    });

    function adjustForSidebar() {
      const sidebar = document.querySelector('.sidebar');
      const isOpen = sidebar && sidebar.classList.contains('sidebar-open');
      const sidebarWidth = isOpen ? (sidebar.offsetWidth || 250) : 0;
      document.documentElement.style.setProperty('--sidebar-width', sidebarWidth + 'px');
      if (isOpen) {
        dropdown.style.left = sidebarWidth + 'px';
        dropdown.style.width = `calc(100vw - ${sidebarWidth + 40}px)`;
        searchInput.style.width = `calc(100vw - ${sidebarWidth + 80}px)`;
      } else {
        dropdown.style.left = '50%';
        dropdown.style.transform = 'translateX(-50%)';
        dropdown.style.width = '';
        searchInput.style.width = '';
      }
    }
    window.addEventListener('resize', adjustForSidebar);
    setInterval(adjustForSidebar, 300);

    searchInput.addEventListener('keydown', e => {
      const items = suggestionList.querySelectorAll('li');
      if (!items.length) return;
      if (e.key === 'ArrowDown') {
        selectedIdx = (selectedIdx + 1) % items.length;
        updateSelected();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        selectedIdx = (selectedIdx - 1 + items.length) % items.length;
        updateSelected();
        e.preventDefault();
      } else if (e.key === 'Enter') {
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

    searchInput.addEventListener('input', () => {
      updateSuggestions(searchInput.value.trim());
    });
    searchInput.addEventListener('focus', () => {
      if (!searchInput.value.trim()) {
        dropdown.style.display = (recentSearches.length || pinnedPages.length) ? 'block' : 'none';
        clearBtn.style.display = 'none';
      }
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      updateSuggestions('');
      searchInput.focus();
    });
  } catch (err) {
    console.error('search.js: Fatal error in DOMContentLoaded:', err);
  }
});
