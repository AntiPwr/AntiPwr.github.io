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
    if title_match:
        title = title_match.group(1).strip()
        # If the title looks corrupted (e.g., starts with Q2 or is empty), use the filename
        if not title or re.match(r'^[Qq][0-9]', title) or title.lower() == 'template title':
            # Use the filename (without extension) as the base for the title
            base = os.path.splitext(os.path.basename(html_path))[0]
            title = f"{base} - Scape Wiki"
    else:
        base = os.path.splitext(os.path.basename(html_path))[0]
        title = f"{base} - Scape Wiki"
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
    # Robustly replace <title>...</title> (allow whitespace/newlines)
    title_re = re.compile(r'<title>.*?</title>', re.IGNORECASE | re.DOTALL)
    if title_re.search(html):
        html = title_re.sub(f'<title>{title}</title>', html)
    else:
        # If no <title> tag, insert after <head>
        html = re.sub(r'(<head[^>]*>)', rf'\1\n    <title>{title}</title>', html, count=1, flags=re.IGNORECASE)
    html = re.sub(r'(<meta name="description" content=")[^"]*(")', rf'\1{desc}\2', html)
    # Replace the data-md-file attribute value, or add it if missing
    # Use a stricter regex to match only the markdown-content div and its data-md-file attribute
    html = re.sub(
        r'(<div[^>]*id=["\']markdown-content["\'][^>]*?)\s+data-md-file=(["\'])(.*?)(["\'])',
        rf'\1 data-md-file="{md_file}"',
        html
    )
    # If data-md-file is missing, add it
    if f'data-md-file="{md_file}"' not in html:
        html = re.sub(r'(<div[^>]*id=["\']markdown-content["\'][^>]*)(>)', rf'\1 data-md-file="{md_file}"\2', html)
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
        title, desc, _ = extract_page_info(html_path)
        # Set md_file to match the HTML filename, but with .md extension (preserve spaces)
        md_file = os.path.splitext(fname)[0] + '.md'
        homepage_href = 'scape_wiki_homepage.html'
        new_html = apply_template(template_html, title, desc, md_file, homepage_href)
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"Regenerated: {fname}")

if __name__ == "__main__":
    main()


   
