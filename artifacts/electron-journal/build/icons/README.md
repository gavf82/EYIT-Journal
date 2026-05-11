# App Icon Assets

electron-builder looks for icon files in this directory when packaging.
Without them the packaged app uses the default Electron icon.

Place the following files here before running a release build:

| File | Platform | Minimum size | Notes |
|---|---|---|---|
| `icon.icns` | macOS | 512×512 pt | Multi-resolution ICNS bundle. Create with `iconutil` from an `icon.iconset/` folder containing the required sizes (16, 32, 64, 128, 256, 512 and their @2x equivalents). |
| `icon.ico` | Windows | 256×256 px | Multi-size ICO. Include 16, 32, 48, 64, 128, 256 px layers. Create with `magick convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico` (ImageMagick). |
| `icon.png` | Linux | 512×512 px | Square PNG with transparency. Used for the AppImage and desktop entry. |

All three icons should be derived from the same source artwork.

## Quick conversion from a high-resolution PNG

```bash
# Requires ImageMagick (https://imagemagick.org)

# 1. Start with a 1024×1024 source PNG: source.png

# Linux icon (straightforward)
cp source.png icon.png

# Windows ICO
magick convert source.png \
  -define icon:auto-resize=256,128,64,48,32,16 \
  icon.ico

# macOS ICNS — requires macOS toolchain
mkdir icon.iconset
for size in 16 32 64 128 256 512; do
  magick convert source.png -resize ${size}x${size} icon.iconset/icon_${size}x${size}.png
  magick convert source.png -resize $((size*2))x$((size*2)) icon.iconset/icon_${size}x${size}@2x.png
done
iconutil -c icns icon.iconset
rm -r icon.iconset
```

## Verifying icons are picked up

Run `pnpm dist` from `artifacts/electron-journal` and inspect the built installer —
the app window title bar, taskbar/Dock entry, and installer wizard should all show
the custom icon rather than the default Electron icon.
