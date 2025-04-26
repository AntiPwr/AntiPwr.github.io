#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * REGEX:
 * 1) \[\[ = literal [[
 * 2) ([^|\]]+) = capture fileName up to '|' or ']'
 * 3) \|? = optional '|'
 * 4) ([^\]]*) = optional displayName up to ']'
 * 5) \]\]
 */
const obsidianLinkRegex = /\[\[([^|\]]+)\|?([^\]]*)\]\]/g;

// Template for new .md content
const DEFAULT_MD_CONTENT = (fileName) =>
`# ${fileName}
_Add nicknames or alternative titles here_

<img src="wiki_images/${fileName}.png"><i></i></img>

> _"Add a quote about the subject here from within the fictional world"_  
> **—Quote Attribution**

> _"Add a quote from the real world that relates to the subject"_  
> **—Real World Attribution**

<div class="taxonomy-table">
  <table>
    <tr>
      <th colspan="3">Purpose Taxonomy</th>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../wiki_images/icons/bin_icon.png" class="taxon-icon">Bin:</td>
      <td class="taxon-content" colspan="2">[[Scape]]</td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../wiki_images/icons/basin_icon.png" class="taxon-icon">Basin:</td>
      <td class="taxon-content" colspan="2">[[Sacrus]]</td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../wiki_images/icons/eco_icon.png" class="taxon-icon">Eco:</td>
      <td class="taxon-content" colspan="2">[[Toma]] of [[Toman Ecoss]]</td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../wiki_images/icons/kingdom_icon.png" class="taxon-icon">Kingdom:</td>
      <td class="taxon-content" colspan="2"></td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../wiki_images/icons/phylum_icon.png" class="taxon-icon">Phylum:</td>
      <td class="taxon-content" colspan="2"></td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../wiki_images/icons/class_icon.png" class="taxon-icon">Class:</td>
      <td class="taxon-content" colspan="2"></td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../wiki_images/icons/order_icon.png" class="taxon-icon">Order:</td>
      <td class="taxon-content" colspan="2"></td>
    </tr>
  </table>
</div>

Write an introductory paragraph about ${fileName} here. Summarize what the subject is and its significance within the world.

## Main Section

Write detailed content about ${fileName} here, organized into appropriate sections.

<div class="feathermark">
    <p class="feathermark-attribution">Corvi's Feathermark</p>
    <p>Add Corvi's perspective or insights about this subject here. This could use the Wilder, Dark, or Amplified writing style as appropriate.</p>
    <p>Add additional paragraphs to develop Corvi's perspective as needed.</p>
</div>

## Additional Sections

Continue with more sections as needed.

## Images

<img src="wiki_images/${fileName}_detail.png"><i>Caption describing a detailed aspect of ${fileName}</i></img>

## Related Wiki Pages

- [[Related Page 1]]
- [[Related Page 2]]
- [[Related Page 3]]
`;

// Template for new .html content
const DEFAULT_HTML_TEMPLATE = (fileName, displayName) =>
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Toma</title>
    <link rel="stylesheet" href="../css/scape_wiki_base.css">
    <link rel="stylesheet" href="../css/scape_wiki_pages.css">
    <link rel="stylesheet" href="https://use.typekit.net/hpo3tdq.css">
    <link rel="stylesheet" href="https://use.typekit.net/hpo3tdq.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Optional: Add a description meta tag for professionalism -->
    <meta name="description" content="Wiki page for ${displayName}."> <!--TEMPLATE EDIT 1 HERE-->
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="left-nav">
                <!-- The same button used to open/close sidebar -->
                <button class="open-btn" id="open-btn">&#9776;</button>
                <a href="../scape_wiki_homepage.html" class="title">Scape Wiki</a>
            </div>
            <ul class="nav-links">
                <li><a href="../../index.html">Sea Level</a></li>
                <li><a href="../scape_about.html">About</a></li>
            </ul>
            <div class="nav-search">
                <input type="text" placeholder="Search..." aria-label="Search Scape Wiki">
            </div>
        </div>
    </nav>

    <aside class="sidebar" id="sidebar">
        <ul class="sidebar-links">
            <li><a href="#${displayName}">${displayName}</a></li> <!--TEMPLATE EDIT 2 HERE-->
            <!-- automatically determined by mdparse.js if you have auto-TOC logic -->
        </ul>
    </aside>

    <main class="content">
        <!-- Insert a container for the Markdown content -->
        <div id="markdown-content" class="wiki-content" data-md-file="${fileName}.md"></div> <!--TEMPLATE EDIT 3 HERE-->
    </main>

    <footer class="footer">
        <p>&copy; 2024 Sea Level. All rights reserved.</p>
    </footer>

    <!-- Include Showdown.js for markdown parsing -->
    <script src="https://cdn.jsdelivr.net/npm/showdown/dist/showdown.min.js"></script>
    <!-- Include Fuse.js for fuzzy search -->
    <script src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js"></script>
    <!-- Include your mdparse.js which fetches markdown and inserts into #markdown-content -->
    <script src="../js/mdparse.js"></script>
    <!-- Include sidebar.js or similar logic to toggle sidebar with #open-btn -->
    <script src="../js/sidebar.js"></script>

    <script src="../js/search.js"></script>
</body>
</html>`;

// Main function to parse an .md file and create missing references
function processMarkdownFile(mdFilePath) {
    const mdContent = fs.readFileSync(mdFilePath, 'utf8');

    let match;
    while ((match = obsidianLinkRegex.exec(mdContent)) !== null) {
        const [fullMatch, rawFileName, rawDisplayName] = match;
        // e.g. [[ _Sol Unita|Sol Unita ]]
        // rawFileName = "_Sol Unita"
        // rawDisplayName = "Sol Unita"

        // Clean leading underscores or do other transformations:
        const fileNameNoUnderscore = rawFileName.replace(/^_/, '').trim();
        const displayName = rawDisplayName.trim() !== '' ? rawDisplayName.trim() : fileNameNoUnderscore;
        const safeFileName = fileNameNoUnderscore;

        const newMdPath = path.join(path.dirname(mdFilePath), `${safeFileName}.md`);
        const newHtmlPath = path.join(path.dirname(mdFilePath), `${safeFileName}.html`);

        if (!fs.existsSync(newMdPath)) {
            fs.writeFileSync(newMdPath, DEFAULT_MD_CONTENT(safeFileName));
            console.log(`Created new MD file: ${newMdPath}`);
        }

        if (!fs.existsSync(newHtmlPath)) {
            const templateContent = DEFAULT_HTML_TEMPLATE(safeFileName, displayName);
            fs.writeFileSync(newHtmlPath, templateContent);
            console.log(`Created new HTML file: ${newHtmlPath}`);
        }
    }
}

// Usage example: node mdfilegen.js path/to/Whispers\ of\ the\ Well\ Information.md
if (process.argv.length < 3) {
    console.error('Usage: node mdfilegen.js <path to .md file>');
    process.exit(1);
}

const inputMdPath = process.argv[2];
processMarkdownFile(inputMdPath);
