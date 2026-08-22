import React from 'react';
import { X, Printer, Copy, Check, FileText, ShieldAlert } from 'lucide-react';

export default function OFPReleaseModal({ isOpen, onClose, plan, aircraft, origin, destination, flightNumber }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const now = new Date();
  const utcDate = now.toISOString().slice(0, 10);
  const utcTime = now.toISOString().slice(11, 16) + 'Z';

  const ofpText = `
================================================================================
           AEROFUEL AI — OPERATIONAL FLIGHT PLAN (OFP) RELEASE
================================================================================
FLIGHT: ${flightNumber}       DATE: ${utcDate}       RELEASE TIME: ${utcTime}
AIRCRAFT: ${aircraft.name.toUpperCase()} (${aircraft.type})  REG: VT-AFL
ENGINES: ${aircraft.engine}

ROUTING:
  ORIGIN:      ${origin.icao} (${origin.iata}) - ${origin.city.toUpperCase()} (ELEV ${origin.elevationFt} FT)
  DESTINATION: ${destination.icao} (${destination.iata}) - ${destination.city.toUpperCase()} (ELEV ${destination.elevationFt} FT)
  ALTERNATE:   ${origin.defaultAlternate}
  GREAT CIRCLE DISTANCE: ${plan.distanceNm} NM
  INITIAL TRUE TRACK:    ${plan.bearingDeg}°
  CRUISE ALTITUDE:       FL${plan.parameters.selectedFlightLevel} (${(plan.parameters.selectedFlightLevel * 100).toLocaleString()} FT)
  CRUISE SPEED:          TAS ${plan.tas} KT / GS ${plan.groundSpeedKt} KT
  ESTIMATED TIME ENROUTE: ${plan.flightTimeFormatted}

WIND & ATMOSPHERE:
  ENROUTE WIND: ${plan.wind.windDirection}° / ${plan.wind.windSpeedKt} KT (${plan.wind.tailwindKt > 0 ? `+${plan.wind.tailwindKt} KT TW` : `-${plan.wind.headwindKt} KT HW`}, ${plan.wind.crosswindKt} KT ${plan.wind.crosswindSide} XW)
  ISA DEVIATION: ${plan.parameters.isaDevC >= 0 ? `+${plan.parameters.isaDevC}` : plan.parameters.isaDevC}°C

WEIGHT & BALANCE (KG):
  OPERATING EMPTY WEIGHT (OEW): ${aircraft.oewKg.toLocaleString()} KG
  TRAFFIC / STRUCTURAL PAYLOAD:  ${plan.weights.payloadKg.toLocaleString()} KG
  ZERO FUEL WEIGHT (ZFW):        ${plan.weights.zeroFuelWeightKg.toLocaleString()} KG
  TAKEOFF WEIGHT (TOW):          ${plan.weights.takeoffWeightKg.toLocaleString()} KG  (MTOW: ${aircraft.mtowKg.toLocaleString()} KG)
  ESTIMATED LANDING WEIGHT (ELW):${plan.weights.estimatedLandingWeightKg.toLocaleString()} KG  (MLW: ${aircraft.mlwKg.toLocaleString()} KG)

ICAO FUEL COMPUTATION (KG):
--------------------------------------------------------------------------------
  TAXI FUEL:           ${plan.fuelChain.taxi.toString().padStart(6, ' ')} KG  (${plan.parameters.taxiTimeMin} MIN)
  TRIP FUEL:           ${plan.fuelChain.trip.toString().padStart(6, ' ')} KG  (AIRBORNE ETE: ${plan.flightTimeFormatted})
  CONTINGENCY (5%):    ${plan.fuelChain.contingency.toString().padStart(6, ' ')} KG  (ICAO REGULATORY 5% / 5MIN)
  ALTERNATE:           ${plan.fuelChain.alternate.toString().padStart(6, ' ')} KG  (DIST: ${plan.parameters.alternateDistanceNm} NM)
  FINAL RESERVE:       ${plan.fuelChain.finalReserve.toString().padStart(6, ' ')} KG  (HOLDING: ${aircraft.reserveMin} MIN)
  HOLDING BUFFER:      ${plan.fuelChain.holding.toString().padStart(6, ' ')} KG  (${plan.parameters.holdingTimeMin} MIN DELAY)
  EXTRA / DISCRETION:  ${plan.fuelChain.extra.toString().padStart(6, ' ')} KG  (COMMANDER EXTRA)
--------------------------------------------------------------------------------
  TOTAL REQUIRED:      ${plan.fuelChain.totalMinRequired.toString().padStart(6, ' ')} KG
  TOTAL BLOCK (RAMP):  ${plan.fuelChain.blockFuel.toString().padStart(6, ' ')} KG  (CAPACITY: ${aircraft.maxFuelKg.toLocaleString()} KG)
--------------------------------------------------------------------------------

ENVIRONMENTAL IMPACT:
  ESTIMATED TRIP CO2:  ${plan.emissions.co2TripTonnes} TONNES (${plan.emissions.co2PerPaxKg} KG / SEAT)

DISPATCHER REMARKS / RELEASE:
  I HEREBY CERTIFY THAT THIS OPERATIONAL FLIGHT PLAN HAS BEEN PREPARED IN
  ACCORDANCE WITH APPLICABLE OPERATIONAL REGULATIONS AND FUEL POLICIES.
  
  DISPATCHER ID: AFL-AI-OPS9     SIGNATURE: [AUTHORIZED DIGITAL RELEASE]
  PILOT-IN-COMMAND: ______________ SIGNATURE: __________________________

*** PORTFOLIO DEMONSTRATION ONLY — NOT CERTIFIED FOR REAL-WORLD FLIGHT ***
================================================================================
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(ofpText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b1322] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#080d18]">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Operational Flight Plan (OFP) Release
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-all border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono transition-all border border-cyan-500/40"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print OFP</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content - Preformatted Aviation Document */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-300 bg-[#070b14] space-y-4">
          <pre className="whitespace-pre font-mono leading-relaxed bg-[#050810] p-4 rounded-xl border border-slate-800/80 overflow-x-auto text-emerald-400 select-all">
            {ofpText}
          </pre>

          <div className="flex items-center space-x-2 text-amber-400/90 text-[11px] bg-amber-950/20 p-3 rounded-lg border border-amber-900/40">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>
              Disclaimer: AeroFuel AI is an educational simulation. Calculations and fuel figures are illustrative heuristics and must not be used for actual navigation or real-world dispatch.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
