/* =============================================================================
   VIGAM LABS — Interactive KLANG Studio Mockup & GSAP Scroll Choreography
   ============================================================================= */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
     2. STAGE VIEW TABS (Interactive Mockup vs Raw Screenshots)
     ------------------------------------------------------------------------- */
  var mockupView = document.getElementById('klang-mockup-view');
  var screenshotsView = document.getElementById('klang-screenshots-view');
  var stageImg = document.getElementById('stage-img');

  document.querySelectorAll('[data-stage-mode]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var mode = tab.getAttribute('data-stage-mode');
      document.querySelectorAll('[data-stage-mode]').forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (mode === 'screenshots') {
        if (mockupView) mockupView.hidden = true;
        if (screenshotsView) screenshotsView.hidden = false;
      } else {
        if (mockupView) mockupView.hidden = false;
        if (screenshotsView) screenshotsView.hidden = true;
      }
    });
  });

  document.querySelectorAll('[data-ss]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = btn.getAttribute('data-ss');
      document.querySelectorAll('[data-ss]').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      if (stageImg && src) {
        stageImg.src = src;
      }
    });
  });

  /* -------------------------------------------------------------------------
     3. WORKING KLANG MOCKUP — SAMPLE & PRESET DATABASE
     ------------------------------------------------------------------------- */
  var AUDIO_LIBRARY = [
    // Warm Analog Pads
    {
      id: 's1',
      name: 'pad_warm_detuned_analog_Dmin',
      cat: 'pads',
      key: 'Dm',
      keyRoot: 'D',
      dur: 3.99,
      lengthType: 'loop',
      toneType: 'warm',
      attackType: 'soft',
      waveKind: 'pad',
      seed: 11,
      baseScore: 92,
      tags: 'warm analog pad detuned lush synth ambient chord dark dmin'
    },
    {
      id: 's2',
      name: 'atmos_dark_drone_texture_Cmin',
      cat: 'pads',
      key: 'Cm',
      keyRoot: 'C',
      dur: 4.99,
      lengthType: 'loop',
      toneType: 'warm',
      attackType: 'soft',
      waveKind: 'pad',
      seed: 23,
      baseScore: 86,
      tags: 'warm analog pad dark drone texture ambient cinematic cmin'
    },
    {
      id: 's3',
      name: 'pad_lush_chorus_ambient_Fmaj',
      cat: 'pads',
      key: 'F',
      keyRoot: 'F',
      dur: 4.49,
      lengthType: 'loop',
      toneType: 'warm',
      attackType: 'soft',
      waveKind: 'pad',
      seed: 37,
      baseScore: 81,
      tags: 'warm analog pad lush chorus ambient tape fmaj'
    },
    {
      id: 's4',
      name: 'pad_ethereal_shimmer_evolving_Dmin',
      cat: 'pads',
      key: 'Dm',
      keyRoot: 'D',
      dur: 4.99,
      lengthType: 'loop',
      toneType: 'bright',
      attackType: 'soft',
      waveKind: 'pad',
      seed: 51,
      baseScore: 76,
      tags: 'warm analog pad ethereal shimmer evolving airy bright dmin'
    },
    {
      id: 's5',
      name: 'pad_bright_glassy_strings_Gmaj',
      cat: 'pads',
      key: 'G',
      keyRoot: 'G',
      dur: 4.00,
      lengthType: 'loop',
      toneType: 'bright',
      attackType: 'soft',
      waveKind: 'pad',
      seed: 64,
      baseScore: 71,
      tags: 'warm analog pad bright glassy strings synth gmaj'
    },
    // Punchy / Dusty Snares & Drums
    {
      id: 's6',
      name: 'snare_woody_crisp_vintage_D',
      cat: 'drums / snares',
      key: 'D',
      keyRoot: 'D',
      dur: 0.42,
      lengthType: 'oneshot',
      toneType: 'warm',
      attackType: 'punchy',
      waveKind: 'snare',
      seed: 79,
      baseScore: 94,
      tags: 'punchy dusty snare woody crisp vintage drum lofi acoustic crack rim'
    },
    {
      id: 's7',
      name: 'snare_dusty_tape_break_C',
      cat: 'drums / snares',
      key: 'C',
      keyRoot: 'C',
      dur: 0.51,
      lengthType: 'oneshot',
      toneType: 'warm',
      attackType: 'punchy',
      waveKind: 'snare',
      seed: 93,
      baseScore: 89,
      tags: 'punchy dusty snare tape break lofi vinyl boom bap drum'
    },
    {
      id: 's8',
      name: 'rimshot_dry_maple_tight_F',
      cat: 'drums / snares',
      key: 'F',
      keyRoot: 'F',
      dur: 0.28,
      lengthType: 'oneshot',
      toneType: 'bright',
      attackType: 'punchy',
      waveKind: 'snare',
      seed: 108,
      baseScore: 82,
      tags: 'punchy dusty snare rimshot dry maple tight perc transient'
    },
    {
      id: 's9',
      name: 'clap_layered_analog_room_A',
      cat: 'drums / snares',
      key: 'A',
      keyRoot: 'A',
      dur: 0.64,
      lengthType: 'oneshot',
      toneType: 'bright',
      attackType: 'punchy',
      waveKind: 'snare',
      seed: 121,
      baseScore: 77,
      tags: 'punchy dusty snare clap layered analog room snap drum'
    },
    // Distorted Sub 808s & Bass
    {
      id: 's10',
      name: 'bass_808_distorted_sub_Fmin',
      cat: 'bass / 808',
      key: 'Fm',
      keyRoot: 'F',
      dur: 1.38,
      lengthType: 'oneshot',
      toneType: 'warm',
      attackType: 'punchy',
      waveKind: 'bass',
      seed: 135,
      baseScore: 95,
      tags: 'distorted sub 808 bass deep heavy Glide saturated low punchy'
    },
    {
      id: 's11',
      name: 'sub_reese_growl_neuro_Dmin',
      cat: 'bass / 808',
      key: 'Dm',
      keyRoot: 'D',
      dur: 2.85,
      lengthType: 'loop',
      toneType: 'warm',
      attackType: 'soft',
      waveKind: 'bass',
      seed: 149,
      baseScore: 88,
      tags: 'distorted sub 808 bass reese growl dark analog synth low'
    },
    {
      id: 's12',
      name: '808_clipped_spinz_punch_C',
      cat: 'bass / 808',
      key: 'C',
      keyRoot: 'C',
      dur: 1.12,
      lengthType: 'oneshot',
      toneType: 'warm',
      attackType: 'punchy',
      waveKind: 'bass',
      seed: 162,
      baseScore: 84,
      tags: 'distorted sub 808 bass clipped spinz punchy hard kick'
    },
    // Glassy Plucks & Arps
    {
      id: 's13',
      name: 'pluck_glassy_fm_arp_Amaj',
      cat: 'synths / plucks',
      key: 'A',
      keyRoot: 'A',
      dur: 0.88,
      lengthType: 'oneshot',
      toneType: 'bright',
      attackType: 'punchy',
      waveKind: 'pluck',
      seed: 177,
      baseScore: 93,
      tags: 'glassy arp pluck fm bell bright crystal synth metallic'
    },
    {
      id: 's14',
      name: 'bell_crystalline_modular_Emin',
      cat: 'synths / plucks',
      key: 'Em',
      keyRoot: 'E',
      dur: 1.24,
      lengthType: 'oneshot',
      toneType: 'bright',
      attackType: 'punchy',
      waveKind: 'pluck',
      seed: 194,
      baseScore: 87,
      tags: 'glassy arp pluck bell crystalline modular bright mallet'
    },
    {
      id: 's15',
      name: 'arp_analog_juno_chorus_G',
      cat: 'synths / plucks',
      key: 'G',
      keyRoot: 'G',
      dur: 3.20,
      lengthType: 'loop',
      toneType: 'bright',
      attackType: 'punchy',
      waveKind: 'pluck',
      seed: 211,
      baseScore: 81,
      tags: 'glassy arp pluck analog juno chorus sequence loop synth'
    },
    {
      id: 's16',
      name: 'keys_rhodes_velvet_chord_Bmin',
      cat: 'synths / keys',
      key: 'Bm',
      keyRoot: 'B',
      dur: 2.60,
      lengthType: 'loop',
      toneType: 'warm',
      attackType: 'soft',
      waveKind: 'pad',
      seed: 229,
      baseScore: 78,
      tags: 'warm analog pad keys rhodes velvet chord electric piano glassy'
    }
  ];

  var PRESETS_LIBRARY = [
    {
      id: 'p1',
      name: 'Warm_Detuned_Prophet_Pad.vital',
      cat: 'Vital Synth Preset · Pad',
      key: 'Dm',
      keyRoot: 'D',
      dur: 4.00,
      lengthType: 'loop',
      toneType: 'warm',
      attackType: 'soft',
      waveKind: 'pad',
      seed: 31,
      baseScore: 94,
      tags: 'warm analog pad prophet synth vital preset lush chord'
    },
    {
      id: 'p2',
      name: 'Submerged_Reese_808_Sub.vital',
      cat: 'Vital Synth Preset · Bass',
      key: 'Fm',
      keyRoot: 'F',
      dur: 2.40,
      lengthType: 'oneshot',
      toneType: 'warm',
      attackType: 'punchy',
      waveKind: 'bass',
      seed: 47,
      baseScore: 91,
      tags: 'distorted sub 808 bass reese vital preset dark'
    },
    {
      id: 'p3',
      name: 'Glassy_FM_Pluck_Bell.vital',
      cat: 'Vital Synth Preset · Pluck',
      key: 'A',
      keyRoot: 'A',
      dur: 1.10,
      lengthType: 'oneshot',
      toneType: 'bright',
      attackType: 'punchy',
      waveKind: 'pluck',
      seed: 63,
      baseScore: 88,
      tags: 'glassy arp pluck fm bell vital preset bright'
    },
    {
      id: 'p4',
      name: 'Dusty_Tape_Transient_Lead.vital',
      cat: 'Vital Synth Preset · Lead',
      key: 'C',
      keyRoot: 'C',
      dur: 1.45,
      lengthType: 'oneshot',
      toneType: 'warm',
      attackType: 'punchy',
      waveKind: 'snare',
      seed: 85,
      baseScore: 83,
      tags: 'punchy dusty snare lead transient analog vital'
    },
    {
      id: 'p5',
      name: 'Ethereal_Shimmer_Strings.vital',
      cat: 'Vital Synth Preset · Pad',
      key: 'G',
      keyRoot: 'G',
      dur: 4.50,
      lengthType: 'loop',
      toneType: 'bright',
      attackType: 'soft',
      waveKind: 'pad',
      seed: 102,
      baseScore: 79,
      tags: 'warm analog pad glassy strings ambient vital'
    }
  ];

  /* -------------------------------------------------------------------------
     4. DETERMINISTIC 76-BAR SVG WAVEFORM GENERATOR
     ------------------------------------------------------------------------- */
  function buildWaveformSvg(kind, seed) {
    var bars = 76;
    var width = 380;
    var height = 32;
    var mid = height / 2;
    var step = width / bars;
    var barWidth = 2.5;
    var rects = '';

    for (var i = 0; i < bars; i++) {
      var t = i / (bars - 1);
      var n = Math.sin(i * 1.65 + seed) * 0.5 +
              Math.cos(i * 0.72 + seed * 1.4) * 0.35 +
              Math.sin(i * 3.1 + seed * 0.6) * 0.15;
      n = Math.min(1, Math.max(0.08, Math.abs(n)));

      var env = 1;
      if (kind === 'pad') {
        env = Math.sin(t * Math.PI) * 0.85 + 0.18;
      } else if (kind === 'snare') {
        env = t < 0.08 ? (t / 0.08) : Math.pow(1 - (t - 0.08) / 0.92, 2.2);
      } else if (kind === 'bass') {
        env = t < 0.06 ? (t / 0.06) : Math.pow(1 - t, 0.95);
      } else if (kind === 'pluck') {
        var beat = (i % 19) / 19;
        env = Math.pow(1 - beat, 1.8) * (1 - t * 0.25);
      }

      var amp = Math.max(2.5, Math.min(height - 2, (0.18 + n * 0.82) * env * (height - 2)));
      var x = (i * step + (step - barWidth) * 0.5).toFixed(1);
      var y = (mid - amp / 2).toFixed(1);
      var h = amp.toFixed(1);
      rects += '<rect class="ka-wave-bar" data-bar-idx="' + i + '" x="' + x + '" y="' + y + '" width="' + barWidth + '" height="' + h + '" rx="1.1"></rect>';
    }

    return '<svg class="ka-wave-svg" viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="none" aria-hidden="true">' + rects + '</svg>';
  }

  /* -------------------------------------------------------------------------
     5. REAL WEBAUDIO SYNTHESIZER FOR SAMPLE PREVIEW
     ------------------------------------------------------------------------- */
  var audioCtx = null;
  var activeAudioStop = null;

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

  function stopActiveWebAudio() {
    if (typeof activeAudioStop === 'function') {
      try { activeAudioStop(); } catch (e) {}
      activeAudioStop = null;
    }
  }

  function triggerSampleWebAudio(sample, pitchSemitones, masterVolPct) {
    stopActiveWebAudio();
    var ctx = ensureAudioCtx();
    if (!ctx) return;

    var now = ctx.currentTime;
    var vol = Math.max(0, Math.min(1, (masterVolPct || 75) / 100)) * 0.28;
    if (vol <= 0.001) return;

    var pitchRatio = Math.pow(2, (pitchSemitones || 0) / 12);
    var keyFreqMap = {
      'C': 130.81, 'D': 146.83, 'E': 164.81, 'F': 174.61,
      'G': 196.00, 'A': 220.00, 'B': 246.94
    };
    var baseFreq = (keyFreqMap[sample.keyRoot] || 146.83) * pitchRatio;

    var master = ctx.createGain();
    master.gain.setValueAtTime(vol, now);
    master.connect(ctx.destination);

    var nodesToStop = [];

    if (sample.waveKind === 'pad') {
      // Warm detuned lush analog pad chord (root, minor/major 3rd, 5th, octave)
      var ratios = [1, 1.1892, 1.4983, 2];
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      var cutoff = sample.toneType === 'bright' ? 3200 : 1350;
      filter.frequency.setValueAtTime(cutoff * 0.45, now);
      filter.frequency.exponentialRampToValueAtTime(cutoff, now + 1.1);
      filter.frequency.exponentialRampToValueAtTime(cutoff * 0.6, now + 3.6);
      filter.Q.value = 1.8;

      var env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(0.45, now + 0.35);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      filter.connect(env);
      env.connect(master);

      ratios.forEach(function (r, idx) {
        var osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq * r, now);
        osc.detune.setValueAtTime((idx - 1.5) * 9, now);
        osc.connect(filter);
        osc.start(now);
        osc.stop(now + 3.85);
        nodesToStop.push(osc);
      });
    } else if (sample.waveKind === 'snare') {
      // Punchy woody snare / transient: body pitch drop + filtered noise burst
      var bodyOsc = ctx.createOscillator();
      var bodyGain = ctx.createGain();
      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(210 * pitchRatio, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(92 * pitchRatio, now + 0.11);
      bodyGain.gain.setValueAtTime(0.85, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      bodyOsc.connect(bodyGain);
      bodyGain.connect(master);
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.24);
      nodesToStop.push(bodyOsc);

      // Noise burst
      var bufSize = Math.floor(ctx.sampleRate * 0.38);
      var noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      var data = noiseBuf.getChannelData(0);
      for (var i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.9);
      }
      var noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(sample.toneType === 'bright' ? 2600 : 1650, now);
      bp.Q.value = 0.9;
      var nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.65, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      noise.connect(bp);
      bp.connect(nGain);
      nGain.connect(master);
      noise.start(now);
      nodesToStop.push(noise);
    } else if (sample.waveKind === 'bass') {
      // Saturated 808 sub glide
      var subOsc = ctx.createOscillator();
      var harmOsc = ctx.createOscillator();
      var lp = ctx.createBiquadFilter();
      var subGain = ctx.createGain();

      subOsc.type = 'sine';
      harmOsc.type = 'sawtooth';
      var rootSub = (baseFreq * 0.5);
      subOsc.frequency.setValueAtTime(rootSub * 2.1, now);
      subOsc.frequency.exponentialRampToValueAtTime(rootSub, now + 0.065);
      subOsc.frequency.exponentialRampToValueAtTime(rootSub * 0.88, now + 1.25);

      harmOsc.frequency.setValueAtTime(rootSub * 2.1, now);
      harmOsc.frequency.exponentialRampToValueAtTime(rootSub, now + 0.065);

      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(420, now);
      lp.frequency.exponentialRampToValueAtTime(140, now + 0.9);

      subGain.gain.setValueAtTime(0.95, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);

      var harmGain = ctx.createGain();
      harmGain.gain.value = 0.22;

      subOsc.connect(subGain);
      harmOsc.connect(lp);
      lp.connect(harmGain);
      harmGain.connect(subGain);
      subGain.connect(master);

      subOsc.start(now);
      harmOsc.start(now);
      subOsc.stop(now + 1.38);
      harmOsc.stop(now + 1.38);
      nodesToStop.push(subOsc, harmOsc);
    } else {
      // Glassy FM / Arp Pluck sequence
      var arpNotes = [1, 1.25, 1.5, 2];
      arpNotes.forEach(function (mult, idx) {
        var t0 = now + idx * 0.14;
        var carrier = ctx.createOscillator();
        var mod = ctx.createOscillator();
        var modGain = ctx.createGain();
        var pGain = ctx.createGain();

        carrier.type = 'sine';
        mod.type = 'triangle';
        var f = baseFreq * 2 * mult;
        carrier.frequency.setValueAtTime(f, t0);
        mod.frequency.setValueAtTime(f * 2, t0);

        modGain.gain.setValueAtTime(f * 1.4, t0);
        modGain.gain.exponentialRampToValueAtTime(1, t0 + 0.22);

        pGain.gain.setValueAtTime(0.001, t0);
        pGain.gain.linearRampToValueAtTime(0.5, t0 + 0.012);
        pGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.55);

        mod.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(pGain);
        pGain.connect(master);

        carrier.start(t0);
        mod.start(t0);
        carrier.stop(t0 + 0.58);
        mod.stop(t0 + 0.58);
        nodesToStop.push(carrier, mod);
      });
    }

    activeAudioStop = function () {
      nodesToStop.forEach(function (n) {
        try { n.stop(); } catch (e) {}
      });
      try { master.disconnect(); } catch (e) {}
    };
  }

  /* -------------------------------------------------------------------------
     6. KLANG MOCKUP STATE, FILTERING, PLAYBACK & ROTARY DIALS
     ------------------------------------------------------------------------- */
  var state = {
    libMode: 'audio',       // 'audio' | 'presets'
    query: 'warm analog pad',
    keyFilter: 'Any',
    macros: {
      length: 'all',        // 'all' | 'oneshot' | 'loop'
      tone: 'all',          // 'warm' | 'all' | 'bright'
      attack: 'all',        // 'all' | 'punchy' | 'soft'
      match: 20             // 20 | 50 | 75
    },
    playingId: 's1',
    isPlaying: false,
    playProgress: 0.436,    // starts at 1.74s / 3.99s like screenshot!
    pitchSt: 0,
    loop: true,
    masterVol: 75,
    userInteracted: false
  };

  var rowsContainer = document.getElementById('ka-rows');
  var searchInput = document.getElementById('ka-search-input');
  var searchBox = document.getElementById('ka-search-box');
  var clearBtn = document.getElementById('ka-clear-btn');
  var micBtn = document.getElementById('ka-mic-btn');
  var countText = document.getElementById('ka-count-text');
  var latencyText = document.getElementById('ka-latency-text');
  var filtersToggle = document.getElementById('ka-filters-toggle');
  var macroDrawer = document.getElementById('ka-macro-drawer');
  var resetFiltersBtn = document.getElementById('ka-reset-filters');
  var masterVolInput = document.getElementById('ka-master-vol');
  var volLabel = document.getElementById('ka-vol-label');

  // Transport DOM
  var transportPlayBtn = document.getElementById('ka-transport-play');
  var transportTime = document.getElementById('ka-transport-time');
  var transportName = document.getElementById('ka-transport-name');
  var transportKey = document.getElementById('ka-transport-key');
  var transportFill = document.getElementById('ka-transport-fill');
  var transportTrack = document.getElementById('ka-transport-track');
  var pitchDownBtn = document.getElementById('ka-pitch-down');
  var pitchUpBtn = document.getElementById('ka-pitch-up');
  var pitchValEl = document.getElementById('ka-pitch-val');
  var loopBtn = document.getElementById('ka-loop-btn');

  // Score & Filter Engine
  function getFilteredSamples() {
    var pool = state.libMode === 'presets' ? PRESETS_LIBRARY : AUDIO_LIBRARY;
    var q = (state.query || '').toLowerCase().trim();
    var tokens = q.replace(/similar:/g, '').split(/\s+/).filter(Boolean);

    var scored = pool.map(function (item) {
      var score = item.baseScore;
      var hay = (item.name + ' ' + item.cat + ' ' + item.tags + ' ' + item.key).toLowerCase();

      if (tokens.length > 0) {
        var hits = 0;
        tokens.forEach(function (tok) {
          if (hay.indexOf(tok) !== -1) hits += 1;
        });
        var ratio = hits / tokens.length;
        score = Math.round(item.baseScore * (0.38 + 0.62 * ratio));
      }

      // Apply Macro boosts / penalties so filtering feels alive
      if (state.macros.length !== 'all') {
        if (item.lengthType === state.macros.length) score += 8;
        else score -= 28;
      }
      if (state.macros.tone !== 'all') {
        if (item.toneType === state.macros.tone) score += 7;
        else score -= 24;
      }
      if (state.macros.attack !== 'all') {
        if (item.attackType === state.macros.attack) score += 7;
        else score -= 24;
      }
      if (state.keyFilter !== 'Any') {
        if (item.keyRoot === state.keyFilter) score += 10;
        else score -= 35;
      }

      score = Math.max(18, Math.min(99, score));
      return { item: item, score: score };
    });

    var cutoff = Number(state.macros.match) || 20;
    var filtered = scored.filter(function (entry) {
      return entry.score >= cutoff;
    });

    filtered.sort(function (a, b) {
      return b.score - a.score;
    });

    // Always show at least top 3 even if strict filters applied, or up to 5
    if (filtered.length === 0) {
      scored.sort(function (a, b) { return b.score - a.score; });
      filtered = scored.slice(0, 3);
    } else {
      filtered = filtered.slice(0, 5);
    }

    return filtered;
  }

  function findSampleById(id) {
    var all = AUDIO_LIBRARY.concat(PRESETS_LIBRARY);
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return AUDIO_LIBRARY[0];
  }

  function updateTransportUI() {
    var activeSample = findSampleById(state.playingId) || AUDIO_LIBRARY[0];
    var elapsed = (activeSample.dur * state.playProgress).toFixed(2);
    var total = activeSample.dur.toFixed(2);

    if (transportTime) transportTime.textContent = elapsed + 's / ' + total + 's';
    if (transportName) {
      var ext = state.libMode === 'presets' || activeSample.name.indexOf('.vital') !== -1 ? '' : '.wav';
      transportName.textContent = activeSample.name + ext;
    }
    if (transportKey) transportKey.textContent = activeSample.key;
    if (transportFill) transportFill.style.width = (state.playProgress * 100).toFixed(1) + '%';
    if (transportPlayBtn) {
      transportPlayBtn.classList.toggle('playing', state.isPlaying);
    }

    // Update row playhead and bar highlights
    if (!rowsContainer) return;
    rowsContainer.querySelectorAll('.ka-row').forEach(function (rowEl) {
      var rid = rowEl.getAttribute('data-sample-id');
      var isThisActive = rid === state.playingId;
      rowEl.classList.toggle('selected', isThisActive);
      rowEl.classList.toggle('playing', isThisActive && state.isPlaying);

      var playBtn = rowEl.querySelector('.ka-play-btn');
      if (playBtn) {
        playBtn.innerHTML = (isThisActive && state.isPlaying)
          ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5"></rect></svg>'
          : '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>';
      }

      var playhead = rowEl.querySelector('.ka-playhead');
      if (playhead) {
        playhead.style.left = isThisActive ? (state.playProgress * 100).toFixed(1) + '%' : '0%';
        playhead.style.opacity = isThisActive ? '1' : '0';
      }

      var bars = rowEl.querySelectorAll('.ka-wave-bar');
      if (bars.length) {
        var cutoffIdx = Math.floor(state.playProgress * bars.length);
        bars.forEach(function (bar, idx) {
          if (isThisActive) {
            bar.classList.toggle('played', idx <= cutoffIdx);
            bar.classList.toggle('unplayed', idx > cutoffIdx);
          } else {
            bar.classList.remove('played', 'unplayed');
          }
        });
      }
    });
  }

  function renderRows(animateEntrance) {
    if (!rowsContainer) return;
    var results = getFilteredSamples();

    if (countText) {
      var unit = state.libMode === 'presets' ? 'presets' : 'sounds';
      countText.textContent = results.length + ' ' + unit;
    }
    if (latencyText) {
      var ms = (8 + ((state.query.length * 3) % 7)).toString();
      latencyText.textContent = ms + ' ms local';
    }

    // Ensure playingId is valid
    var hasActive = results.some(function (r) { return r.item.id === state.playingId; });
    if (!hasActive && results.length > 0 && !state.isPlaying) {
      state.playingId = results[0].item.id;
      state.playProgress = 0.42;
    }

    var html = results.map(function (entry) {
      var s = entry.item;
      var score = entry.score;
      var isRowActive = s.id === state.playingId;
      return (
        '<div class="ka-row' + (isRowActive && state.isPlaying ? ' playing' : '') + '" role="listitem" data-sample-id="' + s.id + '">' +
          '<span class="ka-grip" aria-hidden="true">&#8942;&#8942;</span>' +
          '<button type="button" class="ka-play-btn" data-action="play" aria-label="Play ' + s.name + '">' +
            ((isRowActive && state.isPlaying)
              ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5"></rect></svg>'
              : '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>') +
          '</button>' +
          '<div class="ka-sample-meta">' +
            '<span class="ka-sample-name">' + s.name + '</span>' +
            '<span class="ka-sample-cat">' + s.cat + '</span>' +
          '</div>' +
          '<div class="ka-wave-wrap" data-action="scrub" title="Click waveform to audition from position">' +
            buildWaveformSvg(s.waveKind, s.seed) +
            '<span class="ka-playhead"></span>' +
          '</div>' +
          '<span class="ka-key-tag">' + s.key + '</span>' +
          '<div class="ka-tech-info">' +
            '<span class="ka-dur">' + s.dur.toFixed(2) + 's</span>' +
            '<span class="ka-rate">44.1kHz &middot; Stereo</span>' +
          '</div>' +
          '<span class="ka-score">' + score + '%</span>' +
          '<button type="button" class="ka-similar-btn" data-action="similar">Similar</button>' +
        '</div>'
      );
    }).join('');

    rowsContainer.innerHTML = html;
    updateTransportUI();

    if (animateEntrance && window.gsap && !prefersReduced) {
      gsap.fromTo(
        rowsContainer.querySelectorAll('.ka-row'),
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.28, stagger: 0.035, ease: 'power2.out', clearProps: 'transform' }
      );
    }
  }

  /* -------------------------------------------------------------------------
     7. PLAYBACK LOOP (60fps Playhead & Transport Timer)
     ------------------------------------------------------------------------- */
  var rafId = null;
  var lastTick = 0;

  function tickPlayback(ts) {
    if (!state.isPlaying) return;
    if (!lastTick) lastTick = ts;
    var dt = (ts - lastTick) / 1000;
    lastTick = ts;

    var sample = findSampleById(state.playingId) || AUDIO_LIBRARY[0];
    var dur = Math.max(0.35, sample.dur);
    state.playProgress += dt / dur;

    if (state.playProgress >= 1) {
      if (state.loop) {
        state.playProgress = 0;
        triggerSampleWebAudio(sample, state.pitchSt, state.masterVol);
      } else {
        state.playProgress = 0;
        state.isPlaying = false;
        stopActiveWebAudio();
        updateTransportUI();
        return;
      }
    }

    updateTransportUI();
    rafId = requestAnimationFrame(tickPlayback);
  }

  function startSamplePlayback(sampleId, startProgress) {
    var sample = findSampleById(sampleId) || AUDIO_LIBRARY[0];
    state.playingId = sample.id;
    state.playProgress = typeof startProgress === 'number' ? startProgress : 0;
    state.isPlaying = true;
    lastTick = 0;
    triggerSampleWebAudio(sample, state.pitchSt, state.masterVol);
    updateTransportUI();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tickPlayback);
  }

  function stopSamplePlayback() {
    state.isPlaying = false;
    cancelAnimationFrame(rafId);
    stopActiveWebAudio();
    updateTransportUI();
  }

  // Row Click Delegation (Play, Waveform Scrub, Similar)
  if (rowsContainer) {
    rowsContainer.addEventListener('click', function (e) {
      var row = e.target.closest('.ka-row');
      if (!row) return;
      var sampleId = row.getAttribute('data-sample-id');
      state.userInteracted = true;

      var playBtn = e.target.closest('[data-action="play"]');
      if (playBtn) {
        if (state.playingId === sampleId && state.isPlaying) {
          stopSamplePlayback();
        } else {
          startSamplePlayback(sampleId, 0);
        }
        return;
      }

      var similarBtn = e.target.closest('[data-action="similar"]');
      if (similarBtn) {
        var s = findSampleById(sampleId);
        if (s) {
          state.query = s.tags.split(' ').slice(0, 3).join(' ');
          if (searchInput) searchInput.value = 'similar: ' + s.name;
          renderRows(true);
        }
        return;
      }

      var waveWrap = e.target.closest('[data-action="scrub"]');
      if (waveWrap) {
        var rect = waveWrap.getBoundingClientRect();
        var pct = Math.max(0, Math.min(0.98, (e.clientX - rect.left) / rect.width));
        startSamplePlayback(sampleId, pct);
      }
    });
  }

  // Transport Controls
  if (transportPlayBtn) {
    transportPlayBtn.addEventListener('click', function () {
      state.userInteracted = true;
      if (state.isPlaying) {
        stopSamplePlayback();
      } else {
        var startAt = state.playProgress >= 0.96 ? 0 : state.playProgress;
        startSamplePlayback(state.playingId, startAt);
      }
    });
  }

  if (transportTrack) {
    transportTrack.addEventListener('click', function (e) {
      state.userInteracted = true;
      var rect = transportTrack.getBoundingClientRect();
      var pct = Math.max(0, Math.min(0.98, (e.clientX - rect.left) / rect.width));
      startSamplePlayback(state.playingId, pct);
    });
  }

  if (pitchDownBtn && pitchUpBtn && pitchValEl) {
    pitchDownBtn.addEventListener('click', function () {
      state.userInteracted = true;
      state.pitchSt = Math.max(-12, state.pitchSt - 1);
      pitchValEl.textContent = (state.pitchSt > 0 ? '+' : '') + state.pitchSt + ' st';
      if (state.isPlaying) {
        triggerSampleWebAudio(findSampleById(state.playingId), state.pitchSt, state.masterVol);
      }
    });
    pitchUpBtn.addEventListener('click', function () {
      state.userInteracted = true;
      state.pitchSt = Math.min(12, state.pitchSt + 1);
      pitchValEl.textContent = (state.pitchSt > 0 ? '+' : '') + state.pitchSt + ' st';
      if (state.isPlaying) {
        triggerSampleWebAudio(findSampleById(state.playingId), state.pitchSt, state.masterVol);
      }
    });
  }

  if (loopBtn) {
    loopBtn.addEventListener('click', function () {
      state.loop = !state.loop;
      loopBtn.classList.toggle('active', state.loop);
      loopBtn.setAttribute('aria-pressed', state.loop ? 'true' : 'false');
    });
  }

  if (masterVolInput && volLabel) {
    masterVolInput.addEventListener('input', function () {
      state.masterVol = Number(masterVolInput.value);
      volLabel.textContent = state.masterVol + '%';
    });
  }

  /* -------------------------------------------------------------------------
     8. ANALOG / STUDIO ROTARY DIALS & MACRO FILTER CONTROLS
     ------------------------------------------------------------------------- */
  var DIAL_CONFIG = {
    length: {
      all:     { angle: -90, offset: 68, label: 'Any Length' },
      oneshot: { angle: -15, offset: 42, label: '1-Shot (<1.5s)' },
      loop:    { angle: 95,  offset: 12, label: 'Loop (>2.5s)' }
    },
    tone: {
      warm:    { angle: -85, offset: 66, label: 'Warm & Deep' },
      all:     { angle: 0,   offset: 36, label: 'Any Tone' },
      bright:  { angle: 95,  offset: 10, label: 'Bright & Airy' }
    },
    attack: {
      all:     { angle: -60, offset: 56, label: 'Any Attack' },
      punchy:  { angle: -95, offset: 70, label: 'Punchy (<35ms)' },
      soft:    { angle: 85,  offset: 16, label: 'Soft (>120ms)' }
    },
    match: {
      '20':    { angle: -75, offset: 72, label: '\u2265 20% Match' },
      '50':    { angle: 5,   offset: 40, label: '\u2265 50% Match' },
      '75':    { angle: 95,  offset: 14, label: '\u2265 75% Match' }
    }
  };

  function setMacroState(macro, val, animateRows) {
    state.macros[macro] = val;
    var cfg = DIAL_CONFIG[macro] && DIAL_CONFIG[macro][String(val)];
    if (!cfg) return;

    var valEl = document.getElementById('dial-val-' + macro);
    if (valEl) valEl.textContent = cfg.label;

    document.querySelectorAll('[data-macro-btn="' + macro + '"]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-val') === String(val));
    });

    var arcEl = document.getElementById('dial-arc-' + macro);
    var rotorEl = document.getElementById('dial-rotor-' + macro);

    if (window.gsap && !prefersReduced) {
      if (arcEl) gsap.to(arcEl, { strokeDashoffset: cfg.offset, duration: 0.42, ease: 'expo.out' });
      if (rotorEl) gsap.to(rotorEl, { attr: { transform: 'rotate(' + cfg.angle + ' 28 28)' }, duration: 0.42, ease: 'expo.out' });
    } else {
      if (arcEl) arcEl.style.strokeDashoffset = cfg.offset;
      if (rotorEl) rotorEl.setAttribute('transform', 'rotate(' + cfg.angle + ' 28 28)');
    }

    if (animateRows !== false) {
      renderRows(true);
    }
  }

  // Segmented Buttons inside Rotary Cards
  document.querySelectorAll('[data-macro-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.userInteracted = true;
      var macro = btn.getAttribute('data-macro-btn');
      var val = btn.getAttribute('data-val');
      setMacroState(macro, val, true);
    });
  });

  // Clicking or Dragging a Rotary Dial cycles/scrubs its 3 positions!
  var MACRO_ORDER = {
    length: ['all', 'oneshot', 'loop'],
    tone: ['warm', 'all', 'bright'],
    attack: ['punchy', 'all', 'soft'],
    match: ['20', '50', '75']
  };

  document.querySelectorAll('[data-dial]').forEach(function (dialEl) {
    var macro = dialEl.getAttribute('data-dial');
    var order = MACRO_ORDER[macro];
    if (!order) return;

    dialEl.addEventListener('click', function () {
      state.userInteracted = true;
      var curr = String(state.macros[macro]);
      var idx = (order.indexOf(curr) + 1) % order.length;
      setMacroState(macro, order[idx], true);
    });
  });

  // Musical Key Filter Strip
  document.querySelectorAll('[data-key]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.userInteracted = true;
      state.keyFilter = btn.getAttribute('data-key');
      document.querySelectorAll('[data-key]').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      renderRows(true);
    });
  });

  // Reset All Macro Filters
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', function () {
      state.userInteracted = true;
      state.keyFilter = 'Any';
      document.querySelectorAll('[data-key]').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-key') === 'Any');
      });
      setMacroState('length', 'all', false);
      setMacroState('tone', 'all', false);
      setMacroState('attack', 'all', false);
      setMacroState('match', '20', false);
      renderRows(true);
    });
  }

  // Filters Drawer Toggle
  if (filtersToggle && macroDrawer) {
    filtersToggle.addEventListener('click', function () {
      state.userInteracted = true;
      var isOpen = filtersToggle.classList.toggle('active');
      filtersToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      macroDrawer.hidden = !isOpen;
    });
  }

  // Library Mode Toggle (Audio 25 | Presets 5)
  document.querySelectorAll('[data-lib-mode]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.userInteracted = true;
      state.libMode = btn.getAttribute('data-lib-mode');
      document.querySelectorAll('[data-lib-mode]').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      renderRows(true);
    });
  });

  /* -------------------------------------------------------------------------
     9. SEARCH INPUT, PRESET CHIPS & VOICE MIC SIMULATION
     ------------------------------------------------------------------------- */
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.userInteracted = true;
      state.query = searchInput.value;
      document.querySelectorAll('[data-preset-query]').forEach(function (chip) {
        chip.classList.toggle('active', chip.getAttribute('data-preset-query') === state.query.trim());
      });
      renderRows(true);
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', function () {
      state.userInteracted = true;
      searchInput.value = '';
      state.query = '';
      renderRows(true);
      searchInput.focus();
    });
  }

  // Preset Query Chips in Stage Header
  document.querySelectorAll('[data-preset-query]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      state.userInteracted = true;
      var q = chip.getAttribute('data-preset-query');
      document.querySelectorAll('[data-preset-query]').forEach(function (c) {
        c.classList.toggle('active', c === chip);
      });
      if (searchInput) searchInput.value = q;
      state.query = q;
      renderRows(true);
    });
  });

  // Voice / Beatbox Mic Simulation
  if (micBtn && searchInput && searchBox) {
    micBtn.addEventListener('click', function () {
      state.userInteracted = true;
      if (micBtn.classList.contains('recording')) return;
      micBtn.classList.add('recording');
      searchBox.classList.add('voice-active');
      searchInput.value = 'Listening... [hum or beatbox rhythm]';

      setTimeout(function () {
        micBtn.classList.remove('recording');
        searchBox.classList.remove('voice-active');
        var voiceQuery = 'punchy dusty snare';
        searchInput.value = voiceQuery;
        state.query = voiceQuery;
        document.querySelectorAll('[data-preset-query]').forEach(function (c) {
          c.classList.toggle('active', c.getAttribute('data-preset-query') === voiceQuery);
        });
        renderRows(true);
      }, 1150);
    });
  }

  // Initial render of KLANG rows
  renderRows(false);

  // Gentle Idle Auto-Demo Cycle (stops immediately when user clicks or types anywhere in KLANG)
  var DEMO_SCENES = [
    { query: 'warm analog pad', length: 'all', tone: 'all', attack: 'all', playId: 's1' },
    { query: 'punchy dusty snare', length: 'oneshot', tone: 'warm', attack: 'punchy', playId: 's6' },
    { query: 'distorted sub 808', length: 'oneshot', tone: 'warm', attack: 'punchy', playId: 's10' },
    { query: 'glassy arp pluck', length: 'all', tone: 'bright', attack: 'punchy', playId: 's13' }
  ];
  var demoSceneIdx = 0;

  if (!prefersReduced) {
    setInterval(function () {
      if (state.userInteracted || state.isPlaying || document.hidden) return;
      demoSceneIdx = (demoSceneIdx + 1) % DEMO_SCENES.length;
      var sc = DEMO_SCENES[demoSceneIdx];
      state.query = sc.query;
      state.playingId = sc.playId;
      state.playProgress = 0.436;
      if (searchInput) searchInput.value = sc.query;

      document.querySelectorAll('[data-preset-query]').forEach(function (c) {
        c.classList.toggle('active', c.getAttribute('data-preset-query') === sc.query);
      });

      setMacroState('length', sc.length, false);
      setMacroState('tone', sc.tone, false);
      setMacroState('attack', sc.attack, false);
      renderRows(true);
    }, 5200);
  }

  /* -------------------------------------------------------------------------
     10. GSAP + SCROLLTRIGGER CHOREOGRAPHY
     ------------------------------------------------------------------------- */
  if (!window.gsap) return;
  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Helper: Split element text nodes into word masks while preserving child elements & <br>
  function splitWordsForReveal(el) {
    if (!el || el.dataset.splitDone) return [];
    el.dataset.splitDone = '1';

    function processNode(node) {
      if (node.nodeType === 3) {
        var text = node.nodeValue;
        if (!text.trim()) return document.createTextNode(text);
        var frag = document.createDocumentFragment();
        var parts = text.split(/(\s+)/);
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            var wrap = document.createElement('span');
            wrap.className = 'gsap-word-wrap';
            var inner = document.createElement('span');
            inner.className = 'gsap-word';
            inner.textContent = part;
            wrap.appendChild(inner);
            frag.appendChild(wrap);
          }
        });
        return frag;
      } else if (node.nodeType === 1) {
        if (node.tagName === 'BR') return node.cloneNode(false);
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

  if (prefersReduced) return;

  // 10.1 Top Scroll Progress Bar
  var progressBar = document.getElementById('scroll-progress-bar');
  if (progressBar && window.ScrollTrigger) {
    gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.15
      }
    });
  }

  // 10.2 Hero Entrance Sequence (Word-Masked Headline + Lede + Actions)
  var heroTitle = document.getElementById('hero-title');
  var heroWords = splitWordsForReveal(heroTitle);
  var heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  if (heroWords.length) {
    heroTl.from(heroWords, {
      yPercent: 115,
      rotate: 2,
      opacity: 0,
      duration: 0.95,
      stagger: 0.045
    }, 0.05);
  }

  heroTl.from('.hero-lede', {
    y: 18,
    opacity: 0,
    duration: 0.8
  }, 0.35).from('.hero-actions .btn', {
    y: 14,
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    clearProps: 'all'
  }, 0.48);

  // 10.3 KLANG Stage 3D Perspective Unfold & Waveform Ripple on Load + Scroll Parallax
  var klangStage = document.getElementById('klang-stage');
  if (klangStage) {
    gsap.fromTo(
      klangStage,
      {
        y: 36,
        rotateX: 9,
        scale: 0.965,
        opacity: 0,
        transformPerspective: 1400,
        transformOrigin: '50% 0%'
      },
      {
        y: 0,
        rotateX: 0,
        scale: 1,
        opacity: 1,
        duration: 1.15,
        ease: 'expo.out',
        delay: 0.25
      }
    );

    // Ripple the SVG waveform bars inside KLANG as the stage enters
    var initialBars = klangStage.querySelectorAll('.ka-wave-bar');
    if (initialBars.length) {
      gsap.from(initialBars, {
        scaleY: 0.12,
        transformOrigin: '50% 50%',
        duration: 0.75,
        stagger: { amount: 0.45, from: 'start' },
        ease: 'back.out(1.6)',
        delay: 0.45
      });
    }

    // Subtle 3D Studio Hardware Mouse-Tilt & Spotlight Tracking
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
        rotY((px - 0.5) * 2.6);
        rotX((0.5 - py) * 2.2);
      });

      klangStage.addEventListener('mouseleave', function () {
        rotX(0);
        rotY(0);
      });
    }
  }

  // 10.4 Magnetic Buttons (.magnetic-btn)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnetic-btn').forEach(function (btn) {
      var xTo = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power3.out' });
      var yTo = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power3.out' });
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * 0.18);
        yTo(dy * 0.22);
      });
      btn.addEventListener('mouseleave', function () {
        xTo(0);
        yTo(0);
      });
    });
  }

  // 10.5 Scroll-Velocity & Cursor-Plucked Signal String Dividers (.signal-divider)
  document.querySelectorAll('.signal-divider').forEach(function (divider) {
    var path = divider.querySelector('.signal-path');
    if (!path) return;
    var proxy = { cy: 14, cx: 520 };

    function renderCurve() {
      path.setAttribute('d', 'M 0 14 Q ' + proxy.cx.toFixed(0) + ' ' + proxy.cy.toFixed(1) + ' 1040 14');
    }

    function pluck(deflection, centerX) {
      if (typeof centerX === 'number') proxy.cx = centerX;
      gsap.killTweensOf(proxy);
      proxy.cy = 14 + deflection;
      renderCurve();
      gsap.to(proxy, {
        cy: 14,
        duration: 1.15,
        ease: 'elastic.out(1.25, 0.18)',
        onUpdate: renderCurve
      });
    }

    // Pluck when scrolling past via ScrollTrigger velocity
    if (window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: divider,
        start: 'top 85%',
        end: 'bottom 15%',
        onEnter: function (self) {
          var v = Math.max(-22, Math.min(22, self.getVelocity() / 65));
          pluck(v || 10, 520);
        },
        onEnterBack: function (self) {
          var v = Math.max(-22, Math.min(22, self.getVelocity() / 65));
          pluck(v || -10, 520);
        }
      });
    }

    // Also pluck when user moves cursor across the signal line
    divider.addEventListener('mousemove', function (e) {
      var r = divider.getBoundingClientRect();
      var relX = ((e.clientX - r.left) / r.width) * 1040;
      var relY = (e.clientY - (r.top + r.height / 2)) * 1.35;
      pluck(Math.max(-20, Math.min(20, relY)), relX);
    });
  });

  // 10.6 ScrollTrigger Section Reveals (Ethos, About Us, Contact)
  if (window.ScrollTrigger) {
    // Ethos Section Reveal + Hardware Meter Fill + SVG Stroke Draw
    var ethosSection = document.getElementById('ethos');
    if (ethosSection) {
      var ethosH2Words = splitWordsForReveal(ethosSection.querySelector('.section-head h2'));
      var ethosTl = gsap.timeline({
        scrollTrigger: {
          trigger: ethosSection,
          start: 'top 82%',
          toggleActions: 'play none none none'
        }
      });

      if (ethosH2Words.length) {
        ethosTl.from(ethosH2Words, {
          yPercent: 110,
          opacity: 0,
          duration: 0.75,
          stagger: 0.04,
          ease: 'expo.out'
        }, 0);
      }

      ethosTl.from(ethosSection.querySelector('.section-head p'), {
        y: 14,
        opacity: 0,
        duration: 0.65,
        ease: 'expo.out'
      }, 0.1).from(ethosSection.querySelectorAll('.ethos-cell'), {
        y: 34,
        opacity: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: 'expo.out'
      }, 0.18);

      // SVG icon stroke draw animation inside Ethos cards
      ethosSection.querySelectorAll('.ethos-icon svg path, .ethos-icon svg rect, .ethos-icon svg circle, .ethos-icon svg line').forEach(function (shape) {
        gsap.fromTo(
          shape,
          { strokeDasharray: 80, strokeDashoffset: 80 },
          {
            strokeDashoffset: 0,
            duration: 1.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ethosSection,
              start: 'top 80%'
            }
          }
        );
      });

      // Animate the meter fills
      ethosSection.querySelectorAll('.ethos-meter-fill').forEach(function (fillEl) {
        var targetPct = Number(fillEl.getAttribute('data-fill')) || 0;
        ethosTl.to(fillEl, {
          width: targetPct + '%',
          duration: 1.1,
          ease: 'expo.out'
        }, 0.35);
      });
    }

    // About Us Reveal
    var aboutSection = document.getElementById('about');
    if (aboutSection) {
      var aboutH2Words = splitWordsForReveal(aboutSection.querySelector('.about-copy h2'));
      var aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: aboutSection,
          start: 'top 84%',
          toggleActions: 'play none none none'
        }
      });

      if (aboutH2Words.length) {
        aboutTl.from(aboutH2Words, {
          yPercent: 110,
          opacity: 0,
          duration: 0.75,
          stagger: 0.05,
          ease: 'expo.out'
        }, 0);
      }

      aboutTl.from(aboutSection.querySelector('.about-copy p'), {
        y: 18,
        opacity: 0,
        duration: 0.75,
        ease: 'expo.out'
      }, 0.1).from(aboutSection.querySelectorAll('.founder-row'), {
        x: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'expo.out'
      }, 0.16);
    }

    // Contact Reveal
    var contactSection = document.getElementById('contact');
    if (contactSection) {
      var contactH2Words = splitWordsForReveal(contactSection.querySelector('.contact-copy h2'));
      var contactTl = gsap.timeline({
        scrollTrigger: {
          trigger: contactSection,
          start: 'top 86%',
          toggleActions: 'play none none none'
        }
      });

      if (contactH2Words.length) {
        contactTl.from(contactH2Words, {
          yPercent: 110,
          opacity: 0,
          duration: 0.75,
          stagger: 0.05,
          ease: 'expo.out'
        }, 0);
      }

      contactTl.from(contactSection.querySelector('.contact-copy p'), {
        y: 18,
        opacity: 0,
        duration: 0.75,
        ease: 'expo.out'
      }, 0.1).from(contactSection.querySelectorAll('.contact-card'), {
        x: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'expo.out'
      }, 0.16);
    }
  }
})();
