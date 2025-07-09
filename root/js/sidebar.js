document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-btn');
    const body = document.body;
    const DEFAULT_WIDTH = 260;
    const MAX_WIDTH = 500;

    // Remove top-of-sidebar favorite icon (star) if present
    const oldFav = sidebar.querySelector('.sidebar-favorite-btn');
    if (oldFav && oldFav.parentElement === sidebar) {
        sidebar.removeChild(oldFav);
    }

    sidebar.classList.remove('sidebar-open');
    body.classList.remove('sidebar-open');
    document.documentElement.style.setProperty('--sidebar-width', `${DEFAULT_WIDTH}px`);
    sidebar.style.width = `${DEFAULT_WIDTH}px`;

    function openSidebar() {
        sidebar.classList.add('sidebar-open');
        body.classList.add('sidebar-open');
        openBtn.innerHTML = '&#10005;';
        // Dynamically adjust sidebar width to fit content
        sidebar.style.width = 'auto';
        const neededWidth = sidebar.scrollWidth;
        const width = Math.min(Math.max(neededWidth, DEFAULT_WIDTH), MAX_WIDTH);
        sidebar.style.width = width + 'px';
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
    }
    function closeSidebar() {
        sidebar.classList.remove('sidebar-open');
        body.classList.remove('sidebar-open');
        openBtn.innerHTML = '&#9776;';
        document.documentElement.style.setProperty('--sidebar-width', `0px`);
    }
    openBtn.addEventListener('click', () => {
        if (sidebar.classList.contains('sidebar-open')) closeSidebar();
        else openSidebar();
    });

    enableSidebarResize();

    function enableSidebarResize() {
        if (sidebar.querySelector('.sidebar-resizer')) return;
        const resizer = document.createElement('div');
        resizer.className = 'sidebar-resizer';
        sidebar.appendChild(resizer);

        let startX, startWidth;
        resizer.addEventListener('mousedown', e => {
            e.preventDefault();
            startX = e.clientX;
            startWidth = sidebar.offsetWidth;
            document.body.style.cursor = 'ew-resize';
            document.addEventListener('mousemove', resizeSidebar);
            document.addEventListener('mouseup', stopResize);
        });
        function resizeSidebar(e) {
            let newWidth = Math.max(140, startWidth + (e.clientX - startX));
            newWidth = Math.min(newWidth, MAX_WIDTH);
            sidebar.style.width = newWidth + 'px';
            if (sidebar.classList.contains('sidebar-open')) {
                document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
            }
        }
        function stopResize() {
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', resizeSidebar);
            document.removeEventListener('mouseup', stopResize);
        }
    }

    // Wait for markdown content, then build TOC
    function waitForMarkdown(cb) {
        const content = document.getElementById('markdown-content');
        if (content && content.innerHTML.trim()) cb();
        else setTimeout(() => waitForMarkdown(cb), 100);
    }
    waitForMarkdown(() => { buildSidebarTOC(); });

    // Build collapsible tree from headings (h2-h6, fully nested)
    function buildSidebarTOC() {
        const content = document.getElementById('markdown-content');
        if (!content) return;
        const sidebarLinks = sidebar.querySelector('.sidebar-links');
        sidebarLinks.innerHTML = '';
        // Add page heading (h1) as first item
        const h1 = content.querySelector('h1');
        if (h1) {
            if (!h1.id) h1.id = 'page-top';
            const li = document.createElement('li');
            li.className = 'toc-level-1 toc-page-heading';
            // Create a button instead of link to prevent URL hash change
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = h1.textContent;
            btn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            li.appendChild(btn);
            sidebar.querySelector('.sidebar-links').appendChild(li);
        }
        const headings = Array.from(content.querySelectorAll('h2, h3, h4, h5, h6'));
        if (!headings.length) return;
        function buildTree(headings) {
            const root = [];
            const stack = [];
            headings.forEach(h => {
                const level = parseInt(h.tagName[1]);
                const node = {
                    el: h,
                    text: h.textContent,
                    id: h.id || h.textContent.replace(/\s+/g, '-'),
                    level,
                    children: []
                };
                h.id = node.id;
                while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
                if (stack.length === 0) root.push(node);
                else stack[stack.length - 1].children.push(node);
                stack.push(node);
            });
            return root;
        }
        const tree = buildTree(headings);
        // Render all headings/subheadings as flat list, each on a new line
        function renderFlatList(nodes, parentUl) {
            nodes.forEach(node => {
                const li = document.createElement('li');
                li.className = 'toc-level-' + node.level;
                const row = document.createElement('div');
                row.className = 'toc-row';
                const a = document.createElement('a');
                a.href = '#' + node.id;
                a.innerHTML = node.text;
                a.addEventListener('click', e => {
                    e.preventDefault();
                    const target = document.getElementById(node.id);
                    if (target) {
                        const navbar = document.querySelector('.navbar');
                        let offset = 0;
                        if (navbar) offset = navbar.getBoundingClientRect().height;
                        const rect = target.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        window.scrollTo({
                            top: rect.top + scrollTop - offset - 8,
                            behavior: 'smooth'
                        });
                    }
                    setPinnedSection(node.id);
                });
                row.appendChild(a);
                // Pin button
                const pinBtn = document.createElement('button');
                pinBtn.className = 'toc-pin-btn sidebar-favorite-btn';
                pinBtn.title = isPinnedSection(node.id) ? 'Unpin' : 'Pin';
                pinBtn.innerHTML = isPinnedSection(node.id)
                    ? '<span class="adv-icon">&#9733;</span>'
                    : '<span class="adv-icon">&#9734;</span>';
                pinBtn.addEventListener('click', evt => {
                    evt.stopPropagation();
                    togglePinSection(node.id, node.text);
                    pinBtn.innerHTML = isPinnedSection(node.id)
                        ? '<span class="adv-icon">&#9733;</span>'
                        : '<span class="adv-icon">&#9734;</span>';
                    pinBtn.title = isPinnedSection(node.id) ? 'Unpin' : 'Pin';
                });
                row.appendChild(pinBtn);
                li.appendChild(row);
                parentUl.appendChild(li);
                // Recursively render children as flat list
                if (node.children.length) renderFlatList(node.children, parentUl);
            });
        }
        renderFlatList(tree, sidebarLinks);
        // Adjust sidebar width to fit longest heading/subheading
        setTimeout(() => {
            let maxWidth = 0;
            sidebarLinks.querySelectorAll('a').forEach(a => {
                const width = a.offsetWidth;
                if (width > maxWidth) maxWidth = width;
            });
            // Add some padding for pin/star buttons
            maxWidth += 60;
            const width = Math.min(Math.max(maxWidth, DEFAULT_WIDTH), MAX_WIDTH);
            sidebar.style.width = width + 'px';
            document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
        }, 100);
        window.addEventListener('scroll', () => {
            let currentId = null;
            for (const h of headings) {
                const rect = h.getBoundingClientRect();
                if (rect.top < 120) currentId = h.id;
            }
            sidebarLinks.querySelectorAll('a').forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
            });
        });
        renderPinnedSections();
    }

    // Pinning sections
    function getPinnedSections() {
        return JSON.parse(localStorage.getItem('pinnedSections') || '[]');
    }
    function isPinnedSection(id) {
        return getPinnedSections().some(s => s.id === id && s.page === location.pathname);
    }
    function togglePinSection(id, text) {
        let pins = getPinnedSections();
        const idx = pins.findIndex(s => s.id === id && s.page === location.pathname);
        if (idx === -1) pins.push({ id, text, page: location.pathname });
        else pins.splice(idx, 1);
        localStorage.setItem('pinnedSections', JSON.stringify(pins));
        renderPinnedSections();
    }
    function setPinnedSection(id) {}
    function renderPinnedSections() {
        let pins = getPinnedSections().filter(s => s.page === location.pathname);
        let pinBox = sidebar.querySelector('.sidebar-pinned');
        if (!pinBox) {
            pinBox = document.createElement('div');
            pinBox.className = 'sidebar-pinned';
            sidebar.insertBefore(pinBox, sidebar.querySelector('.sidebar-links'));
        }
        pinBox.innerHTML = '';
        if (!pins.length) {
            pinBox.style.display = 'none';
            return;
        }
        pinBox.style.display = 'block';
        const title = document.createElement('h4');
        title.textContent = 'Pinned Sections';
        pinBox.appendChild(title);
        const ul = document.createElement('ul');
        pins.forEach(s => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + s.id;
            a.textContent = s.text;
            a.addEventListener('click', e => {
                e.preventDefault();
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            li.appendChild(a);
            const unpin = document.createElement('button');
            unpin.className = 'toc-pin-btn';
            unpin.textContent = '';
            unpin.title = 'Unpin';
            unpin.addEventListener('click', evt => {
                evt.stopPropagation();
                togglePinSection(s.id, s.text);
            });
            li.appendChild(unpin);
            ul.appendChild(li);
        });
        pinBox.appendChild(ul);
    }

    // After buildSidebarTOC and any scroll handlers, ensure sidebar stays open on hash change
    window.addEventListener('hashchange', () => {
        if (sidebar.classList.contains('sidebar-open')) {
            openSidebar();
        }
    });
});
