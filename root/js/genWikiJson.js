#!/usr/bin/env node

/**
 * genWikiJson.js
 * Node.js script to scan a given folder for *.html files
 * and write the filenames into wiki_pages.json as an array of strings.
 */

const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
  console.error('Usage: node genWikiJson.js <wikiFolderPath> <outputJsonPath>');
  process.exit(1);
}

const wikiFolderPath = process.argv[2];
const outputJsonPath = process.argv[3];

function generateWikiPagesJson(srcFolder, outFile) {
  const entries = fs.readdirSync(srcFolder, { withFileTypes: true });

  const htmlFiles = entries
    .filter(dirent => dirent.isFile() && dirent.name.toLowerCase().endsWith('.html'))
    .map(dirent => dirent.name);

  fs.writeFileSync(outFile, JSON.stringify(htmlFiles, null, 2), 'utf8');
  console.log(`Successfully wrote ${htmlFiles.length} HTML filenames to ${outFile}.`);
  console.log(htmlFiles);
}

try {
  generateWikiPagesJson(wikiFolderPath, outputJsonPath);
} catch (error) {
  console.error('Error generating wiki_pages.json:', error);
  process.exit(1);
}

console.log('Scanning folder:', wikiFolderPath);
console.log('Outputting JSON to:', outputJsonPath);
