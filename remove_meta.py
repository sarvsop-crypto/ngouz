import os, glob, re

pages_dir = r"C:\Users\user\Desktop\ngo"
files = glob.glob(os.path.join(pages_dir, "*.html"))

# Remove the entire gov-article-meta div block (with optional style attr)
pattern = re.compile(
    r'\s*<div class="gov-article-meta"[^>]*>.*?</div>\s*',
    re.DOTALL
)

updated = 0
for fpath in files:
    with open(fpath, encoding="utf-8", errors="replace") as f:
        content = f.read()
    new_content = pattern.sub('\n', content)
    if new_content != content:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_content)
        updated += 1

print(f"Updated {updated} files")
