/**
 * AeroFuel AI — Flight Optimizer Engine
 * Evaluates cruise altitude scenarios, computes fuel/time/cost trade-offs,
 * and generates human-readable dispatch explanations.
 */

import { computeFuelPlan } from './fuelCalculations';

export const JET_FUEL_PRICE_USD_PER_KG = 0.85; // Approx $2.80/gallon Jet A-1

/**
 * Evaluates cruise flight level scenarios around the aircraft's optimum altitude
 */
export function computeOptimizerScenarios(aircraft, baseInputs) {
  // Generate candidate Flight Levels (FLs)
  const baseFL = aircraft.optimumFL;
  const step = 20; // 2,000 ft RVSM separation
  
  // Available flight levels within aircraft ceiling
  const candidateFLs = [];
  for (let fl = Math.max(140, baseFL - 60); fl <= Math.min(aircraft.ceilingFL, baseFL + 40); fl += step) {
    candidateFLs.push(fl);
  }

  // Evaluate each altitude
  const scenarios = candidateFLs.map((fl) => {
    // Model altitude wind gradient (winds are typically stronger at higher altitudes)
    const altitudeRatio = fl / baseFL;
    const simulatedWindSpeed = Math.round(baseInputs.windSpeedKt * (0.8 + 0.25 * altitudeRatio));
    
    // Wind direction shift slightly with height (Veering)
    const simulatedWindDir = (baseInputs.windDirectionDeg + (fl - baseFL) * 0.2 + 360) % 360;

    const testInputs = {
      ...baseInputs,
      selectedFlightLevel: fl,
      windSpeedKt: simulatedWindSpeed,
      windDirectionDeg: simulatedWindDir,
    };

    const plan = computeFuelPlan(aircraft, testInputs);
    const tripFuelKg = plan.fuelChain.trip;
    const blockFuelKg = plan.fuelChain.blockFuel;
    const flightTimeMin = plan.flightTimeMinutes;
    const estimatedCostUsd = Math.round(blockFuelKg * JET_FUEL_PRICE_USD_PER_KG);
    const co2Tonnes = (plan.emissions.co2TripKg / 1000).toFixed(2);

    return {
      fl,
      altitudeFt: fl * 100,
      flightLevelStr: `FL${fl}`,
      tripFuelKg,
      blockFuelKg,
      flightTimeMin,
      flightTimeFormatted: plan.flightTimeFormatted,
      groundSpeedKt: plan.groundSpeedKt,
      headwindKt: plan.wind.headwindKt,
      tailwindKt: plan.wind.tailwindKt,
      crosswindKt: plan.wind.crosswindKt,
      estimatedCostUsd,
      co2Tonnes,
      plan,
      isBaseSelected: fl === baseInputs.selectedFlightLevel,
    };
  });

  // Sort by trip fuel ascending to find optimum
  const sortedByFuel = [...scenarios].sort((a, b) => a.tripFuelKg - b.tripFuelKg);
  const bestScenario = sortedByFuel[0];

  // Decorate scenarios with delta compared to current selection and optimum
  const currentScenario = scenarios.find((s) => s.fl === baseInputs.selectedFlightLevel) || scenarios[0];

  const enrichedScenarios = scenarios.map((s) => {
    const fuelDeltaKg = s.tripFuelKg - currentScenario.tripFuelKg;
    const timeDeltaMin = s.flightTimeMin - currentScenario.flightTimeMin;
    const costDeltaUsd = s.estimatedCostUsd - currentScenario.estimatedCostUsd;
    const isRecommended = s.fl === bestScenario.fl;

    return {
      ...s,
      isRecommended,
      fuelDeltaKg,
      timeDeltaMin,
      costDeltaUsd,
      fuelSavingPct: (((currentScenario.tripFuelKg - s.tripFuelKg) / currentScenario.tripFuelKg) * 100).toFixed(1),
    };
  });

  return {
    scenarios: enrichedScenarios,
    bestScenario,
    currentScenario,
    potentialFuelSavingsKg: Math.max(0, currentScenario.tripFuelKg - bestScenario.tripFuelKg),
    potentialCostSavingsUsd: Math.max(0, currentScenario.estimatedCostUsd - bestScenario.estimatedCostUsd),
    potentialCo2SavingsKg: Math.round(Math.max(0, currentScenario.tripFuelKg - bestScenario.tripFuelKg) * aircraft.co2FactorKgPerKgFuel),
  };
}

/**
 * Generates natural language dispatch reasoning for the recommended fuel plan
 */
export function generateDispatchReasoning(plan, bestScenario, aircraft) {
  const isOptimal = plan.parameters.selectedFlightLevel === bestScenario.fl;
  const windType = plan.wind.tailwindKt > 0 ? `favorable tailwind of ${plan.wind.tailwindKt} kt` : (plan.wind.headwindKt > 0 ? `headwind penalty of ${plan.wind.headwindKt} kt` : 'calm longitudinal winds');
  const tempStatus = plan.parameters.isaDevC > 0 ? `warm atmosphere (ISA +${plan.parameters.isaDevC}°C, +${(plan.parameters.isaDevC * 0.15).toFixed(1)}% burn)` : (plan.parameters.isaDevC < 0 ? `colder dense air (ISA ${plan.parameters.isaDevC}°C, improved engine efficiency)` : 'standard atmospheric conditions (ISA Standard)');
  
  const reasons = [];

  // Cruise Altitude Analysis
  if (isOptimal) {
    reasons.push(`Cruise altitude FL${plan.parameters.selectedFlightLevel} provides the optimal balance of aerodynamic efficiency and true airspeed for the ${aircraft.name}, matching the minimum trip fuel burn profile.`);
  } else {
    const delta = Math.abs(plan.fuelChain.trip - bestScenario.tripFuelKg);
    reasons.push(`Currently planned at FL${plan.parameters.selectedFlightLevel}. Stepping to recommended FL${bestScenario.fl} would save approximately ${delta.toLocaleString()} kg of fuel and reduce flight emissions.`);
  }

  // Wind Impact
  reasons.push(`Enroute wind analysis indicates a ${windType} at cruise level, resulting in an effective ground speed of ${plan.groundSpeedKt} kt (TAS ${plan.tas} kt).`);

  // Atmospheric conditions
  reasons.push(`Temperature model accounts for ${tempStatus}.`);

  // Regulatory Reserves
  reasons.push(`Contingency fuel is set to ${plan.fuelChain.contingency.toLocaleString()} kg (${plan.parameters.contingencyPct}% ICAO safety margin). Final reserve fuel accounts for ${aircraft.reserveMin} minutes holding (${plan.fuelChain.finalReserve.toLocaleString()} kg) at destination alternate.`);

  // Discretionary
  if (plan.fuelChain.extra > 0 || plan.fuelChain.holding > 0) {
    reasons.push(`Includes ${plan.fuelChain.holding.toLocaleString()} kg holding buffer (${plan.parameters.holdingTimeMin} min) and ${plan.fuelChain.extra.toLocaleString()} kg dispatcher discretionary extra.`);
  }

  return reasons;
}
