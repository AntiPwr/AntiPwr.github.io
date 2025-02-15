document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.nav-search input');
    if (!searchInput) return; // If there's no search input on this page, do nothing.
  
    // Create a dropdown for suggestions & pinned items
    const dropdown = document.createElement('div');
    dropdown.classList.add('search-dropdown');
    // Insert the dropdown after the search input
    searchInput.parentNode.appendChild(dropdown);
  
    // Create a pinned section inside the dropdown
    const pinnedSection = document.createElement('div');
    pinnedSection.classList.add('pinned-section');
    dropdown.appendChild(pinnedSection);
  
    // Where we’ll list actual suggestions
    const suggestionList = document.createElement('ul');
    suggestionList.classList.add('suggestion-list');
    dropdown.appendChild(suggestionList);
  
    // 'allPages' loaded from wiki_pages.json
    let allPages = [];
    // pinnedPages from localStorage
    let pinnedPages = JSON.parse(localStorage.getItem('pinnedPages')) || [];
  
    // 1) Load the wiki pages from wiki_pages.json
    fetch('wiki_pages.json')
      .then(resp => resp.json())
      .then(data => {
        allPages = data; // example: ["Toma.html", "Asceptim.html", ...]
        displayPinnedPages();
      })
      .catch(err => console.error('Error loading wiki_pages.json:', err));
  
    // 2) Listen for user input
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      updateSuggestions(query);
    });
  
    // Close suggestions when click outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== searchInput) {
        dropdown.style.display = 'none';
      } else {
        dropdown.style.display = 'block';
      }
    });
  
    // ### Helper Functions ###
  
    function updateSuggestions(query) {
      // Clear old suggestions
      suggestionList.innerHTML = '';
  
      // If no query, hide suggestions
      if (!query) {
        return;
      }
  
      // Filter pages by the query
      const results = allPages.filter(pageFile => 
        pageFile.toLowerCase().includes(query)
      );
  
      results.forEach(pageFile => {
        const li = document.createElement('li');
        li.textContent = pageFile.replace('.html', ''); // Display without .html extension
        li.addEventListener('click', () => {
          // Navigate to that HTML page
          window.location.href = pageFile;
        });
  
        // Pin button
        const pinBtn = document.createElement('button');
        pinBtn.textContent = '📌';
        pinBtn.classList.add('pin-btn');
        pinBtn.addEventListener('click', (evt) => {
          evt.stopPropagation(); // prevent navigating
          pinPage(pageFile);
        });
        li.appendChild(pinBtn);
  
        suggestionList.appendChild(li);
      });
    }
  
    function pinPage(pageFile) {
      // If not pinned yet, add it to pinned
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
      // Clear pinned section
      pinnedSection.innerHTML = '';
  
      // If no pinned pages, hide pinned section
      if (!pinnedPages.length) {
        pinnedSection.style.display = 'none';
        return;
      }
      pinnedSection.style.display = 'block';
  
      // Title for pinned
      const pinnedTitle = document.createElement('h4');
      pinnedTitle.textContent = 'Pinned';
      pinnedSection.appendChild(pinnedTitle);
  
      // List pinned items
      const pinList = document.createElement('ul');
      pinnedSection.appendChild(pinList);
  
      pinnedPages.forEach(pageFile => {
        const li = document.createElement('li');
        li.textContent = pageFile.replace('.html', '');
        li.addEventListener('click', () => {
          window.location.href = pageFile;
        });
  
        // Unpin button
        const unpinBtn = document.createElement('button');
        unpinBtn.textContent = '❌';
        unpinBtn.classList.add('pin-btn');
        unpinBtn.addEventListener('click', (evt) => {
          evt.stopPropagation();
          unpinPage(pageFile);
        });
        li.appendChild(unpinBtn);
  
        pinList.appendChild(li);
      });
    }
  
  });
  