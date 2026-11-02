/**
 * SG — The Next-Generation All-Electric Grand Tourer
 * Apple-Inspired Launch Experience Engine
 */

(function () {
  'use strict';

  // State
  const state = {
    selectedModel: 'grand',
    basePrice: 99900,
    paintName: 'Space Obsidian',
    paintHex: '#0a0a0c',
    paintCost: 0,
    wheelType: '20-aero',
    wheelCost: 0,
    interiorName: 'Eclipse Black',
    interiorCost: 0,
    copilotCost: 6000,
    audioCost: 0,
    brakesCost: 0,
    paymentType: 'cash',
    headlightsOn: true,
    spoilerRaised: true,
    autoRotate: true,
    soundEnabled: false,
  };

  // DOM Elements
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const subNav = document.getElementById('subNav');
  const subLinks = document.querySelectorAll('.sub-link');
  const playKeynoteBtn = document.getElementById('playKeynoteBtn');
  const keynoteModal = document.getElementById('keynoteModal');
  const closeKeynoteBtn = document.getElementById('closeKeynoteBtn');
  const orderModal = document.getElementById('orderModal');
  const closeOrderBtn = document.getElementById('closeOrderBtn');
  const reserveOrderBtn = document.getElementById('reserveOrderBtn');
  const subBuyBtn = document.getElementById('subBuyBtn');
  const checkoutForm = document.getElementById('checkoutForm');
  const applePayBtn = document.getElementById('applePayBtn');

  /* ==========================================================================
     1. HERO PARTICLES CANVAS & ANIMATED COUNTERS
     ========================================================================== */
  function initHeroCanvas() {
    const canvas = document.getElementById('heroStarCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, stars = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      stars = [];
      const count = Math.floor((width * height) / 9000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.4 + 0.1,
          color: Math.random() > 0.6 ? '#2997ff' : '#ffffff'
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      for (let star of stars) {
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
    animateHeroCounters();
  }

  function animateHeroCounters() {
    const counters = document.querySelectorAll('.spec-val');
    counters.forEach(counter => {
      const target = parseFloat(counter.dataset.target);
      const suffix = counter.dataset.suffix || '';
      const isDecimal = target % 1 !== 0;
      let start = 0;
      const duration = 1800; // ms
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Apple easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        const current = start + (target - start) * ease;

        if (isDecimal) {
          counter.textContent = current.toFixed(2) + suffix;
        } else if (target > 999) {
          counter.textContent = Math.round(current).toLocaleString() + suffix;
        } else {
          counter.textContent = Math.round(current) + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        }
      }
      requestAnimationFrame(updateNumber);
    });
  }

  /* ==========================================================================
     SCROLL REVEAL OBSERVER (Apple Smooth Scrolling Animation)
     ========================================================================== */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }


  /* ==========================================================================
     2. THREE.JS 360° INTERACTIVE CAR STUDIO
     ========================================================================== */
  let carScene, carCamera, carRenderer, carGroup, bodyMaterial, glassMaterial, wheelMeshes = [];
  let spoilerMesh, headlightsLight, headlightsMeshes = [];
  let isDragging = false, prevMouseX = 0, prevMouseY = 0;
  let targetRotationY = -0.4, targetRotationX = 0.15;
  let currentRotationY = -0.4, currentRotationX = 0.15;
  let targetCamDist = 9.5, currentCamDist = 9.5;
  let targetCamY = 2.2, currentCamY = 2.2;

  function init3DStudio() {
    const canvas = document.getElementById('car3DCanvas');
    const container = document.getElementById('studioViewport');
    if (!canvas || !container || typeof THREE === 'undefined') {
      initCanvasFallback(canvas, container);
      return;
    }

    // Scene setup
    carScene = new THREE.Scene();
    carScene.fog = new THREE.FogExp2(0x06080e, 0.04);

    const aspect = container.clientWidth / container.clientHeight;
    carCamera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    carCamera.position.set(0, currentCamY, currentCamDist);

    carRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    carRenderer.setSize(container.clientWidth, container.clientHeight);
    carRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    carRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    carRenderer.toneMappingExposure = 1.25;
    carRenderer.shadowMap.enabled = true;
    carRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    carScene.add(ambientLight);

    const overheadLight = new THREE.DirectionalLight(0xffffff, 1.4);
    overheadLight.position.set(0, 10, 0);
    carScene.add(overheadLight);

    const keyLight = new THREE.DirectionalLight(0xddeeff, 1.8);
    keyLight.position.set(8, 6, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    carScene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
    rimLight.position.set(-8, 4, -8);
    carScene.add(rimLight);

    const rearGlowLight = new THREE.DirectionalLight(0xff0044, 0.8);
    rearGlowLight.position.set(0, 2, -7);
    carScene.add(rearGlowLight);

    // Headlight Spotlights
    headlightsLight = new THREE.SpotLight(0x00f0ff, 3, 20, Math.PI / 6, 0.4, 1);
    headlightsLight.position.set(0, 0.8, 3.8);
    headlightsLight.target.position.set(0, 0, 12);
    carScene.add(headlightsLight);
    carScene.add(headlightsLight.target);

    // Studio Floor Grid & Shadow receiver
    createStudioFloor();

    // Construct Procedural High-Definition SG Car Model
    buildCarModel();

    // Event listeners for dragging / rotating
    setupStudioInteractions(container);

    // Animation Loop
    function renderLoop() {
      requestAnimationFrame(renderLoop);

      // Auto-rotation when active and not dragging
      if (state.autoRotate && !isDragging) {
        targetRotationY += 0.005;
      }

      // Smooth damping / interpolation
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;
      currentRotationX += (targetRotationX - currentRotationX) * 0.08;
      currentCamDist += (targetCamDist - currentCamDist) * 0.08;
      currentCamY += (targetCamY - currentCamY) * 0.08;

      if (carGroup) {
        carGroup.rotation.y = currentRotationY;
        carGroup.rotation.x = currentRotationX;
      }

      carCamera.position.y = currentCamY;
      carCamera.position.z = currentCamDist * Math.cos(currentRotationX);
      carCamera.lookAt(0, 0.5, 0);

      // Rotate wheels slowly during auto-spin
      if (state.autoRotate && !isDragging && wheelMeshes.length > 0) {
        wheelMeshes.forEach(w => {
          w.rotation.x += 0.02;
        });
      }

      carRenderer.render(carScene, carCamera);
    }
    renderLoop();

    // Resize handler
    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      carCamera.aspect = w / h;
      carCamera.updateProjectionMatrix();
      carRenderer.setSize(w, h);
    });
  }

  /* Create Reflective Floor with Dynamic Grid */
  function createStudioFloor() {
    const floorGeo = new THREE.CircleGeometry(16, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x07080d,
      roughness: 0.25,
      metalness: 0.85
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    carScene.add(floor);

    // Floor Grid Ring Lines
    for (let r = 2; r <= 14; r += 2) {
      const ringGeo = new THREE.RingGeometry(r - 0.02, r, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x2997ff,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.005;
      carScene.add(ring);
    }
  }

  /* Procedural Automotive Architecture for SG */
  function buildCarModel() {
    carGroup = new THREE.Group();

    // Materials
    bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(state.paintHex),
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.95
    });

    const carbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x111215,
      roughness: 0.5,
      metalness: 0.4
    });

    glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x05070a,
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.85,
      transmission: 0.3
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.1
    });

    // 1. MAIN CHASSIS / LOWER BODY
    // Aerodynamic wedge proportions: long wheelbase, low greenhouse
    const mainBodyGeo = new THREE.BoxGeometry(2.3, 0.55, 5.0);
    // Bevel edges roughly with custom subdivision
    const mainBody = new THREE.Mesh(mainBodyGeo, bodyMaterial);
    mainBody.position.y = 0.55;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    carGroup.add(mainBody);

    // 2. SCULPTED HOOD & FRONT NOSE
    const hoodGeo = new THREE.ConeGeometry(1.6, 1.8, 4);
    const hood = new THREE.Mesh(hoodGeo, bodyMaterial);
    hood.rotation.x = -Math.PI / 2;
    hood.rotation.y = Math.PI / 4;
    hood.scale.set(0.9, 0.8, 0.3);
    hood.position.set(0, 0.65, 1.8);
    carGroup.add(hood);

    // Front Splitter (Carbon Fiber)
    const splitterGeo = new THREE.BoxGeometry(2.2, 0.06, 0.7);
    const splitter = new THREE.Mesh(splitterGeo, carbonMaterial);
    splitter.position.set(0, 0.22, 2.5);
    carGroup.add(splitter);

    // 3. COCKPIT / GREENHOUSE CANOPY (Curved Glass Teardrop)
    const canopyGeo = new THREE.CylinderGeometry(0.85, 1.15, 2.4, 16);
    const canopy = new THREE.Mesh(canopyGeo, glassMaterial);
    canopy.rotation.x = Math.PI / 2;
    canopy.scale.set(1.0, 0.5, 0.95);
    canopy.position.set(0, 1.05, -0.1);
    canopy.castShadow = true;
    carGroup.add(canopy);

    // Roof Center Panel (Body Color / Panoramic Frame)
    const roofGeo = new THREE.BoxGeometry(1.6, 0.06, 2.1);
    const roof = new THREE.Mesh(roofGeo, bodyMaterial);
    roof.position.set(0, 1.28, -0.1);
    carGroup.add(roof);

    // 4. FRONT MATRIX LED LIGHTBAR
    const lightbarGeo = new THREE.BoxGeometry(2.1, 0.05, 0.12);
    const lightbarMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const lightbar = new THREE.Mesh(lightbarGeo, lightbarMat);
    lightbar.position.set(0, 0.72, 2.48);
    carGroup.add(lightbar);
    headlightsMeshes.push(lightbarMat);

    // Dual Laser Headlight projectors
    [-0.85, 0.85].forEach(x => {
      const projGeo = new THREE.BoxGeometry(0.3, 0.08, 0.15);
      const proj = new THREE.Mesh(projGeo, lightbarMat);
      proj.position.set(x, 0.68, 2.45);
      carGroup.add(proj);
    });

    // 5. REAR FULL-WIDTH OLED LIGHT RIBBON
    const rearLightGeo = new THREE.BoxGeometry(2.1, 0.06, 0.1);
    const rearLightMat = new THREE.MeshBasicMaterial({ color: 0xff1030 });
    const rearLight = new THREE.Mesh(rearLightGeo, rearLightMat);
    rearLight.position.set(0, 0.76, -2.48);
    carGroup.add(rearLight);

    // 6. ACTIVE REAR AERO SPOILER
    const spoilerGroup = new THREE.Group();
    const wingGeo = new THREE.BoxGeometry(1.9, 0.05, 0.4);
    const wingMesh = new THREE.Mesh(wingGeo, carbonMaterial);
    wingMesh.position.set(0, 0.35, 0);

    // Dual Stanchions
    [-0.6, 0.6].forEach(x => {
      const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35);
      const leg = new THREE.Mesh(legGeo, chromeMaterial);
      leg.position.set(x, 0.18, 0);
      spoilerGroup.add(leg);
    });

    spoilerGroup.add(wingMesh);
    spoilerGroup.position.set(0, 0.85, -2.25);
    carGroup.add(spoilerGroup);
    spoilerMesh = spoilerGroup;

    // 7. REAR CARBON DIFFUSER
    const diffuserGeo = new THREE.BoxGeometry(2.1, 0.2, 0.6);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonMaterial);
    diffuser.position.set(0, 0.28, -2.4);
    carGroup.add(diffuser);

    // Diffuser Aero Fins
    [-0.6, -0.2, 0.2, 0.6].forEach(x => {
      const finGeo = new THREE.BoxGeometry(0.04, 0.16, 0.5);
      const fin = new THREE.Mesh(finGeo, carbonMaterial);
      fin.position.set(x, 0.26, -2.4);
      carGroup.add(fin);
    });

    // 8. SIDE MIRRORS / AERO CAMERA PODS
    [-1.22, 1.22].forEach(x => {
      const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.06), carbonMaterial);
      mirrorArm.position.set(x * 0.95, 0.95, 0.8);
      carGroup.add(mirrorArm);

      const mirrorPod = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.22), bodyMaterial);
      mirrorPod.position.set(x, 0.95, 0.8);
      carGroup.add(mirrorPod);
    });

    // 9. HIGH PERFORMANCE WHEELS & BRAKES (4 Wheels)
    wheelMeshes = [];
    const wheelPositions = [
      { x: -1.16, y: 0.42, z: 1.55 }, // Front Left
      { x: 1.16, y: 0.42, z: 1.55 },  // Front Right
      { x: -1.16, y: 0.42, z: -1.55 }, // Rear Left
      { x: 1.16, y: 0.42, z: -1.55 }  // Rear Right
    ];

    const tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 24);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181c, roughness: 0.8 });

    const rimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.33, 5); // 5-spoke star
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xb0b8c0, metalness: 0.9, roughness: 0.2 });

    const discGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.04, 24);
    const discMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8, roughness: 0.3 });

    const caliperGeo = new THREE.BoxGeometry(0.1, 0.12, 0.14);
    const caliperMat = new THREE.MeshStandardMaterial({ color: 0xff7b00, metalness: 0.4, roughness: 0.3 }); // SG Acid Orange

    wheelPositions.forEach((pos, idx) => {
      const singleWheelGroup = new THREE.Group();
      singleWheelGroup.position.set(pos.x, pos.y, pos.z);

      // Rotating Hub
      const rotHub = new THREE.Group();
      rotHub.rotation.z = Math.PI / 2;

      // Tire
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      rotHub.add(tire);

      // Rim
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rotHub.add(rim);

      singleWheelGroup.add(rotHub);
      wheelMeshes.push(rotHub);

      // Fixed Brake Assembly
      const brakeAssembly = new THREE.Group();
      brakeAssembly.rotation.z = Math.PI / 2;

      const disc = new THREE.Mesh(discGeo, discMat);
      brakeAssembly.add(disc);

      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(0, 0.08, 0.18);
      brakeAssembly.add(caliper);

      singleWheelGroup.add(brakeAssembly);
      carGroup.add(singleWheelGroup);
    });

    // 10. GLOWING "SG" EMBLEM ON HOOD
    const badgeGeo = new THREE.CircleGeometry(0.08, 16);
    const badgeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.rotation.x = -Math.PI / 2;
    badge.position.set(0, 0.73, 2.4);
    carGroup.add(badge);

    carScene.add(carGroup);
  }

  /* Fallback Canvas Renderer if WebGL is unsupported */
  function initCanvasFallback(canvas, container) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    function draw() {
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#2997ff';
      ctx.font = 'bold 20px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SG Interactive 360° View Ready', canvas.width / 2, canvas.height / 2);
    }
    draw();
  }

  /* Mouse & Touch Drag Rotation */
  function setupStudioInteractions(container) {
    // Mouse Drag
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      hideDragHint();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.005;

      // Clamp vertical camera angle
      targetRotationX = Math.max(-0.1, Math.min(0.65, targetRotationX));
    });

    // Touch Support
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
        hideDragHint();
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.005;
      targetRotationX = Math.max(-0.1, Math.min(0.65, targetRotationX));
    }, { passive: true });

    // Wheel Zoom
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      targetCamDist += e.deltaY * 0.005;
      targetCamDist = Math.max(6.5, Math.min(14.0, targetCamDist));
    }, { passive: false });
  }

  function hideDragHint() {
    const hint = document.getElementById('dragHint');
    if (hint) {
      hint.style.opacity = '0';
      setTimeout(() => hint.remove(), 400);
    }
  }

  /* Preset Camera Angle Transitions */
  const anglePresets = {
    threeQuarter: { rotY: -0.65, rotX: 0.18, dist: 9.5, y: 2.2 },
    side: { rotY: Math.PI / 2, rotX: 0.08, dist: 9.2, y: 1.8 },
    rear: { rotY: Math.PI, rotX: 0.15, dist: 8.8, y: 2.0 },
    top: { rotY: 0, rotX: 0.65, dist: 10.5, y: 5.5 },
    front: { rotY: 0, rotX: 0.12, dist: 8.5, y: 1.9 }
  };

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const angleKey = btn.dataset.angle;
      const preset = anglePresets[angleKey];
      if (preset) {
        targetRotationY = preset.rotY;
        targetRotationX = preset.rotX;
        targetCamDist = preset.dist;
        targetCamY = preset.y;
      }
    });
  });

  /* Studio Color Palette Switcher */
  const studioColorSwatches = document.querySelectorAll('#studioColorPalette .color-swatch');
  const hudColorName = document.getElementById('hudColorName');

  studioColorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      studioColorSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');

      const hex = swatch.dataset.color;
      const name = swatch.dataset.colorName;
      if (bodyMaterial) {
        bodyMaterial.color.set(hex);
      }
      if (hudColorName) {
        hudColorName.textContent = name;
      }
      // Also synchronize with Configurator paint choice
      syncConfiguratorColor(name, hex);
    });
  });

  /* Studio Feature Toggles (Lights, Aero Wing, Turntable) */
  const lightsToggleBtn = document.getElementById('lightsToggleBtn');
  const lightsStatusText = document.getElementById('lightsStatusText');
  lightsToggleBtn.addEventListener('click', () => {
    state.headlightsOn = !state.headlightsOn;
    lightsStatusText.textContent = state.headlightsOn ? 'ON' : 'OFF';
    lightsToggleBtn.classList.toggle('active', state.headlightsOn);

    if (headlightsLight) {
      headlightsLight.intensity = state.headlightsOn ? 3 : 0;
    }
    headlightsMeshes.forEach(mat => {
      mat.color.set(state.headlightsOn ? 0x00f0ff : 0x223344);
    });
  });

  const spoilerToggleBtn = document.getElementById('spoilerToggleBtn');
  const spoilerStatusText = document.getElementById('spoilerStatusText');
  const hudAeroStatus = document.getElementById('hudAeroStatus');
  spoilerToggleBtn.addEventListener('click', () => {
    state.spoilerRaised = !state.spoilerRaised;
    spoilerStatusText.textContent = state.spoilerRaised ? 'UP' : 'FLUSH';
    hudAeroStatus.textContent = state.spoilerRaised ? 'Active Track' : 'Aero Stream';
    spoilerToggleBtn.classList.toggle('active', state.spoilerRaised);

    if (spoilerMesh) {
      spoilerMesh.position.y = state.spoilerRaised ? 0.85 : 0.65;
    }
  });

  const autoRotateToggleBtn = document.getElementById('autoRotateToggleBtn');
  const autoRotateStatusText = document.getElementById('autoRotateStatusText');
  autoRotateToggleBtn.addEventListener('click', () => {
    state.autoRotate = !state.autoRotate;
    autoRotateStatusText.textContent = state.autoRotate ? 'AUTO' : 'MANUAL';
    autoRotateToggleBtn.classList.toggle('active', state.autoRotate);
  });

  /* ==========================================================================
     3. ARCHITECTURE STICKY SCROLLER & SVG HIGHLIGHTS
     ========================================================================== */
  const archSteps = document.querySelectorAll('.arch-step-card');
  const archLayers = {
    1: document.getElementById('layerMonocoque'),
    2: document.getElementById('layerBattery'),
    3: document.getElementById('layerMotors'),
    4: document.getElementById('layerSuspension')
  };

  archSteps.forEach(card => {
    card.addEventListener('click', () => {
      const step = card.dataset.step;
      setActiveArchStep(step);
    });
  });

  function setActiveArchStep(step) {
    archSteps.forEach(c => c.classList.toggle('active', c.dataset.step === step));
    for (let key in archLayers) {
      const layer = archLayers[key];
      if (!layer) continue;
      if (key === step) {
        layer.classList.remove('dimmed');
        layer.classList.add('highlighted');
      } else {
        layer.classList.remove('highlighted');
        layer.classList.add('dimmed');
      }
    }
  }

  // IntersectionObserver for auto-activating arch cards when scrolling
  if ('IntersectionObserver' in window) {
    const archObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const step = entry.target.dataset.step;
          setActiveArchStep(step);
        }
      });
    }, { threshold: 0.6 });

    archSteps.forEach(stepCard => archObserver.observe(stepCard));
  }

  /* ==========================================================================
     4. APPLE SUB-NAV SCROLLSPY & SMOOTH SCROLLING
     ========================================================================== */
  const observedSections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    observedSections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    subLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });

    // Make subnav more prominent on scroll
    if (scrollY > 150) {
      subNav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
    } else {
      subNav.style.boxShadow = 'none';
    }
  });

  /* ==========================================================================
     5. TECH SPECS COMPARISON MODEL TABS
     ========================================================================== */
  const modelTabs = document.querySelectorAll('.model-tab');
  const colPures = document.querySelectorAll('.col-pure');
  const colGrands = document.querySelectorAll('.col-grand');
  const colApexes = document.querySelectorAll('.col-apex');

  modelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modelTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const model = tab.dataset.model;
      [...colPures, ...colGrands, ...colApexes].forEach(c => c.classList.remove('highlight-col'));

      if (model === 'pure') {
        colPures.forEach(c => c.classList.add('highlight-col'));
      } else if (model === 'grand') {
        colGrands.forEach(c => c.classList.add('highlight-col'));
      } else if (model === 'apex') {
        colApexes.forEach(c => c.classList.add('highlight-col'));
      }
    });
  });

  /* ==========================================================================
     6. APPLE-STYLE CONFIGURATOR & PRICING ENGINE
     ========================================================================== */
  const trimOptions = document.querySelectorAll('.trim-option');
  const configModelBadge = document.getElementById('configModelBadge');
  const cfgSpecAccel = document.getElementById('cfgSpecAccel');
  const cfgSpecRange = document.getElementById('cfgSpecRange');
  const cfgSpecPower = document.getElementById('cfgSpecPower');
  const totalPriceDisplay = document.getElementById('totalPriceDisplay');
  const priceMonthlyDetail = document.getElementById('priceMonthlyDetail');
  const selectedPaintName = document.getElementById('selectedPaintName');
  const paintCostLabel = document.getElementById('paintCostLabel');
  const cfgSwatches = document.querySelectorAll('.cfg-swatch');
  const wheelOptions = document.querySelectorAll('.wheel-option');
  const interiorOptions = document.querySelectorAll('.interior-option');
  const addonCopilot = document.getElementById('addonCopilot');
  const addonAudio = document.getElementById('addonAudio');
  const addonBrakes = document.getElementById('addonBrakes');
  const payTabs = document.querySelectorAll('.pay-tab');

  // Trim Selection
  trimOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      trimOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');

      state.selectedModel = opt.dataset.trim;
      state.basePrice = parseInt(opt.dataset.price, 10);

      cfgSpecAccel.textContent = opt.dataset.accel;
      cfgSpecRange.textContent = opt.dataset.range;
      cfgSpecPower.textContent = opt.dataset.power;

      const trimNames = { pure: 'SG Pure RWD', grand: 'SG Grand AWD', apex: 'SG Apex Track AWD' };
      configModelBadge.textContent = trimNames[state.selectedModel];

      recalculatePrice();
      drawConfigPreview();
    });
  });

  // Paint Swatches in Configurator
  cfgSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      cfgSwatches.forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');

      state.paintName = swatch.dataset.paint;
      state.paintHex = swatch.dataset.hex;
      state.paintCost = parseInt(swatch.dataset.cost, 10);

      selectedPaintName.textContent = state.paintName;
      paintCostLabel.textContent = state.paintCost === 0 ? 'Included' : `+$${state.paintCost.toLocaleString()}`;

      // Update 3D car paint too
      if (bodyMaterial) {
        bodyMaterial.color.set(state.paintHex);
      }
      if (hudColorName) {
        hudColorName.textContent = state.paintName;
      }

      // Update corresponding swatch in 360 studio
      studioColorSwatches.forEach(s => {
        s.classList.toggle('active', s.dataset.colorName === state.paintName);
      });

      recalculatePrice();
      drawConfigPreview();
    });
  });

  function syncConfiguratorColor(name, hex) {
    state.paintName = name;
    state.paintHex = hex;
    selectedPaintName.textContent = name;
    cfgSwatches.forEach(s => {
      if (s.dataset.paint === name) {
        s.classList.add('selected');
        state.paintCost = parseInt(s.dataset.cost, 10);
        paintCostLabel.textContent = state.paintCost === 0 ? 'Included' : `+$${state.paintCost.toLocaleString()}`;
      } else {
        s.classList.remove('selected');
      }
    });
    recalculatePrice();
    drawConfigPreview();
  }

  // Wheel Selection
  wheelOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      wheelOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.wheelType = opt.dataset.wheel;
      state.wheelCost = parseInt(opt.dataset.cost, 10);
      recalculatePrice();
    });
  });

  // Interior Selection
  interiorOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      interiorOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.interiorName = opt.querySelector('.int-title').textContent;
      state.interiorCost = parseInt(opt.dataset.cost, 10);
      recalculatePrice();
    });
  });

  // Addon Checkboxes
  [addonCopilot, addonAudio, addonBrakes].forEach(chk => {
    chk.addEventListener('change', () => {
      state.copilotCost = addonCopilot.checked ? parseInt(addonCopilot.dataset.cost, 10) : 0;
      state.audioCost = addonAudio.checked ? parseInt(addonAudio.dataset.cost, 10) : 0;
      state.brakesCost = addonBrakes.checked ? parseInt(addonBrakes.dataset.cost, 10) : 0;
      recalculatePrice();
    });
  });

  // Payment Tabs (Cash, Lease, Finance)
  payTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      payTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.paymentType = tab.dataset.type;
      recalculatePrice();
    });
  });

  // Recalculate and format total
  function recalculatePrice() {
    const total = state.basePrice + state.paintCost + state.wheelCost + state.interiorCost + state.copilotCost + state.audioCost + state.brakesCost;

    if (state.paymentType === 'cash') {
      totalPriceDisplay.textContent = `$${total.toLocaleString()}`;
      priceMonthlyDetail.textContent = `Or $${Math.round((total - 8000) / 72).toLocaleString()}/mo with $8,000 down for 72 months`;
    } else if (state.paymentType === 'lease') {
      const leaseMonthly = Math.round((total * 0.55) / 36);
      totalPriceDisplay.textContent = `$${leaseMonthly.toLocaleString()}/mo`;
      priceMonthlyDetail.textContent = `36 months · 10,000 miles/yr · $6,500 due at signing · Total: $${total.toLocaleString()}`;
    } else if (state.paymentType === 'finance') {
      const financeMonthly = Math.round((total - 8000) * 1.05 / 72);
      totalPriceDisplay.textContent = `$${financeMonthly.toLocaleString()}/mo`;
      priceMonthlyDetail.textContent = `72 months @ 4.9% APR · $8,000 down · Total cash value: $${total.toLocaleString()}`;
    }
  }

  // Mini Configurator Visualizer
  function drawConfigPreview() {
    const canvas = document.getElementById('configPreviewCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Floor Reflection Gradient
    const floorGrad = ctx.createRadialGradient(w / 2, h * 0.75, 20, w / 2, h * 0.75, w * 0.45);
    floorGrad.addColorStop(0, 'rgba(41, 151, 255, 0.25)');
    floorGrad.addColorStop(0.5, 'rgba(10, 15, 25, 0.4)');
    floorGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    // Draw Vector 3/4 Car Silhouette in Configurator
    ctx.save();
    ctx.translate(w / 2, h / 2 + 10);

    // Dynamic Paint Glow
    const bodyGlow = ctx.createLinearGradient(-140, -50, 140, 50);
    bodyGlow.addColorStop(0, state.paintHex);
    bodyGlow.addColorStop(0.5, state.paintHex === '#0a0a0c' ? '#1c1e24' : state.paintHex);
    bodyGlow.addColorStop(1, '#050608');

    // Car Shadow
    ctx.beginPath();
    ctx.ellipse(0, 50, 150, 18, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fill();

    // Car Body Path
    ctx.beginPath();
    ctx.moveTo(-150, 38);
    ctx.bezierCurveTo(-150, 20, -110, -5, -40, -22);
    ctx.bezierCurveTo(-10, -38, 50, -40, 95, -15);
    ctx.bezierCurveTo(130, 0, 155, 25, 155, 38);
    ctx.lineTo(155, 45);
    ctx.lineTo(-150, 45);
    ctx.closePath();
    ctx.fillStyle = bodyGlow;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    // Canopy Glass
    ctx.beginPath();
    ctx.moveTo(-70, -16);
    ctx.bezierCurveTo(-30, -36, 30, -36, 75, -12);
    ctx.lineTo(55, 10);
    ctx.lineTo(-60, 10);
    ctx.closePath();
    ctx.fillStyle = 'rgba(6, 12, 24, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#2997ff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Wheels
    function drawWheel(x, y) {
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#111317';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#1c222e';
      ctx.fill();
    }
    drawWheel(-95, 45);
    drawWheel(95, 45);

    // Laser Light Beam
    ctx.beginPath();
    ctx.moveTo(155, 36);
    ctx.lineTo(220, 28);
    ctx.lineTo(220, 46);
    ctx.closePath();
    const beamGrad = ctx.createLinearGradient(155, 0, 220, 0);
    beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
    beamGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = beamGrad;
    ctx.fill();

    ctx.restore();
  }

  /* ==========================================================================
     7. MODAL DIALOGS (Keynote & Reservation)
     ========================================================================== */
  // Keynote Film Modal
  playKeynoteBtn.addEventListener('click', () => {
    keynoteModal.classList.add('active');
  });

  closeKeynoteBtn.addEventListener('click', () => {
    keynoteModal.classList.remove('active');
  });

  // Order Reservation Modal
  function openOrderModal() {
    const total = state.basePrice + state.paintCost + state.wheelCost + state.interiorCost + state.copilotCost + state.audioCost + state.brakesCost;
    const trimNames = { pure: 'SG Pure RWD', grand: 'SG Grand AWD', apex: 'SG Apex Track AWD' };

    document.getElementById('modalVehicleName').textContent = trimNames[state.selectedModel];
    document.getElementById('modalBuildCode').textContent = `SG-${state.selectedModel.toUpperCase()}-${state.paintName.slice(0, 3).toUpperCase()}-900V`;
    document.getElementById('modalTrimName').textContent = trimNames[state.selectedModel];
    document.getElementById('modalBasePrice').textContent = `$${state.basePrice.toLocaleString()}`;
    document.getElementById('modalPaintName').textContent = state.paintName;
    document.getElementById('modalPaintPrice').textContent = state.paintCost === 0 ? 'Included' : `+$${state.paintCost.toLocaleString()}`;
    document.getElementById('modalWheelPrice').textContent = state.wheelCost === 0 ? 'Included' : `+$${state.wheelCost.toLocaleString()}`;
    document.getElementById('modalInteriorName').textContent = state.interiorName;
    document.getElementById('modalInteriorPrice').textContent = state.interiorCost === 0 ? 'Included' : `+$${state.interiorCost.toLocaleString()}`;
    document.getElementById('modalPackagesPrice').textContent = `+$${(state.copilotCost + state.audioCost + state.brakesCost).toLocaleString()}`;
    document.getElementById('modalTotalPrice').textContent = `$${total.toLocaleString()}`;

    orderModal.classList.add('active');
  }

  reserveOrderBtn.addEventListener('click', openOrderModal);
  subBuyBtn.addEventListener('click', openOrderModal);

  closeOrderBtn.addEventListener('click', () => {
    orderModal.classList.remove('active');
  });

  // Close modals when clicking outside
  [keynoteModal, orderModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Simulate Checkout
  checkoutForm.addEventListener('submit', () => {
    alert('Thank you! Your $500 reservation deposit for SG is confirmed. Your production queue token has been assigned.');
    orderModal.classList.remove('active');
  });

  applePayBtn.addEventListener('click', () => {
    alert('Apple Pay authentication successful! Your SG allocation is locked.');
    orderModal.classList.remove('active');
  });

  /* ==========================================================================
     8. FAQ ACCORDION INTERACTIVITY
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const qBtn = item.querySelector('.faq-question');
    qBtn.addEventListener('click', () => {
      const wasActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!wasActive) {
        item.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     9. AMBIENT EV SYNTHESIZER (Web Audio API)
     ========================================================================== */
  let audioCtx, osc1, osc2, gainNode;

  soundToggleBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    soundToggleBtn.classList.toggle('active', state.soundEnabled);

    if (state.soundEnabled) {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }
  });

  function startAmbientSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      osc1 = audioCtx.createOscillator();
      osc2 = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, audioCtx.currentTime); // 55Hz low motor drone

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, audioCtx.currentTime); // Harmonic

      gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.04, audioCtx.currentTime + 2);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
    } catch (e) {
      console.log('AudioContext initialized upon interaction');
    }
  }

  function stopAmbientSound() {
    if (gainNode && audioCtx) {
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      setTimeout(() => {
        if (osc1) osc1.stop();
        if (osc2) osc2.stop();
        if (audioCtx) audioCtx.close();
      }, 500);
    }
  }

  /* ==========================================================================
     INITIALIZATION ON DOM CONTENT LOADED
     ========================================================================== */
  window.addEventListener('DOMContentLoaded', () => {
    initHeroCanvas();
    initScrollReveal();
    init3DStudio();
    drawConfigPreview();
    recalculatePrice();
  });

})();
