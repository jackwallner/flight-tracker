/**
 * Aircraft Type Database
 * Maps ICAO type codes to aircraft names
 * Simplified from ESP32 project
 */

export const AIRCRAFT_DB = {
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
  'B744': 'B747-400',
  'B742': 'B747-200',
  'B712': 'B717',
  'B722': 'B727',
  
  // Airbus
  'A318': 'A318',
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
  'A306': 'A300',
  'A310': 'A310',
  
  // Regional Jets
  'E75L': 'E175',
  'E75S': 'E175',
  'E190': 'E190',
  'E195': 'E195',
  'E170': 'E170',
  'CRJ2': 'CRJ-200',
  'CRJ7': 'CRJ-700',
  'CRJ9': 'CRJ-900',
  'CRJX': 'CRJ-1000',
  'DH8D': 'Q400',
  'DH8C': 'Q300',
  'AT76': 'ATR-72',
  'AT75': 'ATR-72',
  'AT45': 'ATR-42',
  'AT43': 'ATR-42',
  
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
  'PC12': 'PC-12',
  'TBM7': 'TBM-700',
  'TBM9': 'TBM-900',
  
  // Helicopters
  'H60': 'Black Hawk',
  'EC35': 'EC135',
  'EC45': 'EC145',
  'A109': 'A109',
  'B407': 'Bell 407',
  'B429': 'Bell 429',
  'AS50': 'AS350',
  'AS55': 'AS355',
  'S92': 'S-92',
  
  // Military/Other
  'C17': 'C-17',
  'C30J': 'C-130J',
  'C130': 'C-130',
  'K35R': 'KC-135',
  'A400': 'A400M',
  'C5M': 'C-5',
  'B52': 'B-52',
  'F16': 'F-16',
  'F18': 'F-18',
  'F22': 'F-22',
  'F35': 'F-35',
  'E6': 'E-6',
  'E3TF': 'E-3',
  'P8': 'P-8',
};

/**
 * Get aircraft name from ICAO type code
 */
export function getAircraftName(typeCode) {
  if (!typeCode) return 'Unknown';
  return AIRCRAFT_DB[typeCode.toUpperCase()] || typeCode;
}

/**
 * Get short aircraft code for display
 */
export function getAircraftShort(typeCode) {
  if (!typeCode) return '??';
  const code = typeCode.toUpperCase();
  // Already short enough
  if (code.length <= 4) return code;
  return code.substring(0, 4);
}
