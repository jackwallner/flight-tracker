#!/bin/bash
# Download LaMetric icons and upload to AWTRIX via curl

AWTRIX_IP="192.168.5.56"

# Common airplane/travel LaMetric icon IDs to try
# These are commonly used icon IDs found in various integrations
ICONS=(
    "2056:airplane"      # Plane icon
    "53:globe"           # Globe/world
    "1538:radar"         # Radar/signal
    "1726:plane2"        # Alternative plane
    "2497:travel"        # Travel icon
)

echo "========================================="
echo "Downloading LaMetric icons to AWTRIX"
echo "========================================="

mkdir -p /tmp/awtrix_icons

for entry in "${ICONS[@]}"; do
    IFS=':' read -r icon_id icon_name <<< "$entry"

    echo ""
    echo "[$icon_name] Trying icon ID: $icon_id"

    # Try GIF first (animated)
    echo "  Downloading from LaMetric CDN..."
    if curl -s -f "https://developer.lametric.com/content/apps/icon_thumbs/${icon_id}.gif" \
         -o "/tmp/awtrix_icons/${icon_name}.gif"; then
        echo "  ✓ Downloaded as GIF"
        FILE="/tmp/awtrix_icons/${icon_name}.gif"
    # Try PNG if GIF fails
    elif curl -s -f "https://developer.lametric.com/content/apps/icon_thumbs/${icon_id}.png" \
         -o "/tmp/awtrix_icons/${icon_name}.png"; then
        echo "  ✓ Downloaded as PNG"
        FILE="/tmp/awtrix_icons/${icon_name}.png"
    else
        echo "  ✗ Icon ID $icon_id not found"
        continue
    fi

    # Try to upload to AWTRIX via web interface endpoint
    echo "  Uploading to AWTRIX..."
    if curl -s -f -X POST "http://${AWTRIX_IP}/edit" \
         -F "data=@${FILE};filename=ICONS/${icon_name}.$(basename $FILE | cut -d. -f2)" \
         > /dev/null 2>&1; then
        echo "  ✓ Uploaded to AWTRIX"
    else
        echo "  ! Upload via /edit failed, keeping file for manual upload"
    fi
done

echo ""
echo "========================================="
echo "Downloaded icons saved to: /tmp/awtrix_icons/"
ls -lh /tmp/awtrix_icons/ 2>/dev/null || echo "No icons downloaded"
echo ""
echo "If auto-upload failed, manually upload via:"
echo "  http://${AWTRIX_IP} -> File Manager -> ICONS folder"
echo "========================================="
