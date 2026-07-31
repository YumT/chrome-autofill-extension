// URLオートフィル - content script
// ページ(origin + pathname)ごとにフォーム値を自動保存・自動再入力する

(function () {
  const pageKey = location.origin + location.pathname;

  const SKIP_TYPES = new Set([
    "hidden", "submit", "button", "image", "reset", "file"
  ]);

  function isTarget(el) {
    if (!el || el.disabled || el.readOnly) return false;
    const tag = el.tagName;
    if (tag === "TEXTAREA" || tag === "SELECT") return true;
    if (tag === "INPUT" && !SKIP_TYPES.has((el.type || "text").toLowerCase())) return true;
    return false;
  }

  // フィールドの安定キー: name > id > (label無しは対象外)
  function fieldKey(el) {
    if (el.name) return "name:" + el.name;
    if (el.id) return "id:" + el.id;
    return null;
  }

  async function getState() {
    const data = await chrome.storage.local.get(["enabled", "sites"]);
    return {
      enabled: data.enabled !== false, // デフォルトON
      site: (data.sites && data.sites[pageKey]) || {}
    };
  }

  async function saveField(el) {
    const key = fieldKey(el);
    if (!key || !isTarget(el)) return;
    const data = await chrome.storage.local.get(["enabled", "sites"]);
    if (data.enabled === false) return;
    const sites = data.sites || {};
    const site = sites[pageKey] || {};
    const value =
      el.type === "checkbox" || el.type === "radio" ? !!el.checked : el.value;
    // 空値で既存データを消さない（未入力のまま離れただけの場合を保護）
    if (value === "" && !(key in site)) return;
    site[key] = value;
    sites[pageKey] = site;
    await chrome.storage.local.set({ sites });
  }

  function setNativeValue(el, value) {
    // React等のフレームワークに変更を認識させるためのネイティブsetter
    const proto =
      el.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : el.tagName === "SELECT"
        ? window.HTMLSelectElement.prototype
        : window.HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc && desc.set) desc.set.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function fillAll() {
    const { enabled, site } = await getState();
    if (!enabled) return;
    const keys = Object.keys(site);
    if (keys.length === 0) return;
    let filled = 0;
    document
      .querySelectorAll("input, textarea, select")
      .forEach((el) => {
        if (!isTarget(el)) return;
        const key = fieldKey(el);
        if (!key || !(key in site)) return;
        const value = site[key];
        if (el.type === "checkbox" || el.type === "radio") {
          if (el.checked !== value) {
            el.checked = value;
            el.dispatchEvent(new Event("change", { bubbles: true }));
            filled++;
          }
        } else if (el.value !== String(value)) {
          setNativeValue(el, String(value));
          filled++;
        }
      });
    if (filled > 0) {
      console.log(`[URLオートフィル] ${filled} 件のフィールドを再入力しました`);
    }
  }

  // 入力変更の監視（change + blur で確実に拾う）
  document.addEventListener(
    "change",
    (e) => {
      if (isTarget(e.target)) saveField(e.target);
    },
    true
  );
  document.addEventListener(
    "blur",
    (e) => {
      if (isTarget(e.target)) saveField(e.target);
    },
    true
  );

  // 自動再入力: 初回 + SPAの遅延描画に備えて複数回リトライ
  fillAll();
  setTimeout(fillAll, 1000);
  setTimeout(fillAll, 3000);
})();
