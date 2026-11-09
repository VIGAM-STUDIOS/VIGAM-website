/* =============================================================================
   VIGAM LABS — Showcase & GSAP Scroll Choreography
   ============================================================================= */

(function () {
  'use strict';

  /* -------------------------------------------------------------------------
     1. THEME TOGGLE & EMAIL COPY TOAST
     ------------------------------------------------------------------------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById('theme-toggle');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('vigam_theme', next);
      } catch (e) {}
    });
  }

  var toast = document.getElementById('toast');
  var toastText = document.getElementById('toast-text');
  var toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    if (toastText && msg) toastText.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('visible');
    }, 2200);
  }

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-copy');
      if (!val || !navigator.clipboard) return;
      navigator.clipboard.writeText(val).then(function () {
        showToast('Copied ' + val);
      });
    });
  });

  /* -------------------------------------------------------------------------
     2. LENIS SMOOTH MOMENTUM SCROLL
     ------------------------------------------------------------------------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 0.95
    });

    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      })(0);
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = anchor.getAttribute('href');
        if (!href) return;
        if (href === '#') {
          e.preventDefault();
          lenis.scrollTo(0);
          return;
        }
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -68 });
        }
      });
    });
  }

  /* -------------------------------------------------------------------------
     3. GSAP LOAD CHOREOGRAPHY & PAGE ENTRANCE
     ------------------------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  function splitWordsForReveal(el) {
    if (!el) return [];
    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        var words = node.textContent.split(/(\s+)/);
        var fragment = document.createDocumentFragment();
        words.forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) {
            fragment.appendChild(document.createTextNode(w));
          } else {
            var wrap = document.createElement('span');
            wrap.className = 'gsap-word-wrap';
            var inner = document.createElement('span');
            inner.className = 'gsap-word';
            inner.textContent = w;
            wrap.appendChild(inner);
            fragment.appendChild(wrap);
          }
        });
        return fragment;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains('nowrap')) {
          var wrapNw = document.createElement('span');
          wrapNw.className = 'gsap-word-wrap nowrap';
          var innerNw = document.createElement('span');
          innerNw.className = 'gsap-word';
          innerNw.textContent = node.textContent;
          wrapNw.appendChild(innerNw);
          return wrapNw;
        }
        var clone = node.cloneNode(false);
        Array.from(node.childNodes).forEach(function (child) {
          clone.appendChild(processNode(child));
        });
        return clone;
      }
      return node.cloneNode(true);
    }

    var children = Array.from(el.childNodes);
    el.innerHTML = '';
    children.forEach(function (c) {
      el.appendChild(processNode(c));
    });
    return el.querySelectorAll('.gsap-word');
  }

  var heroTitle = document.getElementById('hero-title');
  var heroWords = window.gsap ? splitWordsForReveal(heroTitle) : [];
  var klangStage = document.getElementById('klang-stage');

  if (window.gsap) {
    var loadTl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    loadTl.from('.nav', {
      y: -28,
      opacity: 0,
      duration: 0.8
    }, 0);

    if (heroWords.length) {
      loadTl.from(heroWords, {
        yPercent: 120,
        rotate: 3,
        opacity: 0,
        duration: 1.05,
        stagger: 0.055
      }, 0.08);
    }

    loadTl.from('.hero-lede', {
      y: 24,
      opacity: 0,
      duration: 0.9
    }, 0.38).from('.hero-actions .btn', {
      y: 18,
      opacity: 0,
      duration: 0.8,
      stagger: 0.09,
      clearProps: 'opacity,transform'
    }, 0.5);

    if (klangStage) {
      loadTl.fromTo(
        klangStage,
        {
          y: 72,
          rotateX: 18,
          scale: 0.91,
          opacity: 0,
          transformPerspective: 1200,
          transformOrigin: '50% 0%'
        },
        {
          y: 0,
          rotateX: 0,
          scale: 1,
          opacity: 1,
          duration: 1.35,
          ease: 'expo.out'
        },
        0.32
      );
    }
  }

  /* -------------------------------------------------------------------------
     4. GSAP + SCROLLTRIGGER PAGE CHOREOGRAPHY
     ------------------------------------------------------------------------- */
  if (!window.gsap) return;

  // 4.1 Hero Scroll Parallax & KLANG Stage 3D Perspective Tilt
  if (klangStage) {
    if (window.ScrollTrigger) {
      gsap.fromTo(
        '.hero .wrap',
        { y: 0, scale: 1, opacity: 1 },
        {
          y: -56,
          scale: 0.95,
          opacity: 0.16,
          transformOrigin: '50% 0%',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.35
          }
        }
      );
    }

    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (canHover) {
      var rotX = gsap.quickTo(klangStage, 'rotateX', { duration: 0.55, ease: 'power3.out' });
      var rotY = gsap.quickTo(klangStage, 'rotateY', { duration: 0.55, ease: 'power3.out' });

      klangStage.addEventListener('mousemove', function (e) {
        var r = klangStage.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        klangStage.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        klangStage.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        rotY((px - 0.5) * 3.0);
        rotX((0.5 - py) * 2.4);
      });

      klangStage.addEventListener('mouseleave', function () {
        rotX(0);
        rotY(0);
      });
    }
  }

  // 4.2 Magnetic Buttons (.magnetic-btn) & Ethos Card Cursor Spotlights
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnetic-btn').forEach(function (btn) {
      var xTo = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power3.out' });
      var yTo = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power3.out' });
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * 0.22);
        yTo(dy * 0.26);
      });
      btn.addEventListener('mouseleave', function () {
        xTo(0);
        yTo(0);
      });
    });

    document.querySelectorAll('.ethos-cell').forEach(function (cell) {
      cell.addEventListener('mousemove', function (e) {
        var r = cell.getBoundingClientRect();
        cell.style.setProperty('--cx', (e.clientX - r.left).toFixed(0) + 'px');
        cell.style.setProperty('--cy', (e.clientY - r.top).toFixed(0) + 'px');
      });
    });
  }

  // 4.3 Architectural 1px Hairline Dividers with Scroll-Scrubbed Specular Glint
  document.querySelectorAll('.signal-divider').forEach(function (divider) {
    var svg = divider.querySelector('svg');
    if (!svg) return;
    svg.setAttribute('viewBox', '0 0 1040 24');
    svg.innerHTML =
      '<path class="signal-path" d="M 0 12 Q 520 12 1040 12"></path>' +
      '<line class="signal-glint" x1="460" y1="12" x2="580" y2="12"></line>';

    var path = svg.querySelector('.signal-path');
    var glint = svg.querySelector('.signal-glint');
    var proxy = { cy: 12, cx: 520 };

    function setGlintPos(prog) {
      if (!glint) return;
      var center = 70 + prog * 900;
      glint.setAttribute('x1', (center - 64).toFixed(1));
      glint.setAttribute('x2', (center + 64).toFixed(1));
    }

    setGlintPos(0.5);

    if (window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: divider,
        start: 'clamp(top 95%)',
        end: 'clamp(bottom 5%)',
        scrub: 0.3,
        onUpdate: function (self) {
          setGlintPos(self.progress);
        }
      });
    }

    divider.addEventListener('mousemove', function (e) {
      var r = divider.getBoundingClientRect();
      var pctX = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      setGlintPos(pctX);
      if (path) {
        proxy.cx = pctX * 1040;
        proxy.cy = 12 + Math.max(-9, Math.min(9, (e.clientY - (r.top + r.height / 2)) * 0.9));
        path.setAttribute('d', 'M 0 12 Q ' + proxy.cx.toFixed(0) + ' ' + proxy.cy.toFixed(1) + ' 1040 12');
        gsap.to(proxy, {
          cy: 12,
          duration: 0.95,
          overwrite: 'auto',
          ease: 'elastic.out(1.15, 0.22)',
          onUpdate: function () {
            path.setAttribute('d', 'M 0 12 Q ' + proxy.cx.toFixed(0) + ' ' + proxy.cy.toFixed(1) + ' 1040 12');
          }
        });
      }
    });
  });

  // 4.4 ScrollTrigger Scrubbed Section Choreography (Ethos, About Us, Contact)
  if (window.ScrollTrigger) {
    var ethosSection = document.getElementById('ethos');
    if (ethosSection) {
      var ethosH2Words = splitWordsForReveal(ethosSection.querySelector('.section-head h2'));
      var ethosTl = gsap.timeline({
        scrollTrigger: {
          trigger: ethosSection,
          start: 'clamp(top 92%)',
          end: 'clamp(top 38%)',
          scrub: 0.45
        }
      });

      if (ethosH2Words.length) {
        ethosTl.from(ethosH2Words, {
          yPercent: 115,
          opacity: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out'
        }, 0);
      }

      ethosTl.from(ethosSection.querySelector('.section-head p'), {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, 0.08).from(ethosSection.querySelectorAll('.ethos-cell'), {
        y: 54,
        rotateX: 12,
        scale: 0.95,
        opacity: 0,
        transformOrigin: '50% 100%',
        duration: 0.8,
        stagger: 0.14,
        ease: 'power2.out'
      }, 0.12);

      var ethosShapes = ethosSection.querySelectorAll('.ethos-icon svg path, .ethos-icon svg rect, .ethos-icon svg circle, .ethos-icon svg line');
      if (ethosShapes.length) {
        ethosTl.fromTo(
          ethosShapes,
          { strokeDasharray: 80, strokeDashoffset: 80 },
          { strokeDashoffset: 0, duration: 0.7, stagger: 0.04, ease: 'none' },
          0.2
        );
      }

      var latencyBadge = ethosSection.querySelector('[data-count-target]');
      if (latencyBadge) {
        var counterObj = { val: 95 };
        ethosTl.to(counterObj, {
          val: 11,
          duration: 0.7,
          ease: 'power2.out',
          onUpdate: function () {
            latencyBadge.textContent = Math.round(counterObj.val) + ' ms';
          }
        }, 0.3);
      }
    }

    var aboutSection = document.getElementById('about');
    if (aboutSection) {
      var aboutH2Words = splitWordsForReveal(aboutSection.querySelector('.about-copy h2'));
      var aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: aboutSection,
          start: 'clamp(top 92%)',
          end: 'clamp(bottom 78%)',
          scrub: 0.45
        }
      });

      if (aboutH2Words.length) {
        aboutTl.from(aboutH2Words, {
          yPercent: 115,
          opacity: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out'
        }, 0);
      }

      aboutTl.from(aboutSection.querySelector('.about-copy p'), {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, 0.08).from(aboutSection.querySelectorAll('.founder-row'), {
        x: 42,
        y: 14,
        scale: 0.97,
        opacity: 0,
        duration: 0.75,
        stagger: 0.16,
        ease: 'power2.out'
      }, 0.14);
    }

    var contactSection = document.getElementById('contact');
    if (contactSection) {
      var contactH2Words = splitWordsForReveal(contactSection.querySelector('.contact-copy h2'));
      var contactTl = gsap.timeline({
        scrollTrigger: {
          trigger: contactSection,
          start: 'clamp(top 95%)',
          end: 'clamp(bottom 92%)',
          scrub: 0.45
        }
      });

      if (contactH2Words.length) {
        contactTl.from(contactH2Words, {
          yPercent: 115,
          opacity: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out'
        }, 0);
      }

      contactTl.from(contactSection.querySelector('.contact-copy p'), {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, 0.08).from(contactSection.querySelectorAll('.contact-card'), {
        x: 42,
        y: 14,
        scale: 0.97,
        opacity: 0,
        duration: 0.75,
        stagger: 0.16,
        ease: 'power2.out'
      }, 0.14);
    }

    window.addEventListener('load', function () {
      ScrollTrigger.refresh();
    });
  }
})();
