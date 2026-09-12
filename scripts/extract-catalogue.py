"""Create local demo thumbnails from the supplied catalogue. Requires PyMuPDF and Pillow."""
from pathlib import Path
from collections import Counter, deque
import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / ".resources" / "Product_Catalog_v1_2026 (1)-compressed.pdf"
# One-based PDF page, normalized crop bounds. Crop only product imagery, not labels.
CROPS = {
    "products/tee": (6, .35, .25, .65, .46),
    "products/polo": (6, .66, .25, .94, .46),
    "products/hoodie": (6, .68, .49, .95, .72),
    "products/cap": (6, .37, .77, .64, .94),
    "products/tote": (5, .36, .25, .64, .45),
    "products/rope": (5, .35, .53, .65, .74),
    "products/eco": (5, .67, .50, .97, .74),
    "products/drawstring": (5, .04, .80, .31, .96),
    "products/laptop": (16, .03, .72, .34, .90),
    "products/pouch": (5, .35, .77, .68, .95),
    "products/travel": (14, .25, .27, .49, .405),
    "products/thermos": (14, .74, .26, .99, .405),
    "products/egg": (14, .51, .28, .74, .405),
    "products/vacuum": (14, .01, .49, .25, .61),
    "products/coffee": (14, .25, .50, .50, .61),
    "products/magic": (14, .75, .50, .99, .61),
    "products/clear": (14, .01, .71, .25, .835),
    "products/bamboo": (10, .69, .54, .89, .74),
    "products/cutlery": (10, .05, .78, .37, .96),
    "products/lunch": (10, .53, .79, .94, .96),
    "products/box": (19, .32, .59, .66, .84),
    "products/powerbank": (8, .04, .285, .33, .46),
    "products/charger": (8, .015, .75, .33, .97),
    "products/cable": (8, .72, .50, .94, .70),
    "products/mousepad": (15, .54, .73, .96, .875),
    "products/fan": (8, .06, .50, .24, .70),
    "products/lanyard": (19, .01, .17, .25, .44),
    "products/pin": (19, .04, .62, .31, .82),
    "products/notebook": (14, .76, .71, .99, .835),
    "products/pen": (14, .28, .70, .49, .835),
    "products/umbrella": (18, .40, .63, .66, .79),
    "products/golf": (18, .43, .18, .98, .445),
    "equipment/led": (4, .34, .37, .65, .52),
    "equipment/kiosk": (4, .75, .32, .88, .52),
    "equipment/photobooth": (4, .02, .60, .34, .75),
    "equipment/booth": (4, .38, .57, .58, .75),
    "equipment/counter": (4, .12, .35, .25, .52),
    "equipment/tech": (4, .07, .845, .32, .96),
    "equipment/registration": (4, .64, .63, .95, .75),
    "equipment/banner": (3, .36, .525, .63, .72),
}


def main():
    doc = fitz.open(SOURCE)
    for name, (page_no, x0, y0, x1, y1) in CROPS.items():
        page = doc[page_no - 1]
        w, h = page.rect.width, page.rect.height
        pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), clip=fitz.Rect(x0*w, y0*h, x1*w, y1*h), alpha=False)
        image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        # Catalogue uses a flat blue backdrop: remove its near-solid colour.
        samples = [pixel for pixel in image.resize((64, 64)).getdata()
                   if pixel[2] > pixel[0] * 1.5 and pixel[1] > pixel[0] * 1.4
                   and 45 < pixel[1] < 130 and 65 < pixel[2] < 165]
        background = Counter(samples).most_common(1)[0][0] if samples else (22, 86, 120)
        image = image.convert("RGBA")
        pixels = list(image.getdata())
        width, height = image.size
        eligible = [sum((c - bg) ** 2 for c, bg in zip(pixel[:3], background)) < 42 ** 2 for pixel in pixels]
        if name == "equipment/booth":
            # The booth's printed blue front is merchandise, not the blue page backdrop.
            for y in range(int(height * .1), height):
                for x in range(int(width * .12), int(width * .96)):
                    eligible[y * width + x] = False
        edges = set(range(width)) | set(range((height - 1) * width, height * width))
        edges.update(y * width for y in range(height))
        edges.update(y * width + width - 1 for y in range(height))
        queue = deque(i for i in edges if eligible[i])
        visited = set(queue)
        while queue:
            i = queue.popleft()
            pixels[i] = (*pixels[i][:3], 0)
            x, y = i % width, i // width
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                n = ny * width + nx
                if 0 <= nx < width and 0 <= ny < height and n not in visited and eligible[n]:
                    visited.add(n)
                    queue.append(n)
        if name.startswith("products/"):
            # Also clear the backdrop enclosed by bag handles and mug handles.
            pixels = [(*pixel[:3], 0) if eligible[i] else pixel for i, pixel in enumerate(pixels)]
        image.putdata(pixels)
        bounds = image.getbbox()
        if bounds:
            image = image.crop(bounds)
        image.thumbnail((460, 400), Image.Resampling.LANCZOS)
        target = ROOT / "web" / "public" / f"{name}.webp"
        target.parent.mkdir(parents=True, exist_ok=True)
        image.save(target, "WEBP", quality=88)
    print(f"Created {len(CROPS)} catalogue thumbnails")


if __name__ == "__main__":
    main()
