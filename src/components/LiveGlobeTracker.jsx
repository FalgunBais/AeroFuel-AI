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

// Generate single high-res Canvas Texture for Earth
function generateEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep Navy Ocean
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#030a16');
  oceanGrad.addColorStop(0.5, '#061328');
  oceanGrad.addColorStop(1, '#030a16');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lat/Lon Graticules
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
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

  // Continents Landmass Polygons
  ctx.fillStyle = '#0e233d';
  ctx.strokeStyle = '#1b436c';
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

  // 1. Indian Subcontinent & South Asia
  drawLandPoly([[35, 74], [30, 68], [24, 68], [19, 72], [10, 76], [8, 77], [13, 80], [21, 87], [26, 92], [28, 88], [34, 78]]);
  // 2. Southeast Asia & Indonesia
  drawLandPoly([[22, 92], [15, 100], [10, 98], [1, 103], [-6, 106], [-8, 115], [-5, 120], [6, 117], [16, 108], [21, 105]]);
  // 3. East Asia (China, Japan, Korea)
  drawLandPoly([[42, 80], [50, 120], [40, 128], [35, 129], [32, 121], [22, 114], [25, 100], [38, 90]]);
  drawLandPoly([[44, 142], [38, 140], [34, 132], [32, 130], [36, 138], [43, 145]]);
  // 4. Middle East & Arabian Peninsula
  drawLandPoly([[37, 36], [32, 35], [28, 34], [22, 38], [12, 44], [16, 53], [25, 57], [30, 48], [36, 42]]);
  // 5. Europe & British Isles
  drawLandPoly([[70, 25], [60, 5], [52, 2], [44, -1], [36, -6], [36, 14], [40, 26], [46, 14], [54, 12], [58, 28], [65, 32]]);
  drawLandPoly([[58, -5], [50, -5], [51, 1], [56, -2]]);
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
    [28.56, 77.10], [19.08, 72.86], [13.19, 77.70], [12.99, 80.17], [22.65, 88.44], [17.24, 78.42], [10.15, 76.40],
    [25.25, 55.36], [24.43, 54.65], [25.27, 51.60], [24.95, 46.69],
    [51.47, -0.45], [49.00, 2.54], [50.03, 8.56], [52.31, 4.76], [40.48, -3.56],
    [40.64, -73.77], [41.97, -87.90], [33.94, -118.40], [37.62, -122.37], [25.79, -80.28],
    [1.36, 103.99], [35.54, 139.77], [22.30, 113.91], [13.69, 100.75], [-33.93, 151.17]
  ];

  majorCities.forEach(([lat, lon]) => {
    const x = toX(lon);
    const y = toY(lat);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 6);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
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
  
  // State
  const [selectedFlightNumber, setSelectedFlightNumber] = useState(INITIAL_LIVE_FLIGHTS[0].flightNo);
  const [searchQuery, setSearchQuery] = useState('');
  const [airlineFilter, setAirlineFilter] = useState('ALL');
  const [altitudeFilter, setAltitudeFilter] = useState('ALL');
  const [autoRotate, setAutoRotate] = useState(true);
  const [flights, setFlights] = useState(INITIAL_LIVE_FLIGHTS);
  const [hoveredFlight, setHoveredFlight] = useState(null);
  const [mouseScreenPos, setMouseScreenPos] = useState({ x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);

  // Refs for Three.js instance objects (Persist across renders without recreation!)
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const globeGroupRef = useRef(null);
  const flightObjectsMapRef = useRef(new Map()); // Map flightNo -> { mesh, halo, arcLine, curve }
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });
  const targetGlobeRotationRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(autoRotate);
  const hoveredFlightRef = useRef(null);
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

    // Base Textured Earth Sphere
    const earthTexture = generateEarthTexture();
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const sphereMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.1,
      emissive: 0x030814,
      emissiveIntensity: 0.35,
    });
    const globeSphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeSphere);

    // Glowing Atmosphere Rim
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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xe0f2fe, 1.5);
    sunLight.position.set(6, 4, 6);
    scene.add(sunLight);

    // Airport Node Pins
    const airportPinsGroup = new THREE.Group();
    globeGroup.add(airportPinsGroup);

    AIRPORTS.forEach((apt) => {
      const pos = latLonToVector3(apt.lat, apt.lon, globeRadius * 1.005);
      const dotGeo = new THREE.SphereGeometry(0.016, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      airportPinsGroup.add(dot);
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

      // Fast Raycast check on hover
      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(flightObjectsMapRef.current.values()).map((v) => v.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const fNo = intersects[0].object.userData.flightNo;
        const flt = INITIAL_LIVE_FLIGHTS.find((f) => f.flightNo === fNo);
        hoveredFlightRef.current = flt;
        setHoveredFlight(flt);
      } else {
        hoveredFlightRef.current = null;
        setHoveredFlight(null);
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
            </div>
            <p className="text-xs text-slate-400">
              Silky smooth 60 FPS flight radar: click any aircraft on the globe or list to inspect real-time fuel and avionics.
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

          {/* Interactive Hover Tooltip */}
          {hoveredFlight && (
            <div
              className="absolute z-20 pointer-events-none bg-slate-900/95 border border-cyan-500/80 rounded-lg px-3 py-2 shadow-2xl font-mono text-xs text-white backdrop-blur space-y-0.5"
              style={{ left: `${mouseScreenPos.x + 15}px`, top: `${mouseScreenPos.y - 45}px` }}
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

          {/* Tactical Active Flight Floating Capsule */}
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
                      className="absolute top-0 left-0 h-full bg-cyan-400 transition-all duration-300"
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
