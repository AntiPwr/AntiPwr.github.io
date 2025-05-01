import os
import re


WIKI_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'wiki'))
TEMPLATE_PATH = os.path.join(WIKI_DIR, 'template', 'HTML Template.html')
SKIP_FILES = {'HTML Template.html'}

def extract_page_info(html_path):
    """Extracts title, description, and md filename from an existing wiki HTML file."""
    with open(html_path, encoding='utf-8') as f:
        html = f.read()
    # Title
    title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
    title = title_match.group(1).strip() if title_match else 'Toma'
    # Description
    desc_match = re.search(r'<meta name="description" content="([^"]*)"', html)
    desc = desc_match.group(1).strip() if desc_match else ''
    # Markdown file (from data-md-file)
    md_match = re.search(r'data-md-file="([^"]+)"', html)
    md_file = md_match.group(1).strip() if md_match else ''
    return title, desc, md_file

def convert_obsidian_links(text):
    # [[File Name|Display Name]] or [[File Name]]
    def repl(match):
        file = match.group(1).strip().replace(' ', '%20') + '.html'
        display = match.group(3) if match.group(3) else match.group(1)
        return f'<a href="{file}">{display.strip()}</a>'
    return re.sub(r'\[\[([^\]|]+)(\|([^\]]+))?\]\]', repl, text)

def apply_template(template_html, title, desc, md_file, homepage_href):
    """Returns the template HTML with page-specific info inserted."""
    html = template_html
    html = re.sub(r'(<title>).*?(</title>)', rf'\1{title}\2', html)
    html = re.sub(r'(<meta name="description" content=")[^"]*(")', rf'\1{desc}\2', html)
    html = re.sub(r'(data-md-file=")[^"]*(")', rf'\1{md_file}\2', html)
    # Fix the Scape Wiki button link
    html = re.sub(
        r'(<a\s+href=")[^"]*(" class="title">Scape Wiki</a>)',
        rf'\1{homepage_href}\2',
        html
    )
    return html

def main():
    # Load template
    with open(TEMPLATE_PATH, encoding='utf-8') as f:
        template_html = f.read()

    # Process all .html files in wiki (not in template/)
    for fname in os.listdir(WIKI_DIR):
        if not fname.lower().endswith('.html') or fname in SKIP_FILES:
            continue
        html_path = os.path.join(WIKI_DIR, fname)
        title, desc, md_file = extract_page_info(html_path)
        # Always use the homepage link relative to wiki directory
        homepage_href = 'scape_wiki_homepage.html'
        new_html = apply_template(template_html, title, desc, md_file, homepage_href)
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"Regenerated: {fname}")

if __name__ == "__main__":
    main()


   
