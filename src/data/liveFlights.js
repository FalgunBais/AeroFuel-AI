import { AIRPORTS, getAirportByIcao } from './airports';
import { AIRCRAFT_PROFILES, getAircraftById } from './aircraft';

export const INITIAL_LIVE_FLIGHTS = [
  // India Metros & Domestic Trunk
  { flightNo: 'AF-320', callsign: 'AERO320', airline: 'AeroFuel Express', aircraftId: 'a320neo', reg: 'VT-AFL', originIcao: 'VIDP', destIcao: 'VABB', altitudeFL: 360, groundSpeedKt: 462, trueAirspeedKt: 450, headingDeg: 202, progressPct: 48, status: 'Cruising', fuelFlowKgHr: 2280, fuelRemainingKg: 6420, fuelBurnedKg: 2850, windDeg: 280, windSpeedKt: 25, squawk: '4215', etaMin: 52 },
  { flightNo: '6E-204', callsign: 'IFLY204', airline: 'IndiGo', aircraftId: 'b737max8', reg: 'VT-MAX', originIcao: 'VOBL', destIcao: 'VIDP', altitudeFL: 370, groundSpeedKt: 440, trueAirspeedKt: 453, headingDeg: 355, progressPct: 35, status: 'Cruising', fuelFlowKgHr: 2240, fuelRemainingKg: 7800, fuelBurnedKg: 2150, windDeg: 10, windSpeedKt: 22, squawk: '2114', etaMin: 88 },
  { flightNo: 'AI-687', callsign: 'AIRINDIA687', airline: 'Air India', aircraftId: 'a320neo', reg: 'VT-EXG', originIcao: 'VABB', destIcao: 'VOMM', altitudeFL: 350, groundSpeedKt: 455, trueAirspeedKt: 450, headingDeg: 125, progressPct: 60, status: 'Cruising', fuelFlowKgHr: 2210, fuelRemainingKg: 5200, fuelBurnedKg: 2900, windDeg: 90, windSpeedKt: 15, squawk: '3312', etaMin: 42 },
  { flightNo: 'VT-CRJ', callsign: 'FLYFAST900', airline: 'AeroShuttle Regional', aircraftId: 'crj900', reg: 'VT-RGA', originIcao: 'VECC', destIcao: 'VIDP', altitudeFL: 340, groundSpeedKt: 452, trueAirspeedKt: 440, headingDeg: 298, progressPct: 40, status: 'Cruising', fuelFlowKgHr: 1620, fuelRemainingKg: 4200, fuelBurnedKg: 1650, windDeg: 140, windSpeedKt: 20, squawk: '3512', etaMin: 72 },
  { flightNo: '6E-512', callsign: 'IFLY512', airline: 'IndiGo', aircraftId: 'a320neo', reg: 'VT-IZU', originIcao: 'VIDP', destIcao: 'VOHS', altitudeFL: 360, groundSpeedKt: 468, trueAirspeedKt: 450, headingDeg: 175, progressPct: 72, status: 'Top of Descent', fuelFlowKgHr: 2150, fuelRemainingKg: 4600, fuelBurnedKg: 3100, windDeg: 240, windSpeedKt: 18, squawk: '2405', etaMin: 28 },
  { flightNo: '9I-801', callsign: 'ALLIANCE801', airline: 'Alliance Air', aircraftId: 'atr72_600', reg: 'VT-AIH', originIcao: 'VOMM', destIcao: 'VOBL', altitudeFL: 180, groundSpeedKt: 268, trueAirspeedKt: 275, headingDeg: 278, progressPct: 70, status: 'Approaching', fuelFlowKgHr: 670, fuelRemainingKg: 1850, fuelBurnedKg: 580, windDeg: 80, windSpeedKt: 12, squawk: '1105', etaMin: 18 },
  { flightNo: 'AI-804', callsign: 'AIRINDIA804', airline: 'Air India', aircraftId: 'a320neo', reg: 'VT-CIQ', originIcao: 'VIJP', destIcao: 'VABB', altitudeFL: 340, groundSpeedKt: 448, trueAirspeedKt: 450, headingDeg: 195, progressPct: 25, status: 'Climbing to Cruise', fuelFlowKgHr: 2350, fuelRemainingKg: 7200, fuelBurnedKg: 1400, windDeg: 300, windSpeedKt: 15, squawk: '4521', etaMin: 65 },
  { flightNo: '6E-902', callsign: 'IFLY902', airline: 'IndiGo', aircraftId: 'a320neo', reg: 'VT-IFM', originIcao: 'VAAH', destIcao: 'VOBL', altitudeFL: 360, groundSpeedKt: 460, trueAirspeedKt: 450, headingDeg: 160, progressPct: 50, status: 'Cruising', fuelFlowKgHr: 2260, fuelRemainingKg: 5900, fuelBurnedKg: 2600, windDeg: 270, windSpeedKt: 20, squawk: '3109', etaMin: 58 },
  { flightNo: 'QP-1301', callsign: 'AKASA1301', airline: 'Akasa Air', aircraftId: 'b737max8', reg: 'VT-YAA', originIcao: 'VOCI', destIcao: 'VIDP', altitudeFL: 380, groundSpeedKt: 475, trueAirspeedKt: 453, headingDeg: 5, progressPct: 55, status: 'Cruising', fuelFlowKgHr: 2200, fuelRemainingKg: 8100, fuelBurnedKg: 4200, windDeg: 210, windSpeedKt: 24, squawk: '5214', etaMin: 82 },
  { flightNo: '9I-402', callsign: 'ALLIANCE402', airline: 'Alliance Air', aircraftId: 'atr72_600', reg: 'VT-RKJ', originIcao: 'VOGO', destIcao: 'VABB', altitudeFL: 160, groundSpeedKt: 260, trueAirspeedKt: 275, headingDeg: 350, progressPct: 40, status: 'Cruising', fuelFlowKgHr: 680, fuelRemainingKg: 2400, fuelBurnedKg: 450, windDeg: 320, windSpeedKt: 10, squawk: '1240', etaMin: 38 },

  // Middle East & Long-Haul Hub Connectors
  { flightNo: 'AI-101', callsign: 'AIRINDIA101', airline: 'Air India', aircraftId: 'b787_9', reg: 'VT-ANX', originIcao: 'VIDP', destIcao: 'KJFK', altitudeFL: 390, groundSpeedKt: 498, trueAirspeedKt: 488, headingDeg: 315, progressPct: 62, status: 'Enroute (Oceanic)', fuelFlowKgHr: 5120, fuelRemainingKg: 38400, fuelBurnedKg: 46200, windDeg: 290, windSpeedKt: 38, squawk: '7102', etaMin: 310 },
  { flightNo: 'EK-500', callsign: 'EMIRATES500', airline: 'Emirates', aircraftId: 'a350_900', reg: 'A6-EXA', originIcao: 'OMDB', destIcao: 'EGLL', altitudeFL: 380, groundSpeedKt: 508, trueAirspeedKt: 490, headingDeg: 308, progressPct: 78, status: 'Descending Enroute', fuelFlowKgHr: 5400, fuelRemainingKg: 14200, fuelBurnedKg: 32800, windDeg: 260, windSpeedKt: 32, squawk: '3341', etaMin: 85 },
  { flightNo: 'QR-570', callsign: 'QATARI570', airline: 'Qatar Airways', aircraftId: 'b787_9', reg: 'A7-BHA', originIcao: 'OTHH', destIcao: 'VIDP', altitudeFL: 370, groundSpeedKt: 512, trueAirspeedKt: 488, headingDeg: 85, progressPct: 65, status: 'Cruising', fuelFlowKgHr: 5050, fuelRemainingKg: 18600, fuelBurnedKg: 14200, windDeg: 260, windSpeedKt: 30, squawk: '6211', etaMin: 68 },
  { flightNo: 'EY-204', callsign: 'ETIHAD204', airline: 'Etihad Airways', aircraftId: 'b787_9', reg: 'A6-BLC', originIcao: 'OMAA', destIcao: 'VABB', altitudeFL: 390, groundSpeedKt: 505, trueAirspeedKt: 488, headingDeg: 105, progressPct: 45, status: 'Cruising (Arabian Sea)', fuelFlowKgHr: 4980, fuelRemainingKg: 22400, fuelBurnedKg: 9600, windDeg: 280, windSpeedKt: 22, squawk: '5118', etaMin: 78 },
  { flightNo: 'EK-215', callsign: 'EMIRATES215', airline: 'Emirates', aircraftId: 'a380_800', reg: 'A6-EUV', originIcao: 'OMDB', destIcao: 'KLAX', altitudeFL: 410, groundSpeedKt: 475, trueAirspeedKt: 490, headingDeg: 340, progressPct: 52, status: 'Polar Track', fuelFlowKgHr: 11400, fuelRemainingKg: 98000, fuelBurnedKg: 110000, windDeg: 330, windSpeedKt: 45, squawk: '7302', etaMin: 420 },
  { flightNo: 'SV-750', callsign: 'SAUDIA750', airline: 'Saudia', aircraftId: 'b777_300er', reg: 'HZ-AK12', originIcao: 'OERK', destIcao: 'VIDP', altitudeFL: 380, groundSpeedKt: 518, trueAirspeedKt: 488, headingDeg: 82, progressPct: 58, status: 'Cruising', fuelFlowKgHr: 7200, fuelRemainingKg: 38000, fuelBurnedKg: 28500, windDeg: 250, windSpeedKt: 35, squawk: '4419', etaMin: 95 },

  // Transatlantic & European Trunks
  { flightNo: 'BA-117', callsign: 'SPEEDBIRD117', airline: 'British Airways', aircraftId: 'b787_9', reg: 'G-ZBKA', originIcao: 'EGLL', destIcao: 'KJFK', altitudeFL: 380, groundSpeedKt: 445, trueAirspeedKt: 488, headingDeg: 282, progressPct: 58, status: 'North Atlantic Track', fuelFlowKgHr: 5350, fuelRemainingKg: 28900, fuelBurnedKg: 31200, windDeg: 275, windSpeedKt: 48, squawk: '6245', etaMin: 195 },
  { flightNo: 'AF-006', callsign: 'AIRFRANS006', airline: 'Air France', aircraftId: 'a350_900', reg: 'F-HTYA', originIcao: 'LFPG', destIcao: 'KJFK', altitudeFL: 390, groundSpeedKt: 450, trueAirspeedKt: 490, headingDeg: 280, progressPct: 42, status: 'Cruising Oceanic', fuelFlowKgHr: 5550, fuelRemainingKg: 42000, fuelBurnedKg: 24500, windDeg: 265, windSpeedKt: 42, squawk: '5532', etaMin: 260 },
  { flightNo: 'LH-400', callsign: 'DLH400', airline: 'Lufthansa', aircraftId: 'a350_900', reg: 'D-AIXA', originIcao: 'EDDF', destIcao: 'KJFK', altitudeFL: 380, groundSpeedKt: 452, trueAirspeedKt: 490, headingDeg: 285, progressPct: 38, status: 'Enroute Westbound', fuelFlowKgHr: 5600, fuelRemainingKg: 45000, fuelBurnedKg: 22000, windDeg: 270, windSpeedKt: 40, squawk: '4220', etaMin: 285 },
  { flightNo: 'KL-641', callsign: 'KLM641', airline: 'KLM Royal Dutch', aircraftId: 'b777_300er', reg: 'PH-BHA', originIcao: 'EHAM', destIcao: 'KJFK', altitudeFL: 380, groundSpeedKt: 448, trueAirspeedKt: 488, headingDeg: 284, progressPct: 68, status: 'Approaching Canadian Coast', fuelFlowKgHr: 7400, fuelRemainingKg: 41000, fuelBurnedKg: 52000, windDeg: 280, windSpeedKt: 45, squawk: '6401', etaMin: 145 },
  { flightNo: 'BA-308', callsign: 'SPEEDBIRD308', airline: 'British Airways', aircraftId: 'a320neo', reg: 'G-TTNA', originIcao: 'EGLL', destIcao: 'LFPG', altitudeFL: 230, groundSpeedKt: 395, trueAirspeedKt: 420, headingDeg: 145, progressPct: 55, status: 'Cruising', fuelFlowKgHr: 1950, fuelRemainingKg: 4200, fuelBurnedKg: 1100, windDeg: 220, windSpeedKt: 28, squawk: '2311', etaMin: 22 },
  { flightNo: 'IB-3166', callsign: 'IBERIA3166', airline: 'Iberia', aircraftId: 'a320neo', reg: 'EC-NTO', originIcao: 'LEMD', destIcao: 'EGLL', altitudeFL: 360, groundSpeedKt: 462, trueAirspeedKt: 450, headingDeg: 5, progressPct: 62, status: 'Cruising Bay of Biscay', fuelFlowKgHr: 2220, fuelRemainingKg: 4900, fuelBurnedKg: 2800, windDeg: 240, windSpeedKt: 20, squawk: '3166', etaMin: 45 },

  // Asia-Pacific & Polar Routes
  { flightNo: 'SQ-402', callsign: 'SINGA402', airline: 'Singapore Airlines', aircraftId: 'a350_900', reg: '9V-SMA', originIcao: 'WSSS', destIcao: 'VIDP', altitudeFL: 390, groundSpeedKt: 480, trueAirspeedKt: 490, headingDeg: 305, progressPct: 52, status: 'Cruising (Bay of Bengal)', fuelFlowKgHr: 5500, fuelRemainingKg: 22400, fuelBurnedKg: 18900, windDeg: 120, windSpeedKt: 18, squawk: '5420', etaMin: 140 },
  { flightNo: 'JL-043', callsign: 'JAPAN43', airline: 'Japan Airlines', aircraftId: 'b787_9', reg: 'JA861J', originIcao: 'RJTT', destIcao: 'EGLL', altitudeFL: 400, groundSpeedKt: 495, trueAirspeedKt: 488, headingDeg: 335, progressPct: 48, status: 'Cruising (Polar Route)', fuelFlowKgHr: 5100, fuelRemainingKg: 44800, fuelBurnedKg: 38700, windDeg: 210, windSpeedKt: 35, squawk: '7412', etaMin: 340 },
  { flightNo: 'CX-695', callsign: 'CATHAY695', airline: 'Cathay Pacific', aircraftId: 'a350_1000', reg: 'B-LQA', originIcao: 'VHHH', destIcao: 'VIDP', altitudeFL: 380, groundSpeedKt: 470, trueAirspeedKt: 490, headingDeg: 275, progressPct: 45, status: 'Cruising Indo-China', fuelFlowKgHr: 6100, fuelRemainingKg: 36000, fuelBurnedKg: 23500, windDeg: 90, windSpeedKt: 25, squawk: '6122', etaMin: 155 },
  { flightNo: 'TG-315', callsign: 'THAI315', airline: 'Thai Airways', aircraftId: 'b787_9', reg: 'HS-TQA', originIcao: 'VTBS', destIcao: 'VIDP', altitudeFL: 390, groundSpeedKt: 485, trueAirspeedKt: 488, headingDeg: 295, progressPct: 58, status: 'Cruising', fuelFlowKgHr: 5150, fuelRemainingKg: 18200, fuelBurnedKg: 14800, windDeg: 110, windSpeedKt: 20, squawk: '3150', etaMin: 110 },
  { flightNo: 'QF-1', callsign: 'QANTAS1', airline: 'Qantas', aircraftId: 'a380_800', reg: 'VH-OQA', originIcao: 'YSSY', destIcao: 'WSSS', altitudeFL: 400, groundSpeedKt: 505, trueAirspeedKt: 490, headingDeg: 310, progressPct: 64, status: 'Cruising Central Australia', fuelFlowKgHr: 11200, fuelRemainingKg: 82000, fuelBurnedKg: 78000, windDeg: 230, windSpeedKt: 28, squawk: '7001', etaMin: 165 },

  // Transcontinental US Corridors & Business Jets
  { flightNo: 'UA-12', callsign: 'UNITED12', airline: 'United Airlines', aircraftId: 'b787_9', reg: 'N24976', originIcao: 'KSFO', destIcao: 'EGLL', altitudeFL: 390, groundSpeedKt: 515, trueAirspeedKt: 488, headingDeg: 45, progressPct: 52, status: 'Cruising Over Greenland', fuelFlowKgHr: 5180, fuelRemainingKg: 39000, fuelBurnedKg: 36000, windDeg: 260, windSpeedKt: 40, squawk: '7112', etaMin: 245 },
  { flightNo: 'AA-100', callsign: 'AAL100', airline: 'American Airlines', aircraftId: 'b737max8', reg: 'N324RA', originIcao: 'KJFK', destIcao: 'KORD', altitudeFL: 340, groundSpeedKt: 435, trueAirspeedKt: 453, headingDeg: 280, progressPct: 45, status: 'Cruising Great Lakes', fuelFlowKgHr: 2300, fuelRemainingKg: 6800, fuelBurnedKg: 2400, windDeg: 290, windSpeedKt: 25, squawk: '1004', etaMin: 55 },
  { flightNo: 'DL-440', callsign: 'DAL440', airline: 'Delta Air Lines', aircraftId: 'a321neo', reg: 'N301DN', originIcao: 'KMIA', destIcao: 'KJFK', altitudeFL: 360, groundSpeedKt: 478, trueAirspeedKt: 450, headingDeg: 15, progressPct: 62, status: 'Cruising East Coast', fuelFlowKgHr: 2520, fuelRemainingKg: 6400, fuelBurnedKg: 3800, windDeg: 200, windSpeedKt: 30, squawk: '4401', etaMin: 48 },
  { flightNo: 'N100VIP', callsign: 'EXEC100', airline: 'Executive Jet Aviation', aircraftId: 'g650er', reg: 'N100ER', originIcao: 'KJFK', destIcao: 'EGLL', altitudeFL: 470, groundSpeedKt: 545, trueAirspeedKt: 516, headingDeg: 78, progressPct: 75, status: 'High Altitude Cruise', fuelFlowKgHr: 1580, fuelRemainingKg: 9400, fuelBurnedKg: 8900, windDeg: 260, windSpeedKt: 55, squawk: '1337', etaMin: 65 },
  { flightNo: 'FX-5420', callsign: 'FEDEX5420', airline: 'FedEx Express', aircraftId: 'b777f', reg: 'N882FD', originIcao: 'KORD', destIcao: 'EDDF', altitudeFL: 350, groundSpeedKt: 492, trueAirspeedKt: 488, headingDeg: 65, progressPct: 58, status: 'Oceanic Cargo Crossing', fuelFlowKgHr: 7100, fuelRemainingKg: 52000, fuelBurnedKg: 41000, windDeg: 270, windSpeedKt: 35, squawk: '5420', etaMin: 180 },
];

export const LIVE_FLIGHTS = INITIAL_LIVE_FLIGHTS;

/**
 * Updates aircraft telemetry dynamically on real-time clock tick
 */
export function advanceFlightTelemetry(flight) {
  let newProgress = flight.progressPct + 0.08;
  let newFuelBurned = flight.fuelBurnedKg + Math.round((flight.fuelFlowKgHr / 3600) * 1);
  let newFuelRemaining = Math.max(800, flight.fuelRemainingKg - Math.round((flight.fuelFlowKgHr / 3600) * 1));
  let newEta = Math.max(2, Math.round(flight.etaMin - 0.016));

  // Auto turn-around on completion
  if (newProgress >= 99) {
    newProgress = 2;
    const tempOrigin = flight.originIcao;
    return {
      ...flight,
      originIcao: flight.destIcao,
      destIcao: tempOrigin,
      progressPct: newProgress,
      fuelBurnedKg: 100,
      etaMin: Math.round(flight.etaMin * 1.5),
      status: 'Departed / Climbing',
    };
  }

  return {
    ...flight,
    progressPct: parseFloat(newProgress.toFixed(2)),
    fuelBurnedKg: newFuelBurned,
    fuelRemainingKg: newFuelRemaining,
    etaMin: newEta,
  };
}

export function getFlightCurrentCoordinates(flight) {
  const origin = getAirportByIcao(flight.originIcao);
  const dest = getAirportByIcao(flight.destIcao);
  if (!origin || !dest) return { lat: 20, lon: 77 };

  const fraction = flight.progressPct / 100;
  const lat = origin.lat + (dest.lat - origin.lat) * fraction;
  const lon = origin.lon + (dest.lon - origin.lon) * fraction;

  return { lat, lon, origin, dest };
}
