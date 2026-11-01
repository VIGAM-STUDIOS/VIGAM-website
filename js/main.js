document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('vigam_theme', next);
    });
  }

  // KLANG view switcher
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

  // Copy email helper
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
