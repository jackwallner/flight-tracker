# Flight Tracker for AWTRIX

Displays real-time aircraft information on your [Ulanzi Smart Pixel Clock](https://www.ulanzi.com/products/ulanzi-smart-pixel-clock-2882) via AWTRIX.

![Flight Tracker Demo](https://img.shields.io/badge/AWTRIX-Compatible-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue)

## Features

- ✈️ Real-time flight tracking via FlightRadar24 API
- 📍 Configurable location and search radius
- 🎨 Color-coded by altitude and speed
- 🔄 4-screen rotation: Airline → Aircraft Type → Departure → Arrival
- 📡 MQTT-based AWTRIX integration
- 🔇 Silent when no flights (no "NO FLIGHTS" message cluttering display)

## Quick Start

```bash
# Install dependencies
npm install

# Configure your location
cp .env.example .env
# Edit .env with your coordinates

# Run the tracker
node tracker.mjs
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `TRACKER_LAT` | *required* | Your latitude |
| `TRACKER_LON` | *required* | Your longitude |
| `TRACKER_RADIUS_NM` | 3 | Search radius in nautical miles |
| `POLL_INTERVAL` | 20 | Poll interval in seconds |

### Finding Your Coordinates

1. Go to [Google Maps](https://maps.google.com)
2. Right-click your location
3. Click the coordinates to copy
4. Paste into `.env`

## Display Format

The tracker cycles through 4 screens per flight:

```
┌────────────────────────┐
│ UA                     │  ← Airline code (color = altitude)
│ 738                    │  ← Aircraft type (color = speed)
│ SFO                    │  ← Departure airport
│ JFK                    │  ← Arrival airport
└────────────────────────┘
```

**Colors:**
- Altitude: Orange (low) → Gold → Cyan → Purple (cruise)
- Speed: Green (slow) → Gold → Orange → Red (fast)

## Files

| File | Purpose |
|------|---------|
| `tracker.mjs` | Main tracker loop |
| `api-fr24.mjs` | FlightRadar24 API client |
| `run.sh` | Quick launcher |

## Requirements

- Node.js 18+
- AWTRIX-compatible clock on your network
- Internet connection (for FR24 API)

## License

MIT
