// scape_wiki_script.js
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-btn');
    // Ensure Scape Wiki button always goes to the correct homepage
    const scapeWikiBtn = document.querySelector('.title');
    if (scapeWikiBtn) {
        scapeWikiBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../wiki/scape_wiki_homepage.html';
        });
    }

    let sidebarOpen = false;
    if (openBtn && sidebar) {
      openBtn.addEventListener('click', () => {
        sidebarOpen = !sidebarOpen;
        if (sidebarOpen) {
            sidebar.classList.add('sidebar-open');
            openBtn.innerHTML = '&times;';
        } else {
            sidebar.classList.remove('sidebar-open');
            openBtn.innerHTML = '&#9776;';
        }
      });
    }
});
