/* =============================================================================
   VIGAM LABS — Minimalist Acoustic Vector Map & Utility Script
   Interactive 2D Acoustic Embedding Space | On-Device Sound Synthesis
   ============================================================================= */

(function () {
  'use strict';

  /* -------------------------------------------------------------------------
     1. WEBAUDIO REAL-TIME ACOUSTIC INTERPOLATOR
     ------------------------------------------------------------------------- */
  var audioCtx = null;
  var activeNodes = [];

  function ensureAudioCtx() {
    if (!audioCtx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function stopActiveAudio() {
    activeNodes.forEach(function (n) {
      try { n.stop(); } catch (e) {}
    });
    activeNodes = [];
  }

  // Synthesizes an interpolated tone based on normalized (x, y) coordinates
  // x: 0 (Warm / Low) -> 1 (Bright / Sparkling)
  // y: 0 (Soft / Evolving) -> 1 (Sharp Transient / Punchy)
  function playCoordinateTone(x, y) {
    var ctx = ensureAudioCtx();
    if (!ctx) return;
    stopActiveAudio();

    var now = ctx.currentTime;
    var master = ctx.createGain();
    master.gain.setValueAtTime(0.18, now);
    master.connect(ctx.destination);

    // Dynamic lowpass filter based on X (Timbre)
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    var cutoff = 320 + Math.pow(x, 2) * 3200;
    filter.frequency.setValueAtTime(cutoff, now);
    filter.Q.value = 1.0 + x * 2.5;
    filter.connect(master);

    // Envelope shaping based on Y (Attack)
    var isTransient = y > 0.55;
    var osc = ctx.createOscillator();
    var osc2 = ctx.createOscillator();
    var env = ctx.createGain();

    if (isTransient) {
      // Punchy transient (Snare / Sub 808 click)
      var baseFreq = x > 0.5 ? 180 : 110;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * 2.2, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, now + 0.08);

      env.gain.setValueAtTime(0.001, now);
      env.gain.linearRampToValueAtTime(0.7, now + 0.004);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(env);
      env.connect(filter);
      osc.start(now);
      osc.stop(now + 0.3);
      activeNodes.push(osc);
    } else {
      // Soft evolving tone (Pad / Glassy Pluck)
      var padFreq = x > 0.5 ? 220 : 146.83;
      osc.type = 'sine';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(padFreq, now);
      osc2.frequency.setValueAtTime(padFreq * (x > 0.5 ? 2 : 1.5), now);
      osc2.detune.setValueAtTime(6, now);

      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(0.45, now + 0.12);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc.connect(env);
      osc2.connect(env);
      env.connect(filter);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.88);
      osc2.stop(now + 0.88);
      activeNodes.push(osc, osc2);
    }
  }

  /* -------------------------------------------------------------------------
     2. INTERACTIVE ACOUSTIC LATENT SPACE (2D COORDINATE PLANE)
     ------------------------------------------------------------------------- */
  var plane = document.getElementById('vector-plane');
  var reticle = document.getElementById('plane-reticle');
  var readoutNode = document.getElementById('readout-node');
  var proximityLine = document.getElementById('proximity-line');
  var canvas = document.getElementById('wave-canvas');
  var ctx2d = canvas ? canvas.getContext('2d') : null;

  var NODES = [
    { id: 'pad', name: 'Warm analog pad', x: 0.25, y: 0.25 },
    { id: 'pluck', name: 'Glassy pluck', x: 0.75, y: 0.25 },
    { id: 'sub', name: 'Sub 808 glide', x: 0.25, y: 0.75 },
    { id: 'snare', name: 'Acoustic snare', x: 0.75, y: 0.75 }
  ];

  var currentX = 0.25;
  var currentY = 0.25;
  var isDragging = false;
  var lastSoundTime = 0;

  function drawWaveform(x, y) {
    if (!ctx2d) return;
    var w = canvas.width;
    var h = canvas.height;
    ctx2d.clearRect(0, 0, w, h);

    ctx2d.strokeStyle = '#1C1C1C';
    ctx2d.lineWidth = 1.25;
    ctx2d.beginPath();

    var points = 48;
    var midY = h / 2;
    var freq = 1.5 + x * 4.5;
    var sharpness = 0.4 + y * 1.6;

    for (var i = 0; i < points; i++) {
      var t = i / (points - 1);
      var px = t * w;
      var env = Math.sin(t * Math.PI);
      var wave = Math.sin(t * Math.PI * 2 * freq) * Math.pow(env, sharpness);
      var py = midY - wave * (h * 0.38);

      if (i === 0) ctx2d.moveTo(px, py);
      else ctx2d.lineTo(px, py);
    }
    ctx2d.stroke();
  }

  function updatePlanePosition(normX, normY, triggerAudio) {
    currentX = Math.max(0.04, Math.min(0.96, normX));
    currentY = Math.max(0.04, Math.min(0.96, normY));

    if (reticle) {
      reticle.style.left = (currentX * 100).toFixed(1) + '%';
      reticle.style.top = (currentY * 100).toFixed(1) + '%';
    }

    // Find nearest acoustic node
    var nearest = NODES[0];
    var minDistance = Infinity;

    NODES.forEach(function (n) {
      var dx = n.x - currentX;
      var dy = n.y - currentY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = n;
      }
    });

    // Update active node styling
    document.querySelectorAll('.plane-node').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-node') === nearest.id);
    });

    if (readoutNode) {
      readoutNode.textContent = nearest.name;
    }

    // Update proximity dashed line
    if (proximityLine) {
      proximityLine.setAttribute('x1', (currentX * 360).toFixed(1));
      proximityLine.setAttribute('y1', (currentY * 280).toFixed(1));
      proximityLine.setAttribute('x2', (nearest.x * 360).toFixed(1));
      proximityLine.setAttribute('y2', (nearest.y * 280).toFixed(1));
      proximityLine.style.opacity = minDistance < 0.28 ? '0.7' : '0.25';
    }

    drawWaveform(currentX, currentY);

    if (triggerAudio) {
      var now = Date.now();
      if (now - lastSoundTime > 120) {
        lastSoundTime = now;
        playCoordinateTone(currentX, currentY);
      }
    }
  }

  if (plane) {
    function handlePointer(e, triggerSound) {
      var rect = plane.getBoundingClientRect();
      var nx = (e.clientX - rect.left) / rect.width;
      var ny = (e.clientY - rect.top) / rect.height;
      updatePlanePosition(nx, ny, triggerSound);
    }

    plane.addEventListener('pointerdown', function (e) {
      isDragging = true;
      plane.setPointerCapture(e.pointerId);
      handlePointer(e, true);
    });

    plane.addEventListener('pointermove', function (e) {
      if (isDragging) {
        handlePointer(e, true);
      } else {
        handlePointer(e, false);
      }
    });

    plane.addEventListener('pointerup', function (e) {
      isDragging = false;
      try { plane.releasePointerCapture(e.pointerId); } catch (err) {}
    });

    plane.addEventListener('pointercancel', function () {
      isDragging = false;
    });

    // Click on node directly
    document.querySelectorAll('.plane-node').forEach(function (nodeEl) {
      nodeEl.addEventListener('click', function (e) {
        e.stopPropagation();
        var nodeId = nodeEl.getAttribute('data-node');
        var target = NODES.find(function (n) { return n.id === nodeId; });
        if (target) {
          updatePlanePosition(target.x, target.y, true);
        }
      });
    });

    // Initial render
    updatePlanePosition(0.25, 0.25, false);
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
