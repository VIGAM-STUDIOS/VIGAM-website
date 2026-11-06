document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const body = document.body;
  const themeBtn = document.getElementById('theme-toggle');

  // ---------------------------------------------------------------- WebAudio Engine
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playMechanicalClick(down = true) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(down ? 190 : 260, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.035);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  function playSynthPreview(type) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'pad') {
      // Warm detuned analog chord
      const freqs = [220, 277.18, 329.63, 415.3];
      const master = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.35);
      filter.frequency.exponentialRampToValueAtTime(480, now + 1.1);

      master.gain.setValueAtTime(0.001, now);
      master.gain.linearRampToValueAtTime(0.14, now + 0.12);
      master.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        osc.detune.setValueAtTime((i - 1.5) * 9, now);
        osc.connect(filter);
        osc.start(now);
        osc.stop(now + 1.2);
      });

      filter.connect(master);
      master.connect(ctx.destination);
    } else if (type === 'snare') {
      // Dusty lo-fi snare (body + filtered noise burst)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(185, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.11);
      oscGain.gain.setValueAtTime(0.28, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      const bufferSize = ctx.sampleRate * 0.28;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.065));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1650, now);
      filter.Q.setValueAtTime(1.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.24, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } else if (type === 'sub') {
      // Aggressive 808 sub
      const osc = ctx.createOscillator();
      const subGain = ctx.createGain();
      const shaper = ctx.createWaveShaper();

      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = Math.tanh(x * 2.6);
      }
      shaper.curve = curve;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(46, now + 0.07);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.65);

      subGain.gain.setValueAtTime(0.32, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(shaper);
      shaper.connect(subGain);
      subGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.72);
    } else if (type === 'pluck') {
      // Glassy synth pluck arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.065;
        const osc = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        mod.type = 'triangle';
        mod.frequency.setValueAtTime(freq * 2, start);

        modGain.gain.setValueAtTime(freq * 1.4, start);
        modGain.gain.exponentialRampToValueAtTime(1, start + 0.18);

        gain.gain.setValueAtTime(0.16, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.38);

        mod.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        mod.start(start);
        osc.stop(start + 0.4);
        mod.stop(start + 0.4);
      });
    }
  }

  // ---------------------------------------------------------------- Theme Toggle
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('vigam_theme', next);
      drawWaveform(currentWaveSeed, 0);
    });
  }

  // ---------------------------------------------------------------- Air-Gap Breaker Gimmick
  const breakerSwitch = document.getElementById('breaker-switch');
  const airgapNavBtn = document.getElementById('airgap-nav-btn');
  const airgapNavLabel = document.getElementById('airgap-nav-label');
  const breakerHint = document.getElementById('breaker-hint');
  const switchTitle = document.getElementById('switch-title');
  const switchSub = document.getElementById('switch-sub');
  const cloudStatus = document.getElementById('cloud-status');
  const cloudMetrics = document.getElementById('cloud-metrics');
  const vigamStatus = document.getElementById('vigam-status');

  function setAirGap(active, playSound = true) {
    body.setAttribute('data-airgap', active ? 'true' : 'false');
    if (breakerSwitch) breakerSwitch.setAttribute('aria-checked', active ? 'true' : 'false');
    if (playSound) playMechanicalClick(active);

    if (active) {
      if (airgapNavLabel) airgapNavLabel.textContent = 'AIR-GAP: ON';
      if (breakerHint) breakerHint.textContent = 'UPLINK SEVERED';
      if (switchTitle) switchTitle.textContent = 'Air-Gap Engaged';
      if (switchSub) switchSub.textContent = 'Zero network. Cloud AI bricks; VIGAM runs untouched.';
      if (cloudStatus) cloudStatus.textContent = 'ERR_OFFLINE';
      if (cloudMetrics) {
        cloudMetrics.innerHTML = '<span>Connection refused</span><span>&middot;</span><span>$20/mo wasted</span><span>&middot;</span><span>Halted</span>';
      }
      if (vigamStatus) vigamStatus.textContent = 'AIR-GAPPED OK';
    } else {
      if (airgapNavLabel) airgapNavLabel.textContent = 'AIR-GAP: OFF';
      if (breakerHint) breakerHint.textContent = 'FLIP TO SEVER CLOUD';
      if (switchTitle) switchTitle.textContent = 'Pull the Plug';
      if (switchSub) switchSub.textContent = 'Test how our software behaves with zero internet.';
      if (cloudStatus) cloudStatus.textContent = 'UPLINK ACTIVE';
      if (cloudMetrics) {
        cloudMetrics.innerHTML = '<span>$20–$40/mo rent</span><span>&middot;</span><span>Files uploaded</span><span>&middot;</span><span>~650ms lag</span>';
      }
      if (vigamStatus) vigamStatus.textContent = '100% ON-DEVICE';
    }
  }

  function toggleAirGap() {
    const isAirgap = body.getAttribute('data-airgap') === 'true';
    setAirGap(!isAirgap, true);
  }

  if (breakerSwitch) breakerSwitch.addEventListener('click', toggleAirGap);
  if (airgapNavBtn) airgapNavBtn.addEventListener('click', toggleAirGap);

  window.addEventListener('offline', () => setAirGap(true, true));
  window.addEventListener('online', () => setAirGap(false, false));

  // ---------------------------------------------------------------- Real Local CPU Benchmark
  const runBenchBtn = document.getElementById('run-bench-btn');
  const benchBtnText = document.getElementById('bench-btn-text');
  const benchReadout = document.getElementById('bench-readout');

  if (runBenchBtn) {
    runBenchBtn.addEventListener('click', () => {
      playMechanicalClick(true);
      const dim = 64;
      const count = 10000;
      const query = new Float32Array(dim);
      const matrix = new Float32Array(count * dim);
      for (let i = 0; i < dim; i++) query[i] = Math.random();
      for (let i = 0; i < count * dim; i += 17) matrix[i] = 0.5;

      const t0 = performance.now();
      let bestScore = -1;
      for (let v = 0; v < count; v++) {
        let dot = 0;
        const offset = v * dim;
        for (let k = 0; k < dim; k += 4) {
          dot += query[k] * matrix[offset + k]
               + query[k + 1] * matrix[offset + k + 1]
               + query[k + 2] * matrix[offset + k + 2]
               + query[k + 3] * matrix[offset + k + 3];
        }
        if (dot > bestScore) bestScore = dot;
      }
      const elapsed = Math.max(0.4, performance.now() - t0).toFixed(1);

      if (benchBtnText) {
        benchBtnText.textContent = `10,000 Vectors Ranked in ${elapsed} ms · 0 B Sent`;
      }
      if (benchReadout) {
        benchReadout.textContent = `${elapsed}ms on your CPU`;
      }
    });
  }

  // ---------------------------------------------------------------- Live Audio Taste-Test & Waveform
  const waveCanvas = document.getElementById('wave-canvas');
  const testerStat = document.getElementById('tester-stat');
  const soundPills = document.querySelectorAll('.sound-pill');
  let currentWaveSeed = 1;
  let animFrameId = null;

  const soundMeta = {
    pad: { seed: 1, stat: '5 matches · 9.4 ms' },
    snare: { seed: 2, stat: '8 matches · 7.8 ms' },
    sub: { seed: 3, stat: '6 matches · 8.2 ms' },
    pluck: { seed: 4, stat: '4 matches · 6.9 ms' }
  };

  function drawWaveform(seed = 1, pulse = 0) {
    if (!waveCanvas) return;
    const ctx = waveCanvas.getContext('2d');
    const w = waveCanvas.width;
    const h = waveCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const isLight = root.getAttribute('data-theme') === 'light';
    const activeColor = isLight ? '#e03e10' : '#ff4f1f';
    const baseColor = isLight ? 'rgba(15, 17, 21, 0.35)' : 'rgba(255, 255, 255, 0.38)';

    const bars = 34;
    const step = w / bars;
    const barW = Math.max(2, step - 2);

    for (let i = 0; i < bars; i++) {
      const env = Math.sin((i / bars) * Math.PI);
      const raw = Math.abs(Math.sin(i * 1.7 + seed * 2.3) * Math.cos(i * 0.8 - seed));
      const dynamic = pulse > 0 ? Math.abs(Math.sin(i * 0.9 + pulse * 10)) * 0.45 * pulse : 0;
      const amp = Math.min(1, Math.max(0.14, (raw * 0.75 + 0.15) * env + dynamic));
      const barH = Math.max(3, amp * (h - 4));
      const x = i * step + 1;
      const y = (h - barH) / 2;

      ctx.fillStyle = pulse > 0 && i / bars <= 1 - pulse * 0.3 ? activeColor : baseColor;
      ctx.fillRect(x, y, barW, barH);
    }
  }

  function animateWave(seed) {
    cancelAnimationFrame(animFrameId);
    const start = performance.now();
    const duration = 680;

    function tick(now) {
      const progress = (now - start) / duration;
      if (progress < 1) {
        drawWaveform(seed, 1 - progress);
        animFrameId = requestAnimationFrame(tick);
      } else {
        drawWaveform(seed, 0);
      }
    }
    animFrameId = requestAnimationFrame(tick);
  }

  drawWaveform(currentWaveSeed, 0);

  soundPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const key = pill.dataset.sound;
      const meta = soundMeta[key];
      if (!meta) return;

      soundPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      currentWaveSeed = meta.seed;
      if (testerStat) testerStat.textContent = meta.stat;
      playSynthPreview(key);
      animateWave(meta.seed);
    });
  });

  // ---------------------------------------------------------------- KLANG Screenshot Tabs
  const tabs = document.querySelectorAll('.stage-tab');
  const stageImg = document.getElementById('stage-img');

  const views = {
    hero: {
      src: 'assets/klang-hero.png',
      alt: 'KLANG desktop app searching audio samples by sound description'
    },
    sliders: {
      src: 'assets/klang-sliders.png',
      alt: 'KLANG acoustic filters for length, tone, and attack'
    },
    vital: {
      src: 'assets/klang-vital.png',
      alt: 'KLANG synth preset search for Vital, Surge XT, and u-he'
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.view;
      if (!views[key] || !stageImg) return;

      playMechanicalClick(false);
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      stageImg.style.opacity = '0.35';
      setTimeout(() => {
        stageImg.src = views[key].src;
        stageImg.alt = views[key].alt;
        stageImg.style.opacity = '1';
      }, 120);
    });
  });

  // ---------------------------------------------------------------- Copy Email Toast
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  let toastTimer;

  function notify(msg) {
    if (!toast) return;
    if (toastText) toastText.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
  }

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const val = btn.getAttribute('data-copy');
      if (!val) return;
      playMechanicalClick(true);
      try {
        await navigator.clipboard.writeText(val);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = val;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      notify('Email copied');
    });
  });
});
