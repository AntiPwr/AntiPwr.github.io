# DM Tools


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

- python "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/python/regen_wiki_html.py"
node "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/js/genWikiJson.js" "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/wiki" "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/json/wiki_pages.json"
node "C:/Users/broki/OneDrive/Desktop/Sea Level Website/AntiPwr.github.io/root/js/generate_wiki_content_index.js"


