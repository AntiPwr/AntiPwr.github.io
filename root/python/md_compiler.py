import os

# 1) Define the directory containing your .md files.
#    Use a raw string (r" ... ") if you have backslashes in Windows paths.
MARKDOWN_DIRECTORY = r"C:\Browser Downloads\Obsidian\Toma and the Scape"

# 2) Define where you want your compiled "tomes" to be saved.
#    Adjust this to wherever you want to store the merged MD files.
OUTPUT_DIRECTORY = r"C:\Browser Downloads\Obsidian Export"

# 3) Define the maximum size in bytes (510 MB).
MAX_SIZE_BYTES = 510 * 1024 * 1024  # 510 MB → 534,773,760 bytes

def combine_markdown_files():
    """
    Combines all .md files in MARKDOWN_DIRECTORY into multiple large Markdown
    files, each capped at MAX_SIZE_BYTES in size. The final files are saved
    into OUTPUT_DIRECTORY.
    """
    
    # Ensure the output directory exists
    os.makedirs(OUTPUT_DIRECTORY, exist_ok=True)
    
    # Gather all .md files in the source directory
    md_files = [f for f in os.listdir(MARKDOWN_DIRECTORY) if f.lower().endswith(".md")]
    
    # (Optional) Sort by file name or last modified time
    # Example: Sort by filename alphabetically
    md_files.sort()
    
    current_tome_index = 1       # Which combined file we’re on
    current_tome_content = []    # Accumulated lines (strings) of the current tome
    current_tome_size = 0        # Size in bytes of the current tome
    
    # Helper function to write out the current tome
    def save_tome():
        nonlocal current_tome_content, current_tome_size, current_tome_index
        
        # Name your tome; you can use zero-padding to make them look neat, e.g., 001, 002...
        tome_filename = os.path.join(OUTPUT_DIRECTORY, f"compiled_tome_{current_tome_index}.md")
        
        # Write the compiled content to a single file
        with open(tome_filename, "w", encoding="utf-8") as tome_file:
            tome_file.write("\n".join(current_tome_content))
        
        # Move on to the next tome
        current_tome_index += 1
        current_tome_content.clear()
        current_tome_size = 0

    # Iterate over each markdown file
    for md_filename in md_files:
        file_path = os.path.join(MARKDOWN_DIRECTORY, md_filename)
        
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Optional: Add a header to mark which file is being appended
        # so you know the source file inside the compiled tome.
        # You might prefer not to do this if you only want the raw contents.
        text_to_add = f"\n\n# Source: {md_filename}\n\n{content}"
        
        # Calculate the size (in bytes) of the text chunk you’re about to add
        content_size = len(text_to_add.encode("utf-8"))
        
        # Check if adding the next file would exceed the 510 MB limit
        if current_tome_size + content_size > MAX_SIZE_BYTES:
            # Save current tome and start a new one
            save_tome()
        
        # Append this file’s content to the current tome
        current_tome_content.append(text_to_add)
        current_tome_size += content_size

    # If there’s any leftover content in the last tome, write it out
    if current_tome_content:
        save_tome()

if __name__ == "__main__":
    combine_markdown_files()
