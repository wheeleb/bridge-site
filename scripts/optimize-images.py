#!/usr/bin/env python3
"""Resize and re-encode photographs, stripping EXIF/GPS metadata."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw"
FULL_DIR = ROOT / "images" / "full"
THUMB_DIR = ROOT / "images" / "thumbs"

# Descriptive names for the six source photographs.
SOURCES = [
    "hero-from-riverbank.jpg",
    "sun-flare-and-rapids.jpg",
    "among-evergreens.jpg",
    "through-the-pines.jpg",
    "river-ledges.jpg",
    "path-to-the-river.jpg",
]

FULL_MAX = 2000
THUMB_MAX = 900
JPEG_QUALITY = 80
WEBP_QUALITY = 80


def has_exif(path: Path) -> bool:
    with Image.open(path) as im:
        return bool(im.getexif()) or bool(im.info.get("exif"))


def fit(im: Image.Image, max_edge: int) -> Image.Image:
    w, h = im.size
    longest = max(w, h)
    if longest <= max_edge:
        return im
    scale = max_edge / longest
    size = (max(1, round(w * scale)), max(1, round(h * scale)))
    return im.resize(size, Image.Resampling.LANCZOS)


def save_pair(im: Image.Image, dest_stem: Path) -> None:
    dest_stem.parent.mkdir(parents=True, exist_ok=True)
    jpeg_path = dest_stem.with_suffix(".jpg")
    webp_path = dest_stem.with_suffix(".webp")
    # Do not pass exif= or info= — a re-encode with a new Image is enough to drop GPS/EXIF.
    rgb = im.convert("RGB")
    rgb.save(
        jpeg_path,
        format="JPEG",
        quality=JPEG_QUALITY,
        optimize=True,
        progressive=True,
        icc_profile=None,
    )
    rgb.save(
        webp_path,
        format="WEBP",
        quality=WEBP_QUALITY,
        method=6,
    )
    for path in (jpeg_path, webp_path):
        if has_exif(path):
            raise SystemExit(f"EXIF still present after encode: {path}")


def process(name: str) -> None:
    src = RAW / name
    if not src.exists():
        print(f"missing: {src}", file=sys.stderr)
        return
    with Image.open(src) as im:
        im.load()
        # Apply orientation before dropping EXIF, so portrait shots stay upright.
        im = ImageOps.exif_transpose(im) or im
        base = Path(name).stem
        full = fit(im, FULL_MAX)
        save_pair(full, FULL_DIR / base)
        thumb = fit(im, THUMB_MAX)
        save_pair(thumb, THUMB_DIR / base)
        print(
            f"{name}: {im.size[0]}x{im.size[1]} -> "
            f"full {full.size[0]}x{full.size[1]}, "
            f"thumb {thumb.size[0]}x{thumb.size[1]}"
        )


def main() -> int:
    missing = 0
    for name in SOURCES:
        before = list((FULL_DIR).glob(Path(name).stem + ".*"))
        process(name)
        if not (RAW / name).exists():
            missing += 1
    if missing:
        print(f"{missing} of {len(SOURCES)} source files were missing.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
