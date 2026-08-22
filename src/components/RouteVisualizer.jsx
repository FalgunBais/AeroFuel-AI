import React from 'react';
import { Compass, Wind, Navigation, MapPin } from 'lucide-react';

export default function RouteVisualizer({ origin, destination, plan, aircraft }) {
  const { distanceNm, bearingDeg, wind, groundSpeedKt, tas } = plan;
  
  // Calculate relative coordinates for SVG rendering
  // Center is origin on left, destination on right
  const svgWidth = 600;
  const svgHeight = 220;
  const startX = 60;
  const startY = 140;
  const endX = 540;
  const endY = 140;
  
  // Climb / Cruise / Descent altitude profile
  const tocX = startX + (endX - startX) * 0.2; // Top of climb ~20%
  const todX = startX + (endX - startX) * 0.8; // Top of descent ~80%
  const cruiseY = 50; // Cruise altitude line

  // Wind compass calculations
  const compassSize = 130;
  const radius = 45;
  const center = compassSize / 2;
  
  // Wind vector arrow calculations
  const windAngleRad = (wind.windDirection - 90) * (Math.PI / 180);
  const windEndX = center + radius * Math.cos(windAngleRad);
  const windEndY = center + radius * Math.sin(windAngleRad);
  
  // Heading line
  const headingAngleRad = (bearingDeg - 90) * (Math.PI / 180);
  const headingEndX = center + radius * Math.cos(headingAngleRad);
  const headingEndY = center + radius * Math.sin(headingAngleRad);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Route & Altitude Profile Tactical Radar */}
      <div className="lg:col-span-2 bg-[#0c1424] border border-slate-800 rounded-xl p-4 relative overflow-hidden radar-grid">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Great-Circle Tactical Track & Vertical Profile
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-slate-400">
              TRK: <strong className="text-cyan-300">{bearingDeg.toString().padStart(3, '0')}°</strong>
            </span>
            <span className="text-slate-400">
              DIST: <strong className="text-emerald-300">{distanceNm.toLocaleString()} NM</strong>
            </span>
          </div>
        </div>

        {/* SVG Route Diagram */}
        <div className="w-full flex justify-center items-center py-2">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-h-56 select-none">
            {/* Grid & Altitude reference lines */}
            <line x1="40" y1={cruiseY} x2="560" y2={cruiseY} stroke="#1e293b" strokeDasharray="3,3" strokeWidth="1" />
            <text x="35" y={cruiseY + 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
              FL{plan.parameters.selectedFlightLevel}
            </text>

            <line x1="40" y1={startY} x2="560" y2={startY} stroke="#1e293b" strokeWidth="1" />
            <text x="35" y={startY + 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
              GND
            </text>

            {/* Flight Profile: Ground -> TOC -> TOD -> Ground */}
            <polyline
              points={`${startX},${startY} ${tocX},${cruiseY} ${todX},${cruiseY} ${endX},${endY}`}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Shaded Area Under Flight Path */}
            <polygon
              points={`${startX},${startY} ${tocX},${cruiseY} ${todX},${cruiseY} ${endX},${endY} ${startX},${startY}`}
              fill="url(#flightGrad)"
              opacity="0.2"
            />

            <defs>
              <linearGradient id="flightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Waypoints */}
            {/* TOC */}
            <circle cx={tocX} cy={cruiseY} r="4" fill="#06b6d4" stroke="#0c1424" strokeWidth="2" />
            <text x={tocX} y={cruiseY - 10} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              TOC
            </text>

            {/* Midpoint / Cruise Waypoint */}
            <circle cx={(tocX + todX) / 2} cy={cruiseY} r="3" fill="#a855f7" />
            <text x={(tocX + todX) / 2} y={cruiseY - 10} fill="#c084fc" fontSize="9" textAnchor="middle" fontFamily="monospace">
              CRZ • TAS {tas} KT
            </text>

            {/* TOD */}
            <circle cx={todX} cy={cruiseY} r="4" fill="#06b6d4" stroke="#0c1424" strokeWidth="2" />
            <text x={todX} y={cruiseY - 10} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              TOD
            </text>

            {/* Origin Node */}
            <circle cx={startX} cy={startY} r="6" fill="#10b981" />
            <circle cx={startX} cy={startY} r="10" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
            <text x={startX} y={startY + 20} fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {origin.icao}
            </text>
            <text x={startX} y={startY + 32} fill="#64748b" fontSize="9" textAnchor="middle">
              {origin.city}
            </text>

            {/* Destination Node */}
            <circle cx={endX} cy={endY} r="6" fill="#f59e0b" />
            <circle cx={endX} cy={endY} r="10" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
            <text x={endX} y={endY + 20} fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {destination.icao}
            </text>
            <text x={endX} y={endY + 32} fill="#64748b" fontSize="9" textAnchor="middle">
              {destination.city}
            </text>

            {/* Flight Info Floating Capsule */}
            <g transform={`translate(${(startX + endX) / 2 - 80}, ${startY - 40})`}>
              <rect width="160" height="24" rx="12" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
              <text x="80" y="16" fill="#e2e8f0" fontSize="10" textAnchor="middle" fontFamily="monospace">
                GS: {groundSpeedKt} KT | ETE: {plan.flightTimeFormatted}
              </text>
            </g>
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 px-1">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>DEP: {origin.name} ({origin.elevationFt} ft)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
            <span>ARR: {destination.name} ({destination.elevationFt} ft)</span>
          </div>
        </div>
      </div>

      {/* Wind Rose & Drift Vector Card */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Wind Vector Decomposition
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {wind.windDirection}° / {wind.windSpeedKt} KT
          </span>
        </div>

        {/* Tactical Wind Dial SVG */}
        <div className="flex items-center justify-center my-2">
          <svg width={compassSize} height={compassSize} className="select-none">
            {/* Outer Compass Dial */}
            <circle cx={center} cy={center} r={radius + 12} fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />

            {/* Cardinal Marks */}
            <text x={center} y="14" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="bold">N</text>
            <text x={compassSize - 10} y={center + 3} fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="bold">E</text>
            <text x={center} y={compassSize - 6} fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="bold">S</text>
            <text x="10" y={center + 3} fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="bold">W</text>

            {/* Heading Vector (Cyan) */}
            <line x1={center} y1={center} x2={headingEndX} y2={headingEndY} stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={headingEndX} cy={headingEndY} r="3" fill="#06b6d4" />

            {/* Wind Vector (Amber/Rose) */}
            <line x1={center} y1={center} x2={windEndX} y2={windEndY} stroke="#f43f5e" strokeWidth="2" strokeDasharray="2,2" strokeLinecap="round" />
            <circle cx={windEndX} cy={windEndY} r="2.5" fill="#f43f5e" />

            {/* Center Pivot */}
            <circle cx={center} cy={center} r="3" fill="#ffffff" />
          </svg>
        </div>

        {/* Breakdown Badges */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className={`p-2 rounded border ${wind.tailwindKt > 0 ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-rose-950/40 border-rose-800/60 text-rose-300'}`}>
            <span className="text-[10px] text-slate-400 block uppercase">
              {wind.tailwindKt > 0 ? 'Tailwind (+)' : 'Headwind (-)'}
            </span>
            <span className="text-sm font-bold">
              {wind.tailwindKt > 0 ? `+${wind.tailwindKt} KT` : `-${wind.headwindKt} KT`}
            </span>
          </div>

          <div className="p-2 rounded border bg-slate-900 border-slate-800 text-slate-200">
            <span className="text-[10px] text-slate-400 block uppercase">Crosswind</span>
            <span className="text-sm font-bold text-amber-300">
              {wind.crosswindKt} KT <span className="text-[10px] font-normal text-slate-400">({wind.crosswindSide})</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
