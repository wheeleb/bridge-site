# The Bridge

A small static website of photographs of a steel truss bridge over a rocky river in late autumn.

## What’s in this repo

- `index.html`, `css/styles.css`, and `js/lightbox.js` — the site, with no build step
- `images/full/` and `images/thumbs/` — resized, re-encoded photographs with EXIF/GPS stripped
- `scripts/optimize-images.py` — regenerates those images from files in `raw/` (not committed)

## View it locally

From this directory:

```bash
python3 -m http.server 8080
```

Then open http://127.0.0.1:8080/

## Refresh the photographs

Place the source JPEGs in `raw/` using the names in `scripts/optimize-images.py`, then run:

```bash
python3 scripts/optimize-images.py
```

That writes JPEG and WebP versions at a 2000-pixel maximum (quality 80) plus thumbnails, and strips metadata.
