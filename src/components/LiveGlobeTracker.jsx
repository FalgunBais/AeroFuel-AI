import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Plane, Search, Radio, Compass, Fuel, Flame, Gauge, ArrowRight, CheckCircle2, Navigation, Eye, Filter, ShieldCheck, MapPin, X, Clock, Cloud, Layers } from 'lucide-react';
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

// Generate realistic procedural Earth Map Texture with Continents, Oceans & City Lights
function createEarthCanvasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep Ocean Blue Base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#040b17');
  oceanGrad.addColorStop(0.5, '#07152d');
  oceanGrad.addColorStop(1, '#040b17');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Tactical Lat/Lon Graticule Lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  for (let lat = 0; lat <= canvas.height; lat += canvas.height / 12) {
    ctx.beginPath();
    ctx.moveTo(0, lat);
    ctx.lineTo(canvas.width, lat);
    ctx.stroke();
  }
  for (let lon = 0; lon <= canvas.width; lon += canvas.width / 24) {
    ctx.beginPath();
    ctx.moveTo(lon, 0);
    ctx.lineTo(lon, canvas.height);
    ctx.stroke();
  }

  // Draw Continents Landmass Polygons (Equirectangular projection)
  ctx.fillStyle = '#0f243e';
  ctx.strokeStyle = '#1e4b7a';
  ctx.lineWidth = 1.5;

  const toX = (lon) => ((lon + 180) / 360) * canvas.width;
  const toY = (lat) => ((90 - lat) / 180) * canvas.height;

  function drawLandPoly(coords) {
    if (coords.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(toX(coords[0][1]), toY(coords[0][0]));
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(toX(coords[i][1]), toY(coords[i][0]));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Simplified continental land polygons
  // 1. Indian Subcontinent & South Asia
  drawLandPoly([[35, 74], [30, 68], [24, 68], [19, 72], [10, 76], [8, 77], [13, 80], [21, 87], [26, 92], [28, 88], [34, 78]]);
  // 2. Southeast Asia & Indonesia
  drawLandPoly([[22, 92], [15, 100], [10, 98], [1, 103], [-6, 106], [-8, 115], [-5, 120], [6, 117], [16, 108], [21, 105]]);
  // 3. East Asia (China, Japan, Korea)
  drawLandPoly([[42, 80], [50, 120], [40, 128], [35, 129], [32, 121], [22, 114], [25, 100], [38, 90]]);
  drawLandPoly([[44, 142], [38, 140], [34, 132], [32, 130], [36, 138], [43, 145]]); // Japan
  // 4. Middle East & Arabian Peninsula
  drawLandPoly([[37, 36], [32, 35], [28, 34], [22, 38], [12, 44], [16, 53], [25, 57], [30, 48], [36, 42]]);
  // 5. Europe & British Isles
  drawLandPoly([[70, 25], [60, 5], [52, 2], [44, -1], [36, -6], [36, 14], [40, 26], [46, 14], [54, 12], [58, 28], [65, 32]]);
  drawLandPoly([[58, -5], [50, -5], [51, 1], [56, -2]]); // UK
  // 6. Africa
  drawLandPoly([[36, -6], [32, 32], [12, 44], [0, 42], [-26, 32], [-34, 18], [-22, 14], [4, 9], [12, -15], [30, -10]]);
  // 7. North America
  drawLandPoly([[70, -165], [60, -140], [48, -125], [30, -115], [20, -105], [15, -90], [25, -80], [42, -70], [55, -60], [70, -70], [72, -125]]);
  // 8. South America
  drawLandPoly([[12, -75], [5, -52], [-5, -35], [-22, -40], [-55, -68], [-40, -73], [-15, -75], [0, -80]]);
  // 9. Australia
  drawLandPoly([[-12, 130], [-15, 145], [-28, 153], [-38, 145], [-35, 115], [-20, 114]]);

  // Night city illumination clusters
  ctx.fillStyle = '#38bdf8';
  const majorCities = [
    [28.56, 77.10], [19.08, 72.86], [13.19, 77.70], [12.99, 80.17], [22.65, 88.44], [17.24, 78.42], // India
    [25.25, 55.36], [24.43, 54.65], [25.27, 51.60], [24.95, 46.69], // Middle East
    [51.47, -0.45], [49.00, 2.54], [50.03, 8.56], [52.31, 4.76], // Europe
    [40.64, -73.77], [41.97, -87.90], [33.94, -118.40], [37.62, -122.37], [25.79, -80.28], // US
    [1.36, 103.99], [35.54, 139.77], [22.30, 113.91], [13.69, 100.75], [-33.93, 151.17] // Asia/Aus
  ];

  majorCities.forEach(([lat, lon]) => {
    const x = toX(lon);
    const y = toY(lat);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 6);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
    glow.addColorStop(0.5, 'rgba(6, 182, 212, 0.4)');
    glow.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export default function LiveGlobeTracker({ onSelectFlightForDispatch }) {
  const mountRef = useRef(null);
  const [selectedFlight, setSelectedFlight] = useState(LIVE_FLIGHTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [airlineFilter, setAirlineFilter] = useState('ALL');
  const [altitudeFilter, setAltitudeFilter] = useState('ALL');
  const [autoRotate, setAutoRotate] = useState(true);
  const [flights, setFlights] = useState(LIVE_FLIGHTS);
  const [hoveredFlight, setHoveredFlight] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);

  // Live simulation tick: gradually advance aircraft progress along route
  useEffect(() => {
    const interval = setInterval(() => {
      setFlights((prev) =>
        prev.map((f) => {
          let newProgress = f.progressPct + 0.06;
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

  // Filter flights by search, airline, and altitude
  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          f.flightNo.toLowerCase().includes(q) ||
          f.reg.toLowerCase().includes(q) ||
          f.airline.toLowerCase().includes(q) ||
          f.originIcao.toLowerCase().includes(q) ||
          f.destIcao.toLowerCase().includes(q) ||
          f.aircraftId.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Airline filter
      if (airlineFilter !== 'ALL' && f.airline !== airlineFilter) {
        return false;
      }

      // Altitude filter
      if (altitudeFilter === 'HIGH' && f.altitudeFL < 360) return false;
      if (altitudeFilter === 'MID' && (f.altitudeFL < 250 || f.altitudeFL >= 360)) return false;
      if (altitudeFilter === 'LOW' && f.altitudeFL >= 250) return false;

      return true;
    });
  }, [flights, searchQuery, airlineFilter, altitudeFilter]);

  // Unique airlines for dropdown
  const uniqueAirlines = useMemo(() => {
    return Array.from(new Set(flights.map((f) => f.airline))).sort();
  }, [flights]);

  // Active Flight
  const activeFlight = useMemo(() => {
    return flights.find((f) => f.flightNo === selectedFlight.flightNo) || flights[0];
  }, [flights, selectedFlight]);

  // Three.js 3D Globe Render Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 600;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040812);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // 2. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeRadius = 2.0;

    // Earth Texture & Sphere
    const earthTexture = createEarthCanvasTexture();
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const sphereMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.7,
      metalness: 0.1,
      emissive: 0x030814,
      emissiveIntensity: 0.4,
    });
    const globeSphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeSphere);

    // Glowing Outer Atmosphere Rim
    const atmosGeo = new THREE.SphereGeometry(globeRadius * 1.14, 32, 32);
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
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.06, 0.71, 0.83, 1.0) * intensity * 1.4;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xe0f2fe, 1.4);
    sunLight.position.set(6, 4, 6);
    scene.add(sunLight);

    // 4. Airport Node Pins
    const airportPinsGroup = new THREE.Group();
    globeGroup.add(airportPinsGroup);

    AIRPORTS.forEach((apt) => {
      const pos = latLonToVector3(apt.lat, apt.lon, globeRadius * 1.006);
      const dotGeo = new THREE.SphereGeometry(0.018, 10, 10);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      airportPinsGroup.add(dot);
    });

    // 5. Dynamic Flight Arcs & Aircraft Mesh Markers
    const flightsVisualGroup = new THREE.Group();
    globeGroup.add(flightsVisualGroup);

    const raycastObjects = [];

    filteredFlights.forEach((flight) => {
      const origin = getAirportByIcao(flight.originIcao);
      const dest = getAirportByIcao(flight.destIcao);
      if (!origin || !dest) return;

      const isCurrent = flight.flightNo === selectedFlight.flightNo;

      const startVec = latLonToVector3(origin.lat, origin.lon, globeRadius);
      const endVec = latLonToVector3(dest.lat, dest.lon, globeRadius);

      const midVec = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
      const distance = startVec.distanceTo(endVec);
      const elevation = Math.min(1.4, 0.2 + distance * 0.22);
      midVec.normalize().multiplyScalar(globeRadius + elevation);

      const curve = new THREE.QuadraticBezierCurve3(startVec, midVec, endVec);
      const points = curve.getPoints(40);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcMat = new THREE.LineBasicMaterial({
        color: isCurrent ? 0x06b6d4 : 0x1e3a8a,
        transparent: true,
        opacity: isCurrent ? 0.95 : 0.25,
      });

      const arcLine = new THREE.Line(arcGeo, arcMat);
      flightsVisualGroup.add(arcLine);

      // Current plane position
      const planePos = curve.getPoint(flight.progressPct / 100);

      // Aircraft marker
      const planeGeo = new THREE.ConeGeometry(0.045, 0.11, 8);
      planeGeo.rotateX(Math.PI / 2);
      const planeMat = new THREE.MeshStandardMaterial({
        color: isCurrent ? 0x38bdf8 : 0xf59e0b,
        emissive: isCurrent ? 0x06b6d4 : 0xb45309,
        roughness: 0.1,
      });
      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      planeMesh.position.copy(planePos);

      const tangent = curve.getTangent(flight.progressPct / 100);
      planeMesh.lookAt(planePos.clone().add(tangent));
      planeMesh.userData = { flight };

      flightsVisualGroup.add(planeMesh);
      raycastObjects.push(planeMesh);

      // Glow halo ring for active flight
      if (isCurrent) {
        const ringGeo = new THREE.RingGeometry(0.06, 0.085, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(planePos);
        ring.lookAt(planePos.clone().multiplyScalar(2));
        flightsVisualGroup.add(ring);
      }
    });

    // 6. Camera Chase / Auto Focus on Active Plane
    const activeOrigin = getAirportByIcao(activeFlight.originIcao);
    const activeDest = getAirportByIcao(activeFlight.destIcao);
    if (activeOrigin && activeDest) {
      const activeStart = latLonToVector3(activeOrigin.lat, activeOrigin.lon, globeRadius);
      const activeEnd = latLonToVector3(activeDest.lat, activeDest.lon, globeRadius);
      const activeMid = new THREE.Vector3().addVectors(activeStart, activeEnd).multiplyScalar(0.5);
      const activeElev = Math.min(1.4, 0.2 + activeStart.distanceTo(activeEnd) * 0.22);
      activeMid.normalize().multiplyScalar(globeRadius + activeElev);
      const activeCurve = new THREE.QuadraticBezierCurve3(activeStart, activeMid, activeEnd);
      const curPos = activeCurve.getPoint(activeFlight.progressPct / 100);

      // Smoothly target active plane
      const targetRotationY = -Math.atan2(curPos.x, curPos.z);
      globeGroup.rotation.y = THREE.MathUtils.lerp(globeGroup.rotation.y, targetRotationY, 0.03);
    }

    // 7. Interactive Drag & Raycasting
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
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      // Raycast hover check
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastObjects);
      if (intersects.length > 0) {
        setHoveredFlight(intersects[0].object.userData.flight);
      } else {
        setHoveredFlight(null);
      }

      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

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
        const clicked = intersects[0].object.userData.flight;
        if (clicked) setSelectedFlight(clicked);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('click', onClick);

    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.min(8.0, Math.max(2.8, camera.position.z + e.deltaY * 0.003));
    };
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (autoRotate && !isDragging && !hoveredFlight) {
        globeGroup.rotation.y += 0.0012;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 600;
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
  }, [filteredFlights, selectedFlight, autoRotate, hoveredFlight]);

  const originApt = getAirportByIcao(activeFlight.originIcao);
  const destApt = getAirportByIcao(activeFlight.destIcao);
  const acProfile = getAircraftById(activeFlight.aircraftId);

  return (
    <div className="space-y-4">
      {/* Flightradar24 Top Command Bar */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Global Air Traffic Radar — 3D Live Earth
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                {filteredFlights.length} / {flights.length} AIRBORNE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Flightradar24-grade real-time tracking: click any plane on the 3D globe or search to inspect avionics & fuel metrics.
            </p>
          </div>
        </div>

        {/* Search, Filter Toggles & Auto-Rotate */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search flight #, airline, ICAO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080c14] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Filter Modal Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              airlineFilter !== 'ALL' || altitudeFilter !== 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {(airlineFilter !== 'ALL' || altitudeFilter !== 'ALL') && (
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </button>

          {/* Rotate Toggle */}
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

      {/* Expanded Filters Drawer (if open) */}
      {showFilters && (
        <div className="bg-[#091020] border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs shadow-xl animate-fadeIn">
          <div>
            <label className="text-slate-400 block mb-1">Filter by Airline</label>
            <select
              value={airlineFilter}
              onChange={(e) => setAirlineFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
            >
              <option value="ALL">All Airlines ({flights.length} flights)</option>
              {uniqueAirlines.map((airline) => (
                <option key={airline} value={airline}>
                  {airline}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Filter by Flight Level (Altitude)</label>
            <select
              value={altitudeFilter}
              onChange={(e) => setAltitudeFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
            >
              <option value="ALL">All Flight Levels</option>
              <option value="HIGH">High Cruise (FL360 - FL410)</option>
              <option value="MID">Mid Cruise (FL250 - FL350)</option>
              <option value="LOW">Regional / Climb (&lt; FL250)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setAirlineFilter('ALL');
                setAltitudeFilter('ALL');
                setSearchQuery('');
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg border border-slate-700 text-xs"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: 3D Globe (8 cols) + Flightradar24 Telemetry Drawer (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D WebGL Globe Viewport */}
        <div className="lg:col-span-8 bg-[#060a14] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative flex flex-col min-h-[580px]">
          {/* Globe Canvas Container */}
          <div ref={mountRef} className="w-full h-full min-h-[520px] flex-1 cursor-grab active:cursor-grabbing select-none" />

          {/* Interactive Hover Tooltip over Canvas */}
          {hoveredFlight && (
            <div
              className="absolute z-20 pointer-events-none bg-slate-900/95 border border-cyan-500/80 rounded-lg px-3 py-2 shadow-2xl font-mono text-xs text-white backdrop-blur space-y-0.5 transition-all"
              style={{ left: `${mousePos.x + 15}px`, top: `${mousePos.y - 45}px` }}
            >
              <div className="flex items-center space-x-2">
                <Plane className="w-3 h-3 text-cyan-400 transform -rotate-45" />
                <span className="font-bold text-cyan-300">{hoveredFlight.flightNo}</span>
                <span className="text-[10px] text-slate-400">({hoveredFlight.airline})</span>
              </div>
              <div className="text-[11px] text-slate-300">
                {hoveredFlight.originIcao} → {hoveredFlight.destIcao} • <span className="text-emerald-400">FL{hoveredFlight.altitudeFL}</span> • <span className="text-amber-300">{hoveredFlight.groundSpeedKt} KT</span>
              </div>
            </div>
          )}

          {/* Tactical Floating Flight Banner Over Globe */}
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

          {/* Controls Footer */}
          <div className="border-t border-slate-800/80 bg-[#060a12] px-4 py-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Click any plane to inspect • Drag to orbit • Scroll to zoom</span>
            <span className="text-cyan-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live ADS-B Telemetry</span>
            </span>
          </div>
        </div>

        {/* Flightradar24-Style Deep Telemetry Drawer & Flight Feed (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Flight Detail Card */}
          <div className="bg-[#0c1424] border border-cyan-900/60 rounded-xl p-5 shadow-2xl space-y-4 font-mono">
            {/* Header: Flight & Airline */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-white">{activeFlight.flightNo}</span>
                  <span className="text-xs text-slate-400">({activeFlight.callsign})</span>
                </div>
                <span className="text-xs text-cyan-400 font-semibold">{activeFlight.airline}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Mode-S {activeFlight.squawk}
              </span>
            </div>

            {/* City Pair Route Card */}
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-emerald-400">{activeFlight.originIcao}</span>
                  <span className="text-[10px] text-slate-400 block">{originApt?.city} ({originApt?.iata})</span>
                </div>
                <div className="flex-1 mx-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">In-Flight</span>
                  <div className="w-full h-0.5 bg-slate-700 relative my-1">
                    <div
                      className="absolute top-0 left-0 h-full bg-cyan-400"
                      style={{ width: `${activeFlight.progressPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-cyan-300 font-bold">{activeFlight.progressPct}%</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-amber-400">{activeFlight.destIcao}</span>
                  <span className="text-[10px] text-slate-400 block">{destApt?.city} ({destApt?.iata})</span>
                </div>
              </div>
            </div>

            {/* Avionics Live Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Calibrated Altitude</span>
                <span className="text-sm font-bold text-cyan-300">FL{activeFlight.altitudeFL}</span>
                <span className="text-[9px] text-slate-500 block">({(activeFlight.altitudeFL * 100).toLocaleString()} ft)</span>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Ground Speed</span>
                <span className="text-sm font-bold text-emerald-300">{activeFlight.groundSpeedKt} KT</span>
                <span className="text-[9px] text-slate-500 block">TAS: {activeFlight.trueAirspeedKt} KT</span>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Airframe Model</span>
                <span className="text-xs font-bold text-sky-300 truncate block">{acProfile.name}</span>
                <span className="text-[9px] text-slate-500 block">{activeFlight.reg}</span>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Estimated Arrival</span>
                <span className="text-sm font-bold text-slate-100">~{activeFlight.etaMin} min</span>
                <span className="text-[9px] text-emerald-400 block">On Schedule</span>
              </div>
            </div>

            {/* Fuel Telemetry & Emissions */}
            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center space-x-1 text-slate-400">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Current Fuel Flow:</span>
                </span>
                <span className="font-bold text-amber-300">{activeFlight.fuelFlowKgHr.toLocaleString()} kg/hr</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center space-x-1 text-slate-400">
                  <Fuel className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Fuel Remaining:</span>
                </span>
                <span className="font-bold text-slate-100">{activeFlight.fuelRemainingKg.toLocaleString()} kg</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Fuel Burned So Far:</span>
                <span className="font-bold text-rose-400">{activeFlight.fuelBurnedKg.toLocaleString()} kg</span>
              </div>
            </div>

            {/* Transfer to Fuel Optimization & Dispatch */}
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

          {/* Live Flight Feed List */}
          <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-300">Live Global Air Traffic Feed</span>
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
                        <span className="text-[10px] text-slate-400">({flight.airline})</span>
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
