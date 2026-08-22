export const AIRPORTS = [
  // India Hubs & Regionals
  { icao: 'VIDP', iata: 'DEL', name: 'Indira Gandhi Intl', city: 'Delhi', country: 'India', lat: 28.5665, lon: 77.1031, elevationFt: 777, defaultAlternate: 'VABB' },
  { icao: 'VABB', iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj Intl', city: 'Mumbai', country: 'India', lat: 19.0896, lon: 72.8656, elevationFt: 39, defaultAlternate: 'VOBL' },
  { icao: 'VOBL', iata: 'BLR', name: 'Kempegowda Intl', city: 'Bengaluru', country: 'India', lat: 13.1986, lon: 77.7066, elevationFt: 3000, defaultAlternate: 'VOMM' },
  { icao: 'VOMM', iata: 'MAA', name: 'Chennai Intl', city: 'Chennai', country: 'India', lat: 12.9941, lon: 80.1709, elevationFt: 52, defaultAlternate: 'VOBL' },
  { icao: 'VECC', iata: 'CCU', name: 'Netaji Subhash Chandra Bose Intl', city: 'Kolkata', country: 'India', lat: 22.6547, lon: 88.4467, elevationFt: 16, defaultAlternate: 'VIDP' },
  { icao: 'VOHS', iata: 'HYD', name: 'Rajiv Gandhi Intl', city: 'Hyderabad', country: 'India', lat: 17.2403, lon: 78.4294, elevationFt: 2024, defaultAlternate: 'VOBL' },
  { icao: 'VOCI', iata: 'COK', name: 'Cochin International', city: 'Kochi', country: 'India', lat: 10.1520, lon: 76.4019, elevationFt: 30, defaultAlternate: 'VOBL' },
  { icao: 'VOGO', iata: 'GOI', name: 'Dabolim Airport', city: 'Goa', country: 'India', lat: 15.3808, lon: 73.8314, elevationFt: 184, defaultAlternate: 'VABB' },
  { icao: 'VIJP', iata: 'JAI', name: 'Jaipur International', city: 'Jaipur', country: 'India', lat: 26.8242, lon: 75.8122, elevationFt: 1263, defaultAlternate: 'VIDP' },
  { icao: 'VAAH', iata: 'AMD', name: 'Sardar Vallabhbhai Patel Intl', city: 'Ahmedabad', country: 'India', lat: 23.0772, lon: 72.6347, elevationFt: 189, defaultAlternate: 'VABB' },

  // Middle East & Africa
  { icao: 'OMDB', iata: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', lat: 25.2532, lon: 55.3657, elevationFt: 62, defaultAlternate: 'OMAA' },
  { icao: 'OTHH', iata: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', lat: 25.2731, lon: 51.6081, elevationFt: 13, defaultAlternate: 'OMDB' },
  { icao: 'OMAA', iata: 'AUH', name: 'Zayed International', city: 'Abu Dhabi', country: 'UAE', lat: 24.4330, lon: 54.6511, elevationFt: 88, defaultAlternate: 'OMDB' },
  { icao: 'OERK', iata: 'RUH', name: 'King Khalid Intl', city: 'Riyadh', country: 'Saudi Arabia', lat: 24.9576, lon: 46.6988, elevationFt: 2049, defaultAlternate: 'OEJN' },

  // Europe
  { icao: 'EGLL', iata: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', lat: 51.4700, lon: -0.4543, elevationFt: 83, defaultAlternate: 'EGKK' },
  { icao: 'LFPG', iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lon: 2.5479, elevationFt: 392, defaultAlternate: 'LFPO' },
  { icao: 'EDDF', iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lon: 8.5622, elevationFt: 364, defaultAlternate: 'EDDM' },
  { icao: 'EHAM', iata: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lon: 4.7683, elevationFt: -11, defaultAlternate: 'EBBR' },
  { icao: 'LEMD', iata: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'Spain', lat: 40.4839, lon: -3.5680, elevationFt: 1998, defaultAlternate: 'LEBL' },

  // North America
  { icao: 'KJFK', iata: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'USA', lat: 40.6413, lon: -73.7781, elevationFt: 13, defaultAlternate: 'KEWR' },
  { icao: 'KORD', iata: 'ORD', name: 'O\'Hare International', city: 'Chicago', country: 'USA', lat: 41.9742, lon: -87.9073, elevationFt: 672, defaultAlternate: 'KMDW' },
  { icao: 'KLAX', iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', lat: 33.9416, lon: -118.4085, elevationFt: 125, defaultAlternate: 'KSAN' },
  { icao: 'KSFO', iata: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'USA', lat: 37.6213, lon: -122.3790, elevationFt: 13, defaultAlternate: 'KOAK' },
  { icao: 'KMIA', iata: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', lat: 25.7959, lon: -80.2870, elevationFt: 8, defaultAlternate: 'KFLL' },

  // Asia-Pacific & Australia
  { icao: 'WSSS', iata: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915, elevationFt: 22, defaultAlternate: 'WMKK' },
  { icao: 'RJTT', iata: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', lat: 35.5494, lon: 139.7798, elevationFt: 35, defaultAlternate: 'RJAA' },
  { icao: 'VHHH', iata: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', lat: 22.3080, lon: 113.9185, elevationFt: 28, defaultAlternate: 'VMMC' },
  { icao: 'VTBS', iata: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lon: 100.7501, elevationFt: 5, defaultAlternate: 'VTBD' },
  { icao: 'YSSY', iata: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', lat: -33.9399, lon: 151.1753, elevationFt: 21, defaultAlternate: 'YMML' },
];

export const getAirportByIcao = (icao) => {
  return AIRPORTS.find((a) => a.icao.toUpperCase() === icao?.toUpperCase()) || null;
};
