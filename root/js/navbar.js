let searchLocked = false;
let searchPanelOpen = false;

const navbar = document.querySelector('.navbar');
const searchInput = navbar ? navbar.querySelector('.nav-search input') : null;
const searchClearBtn = document.querySelector('.search-clear-btn');
const searchLockBtn = document.querySelector('.search-lock-btn');

// Open/close panel logic
function openSearchPanel() {
    navbar.classList.add('search-active');
    searchPanelOpen = true;
}
function closeSearchPanel() {
    if (!searchLocked) {
        navbar.classList.remove('search-active');
        searchPanelOpen = false;
    }
}

// Lock button logic
if (searchLockBtn) {
    searchLockBtn.addEventListener('click', () => {
        searchLocked = !searchLocked;
        searchLockBtn.classList.toggle('locked', searchLocked);
        if (searchLocked && !searchPanelOpen) {
            navbar.classList.remove('search-active');
        } else if (searchLocked && searchPanelOpen) {
            navbar.classList.add('search-active');
        }
    });
}

// X button closes panel if not locked
if (searchClearBtn) {
    searchClearBtn.addEventListener('click', closeSearchPanel);
}

// Keep navbar expanded as long as search is open or focused
if (searchInput) {
    searchInput.addEventListener('focus', openSearchPanel);
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() !== '') openSearchPanel();
        else if (!searchLocked) closeSearchPanel();
    });
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            if (!searchLocked && !searchInput.value.trim()) closeSearchPanel();
        }, 200);
    });
}

// Prevent nav bar from closing if search engine is open
const observer = new MutationObserver(() => {
    if (navbar.classList.contains('search-active')) {
        navbar.classList.add('search-active');
    }
    if (searchInput && searchInput === document.activeElement) {
        navbar.classList.add('search-active');
    }
});
observer.observe(navbar, { attributes: true, attributeFilter: ['class'] });