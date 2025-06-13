// Streamlined wiki search bar with fuzzy/content search, keyboard nav, highlights, clear, recents

if (!window.Fuse) {
  const fuseScript = document.createElement('script');
  fuseScript.src = window.location.pathname.includes('/wiki/') ? '../js/fuse.js' : 'js/fuse.js';
  document.head.appendChild(fuseScript);
}

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

    let allContent = [], fuse = null, selectedIdx = -1;
    // Recents now stores {title, file} objects
    let recentPages = JSON.parse(localStorage.getItem('recentPages') || '[]');
    let contentPath = window.location.pathname.includes('/wiki/') ? '../json/wiki_content_index.json' : 'json/wiki_content_index.json';

    function waitForFuse(cb) { window.Fuse ? cb() : setTimeout(() => waitForFuse(cb), 50); }

    fetch(contentPath).then(r => r.json()).then(content => {
      allContent = content;
      waitForFuse(() => {
        fuse = new Fuse(allContent, {
          keys: [{ name: 'title', weight: 2 }, { name: 'headings', weight: 1.5 }],
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
      if (!recentPages.length) return;
      if (document.activeElement === searchInput) {
        dropdown.style.display = 'block';
        recentPages.slice(-5).reverse().forEach(page => {
          const li = document.createElement('li');
          li.textContent = page.title;
          li.className = 'search-suggestion';
          li.addEventListener('mousedown', e => {
            e.preventDefault();
            goToPage(page.file);
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
      results.forEach((res, idx) => {
        const { item, matches } = res;
        const li = document.createElement('li');
        li.tabIndex = 0;
        li.className = 'search-suggestion' + (idx === selectedIdx ? ' selected' : '');
        let titleMatch = matches?.find(m => m.key === 'title');
        let headingMatch = matches?.find(m => m.key === 'headings');
        let html = '<span class="suggest-title">' + highlight(item.title, titleMatch ? [titleMatch] : []) + '</span>';
        if (headingMatch) html += '<span class="suggest-heading"> — ' + highlight(item.headings[headingMatch.refIndex], [headingMatch]) + '</span>';
        // No content/snippet shown
        li.innerHTML = html;
        li.addEventListener('mousedown', e => {
          e.preventDefault();
          addRecentPage(item.title, item.file);
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

    function addRecentPage(title, file) {
      if (!title || !file) return;
      recentPages = recentPages.filter(x => x.file !== file);
      recentPages.push({ title, file });
      if (recentPages.length > 10) recentPages.shift();
      localStorage.setItem('recentPages', JSON.stringify(recentPages));
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

    searchInput.addEventListener('focus', () => {
      try {
        if (!searchInput.value.trim()) { displayRecent(); clearBtn.style.display = 'none'; }
        else openDropdown();
      } catch (err) {
        console.error('search.js: Error in searchInput focus:', err);
      }
    });
    searchInput.addEventListener('input', () => {
      try {
        openDropdown();
        updateSuggestions(searchInput.value.trim());
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
