document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-btn');
    let sidebarOpen = false;

    openBtn.addEventListener('click', () => {
        if (!sidebarOpen) {
            // Show the sidebar
            sidebar.style.display = 'block';
            // Change button text/icon to close
            openBtn.innerHTML = '&times;';
            sidebarOpen = true;
        } else {
            // Hide the sidebar
            sidebar.style.display = 'none';
            // Change button text/icon back to open
            openBtn.innerHTML = '&#9776;';
            sidebarOpen = false;
        }
    });
});