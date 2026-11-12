/* =============================================================================
   VIGAM LABS — Functionalist Hardware Manual & Interactive KLANG Audition Deck
   Zero Scroll-Hijacking | Tactile WebAudio Relay Clicks | On-Device Synthesis
   ============================================================================= */

(function () {
  'use strict';

  /* -------------------------------------------------------------------------
     1. WEBAUDIO ENGINE & TACTILE MECHANICAL SWITCH CLICK SYNTHESIZER
     ------------------------------------------------------------------------- */
  var audioCtx = null;
  var activeAudioStop = null;
  var tactileClickEnabled = true;

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

  // Synthesizes a dry, 4ms mechanical switch detent click (Braun TG 1000 / ET 66 feel)
  function playMechanicalClick(pitchFactor) {
    if (!tactileClickEnabled) return;
    var ctx = ensureAudioCtx();
    if (!ctx) return;

    var now = ctx.currentTime;
    var freq = 1150 * (pitchFactor || 1);

    // Short impulse oscillator
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.006);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.0065);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.007);
  }

  /* -------------------------------------------------------------------------
     2. CHASSIS FINISH (LIGHT PAPER / DARK ANODIZED) & TACTILE AUDIO TOGGLE
     ------------------------------------------------------------------------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById('theme-toggle');
  var themeToggleLabel = document.getElementById('theme-toggle-label');
  var soundToggle = document.getElementById('sound-toggle');
  var soundToggleLabel = document.getElementById('sound-toggle-label');

  function syncThemeUI() {
    var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    if (themeToggleLabel) {
      themeToggleLabel.textContent = current === 'dark' ? 'ANODIZED' : 'PAPER';
    }
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', current === 'dark' ? 'true' : 'false');
    }
  }

  syncThemeUI();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      syncThemeUI();
      playMechanicalClick(next === 'dark' ? 0.88 : 1.12);
      try {
        localStorage.setItem('vigam_braun_theme', next);
      } catch (e) {}
    });
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', function () {
      tactileClickEnabled = !tactileClickEnabled;
      soundToggle.setAttribute('aria-pressed', tactileClickEnabled ? 'true' : 'false');
      if (soundToggleLabel) {
        soundToggleLabel.textContent = tactileClickEnabled ? 'ON' : 'OFF';
      }
      if (tactileClickEnabled) {
        playMechanicalClick(1.15);
      }
    });
  }

  // Global tactile click on mechanical buttons and links
  document.addEventListener('pointerdown', function (e) {
    var btn = e.target.closest(
      '.mech-btn, .mech-key-link, .index-tab, .query-chip, .mode-switch-btn, .ka-hw-key, .ka-mode-btn, .ka-pill-btn, .ka-key-btn, .ka-seg-btn, .ka-reset-btn, .ka-similar-btn, .ka-step-btn, .ka-loop-btn'
    );
    if (btn) {
      playMechanicalClick(1.0);
    }
  });

  /* -------------------------------------------------------------------------
     3. CLIPBOARD REGISTER & HARDWARE STATUS TOAST
     ------------------------------------------------------------------------- */
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
    }, 2400);
  }

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-copy');
      if (!val || !navigator.clipboard) return;
      navigator.clipboard.writeText(val).then(function () {
        btn.classList.add('copied');
        var labelEl = document.getElementById('copy-email-label');
        if (labelEl) labelEl.textContent = 'COPIED [OK]';
        showToast('CLIPBOARD REGISTER UPDATED: ' + val.toUpperCase());
        setTimeout(function () {
          btn.classList.remove('copied');
          if (labelEl) labelEl.textContent = 'COPY ADDRESS';
        }, 2200);
      });
    });
  });

  /* -------------------------------------------------------------------------
     4. INSPECTION VIEW MODE SWITCH (SIMULATOR vs NATIVE FIGURES)
     ------------------------------------------------------------------------- */
  var simulatorPanel = document.getElementById('klang-simulator-panel');
  var figuresPanel = document.getElementById('klang-figures-panel');
  var viewSwitchBtns = document.querySelectorAll('[data-stage-view]');

  function setInspectionView(viewMode) {
    viewSwitchBtns.forEach(function (btn) {
      var isMatch = btn.getAttribute('data-stage-view') === viewMode;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });
    if (simulatorPanel && figuresPanel) {
      simulatorPanel.hidden = viewMode !== 'simulator';
      figuresPanel.hidden = viewMode !== 'figures';
    }
  }

  viewSwitchBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-stage-view');
      setInspectionView(mode);
    });
  });

  /* -------------------------------------------------------------------------
     5. KLANG SAMPLE & PRESET DATABASE
     ------------------------------------------------------------------------- */
  var AUDIO_LIBRARY = [
    {
      id: 's1',
      name: 'pad_warm_detuned_analog_Dmin',
      cat: 'SYNTH // ANALOG PAD',
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
      cat: 'SYNTH // DRONE TEXTURE',
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
      cat: 'SYNTH // TAPE PAD',
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
      cat: 'SYNTH // EVOLVING PAD',
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
      cat: 'SYNTH // STRING ENSEMBLE',
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
    {
      id: 's6',
      name: 'snare_woody_crisp_vintage_D',
      cat: 'DRUMS // ACOUSTIC SNARE',
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
      cat: 'DRUMS // TAPE BREAK',
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
      cat: 'DRUMS // TRANSIENT RIM',
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
      cat: 'DRUMS // LAYERED CLAP',
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
    {
      id: 's10',
      name: 'bass_808_distorted_sub_Fmin',
      cat: 'BASS // SATURATED 808',
      key: 'Fm',
      keyRoot: 'F',
      dur: 1.38,
      lengthType: 'oneshot',
      toneType: 'warm',
      attackType: 'punchy',
      waveKind: 'bass',
      seed: 135,
      baseScore: 95,
      tags: 'distorted sub 808 bass deep heavy glide saturated low punchy'
    },
    {
      id: 's11',
      name: 'sub_reese_growl_neuro_Dmin',
      cat: 'BASS // ANALOG REESE',
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
      cat: 'BASS // CLIPPED SUB',
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
    {
      id: 's13',
      name: 'pluck_glassy_fm_arp_Amaj',
      cat: 'SYNTH // FM PLUCK',
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
      cat: 'SYNTH // MODULAR RESONATOR',
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
      cat: 'SYNTH // JUNO SEQUENCE',
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
      cat: 'KEYS // STAGE ELECTRIC',
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
      cat: 'VITAL PATCH // ANALOG PAD',
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
      cat: 'VITAL PATCH // SUB BASS',
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
      cat: 'VITAL PATCH // FM PLUCK',
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
      cat: 'VITAL PATCH // TRANSIENT',
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
      cat: 'VITAL PATCH // ENSEMBLE',
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
     6. DETERMINISTIC 76-BAR ORTHOGONAL OSCILLOGRAM GENERATOR
     ------------------------------------------------------------------------- */
  function buildWaveformSvg(kind, seed) {
    var bars = 76;
    var width = 380;
    var height = 28;
    var mid = height / 2;
    var step = width / bars;
    var barWidth = 2.4;
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

      var amp = Math.max(2, Math.min(height - 2, (0.18 + n * 0.82) * env * (height - 2)));
      var x = (i * step + (step - barWidth) * 0.5).toFixed(1);
      var y = (mid - amp / 2).toFixed(1);
      var h = amp.toFixed(1);
      rects += '<rect class="ka-wave-bar" data-bar-idx="' + i + '" x="' + x + '" y="' + y + '" width="' + barWidth + '" height="' + h + '"></rect>';
    }

    return '<svg class="ka-wave-svg" viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="none" aria-hidden="true">' + rects + '</svg>';
  }

  /* -------------------------------------------------------------------------
     7. ON-DEVICE WEBAUDIO SYNTHESIZER FOR SAMPLE AUDITION
     ------------------------------------------------------------------------- */
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
      var subOsc = ctx.createOscillator();
      var harmOsc = ctx.createOscillator();
      var lp = ctx.createBiquadFilter();
      var subGain = ctx.createGain();

      subOsc.type = 'sine';
      harmOsc.type = 'sawtooth';
      var rootSub = baseFreq * 0.5;
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
     8. KLANG CONSOLE STATE, FILTERING & TRANSPORT ENGINE
     ------------------------------------------------------------------------- */
  var state = {
    libMode: 'audio',
    query: 'warm analog pad',
    keyFilter: 'Any',
    macros: {
      length: 'all',
      tone: 'all',
      attack: 'all',
      match: 20
    },
    playingId: 's1',
    isPlaying: false,
    playProgress: 0.436,
    pitchSt: 0,
    loop: false,
    masterVol: 75
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

    if (!rowsContainer) return;
    rowsContainer.querySelectorAll('.ka-row').forEach(function (rowEl) {
      var rid = rowEl.getAttribute('data-sample-id');
      var isThisActive = rid === state.playingId;
      rowEl.classList.toggle('selected', isThisActive);
      rowEl.classList.toggle('playing', isThisActive && state.isPlaying);

      var playBtn = rowEl.querySelector('.ka-play-btn');
      if (playBtn) {
        playBtn.innerHTML = (isThisActive && state.isPlaying)
          ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12"></rect></svg>'
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

  function renderRows() {
    if (!rowsContainer) return;
    var results = getFilteredSamples();

    if (countText) {
      var unit = state.libMode === 'presets' ? 'PRESETS' : 'SOUNDS';
      var numStr = results.length < 10 ? '0' + results.length : String(results.length);
      countText.textContent = numStr + ' ' + unit;
    }
    if (latencyText) {
      var ms = (8 + ((state.query.length * 3) % 7)).toString();
      latencyText.textContent = ms + ' MS LOCAL';
    }

    var hasActive = results.some(function (r) { return r.item.id === state.playingId; });
    if (!hasActive && results.length > 0 && !state.isPlaying) {
      state.playingId = results[0].item.id;
      state.playProgress = 0.42;
    }

    var html = results.map(function (entry, idx) {
      var s = entry.item;
      var score = entry.score;
      var isRowActive = s.id === state.playingId;
      var rowNum = '0' + (idx + 1);
      return (
        '<div class="ka-row' + (isRowActive && state.isPlaying ? ' playing' : '') + '" role="listitem" data-sample-id="' + s.id + '">' +
          '<span class="ka-grip" aria-hidden="true">' + rowNum + '</span>' +
          '<button type="button" class="ka-play-btn" data-action="play" aria-label="Play ' + s.name + '">' +
            ((isRowActive && state.isPlaying)
              ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12"></rect></svg>'
              : '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>') +
          '</button>' +
          '<div class="ka-sample-meta">' +
            '<span class="ka-sample-name">' + s.name + '</span>' +
            '<span class="ka-sample-cat">' + s.cat + '</span>' +
          '</div>' +
          '<div class="ka-wave-wrap" data-action="scrub" title="Click oscillogram to audition from position">' +
            buildWaveformSvg(s.waveKind, s.seed) +
            '<span class="ka-playhead"></span>' +
          '</div>' +
          '<span class="ka-key-tag">' + s.key + '</span>' +
          '<div class="ka-tech-info">' +
            '<span class="ka-dur">' + s.dur.toFixed(2) + 's</span>' +
            '<span class="ka-rate">44.1kHz &middot; PCM</span>' +
          '</div>' +
          '<span class="ka-score">' + score + '%</span>' +
          '<button type="button" class="ka-similar-btn" data-action="similar">SIMILAR</button>' +
        '</div>'
      );
    }).join('');

    rowsContainer.innerHTML = html;
    updateTransportUI();
  }

  /* -------------------------------------------------------------------------
     9. 60FPS PLAYBACK PROGRESS LOOP
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

  if (rowsContainer) {
    rowsContainer.addEventListener('click', function (e) {
      var row = e.target.closest('.ka-row');
      if (!row) return;
      var sampleId = row.getAttribute('data-sample-id');

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
          renderRows();
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

  if (transportPlayBtn) {
    transportPlayBtn.addEventListener('click', function () {
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
      var rect = transportTrack.getBoundingClientRect();
      var pct = Math.max(0, Math.min(0.98, (e.clientX - rect.left) / rect.width));
      startSamplePlayback(state.playingId, pct);
    });
  }

  if (pitchDownBtn && pitchUpBtn && pitchValEl) {
    pitchDownBtn.addEventListener('click', function () {
      state.pitchSt = Math.max(-12, state.pitchSt - 1);
      pitchValEl.textContent = (state.pitchSt > 0 ? '+' : '') + state.pitchSt + ' st';
      if (state.isPlaying) {
        triggerSampleWebAudio(findSampleById(state.playingId), state.pitchSt, state.masterVol);
      }
    });
    pitchUpBtn.addEventListener('click', function () {
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
     10. BRAUN STEPPED ROTARY ATTENUATORS & MACRO FILTERS
     ------------------------------------------------------------------------- */
  var DIAL_CONFIG = {
    length: {
      all:     { angle: -90, offset: 65, label: 'Any Length' },
      oneshot: { angle: 0,   offset: 38, label: '1-Shot (<1.5s)' },
      loop:    { angle: 90,  offset: 10, label: 'Loop (>2.5s)' }
    },
    tone: {
      warm:    { angle: -90, offset: 65, label: 'Warm & Deep' },
      all:     { angle: 0,   offset: 36, label: 'Any Tone' },
      bright:  { angle: 90,  offset: 10, label: 'Bright & Airy' }
    },
    attack: {
      all:     { angle: -45, offset: 48, label: 'Any Attack' },
      punchy:  { angle: -90, offset: 68, label: 'Fast (<35ms)' },
      soft:    { angle: 90,  offset: 12, label: 'Slow (>120ms)' }
    },
    match: {
      '20':    { angle: -75, offset: 72, label: '\u2265 20% Match' },
      '50':    { angle: 0,   offset: 40, label: '\u2265 50% Match' },
      '75':    { angle: 90,  offset: 12, label: '\u2265 75% Match' }
    }
  };

  function setMacroState(macro, val, shouldRender) {
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

    if (arcEl) arcEl.style.strokeDashoffset = String(cfg.offset);
    if (rotorEl) rotorEl.setAttribute('transform', 'rotate(' + cfg.angle + ' 32 32)');

    if (shouldRender !== false) {
      renderRows();
    }
  }

  document.querySelectorAll('[data-macro-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var macro = btn.getAttribute('data-macro-btn');
      var val = btn.getAttribute('data-val');
      setMacroState(macro, val, true);
    });
  });

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
      playMechanicalClick(0.92);
      var curr = String(state.macros[macro]);
      var idx = (order.indexOf(curr) + 1) % order.length;
      setMacroState(macro, order[idx], true);
    });
  });

  document.querySelectorAll('[data-key]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.keyFilter = btn.getAttribute('data-key');
      document.querySelectorAll('[data-key]').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      renderRows();
    });
  });

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', function () {
      state.keyFilter = 'Any';
      document.querySelectorAll('[data-key]').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-key') === 'Any');
      });
      setMacroState('length', 'all', false);
      setMacroState('tone', 'all', false);
      setMacroState('attack', 'all', false);
      setMacroState('match', '20', false);
      renderRows();
    });
  }

  if (filtersToggle && macroDrawer) {
    filtersToggle.addEventListener('click', function () {
      var isOpen = filtersToggle.classList.toggle('active');
      filtersToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      macroDrawer.hidden = !isOpen;
    });
  }

  document.querySelectorAll('[data-lib-mode]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.libMode = btn.getAttribute('data-lib-mode');
      document.querySelectorAll('[data-lib-mode]').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      renderRows();
    });
  });

  /* -------------------------------------------------------------------------
     11. QUERY INPUT, TEST SIGNAL PRESET BUTTONS & KEYBOARD SHORTCUT
     ------------------------------------------------------------------------- */
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.query = searchInput.value;
      document.querySelectorAll('[data-preset-query]').forEach(function (chip) {
        chip.classList.toggle('active', chip.getAttribute('data-preset-query') === state.query.trim());
      });
      renderRows();
    });
  }

  // Press '/' anywhere outside an input to focus the KLANG query box
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      if (searchInput) {
        setInspectionView('simulator');
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', function () {
      searchInput.value = '';
      state.query = '';
      document.querySelectorAll('[data-preset-query]').forEach(function (c) {
        c.classList.remove('active');
      });
      renderRows();
      searchInput.focus();
    });
  }

  document.querySelectorAll('[data-preset-query]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var q = chip.getAttribute('data-preset-query');
      setInspectionView('simulator');
      document.querySelectorAll('[data-preset-query]').forEach(function (c) {
        c.classList.toggle('active', c === chip);
      });
      if (searchInput) searchInput.value = q;
      state.query = q;
      renderRows();
      // Audition top matching result immediately
      var topResults = getFilteredSamples();
      if (topResults.length > 0) {
        startSamplePlayback(topResults[0].item.id, 0);
      }
    });
  });

  if (micBtn && searchInput && searchBox) {
    micBtn.addEventListener('click', function () {
      if (micBtn.classList.contains('recording')) return;
      micBtn.classList.add('recording');
      searchBox.classList.add('voice-active');
      searchInput.value = 'LISTENING // HUM OR BEATBOX TRANSIENT...';

      setTimeout(function () {
        micBtn.classList.remove('recording');
        searchBox.classList.remove('voice-active');
        var voiceQuery = 'punchy dusty snare';
        searchInput.value = voiceQuery;
        state.query = voiceQuery;
        document.querySelectorAll('[data-preset-query]').forEach(function (c) {
          c.classList.toggle('active', c.getAttribute('data-preset-query') === voiceQuery);
        });
        renderRows();
        var topResults = getFilteredSamples();
        if (topResults.length > 0) {
          startSamplePlayback(topResults[0].item.id, 0);
        }
      }, 1050);
    });
  }

  // Initial render
  renderRows();
})();
