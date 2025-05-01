const fs = require('fs');
const path = require('path');

const WIKI_DIR = path.join(__dirname, '..', 'wiki');
const OUTPUT_JSON = path.join(__dirname, '..', 'json', 'wiki_taxonomy_index.json');
const TAXONS = ['Bin', 'Basin', 'Eco', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Essa'];

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

function extractTaxonomy(mdContent) {
    // Find taxonomy-table-section or <div class="taxonomy-table"> ... </div>
    let section = '';
    const tableSectionMatch = mdContent.match(/<!--\s*taxonomy-table-section:start\s*-->([\s\S]*?)<!--\s*taxonomy-table-section:end\s*-->/i);
    if (tableSectionMatch) {
        section = tableSectionMatch[1];
    } else {
        // fallback: try to find <div class="taxonomy-table"> ... </div>
        const divMatch = mdContent.match(/<div class="taxonomy-table">([\s\S]*?)<\/div>/i);
        if (divMatch) section = divMatch[1];
    }
    if (!section) return {};

    // For each taxon, try to extract its value from the table row
    const result = {};
    for (const taxon of TAXONS) {
        // Regex to match: <td ...>Bin:</td> <td ...>value</td>
        const re = new RegExp(`<td[^>]*>\\s*(?:<img[^>]*>)?${taxon}:?\\s*<\/td>\\s*<td[^>]*>([\\s\\S]*?)<\/td>`, 'i');
        const match = section.match(re);
        if (match) {
            // Remove HTML tags and trim
            let value = match[1]
                .replace(/<[^>]+>/g, '') // Remove HTML tags
                .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, file, disp) => disp || file) // Remove wiki links
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
                .replace(/&nbsp;/g, ' ')
                .trim();
            result[taxon] = value || null;
        } else {
            result[taxon] = null;
        }
    }
    return result;
}

function main() {
    const mdFiles = getAllMarkdownFiles(WIKI_DIR);
    const taxonomyIndex = [];
    for (const mdPath of mdFiles) {
        const content = fs.readFileSync(mdPath, 'utf8');
        const taxonomy = extractTaxonomy(content);
        taxonomy.file = path.basename(mdPath);
        taxonomyIndex.push(taxonomy);
    }
    fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(taxonomyIndex, null, 2), 'utf8');
    console.log(`Wrote taxonomy index for ${taxonomyIndex.length} files to ${OUTPUT_JSON}`);
}

main();
