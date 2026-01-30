/**
 * Ultra-Compact Flight Formatter for AWTRIX 32x8
 * Everything fits on ONE screen - NO scrolling
 * Format: [ICON] XXXXXX (max 6 chars to prevent scroll)
 */

import { getAircraftShort } from './aircraft-db.mjs';

const SCREEN_DURATION = 6; // seconds per screen

/**
 * Ultra-compact single-screen format
 * Max 6 characters to fit with icon on 32x8 without scrolling
 */
export function formatUltraCompact(flight) {
  const msgs = [];
  
  // Flight number - max 5 chars (e.g., "UA133" or "AS41")
  const flightNum = (flight.flightNumber || flight.callsign || 'UNK').slice(0, 5);
  
  // Route in ultra-compact: PDX-SEA becomes "P-S" or just dest "SEA"
  const origin = (flight.origin || '?').slice(0, 1);
  const dest = (flight.destination || '?').slice(0, 3);
  
  // Distance: show as whole number nm (e.g., "2NM")
  const dist = flight.distance ? Math.round(flight.distance) : '?';
  
  // Speed: just the number, no "KT" suffix
  const spd = flight.speed ? Math.round(flight.speed / 10) : 0; // tens of knots
  
  // Altitude in thousands
  const altK = flight.altitude ? Math.round(flight.altitude / 1000) : 0;
  
  // Aircraft type code (B738 -> B38)
  const acCode = getAircraftShort(flight.aircraftType).slice(0, 3);
  
  // Screen 1: Flight number + dest (e.g., "AS41SEA" = 7 chars - might scroll slightly)
  // Better: "AS41 SEA" -> too long
  // Best: Split into multiple single screens
  
  // Screen 1: Flight number only
  msgs.push({
    text: flightNum,
    icon: 'plane',
    color: 'gold',
    scroll: false,  // CRITICAL: prevents scrolling
    duration: SCREEN_DURATION
  });
  
  // Screen 2: Origin->Dest (e.g., "P>SEA" = 5 chars)
  msgs.push({
    text: `${origin}>${dest}`,
    icon: 'globe', 
    color: 'info',
    scroll: false,
    duration: SCREEN_DURATION
  });
  
  // Screen 3: Distance + altitude (e.g., "2NM8" = 4 chars, meaning 2nm, 8000ft)
  // Or just "2NM" with color indicating altitude
  msgs.push({
    text: `${dist}NM`,
    icon: 'radar',
    color: getAltitudeColor(flight.altitude),
    scroll: false,
    duration: SCREEN_DURATION
  });
  
  // Screen 4: Aircraft type
  msgs.push({
    text: acCode,
    icon: 'chart',
    color: getAltitudeColor(flight.altitude),
    scroll: false,
    duration: SCREEN_DURATION
  });
  
  return msgs;
}

/**
 * Format all flights for display sequence
 * Each flight gets 4 ultra-short screens
 */
export function formatFlights(flights, maxFlights = 4) {
  const allMessages = [];
  
  for (let i = 0; i < Math.min(flights.length, maxFlights); i++) {
    const flight = flights[i];
    const formatted = formatUltraCompact(flight);
    allMessages.push(...formatted);
    
    // Tiny separator between flights
    if (i < Math.min(flights.length, maxFlights) - 1) {
      allMessages.push({
        text: '+',
        icon: 'arrow_up',
        color: 'purple',
        scroll: false,
        duration: 1
      });
    }
  }
  
  return allMessages;
}

/**
 * Altitude-based color
 */
function getAltitudeColor(altitude) {
  if (altitude == null) return 'white';
  if (altitude < 2000) return 'warning';   // Low = orange
  if (altitude > 30000) return 'purple';   // High = purple  
  return 'info';                           // Medium = blue
}

export { SCREEN_DURATION };
