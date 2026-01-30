#!/usr/bin/env node
/**
 * Flight Tracker - AWTRIX Channel Integration
 * Event-driven: only notifies when NEW flights detected
 * Uses ulanzi-clock channel API for proper clawdbot integration
 */

import { fetchFR24Flights } from './api-fr24.mjs';
import * as awtrix from '../ulanzi-clock/channel.mjs';

const CONFIG = {
  lat: parseFloat(process.env.TRACKER_LAT) || 0.0,  // Set via TRACKER_LAT env var
  lon: parseFloat(process.env.TRACKER_LON) || 0.0,  // Set via TRACKER_LON env var
  radiusNm: parseInt(process.env.TRACKER_RADIUS_NM) || 3,   // 3NM - overhead zone
  pollIntervalSec: parseInt(process.env.POLL_INTERVAL) || 20,
  displayDuration: 5  // Seconds per info screen
};

let lastFlightCallsign = null;
let isRunning = true;

/**
 * Get color based on altitude (meaningful color coding)
 */
function getAltitudeColor(altitude) {
  if (altitude == null) return '#FFFFFF';
  if (altitude < 5000) return '#FF6B35';    // Orange - low/landing
  if (altitude < 15000) return '#FFD700';   // Gold - mid-level
  if (altitude < 30000) return '#00D9FF';   // Cyan - climbing/descending
  return '#9D4EDD';                          // Purple - cruising altitude
}

/**
 * Get color based on speed (meaningful color coding)
 */
function getSpeedColor(speed) {
  if (speed == null) return '#FFFFFF';
  if (speed < 200) return '#4CAF50';        // Green - slow/descending
  if (speed < 350) return '#FFD700';        // Gold - normal
  if (speed < 500) return '#FF9800';        // Orange - fast
  return '#F44336';                          // Red - very fast
}

/**
 * Get color based on distance (proximity to house)
 */
function getDistanceColor(distanceNm) {
  if (distanceNm == null) return '#FFFFFF';
  if (distanceNm < 0.5) return '#FF0000';   // Red - very close!
  if (distanceNm < 1.0) return '#FF9800';   // Orange - close
  if (distanceNm < 1.5) return '#FFD700';   // Gold - nearby
  return '#00D9FF';                          // Cyan - farther
}

/**
 * Get altitude-based icon
 */
function getAltitudeIcon(altitude) {
  if (altitude == null) return 'plane';
  if (altitude < 5000) return 'arrow_down';
  if (altitude > 30000) return 'arrow_up';
  return 'plane';
}

/**
 * Get aircraft type name from ICAO code
 */
function getAircraftType(typeCode) {
  const types = {
    'A319': 'A319', 'A320': 'A320', 'A321': 'A321',
    'A332': 'A330', 'A333': 'A330', 'A359': 'A350',
    'B38M': '737MAX', 'B738': '737', 'B739': '737',
    'B752': '757', 'B763': '767', 'B772': '777',
    'B788': '787', 'B789': '787',
    'E75L': 'E175', 'CRJ7': 'CRJ',
    'A20N': 'A320neo', 'A21N': 'A321neo',
    'BCS1': 'A220', 'BCS3': 'A220',
    'C56X': 'C56X', 'GLF4': 'G4', 'GLF5': 'G5',
    'C680': 'C680', 'CL60': 'CL60', 'FA50': 'FA50'
  };
  // Return friendly name, or raw code, or '?' if truly nothing
  return types[typeCode] || typeCode || '?';
}

/**
 * Extract airline code from flight number/callsign
 */
function getAirlineCode(flightNumber, callsign) {
  const flight = flightNumber || callsign || 'PLANE';
  // Extract 2-3 letter airline code (e.g., "UA498" -> "UA", "SWA2053" -> "SWA")
  const match = flight.match(/^([A-Z]{2,3})/);
  return match ? match[1] : flight.slice(0, 3);
}

/**
 * Format flight notification
 */
function formatFlight(flight) {
  const route = flight.origin && flight.destination
    ? `${flight.origin}→${flight.destination}`
    : 'UNKNOWN';

  const fullFlightNum = flight.flightNumber || flight.callsign || '';
  const airlineCode = getAirlineCode(fullFlightNum, flight.callsign);
  const distNm = flight.distance ? flight.distance.toFixed(1) : '?';
  const altKft = flight.altitude ? (flight.altitude / 1000).toFixed(1) : '?';
  const speedKt = flight.speed ? Math.round(flight.speed) : '?';

  let aircraftType = getAircraftType(flight.type);

  // Fallback: if aircraft type is unknown, show flight number instead
  if (!aircraftType || aircraftType === '?') {
    aircraftType = fullFlightNum || '?';
  }

  return {
    airlineCode,
    route,
    distNm,
    altKft,
    speedKt,
    aircraftType
  };
}

/**
 * Send flight notification to AWTRIX
 */
async function notifyFlight(flight) {
  const { airlineCode, route, distNm, altKft, speedKt, aircraftType } = formatFlight(flight);

  console.log(`✈️  ${airlineCode} (${aircraftType}) | ${route} | ${distNm}NM | ${altKft}Kft | ${speedKt}kt`);

  const dur = CONFIG.displayDuration;

  const altColor = getAltitudeColor(flight.altitude);
  const speedColor = getSpeedColor(flight.speed);

  // Extract departure and arrival airports
  const [departure, arrival] = route !== 'UNKNOWN' ? route.split('→') : ['?', '?'];

  // 4-screen sequence - split route into departure/arrival
  const screens = [
    {
      text: airlineCode,         // "UA" - colored by altitude
      icon: 'plane',
      color: altColor,           // Altitude: orange=low, gold=mid, cyan=high, purple=cruise
      duration: dur,
      scroll: false
    },
    {
      text: aircraftType,        // "737" or flight number - colored by speed
      icon: 'plane',
      color: speedColor,         // Speed: green=slow, gold=normal, orange=fast, red=very fast
      duration: dur,
      scroll: false
    },
    {
      text: departure,           // "SMF" - departure airport
      icon: 'departure',         // LaMetric 72519 - takeoff icon
      color: '#FFD700',          // Gold for departure
      duration: dur,
      scroll: false
    },
    {
      text: arrival,             // "PDX" - arrival airport
      icon: 'landing',           // LaMetric 72520 - landing icon
      color: '#4CAF50',          // Green for landing
      duration: dur,
      scroll: false
    }
  ];

  // Send each screen with no gap
  for (const screen of screens) {
    await awtrix.send(screen);
    await new Promise(r => setTimeout(r, dur * 1000));
  }
}

/**
 * Main tracker loop
 */
async function run() {
  console.log('🛩️  Flight Tracker Starting...');
  console.log(`📍 Location: ${CONFIG.lat}, ${CONFIG.lon}`);
  console.log(`📡 Radius: ${CONFIG.radiusNm}NM`);
  console.log(`⏱️  Poll: every ${CONFIG.pollIntervalSec}s\n`);

  // Check AWTRIX health
  const health = await awtrix.health();
  if (health.status !== 'online') {
    console.error('❌ AWTRIX offline');
    process.exit(1);
  }
  console.log(`✅ AWTRIX connected (${health.ip})\n`);

  while (isRunning) {
    try {
      const flights = await fetchFR24Flights(CONFIG.lat, CONFIG.lon, CONFIG.radiusNm);

      if (flights.length === 0) {
        console.log(`[${new Date().toLocaleTimeString()}] No flights`);

        // Clear last flight - zone is empty now
        if (lastFlightCallsign) {
          console.log(`✈️  ${lastFlightCallsign} left the zone\n`);
          lastFlightCallsign = null;
        }

        await sleep(CONFIG.pollIntervalSec * 1000);
        continue;
      }

      // Sort by distance, get closest
      flights.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      const closest = flights[0];

      // Show flight if NEW, or re-show same flight to keep it visible
      if (closest.callsign !== lastFlightCallsign) {
        console.log(`\n🆕 New flight detected!`);
        await notifyFlight(closest);
        lastFlightCallsign = closest.callsign;
      } else {
        // Same flight still overhead - keep showing it
        console.log(`[${new Date().toLocaleTimeString()}] Overhead: ${closest.callsign} @ ${closest.distance?.toFixed(1)}NM`);
        await notifyFlight(closest);  // Re-show same info
      }

    } catch (err) {
      console.error(`Error: ${err.message}`);
    }

    await sleep(CONFIG.pollIntervalSec * 1000);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function shutdown() {
  console.log('\n🛑 Stopping flight tracker...');
  isRunning = false;
  setTimeout(() => process.exit(0), 1000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start
run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
