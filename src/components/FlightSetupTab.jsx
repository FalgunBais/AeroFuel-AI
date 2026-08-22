import React from 'react';
import { Plane, MapPin, Gauge, Wind, Thermometer, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AIRPORTS } from '../data/airports';
import { AIRCRAFT_PROFILES } from '../data/aircraft';

export default function FlightSetupTab({
  aircraft,
  setAircraft,
  origin,
  setOrigin,
  destination,
  setDestination,
  inputs,
  setInputs,
  plan,
  alerts
}) {
  const handleAirportSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Alerts if any */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex items-start space-x-3 text-xs font-mono ${
                alert.type === 'danger'
                  ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                  : alert.type === 'warning'
                  ? 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                  : 'bg-cyan-950/40 border-cyan-800/80 text-cyan-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">{alert.title}: </strong>
                <span>{alert.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid: Route Selection & Aircraft Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Route & Aircraft Selection (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Aircraft Selection Card */}
          <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Plane className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Aircraft Airframe & Model
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                {aircraft.category}
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs text-slate-400">Select Operating Fleet Aircraft</label>
              <select
                value={aircraft.id}
                onChange={(e) => {
                  const sel = AIRCRAFT_PROFILES.find((a) => a.id === e.target.value);
                  if (sel) {
                    setAircraft(sel);
                    setInputs((prev) => ({
                      ...prev,
                      selectedFlightLevel: sel.optimumFL,
                      payloadKg: Math.round(sel.maxPayloadKg * 0.75),
                    }));
                  }
                }}
                className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {AIRCRAFT_PROFILES.map((ac) => (
                  <option key={ac.id} value={ac.id}>
                    {ac.name} ({ac.type} • {ac.engine})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">MTOW Limit</span>
                  <span className="text-slate-200 font-bold">{aircraft.mtowKg.toLocaleString()} kg</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Max Fuel Cap</span>
                  <span className="text-cyan-300 font-bold">{aircraft.maxFuelKg.toLocaleString()} kg</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">TAS Cruise</span>
                  <span className="text-slate-200 font-bold">{aircraft.cruiseSpeedKt} KT (FL{aircraft.optimumFL})</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Base Cruise Burn</span>
                  <span className="text-emerald-300 font-bold">{aircraft.cruiseBurnKgHr.toLocaleString()} kg/hr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Route Origin & Destination Card */}
          <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  City Pair & Route Navigation
                </h3>
              </div>
              <button
                onClick={handleAirportSwap}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-800/40 transition-all font-mono"
              >
                ⇄ Swap Pair
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Origin (DEP)</label>
                <select
                  value={origin.icao}
                  onChange={(e) => {
                    const sel = AIRPORTS.find((a) => a.icao === e.target.value);
                    if (sel) setOrigin(sel);
                  }}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {AIRPORTS.map((apt) => (
                    <option key={apt.icao} value={apt.icao}>
                      {apt.icao} ({apt.iata}) - {apt.city}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">Elev: {origin.elevationFt} ft</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Destination (ARR)</label>
                <select
                  value={destination.icao}
                  onChange={(e) => {
                    const sel = AIRPORTS.find((a) => a.icao === e.target.value);
                    if (sel) setDestination(sel);
                  }}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {AIRPORTS.map((apt) => (
                    <option key={apt.icao} value={apt.icao}>
                      {apt.icao} ({apt.iata}) - {apt.city}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">Elev: {destination.elevationFt} ft</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase mb-2 font-mono">Popular City Pairs</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { from: 'VIDP', to: 'VABB', label: 'DEL-BOM (Metropolis)' },
                  { from: 'VOBL', to: 'VIDP', label: 'BLR-DEL (Trunk)' },
                  { from: 'OMDB', to: 'EGLL', label: 'DXB-LHR (Long Haul)' },
                  { from: 'KJFK', to: 'EGLL', label: 'JFK-LHR (Transatlantic)' },
                ].map((pair, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const dep = AIRPORTS.find((a) => a.icao === pair.from);
                      const arr = AIRPORTS.find((a) => a.icao === pair.to);
                      if (dep && arr) {
                        setOrigin(dep);
                        setDestination(arr);
                      }
                    }}
                    className="text-[10px] px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono transition-all"
                  >
                    {pair.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tactical Parameters & Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Operational & Atmospheric Parameters
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Dynamic Dispatch Model</span>
            </div>

            {/* Slider 1: Cruise Flight Level */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300 flex items-center space-x-1.5">
                  <Plane className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Planned Cruise Level</span>
                </span>
                <span className="text-cyan-300 font-bold">
                  FL{inputs.selectedFlightLevel} ({(inputs.selectedFlightLevel * 100).toLocaleString()} ft)
                </span>
              </div>
              <input
                type="range"
                min={Math.max(140, aircraft.optimumFL - 80)}
                max={aircraft.ceilingFL}
                step={10}
                value={inputs.selectedFlightLevel}
                onChange={(e) => handleInputChange('selectedFlightLevel', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Min: FL{Math.max(140, aircraft.optimumFL - 80)}</span>
                <span className="text-emerald-400">Optimum: FL{aircraft.optimumFL}</span>
                <span>Max Ceiling: FL{aircraft.ceilingFL}</span>
              </div>
            </div>

            {/* Slider 2: Payload Weight */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Payload Weight (Passengers + Cargo)</span>
                <span className="text-amber-300 font-bold">
                  {inputs.payloadKg.toLocaleString()} kg{' '}
                  <span className="text-slate-500 font-normal">
                    ({Math.round((inputs.payloadKg / aircraft.maxPayloadKg) * 100)}% Max)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={aircraft.maxPayloadKg}
                step={500}
                value={inputs.payloadKg}
                onChange={(e) => handleInputChange('payloadKg', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Light (2,000 kg)</span>
                <span>Max Structural: {aircraft.maxPayloadKg.toLocaleString()} kg</span>
              </div>
            </div>

            {/* Dual Column: Wind Speed & Direction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300 flex items-center space-x-1">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    <span>Wind Direction</span>
                  </span>
                  <span className="text-sky-300 font-bold">{inputs.windDirectionDeg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={350}
                  step={10}
                  value={inputs.windDirectionDeg}
                  onChange={(e) => handleInputChange('windDirectionDeg', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300 flex items-center space-x-1">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    <span>Wind Speed</span>
                  </span>
                  <span className="text-sky-300 font-bold">{inputs.windSpeedKt} KT</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={120}
                  step={5}
                  value={inputs.windSpeedKt}
                  onChange={(e) => handleInputChange('windSpeedKt', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>
            </div>

            {/* Dual Column: Temperature ISA Deviation & Taxi Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300 flex items-center space-x-1">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                    <span>ISA Temperature Dev</span>
                  </span>
                  <span className="text-rose-300 font-bold">
                    {inputs.isaDevC >= 0 ? `+${inputs.isaDevC}` : inputs.isaDevC}°C
                  </span>
                </div>
                <input
                  type="range"
                  min={-20}
                  max={25}
                  step={1}
                  value={inputs.isaDevC}
                  onChange={(e) => handleInputChange('isaDevC', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Taxi Out Time</span>
                  </span>
                  <span className="text-slate-200 font-bold">{inputs.taxiTimeMin} min</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  step={1}
                  value={inputs.taxiTimeMin}
                  onChange={(e) => handleInputChange('taxiTimeMin', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
                />
              </div>
            </div>

            {/* Holding Time & Extra Fuel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">Planned Holding</span>
                  <span className="text-amber-300 font-bold">{inputs.holdingTimeMin} min</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={5}
                  value={inputs.holdingTimeMin}
                  onChange={(e) => handleInputChange('holdingTimeMin', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">Dispatcher Extra Fuel</span>
                  <span className="text-cyan-300 font-bold">{inputs.extraFuelKg} kg</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3000}
                  step={100}
                  value={inputs.extraFuelKg}
                  onChange={(e) => handleInputChange('extraFuelKg', e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
