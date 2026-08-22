/**
 * AeroFuel AI Core Calculation Engine
 * Pure mathematical functions for Great-Circle Navigation,
 * Wind Vector Decomposition, ICAO Fuel Chain, and Dispatch Validation.
 */

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const EARTH_RADIUS_NM = 3440.065; // Earth radius in nautical miles

/**
 * Computes great-circle distance in nautical miles using the Haversine formula
 */
export function calculateGreatCircleDistance(lat1, lon1, lat2, lon2) {
  const phi1 = lat1 * DEG_TO_RAD;
  const phi2 = lat2 * DEG_TO_RAD;
  const deltaPhi = (lat2 - lat1) * DEG_TO_RAD;
  const deltaLambda = (lon2 - lon1) * DEG_TO_RAD;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_NM * c);
}

/**
 * Computes initial true bearing in degrees (0-360) from point 1 to point 2
 */
export function calculateInitialBearing(lat1, lon1, lat2, lon2) {
  const phi1 = lat1 * DEG_TO_RAD;
  const phi2 = lat2 * DEG_TO_RAD;
  const deltaLambda = (lon2 - lon1) * DEG_TO_RAD;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  const bearing = (theta * RAD_TO_DEG + 360) % 360;
  return Math.round(bearing);
}

/**
 * Decomposes wind vector relative to flight track heading.
 * Wind direction is "from" where wind blows.
 * Returns: { headwindComponent, tailwindComponent, crosswindComponent, relativeAngle }
 */
export function decomposeWind(trackHeadingDeg, windDirDeg, windSpeedKt) {
  // Relative angle between wind direction and heading
  const angleDiff = ((windDirDeg - trackHeadingDeg + 180) % 360) - 180;
  const rad = angleDiff * DEG_TO_RAD;

  // Longitudinal component: positive = tailwind, negative = headwind
  const longComponent = windSpeedKt * Math.cos(rad);
  // Lateral component: positive = right crosswind, negative = left crosswind
  const latComponent = windSpeedKt * Math.sin(rad);

  return {
    windDirection: windDirDeg,
    windSpeedKt: windSpeedKt,
    tailwindKt: longComponent > 0 ? Math.round(longComponent) : 0,
    headwindKt: longComponent < 0 ? Math.round(-longComponent) : 0,
    crosswindKt: Math.round(Math.abs(latComponent)),
    crosswindSide: latComponent >= 0 ? 'Right' : 'Left',
    relativeAngleDeg: Math.round(Math.abs(angleDiff)),
  };
}

/**
 * Computes effective groundspeed considering TAS, head/tailwind, and drift crab
 */
export function calculateGroundSpeed(trueAirspeedKt, windDecomp) {
  const netWind = windDecomp.tailwindKt - windDecomp.headwindKt;
  const crosswind = windDecomp.crosswindKt;

  // Crab angle correction: GS = sqrt(TAS^2 - Crosswind^2) + netWind
  const effectiveTAS = Math.sqrt(Math.max(0, Math.pow(trueAirspeedKt, 2) - Math.pow(crosswind, 2)));
  const groundspeed = Math.max(120, Math.round(effectiveTAS + netWind));
  return groundspeed;
}

/**
 * Computes complete ICAO standard fuel plan
 */
export function computeFuelPlan(aircraft, inputs) {
  const {
    distanceNm,
    bearingDeg,
    windDirectionDeg = 270,
    windSpeedKt = 20,
    isaDevC = 0,               // ISA temperature deviation +/- C
    payloadKg = 15000,
    taxiTimeMin = 18,          // Standard 15-20 min taxi
    contingencyPct = 0.05,     // Standard 5%
    alternateDistanceNm = 120, // Distance to diversion alternate
    holdingTimeMin = 15,       // Enroute or terminal holding
    extraFuelKg = 300,         // Dispatcher extra
    selectedFlightLevel = aircraft.optimumFL,
  } = inputs;

  // 1. Wind & Speed Resolution
  const wind = decomposeWind(bearingDeg, windDirectionDeg, windSpeedKt);
  const tas = aircraft.cruiseSpeedKt;
  const groundSpeedKt = calculateGroundSpeed(tas, wind);

  // 2. Flight Time (Cruise time + 12 mins climb/descent overhead)
  const cruiseTimeHours = distanceNm / groundSpeedKt;
  const climbDescentAdjustmentHours = 0.15; // ~9 mins climb/descent transition factor
  const totalFlightTimeHours = cruiseTimeHours + climbDescentAdjustmentHours;
  const flightTimeMinutes = Math.round(totalFlightTimeHours * 60);

  // 3. Burn Rate Adjustments:
  // Temperature factor (+1.5% burn per +10C ISA dev)
  const tempFactor = 1 + (isaDevC * 0.0015);
  // Payload / weight factor (+2.0% burn per 10% payload above 50% capacity)
  const payloadRatio = payloadKg / (aircraft.maxPayloadKg || 1);
  const payloadFactor = 1 + ((payloadRatio - 0.5) * 0.08);

  // Altitude factor: deviation from optimum FL penalty (+1.8% per 2000ft deviation)
  const flDiff = Math.abs(selectedFlightLevel - aircraft.optimumFL) / 20; // 20 = 2,000 ft
  const altitudeFactor = 1 + (flDiff * 0.018);

  const effectiveCruiseBurnRateKgHr = aircraft.cruiseBurnKgHr * tempFactor * payloadFactor * altitudeFactor;

  // 4. Fuel Chain Breakdown:
  // a) Taxi Fuel (idle engines on ground)
  const taxiFuelKg = Math.round((taxiTimeMin / 60) * (aircraft.taxiBurnKgHr || (aircraft.cruiseBurnKgHr * 0.25)));

  // b) Trip Fuel (Climb + Cruise + Descent)
  const tripFuelKg = Math.round(totalFlightTimeHours * effectiveCruiseBurnRateKgHr);

  // c) Contingency Fuel (ICAO standard 5% of trip fuel or 5 min holding minimum)
  const fiveMinHoldingFuel = Math.round((5 / 60) * aircraft.holdingBurnKgHr);
  const contingencyFuelKg = Math.max(fiveMinHoldingFuel, Math.round(tripFuelKg * contingencyPct));

  // d) Alternate Fuel (Diversion from destination to alternate airport)
  const alternateFlightTimeHours = alternateDistanceNm / (aircraft.cruiseSpeedKt * 0.9);
  const alternateFuelKg = Math.round(alternateFlightTimeHours * aircraft.cruiseBurnKgHr);

  // e) Final Reserve Fuel (30 min for Jets, 45 min for Turboprops at holding speed/altitude)
  const finalReserveFuelKg = Math.round((aircraft.reserveMin / 60) * aircraft.holdingBurnKgHr);

  // f) Holding Fuel (Planned tactical holding)
  const holdingFuelKg = Math.round((holdingTimeMin / 60) * aircraft.holdingBurnKgHr);

  // g) Extra Discretionary Fuel
  const extraDiscretionaryKg = Math.round(extraFuelKg);

  // 5. Total Fuel Quantities
  const minRequiredFuelKg = taxiFuelKg + tripFuelKg + contingencyFuelKg + alternateFuelKg + finalReserveFuelKg;
  const blockFuelKg = minRequiredFuelKg + holdingFuelKg + extraDiscretionaryKg;
  const takeoffFuelKg = blockFuelKg - taxiFuelKg;
  const estimatedLandingFuelKg = takeoffFuelKg - tripFuelKg;

  // 6. Weight & Balance Checks
  const zeroFuelWeightKg = aircraft.oewKg + payloadKg;
  const takeoffWeightKg = zeroFuelWeightKg + takeoffFuelKg;
  const estimatedLandingWeightKg = takeoffWeightKg - tripFuelKg;

  // 7. Carbon Emissions
  const co2TripKg = Math.round(tripFuelKg * aircraft.co2FactorKgPerKgFuel);
  const co2TotalKg = Math.round(blockFuelKg * aircraft.co2FactorKgPerKgFuel);

  return {
    distanceNm,
    bearingDeg,
    wind,
    tas,
    groundSpeedKt,
    flightTimeHours: totalFlightTimeHours,
    flightTimeMinutes,
    flightTimeFormatted: `${Math.floor(flightTimeMinutes / 60)}h ${flightTimeMinutes % 60}m`,
    effectiveCruiseBurnRateKgHr: Math.round(effectiveCruiseBurnRateKgHr),
    fuelChain: {
      taxi: taxiFuelKg,
      trip: tripFuelKg,
      contingency: contingencyFuelKg,
      alternate: alternateFuelKg,
      finalReserve: finalReserveFuelKg,
      holding: holdingFuelKg,
      extra: extraDiscretionaryKg,
      totalMinRequired: minRequiredFuelKg,
      blockFuel: blockFuelKg,
      takeoffFuel: takeoffFuelKg,
      landingFuel: estimatedLandingFuelKg,
    },
    weights: {
      oewKg: aircraft.oewKg,
      payloadKg,
      zeroFuelWeightKg,
      takeoffWeightKg,
      estimatedLandingWeightKg,
      maxPayloadKg: aircraft.maxPayloadKg,
      mtowKg: aircraft.mtowKg,
      mlwKg: aircraft.mlwKg,
      maxFuelKg: aircraft.maxFuelKg,
    },
    emissions: {
      co2TripKg,
      co2TotalKg,
      co2TripTonnes: (co2TripKg / 1000).toFixed(2),
      co2PerPaxKg: aircraft.seats ? Math.round(co2TripKg / (aircraft.seats * (payloadKg / aircraft.maxPayloadKg || 0.8))) : 0,
    },
    parameters: {
      selectedFlightLevel,
      optimumFL: aircraft.optimumFL,
      isaDevC,
      taxiTimeMin,
      contingencyPct: contingencyPct * 100,
      alternateDistanceNm,
      holdingTimeMin,
    }
  };
}

/**
 * Analyzes fuel plan against aircraft operational limitations
 */
export function computeAlerts(plan, aircraft) {
  const alerts = [];

  // 1. Max Fuel Tank Capacity Exceeded
  if (plan.fuelChain.blockFuel > aircraft.maxFuelKg) {
    alerts.push({
      type: 'danger',
      code: 'FUEL_OVERFILL',
      title: 'Fuel Tank Capacity Exceeded',
      message: `Block fuel (${plan.fuelChain.blockFuel.toLocaleString()} kg) exceeds aircraft maximum tank capacity of ${aircraft.maxFuelKg.toLocaleString()} kg by ${(plan.fuelChain.blockFuel - aircraft.maxFuelKg).toLocaleString()} kg.`,
    });
  }

  // 2. Maximum Takeoff Weight Exceeded
  if (plan.weights.takeoffWeightKg > aircraft.mtowKg) {
    alerts.push({
      type: 'danger',
      code: 'MTOW_EXCEEDED',
      title: 'MTOW Exceeded',
      message: `Estimated Takeoff Weight (${plan.weights.takeoffWeightKg.toLocaleString()} kg) exceeds MTOW of ${aircraft.mtowKg.toLocaleString()} kg by ${(plan.weights.takeoffWeightKg - aircraft.mtowKg).toLocaleString()} kg.`,
    });
  }

  // 3. Maximum Landing Weight Exceeded
  if (plan.weights.estimatedLandingWeightKg > aircraft.mlwKg) {
    alerts.push({
      type: 'warning',
      code: 'MLW_EXCEEDED',
      title: 'MLW Warning',
      message: `Estimated Landing Weight (${plan.weights.estimatedLandingWeightKg.toLocaleString()} kg) exceeds MLW of ${aircraft.mlwKg.toLocaleString()} kg by ${(plan.weights.estimatedLandingWeightKg - aircraft.mlwKg).toLocaleString()} kg. Burn more fuel or reduce payload.`,
    });
  }

  // 4. Payload Exceeded
  if (plan.weights.payloadKg > aircraft.maxPayloadKg) {
    alerts.push({
      type: 'danger',
      code: 'MAX_PAYLOAD',
      title: 'Structural Payload Exceeded',
      message: `Selected payload (${plan.weights.payloadKg.toLocaleString()} kg) exceeds structural maximum limit of ${aircraft.maxPayloadKg.toLocaleString()} kg.`,
    });
  }

  // 5. Severe Crosswind Warning
  if (plan.wind.crosswindKt > 28) {
    alerts.push({
      type: 'warning',
      code: 'HIGH_CROSSWIND',
      title: 'High Crosswind Advisory',
      message: `Enroute crosswind component is ${plan.wind.crosswindKt} kt (${plan.wind.crosswindSide}). Monitor destination runway alignment for safe crosswind limits.`,
    });
  }

  // 6. Sub-optimal Cruise Altitude Notice
  if (Math.abs(plan.parameters.selectedFlightLevel - aircraft.optimumFL) >= 40) {
    alerts.push({
      type: 'info',
      code: 'SUBOPTIMAL_FL',
      title: 'Sub-optimal Cruise Level',
      message: `Selected FL${plan.parameters.selectedFlightLevel} is ${Math.abs(plan.parameters.selectedFlightLevel - aircraft.optimumFL) * 100} ft away from aerodynamic optimum (FL${aircraft.optimumFL}). Fuel burn increased by ~${((plan.effectiveCruiseBurnRateKgHr / aircraft.cruiseBurnKgHr - 1) * 100).toFixed(1)}%.`,
    });
  }

  return alerts;
}
