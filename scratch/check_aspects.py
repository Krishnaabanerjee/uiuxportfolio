import os
from PIL import Image

folder = r"c:\Users\baner\Downloads\Antigravity\assets\Photography"
files = sorted([f for f in os.listdir(folder) if f.startswith("Frame") and f.endswith(".jpg")])

for f in files:
    path = os.path.join(folder, f)
    with Image.open(path) as img:
        w, h = img.size
        ratio = w / h
        print(f"{f}: {w}x{h} (ratio: {ratio:.3f})")
