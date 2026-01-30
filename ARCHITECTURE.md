# Flight Tracker Architecture

## Overview

This flight tracker monitors aircraft near your location and displays them on:
1. **AWTRIX Pixel Clock** - Real-time notifications with 5-screen rotation
2. **GitHub Pages Website** - Historical closest approach data

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  FlightRadar24  │────▶│  tracker.mjs    │────▶│  AWTRIX Clock   │
│     API         │     │  (running on    │     │  (192.168.5.56) │
│                 │     │   your Mac)     │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
    │aircraft_db    │   │ flights-web   │   │  flights.json │
    │    .json      │   │    .json      │   │   (history)   │
    │  (520k AC)    │   │               │   │               │
    └───────────────┘   └───────┬───────┘   └───────────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │  GitHub  │  │  Sync    │  │  Website │
            │  Pages   │◀─┤  Script  │─▶│  Display │
            └──────────┘  └──────────┘  └──────────┘
```

## Components

### 1. `tracker.mjs` (Main Service)
**Location:** `~/services/flight-tracker/tracker.mjs` (deployed copy)
**Runs as:** macOS LaunchAgent (`com.jackwallner.flight-tracker`)

**What it does:**
- Polls FlightRadar24 every 20 seconds
- Filters flights within 2NM radius
- Queries **520k aircraft database** for aircraft details
- Tracks closest approach for each flight
- Sends 5-screen sequence to AWTRIX:
  1. **Airline code** (e.g., `AS`) - colored by altitude
  2. **Distance** (e.g., `1.2NM`) - cyan
  3. **Aircraft type** (e.g., `737`) - colored by speed
  4. **Departure airport** with takeoff icon - gold
  5. **Arrival airport** with landing icon - green
- Exports `flights-web.json` for website

**Configuration:**
```javascript
CONFIG = {
  lat: 45.625280431872,      // Vancouver, WA
  lon: -122.52811167430798,
  radiusNm: 2,                // 2 nautical mile detection zone
  pollIntervalSec: 20,
  displayDuration: 5          // seconds per screen
}
```

### 2. `api-fr24.mjs` (API Client)
Fetches flight data from FlightRadar24's data-cloud endpoint.
Returns: callsign, altitude, speed, lat/lon, aircraft type, origin/destination, ICAO 24-bit address

### 3. `aircraft-db.mjs` + `aircraft_db.json` (Database)
**520,048 aircraft** from OpenSky Network.

Maps ICAO 24-bit address → aircraft details:
- `typecode`: ICAO type designator (B738, A320, etc.)
- `reg`: Registration/tail number (N123AB)
- `manufacturer`: Boeing, Airbus, etc.
- `model`: Full model name

Loaded lazily on first lookup. 53MB JSON file.

### 4. `flights-web.html` (Website Display)
GitHub Pages site showing:
- Closest approach distance
- Altitude & speed at closest approach
- Aircraft type (enriched from database)
- Origin → Destination route
- FlightRadar24 link (clickable callsign)
- Precision indicator

### 5. `sync-to-private.sh`
Copies `flights-web.json` and `index.html` to your private `my-flights` repo for GitHub Pages hosting.

## Data Flow

### Flight Detection → AWTRIX Display
```
1. Poll FR24 API → Get all flights in bounding box
2. Calculate distance from home lat/lon
3. Filter to 2NM radius
4. For each flight:
   - Look up ICAO 24-bit address in aircraft_db.json
   - Enrich with aircraft type, registration, manufacturer
5. Sort by distance (closest first)
6. If NEW flight: Send 5-screen sequence to AWTRIX
7. Record path snapshot every poll while flight in zone
8. When flight leaves: Export final closest approach to web
```

### Website Data
```
While flight in zone:
  - Record snapshot every 20 seconds
  - Find minimum distance from path snapshots
  - Look up aircraft type in database
  - Export to flights-web.json with:
    - closestApproach: {distance, altitude, speed, timestamp}
    - flight: {callsign, aircraftType, origin, destination}
```

## File Locations

| File | Source | Deployed | Purpose |
|------|--------|----------|---------|
| `tracker.mjs` | `clawd/skills/flight-tracker/` | `~/services/flight-tracker/` | Main service |
| `api-fr24.mjs` | `clawd/skills/flight-tracker/` | `~/services/flight-tracker/` | API client |
| `aircraft-db.mjs` | `clawd/skills/flight-tracker/` | `~/services/flight-tracker/` | DB lookup |
| `aircraft_db.json` | `clawd/skills/flight-tracker/` | `~/services/flight-tracker/` | 520k aircraft |
| `flights-web.json` | Generated | `~/services/flight-tracker/` | Website data |
| `flights.json` | Generated | `~/services/flight-tracker/` | Flight history log |
| `flights-web.html` | `clawd/skills/flight-tracker/` | `~/services/flight-tracker/` | Website template |

**⚠️ Important:** The `sync-to-private.sh` script reads `flights-web.html` from **`~/services/flight-tracker/`**, NOT from `clawd/skills/`. After editing the HTML in skills, you must:
1. Copy to service dir: `cp flights-web.html ~/services/flight-tracker/`
2. Or re-deploy: `./deploy_to_service.sh`
3. Then sync: `./sync-to-private.sh`

## Management Commands

```bash
# Check if running
launchctl list | grep flight-tracker

# View logs
tail -f ~/services/flight-tracker/flight-tracker.log
tail -f ~/services/flight-tracker/flight-tracker.error.log

# Restart after code changes
cd ~/clawd/skills/flight-tracker
./deploy_to_service.sh

# Manual sync to website
cd ~/clawd/skills/flight-tracker
./sync-to-private.sh
```

## Common Issues

### Missing aircraft/speed data
Some flights (especially private/GA aircraft) don't report all fields. The database now has 520k aircraft to look up by ICAO address, which improves aircraft type detection significantly.

### Aircraft type shows "?"
The database lookup is done by ICAO 24-bit address. If an aircraft is:
- Not in the OpenSky database (rare, but happens for very new or private aircraft)
- Using a blocked/transient ICAO address
Then it will show "?" for aircraft type.

### Radius confusion
- **2NM radius**: Distance from your location to detect flights
- **Website shows closest approach**: Can be less than 2NM (e.g., 0.42NM) if flight passed close by
- The "closest approach" is the minimum distance recorded while tracking

### Website not showing changes / old HTML
The sync chain is: `~/services/flight-tracker/` → `skills/my-flights/` → GitHub Pages

If you edit `skills/flight-tracker/flights-web.html` but don't copy it to the service directory, `sync-to-private.sh` will copy the OLD version from `~/services/flight-tracker/`.

**Always run after editing HTML:**
```bash
cp skills/flight-tracker/flights-web.html ~/services/flight-tracker/
./sync-to-private.sh
```

## Configuration Changes

### Change radius
Edit `~/Library/LaunchAgents/com.jackwallner.flight-tracker.plist`:
```xml
<key>TRACKER_RADIUS_NM</key>
<string>2</string>  <!-- Change this value -->
```
Then restart:
```bash
launchctl unload ~/Library/LaunchAgents/com.jackwallner.flight-tracker.plist
launchctl load ~/Library/LaunchAgents/com.jackwallner.flight-tracker.plist
```

### Change location
Edit the same plist file and update `TRACKER_LAT` and `TRACKER_LON`.

## Updating Aircraft Database

The database is from OpenSky Network. To update:
```bash
cd ~/clawd/skills/flight-tracker
curl -L -o aircraft_db.json "https://opensky-network.org/datasets/metadata/aircraftDatabase.csv"
# Convert CSV to JSON (use the conversion script)
./deploy_to_service.sh
```
