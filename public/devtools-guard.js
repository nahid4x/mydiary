
'use strict';

/* ═══════════════════════════════════════════════════════════
   DEVTOOLS DETERRENT — window-size delta + debugger timing trap
   NOTE: This is a deterrent against casual inspection, not real
   protection. It can be bypassed by disabling JS, using curl/
   fetch outside the browser, or dedicated bypass extensions.
   Real protection = server-side logic + obfuscation + private repo.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const LOCKOUT_DELAY_MS = 5000; // 5 seconds after first detection
  const CHECK_INTERVAL = 500;
  const SIZE_THRESHOLD = 160;

  let triggered = false;
  let lockoutTimer = null;

  function guardTriggered() {
    if (triggered) return;
    triggered = true;

    document.documentElement.innerHTML = '';
    document.write(
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#000;color:#7dfaff;font-family:\'Share Tech Mono\',monospace;text-align:center;padding:20px;gap:14px">' +
        '<img src="devtool.png" alt="" style="width:980px;max-width:80vw;height:auto;object-fit:contain">' +
        '<div style="font-family:\'Orbitron\',monospace;font-size:1.1rem;font-weight:900;letter-spacing:4px;color:#fff;text-shadow:0 0 20px rgba(0,229,200,.5)">CAUGHT RED-HANDED</div>' +
        '<div style="font-size:.85rem;letter-spacing:1px;max-width:480px;line-height:1.8;opacity:.85">' +
          'Bro really opened DevTools on a cybersecurity expert\'s website 💀<br>' +
          'That\'s like trying to pickpocket a ninja.<br><br>' +
          'This page self-destructed out of respect for your effort.<br>' +
          'Nice try though. 🖕 for effort.' +
        '</div>' +
        '<div id="lockout-msg" style="font-size:.7rem;letter-spacing:1px;opacity:.6;margin-top:10px">Close DevTools within 5 seconds or you will be locked out.</div>' +
      '</div>'
    );
    document.close();

    // Start the 5s lockout clock from the moment they got caught
    lockoutTimer = setTimeout(function () {
      if (isDevtoolsOpen()) {
        window.location.href = 'about:blank';
        // Best-effort tab close — only works if this tab was opened by script (window.open).
        // Browsers block self-close on normal tabs for security reasons; see note below.
        setTimeout(function () { window.close(); }, 100);
      }
    }, LOCKOUT_DELAY_MS);
  }

  function isDevtoolsOpen() {
    const widthDelta = window.outerWidth - window.innerWidth;
    const heightDelta = window.outerHeight - window.innerHeight;
    if (widthDelta > SIZE_THRESHOLD || heightDelta > SIZE_THRESHOLD) return true;

    const start = performance.now();
    // eslint-disable-next-line no-console
    console.log('%c', 'font-size:0');
    const elapsed = performance.now() - start;
    if (elapsed > 20) return true;

    return false;
  }

  function runChecks() {
    if (triggered) return;
    if (isDevtoolsOpen()) guardTriggered();
  }

  setInterval(runChecks, CHECK_INTERVAL);
  window.addEventListener('resize', runChecks);
})();

/* ── Scoped right-click / F12 block (keeps links usable) ── */
(function () {
  'use strict';
  document.addEventListener('contextmenu', function (e) {
    const isInteractive = e.target.closest('a, button, input, textarea, [contenteditable]');
    if (!isInteractive) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
    }
  });
})();
