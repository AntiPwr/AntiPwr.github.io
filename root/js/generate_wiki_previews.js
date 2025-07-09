const fs = require('fs');
const path = require('path');

const wikiDir = path.join(__dirname, '../wiki');
const outputFile = path.join(__dirname, '../json/wiki_page_previews.json');

function extractHeaderSection(content) {
  const start = content.indexOf('<!-- wiki-header-section:start -->');
  const end = content.indexOf('<!-- wiki-header-section:end -->');
  if (start === -1 || end === -1) return null;
  return content.slice(start, end);
}

function extractFirstImage(header) {
  // Find the first <img ...> tag anywhere in the header
  const imgMatch = header.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (!imgMatch) return null;
  let src = imgMatch[1];
  // Normalize: if path starts with 'wiki_images/', check if file exists in wiki/wiki_images/
  if (src.startsWith('wiki_images/')) {
    const wikiImagesPath = path.join(__dirname, '../wiki/wiki_images', path.basename(src));
    if (fs.existsSync(wikiImagesPath)) {
      src = 'wiki/wiki_images/' + path.basename(src);
    }
  }
  return src;
}

function extractIntroParagraph(header) {
  // Improved: Skip headings, images, blockquotes (multi-line), captions, and nickname/alternative title lines
  const lines = header.split('\n');
  let afterHeading = false;
  let inBlockquote = false;
  let foundImg = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    // Skip heading line(s)
    if (!afterHeading) {
      if (line.startsWith('#')) {
        afterHeading = true;
      }
      continue;
    }
    // Skip nickname/alt title lines (entire line italicized, e.g. _Nickname_)
    if (/^_[^_]+_$/.test(line)) continue;
    // Skip images
    if (/^<img\b/i.test(line)) { foundImg = true; continue; }
    // Handle blockquotes (multi-line)
    if (line.startsWith('>')) { inBlockquote = true; continue; }
    if (inBlockquote && !line) { inBlockquote = false; continue; }
    if (inBlockquote) continue;
    // Skip empty, comments, tables, divs, or lines that are just formatting
    if (!line || line.startsWith('<!--') || line.startsWith('|') || line.startsWith('<div') || line.startsWith('</div')) continue;
    // Skip lines that are likely image captions (italic, after image), but only if the line is just formatting (no real text)
    if (foundImg && ((/^\*+$/.test(line) || /^_+$/.test(line)))) continue;
    // Skip lines that are just bold/italic formatting (no real text)
    if ((/^\*+$/.test(line) || /^_+$/.test(line))) continue;
    // If the line contains real text (not just formatting), use it
    // Remove markdown formatting for preview
    const cleaned = line.replace(/[*_#`[\]]/g, '').replace(/!\[.*?\]\(.*?\)/g, '').trim();
    if (cleaned.length > 0) return cleaned;
  }
  return '';
}

function getPageName(filename) {
  return filename.replace(/\.md$/, '');
}

const previews = {};

fs.readdirSync(wikiDir).forEach(file => {
  if (file.endsWith('.md')) {
    const filePath = path.join(wikiDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const header = extractHeaderSection(content);
    if (header) {
      const image = extractFirstImage(header);
      const intro = extractIntroParagraph(header);
      previews[getPageName(file)] = { image, intro };
    }
  }
});

fs.writeFileSync(outputFile, JSON.stringify(previews, null, 2), 'utf8');
console.log('Wiki page previews generated:', outputFile);
