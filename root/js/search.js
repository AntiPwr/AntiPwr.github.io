document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.nav-search input');
  if (!searchInput) return; // No search bar on this page

  // Create the dropdown container
  const dropdown = document.createElement('div');
  dropdown.classList.add('search-dropdown');
  searchInput.parentNode.appendChild(dropdown);

  // Pinned section + suggestion list
  const pinnedSection = document.createElement('div');
  pinnedSection.classList.add('pinned-section');
  dropdown.appendChild(pinnedSection);

  const suggestionList = document.createElement('ul');
  suggestionList.classList.add('suggestion-list');
  dropdown.appendChild(suggestionList);

  // Manage pinned pages via localStorage
  let pinnedPages = JSON.parse(localStorage.getItem('pinnedPages')) || [];

  // 1) Determine correct path to wiki_pages.json based on current page location
  let basePath = 'json/wiki_pages.json';
  if (window.location.pathname.includes('/wiki/')) {
    basePath = '../json/wiki_pages.json';
  }

  let allPages = [];
  fetch(basePath)
    .then(resp => resp.json())
    .then(data => {
      allPages = data; 
      displayPinnedPages();
      // Initially hide if no pins and no typed text
      updateDropdownVisibility('');
    })
    .catch(err => console.error('Error loading wiki_pages.json:', err));

  // 2) Show suggestions on input
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    updateSuggestions(query);
  });

  // 3) Hide or show dropdown on document click
  //    If clicking outside, hide the dropdown. If clicking the input, decide 
  //    based on pinned items or typed query.
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== searchInput) {
      // Clicked outside the dropdown or input => hide
      dropdown.style.display = 'none';
    } else {
      // Clicked on the input or inside the dropdown => show only if pinned or typed
      const query = searchInput.value.trim().toLowerCase();
      if (pinnedPages.length > 0 || query) {
        dropdown.style.display = 'block';
      } else {
        dropdown.style.display = 'none';
      }
    }
  });

  // ### Helper Functions ###

  function updateSuggestions(query) {
    suggestionList.innerHTML = '';
    if (!query) {
      // No letters => no suggestions
      updateDropdownVisibility(query);
      return;
    }

    // STARTS-WITH matching (optional: change to includes if you prefer substring match)
    const results = allPages.filter(pageFile => {
      const lowerFile = pageFile.toLowerCase().replace('.html', '');
      return lowerFile.startsWith(query);
    });

    results.forEach(pageFile => {
      const li = document.createElement('li');

      // The page's display name on the left
      const pageNameSpan = document.createElement('span');
      pageNameSpan.textContent = pageFile.replace('.html', '');

      li.addEventListener('click', () => {
        if (window.location.pathname.includes('/wiki/')) {
          window.location.href = encodeURIComponent(pageFile);
        } else {
          window.location.href = 'wiki/' + encodeURIComponent(pageFile);
        }
      });

      // Pin icon on the right
      const isPinned = pinnedPages.includes(pageFile);
      const pinBtn = document.createElement('button');
      pinBtn.classList.add('pin-btn');
      pinBtn.textContent = isPinned ? '●' : '○';
      pinBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        if (!isPinned) {
          pinPage(pageFile);
        } else {
          unpinPage(pageFile);
        }
        updateSuggestions(query); // re-render suggestions to update icon
      });

      li.appendChild(pageNameSpan);
      li.appendChild(pinBtn);
      suggestionList.appendChild(li);
    });

    updateDropdownVisibility(query);
  }

  function pinPage(pageFile) {
    if (!pinnedPages.includes(pageFile)) {
      pinnedPages.push(pageFile);
      localStorage.setItem('pinnedPages', JSON.stringify(pinnedPages));
      displayPinnedPages();
    }
  }

  function unpinPage(pageFile) {
    pinnedPages = pinnedPages.filter(file => file !== pageFile);
    localStorage.setItem('pinnedPages', JSON.stringify(pinnedPages));
    displayPinnedPages();
  }

  function displayPinnedPages() {
    pinnedSection.innerHTML = '';
    if (!pinnedPages.length) {
      pinnedSection.style.display = 'none';
      return;
    }
    pinnedSection.style.display = 'block';

    const pinnedTitle = document.createElement('h4');
    pinnedTitle.textContent = 'Pinned';
    pinnedSection.appendChild(pinnedTitle);

    const pinList = document.createElement('ul');
    pinnedSection.appendChild(pinList);

    pinnedPages.forEach(pageFile => {
      const li = document.createElement('li');

      // Title on the left
      const pageNameSpan = document.createElement('span');
      pageNameSpan.textContent = pageFile.replace('.html', '');
      li.addEventListener('click', () => {
        if (window.location.pathname.includes('/wiki/')) {
          window.location.href = encodeURIComponent(pageFile);
        } else {
          window.location.href = 'wiki/' + encodeURIComponent(pageFile);
        }
      });
      li.appendChild(pageNameSpan);

      // Unpin circle on the right
      const unpinBtn = document.createElement('button');
      unpinBtn.classList.add('pin-btn');
      unpinBtn.textContent = '●';
      unpinBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        unpinPage(pageFile);
      });
      li.appendChild(unpinBtn);

      pinList.appendChild(li);
    });
  }

  /**
   * Shows or hides the dropdown based on pinned items and query:
   * - If no pinned pages and query is empty => hide
   * - Otherwise => show
   */
  function updateDropdownVisibility(query) {
    if (pinnedPages.length === 0 && !query) {
      dropdown.style.display = 'none';
    } else {
      dropdown.style.display = 'block';
    }
  }
});
