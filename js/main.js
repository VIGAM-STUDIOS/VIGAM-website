/* =============================================================================
   VIGAM LABS — Panoramic Dense ASCII Ocean & Minimalist UI
   Authentic Dieter Rams / Bell Labs Mathematical Cybernetics
   Pure Monospaced Hydrodynamic Surface | 60 FPS Canvas | Zero Bloat
   ============================================================================= */

(function () {
  'use strict';

  /* -------------------------------------------------------------------------
     1. PANORAMIC DENSE ASCII OCEAN ENGINE
     Trochoidal Gerstner Swells · Cross-Sea Interference · Braun Orange Foam
     ------------------------------------------------------------------------- */
  var canvas = document.getElementById('ocean-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;

    // Typography ramp: 11 distinct levels from trough void to peak foam
    var GLYPHS = [' ', '·', ':', '-', '~', '=', '+', '*', '#', '%', '@'];

    // Grid configuration
    var cellW = 7.0;  // Fixed character cell width in CSS px
    var cellH = 11.0; // Fixed character cell height in CSS px
    var width = 0;
    var height = 0;

    // Pointer physics & wake simulation
    var pointer = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isHovered: false,
      isDragging: false,
      tiltX: 0,
      tiltY: 0
    };

    // Expanding capillary circular ripples triggered by click or wake
    var ripples = [];

    function triggerRipple(x, y, maxR) {
      ripples.push({
        x: x,
        y: y,
        radius: 0,
        speed: 180,
        maxRadius: maxR || 220,
        strength: 1.0
      });
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      if (width === 0 || height === 0) return;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resize);
    resize();

    // Pointer event listeners
    canvas.addEventListener('pointerenter', function () {
      pointer.isHovered = true;
    });

    canvas.addEventListener('pointerleave', function () {
      pointer.isHovered = false;
      pointer.isDragging = false;
      pointer.targetX = -1000;
      pointer.targetY = -1000;
    });

    canvas.addEventListener('pointerdown', function (e) {
      pointer.isDragging = true;
      var rect = canvas.getBoundingClientRect();
      var px = e.clientX - rect.left;
      var py = e.clientY - rect.top;
      triggerRipple(px, py, 260);
    });

    canvas.addEventListener('pointerup', function () {
      pointer.isDragging = false;
    });

    canvas.addEventListener('pointercancel', function () {
      pointer.isDragging = false;
    });

    canvas.addEventListener('pointermove', function (e) {
      var rect = canvas.getBoundingClientRect();
      pointer.targetX = e.clientX - rect.left;
      pointer.targetY = e.clientY - rect.top;

      if (pointer.isDragging) {
        var dx = (e.clientX - rect.left) / rect.width - 0.5;
        var dy = (e.clientY - rect.top) / rect.height - 0.5;
        pointer.tiltX = dx * 0.45;
        pointer.tiltY = dy * 0.45;
      }
    });

    // Keyboard trigger (Spacebar creates sonic depth ripple)
    window.addEventListener('keydown', function (e) {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        triggerRipple(width * 0.65, height * 0.5, 260);
      }
    });

    // -------------------------------------------------------------------------
    // Core Hydrodynamic Wave Field Simulation Loop
    // -------------------------------------------------------------------------
    var lastTimestamp = performance.now();

    function renderOceanFrame(now) {
      var dt = (now - lastTimestamp) * 0.001;
      if (dt > 0.1) dt = 0.1;
      lastTimestamp = now;

      // Pointer spring easing
      pointer.x += (pointer.targetX - pointer.x) * 0.16;
      pointer.y += (pointer.targetY - pointer.y) * 0.16;

      // Natural decay of tilt
      if (!pointer.isDragging) {
        pointer.tiltX *= 0.94;
        pointer.tiltY *= 0.94;
      }

      // Update expanding capillary ripples
      for (var rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
        var rip = ripples[rIdx];
        rip.radius += rip.speed * dt;
        rip.strength *= 0.985;
        if (rip.radius >= rip.maxRadius || rip.strength < 0.03) {
          ripples.splice(rIdx, 1);
        }
      }

      ctx.clearRect(0, 0, width, height);

      if (width === 0 || height === 0) {
        requestAnimationFrame(renderOceanFrame);
        return;
      }

      var cols = Math.floor(width / cellW);
      var rows = Math.floor(height / cellH);
      var time = now * 0.0016;

      ctx.font = '500 10.5px "JetBrains Mono", Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Wave constants (Rolling Swells preset)
      var k1 = 0.12, k2 = 0.09, k3 = 0.22;
      var spd1 = 1.3, spd2 = 0.95, spd3 = 1.8;

      for (var r = 0; r < rows; r++) {
        var py = r * cellH + cellH * 0.5;

        for (var c = 0; c < cols; c++) {
          var normX = c / (cols - 1);
          var px = c * cellW + cellW * 0.5;

          // Panoramic Text Clearance:
          // Left side (normX < 0.38) is completely cleared so the headline & copy sit in 100% pure, unblemished whitespace!
          // Between 0.38 and 0.52, the ocean smoothly dissolves into view.
          var textClearance = 1.0;
          if (normX < 0.38) {
            continue;
          } else if (normX < 0.52) {
            textClearance = (normX - 0.38) / 0.14;
          }

          // 1. Primary Rolling Swell (Trochoidal wave sharpening)
          var u1 = (c * 0.8 + pointer.tiltX * 20) * k1 + (r * 1.2 + pointer.tiltY * 20) * k1 - time * spd1;
          var swell1 = Math.sin(u1) + 0.3 * Math.sin(2 * u1);

          // 2. Cross-Sea Harmonic (Diagonal interference wave)
          var u2 = (c * 1.1) * k2 - (r * 0.9) * k2 + time * spd2;
          var swell2 = Math.sin(u2) * 0.65;

          // 3. Capillary Chop & Wind Ripples
          var u3 = (c * 1.6) * k3 + (r * 1.8) * k3 - time * spd3;
          var chop = Math.sin(u3) * 0.25;

          // 4. Mouse Hydrodynamic Bow Wake
          var wakeBump = 0;
          if (pointer.isHovered) {
            var dxM = px - pointer.x;
            var dyM = py - pointer.y;
            var distM = Math.sqrt(dxM * dxM + dyM * dyM);
            if (distM < 64) {
              wakeBump = Math.cos(distM * 0.15 - time * 4) * Math.exp(-distM / 28) * 1.2;
            }
          }

          // 5. Sonic Depth Charge Ripple Interference
          var rippleBump = 0;
          for (var ripIdx = 0; ripIdx < ripples.length; ripIdx++) {
            var rip = ripples[ripIdx];
            var rx = px - rip.x;
            var ry = py - rip.y;
            var rDist = Math.sqrt(rx * rx + ry * ry);
            var diffR = Math.abs(rDist - rip.radius);
            if (diffR < 24) {
              rippleBump += Math.cos(diffR * 0.26) * (1 - diffR / 24) * rip.strength * 1.6;
            }
          }

          // Combined ocean surface height field
          var hTotal = swell1 * 1.0 + swell2 + chop + wakeBump + rippleBump;

          // Standard wave height spans roughly [-1.8, 1.8]
          var normH = (hTotal + 1.8) / 3.6;
          normH = Math.max(0, Math.min(1, normH));

          var charIdx = Math.floor(normH * (GLYPHS.length - 1));
          var ch = GLYPHS[charIdx];

          if (!ch || ch === ' ') continue;

          // Braun Specular Color Grading
          if (charIdx >= 9) {
            // Foaming wave crests in Braun Signal Orange (#D94E1F)
            ctx.fillStyle = 'rgba(217, 78, 31, ' + (textClearance * 0.95).toFixed(2) + ')';
          } else if (charIdx >= 7) {
            // Dense wave face in deep charcoal (#1C1C1C)
            ctx.fillStyle = 'rgba(28, 28, 28, ' + (textClearance * 0.90).toFixed(2) + ')';
          } else if (charIdx >= 4) {
            // Mid-swell body in muted dark tone (#45433E)
            ctx.fillStyle = 'rgba(69, 67, 62, ' + (textClearance * 0.75).toFixed(2) + ')';
          } else {
            // Deep troughs in subtle hairline tone (#8E8A83)
            ctx.fillStyle = 'rgba(142, 138, 131, ' + (textClearance * 0.55).toFixed(2) + ')';
          }

          ctx.fillText(ch, px, py);
        }
      }

      requestAnimationFrame(renderOceanFrame);
    }

    requestAnimationFrame(renderOceanFrame);
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

  /* -------------------------------------------------------------------------
     4. SCROLL REVEALS (VANILLA INTERSECTIONOBSERVER)
     Dieter Rams Precision Print Entrance · 0 KB Overhead · GPU Composited
     ------------------------------------------------------------------------- */
  function initScrollReveals() {
    if (!('IntersectionObserver' in window)) {
      var elements = document.querySelectorAll('.reveal-on-scroll, .divider');
      elements.forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    var observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0
    };

    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    var revealTargets = document.querySelectorAll('.reveal-on-scroll, .divider');
    revealTargets.forEach(function (target) {
      revealObserver.observe(target);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveals);
  } else {
    initScrollReveals();
  }
})();
