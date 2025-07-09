// wiki_preview.js
(function() {
  let previews = {};
  let previewBox = null;

  // Utility to get page name from link text or href
  function getPageName(link) {
    // For [[Page Name]] style
    if (link.dataset && link.dataset.wikiPage) return link.dataset.wikiPage;
    // For <a href="..."> style
    let href = link.getAttribute('href') || '';
    let match = href.match(/([^/]+)\.html$/);
    if (match) return decodeURIComponent(match[1].replace(/_/g, ' '));
    // Fallback: use text
    return link.textContent.trim();
  }

  // Create the preview box element
  function createPreviewBox() {
    const box = document.createElement('div');
    box.id = 'wiki-preview-box';
    box.style.display = 'none';
    document.body.appendChild(box);
    return box;
  }

  // Show the preview box
  function showPreview(link, page) {
    if (!previews[page]) return;
    const { image, intro } = previews[page];
    let html = '';
    let imgHtml = '';
    let imgSrc = '';
    if (image) {
      if (image.startsWith('wiki/wiki_images/')) {
        imgSrc = '/root/' + image;
      } else if (image.startsWith('wiki_images/')) {
        imgSrc = '/root/' + image;
      } else {
        imgSrc = '/root/wiki_images/' + image;
      }
      imgHtml = `<img src="${imgSrc}" alt="${page}" onerror=\"this.style.display='none'\" />`;
    }
    // Create a temporary image to check aspect ratio
    if (imgHtml) {
      const tempImg = new window.Image();
      tempImg.onload = function() {
        let isVertical = tempImg.naturalHeight > tempImg.naturalWidth;
        if (isVertical) {
          // Vertical: text left, image right
          previewBox.innerHTML = `<div class='wiki-preview-intro'>${intro || 'No preview available.'}</div><div class='wiki-preview-img-wrap vertical-img'>${imgHtml}</div>`;
          previewBox.style.flexDirection = 'row';
        } else {
          // Horizontal: image on top, text below
          previewBox.innerHTML = `<div class='wiki-preview-img-wrap horizontal-img'>${imgHtml}</div><div class='wiki-preview-intro'>${intro || 'No preview available.'}</div>`;
          previewBox.style.flexDirection = 'column';
        }
        previewBox.style.display = 'flex';
      };
      tempImg.src = imgSrc;
    } else {
      previewBox.innerHTML = `<div class='wiki-preview-intro'>${intro || 'No preview available.'}</div>`;
      previewBox.style.flexDirection = 'column';
      previewBox.style.display = 'flex';
    }

    // Position near the link
    const rect = link.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    previewBox.style.top = (rect.bottom + scrollY + 8) + 'px';
    previewBox.style.left = (rect.left + scrollX) + 'px';
  }

  // Hide the preview box
  function hidePreview() {
    previewBox.style.display = 'none';
  }

  // Attach hover listeners to wiki links
  function attachPreviewListeners() {
    // Attach to all <a> inside .wiki-content (rendered markdown)
    const links = document.querySelectorAll('.wiki-content a');
    links.forEach(link => {
      const page = getPageName(link);
      link.addEventListener('mouseenter', () => showPreview(link, page));
      link.addEventListener('mouseleave', hidePreview);
      link.addEventListener('mousemove', (e) => {
        previewBox.style.top = (e.clientY + 16 + window.scrollY) + 'px';
        previewBox.style.left = (e.clientX + 16 + window.scrollX) + 'px';
      });
    });
  }

  // Load the preview JSON and initialize
  function init() {
    previewBox = createPreviewBox();
    fetch('../json/wiki_page_previews.json')
      .then(res => res.json())
      .then(data => {
        previews = data;
        // Attach listeners after markdown is rendered
        if (document.querySelector('.wiki-content')) {
          attachPreviewListeners();
        } else {
          // If not yet rendered, observe for changes
          const observer = new MutationObserver(() => {
            if (document.querySelector('.wiki-content')) {
              attachPreviewListeners();
              observer.disconnect();
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
        }
      });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
