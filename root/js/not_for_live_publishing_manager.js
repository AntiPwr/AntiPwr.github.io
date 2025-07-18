// not_for_live_publishing_manager.js
// Script to ensure <!-- not-for-live-publishing:start --> and <!-- not-for-live-publishing:end -->
// exist at the bottom of each .md wiki page, and to manage obsidian-pull sections.
// If obsidian-pull is present, it is replaced with new content from the Obsidian vault.
// If not present, it is created. The script is non-destructive to other not-for-live-publishing content.
//
// Usage: node not_for_live_publishing_manager.js
//
// Requires: Node.js, 'fs', 'path'

const fs = require('fs');
const path = require('path');

const WIKI_DIR = path.join(__dirname, '../wiki');
const OBSIDIAN_DIR = 'C:/Browser Downloads/Obsidian/Toma and the Scape/Toma and the Scape/Scape (TTRPG)';

const NOT_FOR_LIVE_START = '<!-- not-for-live-publishing:start -->';
const NOT_FOR_LIVE_END = '<!-- not-for-live-publishing:end -->';
const OBSIDIAN_PULL_START = '<!-- obsidian-pull:start -->';
const OBSIDIAN_PULL_END = '<!-- obsidian-pull:end -->';

function findObsidianFile(basename, dir = OBSIDIAN_DIR) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      const found = findObsidianFile(basename, path.join(dir, file.name));
      if (found) return found;
    } else if (file.isFile() && file.name === basename + '.md') {
      return path.join(dir, file.name);
    }
  }
  return null;
}

function getObsidianContent(basename) {
  const obsidianFile = findObsidianFile(basename);
  if (obsidianFile && fs.existsSync(obsidianFile)) {
    return fs.readFileSync(obsidianFile, 'utf8');
  }
  return '';
}

function updateWikiFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const basename = path.basename(filePath, '.md');
  let changed = false;

  // Check for not-for-live-publishing block
  let nflStart = content.indexOf(NOT_FOR_LIVE_START);
  let nflEnd = content.indexOf(NOT_FOR_LIVE_END);

  if (nflStart === -1 || nflEnd === -1) {
    // Add not-for-live-publishing block at the end
    content = content.trimEnd() + `\n\n${NOT_FOR_LIVE_START}\n${OBSIDIAN_PULL_START}\n${getObsidianContent(basename)}\n${OBSIDIAN_PULL_END}\n${NOT_FOR_LIVE_END}`;
    changed = true;
  } else {
    // Block exists, check for obsidian-pull
    let nflBlock = content.substring(nflStart, nflEnd + NOT_FOR_LIVE_END.length);
    let pullStart = nflBlock.indexOf(OBSIDIAN_PULL_START);
    let pullEnd = nflBlock.indexOf(OBSIDIAN_PULL_END);
    let newPull = `${OBSIDIAN_PULL_START}\n${getObsidianContent(basename)}\n${OBSIDIAN_PULL_END}`;
    if (pullStart !== -1 && pullEnd !== -1) {
      // Replace obsidian-pull section
      let before = nflBlock.substring(0, pullStart);
      let after = nflBlock.substring(pullEnd + OBSIDIAN_PULL_END.length);
      let newNflBlock = before + newPull + after;
      content = content.substring(0, nflStart) + newNflBlock + content.substring(nflEnd + NOT_FOR_LIVE_END.length);
      changed = true;
    } else {
      // Insert obsidian-pull section at the start of the block (after start marker)
      let insertAt = nflStart + NOT_FOR_LIVE_START.length;
      let newNflBlock = `\n${newPull}` + nflBlock.substring(NOT_FOR_LIVE_START.length);
      content = content.substring(0, nflStart + NOT_FOR_LIVE_START.length) + newNflBlock + content.substring(nflEnd + NOT_FOR_LIVE_END.length);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Main: process all .md files in wiki dir
fs.readdirSync(WIKI_DIR).forEach(file => {
  if (file.endsWith('.md')) {
    updateWikiFile(path.join(WIKI_DIR, file));
  }
});
