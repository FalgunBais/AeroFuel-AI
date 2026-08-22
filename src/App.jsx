import React, { useState, useMemo } from 'react';
import { AIRPORTS, getAirportByIcao } from './data/airports';
import { AIRCRAFT_PROFILES, getAircraftById } from './data/aircraft';
import {
  calculateGreatCircleDistance,
  calculateInitialBearing,
  computeFuelPlan,
  computeAlerts,
} from './engine/fuelCalculations';

import AOCHeader from './components/AOCHeader';
import RouteVisualizer from './components/RouteVisualizer';
import LiveGlobeTracker from './components/LiveGlobeTracker';
import FlightSetupTab from './components/FlightSetupTab';
import FuelChainTab from './components/FuelChainTab';
import OptimizerTab from './components/OptimizerTab';
import WhatIfSimulator from './components/WhatIfSimulator';
import FleetComparisonTab from './components/FleetComparisonTab';
import OFPReleaseModal from './components/OFPReleaseModal';

export default function App() {
  // State: Selected Aircraft & City Pair (Default VIDP -> VABB)
  const [aircraft, setAircraft] = useState(AIRCRAFT_PROFILES[0]); // A320neo
  const [origin, setOrigin] = useState(AIRPORTS[0]); // VIDP (Delhi)
  const [destination, setDestination] = useState(AIRPORTS[1]); // VABB (Mumbai)
  const [flightNumber, setFlightNumber] = useState('AF-320');
  const [activeTab, setActiveTab] = useState('live-radar'); // Open Live Globe by default
  const [isOFPOpen, setIsOFPOpen] = useState(false);

  // Flight parameters
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

  // Calculate Great Circle Distance & Bearing dynamically
  const routeGeometry = useMemo(() => {
    const dist = calculateGreatCircleDistance(origin.lat, origin.lon, destination.lat, destination.lon);
    const brg = calculateInitialBearing(origin.lat, origin.lon, destination.lat, destination.lon);
    return { distanceNm: Math.max(50, dist), bearingDeg: brg };
  }, [origin, destination]);

  // Compute Fuel Plan
  const plan = useMemo(() => {
    return computeFuelPlan(aircraft, {
      ...inputs,
      distanceNm: routeGeometry.distanceNm,
      bearingDeg: routeGeometry.bearingDeg,
    });
  }, [aircraft, inputs, routeGeometry]);

  // Compute Alerts
  const alerts = useMemo(() => {
    return computeAlerts(plan, aircraft);
  }, [plan, aircraft]);

  // Load selected live flight directly into the AeroFuel engine
  const handleSelectFlightForDispatch = (flight) => {
    const orig = getAirportByIcao(flight.originIcao) || origin;
    const dest = getAirportByIcao(flight.destIcao) || destination;
    const ac = getAircraftById(flight.aircraftId) || aircraft;

    setOrigin(orig);
    setDestination(dest);
    setAircraft(ac);
    setFlightNumber(flight.flightNo);
    setInputs((prev) => ({
      ...prev,
      selectedFlightLevel: flight.altitudeFL,
      windDirectionDeg: flight.windDeg,
      windSpeedKt: flight.windSpeedKt,
      payloadKg: Math.round(ac.maxPayloadKg * 0.75),
    }));

    // Switch to Optimizer tab
    setActiveTab('optimizer');
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* AOC Top Navigation Header */}
      <AOCHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenOFP={() => setIsOFPOpen(true)}
        flightNumber={flightNumber}
        origin={origin}
        destination={destination}
        aircraft={aircraft}
        plan={plan}
      />

      {/* Main Tactical Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tactical Route Visualizer & Wind Vector Bar (Visible on non-radar tabs) */}
        {activeTab !== 'live-radar' && (
          <RouteVisualizer
            origin={origin}
            destination={destination}
            plan={plan}
            aircraft={aircraft}
          />
        )}

        {/* Tab Views */}
        <div className="transition-all duration-200">
          {activeTab === 'live-radar' && (
            <LiveGlobeTracker
              onSelectFlightForDispatch={handleSelectFlightForDispatch}
            />
          )}

          {activeTab === 'flight-setup' && (
            <FlightSetupTab
              aircraft={aircraft}
              setAircraft={setAircraft}
              origin={origin}
              setOrigin={setOrigin}
              destination={destination}
              setDestination={setDestination}
              inputs={{ ...inputs, distanceNm: routeGeometry.distanceNm }}
              setInputs={setInputs}
              plan={plan}
              alerts={alerts}
            />
          )}

          {activeTab === 'fuel-plan' && (
            <FuelChainTab
              plan={plan}
              aircraft={aircraft}
            />
          )}

          {activeTab === 'optimizer' && (
            <OptimizerTab
              plan={plan}
              aircraft={aircraft}
              inputs={{
                ...inputs,
                distanceNm: routeGeometry.distanceNm,
                bearingDeg: routeGeometry.bearingDeg,
              }}
              setInputs={setInputs}
            />
          )}

          {activeTab === 'what-if' && (
            <WhatIfSimulator
              basePlan={plan}
              aircraft={aircraft}
              inputs={{
                ...inputs,
                distanceNm: routeGeometry.distanceNm,
                bearingDeg: routeGeometry.bearingDeg,
              }}
            />
          )}

          {activeTab === 'fleet' && (
            <FleetComparisonTab
              inputs={{
                ...inputs,
                distanceNm: routeGeometry.distanceNm,
                bearingDeg: routeGeometry.bearingDeg,
              }}
              origin={origin}
              destination={destination}
              currentAircraft={aircraft}
              setAircraft={setAircraft}
            />
          )}
        </div>
      </main>

      {/* Footer & Aviation Disclaimer */}
      <footer className="border-t border-slate-800/80 bg-[#060a12] py-6 mt-12 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400 font-semibold">AeroFuel AI 3D Radar & Engine Online</span>
            <span>•</span>
            <span>Real-Time Fleet & Geodesic Navigation</span>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-500 max-w-xl">
            Educational & portfolio demonstration. Not certified for real-world flight planning or operational dispatch.
          </div>
        </div>
      </footer>

      {/* OFP Dispatch Release Modal */}
      <OFPReleaseModal
        isOpen={isOFPOpen}
        onClose={() => setIsOFPOpen(false)}
        plan={plan}
        aircraft={aircraft}
        origin={origin}
        destination={destination}
        flightNumber={flightNumber}
      />
    </div>
  );
}
