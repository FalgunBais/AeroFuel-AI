import * as THREE from 'three';

/**
 * Procedural High-Resolution Photorealistic Earth Texture Generator
 * Renders realistic oceans, bathymetry shelves, deserts, lush vegetation biomes,
 * mountain ranges (Himalayas, Alps, Andes, Rockies), ice caps (Greenland, Antarctica),
 * realistic coastlines, and soft atmospheric cloud bands.
 */
export function generateRealisticEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const width = canvas.width;
  const height = canvas.height;

  const toX = (lon) => ((lon + 180) / 360) * width;
  const toY = (lat) => ((90 - lat) / 180) * height;

  // 1. Deep Ocean Base with Bathymetric Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#0c1a30');      // Polar deep blue
  oceanGrad.addColorStop(0.2, '#0a2347');    // Northern ocean
  oceanGrad.addColorStop(0.5, '#072042');    // Equatorial ocean
  oceanGrad.addColorStop(0.8, '#0a2347');    // Southern ocean
  oceanGrad.addColorStop(1, '#0c1a30');      // Antarctic deep blue
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Helper to draw smooth coastline polygons
  function drawCoast(coords, fillColor, strokeColor = null, strokeWidth = 1) {
    if (coords.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(toX(coords[0][1]), toY(coords[0][0]));
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(toX(coords[i][1]), toY(coords[i][0]));
    }
    ctx.closePath();
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  }

  // Helper for drawing detailed terrain with inner gradient
  function drawBiome(coords, gradientColors) {
    if (coords.length < 3) return;
    let minLat = coords[0][0], maxLat = coords[0][0];
    coords.forEach(([lat]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });

    const grad = ctx.createLinearGradient(0, toY(maxLat), 0, toY(minLat));
    gradientColors.forEach(([pos, col]) => grad.addColorStop(pos, col));

    ctx.beginPath();
    ctx.moveTo(toX(coords[0][1]), toY(coords[0][0]));
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(toX(coords[i][1]), toY(coords[i][0]));
    }
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // ==========================================
  // 3. CONTINENTAL LANDMASSES & BIOMES
  // ==========================================

  // --- EURASIA (Europe, Russia, Asia, Middle East) ---
  const eurasiaCoords = [
    // Scandinavia & Northern Russia
    [71, 28], [70, 42], [68, 60], [72, 80], [75, 110], [77, 140], [70, 168], [65, 175], [60, 165],
    // Kamchatka & East Asia
    [52, 158], [45, 142], [38, 128], [35, 129], [30, 122], [22, 114], [21, 108],
    // Southeast Asia & Indochina
    [10, 105], [8, 103], [13, 100], [20, 97],
    // Bay of Bengal & Indian Subcontinent
    [22, 89], [16, 82], [13, 80], [8, 77], [10, 76], [15, 74], [19, 72], [23, 68], [25, 62],
    // Arabian Sea, Persian Gulf & Middle East
    [24, 57], [27, 50], [30, 48], [28, 35], [31, 35], [35, 36],
    // Mediterranean & Southern Europe
    [37, 28], [39, 20], [38, 15], [37, -6], [38, -9], [43, -9], [44, -1], [48, -4],
    // Western & Northern Europe
    [50, 1], [53, 5], [54, 9], [58, 11], [64, 12], [69, 16], [71, 26]
  ];
  drawBiome(eurasiaCoords, [
    [0.0, '#3e5c38'], // Siberian Tundra / Forest
    [0.3, '#2f5228'], // Russian Taiga
    [0.6, '#3c6b2e'], // Central European Green
    [0.8, '#70683a'], // Steppes & Subtropical
    [1.0, '#8c7643'], // South Asian warm terrain
  ]);

  // --- INDIA & SOUTH ASIA VEGETATION OVERLAY ---
  drawBiome([
    [32, 75], [28, 70], [23, 68], [19, 72], [15, 74], [10, 76], [8, 77],
    [13, 80], [18, 83], [22, 88], [26, 92], [28, 88], [32, 79]
  ], [
    [0, '#4b6e36'],
    [0.5, '#3b6127'],
    [1, '#2d541e'],
  ]);

  // Sri Lanka
  drawCoast([[9.8, 80.2], [7.0, 81.8], [5.9, 80.5], [8.0, 79.8]], '#2f5920');

  // --- SAHARA & ARABIAN DESERT BELT ---
  drawBiome([
    [33, -10], [32, 34], [30, 48], [25, 56], [22, 59], [15, 53], [12, 44],
    [15, 38], [14, 0], [16, -16], [28, -13], [32, -6]
  ], [
    [0.0, '#c79c5e'],
    [0.4, '#d8aa67'],
    [0.7, '#cfa15c'],
    [1.0, '#b88949'],
  ]);

  // --- CENTRAL & SOUTHERN AFRICA ---
  drawBiome([
    [14, -17], [12, 10], [4, 9], [5, 40], [0, 42], [-12, 40], [-26, 33],
    [-34, 18], [-34, 26], [-28, 32], [-18, 12], [-5, 12], [4, 7], [8, -13]
  ], [
    [0.0, '#596932'],
    [0.3, '#1c4516'], // Congo Rainforest
    [0.7, '#2f5420'],
    [1.0, '#666133'], // South African Savanna
  ]);

  // Madagascar
  drawCoast([[-12, 49], [-16, 50], [-25, 47], [-25, 44], [-16, 44]], '#23521b');

  // --- NORTH AMERICA ---
  drawBiome([
    [72, -156], [71, -128], [68, -100], [60, -65], [47, -53], [44, -66], [35, -75],
    [25, -80], [29, -89], [29, -95], [22, -97], [16, -93], [14, -88],
    [8, -77], [16, -95], [23, -106], [32, -117], [38, -123], [48, -125],
    [58, -136], [60, -145], [65, -168], [71, -156]
  ], [
    [0.0, '#4a5940'], // Canadian Tundra
    [0.3, '#2a4d22'], // Boreal Forests
    [0.6, '#3d6328'], // Great Plains & US Midwest
    [0.85, '#8c7743'], // Mexican & Southwestern Deserts
    [1.0, '#386629'], // Central American Tropics
  ]);

  // Florida Peninsula
  drawCoast([[30, -81], [25, -80], [25, -81.5], [30, -84]], '#386927');
  // Baja California
  drawCoast([[32, -117], [23, -110], [24, -112], [32, -115]], '#997c47');

  // --- SOUTH AMERICA ---
  drawBiome([
    [12, -72], [10, -62], [5, -52], [-2, -44], [-8, -35], [-20, -40], [-23, -43],
    [-34, -53], [-42, -64], [-54, -67], [-55, -70], [-45, -75], [-35, -72],
    [-18, -71], [-5, -81], [5, -77], [10, -75]
  ], [
    [0.0, '#2d5420'],
    [0.3, '#143d10'], // Deep Amazon Rainforest
    [0.6, '#284f1b'], // Pantanal / Cerrado
    [0.85, '#696137'], // Pampas
    [1.0, '#786e49'], // Patagonia
  ]);

  // --- AUSTRALIA & OCEANIA ---
  drawBiome([
    [-11, 142], [-15, 145], [-24, 153], [-37, 150], [-39, 146], [-35, 137],
    [-35, 116], [-22, 114], [-15, 125], [-12, 131]
  ], [
    [0.0, '#3d6129'], // Northern Tropics
    [0.4, '#a86f3b'], // Great Sandy & Outback Red Desert
    [0.7, '#ba7c41'],
    [1.0, '#42612b'], // Southeast Coastal Green
  ]);

  // New Zealand (North & South Islands)
  drawCoast([[-35, 174], [-38, 178], [-41, 175], [-38, 174]], '#234a1c');
  drawCoast([[-41, 174], [-46, 170], [-46, 166], [-42, 171]], '#1f4518');

  // Papua New Guinea & Indonesia Islands
  drawCoast([[-3, 135], [-3, 148], [-10, 149], [-8, 138]], '#1b4515'); // PNG
  drawCoast([[5, 96], [-5, 105], [-6, 102], [3, 97]], '#1e4718');      // Sumatra
  drawCoast([[-6, 106], [-8, 114], [-7, 114], [-6, 106]], '#1f4a1a');   // Java
  drawCoast([[4, 114], [4, 118], [-3, 116], [-1, 110]], '#1b4215');     // Borneo
  drawCoast([[18, 120], [13, 124], [7, 125], [10, 122], [17, 120]], '#244f1e'); // Philippines

  // Japan (Honshu, Hokkaido, Kyushu)
  drawCoast([[45, 142], [42, 144], [42, 140], [45, 141]], '#2a5223');
  drawCoast([[41, 141], [36, 140], [34, 135], [35, 132], [37, 137], [40, 140]], '#244d1e');
  drawCoast([[33, 131], [31, 130], [33, 129]], '#295422');

  // British Isles & Ireland
  drawCoast([[58, -5], [56, -2], [51, 1], [50, -5], [54, -3], [58, -6]], '#2e5923');
  drawCoast([[55, -6], [52, -6], [51, -10], [54, -10]], '#2d5921');

  // --- POLAR ICE CAPS (Greenland, Arctic, Antarctica) ---
  drawCoast([
    [83, -30], [80, -18], [70, -22], [60, -43], [65, -52], [76, -68], [82, -60]
  ], '#e8f4fc', '#b9dcf5', 1.5);

  // Antarctica Continent
  drawCoast([
    [-65, -60], [-68, 0], [-66, 60], [-67, 120], [-70, 160], [-78, 180],
    [-76, -150], [-72, -100], [-65, -60]
  ], '#f1f8fe', '#cfe6f8', 2);

  // ==========================================
  // 4. MOUNTAIN RANGES & ELEVATION SHADING
  // ==========================================
  ctx.fillStyle = 'rgba(215, 225, 235, 0.45)';

  // Himalayas & Tibetan Plateau
  drawCoast([[36, 75], [35, 85], [30, 95], [27, 90], [28, 82], [32, 76]], '#6b665c');
  drawCoast([[34, 77], [32, 84], [29, 90], [28, 86], [31, 80]], 'rgba(240, 245, 250, 0.55)');

  // Alps (Europe)
  drawCoast([[47, 6], [47, 13], [45, 12], [45, 7]], 'rgba(230, 240, 250, 0.45)');

  // Andes (South America)
  drawCoast([[5, -75], [-15, -71], [-30, -70], [-50, -72], [-50, -74], [-15, -75]], 'rgba(200, 205, 215, 0.35)');

  // Rockies (North America)
  drawCoast([[60, -130], [50, -115], [35, -106], [35, -110], [52, -122]], 'rgba(200, 210, 220, 0.35)');

  // ==========================================
  // 5. REALISTIC ATMOSPHERIC CLOUD WISPS
  // ==========================================
  function drawCloudBand(startLat, amp, freq, thickness, opacity) {
    ctx.beginPath();
    for (let x = 0; x <= width; x += 10) {
      const lon = (x / width) * 360 - 180;
      const lat = startLat + Math.sin(lon * freq * 0.05) * amp + Math.cos(lon * freq * 0.03) * (amp * 0.5);
      const y = toY(lat);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = thickness;
    ctx.stroke();
  }

  // Soft atmospheric weather cloud layers
  drawCloudBand(5, 4, 1.2, 28, 0.12);     // Intertropical Convergence Zone
  drawCloudBand(48, 8, 2.0, 35, 0.14);    // Mid-Latitude Northern Storm Tracks
  drawCloudBand(-45, 7, 2.2, 38, 0.16);   // Southern Ocean Roaring Forties
  drawCloudBand(62, 5, 1.5, 24, 0.10);    // Subpolar Jet Stream Clouds

  // ==========================================
  // 6. NIGHT CITY ILLUMINATION CLUSTERS
  // ==========================================
  const majorCities = [
    // India & South Asia
    [28.56, 77.10], [19.08, 72.86], [13.19, 77.70], [12.99, 80.17], [22.65, 88.44], [17.24, 78.42], [10.15, 76.40],
    [23.07, 72.63], [26.82, 75.81], [31.70, 74.79], [6.92, 79.86], [23.84, 90.39], [24.90, 67.16],
    // Middle East
    [25.25, 55.36], [24.43, 54.65], [25.27, 51.60], [24.95, 46.69], [21.67, 39.15], [32.00, 34.88], [41.27, 28.75],
    // Europe
    [51.47, -0.45], [49.00, 2.54], [50.03, 8.56], [52.31, 4.76], [40.48, -3.56], [41.80, 12.23], [47.46, 8.54],
    [52.36, 13.50], [55.61, 12.65], [59.64, 17.92], [60.19, 11.10], [52.16, 20.96], [37.93, 23.94],
    // North America
    [40.64, -73.77], [41.97, -87.90], [33.94, -118.40], [37.62, -122.37], [25.79, -80.28], [33.64, -84.42],
    [32.89, -97.04], [47.45, -122.30], [42.36, -71.00], [43.67, -79.62], [49.19, -123.18], [19.43, -99.07],
    // Latin America
    [-23.43, -46.47], [-22.80, -43.24], [-34.82, -58.53], [-33.39, -70.78], [4.70, -74.14], [-12.02, -77.11],
    // East Asia & Southeast Asia
    [1.36, 103.99], [35.54, 139.77], [34.43, 135.24], [37.46, 126.44], [22.30, 113.91], [25.07, 121.23],
    [40.07, 116.60], [31.14, 121.80], [23.39, 113.29], [13.69, 100.75], [2.74, 101.70], [-6.12, 106.65],
    [14.50, 121.01], [10.81, 106.65],
    // Australia & Africa
    [-33.93, 151.17], [-37.66, 144.84], [-27.38, 153.11], [-31.94, 115.96], [-37.00, 174.78],
    [30.12, 31.40], [-26.13, 28.24], [-33.97, 18.60], [-1.31, 36.92], [33.36, -7.58]
  ];

  majorCities.forEach(([lat, lon]) => {
    const x = toX(lon);
    const y = toY(lat);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 5);
    glow.addColorStop(0, 'rgba(255, 225, 130, 0.95)'); // Golden city night light
    glow.addColorStop(0.4, 'rgba(251, 191, 36, 0.5)');
    glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}
