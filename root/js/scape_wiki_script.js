// scape_wiki_script.js
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-btn');

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
