/* =============================================================================
   VIGAM LABS — Minimalist Utility Script
   Direct Clipboard Copy & Quiet Interaction
   ============================================================================= */

(function () {
  'use strict';

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
