// scape_wiki_script.js
// Only handles Scape Wiki homepage button logic now. Sidebar open/close is managed in sidebar.js
document.addEventListener('DOMContentLoaded', function() {
    // Ensure Scape Wiki button always goes to the correct homepage
    const scapeWikiBtn = document.querySelector('.title');
    if (scapeWikiBtn) {
        scapeWikiBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../wiki/scape_wiki_homepage.html';
        });
    }
});
