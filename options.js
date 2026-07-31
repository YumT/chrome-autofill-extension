// URLオートフィル - options (保存データ管理)
(function () {
  const siteList = document.getElementById("siteList");
  const searchBox = document.getElementById("searchBox");
  const btnExport = document.getElementById("btnExport");
  const btnDeleteAll = document.getElementById("btnDeleteAll");
  const toggleEnabled = document.getElementById("toggleEnabled");
  const toast = document.getElementById("toast");

  let state = { enabled: true, sites: {} };

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
  }

  async function load() {
    const data = await chrome.storage.local.get(["enabled", "sites"]);
    state.enabled = data.enabled !== false;
    state.sites = data.sites || {};
    toggleEnabled.checked = state.enabled;
    render();
  }

  async function persist() {
    await chrome.storage.local.set({ sites: state.sites });
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    const q = searchBox.value.trim().toLowerCase();
    const keys = Object.keys(state.sites)
      .filter((k) => !q || k.toLowerCase().includes(q))
      .sort();

    if (keys.length === 0) {
      siteList.innerHTML =
        '<div class="empty">保存済みサイトがありません</div>';
      return;
    }

    siteList.innerHTML = "";
    for (const pageKey of keys) {
      const fields = state.sites[pageKey];
      const fieldKeys = Object.keys(fields);

      const site = document.createElement("div");
      site.className = "site";
      site.innerHTML = `
        <div class="site-header">
          <span class="arrow">▶</span>
          <span class="site-url">${esc(pageKey)}</span>
          <span class="site-count">${fieldKeys.length} フィールド</span>
        </div>
        <div class="site-body">
          <table>
            <thead>
              <tr><th>フィールド</th><th>保存値</th><th></th></tr>
            </thead>
            <tbody></tbody>
          </table>
          <div class="site-actions">
            <button class="sub-btn btn-save-site">変更を保存</button>
            <button class="danger btn-del-site">このサイトを削除</button>
          </div>
        </div>`;

      // 開閉
      const header = site.querySelector(".site-header");
      header.addEventListener("click", () => {
        site.classList.toggle("open");
        site.querySelector(".arrow").textContent = site.classList.contains(
          "open"
        )
          ? "▼"
          : "▶";
      });

      // フィールド行
      const tbody = site.querySelector("tbody");
      for (const fk of fieldKeys) {
        const tr = document.createElement("tr");
        tr.dataset.fieldKey = fk;
        const val = fields[fk];
        const valueCell =
          typeof val === "boolean"
            ? `<input type="checkbox" class="field-value" ${
                val ? "checked" : ""
              } />`
            : `<input type="text" class="field-value" value="${esc(val)}" />`;
        tr.innerHTML = `
          <td class="field-key">${esc(fk)}</td>
          <td>${valueCell}</td>
          <td><button class="row-del" title="このフィールドを削除">×</button></td>`;
        tbody.appendChild(tr);

        const input = tr.querySelector(".field-value");
        input.addEventListener("input", () => input.classList.add("dirty"));
        input.addEventListener("change", () => input.classList.add("dirty"));

        tr.querySelector(".row-del").addEventListener("click", async () => {
          if (!confirm(`フィールド "${fk}" を削除しますか?`)) return;
          delete state.sites[pageKey][fk];
          if (Object.keys(state.sites[pageKey]).length === 0) {
            delete state.sites[pageKey];
          }
          await persist();
          showToast("フィールドを削除しました");
          render();
        });
      }

      // サイト単位の保存
      site
        .querySelector(".btn-save-site")
        .addEventListener("click", async () => {
          site.querySelectorAll("tbody tr").forEach((tr) => {
            const fk = tr.dataset.fieldKey;
            const input = tr.querySelector(".field-value");
            state.sites[pageKey][fk] =
              input.type === "checkbox" ? input.checked : input.value;
            input.classList.remove("dirty");
          });
          await persist();
          showToast("保存しました");
        });

      // サイト削除
      site
        .querySelector(".btn-del-site")
        .addEventListener("click", async () => {
          if (!confirm(`"${pageKey}" の保存データをすべて削除しますか?`))
            return;
          delete state.sites[pageKey];
          await persist();
          showToast("サイトのデータを削除しました");
          render();
        });

      siteList.appendChild(site);
    }
  }

  // グローバルON/OFF
  toggleEnabled.addEventListener("change", async () => {
    await chrome.storage.local.set({ enabled: toggleEnabled.checked });
    showToast(toggleEnabled.checked ? "有効化しました" : "無効化しました");
  });

  // 検索
  searchBox.addEventListener("input", render);

  // エクスポート
  btnExport.addEventListener("click", () => {
    const payload = {
      app: "url-autofill",
      version: 1,
      exportedAt: new Date().toISOString(),
      enabled: state.enabled,
      sites: state.sites
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    a.href = URL.createObjectURL(blob);
    a.download = `url-autofill-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("エクスポートしました");
  });

  // 全削除
  btnDeleteAll.addEventListener("click", async () => {
    if (!confirm("すべてのサイトの保存データを削除します。よろしいですか?"))
      return;
    state.sites = {};
    await persist();
    showToast("すべて削除しました");
    render();
  });

  load();
})();
