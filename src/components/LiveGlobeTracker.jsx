import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { Plane, Search, Radio, Compass, Fuel, Flame, Gauge, ArrowRight, Filter, ShieldCheck, MapPin, X, Clock, Cloud, Layers, Zap, RotateCcw } from 'lucide-react';
import { INITIAL_LIVE_FLIGHTS, advanceFlightTelemetry } from '../data/liveFlights';
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

import { generateRealisticEarthTexture } from '../engine/earthTextureGenerator';

export default function LiveGlobeTracker({ onSelectFlightForDispatch }) {
  const mountRef = useRef(null);
  
  // State
  const [selectedFlightNumber, setSelectedFlightNumber] = useState(INITIAL_LIVE_FLIGHTS[0].flightNo);
  const [searchQuery, setSearchQuery] = useState('');
  const [airlineFilter, setAirlineFilter] = useState('ALL');
  const [altitudeFilter, setAltitudeFilter] = useState('ALL');
  const [autoRotate, setAutoRotate] = useState(true);
  const [flights, setFlights] = useState(INITIAL_LIVE_FLIGHTS);
  const [hoveredFlight, setHoveredFlight] = useState(null);
  const [hoveredAirport, setHoveredAirport] = useState(null);
  const [showAirports, setShowAirports] = useState(true);
  const [mouseScreenPos, setMouseScreenPos] = useState({ x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);

  // Refs for Three.js instance objects (Persist across renders without recreation!)
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const globeGroupRef = useRef(null);
  const airportPinsGroupRef = useRef(null);
  const airportMeshesRef = useRef([]); // Airport raycasting targets
  const flightObjectsMapRef = useRef(new Map()); // Map flightNo -> { mesh, halo, arcLine, curve }
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });
  const targetGlobeRotationRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(autoRotate);
  const hoveredFlightRef = useRef(null);
  const hoveredAirportRef = useRef(null);
  const selectedFlightNumRef = useRef(selectedFlightNumber);

  // Sync refs with state
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    selectedFlightNumRef.current = selectedFlightNumber;
  }, [selectedFlightNumber]);

  // Real-Time 1 Hz Telemetry Advancement Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFlights((prevFlights) => prevFlights.map((f) => advanceFlightTelemetry(f)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtered flights calculation
  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
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

      if (airlineFilter !== 'ALL' && f.airline !== airlineFilter) {
        return false;
      }

      if (altitudeFilter === 'HIGH' && f.altitudeFL < 360) return false;
      if (altitudeFilter === 'MID' && (f.altitudeFL < 250 || f.altitudeFL >= 360)) return false;
      if (altitudeFilter === 'LOW' && f.altitudeFL >= 250) return false;

      return true;
    });
  }, [flights, searchQuery, airlineFilter, altitudeFilter]);

  const uniqueAirlines = useMemo(() => {
    return Array.from(new Set(INITIAL_LIVE_FLIGHTS.map((f) => f.airline))).sort();
  }, []);

  const activeFlight = useMemo(() => {
    return flights.find((f) => f.flightNo === selectedFlightNumber) || flights[0];
  }, [flights, selectedFlightNumber]);

  // =========================================================================
  // 1. INITIALIZE THREE.JS SCENE ONCE ON COMPONENT MOUNT
  // =========================================================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040812);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x040812, 1);
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Rotatable Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const globeRadius = 2.0;

    // Base Textured Earth Sphere (Photorealistic Earth with Biomes, Mountains & Clouds)
    const earthTexture = generateRealisticEarthTexture();
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const sphereMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.55,
      metalness: 0.05,
      emissive: 0x020612,
      emissiveIntensity: 0.25,
    });
    const globeSphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeSphere);

    // Glowing Atmosphere Rim (Rayleigh blue/cyan troposphere scattering)
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
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.08, 0.72, 0.95, 1.0) * intensity * 1.6;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere);

    // Lighting (Warm Sun Illumination + Soft Cosmic Ambient)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    sunLight.position.set(7, 5, 6);
    scene.add(sunLight);

    // Airport Node Pins (Flightradar24 Global Airport Radar Green Dots)
    const airportPinsGroup = new THREE.Group();
    globeGroup.add(airportPinsGroup);
    airportPinsGroupRef.current = airportPinsGroup;
    airportMeshesRef.current = [];

    const dotGeo = new THREE.SphereGeometry(0.022, 10, 10);
    const beaconRingGeo = new THREE.RingGeometry(0.026, 0.038, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });

    AIRPORTS.forEach((apt) => {
      const pos = latLonToVector3(apt.lat, apt.lon, globeRadius * 1.008);
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      dot.userData = { isAirport: true, airport: apt };

      const ring = new THREE.Mesh(beaconRingGeo, beaconMat);
      ring.position.copy(pos);
      ring.lookAt(pos.clone().multiplyScalar(2));

      airportPinsGroup.add(dot);
      airportPinsGroup.add(ring);
      airportMeshesRef.current.push(dot);
    });

    // 3. Shared Reusable Geometries & Materials for Flights
    const sharedPlaneGeo = new THREE.ConeGeometry(0.045, 0.11, 8);
    sharedPlaneGeo.rotateX(Math.PI / 2);

    const sharedPlaneMatActive = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x06b6d4,
      roughness: 0.1,
    });

    const sharedPlaneMatInactive = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xb45309,
      roughness: 0.2,
    });

    const sharedRingGeo = new THREE.RingGeometry(0.06, 0.085, 16);
    const sharedRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });

    // Instantiate all flight 3D objects once
    const flightMap = new Map();
    const flightsGroup = new THREE.Group();
    globeGroup.add(flightsGroup);

    INITIAL_LIVE_FLIGHTS.forEach((flight) => {
      const origin = getAirportByIcao(flight.originIcao);
      const dest = getAirportByIcao(flight.destIcao);
      if (!origin || !dest) return;

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
        color: 0x1e3a8a,
        transparent: true,
        opacity: 0.3,
      });

      const arcLine = new THREE.Line(arcGeo, arcMat);
      flightsGroup.add(arcLine);

      // Plane Mesh
      const planeMesh = new THREE.Mesh(sharedPlaneGeo, sharedPlaneMatInactive.clone());
      planeMesh.userData = { flightNo: flight.flightNo };
      flightsGroup.add(planeMesh);

      // Halo Ring
      const haloMesh = new THREE.Mesh(sharedRingGeo, sharedRingMat);
      haloMesh.visible = false;
      flightsGroup.add(haloMesh);

      flightMap.set(flight.flightNo, {
        mesh: planeMesh,
        halo: haloMesh,
        arcLine: arcLine,
        curve: curve,
      });
    });

    flightObjectsMapRef.current = flightMap;

    // 4. Fluid Mouse Drag, Zoom & Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      rotationVelocityRef.current = { x: 0, y: 0 };
    };

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setMouseScreenPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      // Fast Raycast check on hover (Aircraft + World Airports)
      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(flightObjectsMapRef.current.values()).map((v) => v.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const fNo = intersects[0].object.userData.flightNo;
        const flt = INITIAL_LIVE_FLIGHTS.find((f) => f.flightNo === fNo);
        hoveredFlightRef.current = flt;
        setHoveredFlight(flt);
        hoveredAirportRef.current = null;
        setHoveredAirport(null);
      } else {
        hoveredFlightRef.current = null;
        setHoveredFlight(null);

        // Check Airport Pins
        const aptIntersects = raycaster.intersectObjects(airportMeshesRef.current);
        if (aptIntersects.length > 0) {
          const apt = aptIntersects[0].object.userData.airport;
          hoveredAirportRef.current = apt;
          setHoveredAirport(apt);
        } else {
          hoveredAirportRef.current = null;
          setHoveredAirport(null);
        }
      }

      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      rotationVelocityRef.current = {
        x: deltaX * 0.003,
        y: deltaY * 0.003,
      };

      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(flightObjectsMapRef.current.values()).map((v) => v.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const fNo = intersects[0].object.userData.flightNo;
        if (fNo) setSelectedFlightNumber(fNo);
        return;
      }

      // Check Airport Click (Smooth Camera Focus on Airport)
      const aptIntersects = raycaster.intersectObjects(airportMeshesRef.current);
      if (aptIntersects.length > 0) {
        const apt = aptIntersects[0].object.userData.airport;
        if (apt) {
          const pos = latLonToVector3(apt.lat, apt.lon, globeRadius);
          const targetY = -Math.atan2(pos.x, pos.z);
          globeGroup.rotation.y = targetY;
          globeGroup.rotation.x = ((apt.lat * Math.PI) / 180) * 0.4;
          setHoveredAirport(apt);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('click', onClick);

    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.min(8.0, Math.max(2.8, camera.position.z + e.deltaY * 0.003));
    };
    dom.addEventListener('wheel', onWheel, { passive: false });

    // 5. 60 FPS Render Loop with Smooth Velocity Damping
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Inertial rotation damping
      if (!isDraggingRef.current) {
        globeGroup.rotation.y += rotationVelocityRef.current.x;
        globeGroup.rotation.x += rotationVelocityRef.current.y;
        rotationVelocityRef.current.x *= 0.92;
        rotationVelocityRef.current.y *= 0.92;

        // Auto-rotation when idle
        if (autoRotateRef.current && !hoveredFlightRef.current) {
          globeGroup.rotation.y += 0.0015;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('click', onClick);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []); // Run ONCE on mount!

  // =========================================================================
  // 2. EFFICIENT IN-PLACE UPDATE OF PLANES (Zero Scene Re-creation!)
  // =========================================================================
  useEffect(() => {
    const flightMap = flightObjectsMapRef.current;
    if (!flightMap || flightMap.size === 0) return;

    flights.forEach((flight) => {
      const obj = flightMap.get(flight.flightNo);
      if (!obj) return;

      const isSelected = flight.flightNo === selectedFlightNumber;
      const isVisible = filteredFlights.some((f) => f.flightNo === flight.flightNo);

      obj.mesh.visible = isVisible;
      obj.arcLine.visible = isVisible;

      if (!isVisible) return;

      // Update position along curve
      const pos = obj.curve.getPoint(flight.progressPct / 100);
      obj.mesh.position.copy(pos);

      const tangent = obj.curve.getTangent(flight.progressPct / 100);
      obj.mesh.lookAt(pos.clone().add(tangent));

      // Update selection styling
      if (isSelected) {
        obj.mesh.material.color.setHex(0x38bdf8);
        obj.mesh.material.emissive.setHex(0x06b6d4);
        obj.arcLine.material.color.setHex(0x06b6d4);
        obj.arcLine.material.opacity = 0.95;

        obj.halo.visible = true;
        obj.halo.position.copy(pos);
        obj.halo.lookAt(pos.clone().multiplyScalar(2));
      } else {
        obj.mesh.material.color.setHex(0xf59e0b);
        obj.mesh.material.emissive.setHex(0xb45309);
        obj.arcLine.material.color.setHex(0x1e3a8a);
        obj.arcLine.material.opacity = 0.3;
        obj.halo.visible = false;
      }
    });
  }, [flights, selectedFlightNumber, filteredFlights]);

  const originApt = getAirportByIcao(activeFlight.originIcao);
  const destApt = getAirportByIcao(activeFlight.destIcao);
  const acProfile = getAircraftById(activeFlight.aircraftId);

  // Focus Camera button
  const handleFocusOnPlane = () => {
    const obj = flightObjectsMapRef.current.get(activeFlight.flightNo);
    const globeGroup = globeGroupRef.current;
    if (obj && globeGroup) {
      const pos = obj.curve.getPoint(activeFlight.progressPct / 100);
      const targetY = -Math.atan2(pos.x, pos.z);
      globeGroup.rotation.y = targetY;
      globeGroup.rotation.x = 0.1;
    }
  };

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
                Global Air Traffic Radar — Real-Time 3D Earth
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                {filteredFlights.length} / {flights.length} AIRBORNE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 font-mono hidden sm:inline-flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{AIRPORTS.length} AIRPORTS (GREEN BEACONS)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Flightradar24-grade 3D global air traffic: click any aircraft or green airport beacon to inspect telemetry and runways.
            </p>
          </div>
        </div>

        {/* Search, Filter Toggles & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
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

          <button
            onClick={handleFocusOnPlane}
            className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono transition-all"
            title="Focus camera on selected plane"
          >
            Track Plane
          </button>

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
              <option value="HIGH">High Cruise (FL360 - FL470)</option>
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

          {/* Flight Hover Tooltip Capsule */}
          {hoveredFlight && (
            <div
              className="absolute z-20 pointer-events-none bg-[#090e1a]/95 border border-cyan-500/80 rounded-xl p-3 shadow-2xl backdrop-blur-md font-mono text-xs text-white max-w-xs transition-opacity duration-150"
              style={{
                left: `${mouseScreenPos.x + 16}px`,
                top: `${mouseScreenPos.y + 16}px`,
                transform: mouseScreenPos.x > 450 ? 'translateX(-100%)' : 'none',
              }}
            >
              <div className="flex items-center justify-between space-x-3 mb-1">
                <span className="font-bold text-cyan-300 text-sm">{hoveredFlight.flightNo}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {hoveredFlight.airline}
                </span>
              </div>
              <div className="text-[11px] text-slate-200 font-sans font-medium">
                <strong className="text-emerald-400 font-mono">{hoveredFlight.originIcao}</strong> ({getAirportByIcao(hoveredFlight.originIcao)?.city || hoveredFlight.originIcao}) ➔ <strong className="text-amber-400 font-mono">{hoveredFlight.destIcao}</strong> ({getAirportByIcao(hoveredFlight.destIcao)?.city || hoveredFlight.destIcao})
              </div>
              <div className="text-[10px] text-slate-400 pt-1 mt-1 border-t border-slate-800 flex justify-between font-mono">
                <span>FL{hoveredFlight.altitudeFL} • {hoveredFlight.groundSpeedKt} KT</span>
                <span className="text-emerald-300 font-bold">ETA: ~{hoveredFlight.etaMin}m</span>
              </div>
            </div>
          )}

          {/* Airport Hover Tooltip Capsule (Green Radar Marker) */}
          {hoveredAirport && !hoveredFlight && (
            <div
              className="absolute z-20 pointer-events-none bg-[#04130d]/95 border border-emerald-500/90 rounded-xl p-3 shadow-2xl backdrop-blur-md font-mono text-xs text-emerald-300 max-w-xs transition-opacity duration-150"
              style={{
                left: `${mouseScreenPos.x + 16}px`,
                top: `${mouseScreenPos.y + 16}px`,
                transform: mouseScreenPos.x > 450 ? 'translateX(-100%)' : 'none',
              }}
            >
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-bold text-white text-sm">{hoveredAirport.icao}</span>
                  <span className="text-emerald-400 font-bold">({hoveredAirport.iata})</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-700 font-bold">
                  AIRPORT
                </span>
              </div>
              <div className="text-slate-100 font-sans font-bold text-xs">{hoveredAirport.name}</div>
              <div className="text-slate-400 text-[11px] font-sans">{hoveredAirport.city}, {hoveredAirport.country}</div>
              <div className="text-[10px] text-slate-400 pt-1.5 mt-1 border-t border-emerald-900/60 grid grid-cols-2 gap-1 font-mono">
                <span>Elev: <strong className="text-slate-200">{hoveredAirport.elevationFt} ft</strong></span>
                <span>Rwy: <strong className="text-slate-200">{hoveredAirport.runways || '09/27'}</strong></span>
                <span className="col-span-2 text-emerald-400/80">Click to rotate & focus camera</span>
              </div>
            </div>
          )}

          {/* Tactical Active Flight Floating Capsule */}
          <div className="absolute top-4 left-4 bg-slate-900/95 border border-slate-700/80 backdrop-blur-md rounded-xl p-3.5 shadow-xl max-w-sm font-mono text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold text-sm">{activeFlight.flightNo}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {activeFlight.status}
              </span>
            </div>
            <div className="text-slate-200 font-sans text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-emerald-400 font-bold font-mono">{activeFlight.originIcao}</span>
                <span className="text-slate-400 text-[11px]">({originApt?.name || originApt?.city})</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                <span>➔ ARR:</span>
                <span className="text-amber-400 font-bold font-mono">{activeFlight.destIcao}</span>
                <span>({destApt?.name || destApt?.city})</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800 flex justify-between">
              <span>CRZ: <strong className="text-cyan-300">FL{activeFlight.altitudeFL}</strong></span>
              <span>GS: <strong className="text-emerald-300">{activeFlight.groundSpeedKt} KT</strong></span>
              <span>ETA: <strong className="text-emerald-400">~{activeFlight.etaMin}m ({activeFlight.progressPct}%)</strong></span>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="border-t border-slate-800/80 bg-[#060a12] px-4 py-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Left-click & drag to rotate • Scroll wheel to zoom in/out • Click any plane</span>
            <span className="text-cyan-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time 1 Hz ADS-B Telemetry Stream</span>
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

            {/* City Pair Route Card with Full Airport Names */}
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="max-w-[45%]">
                  <span className="text-lg font-bold text-emerald-400 block">{activeFlight.originIcao} / {originApt?.iata || '---'}</span>
                  <span className="text-xs text-slate-200 font-sans font-bold line-clamp-1">{originApt?.city || 'Origin'}</span>
                  <span className="text-[10px] text-slate-400 font-sans line-clamp-1">{originApt?.name || ''}</span>
                </div>

                <div className="flex-1 mx-2 text-center">
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Enroute</span>
                  <div className="w-full h-1 bg-slate-700 rounded-full relative my-1 overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 transition-all duration-300"
                      style={{ width: `${activeFlight.progressPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-cyan-300 font-bold">{activeFlight.progressPct}%</span>
                </div>

                <div className="text-right max-w-[45%]">
                  <span className="text-lg font-bold text-amber-400 block">{activeFlight.destIcao} / {destApt?.iata || '---'}</span>
                  <span className="text-xs text-slate-200 font-sans font-bold line-clamp-1">{destApt?.city || 'Destination'}</span>
                  <span className="text-[10px] text-slate-400 font-sans line-clamp-1">{destApt?.name || ''}</span>
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
                <span className="text-[9px] text-slate-500 block">{activeFlight.reg} • {acProfile.category}</span>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Estimated Arrival</span>
                <span className="text-sm font-bold text-slate-100">~{activeFlight.etaMin} min</span>
                <span className="text-[9px] text-emerald-400 block">On Schedule</span>
              </div>
            </div>

            {/* Fuel Telemetry & Real-Time Counters */}
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
                    onClick={() => setSelectedFlightNumber(flight.flightNo)}
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
