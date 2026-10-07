"""Audit every built HTML page, sitemap URL, and local link. Run after npm run build."""
import json
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://www.enablement.ch"


class Page(HTMLParser):
    def __init__(self, file):
        super().__init__(convert_charrefs=True)
        self.file = file
        relative = file.relative_to(ROOT / "dist").as_posix()
        self.path = "/" + relative.removesuffix("index.html").rstrip("/")
        self.title = ""
        self.h1 = []
        self.meta = {}
        self.canonical = []
        self.ids = set()
        self.links = []
        self.images = []
        self.schemas = []
        self.capture = None
        self.text = ""
        self.feed(file.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if tag in ("title", "h1") or (tag == "script" and attrs.get("type") == "application/ld+json"):
            self.capture = tag
            self.text = ""
        if tag == "meta":
            self.meta[attrs.get("name") or attrs.get("property")] = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical.append(attrs.get("href"))
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        if tag == "img":
            self.images.append(attrs)

    def handle_data(self, text):
        if self.capture:
            self.text += text

    def handle_endtag(self, tag):
        if tag != self.capture:
            return
        if tag == "title":
            self.title = self.text.strip()
        elif tag == "h1":
            self.h1.append(" ".join(self.text.split()))
        elif tag == "script":
            self.schemas.append(json.loads(self.text))
        self.capture = None


pages = {page.path: page for page in (Page(file) for file in sorted((ROOT / "dist").rglob("*.html")))}
namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
sitemap = set()
for file in (ROOT / "dist").glob("sitemap-*.xml"):
    for loc in ET.parse(file).findall("sm:url/sm:loc", namespace):
        sitemap.add(loc.text)

redirects = json.loads((ROOT / "vercel.json").read_text()).get("redirects", [])
redirect_sources = {item["source"] for item in redirects if ":" not in item["source"]}
issues = []
rows = []
indexed = [p for p in pages.values() if "noindex" not in p.meta.get("robots", "")]
title_counts = Counter(p.title for p in indexed)
description_counts = Counter(p.meta.get("description") for p in indexed)
for page in pages.values():
    indexable = page in indexed
    errors = []
    if indexable:
        if not page.title:
            errors.append("Missing title")
        elif title_counts[page.title] > 1:
            errors.append("Duplicate title")
        if not page.meta.get("description"):
            errors.append("Missing description")
        elif description_counts[page.meta["description"]] > 1:
            errors.append("Duplicate description")
        if len(page.h1) != 1:
            errors.append(f"Expected one primary heading, found {len(page.h1)}")
        if page.canonical != [SITE + page.path]:
            errors.append("Missing or inconsistent canonical")
        if SITE + page.path not in sitemap:
            errors.append("Indexable page missing from sitemap")
        for key in ("og:image", "twitter:image"):
            if not page.meta.get(key, "").startswith(SITE + "/"):
                errors.append(f"Missing absolute {key} URL")
        if not page.schemas:
            errors.append("Missing structured data")
    elif SITE + page.path in sitemap:
        errors.append("Noindex page included in sitemap")
    for image in page.images:
        if "alt" not in image:
            errors.append(f"Image missing alt attribute: {image.get('src')}")
        src = image.get("src", "")
        if src.startswith("/") and not (ROOT / "dist" / src.lstrip("/")).is_file():
            errors.append(f"Missing image: {src}")
    for href in page.links:
        url = urlsplit(href)
        if url.netloc and url.netloc not in ("www.enablement.ch", "enablement.ch"):
            continue
        if url.scheme and url.scheme not in ("http", "https"):
            continue
        if not url.path and not url.fragment:
            continue
        path = unquote(url.path).rstrip("/") or page.path
        if not path.startswith("/"):
            continue
        target = pages.get(path)
        if target is None and path not in redirect_sources and not (ROOT / "dist" / path.lstrip("/")).is_file():
            errors.append(f"Broken local link: {href}")
        elif target and url.fragment and unquote(url.fragment) not in target.ids:
            errors.append(f"Missing anchor: {href}")
    for error in sorted(set(errors)):
        issues.append({"path": page.path, "issue": error})
    rows.append({"path": page.path, "indexable": indexable, "title": page.title, "description": page.meta.get("description"), "h1Count": len(page.h1), "inSitemap": SITE + page.path in sitemap, "schemaCount": len(page.schemas)})
for url in sitemap:
    if urlsplit(url).path.rstrip("/") not in pages and urlsplit(url).path != "/":
        issues.append({"path": url, "issue": "Sitemap URL has no built page"})
print(json.dumps({"pageCount": len(pages), "indexableCount": len(indexed), "sitemapCount": len(sitemap), "issues": issues, "pages": rows}, indent=2))
sys.exit(bool(issues))
