import React, { useState, useEffect } from 'react';
import { Plane, Radio, Clock, ShieldAlert, FileText, Sparkles, Navigation, Globe, ArrowRight, Timer } from 'lucide-react';

export default function AOCHeader({ activeTab, setActiveTab, onOpenOFP, flightNumber, origin, destination, aircraft, plan }) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC').slice(17, 25) + ' Z');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'live-radar', label: '3D Live Globe', icon: Globe, badge: 'LIVE' },
    { id: 'flight-setup', label: 'Flight Setup', icon: Navigation },
    { id: 'fuel-plan', label: 'Fuel Chain', icon: Plane },
    { id: 'optimizer', label: 'AI Optimizer', icon: Sparkles, badge: 'AI' },
    { id: 'what-if', label: 'What-If Simulator', icon: Radio },
    { id: 'fleet', label: 'Fleet Benchmark', icon: Plane },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#0a0f1d]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Badge */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-[#090e1a] rounded-[7px] flex items-center justify-center">
                <Plane className="w-5 h-5 text-cyan-400 transform -rotate-45" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-wider text-white font-mono">
                  AERO<span className="text-cyan-400">FUEL</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  AI AOC 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Aviation Operations Center & 3D Flight Dispatch System</p>
            </div>
          </div>

          {/* Center Tactical Status Banner */}
          <div className="hidden lg:flex items-center space-x-4 bg-slate-900/90 border border-slate-800 rounded-full px-4 py-1.5 text-xs font-mono shadow-inner">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="text-slate-500">FLT:</span>
              <span className="text-cyan-300 font-bold">{flightNumber}</span>
            </div>
            
            <div className="w-px h-3.5 bg-slate-700"></div>
            
            {/* Origin & Destination with Airport Name Tooltip */}
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="text-slate-500">ROUTE:</span>
              <span className="text-emerald-400 font-bold" title={`${origin.name} (${origin.city}, ${origin.country})`}>
                {origin.iata || origin.icao}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-emerald-400 font-bold" title={`${destination.name} (${destination.city}, ${destination.country})`}>
                {destination.iata || destination.icao}
              </span>
              <span className="text-[10px] text-slate-400 max-w-[130px] truncate hidden xl:inline">
                ({origin.city} → {destination.city})
              </span>
            </div>

            {/* Calculated ETA */}
            {plan?.etaFormatted && (
              <>
                <div className="w-px h-3.5 bg-slate-700"></div>
                <div className="flex items-center space-x-1.5 text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40">
                  <Timer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ETA: <strong>{plan.etaFormatted}</strong></span>
                  <span className="text-[10px] text-slate-400 font-normal">({plan.flightTimeFormatted})</span>
                </div>
              </>
            )}

            <div className="w-px h-3.5 bg-slate-700"></div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="text-slate-500">ACFT:</span>
              <span className="text-sky-300">{aircraft.name}</span>
            </div>

            <div className="w-px h-3.5 bg-slate-700"></div>
            <div className="flex items-center space-x-1.5 text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{utcTime}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenOFP}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all shadow-sm shadow-cyan-500/10 hover:border-cyan-400"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Dispatch Release (OFP)</span>
              <span className="sm:hidden">OFP</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-t border-slate-800/60 overflow-x-auto py-1.5 scrollbar-none">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1 py-0.2 text-[9px] font-bold uppercase rounded ${
                    tab.badge === 'LIVE'
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 animate-pulse'
                      : 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
