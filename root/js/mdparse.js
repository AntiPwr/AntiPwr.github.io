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
            // Optional: remove leading underscore from fileName if that's your convention
            const cleanFileName = fileName.replace(/^_/, '');
            return `<a href="${cleanFileName}.html">${name}</a>`;
        }
    }];

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load Markdown file: ${response.status} ${response.statusText}`);
        }

        const markdown = await response.text();
        const converter = new showdown.Converter({
            extensions: [obsidianLinkExtension()]
        });
        let html = converter.makeHtml(markdown);

        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // 1) Assign IDs to headings <h1> through <h6> if they don't already have one
        const headingTags = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headingTags.forEach((heading) => {
            if (!heading.id) {
                // Create an ID based on heading text (cleaned up)
                // Remove special characters, replace spaces with dashes, etc.
                const textContent = heading.textContent.trim();
                const slug = textContent
                  .toLowerCase()
                  .replace(/[^\w]+/g, '-') // Non-word => dash
                  .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
                heading.id = slug;
            }
        });

        // 2) Now that headings have IDs, put the final HTML back into a string
        html = tempDiv.innerHTML;

        // 3) Insert into the container
        container.innerHTML = html;

        // 4) Build the sidebar links by scanning these headings
        buildSidebarTOC(headingTags);

        console.log('Markdown successfully loaded and rendered.');
    } catch (error) {
        console.error('Error loading Markdown:', error);
    }
});

/**
 * Builds a table of contents in the sidebar by scanning the heading tags.
 */
function buildSidebarTOC(headingElements) {
    // Find your sidebar container
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // If the sidebar contains an <ul> for links, or create one if needed
    let sidebarLinks = sidebar.querySelector('ul.sidebar-links');
    if (!sidebarLinks) {
        sidebarLinks = document.createElement('ul');
        sidebarLinks.classList.add('sidebar-links');
        sidebar.appendChild(sidebarLinks);
    }

    // Clear existing links if you want to refresh each time
    sidebarLinks.innerHTML = '';

    headingElements.forEach((heading) => {
        // Use the heading ID to create a link
        const headingText = heading.textContent.trim();
        const headingId = heading.id;
        
        // Create a <li> and <a>
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + headingId;
        a.textContent = headingText;

        li.appendChild(a);
        sidebarLinks.appendChild(li);
    });
}
