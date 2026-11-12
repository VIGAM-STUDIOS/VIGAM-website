/* =============================================================================
   VIGAM LABS — Interactive 3D Silicon Neural Processor & Minimalist UI
   Authentic Dieter Rams / Braun Print Minimalist Canvas Simulation
   Pure Trigonometric Mathematical Projection | 60 FPS Canvas | Zero Bloat
   ============================================================================= */

(function () {
  'use strict';

  /* -------------------------------------------------------------------------
     1. INTERACTIVE 3D SILICON NEURAL PROCESSOR SIMULATION
     Dieter Rams / Braun Functionalist Kinetic Sculpture (Zero Surrounding Text)
     ------------------------------------------------------------------------- */
  var canvas = document.getElementById('art-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;

    var width = 440;
    var height = 340;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);

    // Physical orientation & spring kinematics
    var basePitch = 0.52; // ~30 degrees elevation
    var baseYaw = 0.65;   // ~37 degrees azimuth
    var pitch = basePitch;
    var yaw = baseYaw;
    var targetPitch = basePitch;
    var targetYaw = baseYaw;
    var velPitch = 0;
    var velYaw = 0;

    var isDragging = false;
    var pointerDownX = 0;
    var pointerDownY = 0;
    var lastPointerX = 0;
    var lastPointerY = 0;
    var pointerMoved = false;

    var hoverPos = { x: -1000, y: -1000 };
    var activeNodeIdx = -1;

    // Shockwaves triggered on click/tap
    var computeWaves = [];

    // Projection Function (3D to 2D isometric with subtle perspective)
    function project(x, y, z) {
      var cosY = Math.cos(yaw);
      var sinY = Math.sin(yaw);
      var cosP = Math.cos(pitch);
      var sinP = Math.sin(pitch);

      // Yaw rotation (Y axis)
      var x1 = x * cosY - z * sinY;
      var z1 = x * sinY + z * cosY;

      // Pitch rotation (X axis)
      var y1 = y * cosP - z1 * sinP;
      var z2 = y * sinP + z1 * cosP;

      var fov = 520;
      var scale = fov / (fov + z2);

      return {
        x: width * 0.5 + x1 * scale,
        y: height * 0.52 + y1 * scale,
        scale: scale,
        z: z2
      };
    }

    // Geometry Definition: Substrate & Inner Silicon Die
    var HW = 110; // Outer package half-width
    var TH = 8;   // Outer package thickness
    var DW = 48;  // Inner die half-width

    // Circuit Traces (Orthogonal routes from perimeter pins to central die)
    var traces = [
      // Left bus
      [ { x: -104, y: 0, z: -32 }, { x: -74, y: 0, z: -32 }, { x: -50, y: -2, z: -18 } ],
      [ { x: -104, y: 0, z: 32 },  { x: -74, y: 0, z: 32 },  { x: -50, y: -2, z: 18 } ],
      // Right bus
      [ { x: 104, y: 0, z: -32 },  { x: 74, y: 0, z: -32 },  { x: 50, y: -2, z: -18 } ],
      [ { x: 104, y: 0, z: 32 },   { x: 74, y: 0, z: 32 },   { x: 50, y: -2, z: 18 } ],
      // Top bus
      [ { x: -32, y: 0, z: -104 }, { x: -32, y: 0, z: -74 }, { x: -18, y: -2, z: -50 } ],
      [ { x: 32, y: 0, z: -104 },  { x: 32, y: 0, z: -74 },  { x: 18, y: -2, z: -50 } ],
      // Bottom bus
      [ { x: -32, y: 0, z: 104 },  { x: -32, y: 0, z: 74 },  { x: -18, y: -2, z: 50 } ],
      [ { x: 32, y: 0, z: 104 },   { x: 32, y: 0, z: 74 },   { x: 18, y: -2, z: 50 } ]
    ];

    // Data Packets (Closed-loop internal flow)
    var packets = [];
    var PACKET_COUNT = 16;
    for (var p = 0; p < PACKET_COUNT; p++) {
      packets.push({
        traceIdx: p % traces.length,
        progress: (p / PACKET_COUNT) + Math.random() * 0.1,
        speed: 0.005 + Math.random() * 0.004,
        isAccent: (p % 4 === 0), // 25% Braun signal orange
        direction: (p % 2 === 0 ? 1 : -1)
      });
    }

    // Neural Lattice Nodes (13 nodes in 3 layers)
    var nodes = [
      // Layer 0: Peripheral Input Nodes (y = -10)
      { id: 0,  x: -28, y: -10, z: -28, activation: 0, baseR: 3.0 },
      { id: 1,  x:  28, y: -10, z: -28, activation: 0, baseR: 3.0 },
      { id: 2,  x:  28, y: -10, z:  28, activation: 0, baseR: 3.0 },
      { id: 3,  x: -28, y: -10, z:  28, activation: 0, baseR: 3.0 },

      // Layer 1: Central Tensor Core (y = -22)
      { id: 4,  x:   0, y: -22, z:   0, activation: 0.3, baseR: 4.0 }, // Central nexus
      { id: 5,  x: -20, y: -22, z:   0, activation: 0, baseR: 3.2 },
      { id: 6,  x:  20, y: -22, z:   0, activation: 0, baseR: 3.2 },
      { id: 7,  x:   0, y: -22, z: -20, activation: 0, baseR: 3.2 },
      { id: 8,  x:   0, y: -22, z:  20, activation: 0, baseR: 3.2 },

      // Layer 2: Register/Synthesis Nodes (y = -34)
      { id: 9,  x: -16, y: -34, z: -16, activation: 0, baseR: 3.0 },
      { id: 10, x:  16, y: -34, z: -16, activation: 0, baseR: 3.0 },
      { id: 11, x:  16, y: -34, z:  16, activation: 0, baseR: 3.0 },
      { id: 12, x: -16, y: -34, z:  16, activation: 0, baseR: 3.0 }
    ];

    // Synaptic Connections (Directed edges)
    var synapses = [
      // Layer 0 -> Layer 1
      [0, 5], [0, 7], [1, 6], [1, 7], [2, 6], [2, 8], [3, 5], [3, 8],
      // Layer 1 Cross to Hub
      [5, 4], [6, 4], [7, 4], [8, 4],
      // Layer 1 -> Layer 2
      [4, 9], [4, 10], [4, 11], [4, 12],
      [5, 9], [6, 10], [6, 11], [5, 12],
      // Perimeter Ring Synapses
      [0, 1], [1, 2], [2, 3], [3, 0],
      [9, 10], [10, 11], [11, 12], [12, 9]
    ];

    // Perimeter Contact Pads (6 per side = 24 pins)
    var pins = [];
    for (var i = 0; i < 6; i++) {
      var offset = -75 + i * 30;
      pins.push({ x: -HW, y: 0, z: offset, axis: 'x' });
      pins.push({ x:  HW, y: 0, z: offset, axis: 'x' });
      pins.push({ x: offset, y: 0, z: -HW, axis: 'z' });
      pins.push({ x: offset, y: 0, z:  HW, axis: 'z' });
    }

    // Helper: Interpolate point along piecewise linear trace
    function getPointOnTrace(trace, t) {
      if (t <= 0) return trace[0];
      if (t >= 1) return trace[trace.length - 1];

      var segCount = trace.length - 1;
      var scaled = t * segCount;
      var segIdx = Math.floor(scaled);
      var segT = scaled - segIdx;
      if (segIdx >= segCount) {
        segIdx = segCount - 1;
        segT = 1;
      }

      var pA = trace[segIdx];
      var pB = trace[segIdx + 1];
      return {
        x: pA.x + (pB.x - pA.x) * segT,
        y: pA.y + (pB.y - pA.y) * segT,
        z: pA.z + (pB.z - pA.z) * segT
      };
    }

    var lastTimestamp = performance.now();

    function renderFrame(now) {
      var dt = (now - lastTimestamp) * 0.001;
      if (dt > 0.1) dt = 0.1;
      lastTimestamp = now;

      // Kinematic spring physics & damping
      if (!isDragging) {
        var springK = 2.8;
        var damping = 0.88;

        // Restore toward target
        velYaw += (targetYaw - yaw) * springK * dt;
        velPitch += (targetPitch - pitch) * springK * dt;
        velYaw *= damping;
        velPitch *= damping;

        yaw += velYaw;
        pitch += velPitch;

        // Subtle idle breathing oscillation
        var breath = Math.sin(now * 0.0012) * 0.012;
        pitch += breath * dt;
      }

      // Clear viewport
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Silicon Substrate Base (Isometric Beveled Package)
      var c0 = project(-HW, 0, -HW);
      var c1 = project( HW, 0, -HW);
      var c2 = project( HW, 0,  HW);
      var c3 = project(-HW, 0,  HW);

      // Bottom face vertices (for physical bevel thickness)
      var b0 = project(-HW, TH, -HW);
      var b1 = project( HW, TH, -HW);
      var b2 = project( HW, TH,  HW);
      var b3 = project(-HW, TH,  HW);

      // Substrate Bevel Edges (tactile 3D relief)
      ctx.fillStyle = '#DDD8CE';
      ctx.beginPath();
      ctx.moveTo(c3.x, c3.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.lineTo(b3.x, b3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#CCC7BC';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#D3CEC2';
      ctx.beginPath();
      ctx.moveTo(c2.x, c2.y);
      ctx.lineTo(c1.x, c1.y);
      ctx.lineTo(b1.x, b1.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#CCC7BC';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Top Silicon Plane (Matte warm drafting background)
      ctx.fillStyle = '#EBE7DF';
      ctx.beginPath();
      ctx.moveTo(c0.x, c0.y);
      ctx.lineTo(c1.x, c1.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.lineTo(c3.x, c3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#DDD8CE';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Otl Aicher Technical Registration Crosses (+ markers at 4 corners)
      var crossMarks = [
        { x: -HW + 16, z: -HW + 16 },
        { x:  HW - 16, z: -HW + 16 },
        { x:  HW - 16, z:  HW - 16 },
        { x: -HW + 16, z:  HW - 16 }
      ];
      ctx.strokeStyle = '#A8A49C';
      ctx.lineWidth = 0.8;
      crossMarks.forEach(function (cm) {
        var cp = project(cm.x, 0, cm.z);
        ctx.beginPath();
        ctx.moveTo(cp.x - 3, cp.y);
        ctx.lineTo(cp.x + 3, cp.y);
        ctx.moveTo(cp.x, cp.y - 3);
        ctx.lineTo(cp.x, cp.y + 3);
        ctx.stroke();
      });

      // Perimeter Contact Pins (24 precision micro-pads)
      pins.forEach(function (pin) {
        var pStart = project(pin.x, 0, pin.z);
        var inX = pin.axis === 'x' ? (pin.x > 0 ? pin.x - 7 : pin.x + 7) : pin.x;
        var inZ = pin.axis === 'z' ? (pin.z > 0 ? pin.z - 7 : pin.z + 7) : pin.z;
        var pEnd = project(inX, 0, inZ);

        ctx.strokeStyle = '#1C1C1C';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();
      });

      // 2. Central Silicon Die (Elevated NPU Core Area)
      var d0 = project(-DW, -2, -DW);
      var d1 = project( DW, -2, -DW);
      var d2 = project( DW, -2,  DW);
      var d3 = project(-DW, -2,  DW);

      ctx.fillStyle = '#E2DDD2';
      ctx.beginPath();
      ctx.moveTo(d0.x, d0.y);
      ctx.lineTo(d1.x, d1.y);
      ctx.lineTo(d2.x, d2.y);
      ctx.lineTo(d3.x, d3.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1C1C1C';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Inner Core Guideline grid
      ctx.strokeStyle = '#D1CBC0';
      ctx.lineWidth = 0.8;
      var dcX0 = project(-DW, -2, 0);
      var dcX1 = project( DW, -2, 0);
      var dcZ0 = project(0, -2, -DW);
      var dcZ1 = project(0, -2,  DW);
      ctx.beginPath();
      ctx.moveTo(dcX0.x, dcX0.y);
      ctx.lineTo(dcX1.x, dcX1.y);
      ctx.moveTo(dcZ0.x, dcZ0.y);
      ctx.lineTo(dcZ1.x, dcZ1.y);
      ctx.stroke();

      // 3. Circuit Traces (Hairline Orthogonal Routing)
      ctx.lineWidth = 1;
      traces.forEach(function (trace) {
        ctx.strokeStyle = '#C2BCB1';
        ctx.beginPath();
        for (var s = 0; s < trace.length; s++) {
          var pt = project(trace[s].x, trace[s].y, trace[s].z);
          if (s === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      });

      // 4. Update & Render Closed-Loop Data Packets
      packets.forEach(function (pkt) {
        var trace = traces[pkt.traceIdx];
        pkt.progress += pkt.speed * pkt.direction;

        if (pkt.progress >= 1) {
          pkt.progress = 1;
          pkt.direction = -1;
          // Pulse nearest node when packet enters die
          nodes[pkt.traceIdx % nodes.length].activation = 0.8;
        } else if (pkt.progress <= 0) {
          pkt.progress = 0;
          pkt.direction = 1;
        }

        var pt3D = getPointOnTrace(trace, pkt.progress);
        var pt2D = project(pt3D.x, pt3D.y, pt3D.z);

        ctx.fillStyle = pkt.isAccent ? '#D94E1F' : '#1C1C1C';
        ctx.beginPath();
        ctx.arc(pt2D.x, pt2D.y, pkt.isAccent ? 2.4 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. Update Compute Waves (Shockwave ripples)
      for (var w = computeWaves.length - 1; w >= 0; w--) {
        var wave = computeWaves[w];
        wave.radius += wave.speed * dt;

        // Ring projection
        ctx.strokeStyle = 'rgba(217, 78, 31, ' + Math.max(0, 1 - wave.radius / wave.maxRadius).toFixed(2) + ')';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        var STEPS = 36;
        for (var st = 0; st <= STEPS; st++) {
          var ang = (st / STEPS) * Math.PI * 2;
          var wx = Math.cos(ang) * wave.radius;
          var wz = Math.sin(ang) * wave.radius;
          var wp = project(wx, -2, wz);
          if (st === 0) ctx.moveTo(wp.x, wp.y);
          else ctx.lineTo(wp.x, wp.y);
        }
        ctx.stroke();

        // Check node intersection
        nodes.forEach(function (node) {
          var dist = Math.sqrt(node.x * node.x + node.z * node.z);
          if (Math.abs(dist - wave.radius) < 14) {
            node.activation = 1.0;
          }
        });

        if (wave.radius >= wave.maxRadius) {
          computeWaves.splice(w, 1);
        }
      }

      // 6. Neural Synapses (3D Vector Lines between Nodes)
      synapses.forEach(function (syn) {
        var nA = nodes[syn[0]];
        var nB = nodes[syn[1]];
        var pA = project(nA.x, nA.y, nA.z);
        var pB = project(nB.x, nB.y, nB.z);

        var edgeActive = Math.max(nA.activation, nB.activation);
        if (edgeActive > 0.25) {
          ctx.strokeStyle = 'rgba(217, 78, 31, ' + (0.3 + edgeActive * 0.7).toFixed(2) + ')';
          ctx.lineWidth = 1.4;
        } else {
          ctx.strokeStyle = '#9E9990';
          ctx.lineWidth = 0.9;
        }

        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
      });

      // 7. Depth-sort and Render Neural Nodes
      var projectedNodes = nodes.map(function (node, idx) {
        var p = project(node.x, node.y, node.z);
        return {
          node: node,
          idx: idx,
          x: p.x,
          y: p.y,
          scale: p.scale,
          z: p.z
        };
      });

      projectedNodes.sort(function (a, b) {
        return b.z - a.z; // Far to near
      });

      // Check hover proximity
      activeNodeIdx = -1;
      projectedNodes.forEach(function (item) {
        var dx = hoverPos.x - item.x;
        var dy = hoverPos.y - item.y;
        if (Math.sqrt(dx * dx + dy * dy) < 24) {
          activeNodeIdx = item.idx;
          item.node.activation = 1.0;
        }
      });

      projectedNodes.forEach(function (item) {
        var n = item.node;
        // Decay activation
        n.activation *= 0.95;

        var isExcited = n.activation > 0.2 || item.idx === activeNodeIdx;
        var r = (n.baseR + (isExcited ? 1.5 : 0)) * item.scale;

        // Outer Ring
        ctx.beginPath();
        ctx.arc(item.x, item.y, r, 0, Math.PI * 2);

        if (isExcited) {
          ctx.fillStyle = '#D94E1F';
          ctx.strokeStyle = '#D94E1F';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          // High-luminance white center dot
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(item.x, item.y, r * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#EFECE6';
          ctx.strokeStyle = '#1C1C1C';
          ctx.lineWidth = 1.2;
          ctx.fill();
          ctx.stroke();

          // Charcoal inner core
          ctx.fillStyle = '#1C1C1C';
          ctx.beginPath();
          ctx.arc(item.x, item.y, r * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(renderFrame);
    }

    // Interactive Handlers: Pointer Events (Touch + Mouse)
    canvas.addEventListener('pointerdown', function (e) {
      isDragging = true;
      pointerMoved = false;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener('pointermove', function (e) {
      var rect = canvas.getBoundingClientRect();
      hoverPos.x = e.clientX - rect.left;
      hoverPos.y = e.clientY - rect.top;

      if (isDragging) {
        var dx = e.clientX - lastPointerX;
        var dy = e.clientY - lastPointerY;
        if (Math.abs(e.clientX - pointerDownX) > 4 || Math.abs(e.clientY - pointerDownY) > 4) {
          pointerMoved = true;
        }

        velYaw = dx * 0.007;
        velPitch = -dy * 0.007;

        yaw += velYaw;
        pitch += velPitch;

        targetYaw = yaw;
        targetPitch = pitch;

        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
      } else {
        // Hover tilt sensitivity
        var normX = (e.clientX - rect.left) / rect.width - 0.5;
        var normY = (e.clientY - rect.top) / rect.height - 0.5;
        targetYaw = baseYaw + normX * 0.42;
        targetPitch = basePitch - normY * 0.35;
      }
    });

    function endPointer(e) {
      if (!isDragging) return;
      isDragging = false;

      // If user tapped/clicked without major drag, trigger compute shockwave
      if (!pointerMoved) {
        computeWaves.push({
          radius: 0,
          maxRadius: 150,
          speed: 260
        });

        // Speed boost for packets
        packets.forEach(function (pkt) {
          pkt.speed *= 2.2;
          setTimeout(function () {
            pkt.speed /= 2.2;
          }, 800);
        });
      }

      // Smoothly return target to base pose
      targetYaw = baseYaw;
      targetPitch = basePitch;

      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);

    canvas.addEventListener('pointerleave', function () {
      hoverPos.x = -1000;
      hoverPos.y = -1000;
      targetYaw = baseYaw;
      targetPitch = basePitch;
    });

    requestAnimationFrame(renderFrame);
  }

  /* -------------------------------------------------------------------------
     2. LIGHT-MODE KLANG IMAGE CAROUSEL
     ------------------------------------------------------------------------- */
  var carouselEl = document.getElementById('klang-carousel');
  if (carouselEl) {
    var slides = carouselEl.querySelectorAll('.carousel-slide');
    var indicators = carouselEl.querySelectorAll('.indicator-btn');
    var captionEl = document.getElementById('carousel-caption');
    var prevBtn = document.getElementById('prev-slide');
    var nextBtn = document.getElementById('next-slide');
    var currentIndex = 0;

    function showSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach(function (slide, i) {
        var isActive = i === currentIndex;
        slide.classList.toggle('active', isActive);
      });

      indicators.forEach(function (btn, i) {
        var isActive = i === currentIndex;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      var currentSlide = slides[currentIndex];
      if (currentSlide && captionEl) {
        var captionText = currentSlide.getAttribute('data-caption');
        if (captionText) {
          captionEl.textContent = captionText;
        }
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        showSlide(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        showSlide(currentIndex + 1);
      });
    }

    indicators.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-slide-index'), 10);
        if (!isNaN(idx)) {
          showSlide(idx);
        }
      });
    });

    // Touch swipe gestures
    var startTouchX = 0;
    var endTouchX = 0;

    carouselEl.addEventListener('touchstart', function (e) {
      startTouchX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselEl.addEventListener('touchend', function (e) {
      endTouchX = e.changedTouches[0].screenX;
      var diff = endTouchX - startTouchX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          showSlide(currentIndex + 1); // Swipe left
        } else {
          showSlide(currentIndex - 1); // Swipe right
        }
      }
    }, { passive: true });
  }

  /* -------------------------------------------------------------------------
     3. EMAIL CLIPBOARD COPY
     ------------------------------------------------------------------------- */
  var copyBtn = document.querySelector('[data-copy]');
  var copyLabel = document.getElementById('copy-label');
  var copyResetTimer = null;

  if (copyBtn && copyLabel) {
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.getAttribute('data-copy');
      if (!text || !navigator.clipboard) return;

      navigator.clipboard.writeText(text).then(function () {
        copyBtn.classList.add('copied');
        copyLabel.textContent = 'Copied';

        clearTimeout(copyResetTimer);
        copyResetTimer = setTimeout(function () {
          copyBtn.classList.remove('copied');
          copyLabel.textContent = 'Copy address';
        }, 2000);
      });
    });
  }
})();
