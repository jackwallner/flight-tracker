#!/usr/bin/env python3
"""
Create custom 8x8 pixel airplane icons for AWTRIX
Generates GIF files that can be uploaded to AWTRIX via web interface
"""
from PIL import Image
import os

OUTPUT_DIR = "awtrix_icons"

def create_airplane_icon():
    """Create a simple airplane icon (8x8)"""
    img = Image.new('RGB', (8, 8), color='black')
    pixels = img.load()

    # Airplane shape (side view)
    # Format: (x, y, RGB color)
    airplane = [
        # Fuselage (white/light gray)
        (3, 3, (200, 200, 200)),
        (4, 3, (220, 220, 220)),
        (5, 3, (200, 200, 200)),
        (6, 3, (180, 180, 180)),

        # Wings (lighter blue)
        (2, 3, (100, 150, 255)),
        (3, 2, (100, 150, 255)),
        (4, 2, (120, 170, 255)),
        (5, 2, (100, 150, 255)),
        (6, 2, (80, 130, 255)),
        (5, 4, (100, 150, 255)),
        (6, 4, (80, 130, 255)),

        # Tail
        (6, 1, (100, 150, 255)),
        (7, 2, (80, 130, 255)),

        # Nose
        (2, 3, (180, 180, 180)),
        (1, 3, (150, 150, 150)),
    ]

    for x, y, color in airplane:
        if 0 <= x < 8 and 0 <= y < 8:
            pixels[x, y] = color

    return img

def create_globe_icon():
    """Create a simple globe icon (8x8)"""
    img = Image.new('RGB', (8, 8), color='black')
    pixels = img.load()

    # Globe (circle with lines)
    globe = [
        # Outer circle (blue)
        (2, 1, (50, 150, 255)), (3, 1, (50, 150, 255)), (4, 1, (50, 150, 255)), (5, 1, (50, 150, 255)),
        (1, 2, (50, 150, 255)), (6, 2, (50, 150, 255)),
        (1, 3, (50, 150, 255)), (6, 3, (50, 150, 255)),
        (1, 4, (50, 150, 255)), (6, 4, (50, 150, 255)),
        (1, 5, (50, 150, 255)), (6, 5, (50, 150, 255)),
        (2, 6, (50, 150, 255)), (3, 6, (50, 150, 255)), (4, 6, (50, 150, 255)), (5, 6, (50, 150, 255)),

        # Center details (lighter blue)
        (3, 2, (100, 180, 255)), (4, 2, (100, 180, 255)),
        (2, 3, (100, 180, 255)), (3, 3, (150, 200, 255)), (4, 3, (150, 200, 255)), (5, 3, (100, 180, 255)),
        (2, 4, (100, 180, 255)), (3, 4, (150, 200, 255)), (4, 4, (150, 200, 255)), (5, 4, (100, 180, 255)),
        (3, 5, (100, 180, 255)), (4, 5, (100, 180, 255)),
    ]

    for x, y, color in globe:
        if 0 <= x < 8 and 0 <= y < 8:
            pixels[x, y] = color

    return img

def create_radar_icon():
    """Create a simple radar/signal icon (8x8)"""
    img = Image.new('RGB', (8, 8), color='black')
    pixels = img.load()

    # Radar waves
    radar = [
        # Center dot (bright green)
        (3, 4, (100, 255, 100)), (4, 4, (100, 255, 100)),
        (3, 3, (100, 255, 100)), (4, 3, (100, 255, 100)),

        # Inner wave (green)
        (2, 2, (50, 200, 50)), (5, 2, (50, 200, 50)),
        (2, 5, (50, 200, 50)), (5, 5, (50, 200, 50)),
        (2, 3, (50, 200, 50)), (5, 3, (50, 200, 50)),
        (2, 4, (50, 200, 50)), (5, 4, (50, 200, 50)),

        # Outer wave (dim green)
        (1, 1, (30, 150, 30)), (6, 1, (30, 150, 30)),
        (1, 6, (30, 150, 30)), (6, 6, (30, 150, 30)),
        (1, 2, (30, 150, 30)), (6, 2, (30, 150, 30)),
        (1, 5, (30, 150, 30)), (6, 5, (30, 150, 30)),
    ]

    for x, y, color in radar:
        if 0 <= x < 8 and 0 <= y < 8:
            pixels[x, y] = color

    return img

def main():
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Creating custom AWTRIX icons in {OUTPUT_DIR}/")
    print("="*60)

    # Create icons
    icons = {
        "airplane": create_airplane_icon(),
        "globe": create_globe_icon(),
        "radar": create_radar_icon(),
    }

    # Save as GIF (AWTRIX supports 8-bit GIF)
    for name, img in icons.items():
        # Convert to palette mode (8-bit)
        img_palette = img.convert('P', palette=Image.ADAPTIVE, colors=256)
        filepath = f"{OUTPUT_DIR}/{name}.gif"
        img_palette.save(filepath, 'GIF')
        print(f"✓ Created: {filepath}")

    print("\n" + "="*60)
    print("Upload instructions:")
    print("1. Open http://192.168.5.56 in your browser")
    print("2. Go to File Manager")
    print("3. Navigate to ICONS folder")
    print(f"4. Upload all .gif files from {OUTPUT_DIR}/")
    print("\nThen update your script to use these icon names:")
    print('  icon="airplane"')
    print('  icon="globe"')
    print('  icon="radar"')
    print("="*60)

if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("Error: PIL/Pillow not installed")
        print("Install with: pip install Pillow")
