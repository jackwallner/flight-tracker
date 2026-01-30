/**
 * Flight Display Formatter for AWTRIX 32x8
 * Compresses flight info into compact display strings
 */

import { headingToArrow, headingToCardinal, calculateBearingToFlight } from './api.mjs';
import { guessAircraftType, formatAircraftType, formatFlightNumber } from './aircraft.mjs';

/**
 * Format flight for AWTRIX display - NEW FORMAT:
 * 1. Flight + Aircraft Type
 * 2. Altitude + Speed  
 * 3. Distance + Direction
 * (Departure/Destination requires flight schedule API - not in OpenSky free tier)
 */
export function formatFlight(flight, centerLat, centerLon) {
  const msgs = [];
  
  // Screen 1: Flight Number + Aircraft Type
  const flightNum = formatFlightNumber(flight.callsign);
  const acType = formatAircraftType(guessAircraftType(flight));
  msgs.push({
    text: `${flightNum} ${acType}`,
    icon: 'flight',
    color: 'info',
    duration: 5
  });
  
  // Screen 2: Altitude + Speed
  const alt = formatAltitude(flight.altitude);
  const speed = flight.speed ? `${flight.speed}kt` : '--';
  msgs.push({
    text: `${alt} ${speed}`,
    icon: 'chart',
    color: getAltitudeColor(flight.altitude),
    duration: 5
  });
  
  // Screen 3: Distance + Direction
  if (flight.distance && centerLat != null && centerLon != null) {
    const bearing = calculateBearingToFlight(centerLat, centerLon, flight.lat, flight.lon);
    const arrow = headingToArrow(bearing);
    msgs.push({
      text: `${flight.distance.toFixed(1)}nm ${arrow}`,
      icon: 'weather',
      color: 'gold',
      duration: 4
    });
  }
  
  // Note: Departure/Destination airports require flight schedule API
  // OpenSky free tier only provides origin country, not airport codes
  if (flight.originCountry) {
    msgs.push({
      text: formatCountry(flight.originCountry),
      icon: 'home',
      color: 'white',
      duration: 3
    });
  }
  
  return msgs;
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
    
    // Add separator between flights
    if (i < Math.min(flights.length, maxFlights) - 1) {
      allMessages.push({
        text: '✈️ NEXT',
        icon: 'flight',
        color: 'purple',
        duration: 2
      });
    }
  }
  
  return allMessages;
}

/**
 * Format altitude for display
 */
function formatAltitude(altitudeFt) {
  if (altitudeFt == null) return '---';
  
  // Below 1000 ft, show exact
  if (Math.abs(altitudeFt) < 1000) {
    return `${Math.round(altitudeFt/100)*100}ft`;
  }
  
  // Above 1000 ft, show as X.XK
  const kfeet = (altitudeFt / 1000).toFixed(1);
  return `${kfeet}Kft`;
}

/**
 * Get color based on altitude
 */
function getAltitudeColor(altitude) {
  if (altitude == null) return 'white';
  
  // Low altitude = warning
  if (altitude < 2000) return 'warning';
  // High altitude = success  
  if (altitude > 30000) return 'success';
  // Medium = info
  return 'info';
}

/**
 * Shorten country name for display
 */
function formatCountry(country) {
  if (!country) return '??';
  
  const abbr = {
    'United States': 'USA',
    'United States of America': 'USA',
    'United Kingdom': 'UK',
    'Canada': 'CAN',
    'Germany': 'DEU',
    'France': 'FRA',
    'Netherlands': 'NLD',
    'Australia': 'AUS',
    'Japan': 'JPN',
    'China': 'CHN',
    'Mexico': 'MEX',
    'Spain': 'ESP',
    'Italy': 'ITA',
    'Brazil': 'BRA',
    'Argentina': 'ARG',
    'Colombia': 'COL',
    'Chile': 'CHL',
    'Peru': 'PER'
  };
  
  if (abbr[country]) return abbr[country];
  
  const words = country.split(' ');
  if (words.length > 1 && words[0].length <= 5) {
    return words[0].toUpperCase();
  }
  return country.slice(0, 3).toUpperCase();
}

/**
 * Single-line compact format for very brief display
 * "AS618 B738 1.2nm 12K 450kt ↓"
 */
export function formatCompact(flight) {
  const flightNum = formatFlightNumber(flight.callsign);
  const acType = formatAircraftType(guessAircraftType(flight));
  const arrow = headingToArrow(flight.heading);
  const dist = flight.distance ? `${flight.distance.toFixed(1)}nm` : '';
  const alt = flight.altitude ? formatAltitude(flight.altitude) : '';
  const spd = flight.speed ? `${flight.speed}kt` : '';
  
  return {
    text: `${flightNum} ${acType} ${dist} ${alt} ${spd} ${arrow}`,
    icon: 'flight',
    color: getAltitudeColor(flight.altitude),
    duration: 6
  };
}
