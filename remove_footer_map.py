import os, glob, re

pages_dir = r"C:\Users\user\Desktop\ngo"
files = glob.glob(os.path.join(pages_dir, "*.html"))

# Remove the footer-map-wrap div and its contents
pattern = re.compile(
    r'\s*<div class="footer-map-wrap">.*?</div>\s*',
    re.DOTALL
)

# Also remove the footer-left wrapper divs (unwrap footer-left)
updated = 0
for fpath in files:
    with open(fpath, encoding="utf-8", errors="replace") as f:
        content = f.read()

    new_content = pattern.sub('\n', content)

    # Unwrap footer-left: remove opening and closing tags
    new_content = new_content.replace('<div class="footer-left">\n', '')
    new_content = new_content.replace('<div class="footer-left">', '')
    # Remove the closing </div> that was for footer-left
    # It appears just before </div> that closes footer-inner
    new_content = re.sub(r'(</div>\s*)</div>\s*</div>\s*</footer>',
                         r'\1</div>\n</footer>', new_content)

    if new_content != content:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_content)
        updated += 1

print(f"Updated {updated} files")
