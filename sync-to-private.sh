#!/bin/bash
# Sync flights.json to private my-flights repo for GitHub Pages
# Run this periodically (cron every minute) to update the site

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRIVATE_REPO="$SCRIPT_DIR/../my-flights"
FLIGHTS_FILE="$SCRIPT_DIR/flights.json"

# Check if flights.json exists
if [ ! -f "$FLIGHTS_FILE" ]; then
    echo "No flights.json yet, skipping..."
    exit 0
fi

# Check if my-flights repo exists
if [ ! -d "$PRIVATE_REPO/.git" ]; then
    echo "Error: my-flights repo not found at $PRIVATE_REPO"
    exit 1
fi

# Copy flights.json to private repo
cp "$FLIGHTS_FILE" "$PRIVATE_REPO/flights.json"

# Check if there are changes
cd "$PRIVATE_REPO"
if git diff --quiet HEAD -- flights.json; then
    echo "No changes to flights.json"
    exit 0
fi

# Commit and push
git add flights.json
git commit -m "Update flights: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

echo "Synced flights to private repo at $(date)"
