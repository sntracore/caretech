from pathlib import Path
from PIL import Image, ImageChops, ImageOps
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "dist" / "assets"
OUT.mkdir(parents=True, exist_ok=True)

pdf = next((ROOT / "complogo").glob("*.pdf"))
with tempfile.TemporaryDirectory() as temp:
    stem = str(Path(temp) / "caretech")
    subprocess.run(["pdftoppm", "-png", "-r", "220", "-singlefile", str(pdf), stem], check=True)
    logo = Image.open(stem + ".png").convert("RGBA")
    rgb = Image.new("RGB", logo.size, "white")
    rgb.paste(logo, mask=logo.getchannel("A"))
    mask = rgb.convert("L").point(lambda value: 255 if value < 244 else 0)
    box = mask.getbbox()
    logo = logo.crop((box[0]-12, box[1]-12, box[2]+12, box[3]+12))
    pixels = logo.load()
    for y in range(logo.height):
        for x in range(logo.width):
            red, green, blue, _ = pixels[x, y]
            opacity = 255 - min(255, max(red, green, blue))
            pixels[x, y] = (12, 23, 37, opacity)
    logo.save(OUT / "caretech-logo.png", optimize=True)
    white = logo.copy()
    white.putdata([(255, 255, 255, a) for _, _, _, a in white.getdata()])
    white.save(OUT / "caretech-logo-white.png", optimize=True)

brands = {
    "Molex": "Molex-Logo.svg.png",
    "Coreprix": "logo-DgChHm5W.png",
    "Honeywell": "Honeywell_logo.svg.png",
    "Ubiquiti": "Ubiquiti_Logo.png",
    "D-Link": "D-Link-Logo.wine.png",
    "Rittal": "rittal-logo-6ACACE401C-seeklogo.com.png",
    "EVteQ": "1-evteq_new logo_17.png",
    "eSSL": "esslogo (1).png",
    "Cisco": "Cisco-logo.png",
    "Hi-Focus": "logo.png",
    "TP-Link": "TP-Link-Logo.wine.png",
    "Cambium Networks": "Cambium_logo_side_stacked_blue_black.png",
    "Hikvision": "fd96eed9ad27db59612b330f6814a3f7.png",
    "CP Plus": "4-4.jpg.jpeg",
    "APC": "APC_by_Schneider_Electric-Logo.wine.png",
    "Dahua": "Dahua_Technology_logo.svg.png",
}
customers = {
    "Transvolt": "Transvolt-Logo-PngOnly-Black-new.png",
    "Catch Foundation": "305fba5b-567f-472a-84d0-dd60497bdffb.png",
    "AA Hospitality Services": "1001525069.jpg.jpeg",
    "Sagar Cement": "FB_IMG_1791729309059.jpg.jpeg",
    "VC Tech": "VC-Tech-logo.png",
}
def logo_card(source, destination, dark=False):
    image = Image.open(source).convert("RGBA")
    bg_color = "#112b45" if dark else "white"
    base = Image.new("RGBA", image.size, bg_color)
    base.alpha_composite(image)
    image = base.convert("RGB")
    if not dark:
        diff = ImageChops.difference(image, Image.new("RGB", image.size, "white")).convert("L")
        box = diff.point(lambda v: 255 if v > 22 else 0).getbbox()
        if box: image = image.crop(box)
    image.thumbnail((430, 140), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (480, 190), bg_color)
    canvas.paste(image, ((480-image.width)//2, (190-image.height)//2))
    canvas.save(destination, "WEBP", quality=88, method=6)

for name, filename in brands.items():
    slug = name.lower().replace(" ", "-")
    logo_card(ROOT / "seelingbrandsbyowner" / filename, OUT / f"brand-{slug}.webp", dark=name=="Hi-Focus")
for name, filename in customers.items():
    slug = name.lower().replace(" ", "-")
    logo_card(ROOT / "costumerimges" / filename, OUT / f"customer-{slug}.webp")

projects = [
    "IMG_20251111_171018.jpg.jpeg",
    "IMG_20251111_171035.jpg.jpeg",
    "IMG_20251229_142553.jpg.jpeg",
    "IMG_20260104_170110.jpg.jpeg",
    "IMG_20260121_144317.jpg.jpeg",
    "IMG_20260331_161421.jpg.jpeg",
]
for index, filename in enumerate(projects, 1):
    image = ImageOps.exif_transpose(Image.open(ROOT / "seelingbrandsbyowner" / filename)).convert("RGB")
    image = ImageOps.fit(image, (1200, 800), Image.Resampling.LANCZOS)
    image.save(OUT / f"project-{index:02}.webp", "WEBP", quality=78, method=6)

print("Prepared Caretech logo, 16 brand logos, 5 customer logos, and 6 project photos.")
