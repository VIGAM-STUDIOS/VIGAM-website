/* =============================================================================
   VIGAM LABS — Interactive 3D ASCII Tensor Field & Minimalist Carousel
   Pure Trigonometric Mathematical Projection | 60 FPS Canvas | Zero Bloat
   ============================================================================= */

(function () {
  'use strict';

  /* -------------------------------------------------------------------------
     1. 3D ASCII TENSOR FIELD GENERATOR (BELL LABS / CYBERNETIC GEOMETRY)
     ------------------------------------------------------------------------- */
  var canvas = document.getElementById('ascii-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;

    // Fixed internal resolution
    var width = 400;
    var height = 280;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // ASCII Character Ramp
    var CHARS = [' ', '·', ':', '-', '=', '+', '*', '#', '%', '@'];
    var COLS = 46;
    var ROWS = 23;
    var cellW = width / COLS;
    var cellH = height / ROWS;

    // 3D Rotation Angles & Physics
    var angleA = 0.6;
    var angleB = 0.4;
    var targetRotX = 0;
    var targetRotY = 0;
    var velA = 0.009;
    var velB = 0.006;
    var isDragging = false;
    var lastPointerX = 0;
    var lastPointerY = 0;

    // Torus Mathematical Constants
    var R1 = 1.0;
    var R2 = 2.0;
    var K2 = 5.0;
    var K1 = (COLS * K2 * 3) / (8 * (R1 + R2));

    var buffer = new Array(COLS * ROWS);
    var zbuffer = new Float32Array(COLS * ROWS);

    function renderAsciiFrame() {
      // Clear buffers
      buffer.fill(' ');
      zbuffer.fill(0);

      // Inertial physics
      angleA += velA + targetRotY * 0.04;
      angleB += velB + targetRotX * 0.04;
      targetRotX *= 0.92;
      targetRotY *= 0.92;

      var cosA = Math.cos(angleA);
      var sinA = Math.sin(angleA);
      var cosB = Math.cos(angleB);
      var sinB = Math.sin(angleB);

      // Theta: circle cross section
      for (var theta = 0; theta < 6.28; theta += 0.12) {
        var costheta = Math.cos(theta);
        var sintheta = Math.sin(theta);

        // Phi: revolution around torus center
        for (var phi = 0; phi < 6.28; phi += 0.05) {
          var cosphi = Math.cos(phi);
          var sinphi = Math.sin(phi);

          var circlex = R2 + R1 * costheta;
          var circley = R1 * sintheta;

          var x = circlex * (cosB * cosphi + sinA * sinB * sinphi) - circley * cosA * sinB;
          var y = circlex * (sinB * cosphi - sinA * cosB * sinphi) + circley * cosA * cosB;
          var z = K2 + cosA * circlex * sinphi + circley * sinA;
          var ooz = 1 / z;

          var xp = Math.floor(COLS / 2 + K1 * ooz * x);
          var yp = Math.floor(ROWS / 2 - (K1 * 0.55) * ooz * y);

          // Surface normal lighting calculation
          var L = cosphi * costheta * sinB - cosA * costheta * sinphi - sinA * sintheta +
                  cosB * (cosA * sintheta - costheta * sinA * sinphi);

          if (xp >= 0 && xp < COLS && yp >= 0 && yp < ROWS) {
            var idx = xp + yp * COLS;
            if (ooz > zbuffer[idx]) {
              zbuffer[idx] = ooz;
              var luminanceIdx = Math.floor(L * 8);
              luminanceIdx = Math.max(0, Math.min(CHARS.length - 1, luminanceIdx));
              buffer[idx] = CHARS[luminanceIdx];
            }
          }
        }
      }

      // Draw character matrix onto canvas
      ctx.clearRect(0, 0, width, height);
      ctx.font = '11px "JetBrains Mono", Menlo, monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var ch = buffer[c + r * COLS];
          if (!ch || ch === ' ') continue;

          var posX = c * cellW + cellW / 2;
          var posY = r * cellH + cellH / 2;

          // Color grading: charcoal with subtle Braun orange highlight at peak luminance
          if (ch === '@' || ch === '%') {
            ctx.fillStyle = '#D94E1F'; // Peak highlight in Braun signal orange
          } else if (ch === '#' || ch === '*') {
            ctx.fillStyle = '#1C1C1C'; // Foreground dense charcoal
          } else if (ch === '+' || ch === '=') {
            ctx.fillStyle = '#45433E'; // Mid-tone charcoal
          } else {
            ctx.fillStyle = '#949088'; // Ambient hairline tone
          }

          ctx.fillText(ch, posX, posY);
        }
      }

      requestAnimationFrame(renderAsciiFrame);
    }

    canvas.addEventListener('pointerdown', function (e) {
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      targetRotX += (Math.random() - 0.5) * 0.4;
      targetRotY += (Math.random() - 0.5) * 0.4;
    });

    window.addEventListener('pointerup', function () {
      isDragging = false;
    });

    canvas.addEventListener('pointermove', function (e) {
      if (isDragging) {
        var dx = e.clientX - lastPointerX;
        var dy = e.clientY - lastPointerY;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        targetRotX = dx * 0.08;
        targetRotY = dy * 0.08;
      } else {
        var rect = canvas.getBoundingClientRect();
        var cx = (e.clientX - rect.left) / rect.width - 0.5;
        var cy = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotX = cx * 0.06;
        targetRotY = cy * 0.06;
      }
    });

    requestAnimationFrame(renderAsciiFrame);
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
