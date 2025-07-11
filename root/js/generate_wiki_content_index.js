// Usage: node js/generate_wiki_content_index.js
// Requires: Node.js

const fs = require('fs');
const path = require('path');

const WIKI_MD_DIR = path.join(__dirname, '..', 'wiki');
const OUTPUT_JSON = path.join(__dirname, '..', 'json', 'wiki_content_index.json');

function getAllMarkdownFiles(dir) {
  let files = [];
  // Only include .md files directly in the wiki directory, not subfolders
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(path.join(dir, entry.name));
    }
    // Do not recurse into subdirectories
  }
  return files;
}

function extractInfoFromMarkdown(mdPath) {
  const content = fs.readFileSync(mdPath, 'utf8');
  const lines = content.split('\n');
  let title = '';
  let headings = [];

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

  // HTML file name
  const htmlFile = path.basename(mdPath, '.md') + '.html';

  return {
    file: htmlFile,
    title,
    headings
    // content/snippet removed
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
