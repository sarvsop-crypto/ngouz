import os, glob

pages_dir = r"C:\Users\user\Desktop\ngo"
old = '<a href="vacancies.html">Vakansiyalar</a>'
new = '<a href="vacancies.html">Vakansiyalar</a>\n<a href="talim-rivojlanish.html">Ta\'lim va rivojlanish</a>\n<a href="stajirovka-volontyorlik.html">Stajirovka va volontyorlik</a>'

files = glob.glob(os.path.join(pages_dir, "*.html"))
updated = 0
for fpath in files:
    with open(fpath, encoding="utf-8", errors="replace") as f:
        content = f.read()
    if old in content:
        content = content.replace(old, new)
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        updated += 1

print(f"Updated {updated} files")
