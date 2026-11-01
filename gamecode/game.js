/* Kingdoms of the Unknown — isolated game shell. Loaded on demand by the Character tab. */
(function () {
  "use strict";
  const ROOT_ID = "kingdomsOfTheUnknownOverlay";
  let orientationQuery = null;
  if (!document.querySelector('link[data-kotu-styles="true"]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "./kingdoms-of-the-unknown/gamecode/game.css";
    stylesheet.dataset.kotuStyles = "true";
    document.head.appendChild(stylesheet);
  }

  function isSmallPortrait() {
    return window.matchMedia("(max-width: 900px) and (orientation: portrait)").matches;
  }

  function buildOverlay() {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;
    root = document.createElement("div");
    root.id = ROOT_ID;
    root.className = "kotu-overlay";
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Kingdoms of the Unknown");
    root.innerHTML = `
      <div class="kotu-stage">
        <iframe class="kotu-standalone-frame" title="Kingdoms of the Unknown" src="./kingdoms-of-the-unknown/index.html"></iframe>
        <button type="button" class="kotu-menu-button" aria-expanded="false" aria-controls="kotuMenuPanel">☰ Menu</button>
        <div class="kotu-menu-panel" id="kotuMenuPanel" hidden>
          <button type="button" data-kotu-action="main-menu">← Return to Main Menu</button>
        </div>
        <div class="kotu-rotate-gate" hidden role="status" aria-live="polite">
          <div class="kotu-rotate-icon" aria-hidden="true">📱</div>
          <h2>Turn your phone sideways</h2>
          <p>Kingdoms of the Unknown is designed for landscape mode. Rotate your phone to continue your adventure.</p>
        </div>
      </div>`;
    document.body.appendChild(root);

    const menuButton = root.querySelector(".kotu-menu-button");
    const menuPanel = root.querySelector(".kotu-menu-panel");
    menuButton.addEventListener("click", () => {
      const open = menuPanel.hidden;
      menuPanel.hidden = !open;
      menuButton.setAttribute("aria-expanded", String(open));
    });
    root.querySelector('[data-kotu-action="main-menu"]').addEventListener("click", close);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !root.hidden) close();
    });
    window.addEventListener("message", event => { if(event.origin === window.location.origin && event.source === root.querySelector("iframe")?.contentWindow && event.data?.type === "kotu-return") close(); });
    orientationQuery = window.matchMedia("(max-width: 900px) and (orientation: portrait)");
    const updateOrientation = () => {
      const gate = root.querySelector(".kotu-rotate-gate");
      const stage = root.querySelector(".kotu-stage");
      const portrait = isSmallPortrait();
      gate.hidden = !portrait;
      if (portrait) {
        menuPanel.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
      }
    };
    if (orientationQuery.addEventListener) orientationQuery.addEventListener("change", updateOrientation);
    else orientationQuery.addListener(updateOrientation);
    root._kotuUpdateOrientation = updateOrientation;
    return root;
  }

  function open() {
    const root = buildOverlay();
    root.hidden = false;
    document.body.classList.add("kotu-game-open");
    root._kotuUpdateOrientation?.();
    const closeButton = root.querySelector(".kotu-menu-button");
    if (!isSmallPortrait()) closeButton.focus({ preventScroll: true });
  }

  function close() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    root.hidden = true;
    document.body.classList.remove("kotu-game-open");
    const panel = root.querySelector(".kotu-menu-panel");
    if (panel) panel.hidden = true;
    const menuButton = root.querySelector(".kotu-menu-button");
    if (menuButton) menuButton.setAttribute("aria-expanded", "false");
    document.getElementById("kingdomsPlayButton")?.focus({ preventScroll: true });
  }

  window.KingdomsOfTheUnknown = { open, close, isOpen: () => !document.getElementById(ROOT_ID)?.hidden };
})();
