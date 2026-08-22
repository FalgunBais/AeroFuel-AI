# AeroFuel AI — Aircraft Fuel Optimization & Flight Planning Dashboard

> **Portfolio-grade Aviation Operations Center (AOC) fuel planning, cruise altitude optimization, and flight dispatch dashboard.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✈️ Overview

**AeroFuel AI** demonstrates an airline operations center (AOC) dispatch and fuel management console. It computes the end-to-end ICAO fuel chain for commercial flights, models true airspeed and groundspeed from wind vector triangles, optimizes cruise altitude scenarios using efficiency heuristics, and renders real-time sensitivity and what-if analyses.

### Key Features
- **ICAO Standard Fuel Chain**: Models Taxi, Trip, Contingency (5% / 5 min), Alternate, Final Reserve (30m Jet / 45m Turboprop), Holding, and Discretionary Extra fuel.
- **Great-Circle Navigation Engine**: Computes exact geodesic distance and initial true bearing using Haversine & spherical trigonometry formulas.
- **Wind Vector Decomposition**: Resolves crosswind crab angles, effective headwinds/tailwinds, and calculates true Ground Speed ($GS$).
- **AI Cruise Altitude Optimizer**: Multi-level altitude evaluation ($FL$) with aerodynamic burn penalties, wind shear gradients, fuel cost savings ($USD), and carbon footprint reductions.
- **Natural-Language Dispatch Rationale**: "Why this fuel plan?" heuristic engine generating human-readable flight release justifications.
- **Sensitivity & What-If Simulator**: Real-time stress-testing of enroute wind shifts, slot holding delays, de-icing delays, and payload surges.
- **Multi-Airframe Fleet Benchmarking**: Side-by-side efficiency matrix across A320neo, B737 MAX 8, B787-9 Dreamliner, A350-900, ATR 72-600, and CRJ-900.
- **ICAO Operational Flight Plan (OFP)**: Authentic printable airline dispatch release sheet.

---

## 📐 Mathematical Fuel & Physics Model

All calculations use pure, framework-agnostic mathematical functions:

| Component | Formula | Description |
| :--- | :--- | :--- |
| **Great-Circle Distance** | $d = 2R \arcsin \sqrt{\sin^2(\frac{\Delta \phi}{2}) + \cos \phi_1 \cos \phi_2 \sin^2(\frac{\Delta \lambda}{2})}$ | Haversine distance in NM |
| **Initial True Bearing** | $\theta = \operatorname{atan2}(\sin\Delta\lambda \cos\phi_2, \cos\phi_1 \sin\phi_2 - \sin\phi_1 \cos\phi_2 \cos\Delta\lambda)$ | Heading in degrees (000°–360°) |
| **Wind Decomposition** | $V_{\text{long}} = V_w \cos(\theta_w - \theta), \quad V_{\text{lat}} = V_w \sin(\theta_w - \theta)$ | Headwind/Tailwind & Crosswind |
| **Effective Groundspeed** | $GS = \sqrt{TAS^2 - V_{\text{lat}}^2} + V_{\text{long}}$ | Groundspeed with drift crab |
| **Taxi Fuel** | $F_{\text{taxi}} = t_{\text{taxi}} \times \dot{m}_{\text{idle}} / 60$ | Ground idle burn before takeoff |
| **Trip Fuel** | $F_{\text{trip}} = t_{\text{flight}} \times \dot{m}_{\text{cruise}} \cdot f_T \cdot f_W \cdot f_A$ | Climb, cruise, and descent burn |
| **Contingency Fuel** | $F_{\text{cont}} = \max(0.05 \times F_{\text{trip}}, \frac{5}{60} \times \dot{m}_{\text{holding}})$ | ICAO 5% / 5 min regulatory margin |
| **Alternate Fuel** | $F_{\text{alt}} = (d_{\text{alt}} / V_{\text{cruise}}) \times \dot{m}_{\text{cruise}}$ | Diversion to alternate airport |
| **Final Reserve Fuel** | $F_{\text{res}} = (t_{\text{reserve}} / 60) \times \dot{m}_{\text{holding}}$ | 30 min (Jet) / 45 min (Turboprop) |
| **Block / Ramp Fuel** | $F_{\text{block}} = \sum \text{All Fuel Components}$ | Total fuel loaded at departure gate |

---

## 🚀 Quick Start & Installation

### Option 1: Standalone React Artifact Deliverable
The workspace includes `AeroFuelAI.jsx` — a zero-dependency standalone React component that can be pasted directly into Claude Artifacts, Next.js, or any React 18/19 environment.

### Option 2: Run Modern Web App Locally

```bash
# Clone or navigate to the repository
cd "AeroFuel AI"

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Visit `http://localhost:3000` to interact with the dashboard.

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🏗️ Project Architecture

```
AeroFuel AI/
├── AeroFuelAI.jsx               # Standalone single-file React deliverable
├── index.html                   # HTML entry with aviation typography
├── vite.config.js               # Vite bundler configuration
├── tailwind.config.js           # Aviation color tokens & radar animations
├── src/
│   ├── main.jsx                 # Application bootstrapping
│   ├── App.jsx                  # Main dashboard state & orchestration
│   ├── index.css                # Glassmorphism & tactical styling
│   ├── data/
│   │   ├── aircraft.js          # 6 aircraft fleet profiles & burn rates
│   │   └── airports.js          # Global ICAO airport coordinates & elevations
│   ├── engine/
│   │   ├── fuelCalculations.js  # Pure math: Haversine, wind, fuel chains, limits
│   │   └── aiOptimizer.js       # Cruise altitude evaluator & dispatch explainer
│   └── components/
│       ├── AOCHeader.jsx        # UTC clock, flight tags, tab navigation
│       ├── RouteVisualizer.jsx  # SVG tactical track & wind rose compass
│       ├── FlightSetupTab.jsx   # City pair picker, atmospheric sliders
│       ├── FuelChainTab.jsx     # Recharts waterfall & structural weight meters
│       ├── OptimizerTab.jsx     # AI altitude matrix & natural language explainer
│       ├── WhatIfSimulator.jsx  # Real-time operational disruption sliders
│       ├── FleetComparisonTab.jsx # Cross-fleet burn/seat benchmarking
│       └── OFPReleaseModal.jsx  # Printable ICAO Operational Flight Plan
└── README.md
```

---

## ⚠️ Safety & Compliance Disclaimer

> **IMPORTANT**: AeroFuel AI is an educational and portfolio demonstration. Fuel calculations, aircraft performance numbers, weather resolutions, and cruise altitude recommendations are based on simplified heuristics and **must never be used for real-world flight planning, navigation, or operational dispatch**. Certified aircraft manuals, approved Flight Management Systems (FMS), weather briefings, and official airline dispatch procedures must always be used for actual flights.
