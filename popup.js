// URLオートフィル - popup
(async function () {
  const toggle = document.getElementById("toggleEnabled");
  const urlEl = document.getElementById("pageUrl");
  const countEl = document.getElementById("fieldCount");
  const btnClear = document.getElementById("btnClear");

  const data = await chrome.storage.local.get(["enabled", "sites"]);
  toggle.checked = data.enabled !== false;

  let pageKey = null;
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
    if (tab && tab.url && /^https?:/.test(tab.url)) {
      const u = new URL(tab.url);
      pageKey = u.origin + u.pathname;
      urlEl.textContent = pageKey;
    } else {
      urlEl.textContent = "（このページでは動作しません）";
    }
  } catch (e) {
    urlEl.textContent = "（URLを取得できませんでした）";
  }

  function refreshCount() {
    const site = pageKey && data.sites ? data.sites[pageKey] : null;
    const n = site ? Object.keys(site).length : 0;
    countEl.textContent = String(n);
    btnClear.disabled = n === 0;
  }
  refreshCount();

  toggle.addEventListener("change", async () => {
    await chrome.storage.local.set({ enabled: toggle.checked });
  });

  btnClear.addEventListener("click", async () => {
    if (!pageKey) return;
    const d = await chrome.storage.local.get("sites");
    const sites = d.sites || {};
    delete sites[pageKey];
    await chrome.storage.local.set({ sites });
    countEl.textContent = "0";
    btnClear.disabled = true;
  });

  document.getElementById("btnManage").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
})();
