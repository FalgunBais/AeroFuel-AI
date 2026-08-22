import React from 'react';
import { Fuel, Scale, Flame, ShieldAlert, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function FuelChainTab({ plan, aircraft }) {
  const { fuelChain, weights, emissions, flightTimeFormatted, effectiveCruiseBurnRateKgHr } = plan;

  const fuelBreakdownData = [
    { name: 'Taxi', amount: fuelChain.taxi, color: '#64748b', desc: 'Ground idle & taxi out' },
    { name: 'Trip', amount: fuelChain.trip, color: '#0284c7', desc: 'Climb, cruise & descent' },
    { name: 'Contingency', amount: fuelChain.contingency, color: '#06b6d4', desc: '5% / 5min route buffer' },
    { name: 'Alternate', amount: fuelChain.alternate, color: '#38bdf8', desc: 'Diversion to alternate' },
    { name: 'Final Reserve', amount: fuelChain.finalReserve, color: '#eab308', desc: `${aircraft.reserveMin} min holding reserve` },
    { name: 'Holding', amount: fuelChain.holding, color: '#f97316', desc: 'Planned enroute delays' },
    { name: 'Extra', amount: fuelChain.extra, color: '#a855f7', desc: 'Commander / Dispatch extra' },
  ];

  // Percentage of max tank capacity used
  const tankPercent = Math.min(100, Math.round((fuelChain.blockFuel / aircraft.maxFuelKg) * 100));
  const towPercent = Math.min(100, Math.round((weights.takeoffWeightKg / aircraft.mtowKg) * 100));
  const mlwPercent = Math.min(100, Math.round((weights.estimatedLandingWeightKg / aircraft.mlwKg) * 100));

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Block Ramp Fuel */}
        <div className="bg-[#0c1424] border border-cyan-900/40 rounded-xl p-4 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-cyan-400 font-mono uppercase tracking-wider block">
                Total Block Fuel (Ramp)
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold font-mono text-white">
                  {fuelChain.blockFuel.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-mono">kg</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Tank Capacity:</span>
            <span className="text-cyan-300 font-semibold">{tankPercent}% ({aircraft.maxFuelKg.toLocaleString()} kg)</span>
          </div>
        </div>

        {/* Card 2: Trip Fuel & Burn Rate */}
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider block">
                Trip Fuel (Airborne)
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold font-mono text-sky-400">
                  {fuelChain.trip.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-mono">kg</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Effective Burn:</span>
            <span className="text-slate-200">{effectiveCruiseBurnRateKgHr.toLocaleString()} kg/hr</span>
          </div>
        </div>

        {/* Card 3: Takeoff Weight (TOW) */}
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider block">
                Estimated TOW
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {weights.takeoffWeightKg.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-mono">kg</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
            <span>MTOW Margin:</span>
            <span className={weights.takeoffWeightKg > aircraft.mtowKg ? 'text-rose-400 font-bold' : 'text-emerald-300'}>
              {(aircraft.mtowKg - weights.takeoffWeightKg).toLocaleString()} kg
            </span>
          </div>
        </div>

        {/* Card 4: CO2 Carbon Footprint */}
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider block">
                Estimated Trip CO₂
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold font-mono text-amber-400">
                  {emissions.co2TripTonnes}
                </span>
                <span className="text-xs text-slate-400 font-mono">tonnes</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Per Seat Factor:</span>
            <span className="text-slate-200">{emissions.co2PerPaxKg} kg CO₂ / seat</span>
          </div>
        </div>
      </div>

      {/* Visual Fuel Chain Waterfall Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Fuel Waterfall Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Fuel className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  ICAO Fuel Chain Distribution (kg)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Total: {fuelChain.blockFuel.toLocaleString()} kg</span>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64 mt-4 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelBreakdownData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    fontFamily="monospace"
                  />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} fontFamily="monospace" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#080c14] border border-slate-700 p-2 rounded shadow-xl text-xs font-mono">
                            <p className="text-white font-bold">{data.name}</p>
                            <p className="text-cyan-400 font-semibold">{data.amount.toLocaleString()} kg</p>
                            <p className="text-slate-400 text-[10px]">{data.desc}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {fuelBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stacked Proportional Bar */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span>Segment Proportions:</span>
              <span>Trip Fuel: {Math.round((fuelChain.trip / fuelChain.blockFuel) * 100)}%</span>
            </div>
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
              {fuelBreakdownData.map((seg, idx) => {
                const pct = (seg.amount / fuelChain.blockFuel) * 100;
                return (
                  <div
                    key={idx}
                    style={{ width: `${pct}%`, backgroundColor: seg.color }}
                    title={`${seg.name}: ${seg.amount} kg (${pct.toFixed(1)}%)`}
                    className="h-full border-r border-[#0c1424] last:border-none transition-all duration-300"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Detailed Table & Weight Limits (5 cols) */}
        <div className="lg:col-span-5 bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Weight & Fuel Specifications
              </h3>
            </div>
          </div>

          {/* Fuel Components List */}
          <div className="space-y-2 text-xs font-mono">
            {fuelBreakdownData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-100 font-bold">{item.amount.toLocaleString()} kg</span>
                  <span className="text-[10px] text-slate-500 block">
                    {((item.amount / fuelChain.blockFuel) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Structural Weight Bars */}
          <div className="pt-3 border-t border-slate-800 space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Takeoff Weight (TOW / MTOW)</span>
                <span className={towPercent > 100 ? 'text-rose-400 font-bold' : 'text-emerald-300'}>
                  {weights.takeoffWeightKg.toLocaleString()} / {aircraft.mtowKg.toLocaleString()} kg ({towPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    towPercent > 100 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, towPercent)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Landing Weight (ELW / MLW)</span>
                <span className={mlwPercent > 100 ? 'text-rose-400 font-bold' : 'text-cyan-300'}>
                  {weights.estimatedLandingWeightKg.toLocaleString()} / {aircraft.mlwKg.toLocaleString()} kg ({mlwPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    mlwPercent > 100 ? 'bg-rose-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${Math.min(100, mlwPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
