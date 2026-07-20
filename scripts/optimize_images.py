#!/usr/bin/env python3
"""Create web and thumbnail WebP copies without modifying source artwork."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public" / "assets"
OUTPUT_DIR = ROOT / "public" / "images" / "web"
RASTER_SUFFIXES = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}
PROFILES = (
    ("detail", 2400, 85, ""),
    ("thumbnail", 900, 82, "-thumb"),
)


def resize(image: Image.Image, longest_side: int) -> Image.Image:
    width, height = image.size
    scale = min(1, longest_side / max(width, height))
    if scale == 1:
        return image.copy()
    size = (max(1, round(width * scale)), max(1, round(height * scale)))
    return image.resize(size, Image.Resampling.LANCZOS)


def optimize(source: Path) -> dict[str, object]:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        has_alpha = image.mode in {"RGBA", "LA"} or "transparency" in image.info
        image = image.convert("RGBA" if has_alpha else "RGB")
        icc_profile = opened.info.get("icc_profile")
        outputs = []

        for profile, longest_side, quality, suffix in PROFILES:
            optimized = resize(image, longest_side)
            destination = OUTPUT_DIR / f"{source.stem}{suffix}.webp"
            optimized.save(
                destination,
                "WEBP",
                quality=quality,
                method=6,
                exact=has_alpha,
                icc_profile=icc_profile,
            )
            outputs.append(
                {
                    "profile": profile,
                    "path": destination.relative_to(ROOT).as_posix(),
                    "bytes": destination.stat().st_size,
                    "width": optimized.width,
                    "height": optimized.height,
                }
            )

        return {
            "source": source.relative_to(ROOT).as_posix(),
            "sourceBytes": source.stat().st_size,
            "sourceWidth": image.width,
            "sourceHeight": image.height,
            "hasAlpha": has_alpha,
            "outputs": outputs,
        }


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    sources = sorted(
        path for path in SOURCE_DIR.iterdir()
        if path.is_file() and path.suffix.lower() in RASTER_SUFFIXES
    )
    report = [optimize(source) for source in sources]
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
