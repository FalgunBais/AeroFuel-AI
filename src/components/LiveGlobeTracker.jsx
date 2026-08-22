import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Plane, Search, Radio, Compass, Fuel, Flame, Gauge, ArrowRight, CheckCircle2, Navigation, Eye } from 'lucide-react';
import { LIVE_FLIGHTS, getFlightCurrentCoordinates } from '../data/liveFlights';
import { AIRPORTS, getAirportByIcao } from '../data/airports';
import { AIRCRAFT_PROFILES, getAircraftById } from '../data/aircraft';

// Helper: Convert Lat/Lon to 3D Cartesian coordinates on sphere
function latLonToVector3(lat, lon, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

export default function LiveGlobeTracker({ onSelectFlightForDispatch }) {
  const mountRef = useRef(null);
  const [selectedFlight, setSelectedFlight] = useState(LIVE_FLIGHTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRotate, setAutoRotate] = useState(true);
  const [flights, setFlights] = useState(LIVE_FLIGHTS);

  // Live simulation tick: gradually advance aircraft progress along route
  useEffect(() => {
    const interval = setInterval(() => {
      setFlights((prev) =>
        prev.map((f) => {
          let newProgress = f.progressPct + 0.08;
          if (newProgress > 98) newProgress = 5;
          return {
            ...f,
            progressPct: parseFloat(newProgress.toFixed(2)),
          };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtered flights for search
  const filteredFlights = useMemo(() => {
    if (!searchQuery.trim()) return flights;
    const q = searchQuery.toLowerCase();
    return flights.filter(
      (f) =>
        f.flightNo.toLowerCase().includes(q) ||
        f.reg.toLowerCase().includes(q) ||
        f.airline.toLowerCase().includes(q) ||
        f.originIcao.toLowerCase().includes(q) ||
        f.destIcao.toLowerCase().includes(q) ||
        f.aircraftId.toLowerCase().includes(q)
    );
  }, [flights, searchQuery]);

  // Keep selected flight updated with latest progress
  const activeFlight = useMemo(() => {
    return flights.find((f) => f.flightNo === selectedFlight.flightNo) || flights[0];
  }, [flights, selectedFlight]);

  // Three.js 3D Globe Render Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 550;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a12);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // 2. Globe Group (Rotatable)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeRadius = 2.0;

    // Base Sphere
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x091428,
      emissive: 0x030814,
      shininess: 25,
      wireframe: false,
    });
    const globeSphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeSphere);

    // Tactical Wireframe Latitude/Longitude Grid
    const wireframeGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(globeRadius * 1.002, 32, 16));
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.25 });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    globeGroup.add(wireframe);

    // Glowing Outer Atmosphere Rim
    const atmosGeo = new THREE.SphereGeometry(globeRadius * 1.15, 32, 32);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(0.06, 0.71, 0.83, 1.0) * intensity * 1.5;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // 4. Draw Airport Dots on Globe
    const airportPinsGroup = new THREE.Group();
    globeGroup.add(airportPinsGroup);

    AIRPORTS.forEach((apt) => {
      const pos = latLonToVector3(apt.lat, apt.lon, globeRadius * 1.005);
      const dotGeo = new THREE.SphereGeometry(0.02, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      airportPinsGroup.add(dot);
    });

    // 5. Dynamic Flight Arcs & Aircraft Mesh Markers
    const flightsVisualGroup = new THREE.Group();
    globeGroup.add(flightsVisualGroup);

    const raycastObjects = [];

    flights.forEach((flight) => {
      const origin = getAirportByIcao(flight.originIcao);
      const dest = getAirportByIcao(flight.destIcao);
      if (!origin || !dest) return;

      const isCurrent = flight.flightNo === selectedFlight.flightNo;

      const startVec = latLonToVector3(origin.lat, origin.lon, globeRadius);
      const endVec = latLonToVector3(dest.lat, dest.lon, globeRadius);

      // Arc curve control point elevated above globe
      const midVec = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
      const distance = startVec.distanceTo(endVec);
      const elevation = Math.min(1.5, 0.25 + distance * 0.25);
      midVec.normalize().multiplyScalar(globeRadius + elevation);

      const curve = new THREE.QuadraticBezierCurve3(startVec, midVec, endVec);
      const points = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcMat = new THREE.LineBasicMaterial({
        color: isCurrent ? 0x06b6d4 : 0x0284c7,
        transparent: true,
        opacity: isCurrent ? 0.95 : 0.4,
        linewidth: isCurrent ? 3 : 1,
      });

      const arcLine = new THREE.Line(arcGeo, arcMat);
      flightsVisualGroup.add(arcLine);

      // Interpolate current plane position along curve
      const planePos = curve.getPoint(flight.progressPct / 100);

      // Aircraft marker (Cone / Triangle)
      const planeGeo = new THREE.ConeGeometry(0.04, 0.1, 8);
      planeGeo.rotateX(Math.PI / 2);
      const planeMat = new THREE.MeshStandardMaterial({
        color: isCurrent ? 0x38bdf8 : 0xf59e0b,
        emissive: isCurrent ? 0x06b6d4 : 0x78350f,
        roughness: 0.2,
      });
      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      planeMesh.position.copy(planePos);

      // Orient plane towards tangent of curve
      const tangent = curve.getTangent(flight.progressPct / 100);
      planeMesh.lookAt(planePos.clone().add(tangent));
      planeMesh.userData = { flight };

      flightsVisualGroup.add(planeMesh);
      raycastObjects.push(planeMesh);

      // Glow halo ring around active plane
      if (isCurrent) {
        const ringGeo = new THREE.RingGeometry(0.06, 0.08, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(planePos);
        ring.lookAt(planePos.clone().multiplyScalar(2));
        flightsVisualGroup.add(ring);
      }
    });

    // 6. Interactive Mouse Drag to Rotate & Raycasting
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.006;
      globeGroup.rotation.x += deltaY * 0.006;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastObjects);

      if (intersects.length > 0) {
        const clickedPlane = intersects[0].object.userData.flight;
        if (clickedPlane) {
          setSelectedFlight(clickedPlane);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('click', onClick);

    // Zoom on Wheel
    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.min(8.0, Math.max(3.0, camera.position.z + e.deltaY * 0.003));
    };
    dom.addEventListener('wheel', onWheel, { passive: false });

    // 7. Render Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        globeGroup.rotation.y += 0.0015;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('click', onClick);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [flights, selectedFlight, autoRotate]);

  const originApt = getAirportByIcao(activeFlight.originIcao);
  const destApt = getAirportByIcao(activeFlight.destIcao);
  const acProfile = getAircraftById(activeFlight.aircraftId);

  return (
    <div className="space-y-6">
      {/* Top Banner & Search Controls */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Real-Time 3D Live Flight Radar & Fleet Tracker
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                {flights.length} AIRBORNE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive 3D Earth: drag to orbit, scroll to zoom, click aircraft marker or flight feed to inspect.
            </p>
          </div>
        </div>

        {/* Search input & auto-rotate toggle */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search flight (e.g. AI-101, A320)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080c14] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              autoRotate
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {autoRotate ? 'Rotate: ON' : 'Rotate: OFF'}
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Globe (8 cols) + Live Radar Feed & Telemetry (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D WebGL Globe Viewport */}
        <div className="lg:col-span-8 bg-[#090f1d] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative flex flex-col min-h-[520px]">
          {/* Globe Canvas Container */}
          <div ref={mountRef} className="w-full h-full min-h-[460px] flex-1 cursor-grab active:cursor-grabbing select-none" />

          {/* Tactical Floating Flight Pill Over Globe */}
          <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md rounded-xl p-3 shadow-xl max-w-xs font-mono text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold text-sm">{activeFlight.flightNo}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {activeFlight.status}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="text-white font-bold">{activeFlight.originIcao}</span>
              <span className="text-slate-500">→</span>
              <span className="text-white font-bold">{activeFlight.destIcao}</span>
              <span className="text-slate-500">({originApt?.city} to {destApt?.city})</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
              <span>CRZ: <strong className="text-cyan-300">FL{activeFlight.altitudeFL}</strong></span>
              <span>GS: <strong className="text-emerald-300">{activeFlight.groundSpeedKt} KT</strong></span>
              <span>PROG: <strong className="text-amber-300">{activeFlight.progressPct}%</strong></span>
            </div>
          </div>

          {/* Quick instructions footer */}
          <div className="border-t border-slate-800/80 bg-[#060a12] px-4 py-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Left-click & drag to rotate globe • Scroll wheel to zoom in/out</span>
            <span className="text-cyan-400">WebGL 3D Engine Active</span>
          </div>
        </div>

        {/* Live Flight Telemetry & Radar Stream (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Flight Telemetry Card */}
          <div className="bg-[#0c1424] border border-cyan-900/50 rounded-xl p-5 shadow-xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Plane className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Live Flight Telemetry
                </h3>
              </div>
              <span className="text-xs font-bold text-cyan-300">{activeFlight.flightNo}</span>
            </div>

            {/* Airframe & Airline */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Airline:</span>
                <span className="text-white font-semibold">{activeFlight.airline}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Airframe:</span>
                <span className="text-sky-300 font-semibold">{acProfile.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Registration / Callsign:</span>
                <span className="text-slate-300">{activeFlight.reg} • {activeFlight.callsign}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Squawk Transponder:</span>
                <span className="text-amber-400">{activeFlight.squawk} (Mode-S)</span>
              </div>
            </div>

            {/* Route Progress Bar */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Flight Progress</span>
                <span className="text-cyan-300 font-bold">{activeFlight.progressPct}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${activeFlight.progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>DEP: {activeFlight.originIcao}</span>
                <span>ETA: ~{activeFlight.etaMin} min</span>
                <span>ARR: {activeFlight.destIcao}</span>
              </div>
            </div>

            {/* Live Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
              <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Altitude</span>
                <span className="text-cyan-300 font-bold">FL{activeFlight.altitudeFL}</span>
              </div>
              <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Groundspeed</span>
                <span className="text-emerald-300 font-bold">{activeFlight.groundSpeedKt} KT</span>
              </div>
              <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Fuel Flow</span>
                <span className="text-amber-300 font-bold">{activeFlight.fuelFlowKgHr.toLocaleString()} kg/hr</span>
              </div>
              <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Fuel Remaining</span>
                <span className="text-slate-100 font-bold">{activeFlight.fuelRemainingKg.toLocaleString()} kg</span>
              </div>
            </div>

            {/* Action: Transfer flight to Fuel Planner / Optimizer */}
            {onSelectFlightForDispatch && (
              <button
                onClick={() => onSelectFlightForDispatch(activeFlight)}
                className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all font-mono"
              >
                <span>Load into Fuel Optimizer & OFP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Active Fleet List Selector */}
          <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-300">Live Aircraft Feed</span>
              <span className="text-[10px] text-slate-500">{filteredFlights.length} tracked</span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {filteredFlights.map((flight) => {
                const isCurrent = flight.flightNo === activeFlight.flightNo;
                return (
                  <button
                    key={flight.flightNo}
                    onClick={() => setSelectedFlight(flight)}
                    className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200 shadow-sm shadow-cyan-500/10'
                        : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white">{flight.flightNo}</span>
                        <span className="text-[10px] text-slate-400">({flight.reg})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {flight.originIcao} → {flight.destIcao} • FL{flight.altitudeFL}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-emerald-400">{flight.groundSpeedKt} KT</span>
                      <span className="text-[9px] text-slate-500 block">{flight.progressPct}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
