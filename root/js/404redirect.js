// 404redirect.js
// Automatically redirect to /404.html if the current HTML file does not exist (e.g., user navigates to a missing wiki page)
// Usage: Include this script in your HTML templates (ideally before other scripts)

(function() {
    // Only run if not already on the 404 page
    if (window.location.pathname.endsWith('/404.html')) return;

    // Only run for .html pages (not index.html or homepage)
    var path = window.location.pathname;
    if (!path.endsWith('.html')) return;

    // Try to fetch the current page (should always succeed unless the server is misconfigured)
    fetch(window.location.href, { method: 'HEAD' })
        .then(function(response) {
            if (!response.ok) {
                // If the file does not exist, redirect to 404.html
                window.location.replace('/404.html');
            }
        })
        .catch(function() {
            // On network error, also redirect
            window.location.replace('/404.html');
        });
})();

// Intercept all .html link clicks and redirect to 404.html if the file does not exist
// (works for local static servers that do not support custom 404s in subfolders)
document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(e) {
        // Only handle left-clicks on <a> elements
        if (e.target.tagName === 'A' && e.target.getAttribute('href') && e.target.getAttribute('href').endsWith('.html')) {
            const href = e.target.getAttribute('href');
            // Only intercept local .html links (not external)
            if (!/^https?:\/\//.test(href) && !href.startsWith('#')) {
                e.preventDefault();
                fetch(href, { method: 'HEAD' })
                    .then(resp => {
                        if (resp.ok) {
                            window.location.href = href;
                        } else {
                            window.location.href = '/404.html';
                        }
                    })
                    .catch(() => {
                        window.location.href = '/404.html';
                    });
            }
        }
    });
});
