import React from 'react';
import { Plane, Users, CheckCircle2, XCircle, Gauge, Flame, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { AIRCRAFT_PROFILES } from '../data/aircraft';
import { computeFuelPlan } from '../engine/fuelCalculations';

export default function FleetComparisonTab({ inputs, origin, destination, currentAircraft, setAircraft }) {
  // Compute flight plan for each aircraft profile on this same route
  const fleetData = AIRCRAFT_PROFILES.map((ac) => {
    // scale payload proportionally to aircraft capacity (75% load factor)
    const scaledPayload = Math.round(ac.maxPayloadKg * 0.75);
    const plan = computeFuelPlan(ac, {
      ...inputs,
      selectedFlightLevel: ac.optimumFL,
      payloadKg: scaledPayload,
    });

    const isFeasible = plan.fuelChain.blockFuel <= ac.maxFuelKg && plan.weights.takeoffWeightKg <= ac.mtowKg;
    const fuelPerSeatKg = Math.round(plan.fuelChain.trip / (ac.seats || 1));
    const co2PerSeatKg = Math.round(plan.emissions.co2TripKg / (ac.seats || 1));

    return {
      aircraft: ac,
      id: ac.id,
      name: ac.name,
      type: ac.type,
      seats: ac.seats,
      blockFuelKg: plan.fuelChain.blockFuel,
      tripFuelKg: plan.fuelChain.trip,
      flightTimeFormatted: plan.flightTimeFormatted,
      flightTimeMinutes: plan.flightTimeMinutes,
      fuelPerSeatKg,
      co2PerSeatKg,
      isFeasible,
      isCurrent: ac.id === currentAircraft.id,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Plane className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
              Fleet Aircraft Fuel & Efficiency Benchmark
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparing fleet performance on route <strong className="text-cyan-400 font-mono">{origin.icao} → {destination.icao}</strong> ({inputs.distanceNm} NM) at 75% load factor.
          </p>
        </div>
      </div>

      {/* Fuel Burn per Seat Benchmark Chart */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Fuel Efficiency: Trip Fuel Burn Per Seat (kg / seat)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Lower is better</span>
        </div>

        <div className="h-64 mt-4 select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fleetData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                fontFamily="monospace"
              />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} fontFamily="monospace" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#080c14] border border-slate-700 p-2.5 rounded shadow-xl text-xs font-mono">
                        <p className="text-white font-bold">{d.name}</p>
                        <p className="text-cyan-400 font-bold">{d.fuelPerSeatKg} kg fuel / seat</p>
                        <p className="text-amber-400">{d.co2PerSeatKg} kg CO₂ / seat</p>
                        <p className="text-slate-400 text-[10px] mt-1">Total Trip: {d.tripFuelKg.toLocaleString()} kg ({d.flightTimeFormatted})</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="fuelPerSeatKg" radius={[4, 4, 0, 0]}>
                {fleetData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isCurrent ? '#06b6d4' : '#334155'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fleet Comparison Table */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg overflow-x-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-3">
          Cross-Fleet Operational Matrix
        </h3>

        <table className="w-full text-xs font-mono text-left">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
              <th className="py-2.5 px-3">Aircraft Airframe</th>
              <th className="py-2.5 px-3">Seats</th>
              <th className="py-2.5 px-3">Block Fuel</th>
              <th className="py-2.5 px-3">Flight Time</th>
              <th className="py-2.5 px-3">Burn / Seat</th>
              <th className="py-2.5 px-3">CO₂ / Seat</th>
              <th className="py-2.5 px-3">Feasibility</th>
              <th className="py-2.5 px-3 text-right">Switch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {fleetData.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-slate-800/40 transition-colors ${
                  row.isCurrent ? 'bg-cyan-950/40 text-cyan-200' : 'text-slate-300'
                }`}
              >
                <td className="py-3 px-3">
                  <div className="font-bold text-white flex items-center space-x-1.5">
                    <span>{row.name}</span>
                    {row.isCurrent && (
                      <span className="px-1.5 py-0.2 text-[9px] rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-normal">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">{row.type}</span>
                </td>
                <td className="py-3 px-3">{row.seats} pax</td>
                <td className="py-3 px-3 font-semibold text-slate-200">{row.blockFuelKg.toLocaleString()} kg</td>
                <td className="py-3 px-3 text-slate-400">{row.flightTimeFormatted}</td>
                <td className="py-3 px-3 font-bold text-cyan-300">{row.fuelPerSeatKg} kg</td>
                <td className="py-3 px-3 text-amber-300">{row.co2PerSeatKg} kg</td>
                <td className="py-3 px-3">
                  {row.isFeasible ? (
                    <span className="flex items-center space-x-1 text-emerald-400 text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valid</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-rose-400 text-[10px]">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Exceeds Limits</span>
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-right">
                  {row.isCurrent ? (
                    <span className="text-[10px] text-cyan-400">Active</span>
                  ) : (
                    <button
                      onClick={() => setAircraft(row.aircraft)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] border border-slate-700 transition-all"
                    >
                      Select
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
