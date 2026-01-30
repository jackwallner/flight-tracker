/**
 * Flight Display Formatter v2 - For FlightRadar24 data
 * Simplified: Route | Plane | Flight # | Distance+Speed
 * Uses AWTRIX icons (no text emojis - they don't render on 32x8)
 */

import { headingToArrow, calculateBearingToFlight } from './api-fr24.mjs';
import { getAircraftShort } from './aircraft-db.mjs';

// Longer duration for slower cycling (seconds per screen)
const SCREEN_DURATION = 10;

/**
 * Format flight for display - 4 screens per flight:
 * 1. Route (icon: globe)
 * 2. Aircraft type (icon: airplane)
 * 3. Flight number (icon: chart)
 * 4. Distance + speed (icon: pin/radar)
 */
export function formatFlight(flight, centerLat, centerLon) {
  const msgs = [];
  
  // Screen 1: Route
  const origin = flight.origin || '???';
  const dest = flight.destination || '???';
  msgs.push({
    text: `${origin} TO ${dest}`,
    icon: 'globe',
    color: 'info',
    duration: SCREEN_DURATION
  });
  
  // Screen 2: Aircraft type
  const acType = getAircraftShort(flight.aircraftType);
  msgs.push({
    text: acType,
    icon: 'plane',
    color: 'gold',
    duration: SCREEN_DURATION
  });
  
  // Screen 3: Flight number
  const flightNum = flight.flightNumber?.trim() || flight.callsign?.trim() || 'UNKNOWN';
  msgs.push({
    text: flightNum,
    icon: 'chart',
    color: 'success',
    duration: SCREEN_DURATION
  });
  
  // Screen 4: Distance from exact location + speed
  let distanceText = '';
  if (flight.distance && centerLat != null && centerLon != null) {
    const bearing = calculateBearingToFlight(centerLat, centerLon, flight.lat, flight.lon);
    const arrow = headingToArrow(bearing);
    const dist = flight.distance.toFixed(1);
    const spd = flight.speed ? `${Math.round(flight.speed)}KT` : '--';
    distanceText = `${dist}NM ${arrow} ${spd}`;
  } else {
    const spd = flight.speed ? `${Math.round(flight.speed)}KT` : '--';
    distanceText = spd;
  }
  msgs.push({
    text: distanceText,
    icon: 'radar',
    color: getAltitudeColor(flight.altitude),
    duration: SCREEN_DURATION
  });
  
  return msgs;
}

/**
 * Format altitude-based color
 */
function getAltitudeColor(altitude) {
  if (altitude == null) return 'white';
  if (altitude < 2000) return 'warning';  // Low = orange
  if (altitude > 30000) return 'purple';  // High = purple
  return 'info';  // Medium = blue
}

/**
 * Format all flights for display sequence
 */
export function formatFlights(flights, maxFlights = 5, centerLat, centerLon) {
  const allMessages = [];
  
  for (let i = 0; i < Math.min(flights.length, maxFlights); i++) {
    const flight = flights[i];
    const formatted = formatFlight(flight, centerLat, centerLon);
    
    allMessages.push(...formatted);
    
    // Add separator between flights (shorter duration)
    if (i < Math.min(flights.length, maxFlights) - 1) {
      allMessages.push({
        text: 'NEXT FLIGHT',
        icon: 'arrow_up',
        color: 'purple',
        duration: 5
      });
    }
  }
  
  return allMessages;
}

/**
 * Single-line compact format (not used in current mode)
 */
export function formatCompact(flight) {
  const origin = flight.origin || '???';
  const dest = flight.destination || '???';
  const acType = getAircraftShort(flight.aircraftType);
  const arrow = headingToArrow(flight.heading);
  const alt = flight.altitude ? `${(flight.altitude/1000).toFixed(1)}KFT` : '';
  const spd = flight.speed ? `${Math.round(flight.speed)}KT` : '';
  
  return {
    text: `${origin} TO ${dest} ${acType} ${alt} ${spd}`,
    icon: 'plane',
    color: getAltitudeColor(flight.altitude),
    duration: SCREEN_DURATION
  };
}
