"use strict";
(() => {
  // src/client/lobby.ts
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("fetch-players-btn");
    const list = document.getElementById("player-list");
    const tmpl = document.getElementById("player-template");
    btn?.addEventListener("click", () => {
      void (async () => {
        const res = await fetch("/lobby/players");
        const data = await res.json();
        if (!list || !tmpl) return;
        list.replaceChildren();
        for (const player of data.players) {
          const clone = tmpl.content.cloneNode(true);
          const emailSpan = clone.querySelector("[data-field='email']");
          if (emailSpan) emailSpan.textContent = player.email;
          list.appendChild(clone);
        }
      })();
    });
  });
})();
