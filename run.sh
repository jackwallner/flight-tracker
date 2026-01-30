#!/bin/bash
# Flight tracker launcher - uses AWTRIX channel integration
# Also logs flights to flights.json for GitHub Pages site

cd "$(dirname "$0")"

# Set your coordinates here (or in environment)
export TRACKER_LAT="${TRACKER_LAT:-45.62522790951604}"
export TRACKER_LON="${TRACKER_LON:--122.52818677615409}"

# Log flights to local file (synced to private my-flights repo)
export FLIGHTS_LOG_PATH="${FLIGHTS_LOG_PATH:-./flights.json}"

echo "Starting Flight Tracker..."
echo "Location: $TRACKER_LAT, $TRACKER_LON"
echo "Log: $FLIGHTS_LOG_PATH"
echo ""
echo "To sync flights to GitHub Pages, run: ./sync-to-private.sh"
echo ""

node tracker.mjs
