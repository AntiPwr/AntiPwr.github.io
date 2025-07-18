document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('markdown-content');
    if (!container) {
        console.error('No #markdown-content element found.');
        return;
    }

    const filePath = container.getAttribute('data-md-file');
    if (!filePath) {
        console.error('No data-md-file attribute found on #markdown-content.');
        return;
    }

    // Showdown extension to convert Obsidian-style [[File|Name]] links to HTML <a> links
    const obsidianLinkExtension = () => [{
        type: 'lang',
        regex: /\[\[([^|\]]+)\|?([^\]]*)\]\]/g,
        replace: (match, fileName, displayName) => {
            const name = displayName.trim() !== '' ? displayName : fileName;
            const cleanFileName = fileName.replace(/^_/, '');
            return `<a href="${cleanFileName}.html">${name}</a>`;
        }
    }];

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load Markdown file: ${response.status} ${response.statusText}`);
        }


        let markdown = await response.text();
        // Remove content between <!-- obsidian-pull:start --> and <!-- obsidian-pull:end -->
        markdown = markdown.replace(/<!--\s*obsidian-pull:start\s*-->[\s\S]*?<!--\s*obsidian-pull:end\s*-->/gi, '');
        // Remove HTML comments from markdown before parsing, except for our section markers
        markdown = markdown.replace(/<!--(?!\s*(wiki-header-section|taxonomy-table-section):).*?-->/gs, '');

        const converter = new showdown.Converter({
            tables: true,
            extensions: [obsidianLinkExtension()]
        });

        // --- Nickname/Alternative Title Parsing ---
        // Look for a line of underscores after the first heading (h1) in the markdown, e.g.:
        // # Main Title\n_Doctrine of Ascension_\n
        // Regex: match # Heading, then a line starting and ending with _ (optionally surrounded by whitespace)
        // Replace with: # Heading\n<p class="nickname">Nickname</p>\n
        markdown = markdown.replace(
            /^(# .+?)\n(_[^_][^\n]*_)\n/m,
            (match, heading, nickname) => {
                // Remove surrounding underscores and whitespace
                const cleanNickname = nickname.replace(/^_+|_+$/g, '').trim();
                return `${heading}\n<p class="nickname">${cleanNickname}</p>\n`;
            }
        );

        let html = converter.makeHtml(markdown);

        // --- Section Wrapping Logic ---
        // Wrap content between <!-- wiki-header-section:start --> and <!-- wiki-header-section:end -->
        // and between <!-- taxonomy-table-section:start --> and <!-- taxonomy-table-section:end -->
        function wrapSection(html, startMarker, endMarker, wrapperClass) {
            const start = html.indexOf(startMarker);
            const end = html.indexOf(endMarker);
            if (start !== -1 && end !== -1 && end > start) {
                const before = html.slice(0, start);
                const section = html.slice(start + startMarker.length, end);
                const after = html.slice(end + endMarker.length);
                return (
                    before +
                    `<div class="${wrapperClass}">` +
                    section +
                    `</div>` +
                    after
                );
            }
            return html;
        }

        html = wrapSection(
            html,
            '<!-- wiki-header-section:start -->',
            '<!-- wiki-header-section:end -->',
            'wiki-header-section'
        );
        html = wrapSection(
            html,
            '<!-- taxonomy-table-section:start -->',
            '<!-- taxonomy-table-section:end -->',
            'taxonomy-table-section'
        );

        // Remove the section markers from the HTML
        html = html.replace(/<!--\s*wiki-header-section:(start|end)\s*-->/g, '');
        html = html.replace(/<!--\s*taxonomy-table-section:(start|end)\s*-->/g, '');

        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // --- NEW: Parse markdown inside taxonomy-table-section ---
        const taxonomySection = tempDiv.querySelector('.taxonomy-table-section');
        if (taxonomySection) {
            // Parse markdown inside taxonomy section again
            // 1. Get the raw HTML (which may still contain markdown)
            // 2. Convert it to markdown (reverse), then parse again, or just parse as markdown
            // Instead, get the original markdown for taxonomy section and parse it
            // Find the taxonomy section in the original markdown
            const taxonomyStart = markdown.indexOf('<!-- taxonomy-table-section:start -->');
            const taxonomyEnd = markdown.indexOf('<!-- taxonomy-table-section:end -->');
            if (taxonomyStart !== -1 && taxonomyEnd !== -1 && taxonomyEnd > taxonomyStart) {
                const taxonomyMd = markdown.slice(
                    taxonomyStart + '<!-- taxonomy-table-section:start -->'.length,
                    taxonomyEnd
                );
                // Parse the taxonomy markdown to HTML
                const taxonomyHtml = converter.makeHtml(taxonomyMd);
                taxonomySection.innerHTML = taxonomyHtml;
            }
        }

        // 1) Assign IDs to headings <h1> through <h6> if they don't already have one
        const headingTags = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headingTags.forEach((heading) => {
            if (!heading.id) {
                const textContent = heading.textContent.trim();
                const slug = textContent
                  .toLowerCase()
                  .replace(/[^\w]+/g, '-')
                  .replace(/^-+|-+$/g, '');
                heading.id = slug;
            }
        });

        // 2) Now that headings have IDs, get final HTML
        html = tempDiv.innerHTML;

        // 3) Insert into container
        container.innerHTML = html;

        // 4) Build the sidebar links by scanning these headings
        buildSidebarTOC(headingTags);

        // 5) [REMOVED] Image magnification/lightbox for all images in wiki-content

        // 6) Make taxonomy table title and taxon labels clickable
        enableTaxonomyLinks();

        console.log('Markdown successfully loaded and rendered.');
    } catch (error) {
        console.error('Error loading Markdown:', error);
    }
});

function buildSidebarTOC(headingElements) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    let sidebarLinks = sidebar.querySelector('ul.sidebar-links');
    if (!sidebarLinks) {
        sidebarLinks = document.createElement('ul');
        sidebarLinks.classList.add('sidebar-links');
        sidebar.appendChild(sidebarLinks);
    }
    sidebarLinks.innerHTML = '';

    // Build a flat array of heading objects
    const headings = Array.from(headingElements).map(h => ({
        text: h.textContent.trim(),
        id: h.id,
        level: parseInt(h.tagName[1], 10)
    }));

    // Build a nested tree from the flat array
    function buildTree(flat) {
        const root = [];
        const stack = [];
        flat.forEach(h => {
            const node = { ...h, children: [] };
            while (stack.length && stack[stack.length - 1].level >= node.level) {
                stack.pop();
            }
            if (stack.length === 0) {
                root.push(node);
            } else {
                stack[stack.length - 1].children.push(node);
            }
            stack.push(node);
        });
        return root;
    }

    // Render the tree recursively
    function renderTree(nodes, parentUl) {
        nodes.forEach(node => {
            const li = document.createElement('li');
            li.className = `toc-level-${node.level}`;
            // Arrow for collapsible if has children
            if (node.children.length) {
                const arrow = document.createElement('span');
                arrow.className = 'toc-arrow';
                arrow.innerHTML = '▾';
                arrow.style.cursor = 'pointer';
                arrow.onclick = (e) => {
                    e.stopPropagation();
                    li.classList.toggle('collapsed');
                    arrow.innerHTML = li.classList.contains('collapsed') ? '▸' : '▾';
                };
                li.appendChild(arrow);
            } else {
                // For alignment, add a placeholder span
                const arrow = document.createElement('span');
                arrow.className = 'toc-arrow';
                arrow.innerHTML = '';
                arrow.style.display = 'inline-block';
                arrow.style.width = '1em';
                li.appendChild(arrow);
            }

            const a = document.createElement('a');
            a.href = '#' + node.id;
            a.textContent = node.text;
            li.appendChild(a);

            if (node.children.length) {
                const ul = document.createElement('ul');
                renderTree(node.children, ul);
                li.appendChild(ul);
            }
            parentUl.appendChild(li);
        });
    }

    const tree = buildTree(headings);
    renderTree(tree, sidebarLinks);
}

// [REMOVED] enableWikiImageLightbox and all lightbox functionality
                if (img.nextElementSibling && img.nextElementSibling.tagName === 'I') {
                    caption = img.nextElementSibling.textContent;
                } else if (img.parentElement && img.parentElement.tagName === 'I') {
                    caption = img.parentElement.textContent;
                } else if (img.alt) {
                    caption = img.alt;
                } else if (img.title) {
                    caption = img.title;
                } else if (img.getAttribute('aria-label')) {
                    caption = img.getAttribute('aria-label');
                } else {
                    caption = img.src.split('/').pop().replace(/\.[^/.]+$/, '');
                }
                lightboxCaption.textContent = caption;
                // Remove previous orientation class
                lightbox.classList.remove('vertical');
                // Wait for image to load to get dimensions
                lightboxImg.onload = function() {
                    if (lightboxImg.naturalHeight > lightboxImg.naturalWidth) {
                        lightbox.classList.add('vertical');
                    } else {
                        lightbox.classList.remove('vertical');
                    }
                    // Classify caption as single-line or multi-line for horizontal images
                    lightboxCaption.classList.remove('single-line', 'multi-line');
                    if (!lightbox.classList.contains('vertical')) {
                        const style = window.getComputedStyle(lightboxCaption);
                        const lineHeight = parseFloat(style.lineHeight);
                        const lines = Math.round(lightboxCaption.scrollHeight / lineHeight) || 1;
                        if (lines <= 1) {
                            lightboxCaption.classList.add('single-line');
                        } else {
                            lightboxCaption.classList.add('multi-line');
                        }
                    }
                };
                // If cached, fire onload manually
                if (lightboxImg.complete) {
                    lightboxImg.onload();
                }
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
                setTimeout(() => lightbox.focus(), 10);
            
        
    

    // Initial setup and on DOM changes (for dynamic content)
    setupImageClicks();
    // Observe for new images (e.g., after navigation)
    const observer = new MutationObserver(setupImageClicks);
    observer.observe(document.getElementById('markdown-content'), { childList: true, subtree: true });


classifyStaticCaptions(); // initial run if called after setup
function classifyStaticCaptions() {
    document.querySelectorAll('.wiki-content img + i, .wiki-header-section img + i').forEach(caption => {
        const style = window.getComputedStyle(caption);
        const lineHeight = parseFloat(style.lineHeight);
        const lines = Math.round(caption.scrollHeight / lineHeight) || 1;
        caption.classList.remove('static-single-line', 'static-multi-line');
        if (lines <= 1) {
            caption.classList.add('static-single-line');
        } else {
            caption.classList.add('static-multi-line');
        }
    });
}
// Reclassify on window resize to handle responsive text wrap
window.addEventListener('resize', classifyStaticCaptions);

// Also hook into DOMContentLoaded for initial classification
document.addEventListener('DOMContentLoaded', classifyStaticCaptions);

function enableTaxonomyLinks() {
    // Purpose Taxonomy title
    document.querySelectorAll('.taxonomy-table th').forEach(th => {
        if (th.textContent.match(/Purpose\s*Taxonomy/i)) {
            // Only wrap if not already a link
            if (!th.querySelector('a')) {
                th.innerHTML = `<a href="Purpose%20Taxonomy.html">${th.textContent.trim()}</a>`;
            }
        }
    });
    // Taxon labels (Bin, Basin, Eco, etc.)
    const taxonMap = {
        'Bin': 'Bin.html',
        'Basin': 'Basin.html',
        'Eco': 'Eco.html',
        'Kingdom': 'Kingdom.html',
        'Phylum': 'Phylum.html',
        'Class': 'Class.html',
        'Order': 'Order.html',
        'Family': 'Family.html',
        'Essa': 'Essa.html'
    };
    document.querySelectorAll('.taxonomy-table .taxon-label').forEach(td => {
        const label = td.textContent.replace(/:.*$/, '').trim();
        if (taxonMap[label] && !td.querySelector('a')) {
            // Find the <img> if present
            const img = td.querySelector('img');
            let labelHtml = label + ':';
            if (img) {
                labelHtml = img.outerHTML + label + ':';
            }
            td.innerHTML = `<a href="${taxonMap[label]}">${labelHtml}</a>`;
        }
    });
}
