// URLオートフィル - サンプルデータ生成 (Lv.2)
// autocomplete属性 / type属性 / name・id・placeholder・ラベルのキーワード照合で
// フィールドの意味を推定し、日本語のダミーデータを生成する。
// content.js より先に読み込まれ、window.UrlAutofillSamples を公開する。

(function () {
  "use strict";

  // ---------- ランダムユーティリティ ----------
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const pad = (n, len) => String(n).padStart(len, "0");
  const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // ---------- 名前后データ ----------
  const NAMES = [
    { sei: "山田", seiKana: "ヤマダ", seiHira: "やまだ", mei: "太郎", meiKana: "タロウ", meiHira: "たろう", romaji: "taro.yamada" },
    { sei: "佐藤", seiKana: "サトウ", seiHira: "さとう", mei: "花子", meiKana: "ハナコ", meiHira: "はなこ", romaji: "hanako.sato" },
    { sei: "鈴木", seiKana: "スズキ", seiHira: "すずき", mei: "一郎", meiKana: "イチロウ", meiHira: "いちろう", romaji: "ichiro.suzuki" },
    { sei: "田中", seiKana: "タナカ", seiHira: "たなか", mei: "美咲", meiKana: "ミサキ", meiHira: "みさき", romaji: "misaki.tanaka" },
    { sei: "高橋", seiKana: "タカハシ", seiHira: "たかはし", mei: "健", meiKana: "ケン", meiHira: "けん", romaji: "ken.takahashi" },
    { sei: "伊藤", seiKana: "イトウ", seiHira: "いとう", mei: "裕子", meiKana: "ユウコ", meiHira: "ゆうこ", romaji: "yuko.ito" },
    { sei: "中村", seiKana: "ナカムラ", seiHira: "なかむら", mei: "翔", meiKana: "ショウ", meiHira: "しょう", romaji: "sho.nakamura" },
    { sei: "小林", seiKana: "コバヤシ", seiHira: "こばやし", mei: "愛", meiKana: "アイ", meiHira: "あい", romaji: "ai.kobayashi" }
  ];
  const person = pick(NAMES);

  const PREFS = [
    "東京都", "神奈川県", "大阪府", "愛知県", "福岡県", "北海道", "京都府", "宮城県"
  ];
  const PLACES = [
    { pref: "東京都", city: "千代田区", town: "丸の内" },
    { pref: "東京都", city: "渋谷区", town: "桜丘町" },
    { pref: "神奈川県", city: "横浜市西区", town: "みなとみらい" },
    { pref: "大阪府", city: "大阪市北区", town: "梅田" },
    { pref: "愛知県", city: "名古屋市中区", town: "栄" },
    { pref: "福岡県", city: "福岡市中央区", town: "天神" },
    { pref: "北海道", city: "札幌市中央区", town: "大通西" },
    { pref: "京都府", city: "京都市中京区", town: "烏丸通" }
  ];
  const place = pick(PLACES);
  const COMPANIES = [
    "株式会社サンプル", "サンプル商事株式会社", "株式会社テスト工房", "有限会社デモテック"
  ];

  // ---------- 生成器 ----------
  const todayPlus = (days) => {
    const d = new Date(Date.now() + days * 86400000);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`;
  };

  const gen = {
    email: () => `${person.romaji}@example.com`,
    tel: () => `03-${pad(randInt(0, 9999), 4)}-${pad(randInt(0, 9999), 4)}`,
    mobile: () =>
      `${pick(["070", "080", "090"])}-${pad(randInt(0, 9999), 4)}-${pad(randInt(0, 9999), 4)}`,
    fax: () => `03-${pad(randInt(0, 9999), 4)}-${pad(randInt(0, 9999), 4)}`,
    zip: () => `${pad(randInt(100, 999), 3)}-${pad(randInt(0, 9999), 4)}`,
    pref: () => place.pref,
    city: () => place.city,
    address: () => `${place.town}${randInt(1, 9)}-${randInt(1, 30)}-${randInt(1, 15)}`,
    fullAddress: () =>
      `${place.pref}${place.city}${place.town}${randInt(1, 9)}-${randInt(1, 30)}-${randInt(1, 15)}`,
    building: () => `サンプルビル${randInt(1, 30)}${pick(["", "F", "号室"])}`,
    company: () => pick(COMPANIES),
    fullName: () => `${person.sei} ${person.mei}`,
    lastName: () => person.sei,
    firstName: () => person.mei,
    fullNameKana: () => `${person.seiKana} ${person.meiKana}`,
    lastNameKana: () => person.seiKana,
    firstNameKana: () => person.meiKana,
    url: () => "https://example.com",
    date: () => todayPlus(randInt(1, 30)),
    birthdate: () =>
      `${randInt(1965, 2000)}-${pad(randInt(1, 12), 2)}-${pad(randInt(1, 28), 2)}`,
    age: () => String(randInt(20, 60)),
    username: () => person.romaji.replace(".", "_"),
    password: () => `Sample${randInt(1000, 9999)}!`,
    keyword: () => "サンプル",
    text: () => "サンプルテキスト",
    message: () =>
      "これはサンプルの入力データです。動作確認のために自動生成されました。"
  };

  // ---------- フィールドの手がかり収集 ----------
  function fieldContext(el) {
    const parts = [];
    if (el.autocomplete) parts.push(el.autocomplete);
    if (el.name) parts.push(el.name);
    if (el.id) parts.push(el.id);
    if (el.placeholder) parts.push(el.placeholder);
    const aria = el.getAttribute && el.getAttribute("aria-label");
    if (aria) parts.push(aria);
    if (el.labels) {
      for (const lb of el.labels) parts.push(lb.textContent || "");
    }
    return parts.join(" ").toLowerCase();
  }

  // ---------- autocomplete属性の解釈 ----------
  const AUTOCOMPLETE_MAP = [
    [/^email$/, gen.email],
    [/^(tel|tel-national)$/, gen.tel],
    [/^postal-code$/, gen.zip],
    [/^name$/, gen.fullName],
    [/^family-name$/, gen.lastName],
    [/^given-name$/, gen.firstName],
    [/^organization$/, gen.company],
    [/^(street-address|address-line1)$/, gen.address],
    [/^address-line2$/, gen.building],
    [/^address-level1$/, gen.pref],
    [/^address-level2$/, gen.city],
    [/^url$/, gen.url],
    [/^bday$/, gen.birthdate],
    [/^username$/, gen.username],
    [/^(current-password|new-password)$/, gen.password]
  ];

  // ---------- キーワードルール(上から優先) ----------
  const RULES = [
    // フリガナ系を先に(name/氏名より優先)
    [/kana|フリガナ|ふりがな|かな/, (ctx) =>
      /sei|姓|last|family/.test(ctx) ? gen.lastNameKana()
      : /mei|名(?!前)|first|given/.test(ctx) ? gen.firstNameKana()
      : gen.fullNameKana()],
    [/mail|メール/, () => gen.email()],
    [/mobile|携帯|keitai/, () => gen.mobile()],
    [/fax|ファックス/, () => gen.fax()],
    [/tel|phone|電話/, () => gen.tel()],
    [/zip|postal|郵便/, () => gen.zip()],
    [/pref|都道府県/, () => gen.pref()],
    [/city|市区町村|市町村/, () => gen.city()],
    [/building|建物|ビル|マンション/, () => gen.building()],
    [/addr|住所/, () => gen.fullAddress()],
    [/company|会社|法人|organiz|所属/, () => gen.company()],
    [/sei|姓|last.?name|family.?name/, () => gen.lastName()],
    [/mei|名(?!前)|first.?name|given.?name/, () => gen.firstName()],
    [/name|氏名|名前|お名前/, () => gen.fullName()],
    [/birth|生年月日|誕生日/, () => gen.birthdate()],
    [/date|日付|年月日/, () => gen.date()],
    [/age|年齢/, () => gen.age()],
    [/url|website|ホームページ|サイト/, () => gen.url()],
    [/pass|パスワード/, () => gen.password()],
    [/user|ログイン|login|アカウント/, () => gen.username()],
    [/memo|note|備考|comment|コメント|message|メッセージ|問い合わせ|内容|本文|感想/, () => gen.message()],
    [/search|検索|keyword|キーワード/, () => gen.keyword()]
  ];

  // ---------- 型ごとのフォールバック ----------
  function byType(el) {
    const t = (el.type || "text").toLowerCase();
    if (el.tagName === "TEXTAREA") return gen.message();
    switch (t) {
      case "email": return gen.email();
      case "tel": return gen.tel();
      case "url": return gen.url();
      case "date": return gen.date();
      case "number": {
        const min = el.min !== "" ? Number(el.min) : 1;
        const max = el.max !== "" ? Number(el.max) : min + 99;
        return String(randInt(Math.max(0, min), Math.max(min, max)));
      }
      case "password": return gen.password();
      default: return gen.text();
    }
  }

  // ---------- Lv.3: バリデーション制約への適合 ----------
  // maxlength / minlength / pattern / min / max / step を読み、
  // 生成値がそのフィールドの制約を通るよう調整する。

  // カタカナ → ひらがな
  function toHiragana(s) {
    return s.replace(/[ァ-ヶ]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60)
    );
  }

  // pattern属性から望ましい値の形を推定して生成を試みる
  function valueForPattern(pattern) {
    // 数字のみ系: \d{7}, [0-9]{3,4}, 0[0-9]{9,10} など
    // \d / [0-9] を除去した残りに英字・日本語・ハイフン等が無ければ数字パターンとみなす
    const rest = pattern.replace(/\\d/g, "").replace(/\[0-9\]/g, "");
    if (!/[^\s\^{}$()+*?,|0-9]/.test(rest) && /\\d|\[0-9\]/.test(pattern)) {
      // 先頭の数字リテラル(例: 0[0-9]{9,10} の "0")はそのまま使う
      const head = (pattern.match(/^\^?(\d+)/) || [null, ""])[1];
      // 必要桁数を推定
      let minLen = 0, maxLen = 0;
      const re = /(?:\\d|\[0-9\]|\d)(?:\{(\d+)(?:,(\d*))?\})?/g;
      let m;
      while ((m = re.exec(pattern)) !== null) {
        const q1 = m[1] !== undefined ? Number(m[1]) : 1;
        const q2 =
          m[2] !== undefined ? (m[2] === "" ? q1 + 3 : Number(m[2])) : q1;
        minLen += q1;
        maxLen += q2;
      }
      const target = Math.min(Math.max(minLen, 4), Math.min(maxLen, 15));
      let digits = head;
      while (digits.length < target) digits += String(randInt(0, 9));
      return digits.slice(0, Math.max(target, head.length));
    }
    // カタカナのみ
    if (/[ァヶ]|[ア-ン]|ｱ|ﾝ/.test(pattern)) {
      return (person.seiKana + " " + person.meiKana).replace(/\s/g, "");
    }
    // ひらがなのみ
    if (/[ぁん]/.test(pattern)) {
      return toHiragana(person.seiKana + person.meiKana);
    }
    // 半角英数字
    if (/\[a-zA-Z0-9\]|\[a-z0-9\]|\[A-Za-z0-9\]/.test(pattern)) {
      const m = pattern.match(/\{(\d+)/);
      const len = m ? Math.max(Number(m[1]), 8) : 12;
      const base = (person.romaji.replace(/\W/g, "") + "12345678").slice(0, len);
      return base;
    }
    return null;
  }

  function matchesPattern(el, value) {
    const p = el.getAttribute && el.getAttribute("pattern");
    if (!p) return true;
    try {
      return new RegExp(`^(?:${p})$`).test(value);
    } catch {
      return true; // 解釈不能なpatternは無視
    }
  }

  // 生成値をフィールドの制約に合わせて調整
  function adjust(el, value) {
    let v = String(value);
    const t = (el.type || "text").toLowerCase();

    // --- number / range: min・max・step ---
    if ((t === "number" || t === "range") && v !== "" && !isNaN(Number(v))) {
      let num = Number(v);
      const min = el.min !== "" ? Number(el.min) : null;
      const max = el.max !== "" ? Number(el.max) : null;
      if (min !== null && num < min) num = min;
      if (max !== null && num > max) num = max;
      const stepAttr = el.getAttribute && el.getAttribute("step");
      if (stepAttr && stepAttr !== "any") {
        const step = Number(stepAttr);
        const base = min !== null ? min : 0;
        if (step > 0) {
          num = base + Math.round((num - base) / step) * step;
          // 浮動小数誤差の丸め
          const dec = (String(step).split(".")[1] || "").length;
          num = Number(num.toFixed(dec));
          if (max !== null && num > max) num = max - ((max - base) % step);
        }
      }
      return String(num);
    }

    // --- date / month / time 系: min・max でクランプ ---
    if (["date", "month", "time", "datetime-local", "week"].includes(t)) {
      const min = el.min, max = el.max;
      if (min && v < min) return min;
      if (max && v > max) return max;
      return v;
    }

    // --- maxlength / minlength ---
    const maxLen = el.maxLength > 0 ? el.maxLength : null;
    const minLen = el.minLength > 0 ? el.minLength : null;
    if (maxLen && v.length > maxLen) v = v.slice(0, maxLen);
    if (minLen && v.length < minLen) {
      // 足りない分は末尾に安全な文字を補う
      const filler = /^\d+$/.test(v) ? "0123456789" : "あいうえおabcde12345";
      while (v.length < minLen) v += filler[v.length % filler.length];
      if (maxLen && v.length > maxLen) v = v.slice(0, maxLen);
    }

    // --- pattern 適合(最大3回まで生成調整を試行) ---
    if (!matchesPattern(el, v)) {
      const candidate = valueForPattern(el.getAttribute("pattern") || "");
      if (candidate !== null) {
        let c = candidate;
        if (maxLen && c.length > maxLen) c = c.slice(0, maxLen);
        if (minLen && c.length < minLen) {
          while (c.length < minLen) c += "0";
          if (maxLen && c.length > maxLen) c = c.slice(0, maxLen);
        }
        if (matchesPattern(el, c)) v = c;
      }
    }
    return v;
  }

  // ---------- メイン: フィールドに合う値を生成 ----------
  function generate(el) {
    if (!el || el.disabled || el.readOnly) return null;
    const tag = el.tagName;

    if (tag === "SELECT") {
      // 空でない最初の選択肢を選ぶ
      const opts = Array.from(el.options).filter((o) => o.value !== "");
      return opts.length ? { kind: "select", value: opts[0].value } : null;
    }
    if (tag === "INPUT") {
      const t = (el.type || "text").toLowerCase();
      if (t === "checkbox") return { kind: "check", value: true };
      if (t === "radio") return { kind: "check", value: true };
    }

    const ctx = fieldContext(el);
    // 生成値を制約に適合させて返す
    const finish = (value) => ({ kind: "value", value: adjust(el, value) });
    // autocomplete属性を優先解釈
    const ac = (el.autocomplete || "").toLowerCase();
    if (ac && ac !== "on" && ac !== "off") {
      for (const [re, fn] of AUTOCOMPLETE_MAP) {
        if (re.test(ac)) return finish(fn());
      }
    }
    // キーワードルール
    for (const [re, fn] of RULES) {
      if (re.test(ctx)) return finish(fn(ctx));
    }
    // 型フォールバック
    return finish(byType(el));
  }

  window.UrlAutofillSamples = { generate };
})();
