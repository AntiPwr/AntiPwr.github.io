document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-btn');
    const body = document.body;
    const DEFAULT_WIDTH = 260;
    const MAX_WIDTH = 500;

    sidebar.classList.remove('sidebar-open');
    body.classList.remove('sidebar-open');
    document.documentElement.style.setProperty('--sidebar-width', `${DEFAULT_WIDTH}px`);
    sidebar.style.width = `${DEFAULT_WIDTH}px`;

    function openSidebar() {
        sidebar.classList.add('sidebar-open');
        body.classList.add('sidebar-open');
        openBtn.innerHTML = '&#10005;';
        document.documentElement.style.setProperty('--sidebar-width', `${sidebar.offsetWidth}px`);
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
        function renderTree(nodes, parentUl) {
            nodes.forEach(node => {
                const li = document.createElement('li');
                li.className = 'toc-level-' + node.level;
                const row = document.createElement('div');
                row.className = 'toc-row';
                const arrow = document.createElement('span');
                arrow.className = 'toc-arrow';
                if (node.children.length) {
                    arrow.innerHTML = '▸';
                    arrow.addEventListener('click', e => {
                        e.stopPropagation();
                        li.classList.toggle('collapsed');
                        arrow.innerHTML = li.classList.contains('collapsed') ? '▸' : '▾';
                    });
                } else {
                    arrow.innerHTML = '';
                }
                row.appendChild(arrow);
                const a = document.createElement('a');
                a.href = '#' + node.id;
                a.innerHTML = node.text;
                a.addEventListener('click', e => {
                    e.preventDefault();
                    document.getElementById(node.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setPinnedSection(node.id);
                });
                row.appendChild(a);
                const pinBtn = document.createElement('button');
                pinBtn.className = 'toc-pin-btn';
                pinBtn.title = 'Pin section';
                pinBtn.textContent = isPinnedSection(node.id) ? '★' : '☆';
                pinBtn.addEventListener('click', evt => {
                    evt.stopPropagation();
                    togglePinSection(node.id, node.text);
                    pinBtn.textContent = isPinnedSection(node.id) ? '★' : '☆';
                });
                row.appendChild(pinBtn);
                li.appendChild(row);
                if (node.children.length) {
                    const ul = document.createElement('ul');
                    renderTree(node.children, ul);
                    li.appendChild(ul);
                }
                parentUl.appendChild(li);
            });
        }
        renderTree(tree, sidebarLinks);
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
            unpin.textContent = '★';
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
});
