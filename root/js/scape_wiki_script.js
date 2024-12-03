// Sidebar Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-btn');
    const closeBtn = document.getElementById('close-btn');
    const content = document.querySelector('.content');

    openBtn.addEventListener('click', function() {
        sidebar.style.left = '0';
        content.style.marginLeft = '250px';
    });

    closeBtn.addEventListener('click', function() {
        sidebar.style.left = '-250px';
        content.style.marginLeft = '0';
    });
});


// Search Functionality
const searchInput = document.querySelector('.nav-search input');
searchInput.addEventListener('keyup', function() {
    const filter = searchInput.value.toLowerCase();
    const sections = document.querySelectorAll('main section');

    sections.forEach(function(section) {
        const text = section.textContent.toLowerCase();
        if (text.includes(filter)) {
            section.style.display = '';
        } else {
            section.style.display = 'none';
        }
    });
});
