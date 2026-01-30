/**
 * Aircraft Type Database
 * Maps ICAO 24-bit addresses and common callsign prefixes to aircraft types
 */

// Common aircraft types by ICAO type code (derived from registration patterns)
// This is a simplified mapping - in production you'd use a full ICAO database
export const AIRCRAFT_TYPES = {
  // Boeing
  'B738': 'B737-800',
  'B739': 'B737-900', 
  'B38M': 'B737 MAX 8',
  'B39M': 'B737 MAX 9',
  'B752': 'B757-200',
  'B753': 'B757-300',
  'B763': 'B767-300',
  'B772': 'B777-200',
  'B773': 'B777-300',
  'B77W': 'B777-300ER',
  'B788': 'B787-8',
  'B789': 'B787-9',
  'B78X': 'B787-10',
  'B748': 'B747-8',
  
  // Airbus
  'A319': 'A319',
  'A320': 'A320',
  'A321': 'A321',
  'A20N': 'A320neo',
  'A21N': 'A321neo',
  'A332': 'A330-200',
  'A333': 'A330-300',
  'A359': 'A350-900',
  'A35K': 'A350-1000',
  'A388': 'A380-800',
  
  // Regional
  'E75L': 'E175',
  'E190': 'E190',
  'CRJ7': 'CRJ-700',
  'CRJ9': 'CRJ-900',
  'DH8D': 'Q400',
  
  // Business/GA
  'C172': 'C172',
  'C182': 'C182',
  'C208': 'Caravan',
  'C25A': 'CJ2',
  'C25B': 'CJ3',
  'C56X': 'Citation X',
  'CL60': 'Challenger',
  'G650': 'G650',
  'GLF5': 'G550',
  'GLF6': 'G650',
  'F2TH': 'Falcon 2000',
  'FA7X': 'Falcon 7X',
  'FA8X': 'Falcon 8X',
  
  // Helicopters
  'H60': 'Black Hawk',
  'EC35': 'EC135',
  'EC45': 'EC145',
  'A109': 'A109',
  'B407': 'Bell 407'
};

// Airline ICAO codes to IATA for display
export const AIRLINE_CODES = {
  'AAL': 'AA',
  'UAL': 'UA',
  'DAL': 'DL',
  'SWA': 'WN',
  'ASA': 'AS',
  'FFT': 'F9',
  'JBU': 'B6',
  'NKS': 'NK',
  'AFR': 'AF',
  'BAW': 'BA',
  'DLH': 'LH',
  'UAE': 'EK',
  'QTR': 'QR',
  'CPA': 'CX',
  'ANA': 'NH',
  'JAL': 'JL',
  'KLM': 'KL',
  'VIR': 'VS',
  'QFA': 'QF',
  'ACA': 'AC',
  'AMX': 'AM',
  'AVA': 'AV',
  'LAN': 'LA',
  'TAM': 'JJ',
  'CMP': 'CM',
  'ICE': 'FI',
  'SAS': 'SK',
  'AUA': 'OS',
  'SWR': 'LX',
  'IBE': 'IB',
  'CPA': 'CX',
  'THA': 'TG',
  'SIA': 'SQ',
  'MAS': 'MH',
  'GIA': 'GA',
  'PAL': 'PR',
  'KAL': 'KE',
  'AAR': 'OZ',
  'CES': 'MU',
  'CSN': 'CZ',
  'CCA': 'CA',
  'CHH': 'HU',
  'CPA': 'CX',
  'HVN': 'VN',
  'AIJ': '4O',
  'VOI': 'Y4',
  'Interjet': '4O',
  'Volaris': 'Y4',
  'Aeromexico': 'AM',
  'Alaska': 'AS',
  'American': 'AA',
  'Delta': 'DL',
  'United': 'UA',
  'Southwest': 'WN',
  'JetBlue': 'B6',
  'Frontier': 'F9',
  'Spirit': 'NK'
};

/**
 * Guess aircraft type from various hints
 * This is best-effort since OpenSky doesn't provide aircraft type directly
 */
export function guessAircraftType(flight) {
  // Try to extract from callsign patterns
  const callsign = flight.callsign || '';
  
  // Check for common airline patterns that indicate aircraft type
  // United Express/Connection regionals
  if (callsign.startsWith('SKW')) return 'E175/CRJ'; // SkyWest
  if (callsign.startsWith('RPA')) return 'E175';     // Republic
  if (callsign.startsWith('ENY')) return 'E175';     // Envoy
  if (callsign.startsWith('ASH')) return 'CRJ';      // Mesa
  if (callsign.startsWith('GJS')) return 'CRJ';      // GoJet
  if (callsign.startsWith('EDV')) return 'CRJ';      // Endeavor
  if (callsign.startsWith('JIA')) return 'CRJ';      // PSA
  
  // Alaska regionals
  if (callsign.startsWith('QXE')) return 'Q400';     // Horizon
  
  // Delta regionals
  if (callsign.startsWith('EDV')) return 'CRJ';      // Endeavor
  
  // American regionals
  if (callsign.startsWith('PDT')) return 'E145';     // Piedmont
  
  // Altitude-based hints
  if (flight.altitude > 25000) {
    // Likely a jet
    if (flight.speed > 450) return 'B737/A320';
    return 'Regional Jet';
  }
  
  if (flight.altitude < 5000 && flight.speed < 150) {
    return 'GA/Small';
  }
  
  return 'Unknown';
}

/**
 * Format aircraft type for 32x8 display (max ~8 chars)
 */
export function formatAircraftType(type) {
  if (!type) return '??';
  
  // Shorten common types
  const shortNames = {
    'B737-800': 'B738',
    'B737-900': 'B739',
    'B737 MAX 8': 'B7M8',
    'B737 MAX 9': 'B7M9',
    'B757-200': 'B752',
    'B757-300': 'B753',
    'B767-300': 'B763',
    'B777-200': 'B772',
    'B777-300': 'B773',
    'B777-300ER': 'B77W',
    'B787-8': 'B788',
    'B787-9': 'B789',
    'B787-10': 'B78X',
    'B747-8': 'B748',
    'A320': 'A320',
    'A321': 'A321',
    'A319': 'A319',
    'A320neo': 'A20N',
    'A321neo': 'A21N',
    'A330-200': 'A332',
    'A330-300': 'A333',
    'A350-900': 'A359',
    'A350-1000': 'A35K',
    'A380-800': 'A388',
    'E175': 'E175',
    'E190': 'E190',
    'CRJ-700': 'CRJ7',
    'CRJ-900': 'CRJ9',
    'Q400': 'DH8D',
    'Caravan': 'C208',
    'Citation X': 'C56X',
    'Challenger': 'CL60',
    'G650': 'GLF6',
    'G550': 'GLF5',
    'Falcon 2000': 'F2TH',
    'Falcon 7X': 'FA7X',
    'Falcon 8X': 'FA8X',
    'Black Hawk': 'H60',
    'EC135': 'EC35',
    'EC145': 'EC45',
    'A109': 'A109',
    'Bell 407': 'B407',
    'C172': 'C172',
    'C182': 'C182',
    'CJ2': 'C25A',
    'CJ3': 'C25B',
    'Unknown': '??',
    'Regional Jet': 'RJET',
    'GA/Small': 'GA',
    'E175/CRJ': 'RJET'
  };
  
  return shortNames[type] || type.slice(0, 6).toUpperCase();
}

/**
 * Format flight number, extracting airline code
 */
export function formatFlightNumber(callsign) {
  if (!callsign) return 'UNK';
  
  let formatted = callsign.trim().toUpperCase();
  formatted = formatted.replace(/\s+$/, '');
  
  // Replace ICAO airline codes with IATA codes
  for (const [icao, iata] of Object.entries(AIRLINE_CODES)) {
    if (formatted.startsWith(icao)) {
      formatted = iata + formatted.slice(icao.length);
      break;
    }
  }
  
  // Max 7 chars for display
  if (formatted.length > 7) {
    formatted = formatted.slice(0, 7);
  }
  
  return formatted;
}
