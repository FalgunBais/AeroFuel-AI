import React, { useState, useEffect } from 'react';
import { Plane, Radio, Clock, ShieldAlert, FileText, Sparkles, Navigation, Globe } from 'lucide-react';

export default function AOCHeader({ activeTab, setActiveTab, onOpenOFP, flightNumber, origin, destination, aircraft }) {
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
    <header className="border-b border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-md sticky top-0 z-40">
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
              <p className="text-xs text-slate-400 hidden sm:block">Real-Time Aircraft Radar, Fuel Planning & Cruise Optimization</p>
            </div>
          </div>

          {/* Center Tactical Status Banner */}
          <div className="hidden lg:flex items-center space-x-6 bg-slate-900/80 border border-slate-800/80 rounded-full px-4 py-1.5 text-xs font-mono">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="text-slate-500">FLT:</span>
              <span className="text-cyan-300 font-bold">{flightNumber}</span>
            </div>
            <div className="w-px h-3 bg-slate-700"></div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="text-slate-500">ROUTE:</span>
              <span className="text-emerald-400 font-semibold">{origin.icao}</span>
              <span className="text-slate-500">→</span>
              <span className="text-emerald-400 font-semibold">{destination.icao}</span>
            </div>
            <div className="w-px h-3 bg-slate-700"></div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="text-slate-500">ACFT:</span>
              <span className="text-sky-300">{aircraft.name}</span>
            </div>
            <div className="w-px h-3 bg-slate-700"></div>
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
