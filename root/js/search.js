// Streamlined wiki search bar with fuzzy/content search, keyboard nav, highlights, clear, recents
// Debugging added for panel open/close and crash detection

if (!window.Fuse) {
  const fuseScript = document.createElement('script');
  fuseScript.src = window.location.pathname.includes('/wiki/') ? '../js/fuse.js' : 'js/fuse.js';
  document.head.appendChild(fuseScript);
}

// Global error handler for debugging
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

    let dropdown = document.querySelector('.search-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.classList.add('search-dropdown');
      (searchInput.closest('.nav-search') || document.body).appendChild(dropdown);
    }

    let clearBtn = document.querySelector('.search-clear-btn');
    if (!clearBtn) {
      clearBtn = document.createElement('button');
      clearBtn.className = 'search-clear-btn';
      clearBtn.innerHTML = '&times;';
      clearBtn.title = 'Clear search';
      clearBtn.style.display = 'none';
      (searchInput.closest('.nav-search') || document.body).appendChild(clearBtn);
    }

    let suggestionList = dropdown.querySelector('.suggestion-list');
    if (!suggestionList) {
      suggestionList = document.createElement('ul');
      suggestionList.classList.add('suggestion-list');
      dropdown.appendChild(suggestionList);
    }

    let allContent = [], fuse = null, recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]'), selectedIdx = -1;
    let contentPath = window.location.pathname.includes('/wiki/') ? '../json/wiki_content_index.json' : 'json/wiki_content_index.json';

    function waitForFuse(cb) { window.Fuse ? cb() : setTimeout(() => waitForFuse(cb), 50); }

    fetch(contentPath).then(r => r.json()).then(content => {
      allContent = content;
      waitForFuse(() => {
        fuse = new Fuse(allContent, {
          keys: [{ name: 'title', weight: 2 }, { name: 'headings', weight: 1.5 }, { name: 'content', weight: 1 }],
          includeMatches: true, threshold: 0.4, minMatchCharLength: 2, ignoreLocation: true,
        });
        displayRecent();
      });
    });

    function highlight(text, matches) {
      if (!matches || !matches.length) return text;
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
      if (!recentSearches.length) return;
      if (document.activeElement === searchInput) {
        dropdown.style.display = 'block';
        console.debug('search.js: displayRecent() - dropdown opened for recent searches');
        recentSearches.slice(-5).reverse().forEach(q => {
          const li = document.createElement('li');
          li.textContent = q;
          li.className = 'search-suggestion';
          li.addEventListener('mousedown', e => {
            e.preventDefault();
            searchInput.value = q;
            updateSuggestions(q);
          });
          suggestionList.appendChild(li);
        });
      }
    }

    function updateSuggestions(query) {
      suggestionList.innerHTML = '';
      selectedIdx = -1;
      if (!query) { displayRecent(); clearBtn.style.display = 'none'; return; }
      clearBtn.style.display = 'block';
      let results = fuse ? fuse.search(query, { limit: 10 }) : [];
      if (!results.length) { dropdown.style.display = 'none'; return; }
      dropdown.style.display = 'block';
      console.debug('search.js: updateSuggestions() - dropdown opened for query:', query);
      results.forEach((res, idx) => {
        const { item, matches } = res;
        const li = document.createElement('li');
        li.tabIndex = 0;
        li.className = 'search-suggestion' + (idx === selectedIdx ? ' selected' : '');
        let titleMatch = matches?.find(m => m.key === 'title');
        let headingMatch = matches?.find(m => m.key === 'headings');
        let contentMatch = matches?.find(m => m.key === 'content');
        let html = '<span class="suggest-title">' + highlight(item.title, titleMatch ? [titleMatch] : []) + '</span>';
        if (headingMatch) html += '<span class="suggest-heading"> — ' + highlight(item.headings[headingMatch.refIndex], [headingMatch]) + '</span>';
        if (contentMatch) {
          let snippet = item.content.slice(contentMatch.indices[0][0], contentMatch.indices[0][1] + 40);
          html += '<span class="suggest-snippet">...' + highlight(snippet, [contentMatch]) + '...</span>';
        }
        li.innerHTML = html;
        li.addEventListener('mousedown', e => {
          e.preventDefault();
          addRecent(query);
          goToPage(item.file, headingMatch ? item.headings[headingMatch.refIndex] : null);
        });
        suggestionList.appendChild(li);
      });
    }

    function goToPage(file, heading) {
      let url = window.location.pathname.includes('/wiki/') ? encodeURIComponent(file) : 'wiki/' + encodeURIComponent(file);
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
      console.debug('search.js: openDropdown() called');
    }
    function closeDropdown() {
      dropdown.style.display = 'none';
      dropdownOpen = false;
      console.debug('search.js: closeDropdown() called');
    }

    searchInput.addEventListener('focus', () => {
      try {
        if (!searchInput.value.trim()) { displayRecent(); clearBtn.style.display = 'none'; }
        else openDropdown();
        console.debug('search.js: searchInput focus event');
      } catch (err) {
        console.error('search.js: Error in searchInput focus:', err);
      }
    });
    searchInput.addEventListener('input', () => {
      try {
        openDropdown();
        updateSuggestions(searchInput.value.trim());
        console.debug('search.js: searchInput input event');
      } catch (err) {
        console.error('search.js: Error in searchInput input:', err);
      }
    });

    document.addEventListener('mousedown', e => {
      try {
        if (!dropdown.contains(e.target) && e.target !== searchInput) {
          closeDropdown();
        }
      } catch (err) {
        console.error('search.js: Error in document mousedown:', err);
      }
    });

    searchInput.addEventListener('keydown', e => {
      try {
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
      } catch (err) {
        console.error('search.js: Error in searchInput keydown:', err);
      }
    });

    function updateSelected() {
      suggestionList.querySelectorAll('li').forEach((li, idx) => {
        li.classList.toggle('selected', idx === selectedIdx);
      });
    }

    clearBtn.addEventListener('click', () => {
      try {
        searchInput.value = '';
        updateSuggestions('');
        searchInput.focus();
        console.debug('search.js: clearBtn click event');
      } catch (err) {
        console.error('search.js: Error in clearBtn click:', err);
      }
    });

    // Debug: Confirm script loaded
    console.debug('search.js: Script loaded and initialized');
  } catch (err) {
    console.error('search.js: Fatal error in DOMContentLoaded:', err);
  }
});
