import React, { useState, useMemo, useEffect } from 'react';

/**
 * AeroFuel AI — Aircraft Fuel Optimization & Flight Planning Dashboard
 * Single-file standalone React deliverable with Live Flight Fleet Tracker.
 * Zero external package requirements; works directly in React/Claude artifact environments.
 */

// ==========================================
// 1. DATA LAYER (AIRCRAFT, AIRPORTS & LIVE FLIGHTS)
// ==========================================
const AIRPORTS = [
  { icao: 'VIDP', iata: 'DEL', name: 'Indira Gandhi Intl', city: 'Delhi', lat: 28.5665, lon: 77.1031, elevationFt: 777, defaultAlternate: 'VABB' },
  { icao: 'VABB', iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj Intl', city: 'Mumbai', lat: 19.0896, lon: 72.8656, elevationFt: 39, defaultAlternate: 'VOBL' },
  { icao: 'VOBL', iata: 'BLR', name: 'Kempegowda Intl', city: 'Bengaluru', lat: 13.1986, lon: 77.7066, elevationFt: 3000, defaultAlternate: 'VOMM' },
  { icao: 'VOMM', iata: 'MAA', name: 'Chennai Intl', city: 'Chennai', lat: 12.9941, lon: 80.1709, elevationFt: 52, defaultAlternate: 'VOBL' },
  { icao: 'VECC', iata: 'CCU', name: 'Netaji Subhash Chandra Bose Intl', city: 'Kolkata', lat: 22.6547, lon: 88.4467, elevationFt: 16, defaultAlternate: 'VIDP' },
  { icao: 'OMDB', iata: 'DXB', name: 'Dubai International', city: 'Dubai', lat: 25.2532, lon: 55.3657, elevationFt: 62, defaultAlternate: 'OMAA' },
  { icao: 'EGLL', iata: 'LHR', name: 'London Heathrow', city: 'London', lat: 51.4700, lon: -0.4543, elevationFt: 83, defaultAlternate: 'EGKK' },
  { icao: 'KJFK', iata: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', lat: 40.6413, lon: -73.7781, elevationFt: 13, defaultAlternate: 'KEWR' },
  { icao: 'WSSS', iata: 'SIN', name: 'Singapore Changi', city: 'Singapore', lat: 1.3644, lon: 103.9915, elevationFt: 22, defaultAlternate: 'WMKK' },
  { icao: 'RJTT', iata: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', lat: 35.5494, lon: 139.7798, elevationFt: 35, defaultAlternate: 'RJAA' }
];

const AIRCRAFT_PROFILES = [
  {
    id: 'a320neo',
    name: 'Airbus A320neo',
    type: 'Narrowbody Jet',
    engine: '2x CFM LEAP-1A26',
    seats: 180,
    oewKg: 44300,
    maxPayloadKg: 20000,
    mtowKg: 79000,
    mlwKg: 67400,
    maxFuelKg: 19100,
    cruiseSpeedKt: 450,
    optimumFL: 360,
    ceilingFL: 390,
    cruiseBurnKgHr: 2250,
    holdingBurnKgHr: 1950,
    taxiBurnKgHr: 560,
    reserveMin: 30,
    category: 'Jet',
    co2FactorKgPerKgFuel: 3.16,
  },
  {
    id: 'b737max8',
    name: 'Boeing 737 MAX 8',
    type: 'Narrowbody Jet',
    engine: '2x CFM LEAP-1B28',
    seats: 178,
    oewKg: 45070,
    maxPayloadKg: 20880,
    mtowKg: 82190,
    mlwKg: 69300,
    maxFuelKg: 20730,
    cruiseSpeedKt: 453,
    optimumFL: 370,
    ceilingFL: 410,
    cruiseBurnKgHr: 2280,
    holdingBurnKgHr: 2000,
    taxiBurnKgHr: 570,
    reserveMin: 30,
    category: 'Jet',
    co2FactorKgPerKgFuel: 3.16,
  },
  {
    id: 'b787_9',
    name: 'Boeing 787-9 Dreamliner',
    type: 'Widebody Jet',
    engine: '2x GEnx-1B74',
    seats: 296,
    oewKg: 128850,
    maxPayloadKg: 52500,
    mtowKg: 254000,
    mlwKg: 193000,
    maxFuelKg: 101450,
    cruiseSpeedKt: 488,
    optimumFL: 390,
    ceilingFL: 430,
    cruiseBurnKgHr: 5200,
    holdingBurnKgHr: 4400,
    taxiBurnKgHr: 1250,
    reserveMin: 30,
    category: 'Jet',
    co2FactorKgPerKgFuel: 3.16,
  },
  {
    id: 'atr72_600',
    name: 'ATR 72-600',
    type: 'Regional Turboprop',
    engine: '2x Pratt & Whitney PW127M',
    seats: 72,
    oewKg: 13311,
    maxPayloadKg: 7500,
    mtowKg: 23000,
    mlwKg: 22350,
    maxFuelKg: 5000,
    cruiseSpeedKt: 275,
    optimumFL: 180,
    ceilingFL: 250,
    cruiseBurnKgHr: 680,
    holdingBurnKgHr: 580,
    taxiBurnKgHr: 180,
    reserveMin: 45,
    category: 'Turboprop',
    co2FactorKgPerKgFuel: 3.16,
  }
];

const LIVE_FLIGHTS = [
  { flightNo: 'AF-320', airline: 'AeroFuel Express', aircraftId: 'a320neo', reg: 'VT-AFL', originIcao: 'VIDP', destIcao: 'VABB', altitudeFL: 360, groundSpeedKt: 462, progressPct: 45, fuelFlowKgHr: 2280, fuelRemainingKg: 6420, etaMin: 55 },
  { flightNo: 'AI-101', airline: 'Air India', aircraftId: 'b787_9', reg: 'VT-ANX', originIcao: 'VIDP', destIcao: 'KJFK', altitudeFL: 390, groundSpeedKt: 498, progressPct: 62, fuelFlowKgHr: 5120, fuelRemainingKg: 38400, etaMin: 310 },
  { flightNo: 'EK-500', airline: 'Emirates', aircraftId: 'b787_9', reg: 'A6-EXA', originIcao: 'OMDB', destIcao: 'EGLL', altitudeFL: 380, groundSpeedKt: 508, progressPct: 78, fuelFlowKgHr: 5400, fuelRemainingKg: 14200, etaMin: 85 },
  { flightNo: '6E-204', airline: 'IndiGo', aircraftId: 'b737max8', reg: 'VT-MAX', originIcao: 'VOBL', destIcao: 'VIDP', altitudeFL: 370, groundSpeedKt: 440, progressPct: 35, fuelFlowKgHr: 2240, fuelRemainingKg: 7800, etaMin: 88 },
  { flightNo: '9I-801', airline: 'Alliance Air', aircraftId: 'atr72_600', reg: 'VT-AIH', originIcao: 'VOMM', destIcao: 'VOBL', altitudeFL: 180, groundSpeedKt: 268, progressPct: 70, fuelFlowKgHr: 670, fuelRemainingKg: 1850, etaMin: 18 },
];

// ==========================================
// 2. CALCULATION ENGINE
// ==========================================
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(3440.065 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const y = Math.sin(dLon) * Math.cos(lat2 * DEG_TO_RAD);
  const x =
    Math.cos(lat1 * DEG_TO_RAD) * Math.sin(lat2 * DEG_TO_RAD) -
    Math.sin(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * Math.cos(dLon);
  return Math.round((Math.atan2(y, x) * RAD_TO_DEG + 360) % 360);
}

function decomposeWind(bearing, windDir, windSpeed) {
  const angleDiff = ((windDir - bearing + 180) % 360) - 180;
  const rad = angleDiff * DEG_TO_RAD;
  const longComp = windSpeed * Math.cos(rad);
  const latComp = windSpeed * Math.sin(rad);
  return {
    windDirection: windDir,
    windSpeedKt: windSpeed,
    tailwindKt: longComp > 0 ? Math.round(longComp) : 0,
    headwindKt: longComp < 0 ? Math.round(-longComp) : 0,
    crosswindKt: Math.round(Math.abs(latComp)),
    crosswindSide: latComp >= 0 ? 'Right' : 'Left',
  };
}

function computeFuelPlan(aircraft, inputs) {
  const {
    distanceNm,
    bearingDeg,
    windDirectionDeg = 280,
    windSpeedKt = 25,
    isaDevC = 0,
    payloadKg = 15000,
    taxiTimeMin = 18,
    contingencyPct = 0.05,
    alternateDistanceNm = 120,
    holdingTimeMin = 15,
    extraFuelKg = 300,
    selectedFlightLevel = aircraft.optimumFL,
  } = inputs;

  const wind = decomposeWind(bearingDeg, windDirectionDeg, windSpeedKt);
  const tas = aircraft.cruiseSpeedKt;
  const netWind = wind.tailwindKt - wind.headwindKt;
  const effectiveTAS = Math.sqrt(Math.max(0, Math.pow(tas, 2) - Math.pow(wind.crosswindKt, 2)));
  const groundSpeedKt = Math.max(120, Math.round(effectiveTAS + netWind));

  const cruiseHours = distanceNm / groundSpeedKt;
  const totalFlightTimeHours = cruiseHours + 0.15;
  const flightTimeMinutes = Math.round(totalFlightTimeHours * 60);

  const tempFactor = 1 + (isaDevC * 0.0015);
  const payloadFactor = 1 + (((payloadKg / aircraft.maxPayloadKg) - 0.5) * 0.08);
  const flDiff = Math.abs(selectedFlightLevel - aircraft.optimumFL) / 20;
  const altitudeFactor = 1 + (flDiff * 0.018);

  const effectiveBurnKgHr = aircraft.cruiseBurnKgHr * tempFactor * payloadFactor * altitudeFactor;

  const taxiFuel = Math.round((taxiTimeMin / 60) * aircraft.taxiBurnKgHr);
  const tripFuel = Math.round(totalFlightTimeHours * effectiveBurnKgHr);
  const fiveMinHolding = Math.round((5 / 60) * aircraft.holdingBurnKgHr);
  const contingencyFuel = Math.max(fiveMinHolding, Math.round(tripFuel * contingencyPct));
  const alternateFuel = Math.round((alternateDistanceNm / (aircraft.cruiseSpeedKt * 0.9)) * aircraft.cruiseBurnKgHr);
  const finalReserveFuel = Math.round((aircraft.reserveMin / 60) * aircraft.holdingBurnKgHr);
  const holdingFuel = Math.round((holdingTimeMin / 60) * aircraft.holdingBurnKgHr);
  const extraFuel = Math.round(extraFuelKg);

  const minRequiredFuel = taxiFuel + tripFuel + contingencyFuel + alternateFuel + finalReserveFuel;
  const blockFuel = minRequiredFuel + holdingFuel + extraFuel;
  const takeoffFuel = blockFuel - taxiFuel;
  const landingFuel = takeoffFuel - tripFuel;

  const takeoffWeight = aircraft.oewKg + payloadKg + takeoffFuel;
  const landingWeight = takeoffWeight - tripFuel;
  const co2TripKg = Math.round(tripFuel * aircraft.co2FactorKgPerKgFuel);

  return {
    distanceNm,
    bearingDeg,
    wind,
    tas,
    groundSpeedKt,
    flightTimeMinutes,
    flightTimeFormatted: `${Math.floor(flightTimeMinutes / 60)}h ${flightTimeMinutes % 60}m`,
    effectiveCruiseBurnRateKgHr: Math.round(effectiveBurnKgHr),
    fuelChain: {
      taxi: taxiFuel,
      trip: tripFuel,
      contingency: contingencyFuel,
      alternate: alternateFuel,
      finalReserve: finalReserveFuel,
      holding: holdingFuel,
      extra: extraFuel,
      totalMinRequired: minRequiredFuel,
      blockFuel,
      takeoffFuel,
      landingFuel,
    },
    weights: {
      takeoffWeightKg: takeoffWeight,
      estimatedLandingWeightKg: landingWeight,
      payloadKg,
    },
    emissions: {
      co2TripKg,
      co2TripTonnes: (co2TripKg / 1000).toFixed(2),
    },
    parameters: {
      selectedFlightLevel,
      isaDevC,
      taxiTimeMin,
      holdingTimeMin,
      alternateDistanceNm,
      contingencyPct: contingencyPct * 100,
    }
  };
}

function computeOptimizerScenarios(aircraft, baseInputs) {
  const baseFL = aircraft.optimumFL;
  const candidateFLs = [baseFL - 40, baseFL - 20, baseFL, baseFL + 20].filter(fl => fl >= 140 && fl <= aircraft.ceilingFL);

  const scenarios = candidateFLs.map((fl) => {
    const plan = computeFuelPlan(aircraft, { ...baseInputs, selectedFlightLevel: fl });
    return {
      fl,
      flightLevelStr: `FL${fl}`,
      tripFuelKg: plan.fuelChain.trip,
      blockFuelKg: plan.fuelChain.blockFuel,
      flightTimeFormatted: plan.flightTimeFormatted,
      flightTimeMin: plan.flightTimeMinutes,
      estimatedCostUsd: Math.round(plan.fuelChain.blockFuel * 0.85),
    };
  });

  const best = [...scenarios].sort((a, b) => a.tripFuelKg - b.tripFuelKg)[0];
  const current = scenarios.find(s => s.fl === baseInputs.selectedFlightLevel) || scenarios[0];

  return {
    scenarios: scenarios.map(s => ({
      ...s,
      isRecommended: s.fl === best.fl,
      fuelDeltaKg: s.tripFuelKg - current.tripFuelKg,
    })),
    bestScenario: best,
    savingsKg: Math.max(0, current.tripFuelKg - best.tripFuelKg),
    savingsUsd: Math.max(0, Math.round((current.tripFuelKg - best.tripFuelKg) * 0.85)),
  };
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function AeroFuelAI() {
  const [aircraft, setAircraft] = useState(AIRCRAFT_PROFILES[0]);
  const [origin, setOrigin] = useState(AIRPORTS[0]); // VIDP
  const [destination, setDestination] = useState(AIRPORTS[1]); // VABB
  const [flightNumber, setFlightNumber] = useState('AF-320');
  const [activeTab, setActiveTab] = useState('radar');
  const [showOFP, setShowOFP] = useState(false);
  const [utcTime, setUtcTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [inputs, setInputs] = useState({
    windDirectionDeg: 280,
    windSpeedKt: 25,
    isaDevC: 2,
    payloadKg: 15000,
    taxiTimeMin: 18,
    contingencyPct: 0.05,
    alternateDistanceNm: 120,
    holdingTimeMin: 15,
    extraFuelKg: 300,
    selectedFlightLevel: 360,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setUtcTime(d.toUTCString().slice(17, 25) + ' Z');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const routeGeo = useMemo(() => {
    return {
      distanceNm: calculateDistance(origin.lat, origin.lon, destination.lat, destination.lon),
      bearingDeg: calculateBearing(origin.lat, origin.lon, destination.lat, destination.lon),
    };
  }, [origin, destination]);

  const plan = useMemo(() => {
    return computeFuelPlan(aircraft, {
      ...inputs,
      distanceNm: routeGeo.distanceNm,
      bearingDeg: routeGeo.bearingDeg,
    });
  }, [aircraft, inputs, routeGeo]);

  const optimizer = useMemo(() => {
    return computeOptimizerScenarios(aircraft, {
      ...inputs,
      distanceNm: routeGeo.distanceNm,
      bearingDeg: routeGeo.bearingDeg,
    });
  }, [aircraft, inputs, routeGeo]);

  const handleSelectFlight = (flt) => {
    const orig = AIRPORTS.find(a => a.icao === flt.originIcao) || origin;
    const dest = AIRPORTS.find(a => a.icao === flt.destIcao) || destination;
    const ac = AIRCRAFT_PROFILES.find(a => a.id === flt.aircraftId) || aircraft;
    setOrigin(orig);
    setDestination(dest);
    setAircraft(ac);
    setFlightNumber(flt.flightNo);
    setInputs(prev => ({
      ...prev,
      selectedFlightLevel: flt.altitudeFL,
      payloadKg: Math.round(ac.maxPayloadKg * 0.75),
    }));
    setActiveTab('optimizer');
  };

  const filteredFlights = LIVE_FLIGHTS.filter(f => 
    !searchQuery || 
    f.flightNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.reg.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.airline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0a0f1d]/90 backdrop-blur sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-bold text-black font-mono">
              AF
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider font-mono">
                AERO<span className="text-cyan-400">FUEL</span> AI
              </span>
              <span className="ml-2 text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-mono">
                AOC 2.0
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="text-cyan-400 font-bold">{flightNumber}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">{origin.icao} → {destination.icao}</span>
            <span className="text-slate-600">|</span>
            <span className="text-sky-300">{aircraft.name}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300">{utcTime || '12:00:00 Z'}</span>
          </div>

          <button
            onClick={() => setShowOFP(true)}
            className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg hover:bg-cyan-500/20 font-mono transition"
          >
            Dispatch Release (OFP)
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto flex space-x-2 mt-3 pt-2 border-t border-slate-800/60 overflow-x-auto text-xs font-medium">
          {[
            { id: 'radar', label: 'Live Radar & Fleet', badge: 'LIVE' },
            { id: 'setup', label: 'Flight Setup' },
            { id: 'fuel', label: 'Fuel Chain' },
            { id: 'optimizer', label: 'AI Optimizer' },
            { id: 'fleet', label: 'Fleet Benchmark' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1 py-0.2 text-[9px] font-bold bg-emerald-500/30 text-emerald-300 rounded border border-emerald-400/40">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Tab 0: Live Radar & Fleet Search */}
        {activeTab === 'radar' && (
          <div className="space-y-4">
            <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div>
                <h2 className="text-sm font-bold font-mono text-white">Live Commercial Flights Telemetry Feed</h2>
                <p className="text-xs text-slate-400">Select any flight to inspect telemetry or load into the fuel optimizer.</p>
              </div>
              <input
                type="text"
                placeholder="Search flight # or reg..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white w-full sm:w-64"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFlights.map(flt => (
                <div key={flt.flightNo} className="bg-[#0c1424] border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl space-y-3 font-mono text-xs transition">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-base text-cyan-300">{flt.flightNo}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                      {flt.progressPct}% ENROUTE
                    </span>
                  </div>
                  <div className="text-slate-300">
                    <p className="font-bold text-white">{flt.originIcao} → {flt.destIcao}</p>
                    <p className="text-[11px] text-slate-400">{flt.airline} • {flt.reg}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2 rounded border border-slate-800">
                    <div>ALT: <strong className="text-cyan-400">FL{flt.altitudeFL}</strong></div>
                    <div>GS: <strong className="text-emerald-400">{flt.groundSpeedKt} KT</strong></div>
                    <div>BURN: <strong className="text-amber-400">{flt.fuelFlowKgHr} kg/h</strong></div>
                    <div>ETA: <strong className="text-slate-200">~{flt.etaMin}m</strong></div>
                  </div>
                  <button
                    onClick={() => handleSelectFlight(flt)}
                    className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 py-2 rounded-lg font-bold text-xs transition"
                  >
                    Select & Optimize Flight
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 1: Setup */}
        {activeTab === 'setup' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">Aircraft & Route</h3>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Aircraft</label>
                <select
                  value={aircraft.id}
                  onChange={e => {
                    const sel = AIRCRAFT_PROFILES.find(a => a.id === e.target.value);
                    if (sel) {
                      setAircraft(sel);
                      setInputs(prev => ({ ...prev, selectedFlightLevel: sel.optimumFL }));
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200"
                >
                  {AIRCRAFT_PROFILES.map(a => <option key={a.id} value={a.id}>{a.name} ({a.engine})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Origin</label>
                  <select
                    value={origin.icao}
                    onChange={e => {
                      const sel = AIRPORTS.find(a => a.icao === e.target.value);
                      if (sel) setOrigin(sel);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200"
                  >
                    {AIRPORTS.map(a => <option key={a.icao} value={a.icao}>{a.icao} - {a.city}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Destination</label>
                  <select
                    value={destination.icao}
                    onChange={e => {
                      const sel = AIRPORTS.find(a => a.icao === e.target.value);
                      if (sel) setDestination(sel);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200"
                  >
                    {AIRPORTS.map(a => <option key={a.icao} value={a.icao}>{a.icao} - {a.city}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 flex justify-between font-mono mb-1">
                  <span>Payload:</span>
                  <span className="text-amber-400 font-bold">{inputs.payloadKg.toLocaleString()} kg</span>
                </label>
                <input
                  type="range"
                  min={2000}
                  max={aircraft.maxPayloadKg}
                  step={500}
                  value={inputs.payloadKg}
                  onChange={e => setInputs(prev => ({ ...prev, payloadKg: Number(e.target.value) }))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>

            <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">Atmosphere & Altitude</h3>
              <div>
                <label className="text-xs text-slate-400 flex justify-between font-mono mb-1">
                  <span>Planned Flight Level:</span>
                  <span className="text-cyan-400 font-bold">FL{inputs.selectedFlightLevel}</span>
                </label>
                <input
                  type="range"
                  min={Math.max(140, aircraft.optimumFL - 80)}
                  max={aircraft.ceilingFL}
                  step={10}
                  value={inputs.selectedFlightLevel}
                  onChange={e => setInputs(prev => ({ ...prev, selectedFlightLevel: Number(e.target.value) }))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Wind Speed ({inputs.windSpeedKt} KT)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={inputs.windSpeedKt}
                    onChange={e => setInputs(prev => ({ ...prev, windSpeedKt: Number(e.target.value) }))}
                    className="w-full accent-sky-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">ISA Dev ({inputs.isaDevC >= 0 ? `+${inputs.isaDevC}` : inputs.isaDevC}°C)</label>
                  <input
                    type="range"
                    min={-20}
                    max={20}
                    step={1}
                    value={inputs.isaDevC}
                    onChange={e => setInputs(prev => ({ ...prev, isaDevC: Number(e.target.value) }))}
                    className="w-full accent-rose-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Fuel Chain */}
        {activeTab === 'fuel' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0c1424] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">
                ICAO Fuel Chain Breakdown (Total: {plan.fuelChain.blockFuel.toLocaleString()} kg)
              </h3>
              
              <div className="space-y-2 font-mono text-xs">
                {[
                  { name: 'Taxi', kg: plan.fuelChain.taxi, color: '#64748b' },
                  { name: 'Trip', kg: plan.fuelChain.trip, color: '#0284c7' },
                  { name: 'Contingency', kg: plan.fuelChain.contingency, color: '#06b6d4' },
                  { name: 'Alternate', kg: plan.fuelChain.alternate, color: '#38bdf8' },
                  { name: 'Final Reserve', kg: plan.fuelChain.finalReserve, color: '#eab308' },
                  { name: 'Holding', kg: plan.fuelChain.holding, color: '#f97316' },
                  { name: 'Extra', kg: plan.fuelChain.extra, color: '#a855f7' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-white">{item.kg.toLocaleString()} kg</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Weight & Capacity</h3>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">TAKEOFF WEIGHT (TOW)</span>
                <span className="text-lg font-bold text-emerald-400">{plan.weights.takeoffWeightKg.toLocaleString()} kg</span>
                <span className="text-[10px] text-slate-500 block">MTOW: {aircraft.mtowKg.toLocaleString()} kg</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">ESTIMATED LANDING WEIGHT</span>
                <span className="text-lg font-bold text-sky-400">{plan.weights.estimatedLandingWeightKg.toLocaleString()} kg</span>
                <span className="text-[10px] text-slate-500 block">MLW: {aircraft.mlwKg.toLocaleString()} kg</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">TRIP CO2 EMISSIONS</span>
                <span className="text-lg font-bold text-amber-400">{plan.emissions.co2TripTonnes} Tonnes</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI Optimizer */}
        {activeTab === 'optimizer' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-800 p-5 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">AI Recommendation</span>
                <h3 className="text-lg font-bold text-white">Recommended Cruise Level: FL{optimizer.bestScenario.fl}</h3>
                <p className="text-xs text-slate-300">Lowest modeled trip burn and optimal TAS groundspeed resolution.</p>
              </div>
              {inputs.selectedFlightLevel !== optimizer.bestScenario.fl && (
                <button
                  onClick={() => setInputs(prev => ({ ...prev, selectedFlightLevel: optimizer.bestScenario.fl }))}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-mono font-bold text-xs"
                >
                  Apply FL{optimizer.bestScenario.fl}
                </button>
              )}
            </div>

            <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2">Altitude</th>
                    <th className="py-2">Trip Fuel</th>
                    <th className="py-2">ETE</th>
                    <th className="py-2">Delta</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {optimizer.scenarios.map(sc => (
                    <tr key={sc.fl} className={sc.fl === inputs.selectedFlightLevel ? 'text-cyan-300 font-bold' : 'text-slate-300'}>
                      <td className="py-2.5">{sc.flightLevelStr}</td>
                      <td className="py-2.5">{sc.tripFuelKg.toLocaleString()} kg</td>
                      <td className="py-2.5">{sc.flightTimeFormatted}</td>
                      <td className="py-2.5">{sc.fuelDeltaKg > 0 ? `+${sc.fuelDeltaKg} kg` : (sc.fuelDeltaKg < 0 ? `${sc.fuelDeltaKg} kg` : '0 kg')}</td>
                      <td className="py-2.5 text-right">
                        {sc.isRecommended && <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[10px]">OPTIMAL</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Fleet Benchmark */}
        {activeTab === 'fleet' && (
          <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 overflow-x-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300 mb-3">
              Fleet Aircraft Performance Benchmark ({origin.icao} → {destination.icao})
            </h3>
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2">Airframe</th>
                  <th className="py-2">Seats</th>
                  <th className="py-2">Block Fuel</th>
                  <th className="py-2">Burn / Seat</th>
                  <th className="py-2 text-right">Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {AIRCRAFT_PROFILES.map(ac => {
                  const p = computeFuelPlan(ac, { ...inputs, distanceNm: routeGeo.distanceNm, bearingDeg: routeGeo.bearingDeg });
                  return (
                    <tr key={ac.id} className={ac.id === aircraft.id ? 'text-cyan-300 font-bold' : 'text-slate-300'}>
                      <td className="py-2.5">{ac.name}</td>
                      <td className="py-2.5">{ac.seats} pax</td>
                      <td className="py-2.5">{p.fuelChain.blockFuel.toLocaleString()} kg</td>
                      <td className="py-2.5">{Math.round(p.fuelChain.trip / ac.seats)} kg / seat</td>
                      <td className="py-2.5 text-right">
                        {ac.id === aircraft.id ? (
                          <span className="text-cyan-400">Active</span>
                        ) : (
                          <button
                            onClick={() => setAircraft(ac)}
                            className="bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-[10px] text-white"
                          >
                            Switch
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* OFP Modal */}
      {showOFP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#0b1322] border border-slate-700 rounded-xl w-full max-w-2xl max-h-[85vh] p-5 flex flex-col font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
              <span className="font-bold text-white">OPERATIONAL FLIGHT PLAN (OFP)</span>
              <button onClick={() => setShowOFP(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <pre className="flex-1 bg-slate-950 p-4 rounded text-emerald-400 overflow-y-auto leading-relaxed">
{`==================================================
        AEROFUEL AI — FLIGHT RELEASE (OFP)
==================================================
FLIGHT: ${flightNumber}
ROUTE: ${origin.icao} (${origin.city}) -> ${destination.icao} (${destination.city})
AIRCRAFT: ${aircraft.name} (${aircraft.engine})
DISTANCE: ${routeGeo.distanceNm} NM | TRACK: ${routeGeo.bearingDeg}°
CRUISE: FL${plan.parameters.selectedFlightLevel} | GS: ${plan.groundSpeedKt} KT
ETE: ${plan.flightTimeFormatted}

FUEL BREAKDOWN (KG):
  TAXI:         ${plan.fuelChain.taxi} KG
  TRIP FUEL:    ${plan.fuelChain.trip} KG
  CONTINGENCY:  ${plan.fuelChain.contingency} KG
  ALTERNATE:    ${plan.fuelChain.alternate} KG
  FINAL RSV:    ${plan.fuelChain.finalReserve} KG
  HOLDING:      ${plan.fuelChain.holding} KG
  EXTRA:        ${plan.fuelChain.extra} KG
--------------------------------------------------
  TOTAL BLOCK:  ${plan.fuelChain.blockFuel} KG
==================================================
TAKEOFF WEIGHT: ${plan.weights.takeoffWeightKg} KG (MTOW: ${aircraft.mtowKg} KG)
LANDING WEIGHT: ${plan.weights.estimatedLandingWeightKg} KG (MLW: ${aircraft.mlwKg} KG)
TRIP CO2:       ${plan.emissions.co2TripTonnes} TONNES

*** DEMO SIMULATION ONLY — NOT FOR REAL FLIGHT ***`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
