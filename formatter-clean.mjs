/**
 * Clean Flight Formatter for AWTRIX 32x8
 */

import { getAircraftShort } from './aircraft-db.mjs';

const SCREEN_DURATION = 6;

// Working icon IDs
const ICONS = {
  plane: 1193,
  globe: 759,
  radar: 626,
  arrow: 120
};

export function formatFlight(flight) {
  const msgs = [];
  
  // Handle missing data gracefully
  const flightNum = (flight.flightNumber || flight.callsign || 'UNKWN').slice(0, 5);
  
  // If origin/dest unknown, show callsign only
  const origin = (flight.origin || '').slice(0, 3);
  const dest = (flight.destination || '').slice(0, 3);
  const hasRoute = origin && dest && origin !== '???' && dest !== '???';
  
  const dist = flight.distance ? Math.round(flight.distance) : '?';
  const altK = flight.altitude ? Math.round(flight.altitude / 1000) : 0;
  
  // Screen 1: Flight# with plane icon
  msgs.push({
    text: flightNum,
    icon: ICONS.plane,
    color: 'gold',
    scroll: false,
    duration: SCREEN_DURATION
  });
  
  // Screen 2: Route (if known) or skip
  if (hasRoute) {
    msgs.push({
      text: `${origin}-${dest}`,
      icon: ICONS.globe,
      color: 'info',
      scroll: false,
      duration: SCREEN_DURATION
    });
  }
  
  // Screen 3: Distance + altitude
  msgs.push({
    text: `${dist}NM ${altK}K`,
    icon: ICONS.radar,
    color: getAltitudeColor(flight.altitude),
    scroll: false,
    duration: SCREEN_DURATION
  });
  
  return msgs;
}

export function formatFlights(flights, maxFlights = 3) {
  const allMessages = [];
  const count = Math.min(flights.length, maxFlights);
  
  for (let i = 0; i < count; i++) {
    allMessages.push(...formatFlight(flights[i]));
    // Separator
    if (i < count - 1) {
      allMessages.push({
        text: '>',
        icon: ICONS.arrow,
        color: 'purple',
        scroll: false,
        duration: 2
      });
    }
  }
  
  return allMessages;
}

function getAltitudeColor(altitude) {
  if (altitude == null) return 'white';
  if (altitude < 2000) return 'warning';
  if (altitude > 30000) return 'purple';
  return 'info';
}

export { SCREEN_DURATION, ICONS };
