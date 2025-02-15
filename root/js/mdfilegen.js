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
<!-- This file was auto-generated. 
     Add your content here. -->
`;

// Template for new .html content
// We replace the placeholders with the correct references
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
        // If no display name is provided, use fileName
        const displayName = rawDisplayName.trim() !== '' ? rawDisplayName.trim() : fileNameNoUnderscore;

        // Slug or sanitize to create an HTML-safe filename
        // e.g. "Sol Unita" => "Sol Unita"
        // If you need to remove spaces, do so:
        // const safeFileName = fileNameNoUnderscore.replace(/\s+/g, '-');
        const safeFileName = fileNameNoUnderscore; // leaving spaces if you prefer

        // Construct the .md and .html path
        const newMdPath = path.join(path.dirname(mdFilePath), `${safeFileName}.md`);
        const newHtmlPath = path.join(path.dirname(mdFilePath), `${safeFileName}.html`);

        // Create the .md if missing
        if (!fs.existsSync(newMdPath)) {
            fs.writeFileSync(newMdPath, DEFAULT_MD_CONTENT(safeFileName));
            console.log(`Created new MD file: ${newMdPath}`);
        }

        // Create the .html if missing
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
