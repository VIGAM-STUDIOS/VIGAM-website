/* =============================================================================
   VIGAM LABS — Minimalist Audio Audition & Utility Script
   Pure WebAudio Sample Synthesis | Zero Scroll-Hijacking | Zero Bloat
   ============================================================================= */

(function () {
  'use strict';

  /* -------------------------------------------------------------------------
     1. WEBAUDIO SAMPLE SYNTHESIS ENGINE FOR KLANG AUDITION
     ------------------------------------------------------------------------- */
  var audioCtx = null;
  var activeStop = null;
  var currentPlayingId = null;

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
    if (typeof activeStop === 'function') {
      try { activeStop(); } catch (e) {}
      activeStop = null;
    }
    currentPlayingId = null;
    document.querySelectorAll('.sample-row').forEach(function (row) {
      row.classList.remove('playing');
    });
  }

  var SAMPLES = {
    s1: { kind: 'pad', baseFreq: 146.83, dur: 3.99 },    // D min analog pad
    s6: { kind: 'snare', baseFreq: 146.83, dur: 0.42 },  // Dusty snare
    s10: { kind: 'bass', baseFreq: 87.31, dur: 1.38 },   // F min 808 sub
    s13: { kind: 'pluck', baseFreq: 220.00, dur: 0.88 }  // A maj glassy pluck
  };

  function playSample(sampleId) {
    var sample = SAMPLES[sampleId];
    if (!sample) return;

    if (currentPlayingId === sampleId) {
      stopActiveAudio();
      return;
    }

    stopActiveAudio();
    var ctx = ensureAudioCtx();
    if (!ctx) return;

    currentPlayingId = sampleId;
    var now = ctx.currentTime;
    var master = ctx.createGain();
    master.gain.setValueAtTime(0.22, now);
    master.connect(ctx.destination);

    var nodesToStop = [];
    var rowEl = document.querySelector('.sample-row[data-sample-id="' + sampleId + '"]');

    document.querySelectorAll('.sample-row').forEach(function (r) {
      r.classList.remove('active', 'playing');
    });
    if (rowEl) {
      rowEl.classList.add('active', 'playing');
    }

    if (sample.kind === 'pad') {
      // Warm detuned analog chord (D min)
      var chordRatios = [1, 1.1892, 1.4983, 2];
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 1.2);
      filter.frequency.exponentialRampToValueAtTime(800, now + 3.8);

      var env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(0.4, now + 0.4);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 3.9);

      filter.connect(env);
      env.connect(master);

      chordRatios.forEach(function (r, idx) {
        var osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(sample.baseFreq * r, now);
        osc.detune.setValueAtTime((idx - 1.5) * 8, now);
        osc.connect(filter);
        osc.start(now);
        osc.stop(now + 3.95);
        nodesToStop.push(osc);
      });
    } else if (sample.kind === 'snare') {
      // Woody acoustic transient + filtered noise
      var bodyOsc = ctx.createOscillator();
      var bodyGain = ctx.createGain();
      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(220, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(95, now + 0.1);
      bodyGain.gain.setValueAtTime(0.8, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      bodyOsc.connect(bodyGain);
      bodyGain.connect(master);
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.22);
      nodesToStop.push(bodyOsc);

      var bufSize = Math.floor(ctx.sampleRate * 0.35);
      var noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      var data = noiseBuf.getChannelData(0);
      for (var i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
      }
      var noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1750, now);
      bp.Q.value = 1.0;
      var nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.6, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      noise.connect(bp);
      bp.connect(nGain);
      nGain.connect(master);
      noise.start(now);
      nodesToStop.push(noise);
    } else if (sample.kind === 'bass') {
      // Deep 808 sub glide
      var subOsc = ctx.createOscillator();
      var subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(180, now);
      subOsc.frequency.exponentialRampToValueAtTime(87.31, now + 0.08);
      subOsc.frequency.exponentialRampToValueAtTime(77.78, now + 1.25);
      subGain.gain.setValueAtTime(0.9, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
      subOsc.connect(subGain);
      subGain.connect(master);
      subOsc.start(now);
      subOsc.stop(now + 1.38);
      nodesToStop.push(subOsc);
    } else if (sample.kind === 'pluck') {
      // Glassy crystal sequence
      var arpNotes = [1, 1.25, 1.5, 2];
      arpNotes.forEach(function (mult, idx) {
        var t0 = now + idx * 0.13;
        var carrier = ctx.createOscillator();
        var pGain = ctx.createGain();
        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(sample.baseFreq * mult, t0);
        pGain.gain.setValueAtTime(0.001, t0);
        pGain.gain.linearRampToValueAtTime(0.45, t0 + 0.01);
        pGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.45);
        carrier.connect(pGain);
        pGain.connect(master);
        carrier.start(t0);
        carrier.stop(t0 + 0.48);
        nodesToStop.push(carrier);
      });
    }

    var timer = setTimeout(function () {
      if (currentPlayingId === sampleId) {
        if (rowEl) rowEl.classList.remove('playing');
        currentPlayingId = null;
      }
    }, sample.dur * 1000);

    activeStop = function () {
      clearTimeout(timer);
      nodesToStop.forEach(function (n) {
        try { n.stop(); } catch (e) {}
      });
      try { master.disconnect(); } catch (e) {}
    };
  }

  document.querySelectorAll('.sample-row').forEach(function (row) {
    row.addEventListener('click', function () {
      var id = row.getAttribute('data-sample-id');
      playSample(id);
    });
  });

  /* -------------------------------------------------------------------------
     2. EMAIL COPY ACTION
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
