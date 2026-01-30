#!/usr/bin/env python3
"""
Download LaMetric icons to AWTRIX clock
Usage: python download_awtrix_icons.py [icon_id...]
"""
import requests
import sys
import time

AWTRIX_IP = "192.168.5.56"

def download_icon(icon_id):
    """
    Attempt to download a LaMetric icon to AWTRIX

    Note: AWTRIX 3 doesn't have a documented API endpoint for downloading icons.
    This script will try common approaches, but you may need to use the web interface:

    1. Open http://192.168.5.56 in your browser
    2. Go to the Icons tab
    3. Enter the icon ID
    4. Click Preview, then Download
    """
    print(f"\nAttempting to download icon {icon_id}...")

    # Try various potential endpoints
    endpoints = [
        f"http://{AWTRIX_IP}/api/icon?id={icon_id}",
        f"http://{AWTRIX_IP}/api/downloadIcon?id={icon_id}",
        f"http://{AWTRIX_IP}/icon/{icon_id}/download",
    ]

    for url in endpoints:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"  ✓ Downloaded via {url}")
                return True
        except Exception as e:
            pass

    # If API doesn't work, provide manual instructions
    print(f"  ✗ Could not download programmatically")
    print(f"  → Please download manually:")
    print(f"     1. Open http://{AWTRIX_IP} in browser")
    print(f"     2. Go to Icons tab")
    print(f"     3. Enter icon ID: {icon_id}")
    print(f"     4. Click Preview, then Download")

    return False

def main():
    if len(sys.argv) < 2:
        # Default airplane-related icon IDs to try
        icon_ids = [
            2056,  # Plane (commonly used)
            833,   # Airplane
            1092,  # Globe/world
            6020,  # Radar
            52580, # Another plane variant
            2497,  # Travel icon
        ]
        print("No icon IDs provided. Trying common airplane icons:")
    else:
        icon_ids = sys.argv[1:]

    print(f"\n{'='*60}")
    print(f"  AWTRIX Icon Downloader")
    print(f"  Target: http://{AWTRIX_IP}")
    print(f"{'='*60}")

    for icon_id in icon_ids:
        download_icon(icon_id)
        time.sleep(0.5)

    print(f"\n{'='*60}")
    print(f"  If automatic download failed, use web interface:")
    print(f"  http://{AWTRIX_IP}")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
