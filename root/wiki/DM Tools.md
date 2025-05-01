# DM Tools


## Gitbash | NodeJS | generate_cardinal_arts_index.js
**Scans all .md files in the wiki directory, extracts Cardinal Arts data (e.g., Natural Arts, Soul Arts, Social Arts, Applied Arts) from each, and writes a JSON index for search/filtering.**
<br>
<br>

- node "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/js/generate_cardinal_arts_index.js"


> **Note:**  
> If you want to support Cardinal Arts search/filtering, ensure each page includes a `**Cardinal Arts:**` line listing the relevant arts.

## Gitbash | NodeJS | generate_taxonomy_index.js
**Scans all .md files in the wiki directory, extracts the taxonomy-table-section for each, and writes a JSON index of taxonomy data for every page.**
<br>
<br>

- node "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/js/generate_taxonomy_index.js"


> **Note:**  
> If you want to allow users to search/filter by the Cardinal Arts (e.g., Natural Arts, Soul Arts, Social Arts, Applied Arts), you should generate a similar index or extend the taxonomy index to include Cardinal Arts data for each page.

## Gitbash | NodeJS | mdfilegen.js
**Creates .md files based on Obsidian markdown links ([[]]) on the target .html page within the root/wiki folder.**
<br>
<br>

- node "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/js/mdfilegen.js" "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/wiki/.md"

## Gitbash | Python | md_compiler.py
**Combines all .md files from a source directory into one or more large Markdown files ("tomes"), each capped at 510 MB. Useful for archiving or exporting large Obsidian vaults.**
<br>
<br>

- python "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/python/md_compiler.py"

## Gitbash | NodeJS | genWikiJson.js
**Updates, by overwrite, wiki_pages.json, which works alongside server.js to populate the search bar with wikipedia content**
<br>
<br>


- node "C:\Users\broki\OneDrive\Desktop\Sea Level Website\AntiPwr.github.io\root\js\genWikiJson.js" "C:\Users\broki\OneDrive\Desktop\Sea Level Website\AntiPwr.github.io\root\wiki" "C:\Users\broki\OneDrive\Desktop\Sea Level Website\AntiPwr.github.io\root\json\wiki_pages.json"

## Gitbash | NodeJS | generate_wiki_content_index.js
<br>
<br>

- node "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/js/generate_wiki_content_index.js"

## Gitbash | Python | regen_wiki_html.py
**Regenerates all wiki HTML files in the root/wiki directory using a template, preserving each file's title, description, and associated markdown file. Useful for batch-updating HTML structure or metadata.**
<br>
<br>

- python "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/python/regen_wiki_html.py"

# Collections

## Wiki Update
**Run all major wiki update scripts in sequence.**

python "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/python/regen_wiki_html.py"
node "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/js/genWikiJson.js" "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/wiki" "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/json/wiki_pages.json"
node "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/js/generate_wiki_content_index.js"
node "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/js/generate_taxonomy_index.js"
node "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/js/generate_cardinal_arts_index.js"


