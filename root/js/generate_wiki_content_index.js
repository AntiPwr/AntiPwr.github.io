// Usage: node js/generate_wiki_content_index.js
// Requires: Node.js

const fs = require('fs');
const path = require('path');

const WIKI_MD_DIR = path.join(__dirname, '..', 'wiki');
const OUTPUT_JSON = path.join(__dirname, '..', 'json', 'wiki_content_index.json');

function getAllMarkdownFiles(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      files = files.concat(getAllMarkdownFiles(path.join(dir, entry.name)));
    } else if (entry.name.endsWith('.md')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function extractInfoFromMarkdown(mdPath) {
  const content = fs.readFileSync(mdPath, 'utf8');
  const lines = content.split('\n');
  let title = '';
  let headings = [];
  let snippet = '';

  // Title: first H1 or filename
  for (const line of lines) {
    const h1 = line.match(/^# (.+)/);
    if (h1) {
      title = h1[1].trim();
      break;
    }
  }
  if (!title) {
    title = path.basename(mdPath, '.md');
  }

  // Headings: all H1/H2/H3/H4
  for (const line of lines) {
    const h = line.match(/^(#{1,4}) (.+)/);
    if (h) {
      headings.push(h[2].trim());
    }
  }

  // Snippet: first 500 chars of non-heading lines
  snippet = lines
    .filter(l => !l.match(/^#{1,6} /) && l.trim() !== '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .slice(0, 500);

  // HTML file name
  const htmlFile = path.basename(mdPath, '.md') + '.html';

  return {
    file: htmlFile,
    title,
    headings,
    content: snippet
  };
}

function convertObsidianLinks(text) {
  // Replace [[File Name|Display Name]] and [[File Name]]
  return text.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (match, file, _, display) => {
    const fileName = file.trim().replace(/\s+/g, '%20') + '.html';
    const linkText = display ? display.trim() : file.trim();
    return `<a href="${fileName}">${linkText}</a>`;
  });
}

function main() {
  const mdFiles = getAllMarkdownFiles(WIKI_MD_DIR);
  const index = mdFiles.map(extractInfoFromMarkdown);
  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(index, null, 2), 'utf8');
  console.log(`Wrote ${index.length} entries to ${OUTPUT_JSON}`);
}

main();
