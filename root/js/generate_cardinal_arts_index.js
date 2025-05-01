const fs = require('fs');
const path = require('path');

const WIKI_DIR = path.join(__dirname, '..', 'wiki');
const OUTPUT_JSON = path.join(__dirname, '..', 'json', 'wiki_cardinal_arts_index.json');

// List of recognized Cardinal Arts (customize as needed)
const CARDINAL_ARTS = [
  'Natural Arts',
  'Soul Arts',
  'Social Arts',
  'Applied Arts'
];

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

function extractCardinalArts(mdContent) {
  // Look for a line like: **Cardinal Arts:** Natural Arts, Soul Arts
  const artsLine = mdContent.match(/\*\*Cardinal Arts:\*\*\s*([^\n]+)/i);
  if (artsLine) {
    // Split by comma and trim
    return artsLine[1]
      .split(',')
      .map(a => a.trim())
      .filter(a => CARDINAL_ARTS.includes(a));
  }
  // Optionally, scan for mentions in the text (less precise)
  return [];
}

function main() {
  const mdFiles = getAllMarkdownFiles(WIKI_DIR);
  const artsIndex = [];
  for (const mdPath of mdFiles) {
    const content = fs.readFileSync(mdPath, 'utf8');
    const arts = extractCardinalArts(content);
    artsIndex.push({
      file: path.basename(mdPath),
      cardinalArts: arts
    });
  }
  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(artsIndex, null, 2), 'utf8');
  console.log(`Wrote Cardinal Arts index for ${artsIndex.length} files to ${OUTPUT_JSON}`);
}

main();
