/**
 * VIGAM LABS — MAIN LOGIC & INTERACTIONS
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Theme Toggle Logic ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  // Determine initial theme: stored preference > system preference > default dark
  const savedTheme = localStorage.getItem('vigam_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    htmlRoot.setAttribute('data-theme', savedTheme);
  } else if (!prefersDark) {
    htmlRoot.setAttribute('data-theme', 'light');
  } else {
    htmlRoot.setAttribute('data-theme', 'dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('vigam_theme', newTheme);
    });
  }

  // --- 2. Klang Project Media Tabs Switcher ---
  const mediaTabs = document.querySelectorAll('.media-tab-btn');
  const projectImg = document.getElementById('project-display-img');
  const projectCaption = document.getElementById('project-media-caption');

  const mediaData = {
    hero: {
      src: 'assets/klang-hero.png',
      alt: 'KLANG Desktop Studio interface showcasing natural language sound search',
      caption: 'KLANG Desktop App · Sub-15ms semantic matching across local sample library'
    },
    sliders: {
      src: 'assets/klang-sliders.png',
      alt: 'KLANG Acoustic DSP filters measuring length, tone, and attack directly from raw audio',
      caption: 'Acoustic DSP Engine · Every parameter measured from the raw audio signal'
    },
    vital: {
      src: 'assets/klang-vital.png',
      alt: 'KLANG Synth preset indexing for Vital, Surge XT, and u-he patches',
      caption: 'Neural Preset Indexer · Search patches by sonic character with live envelope inspection'
    }
  };

  mediaTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetKey = tab.dataset.media;
      if (!mediaData[targetKey] || !projectImg) return;

      // Update active tab styling
      mediaTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Subtle fade animation
      projectImg.style.opacity = '0.3';
      setTimeout(() => {
        projectImg.src = mediaData[targetKey].src;
        projectImg.alt = mediaData[targetKey].alt;
        if (projectCaption) {
          projectCaption.textContent = mediaData[targetKey].caption;
        }
        projectImg.style.opacity = '1';
      }, 150);
    });
  });

  // --- 3. Copy to Clipboard Utility ---
  const copyButtons = document.querySelectorAll('[data-copy]');
  const toast = document.getElementById('toast-notice');
  const toastText = document.getElementById('toast-message');

  function showToast(message) {
    if (!toast) return;
    if (toastText) toastText.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 2800);
  }

  copyButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(`Copied to clipboard: ${textToCopy}`);
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`Copied: ${textToCopy}`);
      }
    });
  });

  // --- 4. Mobile Menu Toggle ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '4.5rem';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'var(--surface)';
      navLinks.style.padding = '1.5rem';
      navLinks.style.borderBottom = '1px solid var(--border)';
    });

    // Close when clicking nav links on mobile
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navLinks.style.display = 'none';
        }
      });
    });
  }
});
