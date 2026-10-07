"""Build brand assets (favicon, icon mark, full logo) from source PNGs.

Usage: py execution/build_brand_assets.py <full_logo.png> <icon.png>
Outputs into frontend/public/brand and frontend/app (favicon.ico, icon.png, apple-icon.png).
"""
import sys
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "frontend" / "public" / "brand"
APP = ROOT / "frontend" / "app"


def white_to_alpha(img: Image.Image, threshold: int = 238) -> Image.Image:
    """Make near-white pixels transparent with a soft edge."""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            m = min(r, g, b)
            if m >= threshold:
                px[x, y] = (r, g, b, 0)
            elif m > 200:
                px[x, y] = (r, g, b, int(a * (threshold - m) / (threshold - 200)))
    return img


def trim(img: Image.Image, pad: int = 8) -> Image.Image:
    bbox = img.getchannel("A").getbbox()
    img = img.crop(bbox)
    out = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    out.paste(img, (pad, pad))
    return out


def square(img: Image.Image) -> Image.Image:
    s = max(img.size)
    out = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    out.paste(img, ((s - img.width) // 2, (s - img.height) // 2))
    return out


def main(full_path: str, icon_path: str) -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    icon = square(trim(white_to_alpha(Image.open(icon_path))))
    icon.resize((512, 512), Image.LANCZOS).save(PUBLIC / "logo-mark.png")
    icon.resize((512, 512), Image.LANCZOS).save(APP / "icon.png")
    # Apple icon needs opaque background
    apple = Image.new("RGBA", (180, 180), (255, 255, 255, 255))
    small = icon.resize((156, 156), Image.LANCZOS)
    apple.alpha_composite(small, (12, 12))
    apple.convert("RGB").save(APP / "apple-icon.png")
    icon.save(APP / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    # Full logo: keep a clean white card version (dark navy text needs light bg)
    full = trim(white_to_alpha(Image.open(full_path)), pad=24)
    full.save(PUBLIC / "logo-full.png")
    print("Assets written:", PUBLIC, APP)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
