/**
 * OpenSky Network API Client
 * Fetches nearby aircraft data (free, no auth required for basic use)
 */

const OPENSKY_BASE = 'https://opensky-network.org/api/states/all';

/**
 * Fetch flights near a location
 * @param {number} lat - Center latitude
 * @param {number} lon - Center longitude
 * @param {number} radiusNm - Search radius in nautical miles
 */
export async function fetchNearbyFlights(lat, lon, radiusNm = 15) {
  // Convert nm to degrees (approximate at this latitude)
  // 1 degree lat = ~60 nm, 1 degree lon varies by latitude
  const latDeg = radiusNm / 60;
  const lonDeg = radiusNm / (60 * Math.cos(lat * Math.PI / 180));
  
  const bounds = {
    lamin: lat - latDeg,  // min latitude
    lamax: lat + latDeg,  // max latitude
    lomin: lon - lonDeg,  // min longitude
    lomax: lon + lonDeg   // max longitude
  };
  
  const url = `${OPENSKY_BASE}?lamin=${bounds.lamin.toFixed(6)}&lamax=${bounds.lamax.toFixed(6)}&lomin=${bounds.lomin.toFixed(6)}&lomax=${bounds.lomax.toFixed(6)}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'FlightTracker-AWTRIX/1.0'
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    
    const data = await res.json();
    return parseFlights(data, lat, lon);
  } catch (err) {
    console.error('Flight fetch error:', err.message);
    return [];
  }
}

/**
 * Parse OpenSky response into clean flight objects
 * OpenSky state vector format:
 * [icao24, callsign, origin_country, time_position, last_contact,
 *  longitude, latitude, baro_altitude, on_ground, velocity, true_track,
 *  vertical_rate, sensors, geo_altitude, squawk, spi, position_source]
 */
function parseFlights(data, centerLat, centerLon) {
  if (!data.states || !Array.isArray(data.states)) {
    return [];
  }
  
  const flights = [];
  
  for (const state of data.states) {
    const flight = parseFlightState(state);
    if (flight && flight.lat && flight.lon) {
      flight.distance = calculateDistance(centerLat, centerLon, flight.lat, flight.lon);
      flights.push(flight);
    }
  }
  
  // Sort by distance
  return flights.sort((a, b) => a.distance - b.distance);
}

function parseFlightState(state) {
  if (!state || state.length < 17) return null;
  
  // Skip grounded aircraft (usually at airports)
  if (state[8] === true) return null;
  
  return {
    icao: state[0],           // ICAO 24-bit address
    callsign: state[1]?.trim(), // Callsign (may have trailing spaces)
    originCountry: state[2],  // Origin country
    timePosition: state[3],   // Unix timestamp
    lastContact: state[4],    // Last contact timestamp
    lon: state[5],            // Longitude
    lat: state[6],            // Latitude
    altitude: state[7] ? Math.round(state[7] * 3.28084) : null, // Convert m to ft
    onGround: state[8],       // On ground flag
    speed: state[9] ? Math.round(state[9] * 1.94384) : null, // Convert m/s to knots
    heading: state[10],       // True track in degrees
    verticalRate: state[11] ? Math.round(state[11] * 196.85) : null, // Convert m/s to fpm
    squawk: state[14],        // Squawk code
    positionSource: state[16] // 0=ADS-B, 1=ASTERIX, 2=MLAT, 3=FLARM, 4=FANS, 5=Other
  };
}

/**
 * Calculate distance between two lat/lon points (Haversine)
 * Returns distance in nautical miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Get cardinal direction from heading
 */
export function headingToCardinal(heading) {
  if (heading == null) return '?';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((heading % 360) + 360) % 360 / 22.5) % 16;
  return directions[index];
}

/**
 * Get arrow character for heading
 */
export function headingToArrow(heading) {
  if (heading == null) return '○';
  // Unicode arrows for 8 directions
  const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
  const normalized = ((heading % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return arrows[index];
}

/**
 * Calculate bearing from center to flight (for "NW" type directions)
 */
export function calculateBearingToFlight(centerLat, centerLon, flightLat, flightLon) {
  const dLon = toRad(flightLon - centerLon);
  const lat1 = toRad(centerLat);
  const lat2 = toRad(flightLat);
  
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  bearing = ((bearing % 360) + 360) % 360;
  
  return bearing;
}
