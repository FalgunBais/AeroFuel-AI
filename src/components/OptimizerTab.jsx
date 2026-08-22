import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, TrendingDown, DollarSign, Cloud, ShieldCheck, Flame } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { computeOptimizerScenarios, generateDispatchReasoning } from '../engine/aiOptimizer';

export default function OptimizerTab({ plan, aircraft, inputs, setInputs }) {
  const optimizerResult = computeOptimizerScenarios(aircraft, inputs);
  const { scenarios, bestScenario, potentialFuelSavingsKg, potentialCostSavingsUsd, potentialCo2SavingsKg } = optimizerResult;
  const reasoning = generateDispatchReasoning(plan, bestScenario, aircraft);

  const isAlreadyOptimal = inputs.selectedFlightLevel === bestScenario.fl;

  const handleApplyOptimalFL = () => {
    setInputs((prev) => ({
      ...prev,
      selectedFlightLevel: bestScenario.fl,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Recommendation Summary */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-[#0c1424] to-slate-900 border border-cyan-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-cyan-400">
                  AI Cruise Level Optimization
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Rule-based Heuristics Engine
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Recommended Cruise Level: <span className="text-cyan-400 font-mono">FL{bestScenario.fl}</span>{' '}
                <span className="text-sm font-normal text-slate-400">({(bestScenario.fl * 100).toLocaleString()} ft)</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {isAlreadyOptimal
                  ? 'Currently planned at optimal cruise altitude for maximum aerodynamic and fuel efficiency.'
                  : `Stepping from current FL${inputs.selectedFlightLevel} to FL${bestScenario.fl} delivers optimized trip burn.`}
              </p>
            </div>
          </div>

          {!isAlreadyOptimal && (
            <button
              onClick={handleApplyOptimalFL}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all font-mono"
            >
              <span>Apply FL{bestScenario.fl} to Flight Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Savings Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase">Potential Fuel Savings</span>
            <Flame className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300">
            {potentialFuelSavingsKg > 0 ? `-${potentialFuelSavingsKg.toLocaleString()} kg` : '0 kg (Optimal)'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {potentialFuelSavingsKg > 0 ? `${bestScenario.fuelSavingPct}% trip fuel reduction` : 'Maximum efficiency achieved'}
          </span>
        </div>

        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase">Direct Fuel Cost Delta</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {potentialCostSavingsUsd > 0 ? `-$${potentialCostSavingsUsd.toLocaleString()}` : '$0.00 (Optimal)'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Based on $0.85/kg ($2.80/gal Jet A-1)</span>
        </div>

        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase">CO₂ Emissions Reduction</span>
            <Cloud className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">
            {potentialCo2SavingsKg > 0 ? `-${potentialCo2SavingsKg.toLocaleString()} kg` : '0 kg (Optimal)'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {(potentialCo2SavingsKg / 1000).toFixed(2)} metric tonnes CO₂ avoided
          </span>
        </div>
      </div>

      {/* Altitude Comparison Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Altitude Scenarios Comparison Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Flight Level Evaluation Matrix
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">RVSM Altitudes</span>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2 px-2">Altitude</th>
                  <th className="py-2 px-2">Trip Fuel</th>
                  <th className="py-2 px-2">ETE</th>
                  <th className="py-2 px-2">Est. Cost</th>
                  <th className="py-2 px-2">Fuel Delta</th>
                  <th className="py-2 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scenarios.map((sc) => {
                  const isCurrent = sc.fl === inputs.selectedFlightLevel;
                  const isBest = sc.isRecommended;

                  return (
                    <tr
                      key={sc.fl}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCurrent ? 'bg-cyan-950/40 text-cyan-200' : 'text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-2 font-bold flex items-center space-x-1.5">
                        <span>{sc.flightLevelStr}</span>
                        {isBest && (
                          <span className="px-1.5 py-0.2 text-[9px] rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-normal">
                            BEST
                          </span>
                        )}
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 text-[9px] rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-normal">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 font-semibold">{sc.tripFuelKg.toLocaleString()} kg</td>
                      <td className="py-2.5 px-2 text-slate-400">{sc.flightTimeFormatted}</td>
                      <td className="py-2.5 px-2 text-slate-400">${sc.estimatedCostUsd.toLocaleString()}</td>
                      <td className="py-2.5 px-2">
                        {sc.fuelDeltaKg === 0 ? (
                          <span className="text-slate-500">0 kg</span>
                        ) : sc.fuelDeltaKg > 0 ? (
                          <span className="text-rose-400 font-semibold">+{sc.fuelDeltaKg.toLocaleString()} kg</span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">{sc.fuelDeltaKg.toLocaleString()} kg</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        {isCurrent ? (
                          <span className="text-[10px] text-cyan-400">Selected</span>
                        ) : (
                          <button
                            onClick={() =>
                              setInputs((prev) => ({
                                ...prev,
                                selectedFlightLevel: sc.fl,
                              }))
                            }
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] transition-all border border-slate-700"
                          >
                            Select
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: "Why this fuel plan?" Natural Language Dispatch Reasoning (5 cols) */}
        <div className="lg:col-span-5 bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Why this fuel plan? (AI Rationale)
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {reasoning.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                  <p className="leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            <p>
              Rule-based heuristic dispatch calculation. Evaluates cruise TAS, wind vectors, standard ISA deviations, and
              ICAO regulatory reserve buffers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
