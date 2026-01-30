# Flight Tracker for AWTRIX

Real-time aircraft tracking on your [Ulanzi Smart Pixel Clock](https://www.ulanzi.com/products/ulanzi-smart-pixel-clock-2882) via AWTRIX, with GitHub Pages integration for historical data.

![Flight Tracker Demo](https://img.shields.io/badge/AWTRIX-Compatible-brightgreen)

## Quick Start

```bash
# Deploy and start
cd ~/clawd/skills/flight-tracker
./deploy_to_service.sh

# View logs
tail -f ~/services/flight-tracker/flight-tracker.log
```

## What's Running

**`tracker.mjs`** runs as a macOS background service and:
1. Monitors flights within **2 nautical miles** of Vancouver, WA
2. Shows them on your AWTRIX clock (5-screen rotation)
3. Exports data to [your website](https://jackwallner.github.io/my-flights/)

## AWTRIX Display

When a flight enters the 2NM zone, you see 5 screens (5 seconds each):

```
┌────────────────────────┐
│ AS                     │  ← Screen 1: Airline code (color = altitude)
│ 1.2NM                  │  ← Screen 2: Distance (cyan)
│ 737                    │  ← Screen 3: Aircraft type (color = speed)
│ SMF                    │  ← Screen 4: Departure (gold + takeoff icon)
│ SEA                    │  ← Screen 5: Arrival (green + landing icon)
└────────────────────────┘
```

**Colors:**
- **Altitude**: Orange (low) → Gold → Cyan → Purple (cruise)
- **Speed**: Green (slow) → Gold → Orange → Red (fast)
- **Distance**: Cyan

## Website

Live at: **https://jackwallner.github.io/my-flights/**

Shows:
- Flight callsign (clickable → FlightRadar24)
- Aircraft type (enriched from 520k aircraft database)
- Closest approach distance
- Altitude & speed at closest approach
- Origin → Destination route
- Precision indicator (✓ = high, ~ = tracked, ? = estimated)

## Aircraft Database

**520,048 aircraft** from [OpenSky Network](https://opensky-network.org/)

Maps ICAO 24-bit addresses to:
- Aircraft type (B738, A320, etc.)
- Registration (tail number)
- Manufacturer and model

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## Files

| Active Files | Purpose |
|--------------|---------|
| `tracker.mjs` | Main service - 5-screen AWTRIX display, web export |
| `api-fr24.mjs` | FlightRadar24 API client |
| `aircraft-db.mjs` | Aircraft database enrichment (520k entries) |
| `aircraft_db.json` | Full OpenSky aircraft database (53MB) |
| `flights-web.html` | Website display template (source) |
| `deploy_to_service.sh` | Deploy code to `~/services/flight-tracker/` |
| `sync-to-private.sh` | Sync from service dir → GitHub Pages repo |

**Note:** `flights-web.html` is copied to `~/services/flight-tracker/` during deployment. The sync script reads from the **service directory**, not the skills directory. See Troubleshooting below for the full sync chain.

| Archived Files | Reason |
|----------------|--------|
| `archive/` | Old implementations, test files, unused scripts |

## Configuration

Set in `~/Library/LaunchAgents/com.jackwallner.flight-tracker.plist`:

| Variable | Default | Description |
|----------|---------|-------------|
| `TRACKER_LAT` | 45.62528 | Your latitude |
| `TRACKER_LON` | -122.52819 | Your longitude |
| `TRACKER_RADIUS_NM` | 2 | Detection radius in NM |

## Troubleshooting

**No flights showing?**
```bash
# Check if service is running
launchctl list | grep flight-tracker

# Check logs
tail -f ~/services/flight-tracker/flight-tracker.log
```

**Aircraft shows "?" for type?**
Some flights don't transmit aircraft type. The database now has 520k aircraft to look up by ICAO address, but some private/GA aircraft may still show as unknown.

**Website not updating?**
```bash
# Manual sync
./sync-to-private.sh
```

**⚠️ Critical: File Sync Chain**

The sync works in this order (checked by `sync-to-private.sh`):

1. **`~/services/flight-tracker/flights-web.html`** ← Source of truth (service reads this)
2. **↓ copied to**
3. **`skills/my-flights/index.html`** ← GitHub Pages repo
4. **↓ git push**
5. **https://jackwallner.github.io/my-flights/**

If you update `skills/flight-tracker/flights-web.html` but NOT the service directory, the sync will copy the OLD version from `~/services/flight-tracker/` and overwrite your changes.

**After editing HTML in skills/, always copy to service dir:**
```bash
cp skills/flight-tracker/flights-web.html ~/services/flight-tracker/
./sync-to-private.sh
```

Or re-deploy entirely:
```bash
./deploy_to_service.sh  # Copies all files + restarts service
./sync-to-private.sh    # Syncs to GitHub Pages
```
