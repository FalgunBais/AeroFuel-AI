export const AIRPORTS = [
  // India Hubs & Regionals
  { icao: 'VIDP', iata: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', lat: 28.5665, lon: 77.1031, elevationFt: 777, defaultAlternate: 'VABB', runways: '09/27, 10/28, 11/29' },
  { icao: 'VABB', iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', lat: 19.0896, lon: 72.8656, elevationFt: 39, defaultAlternate: 'VOBL', runways: '09/27, 14/32' },
  { icao: 'VOBL', iata: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', lat: 13.1986, lon: 77.7066, elevationFt: 3000, defaultAlternate: 'VOMM', runways: '09L/27R, 09R/27L' },
  { icao: 'VOMM', iata: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', lat: 12.9941, lon: 80.1709, elevationFt: 52, defaultAlternate: 'VOBL', runways: '07/25, 12/30' },
  { icao: 'VECC', iata: 'CCU', name: 'Netaji Subhash Chandra Bose Intl', city: 'Kolkata', country: 'India', lat: 22.6547, lon: 88.4467, elevationFt: 16, defaultAlternate: 'VIDP', runways: '01L/19R, 01R/19L' },
  { icao: 'VOHS', iata: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', lat: 17.2403, lon: 78.4294, elevationFt: 2024, defaultAlternate: 'VOBL', runways: '09L/27R, 09R/27L' },
  { icao: 'VOCI', iata: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India', lat: 10.1520, lon: 76.4019, elevationFt: 30, defaultAlternate: 'VOBL', runways: '09/27' },
  { icao: 'VOGO', iata: 'GOI', name: 'Dabolim Goa International Airport', city: 'Goa', country: 'India', lat: 15.3808, lon: 73.8314, elevationFt: 184, defaultAlternate: 'VABB', runways: '08/26' },
  { icao: 'VIJP', iata: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', country: 'India', lat: 26.8242, lon: 75.8122, elevationFt: 1263, defaultAlternate: 'VIDP', runways: '09/27' },
  { icao: 'VAAH', iata: 'AMD', name: 'Sardar Vallabhbhai Patel International', city: 'Ahmedabad', country: 'India', lat: 23.0772, lon: 72.6347, elevationFt: 189, defaultAlternate: 'VABB', runways: '05/23' },
  { icao: 'VAPO', iata: 'PNQ', name: 'Pune International Airport', city: 'Pune', country: 'India', lat: 18.5821, lon: 73.9197, elevationFt: 1942, defaultAlternate: 'VABB', runways: '10/28' },
  { icao: 'VILK', iata: 'LKO', name: 'Chaudhary Charan Singh International', city: 'Lucknow', country: 'India', lat: 26.7606, lon: 80.8893, elevationFt: 405, defaultAlternate: 'VIDP', runways: '09/27' },
  { icao: 'VIAR', iata: 'ATQ', name: 'Sri Guru Ram Dass Jee International', city: 'Amritsar', country: 'India', lat: 31.7096, lon: 74.7973, elevationFt: 756, defaultAlternate: 'VIDP', runways: '16/34' },
  { icao: 'VEBS', iata: 'BBI', name: 'Biju Patnaik International Airport', city: 'Bhubaneswar', country: 'India', lat: 20.2444, lon: 85.8178, elevationFt: 138, defaultAlternate: 'VECC', runways: '14/32' },
  { icao: 'VEGT', iata: 'GAU', name: 'Lokpriya Gopinath Bordoloi Intl', city: 'Guwahati', country: 'India', lat: 26.1061, lon: 91.5859, elevationFt: 162, defaultAlternate: 'VECC', runways: '02/20' },
  { icao: 'VOSR', iata: 'SXR', name: 'Sheikh ul-Alam International Airport', city: 'Srinagar', country: 'India', lat: 33.9871, lon: 74.7741, elevationFt: 5458, defaultAlternate: 'VIDP', runways: '13/31' },

  // Middle East & Africa
  { icao: 'OMDB', iata: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', lat: 25.2532, lon: 55.3657, elevationFt: 62, defaultAlternate: 'OMAA', runways: '12L/30R, 12R/30L' },
  { icao: 'OTHH', iata: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', lat: 25.2731, lon: 51.6081, elevationFt: 13, defaultAlternate: 'OMDB', runways: '16L/34R, 16R/34L' },
  { icao: 'OMAA', iata: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi', country: 'UAE', lat: 24.4330, lon: 54.6511, elevationFt: 88, defaultAlternate: 'OMDB', runways: '13L/31R, 13R/31L' },
  { icao: 'OERK', iata: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', lat: 24.9576, lon: 46.6988, elevationFt: 2049, defaultAlternate: 'OEJN', runways: '15L/33R, 15R/33L' },
  { icao: 'OEJN', iata: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia', lat: 21.6796, lon: 39.1565, elevationFt: 48, defaultAlternate: 'OERK', runways: '16C/34C, 16L/34R' },
  { icao: 'HECA', iata: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', lat: 30.1219, lon: 31.4056, elevationFt: 382, defaultAlternate: 'HEAX', runways: '05L/23R, 05C/23C' },
  { icao: 'FAOR', iata: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', lat: -26.1392, lon: 28.2460, elevationFt: 5558, defaultAlternate: 'FALE', runways: '03L/21R, 03R/21L' },

  // Europe
  { icao: 'EGLL', iata: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'UK', lat: 51.4700, lon: -0.4543, elevationFt: 83, defaultAlternate: 'EGKK', runways: '09L/27R, 09R/27L' },
  { icao: 'EGKK', iata: 'LGW', name: 'London Gatwick Airport', city: 'London', country: 'UK', lat: 51.1481, lon: -0.1903, elevationFt: 202, defaultAlternate: 'EGLL', runways: '08R/26L' },
  { icao: 'LFPG', iata: 'CDG', name: 'Paris Charles de Gaulle Airport', city: 'Paris', country: 'France', lat: 49.0097, lon: 2.5479, elevationFt: 392, defaultAlternate: 'LFPO', runways: '08L/26R, 09L/27R' },
  { icao: 'EDDF', iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lon: 8.5622, elevationFt: 364, defaultAlternate: 'EDDM', runways: '07C/25C, 07R/25L' },
  { icao: 'EDDM', iata: 'MUC', name: 'Munich Franz Josef Strauss Intl', city: 'Munich', country: 'Germany', lat: 48.3537, lon: 11.7860, elevationFt: 1487, defaultAlternate: 'EDDF', runways: '08L/26R, 08R/26L' },
  { icao: 'EHAM', iata: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lon: 4.7683, elevationFt: -11, defaultAlternate: 'EBBR', runways: '18R/36L, 09/27' },
  { icao: 'LEMD', iata: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'Spain', lat: 40.4839, lon: -3.5680, elevationFt: 1998, defaultAlternate: 'LEBL', runways: '14L/32R, 18R/36L' },
  { icao: 'LSZH', iata: 'ZRH', name: 'Zurich International Airport', city: 'Zurich', country: 'Switzerland', lat: 47.4647, lon: 8.5492, elevationFt: 1416, defaultAlternate: 'LFSB', runways: '16/34, 14/32' },
  { icao: 'LTFM', iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', lat: 41.2753, lon: 28.7519, elevationFt: 325, defaultAlternate: 'LTFJ', runways: '16R/34L, 17L/35R' },

  // North America
  { icao: 'KJFK', iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', lat: 40.6413, lon: -73.7781, elevationFt: 13, defaultAlternate: 'KEWR', runways: '04L/22R, 13R/31L' },
  { icao: 'KEWR', iata: 'EWR', name: 'Newark Liberty International', city: 'Newark/NYC', country: 'USA', lat: 40.6895, lon: -74.1745, elevationFt: 18, defaultAlternate: 'KJFK', runways: '04L/22R, 04R/22L' },
  { icao: 'KORD', iata: 'ORD', name: 'Chicago O\'Hare International', city: 'Chicago', country: 'USA', lat: 41.9742, lon: -87.9073, elevationFt: 672, defaultAlternate: 'KMDW', runways: '10L/28R, 09C/27C' },
  { icao: 'KLAX', iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', lat: 33.9416, lon: -118.4085, elevationFt: 125, defaultAlternate: 'KSAN', runways: '06L/24R, 07R/25L' },
  { icao: 'KSFO', iata: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA', lat: 37.6213, lon: -122.3790, elevationFt: 13, defaultAlternate: 'KOAK', runways: '28L/10R, 28R/10L' },
  { icao: 'KMIA', iata: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'USA', lat: 25.7959, lon: -80.2870, elevationFt: 8, defaultAlternate: 'KFLL', runways: '08R/26L, 09/27' },
  { icao: 'KATL', iata: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta', country: 'USA', lat: 33.6407, lon: -84.4277, elevationFt: 1026, defaultAlternate: 'KBHM', runways: '08L/26R, 09L/27R' },
  { icao: 'KDFW', iata: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA', lat: 32.8998, lon: -97.0403, elevationFt: 607, defaultAlternate: 'KHOU', runways: '17R/35L, 18L/36R' },
  { icao: 'KSEA', iata: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA', lat: 47.4502, lon: -122.3088, elevationFt: 433, defaultAlternate: 'KPDX', runways: '16L/34R, 16C/34C' },
  { icao: 'KBOS', iata: 'BOS', name: 'Boston Logan International', city: 'Boston', country: 'USA', lat: 42.3656, lon: -71.0096, elevationFt: 20, defaultAlternate: 'KPVD', runways: '04R/22L, 09/27' },
  { icao: 'CYYZ', iata: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada', lat: 43.6777, lon: -79.6248, elevationFt: 569, defaultAlternate: 'CYUL', runways: '05/23, 06L/24R' },
  { icao: 'CYVR', iata: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', lat: 49.1967, lon: -123.1815, elevationFt: 14, defaultAlternate: 'KSEA', runways: '08L/26R, 08R/26L' },

  // Asia-Pacific & Oceania
  { icao: 'WSSS', iata: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915, elevationFt: 22, defaultAlternate: 'WMKK', runways: '02L/20R, 02C/20C' },
  { icao: 'RJTT', iata: 'HND', name: 'Tokyo Haneda International Airport', city: 'Tokyo', country: 'Japan', lat: 35.5494, lon: 139.7798, elevationFt: 35, defaultAlternate: 'RJAA', runways: '16L/34R, 05/23' },
  { icao: 'RJAA', iata: 'NRT', name: 'Tokyo Narita International', city: 'Tokyo', country: 'Japan', lat: 35.7647, lon: 140.3864, elevationFt: 141, defaultAlternate: 'RJTT', runways: '16R/34L, 16L/34R' },
  { icao: 'RKSI', iata: 'ICN', name: 'Seoul Incheon International Airport', city: 'Seoul', country: 'South Korea', lat: 37.4602, lon: 126.4407, elevationFt: 23, defaultAlternate: 'RKSS', runways: '15L/33R, 16/34' },
  { icao: 'VHHH', iata: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', lat: 22.3080, lon: 113.9185, elevationFt: 28, defaultAlternate: 'VMMC', runways: '07L/25R, 07R/25L' },
  { icao: 'VTBS', iata: 'BKK', name: 'Bangkok Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lon: 100.7501, elevationFt: 5, defaultAlternate: 'VTBD', runways: '01R/19L, 01L/19R' },
  { icao: 'WMKK', iata: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', lat: 2.7456, lon: 101.7099, elevationFt: 69, defaultAlternate: 'WSSS', runways: '14L/32R, 14R/32L' },
  { icao: 'YSSY', iata: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', lat: -33.9399, lon: 151.1753, elevationFt: 21, defaultAlternate: 'YMML', runways: '16R/34L, 07/25' },
  { icao: 'YMML', iata: 'MEL', name: 'Melbourne Tullamarine Airport', city: 'Melbourne', country: 'Australia', lat: -37.6690, lon: 144.8410, elevationFt: 434, defaultAlternate: 'YSSY', runways: '16/34, 09/27' },
  { icao: 'NZAA', iata: 'AKL', name: 'Auckland International Airport', city: 'Auckland', country: 'New Zealand', lat: -37.0082, lon: 174.7850, elevationFt: 23, defaultAlternate: 'NZWN', runways: '05R/23L' }
];

export const getAirportByIcao = (icao) => {
  if (!icao) return null;
  return AIRPORTS.find((a) => a.icao.toUpperCase() === icao.toUpperCase()) || null;
};

export const getAirportByIata = (iata) => {
  if (!iata) return null;
  return AIRPORTS.find((a) => a.iata.toUpperCase() === iata.toUpperCase()) || null;
};
