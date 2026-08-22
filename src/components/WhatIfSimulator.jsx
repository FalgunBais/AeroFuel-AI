import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownRight, Fuel, Clock, Scale } from 'lucide-react';
import { computeFuelPlan } from '../engine/fuelCalculations';

export default function WhatIfSimulator({ basePlan, aircraft, inputs }) {
  const [simWindSpeedDelta, setSimWindSpeedDelta] = useState(0); // -40 to +40 KT
  const [simHoldingDeltaMin, setSimHoldingDeltaMin] = useState(0); // 0 to 45 min
  const [simTaxiDeltaMin, setSimTaxiDeltaMin] = useState(0); // 0 to 30 min
  const [simPayloadDeltaKg, setSimPayloadDeltaKg] = useState(0); // -5000 to +5000 kg

  // Compute simulated plan
  const simInputs = {
    ...inputs,
    windSpeedKt: Math.max(0, inputs.windSpeedKt + simWindSpeedDelta),
    holdingTimeMin: inputs.holdingTimeMin + simHoldingDeltaMin,
    taxiTimeMin: inputs.taxiTimeMin + simTaxiDeltaMin,
    payloadKg: Math.min(aircraft.maxPayloadKg, Math.max(1000, inputs.payloadKg + simPayloadDeltaKg)),
  };

  const simPlan = computeFuelPlan(aircraft, simInputs);

  const fuelDeltaKg = simPlan.fuelChain.blockFuel - basePlan.fuelChain.blockFuel;
  const timeDeltaMin = simPlan.flightTimeMinutes - basePlan.flightTimeMinutes;
  const towDeltaKg = simPlan.weights.takeoffWeightKg - basePlan.weights.takeoffWeightKg;

  const handleReset = () => {
    setSimWindSpeedDelta(0);
    setSimHoldingDeltaMin(0);
    setSimTaxiDeltaMin(0);
    setSimPayloadDeltaKg(0);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
              Operational What-If & Sensitivity Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate real-time operational disruptions (slot delays, holding patterns, payload surges, headwind changes).
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Disruptions</span>
        </button>
      </div>

      {/* Delta KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        {/* Block Fuel Delta */}
        <div className={`p-4 rounded-xl border shadow-lg ${
          fuelDeltaKg > 0 ? 'bg-rose-950/30 border-rose-800/60' : (fuelDeltaKg < 0 ? 'bg-emerald-950/30 border-emerald-800/60' : 'bg-[#0c1424] border-slate-800')
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase">Block Fuel Impact</span>
            <Fuel className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              {simPlan.fuelChain.blockFuel.toLocaleString()} kg
            </span>
            <span className={`text-xs font-bold ${fuelDeltaKg > 0 ? 'text-rose-400' : (fuelDeltaKg < 0 ? 'text-emerald-400' : 'text-slate-400')}`}>
              {fuelDeltaKg > 0 ? `+${fuelDeltaKg.toLocaleString()} kg` : (fuelDeltaKg < 0 ? `${fuelDeltaKg.toLocaleString()} kg` : '0 kg')}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Baseline: {basePlan.fuelChain.blockFuel.toLocaleString()} kg</span>
        </div>

        {/* Flight Time Delta */}
        <div className={`p-4 rounded-xl border shadow-lg ${
          timeDeltaMin > 0 ? 'bg-amber-950/30 border-amber-800/60' : (timeDeltaMin < 0 ? 'bg-emerald-950/30 border-emerald-800/60' : 'bg-[#0c1424] border-slate-800')
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase">Flight Duration (ETE)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              {simPlan.flightTimeFormatted}
            </span>
            <span className={`text-xs font-bold ${timeDeltaMin > 0 ? 'text-rose-400' : (timeDeltaMin < 0 ? 'text-emerald-400' : 'text-slate-400')}`}>
              {timeDeltaMin > 0 ? `+${timeDeltaMin}m` : (timeDeltaMin < 0 ? `${timeDeltaMin}m` : '0m')}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Baseline: {basePlan.flightTimeFormatted}</span>
        </div>

        {/* Takeoff Weight Delta */}
        <div className={`p-4 rounded-xl border shadow-lg ${
          simPlan.weights.takeoffWeightKg > aircraft.mtowKg ? 'bg-rose-950/40 border-rose-800' : 'bg-[#0c1424] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase">Takeoff Weight (TOW)</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              {simPlan.weights.takeoffWeightKg.toLocaleString()} kg
            </span>
            <span className={`text-xs font-bold ${towDeltaKg > 0 ? 'text-amber-400' : (towDeltaKg < 0 ? 'text-emerald-400' : 'text-slate-400')}`}>
              {towDeltaKg > 0 ? `+${towDeltaKg.toLocaleString()} kg` : (towDeltaKg < 0 ? `${towDeltaKg.toLocaleString()} kg` : '0 kg')}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            MTOW Limit: {aircraft.mtowKg.toLocaleString()} kg ({Math.round((simPlan.weights.takeoffWeightKg / aircraft.mtowKg) * 100)}%)
          </span>
        </div>
      </div>

      {/* Interactive Disruption Sliders */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono border-b border-slate-800 pb-2">
          Adjust Stress-Test Conditions
        </h3>

        {/* Slider 1: Wind Speed Delta */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-300">Enroute Wind Speed Shift</span>
            <span className="text-sky-300 font-bold">
              {simWindSpeedDelta >= 0 ? `+${simWindSpeedDelta}` : simWindSpeedDelta} KT (Total: {Math.max(0, inputs.windSpeedKt + simWindSpeedDelta)} KT)
            </span>
          </div>
          <input
            type="range"
            min={-30}
            max={50}
            step={5}
            value={simWindSpeedDelta}
            onChange={(e) => setSimWindSpeedDelta(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>Calmer (-30 KT)</span>
            <span>Zero Delta</span>
            <span>Severe Jetstream (+50 KT)</span>
          </div>
        </div>

        {/* Slider 2: Additional Holding Time */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-300">Terminal Delay / Airborne Holding Buffer</span>
            <span className="text-amber-300 font-bold">
              +{simHoldingDeltaMin} min (Total: {inputs.holdingTimeMin + simHoldingDeltaMin} min)
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={45}
            step={5}
            value={simHoldingDeltaMin}
            onChange={(e) => setSimHoldingDeltaMin(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>0 min extra</span>
            <span>+15 min (Moderate ATC)</span>
            <span>+45 min (Severe Weather / Slot Delay)</span>
          </div>
        </div>

        {/* Slider 3: Ground Taxi / De-icing Delay */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-300">Surface De-icing & Extended Taxi Out Delay</span>
            <span className="text-cyan-300 font-bold">
              +{simTaxiDeltaMin} min (Total: {inputs.taxiTimeMin + simTaxiDeltaMin} min)
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={5}
            value={simTaxiDeltaMin}
            onChange={(e) => setSimTaxiDeltaMin(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>Normal Taxi</span>
            <span>+15 min (De-icing)</span>
            <span>+30 min (Heavy Surface Congestion)</span>
          </div>
        </div>

        {/* Slider 4: Payload Surge */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-300">Last-Minute Cargo / Passenger Payload Variation</span>
            <span className="text-emerald-300 font-bold">
              {simPayloadDeltaKg >= 0 ? `+${simPayloadDeltaKg.toLocaleString()}` : simPayloadDeltaKg.toLocaleString()} kg (Total: {Math.min(aircraft.maxPayloadKg, Math.max(1000, inputs.payloadKg + simPayloadDeltaKg)).toLocaleString()} kg)
            </span>
          </div>
          <input
            type="range"
            min={-4000}
            max={4000}
            step={500}
            value={simPayloadDeltaKg}
            onChange={(e) => setSimPayloadDeltaKg(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>-4,000 kg (Light Load)</span>
            <span>0 kg</span>
            <span>+4,000 kg (Full Freight Surge)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
