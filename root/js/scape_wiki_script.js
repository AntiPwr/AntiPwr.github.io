document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-btn');
    const closeBtn = document.getElementById('close-btn');
    const searchInput = document.querySelector('.nav-search input');

    openBtn.addEventListener('click', function() {
        sidebar.style.display = 'block';
        closeBtn.style.display = 'block';
    });

    closeBtn.addEventListener('click', function() {
        sidebar.style.display = 'none';
    });

    // Load wiki pages from a JSON file that lists all .html pages in the wiki folder
    // Example: wiki_pages.json = ["page1.html", "page2.html", ...]
    let allPages = [];

    async function loadWikiPages() {
        try {
            const response = await fetch('wiki_pages.json');
            allPages = await response.json();
        } catch (error) {
            console.error('Error loading wiki pages:', error);
        }
    }

    loadWikiPages();

    // Search functionality
    searchInput.addEventListener('keyup', function() {
        const filter = searchInput.value.toLowerCase();
        const sections = document.querySelectorAll('main section');

        // Show/hide sections based on text content
        sections.forEach(function(section) {
            const text = section.textContent.toLowerCase();
            section.style.display = text.includes(filter) ? '' : 'none';
        });

        // Also show a dropdown or suggestions based on allPages
        // This can be improved to show a suggestion box
        // For simplicity, just log matches to console:
        const matchedPages = allPages.filter(page => page.toLowerCase().includes(filter));
        console.log('Matched wiki pages:', matchedPages);
    });
});
