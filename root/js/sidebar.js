document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-btn');
    let sidebarOpen = false;

    openBtn.addEventListener('click', () => {
        sidebarOpen = !sidebarOpen;
        if (sidebarOpen) {
            sidebar.classList.add('sidebar-open');
            openBtn.innerHTML = '&times;'; // Change icon if desired
        } else {
            sidebar.classList.remove('sidebar-open');
            openBtn.innerHTML = '&#9776;'; // Return to menu icon
        }
    });
});
