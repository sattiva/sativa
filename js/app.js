(() => {
  // src/config.js
  var $ = (id) => document.getElementById(id);
  var IC = {
    html: '<svg viewBox="0 0 24 24"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/></svg>',
    css: '<svg viewBox="0 0 24 24"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z"/></svg>',
    js: '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/></svg>'
  };
  function hl(icon, label) {
    return '<span class="hl"><i>' + icon + "</i>" + label + "</span>";
  }
  var C = {
    id: "430766308662050817",
    tz: "America/Toronto",
    lat: 43.6532,
    lon: -79.3832,
    off: 0,
    bio: "hi im sativa, this site was made in " + hl(IC.html, "html") + ", " + hl(IC.css, "css") + " & " + hl(IC.js, "javascript") + "!"
  };
  try {
    const so = parseFloat(localStorage.getItem("sat-off") || localStorage.getItem("kast-off"));
    if (isFinite(so) && Math.abs(so) <= 10) C.off = so;
  } catch (e) {
  }
  var TITLES = {
    home: "Sativa",
    music: "Music \u2014 Sativa",
    games: "Games \u2014 Sativa",
    guestbook: "Guestbook \u2014 Sativa"
  };
  var PATH = {
    home: "/home",
    music: "/music",
    games: "/games",
    guestbook: "/guestbook"
  };
  var VIEW = { "/": "home", "": "home" };
  for (const pk in PATH) VIEW[PATH[pk]] = pk;
  var FB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%230a0a0a'/%3E%3C/svg%3E";
  var DEF_BG = "https://i.pinimg.com/originals/32/8c/88/328c881f1929b778adcc7d9c1c75adcd.gif";
  var MOB = typeof window !== "undefined" && (window.innerWidth < 760 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  var TOUCH = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
  var CK_W = "sat-c-w";
  var CK_P = "sat-c-p";
  var CK_V = "sat-c-v";
  var S = {
    actKey: "",
    actStart: 0,
    actTimer: null,
    disp: [],
    idx: -1,
    songKey: "",
    sp: null,
    spStart: 0,
    spEnd: 0,
    raf: null,
    reqId: 0,
    modalOpen: false,
    sock: null,
    hb: null,
    delay: 250,
    wLoaded: false,
    lastTs: "",
    vT: null,
    lastBgKey: "",
    lastTick: 0,
    unit: "c",
    wData: null,
    revealTok: 0
  };
  var SI = {
    online: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#23a55a"/></svg>',
    idle: '<svg viewBox="0 0 24 24"><g transform="translate(24 0) scale(-1 1)"><path d="M21.3 12.65A9 9 0 1 1 11.35 2.7a7 7 0 0 0 9.95 9.95Z" fill="#e0a020"/></g></svg>',
    dnd: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#f23f43"/><rect x="6.8" y="10.15" width="10.4" height="3.7" rx="1.85" fill="#000"/></svg>',
    offline: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6.7" fill="none" stroke="#9a9a9a" stroke-width="4.6"/></svg>'
  };
  var VB = { 0: "Playing", 1: "Streaming", 2: "Listening to", 3: "Watching", 5: "Competing in" };
  function fmtNum(n) {
    const v = Number(n) || 0;
    if (v >= 1e9) return trim1(v / 1e9) + "B";
    if (v >= 1e6) return trim1(v / 1e6) + "M";
    if (v >= 1e3) return trim1(v / 1e3) + "K";
    if (Number.isInteger(v)) return String(v);
    return trim1(v);
  }
  function trim1(v) {
    return v.toFixed(1).replace(/\.0$/, "");
  }
  function timeAgo(ms) {
    const d = Date.now() - Number(ms || 0);
    if (!isFinite(d) || d < 0) return "";
    if (d < 45e3) return "just now";
    const mins = Math.floor(d / 6e4);
    if (mins < 60) return mins + "m ago";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h ago";
    const days = Math.floor(hrs / 24);
    if (days < 7) return days + "d ago";
    return new Date(Number(ms)).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function(c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(u) {
    const s = String(u || "").trim();
    return /^(https?:|data:image\/|blob:)/i.test(s) ? s : "";
  }
  function cGet(k, mx) {
    try {
      const v = JSON.parse(localStorage.getItem(k) || "null");
      if (!v || !v.t || !v.d) return null;
      if (mx && Date.now() - v.t > mx) return null;
      return v.d;
    } catch (e) {
      return null;
    }
  }
  function cSet(k, d) {
    try {
      localStorage.setItem(k, JSON.stringify({ t: Date.now(), d }));
    } catch (e) {
    }
  }
  var toastT = null;
  function toast(m, err) {
    const t = $("toast");
    if (!t) return;
    t.innerHTML = '<span class="ic">' + (err ? '<svg viewBox="0 0 24 24"><line x1="7" y1="7" x2="17" y2="17"/><line x1="17" y1="7" x2="7" y2="17"/></svg>' : '<svg viewBox="0 0 24 24"><polyline points="4.5 12.5 9.5 17.5 19.5 6.5"/></svg>') + "</span><span>" + esc(m) + "</span>";
    t.classList.toggle("error", !!err);
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function() {
      t.classList.remove("show");
    }, 2200);
  }
  function legacyCopy(t, cb) {
    try {
      const a = document.createElement("textarea");
      a.value = t;
      a.setAttribute("readonly", "");
      a.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0";
      document.body.appendChild(a);
      a.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(a);
      if (ok && cb) cb();
    } catch (e) {
    }
  }
  function copy(t, btn) {
    const done = function() {
      toast("copied " + t);
      if (btn) {
        btn.classList.add("copied");
        setTimeout(function() {
          btn.classList.remove("copied");
        }, 1e3);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(done, function() {
        legacyCopy(t, done);
      });
    } else {
      legacyCopy(t, done);
    }
  }

  // src/music.js
  var SCROBBLE_AT = 0.5;
  var ART_SIZE = 400;
  var LOOKUP_TIMEOUT_MS = 6e3;
  var PLAY_ICON = '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
  var PAUSE_ICON = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
  var audio = null;
  var curRow = null;
  var curScrobbled = false;
  var rafId = null;
  function hashHue(s) {
    let h = 0;
    const v = String(s || "x");
    for (let i = 0; i < v.length; i++) h = (h * 31 + v.charCodeAt(i)) % 360;
    return h;
  }
  function monogram(title) {
    const words = String(title || "?").replace(/[^A-Za-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    const txt = (words.length > 1 ? words[0][0] + words[1][0] : (words[0] || "?").slice(0, 2)).toUpperCase();
    const h = hashHue(title);
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + h + ' 60% 33%)"/><stop offset="1" stop-color="hsl(' + (h + 48) % 360 + ' 56% 15%)"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/><text x="50" y="52" font-family="Satoshi,system-ui,sans-serif" font-size="36" font-weight="700" fill="rgba(255,255,255,.9)" text-anchor="middle">' + txt + "</text></svg>";
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }
  function upscale(u) {
    return String(u || "").replace(/\/\d+x\d+(bb)?\.(jpg|png)/, "/" + ART_SIZE + "x" + ART_SIZE + "bb.$1");
  }
  function norm(s) {
    return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
  }
  async function itunesArt(title, artist) {
    const term = (artist ? artist + " " : "") + title;
    const ctl = new AbortController();
    const timer2 = setTimeout(() => ctl.abort(), LOOKUP_TIMEOUT_MS);
    try {
      const r = await fetch(
        "https://itunes.apple.com/search?media=music&entity=song&limit=3&country=US&term=" + encodeURIComponent(term),
        { signal: ctl.signal }
      );
      if (!r.ok) return "";
      const j = await r.json();
      const rows = Array.isArray(j && j.results) ? j.results : [];
      if (!rows.length) return "";
      const want = norm(title);
      const hit = rows.find((x) => norm(x.trackName) === want) || rows[0];
      return safeUrl(upscale(hit.artworkUrl100 || hit.artworkUrl60));
    } catch (e) {
      return "";
    } finally {
      clearTimeout(timer2);
    }
  }
  function setArt(img, url, title) {
    if (!img) return;
    img.onerror = function() {
      this.onerror = null;
      this.src = monogram(title);
    };
    img.src = url || monogram(title);
  }
  function paintRow(row, playing) {
    if (!row) return;
    row.classList.toggle("playing", playing);
    const btn = row.querySelector(".track-play-btn");
    if (btn) {
      btn.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
      btn.setAttribute("aria-label", (playing ? "Pause " : "Play ") + (row.dataset.title || "track"));
    }
    if (!playing) {
      const fill = row.querySelector(".track-bar i");
      if (fill) fill.style.width = "0%";
    }
  }
  function paintNow(row, on) {
    const wrap = $("vaultNow");
    if (!wrap) return;
    wrap.hidden = !on;
    if (!on || !row) return;
    const rowImg = row.querySelector(".track-art img");
    const art = $("vaultArt");
    const title = $("vaultTitle");
    const artist = $("vaultArtist");
    const bar = $("vaultBar");
    if (art) art.src = rowImg && rowImg.src || monogram(row.dataset.title);
    if (title) title.textContent = row.dataset.title || "";
    if (artist) artist.textContent = row.dataset.artist || "";
    if (bar) bar.style.width = "0%";
  }
  function fmtTime(s) {
    const v = Math.max(0, Math.floor(Number(s) || 0));
    return Math.floor(v / 60) + ":" + String(v % 60).padStart(2, "0");
  }
  function startLoop(row) {
    cancelAnimationFrame(rafId);
    (function step() {
      if (!audio || curRow !== row) return;
      rafId = requestAnimationFrame(step);
      const el = audio.currentTime || 0;
      const dur = audio.duration;
      const known = dur && isFinite(dur) ? dur : Number(row.dataset.dur) || 0;
      const pct = known > 0 ? Math.min(1, el / known) : 0;
      const rowFill = row.querySelector(".track-bar i");
      const nowFill = $("vaultBar");
      if (rowFill) rowFill.style.width = (pct * 100).toFixed(2) + "%";
      if (nowFill) nowFill.style.width = (pct * 100).toFixed(2) + "%";
      const stamp = $("vaultElapsed");
      if (stamp) stamp.textContent = fmtTime(el);
      if (!curScrobbled && dur && isFinite(dur) && el >= dur * SCROBBLE_AT) {
        curScrobbled = true;
        fireScrobble(row, el * 1e3);
      }
    })();
  }
  async function fireScrobble(row, ms) {
    const id = row && row.dataset.id;
    if (!id) return;
    try {
      await fetch("/api/scrobble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ms: Math.round(ms),
          nonce: Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
        })
      });
    } catch (e) {
    }
  }
  function stopCustomAudio() {
    cancelAnimationFrame(rafId);
    if (audio) {
      audio.pause();
      audio.src = "";
      audio = null;
    }
    paintRow(curRow, false);
    paintNow(null, false);
    curRow = null;
    curScrobbled = false;
  }
  function play(row) {
    const src = safeUrl(row.dataset.src);
    if (!src) return;
    stopCustomAudio();
    curRow = row;
    curScrobbled = false;
    paintRow(row, true);
    paintNow(row, true);
    const a = new Audio(src);
    a.preload = "auto";
    a.volume = 0.7;
    audio = a;
    a.addEventListener("play", () => startLoop(row));
    a.addEventListener("ended", () => stopCustomAudio());
    a.addEventListener("error", () => {
      if (audio !== a) return;
      stopCustomAudio();
      toast("preview unavailable for this track", true);
    });
    a.play().then(() => {
      if (audio === a) startLoop(row);
    }).catch(() => {
      if (audio !== a) return;
      stopCustomAudio();
      toast("playback blocked by the browser", true);
    });
  }
  function toggle(row) {
    if (curRow === row && audio) {
      if (audio.paused) audio.play().catch(() => {
      });
      else audio.pause();
      return;
    }
    play(row);
  }
  function initMusic() {
    const list = $("customTrackList");
    if (!list) return;
    const rows = Array.prototype.slice.call(list.querySelectorAll(".track-row"));
    rows.forEach((row) => {
      const nameEl = row.querySelector(".track-name");
      const artEl = row.querySelector(".track-artist");
      row.dataset.title = nameEl ? nameEl.textContent.trim() : "";
      row.dataset.artist = artEl ? artEl.textContent.replace(/\s*·\s*/g, ", ").trim() : "";
      const durEl = row.querySelector(".track-dur");
      const parts = (durEl ? durEl.textContent : "").split(":");
      row.dataset.dur = parts.length === 2 ? String(Number(parts[0]) * 60 + Number(parts[1])) : "0";
      const img = row.querySelector(".track-art img");
      setArt(img, "", row.dataset.title);
      itunesArt(row.dataset.title, row.dataset.artist).then((url) => {
        if (url) setArt(img, url, row.dataset.title);
      });
      row.addEventListener("click", () => toggle(row));
    });
    const stop = $("vaultStop");
    if (stop) stop.addEventListener("click", () => stopCustomAudio());
    const badge = $("musicStatusBadge");
    if (badge) badge.textContent = rows.length + " Tracks";
  }

  // src/navigation.js
  var $stage = typeof document !== "undefined" ? document.querySelector(".stage") : null;
  var SC = { y: 0, target: 0, max: 0, raf: null, active: !TOUCH };
  function scMax() {
    if (!SC.active || !$stage) return;
    SC.max = Math.max(0, $stage.offsetHeight - window.innerHeight);
    if (SC.target > SC.max) SC.target = SC.max;
    if (SC.y > SC.max) SC.y = SC.max;
  }
  function scApply() {
    if (!SC.active || !$stage) return;
    $stage.style.transform = "translate3d(0," + (-SC.y).toFixed(2) + "px,0)";
  }
  function scLoop() {
    const d = SC.target - SC.y;
    if (Math.abs(d) < 0.12) {
      SC.y = SC.target;
      scApply();
      SC.raf = null;
      return;
    }
    SC.y += d * 0.14;
    scApply();
    SC.raf = requestAnimationFrame(scLoop);
  }
  function scStart() {
    if (!SC.active || SC.raf) return;
    SC.raf = requestAnimationFrame(scLoop);
  }
  function scTo(y, instant) {
    if (!SC.active) return;
    scMax();
    SC.target = Math.max(0, Math.min(SC.max, y));
    if (instant) {
      SC.y = SC.target;
      scApply();
    } else {
      scStart();
    }
  }
  function initScroll() {
    if (!SC.active) return;
    document.documentElement.classList.add("smooth-scroll");
    try {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    } catch (e) {
    }
    window.addEventListener("wheel", function(e) {
      if (S.modalOpen) return;
      if (e.target && e.target.closest && e.target.closest(".lyr-scroll,.modal-ov")) return;
      e.preventDefault();
      SC.target = Math.max(0, Math.min(SC.max, SC.target + e.deltaY));
      scStart();
    }, { passive: false });
    document.addEventListener("keydown", function(e) {
      if (S.modalOpen) return;
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      let d = 0;
      if (e.key === "ArrowDown") d = 90;
      else if (e.key === "ArrowUp") d = -90;
      else if (e.key === "PageDown" || e.key === " " && !e.shiftKey) d = window.innerHeight * 0.85;
      else if (e.key === "PageUp" || e.key === " " && e.shiftKey) d = -window.innerHeight * 0.85;
      else if (e.key === "Home") {
        scTo(0, false);
        e.preventDefault();
        return;
      } else if (e.key === "End") {
        scTo(SC.max, false);
        e.preventDefault();
        return;
      } else return;
      e.preventDefault();
      SC.target = Math.max(0, Math.min(SC.max, SC.target + d));
      scStart();
    });
    window.addEventListener("resize", () => scMax());
    if (window.ResizeObserver && $stage) {
      try {
        new ResizeObserver(() => scMax()).observe($stage);
      } catch (e) {
        setInterval(scMax, 600);
      }
    } else {
      setInterval(scMax, 600);
    }
    scMax();
    scApply();
  }
  function motionPreference() {
    try {
      return localStorage.getItem("sat-motion") || localStorage.getItem("kast-motion") || "";
    } catch (e) {
      return "";
    }
  }
  function shouldReduceMotion() {
    const choice = motionPreference();
    if (choice === "on") return false;
    if (choice === "off") return true;
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
  }
  var rvItems = [];
  var motionPrompt = null;
  var motionControl = null;
  var motionChoicePending = true;
  var autoTour = false;
  var tourIndex = 0;
  var tourTimer = null;
  var tourViews = ["home", "music", "games", "guestbook"];
  function playReveal(items) {
    items = items || rvItems;
    if (motionChoicePending) return;
    if (shouldReduceMotion()) {
      for (let i = 0; i < items.length; i++) items[i].classList.add("in");
      return;
    }
    const start = 300, stagger = 900;
    for (let i = 0; i < items.length; i++) {
      setTimeout(/* @__PURE__ */ ((el) => () => el.classList.add("in"))(items[i]), start + i * stagger);
    }
  }
  function tourDuration(view) {
    if (view === "home") return 300 + Math.max(0, rvItems.length - 1) * 900 + 1e3;
    return { music: 2800, games: 6500, guestbook: 2800 }[view] || 3e3;
  }
  function scheduleTourStep() {
    clearTimeout(tourTimer);
    tourTimer = setTimeout(advanceTour, tourDuration(tourViews[tourIndex]));
  }
  function setTourRoute(view) {
    try {
      history.replaceState({ v: view }, "", PATH[view] || "/");
    } catch (e) {
    }
  }
  function updateMotionControl(enabled) {
    if (!motionControl) return;
    motionControl.hidden = false;
    motionControl.setAttribute("aria-checked", enabled ? "true" : "false");
    motionControl.setAttribute("aria-label", enabled ? "Turn motion off" : "Turn motion on");
  }
  function endAutoTour() {
    autoTour = false;
    clearTimeout(tourTimer);
    try {
      sessionStorage.removeItem("sat-tour-active");
    } catch (e) {
    }
    updateMotionControl(true);
  }
  function beginAutoTour() {
    autoTour = true;
    if (motionControl) motionControl.hidden = true;
    try {
      sessionStorage.setItem("sat-tour-active", "1");
    } catch (e) {
    }
    tourIndex = 0;
    setActive("home");
    setTourRoute("home");
    const current = document.querySelector(".view:not([hidden])");
    if (current && current.dataset.view !== "home") showView("home", false, true);
    rvItems.forEach((el) => el.classList.remove("in"));
    void document.body.offsetWidth;
    playReveal();
    scheduleTourStep();
  }
  function advanceTour() {
    if (!autoTour) return;
    tourIndex++;
    if (tourIndex >= tourViews.length) {
      endAutoTour();
      return;
    }
    const view = tourViews[tourIndex];
    setActive(view);
    setTourRoute(view);
    showView(view, false, false);
    scheduleTourStep();
  }
  function stopAllMotion() {
    try {
      localStorage.setItem("sat-motion", "off");
    } catch (e) {
    }
    try {
      sessionStorage.removeItem("sat-tour-active");
    } catch (e) {
    }
    autoTour = false;
    clearTimeout(tourTimer);
    document.documentElement.classList.remove("motion-on", "motion-paused");
    document.documentElement.classList.add("motion-off");
    rvItems.forEach((el) => el.classList.add("in"));
    updateMotionControl(false);
  }
  function chooseMotion(choice) {
    try {
      localStorage.setItem("sat-motion", choice);
    } catch (e) {
    }
    document.documentElement.classList.remove("motion-choice-required", "motion-paused");
    document.documentElement.classList.toggle("motion-on", choice === "on");
    document.documentElement.classList.toggle("motion-off", choice === "off");
    motionChoicePending = false;
    if (motionPrompt) motionPrompt.classList.remove("show");
    if (choice === "on") {
      if (motionControl) motionControl.hidden = true;
      beginAutoTour();
      return;
    }
    updateMotionControl(false);
    const req = initialRequestedView();
    setActive(req);
    if (req !== "home") showView(req, false, true);
    else playReveal();
  }
  function initialRequestedView() {
    const p = location.pathname.replace(/\/+$/, "") || "/";
    const q = new URLSearchParams(location.search).get("view");
    return (TITLES[q] ? q : null) || VIEW[p] || "home";
  }
  function setActive(t) {
    document.querySelectorAll(".nav-btn").forEach((x) => {
      x.classList.toggle("active", x.dataset.view === t);
    });
  }
  function showView(t, push, instant) {
    const cur = document.querySelector(".view:not([hidden])");
    const nxt = document.querySelector('.view[data-view="' + t + '"]');
    if (!nxt) return;
    if (push && location.pathname !== PATH[t]) {
      try {
        history.pushState({ v: t }, "", PATH[t] || "/");
      } catch (e) {
      }
    }
    if (cur === nxt) return;
    if (cur && cur.dataset.view === "music" && t !== "music") {
      stopCustomAudio();
    }
    document.title = TITLES[t] || "Sativa";
    const go = function() {
      nxt.hidden = false;
      if (t === "home" && !autoTour) playReveal();
      nxt.classList.remove("view-enter");
      void nxt.offsetWidth;
      nxt.classList.add("view-enter");
      setTimeout(scMax, 50);
    };
    const reduce = shouldReduceMotion();
    if (cur && !reduce && !instant) {
      cur.classList.add("view-out");
      clearTimeout(S.vT);
      S.vT = setTimeout(function() {
        cur.hidden = true;
        cur.classList.remove("view-out");
        go();
      }, 260);
    } else {
      if (cur) {
        cur.hidden = true;
        cur.classList.remove("view-out");
      }
      go();
    }
    scTo(0, true);
    if (SC.active) {
      SC.target = 0;
      SC.y = 0;
      scApply();
    } else {
      try {
        window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
      } catch (e) {
      }
    }
  }
  function initNavigation() {
    rvItems = [].slice.call(document.querySelectorAll("[data-rv]")).filter((el) => !el.hidden);
    motionPrompt = $("motionPrompt");
    motionControl = $("motionControl");
    const motionOnChoice = $("motionOn");
    const motionOffChoice = $("motionOff");
    const motionDialog = motionPrompt ? motionPrompt.querySelector(".motion-prompt") : null;
    if (motionPrompt) motionPrompt.classList.add("show");
    if (motionOnChoice) {
      motionOnChoice.addEventListener("click", () => chooseMotion("on"));
    }
    if (motionOffChoice) {
      motionOffChoice.addEventListener("click", () => chooseMotion("off"));
    }
    if (motionChoicePending && motionDialog && motionPrompt) {
      setTimeout(() => motionDialog.focus(), 0);
      motionPrompt.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
          e.preventDefault();
          return;
        }
        if (e.key !== "Tab") return;
        if (e.shiftKey && document.activeElement === motionOffChoice) {
          e.preventDefault();
          motionOnChoice.focus();
        } else if (!e.shiftKey && document.activeElement === motionOnChoice) {
          e.preventDefault();
          motionOffChoice.focus();
        }
      });
    }
    if (motionControl) {
      motionControl.addEventListener("click", function() {
        const enabled = motionControl.getAttribute("aria-checked") === "true";
        if (enabled) {
          stopAllMotion();
          return;
        }
        try {
          localStorage.setItem("sat-motion", "on");
        } catch (e) {
        }
        document.documentElement.classList.remove("motion-off", "motion-paused");
        document.documentElement.classList.add("motion-on");
        updateMotionControl(true);
      });
    }
    document.querySelectorAll(".nav-btn[data-view]").forEach((b) => {
      b.addEventListener("click", () => {
        if (autoTour) endAutoTour();
        setActive(b.dataset.view);
        showView(b.dataset.view, true);
      });
    });
    window.addEventListener("popstate", function() {
      const p = location.pathname.replace(/\/+$/, "") || "/";
      const v = VIEW[p] || "home";
      setActive(v);
      showView(v, false);
    });
    const prev = motionPreference();
    if (prev) {
      chooseMotion(prev);
    }
  }
  function initTilt() {
    function tilt(el) {
      if (!el || !(window.matchMedia && window.matchMedia("(hover:hover)").matches)) return;
      el.addEventListener("mouseenter", function() {
        el.style.transition = "transform .12s linear,box-shadow .35s var(--e),border-color .35s var(--e)";
      });
      el.addEventListener("mousemove", function(e) {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2);
        dx = Math.max(-1, Math.min(1, dx));
        dy = Math.max(-1, Math.min(1, dy));
        el.style.transform = "perspective(900px) translate3d(" + (dx * 14).toFixed(2) + "px," + (dy * 10).toFixed(2) + "px,0) rotateY(" + (dx * 6).toFixed(2) + "deg) rotateX(" + (-dy * 6).toFixed(2) + "deg)";
      });
      el.addEventListener("mouseleave", function() {
        el.style.transition = "transform .6s var(--e),box-shadow .35s var(--e),border-color .35s var(--e)";
        el.style.transform = "";
      });
    }
    tilt(document.querySelector("#motionPrompt .motion-prompt"));
    const w = $("weatherWidget");
    if (w && window.matchMedia && window.matchMedia("(hover:hover)").matches) {
      w.addEventListener("mouseenter", function() {
        w.style.transition = "transform .1s linear,box-shadow .35s var(--e)";
      });
      w.addEventListener("mousemove", function(e) {
        if (!w.classList.contains("in")) return;
        const r = w.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2);
        dx = Math.max(-1, Math.min(1, dx));
        dy = Math.max(-1, Math.min(1, dy));
        w.style.transform = "perspective(900px) translate3d(" + (dx * 30).toFixed(2) + "px," + (dy * 20).toFixed(2) + "px,0) rotateY(" + (dx * 10).toFixed(2) + "deg) rotateX(" + (-dy * 10).toFixed(2) + "deg)";
      });
      w.addEventListener("mouseleave", function() {
        w.style.transition = "transform .55s var(--e),box-shadow .35s var(--e)";
        w.style.transform = "";
      });
    }
  }
  function initBg() {
    if (MOB) return;
    const cv = $("bgCanvas");
    if (!cv) return;
    const rm = window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
    const gl = cv.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" }) || cv.getContext("experimental-webgl");
    if (!gl) return;
    const VERT = "attribute vec2 position;varying vec2 vUv;void main(){vUv=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}";
    const FRAG = "precision highp float;uniform float uTime;uniform vec2 uResolution;varying vec2 vUv;void main(){vec2 uv=vUv;float t=uTime*0.09;float w=0.0;w+=sin(uv.x*3.1+t)*0.5;w+=sin(uv.x*5.3-t*1.15+uv.y*2.0)*0.3;w+=sin(uv.x*2.1+t*0.72+uv.y*4.0)*0.2;w=w*0.5+0.5;vec3 base=mix(vec3(0.024,0.026,0.030),vec3(0.052,0.056,0.062),uv.y);vec3 col=base+vec3(0.086,0.090,0.100)*smoothstep(0.42,0.92,w)*0.55;col*=1.0-length(uv-0.5)*0.42;col+=(fract(sin(dot(uv*uResolution,vec2(12.9898,78.233)))*43758.5453)-0.5)*0.005;gl_FragColor=vec4(max(col,vec3(0.0)),1.0);}";
    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    }
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const pl = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(pl);
    gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);
    const uT = gl.getUniformLocation(prog, "uTime");
    const uR = gl.getUniformLocation(prog, "uResolution");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      cv.width = Math.max(1, Math.floor(w * dpr));
      cv.height = Math.max(1, Math.floor(h * dpr));
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(uR, w, h);
      if (rm) {
        gl.uniform1f(uT, 12);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    }
    let rt = null;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(resize, 150);
    });
    window.addEventListener("orientationchange", () => setTimeout(resize, 200));
    resize();
    if (rm) return;
    const start = performance.now();
    let raf = null;
    function render(now) {
      raf = requestAnimationFrame(render);
      gl.uniform1f(uT, (now - start) * 1e-3);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function play2() {
      if (!raf) raf = requestAnimationFrame(render);
    }
    document.addEventListener("visibilitychange", function() {
      if (document.hidden) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      } else {
        play2();
      }
    });
    play2();
  }
  function animateCount(target) {
    const el = $("viewCount");
    if (!el) return;
    let cur = parseInt(String(el.textContent || "0").replace(/[^0-9]/g, ""), 10);
    if (!isFinite(cur) || cur < 0) cur = 0;
    if (cur === target) {
      el.textContent = target.toLocaleString();
      return;
    }
    const t0 = performance.now(), dur = 1800;
    function step(now) {
      const t = (now - t0) / dur;
      if (t >= 1) {
        el.textContent = target.toLocaleString();
        return;
      }
      const e = Math.pow(t, 2.2);
      const v = Math.round(cur + (target - cur) * e);
      el.textContent = v.toLocaleString();
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function newVisitId() {
    return window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }
  function initViewCounter() {
    let viewSessionId = "";
    let viewVisitId = "";
    try {
      viewSessionId = sessionStorage.getItem("sat-view-session") || newVisitId();
      sessionStorage.setItem("sat-view-session", viewSessionId);
      viewVisitId = sessionStorage.getItem("sat-view-visit") || newVisitId();
      sessionStorage.setItem("sat-view-visit", viewVisitId);
    } catch (e) {
      viewSessionId = newVisitId();
      viewVisitId = newVisitId();
    }
    const localPreview = /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?$/i.test(location.hostname || location.origin);
    function sendViewPing(isVisit) {
      if (localPreview) return;
      const body = { sessionId: viewSessionId };
      if (isVisit) body.visitId = viewVisitId;
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        referrerPolicy: "no-referrer",
        keepalive: true
      }).then((r) => r.ok ? r.json() : null).then((d) => {
        if (!d || typeof d.count !== "number") return;
        cSet(CK_V, d.count);
        if ($("viewCounter")) $("viewCounter").hidden = false;
        animateCount(d.count);
      }).catch(() => {
      });
    }
    const cvv = cGet(CK_V, 864e5);
    if (cvv && typeof cvv === "number") {
      if ($("viewCounter")) $("viewCounter").hidden = false;
      animateCount(cvv);
    }
    sendViewPing(true);
    setInterval(() => sendViewPing(false), 45e3);
  }

  // src/weather.js
  var tFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: C.tz });
  var dFmt = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: C.tz });
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function ic(p) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  }
  var CL = '<path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>';
  var W = {
    sun: ic('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'),
    moon: ic('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
    cloud: ic('<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>'),
    partly: ic('<path d="M12 3v1M5.22 5.22l.7.7M3 12h1M5.22 18.78l.7-.7"/><path d="M17.5 10.5h-.5A6 6 0 1 0 9 20h8a4.75 4.75 0 0 0 .5-9.5z"/>'),
    rain: ic('<path d="M16 13v6M8 13v6M12 15v6M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>'),
    drizzle: ic(CL + '<path d="M8 19v1M16 19v1M12 21v1"/>'),
    snow: ic(CL + '<path d="M8 16h.01M8 20h.01M12 18h.01M12 22h.01M16 16h.01M16 20h.01"/>'),
    thunder: ic('<path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/>'),
    fog: ic('<path d="M4 14h16M4 18h16M6 10h12M8 6h8"/>')
  };
  function wIcon(c, d) {
    if (c === 0) return d === 0 ? W.moon : W.sun;
    if (c < 3) return W.partly;
    if (c === 3) return W.cloud;
    if (c === 45 || c === 48) return W.fog;
    if (c < 58) return W.drizzle;
    if (c < 68) return W.rain;
    if (c < 78) return W.snow;
    if (c < 83) return W.rain;
    if (c < 87) return W.snow;
    if (c >= 95) return W.thunder;
    return W.cloud;
  }
  function wDesc(c) {
    return c === 0 ? "Clear sky" : c === 1 ? "Mainly clear" : c === 2 ? "Partly cloudy" : c === 3 ? "Overcast" : c === 45 ? "Fog" : c === 48 ? "Depositing rime fog" : c >= 51 && c <= 53 ? "Light drizzle" : c === 55 ? "Dense drizzle" : c === 56 ? "Light freezing drizzle" : c === 57 ? "Dense freezing drizzle" : c === 61 ? "Slight rain" : c === 63 ? "Moderate rain" : c === 65 ? "Heavy rain" : c === 66 ? "Light freezing rain" : c === 67 ? "Heavy freezing rain" : c === 71 ? "Slight snow" : c === 73 ? "Moderate snow" : c === 75 ? "Heavy snow" : c === 77 ? "Snow grains" : c === 80 ? "Slight rain showers" : c === 81 ? "Moderate rain showers" : c === 82 ? "Violent rain showers" : c === 85 ? "Slight snow showers" : c === 86 ? "Heavy snow showers" : c === 95 ? "Thunderstorm" : c === 96 ? "Thunderstorm with slight hail" : c === 99 ? "Thunderstorm with heavy hail" : "\u2014";
  }
  function tick() {
    const n = /* @__PURE__ */ new Date();
    $("localTime").textContent = tFmt.format(n);
    $("localDate").textContent = dFmt.format(n);
  }
  function fT(v) {
    if (v == null || isNaN(v)) return "\u2014";
    let n = Number(v);
    if (S.unit === "f") n = n * 9 / 5 + 32;
    return Math.round(n) + "\xB0";
  }
  function renderW(d) {
    if (!d || !d.current) return;
    S.wData = d;
    const c = d.current;
    $("weatherNowIcon").innerHTML = wIcon(c.weather_code, c.is_day);
    $("weatherNowTemp").textContent = fT(c.temperature_2m);
    $("weatherNowDesc").textContent = wDesc(c.weather_code);
    $("weatherNowFeels").textContent = "feels like " + fT(c.apparent_temperature);
    S.wLoaded = true;
    const day = d.daily;
    if (!day || !day.time) return;
    let html = "";
    for (let i = 0; i < day.time.length && i < 7; i++) {
      const dt = /* @__PURE__ */ new Date(day.time[i] + "T12:00:00");
      html += '<div class="weather-fday' + (i ? "" : " today") + '"><span class="weather-fname">' + (i ? DAYS[dt.getDay()] : "today") + '</span><span class="weather-ficon">' + wIcon(day.weather_code[i], 1) + '</span><span class="weather-ftemps"><b class="weather-ftmax">' + fT(day.temperature_2m_max[i]) + '</b><span class="weather-ftmin">' + fT(day.temperature_2m_min[i]) + "</span></span></div>";
    }
    $("weatherForecast").innerHTML = html;
    setTimeout(scMax, 50);
  }
  function setUnit(u) {
    if (u !== "c" && u !== "f") return;
    S.unit = u;
    try {
      localStorage.setItem("sat-unit", u);
    } catch (e) {
    }
    const bs = document.querySelectorAll(".unit-btn");
    for (let i = 0; i < bs.length; i++) bs[i].classList.toggle("active", bs[i].dataset.unit === u);
    if (S.wData) renderW(S.wData);
  }
  function initWeather() {
    try {
      const su = localStorage.getItem("sat-unit");
      if (su === "c" || su === "f") setUnit(su);
    } catch (e) {
    }
    document.querySelectorAll(".unit-btn").forEach((b) => {
      b.addEventListener("click", function() {
        setUnit(this.dataset.unit);
      });
    });
    const cached = cGet(CK_W, 36e5);
    if (cached) renderW(cached);
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 8e3);
    fetch("https://api.open-meteo.com/v1/forecast?latitude=" + C.lat + "&longitude=" + C.lon + "&current=temperature_2m,apparent_temperature,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=" + encodeURIComponent(C.tz) + "&temperature_unit=celsius&forecast_days=7", { referrerPolicy: "no-referrer", signal: ac.signal }).then((r) => {
      clearTimeout(to);
      return r.ok ? r.json() : null;
    }).then((d) => {
      if (!d || !d.current) return;
      cSet(CK_W, d);
      renderW(d);
    }).catch(() => {
      clearTimeout(to);
    });
    tick();
    setInterval(tick, 1e3);
  }

  // src/lyrics.js
  var lyrCache = {};
  var artCache = {};
  try {
    lyrCache = JSON.parse(localStorage.getItem("sat-lyr") || localStorage.getItem("kast-lyr") || "{}") || {};
  } catch (e) {
    lyrCache = {};
  }
  function trimStore(o, m) {
    try {
      const ks = Object.keys(o);
      if (ks.length > m) {
        const k2 = {};
        ks.slice(-m).forEach((k) => {
          k2[k] = o[k];
        });
        return k2;
      }
      return o;
    } catch (e) {
      return o;
    }
  }
  function saveLyrCache() {
    try {
      lyrCache = trimStore(lyrCache, 200);
      localStorage.setItem("sat-lyr", JSON.stringify(lyrCache));
    } catch (e) {
    }
  }
  function discordSec() {
    if (!S.spStart) return 0;
    let e = (Date.now() - S.spStart) / 1e3;
    if (!isFinite(e) || e < 0) e = 0;
    if (S.spEnd) {
      const t = (S.spEnd - S.spStart) / 1e3;
      if (t > 0 && e > t) e = t;
    }
    return e;
  }
  function spDur() {
    return S.spStart && S.spEnd ? Math.max(0, (S.spEnd - S.spStart) / 1e3) : 0;
  }
  function fmtEl(ms) {
    const t = Math.max(0, Math.floor(ms / 1e3));
    const h = Math.floor(t / 3600);
    const m = Math.floor(t % 3600 / 60);
    const s = t % 60;
    return h ? h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") : m + ":" + String(s).padStart(2, "0");
  }
  function updSongTime() {
    if (!S.sp) return;
    const total = spDur();
    const el = discordSec();
    const cTxt = fmtEl(el * 1e3);
    if (cTxt !== S.lastTs) {
      S.lastTs = cTxt;
      const cur = $("timeCurrent");
      if (cur) cur.textContent = cTxt;
    }
    const tot = $("timeTotal");
    if (tot) tot.textContent = total > 0 ? fmtEl(total * 1e3) : "--:--";
    const fill = $("progressFill");
    if (fill) fill.style.width = total > 0 ? Math.min(100, el / total * 100).toFixed(2) + "%" : "0%";
  }
  function findIdx(s) {
    let i = 0;
    for (let k = 0; k < S.disp.length; k++) {
      if (s >= S.disp[k].time) i = k;
      else break;
    }
    return i;
  }
  function setArt2(url) {
    const bg = $("lyricsBg");
    const c = safeUrl(url);
    const lyrArt = $("lyricsArt");
    if (c) {
      if (bg) {
        bg.style.backgroundImage = 'url("' + c.replace(/["\\\n]/g, encodeURIComponent) + '")';
        bg.classList.add("show");
      }
      if (lyrArt) {
        lyrArt.src = c;
        lyrArt.style.display = "";
      }
    } else {
      if (bg) {
        bg.style.backgroundImage = "";
        bg.classList.remove("show");
      }
      if (lyrArt) {
        lyrArt.removeAttribute("src");
        lyrArt.style.display = "none";
      }
    }
  }
  function setBgArt(url) {
    const c = safeUrl(url) || DEF_BG;
    if (c === S.lastBgKey) return;
    S.lastBgKey = c;
    const a = $("bgArt");
    const s = $("bgArtShadow");
    if (a) {
      a.style.backgroundImage = 'url("' + c.replace(/["\\\n]/g, encodeURIComponent) + '")';
      a.classList.add("show");
    }
    if (s) s.classList.add("show");
  }
  function dominantColor(img) {
    try {
      const c = document.createElement("canvas");
      const n = 20;
      c.width = c.height = n;
      const x = c.getContext("2d");
      x.drawImage(img, 0, 0, n, n);
      const d = x.getImageData(0, 0, n, n).data;
      const acc = [0, 0, 0];
      let wt = 0;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        const l = (mx + mn) / 2;
        const s = mx === mn ? 0 : l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn);
        const w = s * (1 - Math.abs(l - 0.5) * 1.4);
        if (l > 0.1 && l < 0.92) {
          acc[0] += d[i] * w;
          acc[1] += d[i + 1] * w;
          acc[2] += d[i + 2] * w;
          wt += w;
        }
      }
      if (wt < 1e-3) return [255, 255, 255];
      return [Math.round(acc[0] / wt), Math.round(acc[1] / wt), Math.round(acc[2] / wt)];
    } catch (e) {
      return [255, 255, 255];
    }
  }
  function applyAccent(c) {
    document.documentElement.style.setProperty("--ac1", Math.min(255, c[0] + 45) + "," + Math.min(255, c[1] + 45) + "," + Math.min(255, c[2] + 45));
  }
  function parseLrc(t) {
    const o = [];
    String(t || "").split(/\r?\n/).forEach((r) => {
      const re = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
      let m;
      const ts = [];
      while (m = re.exec(r)) {
        ts.push(parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + (m[3] ? parseInt(m[3], 10) / Math.pow(10, m[3].length) : 0));
      }
      const x = r.replace(re, "").replace(/\[([^\]]+)\]/g, "($1)").trim();
      if (x) ts.forEach((time) => {
        o.push({ time, text: x });
      });
    });
    return o.sort((a, b) => a.time - b.time);
  }
  function cleanTrack(t) {
    return String(t || "").replace(/\s*[-–]\s*(remaster(ed)?|single|album|radio|deluxe|bonus|explicit|clean|version|edit).*/i, "").replace(/\s*[\[\(][^\]\)]*(remaster|feat\.|ft\.|live|version|edit|radio)[^\]\)]*[\]\)]/i, "").replace(/\s+/g, " ").trim();
  }
  function primaryArtist(a) {
    return String(a || "").split(/[,;]|\s+feat(?:uring)?\s+|\s+ft\.?\s+|\s+x\s+/i)[0].replace(/^by\s+/i, "").trim();
  }
  function normMeta(s) {
    return String(s || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/^@+/, "").replace(/&/g, " and ").replace(/\b(feat(?:uring)?|ft)\b.*$/, "").replace(/\b(official|audio|video|lyrics|lyric)\b/g, " ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
  }
  function normArtist(s) {
    return normMeta(primaryArtist(s)).replace(/\s*(topic|vevo|official|music|records|entertainment)\s*$/, "").replace(/\s+/g, " ").trim();
  }
  function normTitle(s) {
    return normMeta(cleanTrack(s)).replace(/\b(remaster(?:ed)?|single|album|radio|deluxe|bonus|explicit|clean|version|edit)\b/g, " ").replace(/\s+/g, " ").trim();
  }
  function wordT(t, start, next) {
    const ws = String(t).trim().split(/\s+/).filter(Boolean);
    if (!ws.length) return [];
    let tot = 0;
    ws.forEach((w) => {
      tot += w.length;
    });
    const dur = Math.max(0.4, Math.min(next && next > start ? next - start : 2.6, 6));
    let c = start;
    const o = [];
    ws.forEach((w) => {
      const sp = Math.max(0.12, w.length / Math.max(1, tot) * dur);
      o.push({ start: c, end: c + sp });
      c += sp;
    });
    return o;
  }
  function buildDisplay(lines) {
    const out = [];
    lines.forEach((cur, i) => {
      if (i === 0 && cur.time > 8) out.push({ time: 0, text: "", instrumental: true });
      else if (i > 0 && cur.time - lines[i - 1].time > 8) out.push({ time: lines[i - 1].time + 1, text: "", instrumental: true });
      out.push({ time: cur.time, text: cur.text, instrumental: false });
    });
    out.forEach((l, k) => {
      l.wordTimings = l.instrumental ? [] : wordT(l.text, l.time, out[k + 1] ? out[k + 1].time : 0);
    });
    return out;
  }
  function fetchJSON(url, ms) {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), ms || 5e3);
    return fetch(url, { signal: ac.signal, referrerPolicy: "no-referrer" }).then((r) => {
      clearTimeout(to);
      return r.ok ? r.json() : null;
    }).catch(() => {
      clearTimeout(to);
      return null;
    });
  }
  function fetchArtwork(artist, song, album) {
    const cleanA = (artist || "").replace(/^by\s+/i, "").trim();
    const cleanS = cleanTrack(song || "");
    if (!cleanA || !cleanS) return Promise.resolve("");
    const ck = (cleanA + "|" + cleanS).toLowerCase();
    if (artCache[ck]) return Promise.resolve(artCache[ck]);
    const deezerUrl = "https://api.deezer.com/search?q=" + encodeURIComponent('artist:"' + cleanA.replace(/"/g, "") + '" track:"' + cleanS.replace(/"/g, "") + '"') + "&limit=1";
    const itunesUrl = "https://itunes.apple.com/search?term=" + encodeURIComponent(cleanA + " " + cleanS) + "&entity=song&limit=3";
    return Promise.all([
      fetchJSON(deezerUrl).then((d) => d && d.data && d.data[0] && d.data[0].album ? d.data[0].album.cover_xl || d.data[0].album.cover_big || "" : ""),
      fetchJSON(itunesUrl).then((d) => {
        if (d && d.results) {
          for (let i = 0; i < d.results.length; i++) {
            const a = d.results[i].artworkUrl100 || d.results[i].artworkUrl60;
            if (a) return a.replace("100x100bb", "1000x1000bb").replace("100x100", "1000x1000");
          }
        }
        return "";
      })
    ]).then((r) => {
      const art = r[0] || r[1] || "";
      if (art) artCache[ck] = art;
      return art;
    }).catch(() => "");
  }
  function lyricsMatch(it, artist, track, album, dur) {
    if (!it || !it.syncedLyrics) return -1;
    const at = normTitle(it.trackName || it.name), qt = normTitle(track);
    const aa = normArtist(it.artistName), qa = normArtist(artist);
    if (!at || !qt || !aa || !qa) return -1;
    if (!(at === qt || at.indexOf(qt) !== -1 || qt.indexOf(at) !== -1)) return -1;
    if (!(aa === qa || aa.indexOf(qa) !== -1 || qa.indexOf(aa) !== -1)) return -1;
    let sc = (at === qt ? 50 : 26) + (aa === qa ? 36 : 18) + 10;
    if (album && it.albumName) {
      const al = normTitle(it.albumName), q2 = normTitle(album);
      if (al === q2) sc += 14;
      else if (al.indexOf(q2) !== -1 || q2.indexOf(al) !== -1) sc += 6;
    }
    if (dur && it.duration) {
      const dd = Math.abs(Number(it.duration) - dur);
      if (dd <= 1) sc += 32;
      else if (dd <= 2.5) sc += 22;
      else if (dd <= 5) sc += 12;
      else if (dd <= 9) sc += 2;
      else if (dd > 14) sc -= 20;
    }
    return sc;
  }
  function fetchLyrics(artist, track, dur, album) {
    const ck = (artist || "").toLowerCase() + "|" + (track || "").toLowerCase() + "|" + Math.round(dur || 0);
    const c = lyrCache[ck];
    if (c && Date.now() - c.t < 6048e5) return Promise.resolve(c.l);
    const cT = cleanTrack(track);
    const a = primaryArtist(artist);
    const al = album || "";
    const L = "https://lrclib.net/api/";
    const urls = [L + "search?artist_name=" + encodeURIComponent(a) + "&track_name=" + encodeURIComponent(cT)];
    return Promise.all(urls.map((u) => fetchJSON(u, 6e3))).then((res) => {
      let best = null, bs = -1;
      function add(it) {
        const sc = lyricsMatch(it, a, track, al, dur);
        if (sc > bs) {
          bs = sc;
          best = it;
        }
      }
      res.forEach((r) => {
        if (Array.isArray(r)) r.forEach(add);
        else if (r) add(r);
      });
      const lines = best && bs >= 52 ? parseLrc(best.syncedLyrics) : [];
      if (lines.length) {
        lyrCache[ck] = { l: lines, t: Date.now() };
        saveLyrCache();
      }
      return lines;
    }).catch(() => []);
  }
  function wSpans(t) {
    return String(t).trim().split(/\s+/).filter(Boolean).map((w) => '<span class="w">' + esc(w) + "</span>").join(" ");
  }
  function lineHtml(l, i, active2, modal) {
    return '<p class="' + (modal ? "lyr-line" : "lyric-line") + (l.instrumental ? " instrumental" : "") + (active2 ? " active" : "") + '" data-idx="' + i + '">' + (l.instrumental ? "instrumental" : wSpans(l.text)) + "</p>";
  }
  function renderTrack(l) {
    const track = $("lyricsTrack");
    if (!track) return;
    track.style.transform = "translateY(0)";
    track.innerHTML = !l ? "" : !l.length ? '<p class="lyric-line active">no lyrics found</p>' : l.map((x, i) => lineHtml(x, i, i === 0, false)).join("");
  }
  function buildList() {
    const list = $("lyricsList");
    if (!list) return;
    list.innerHTML = S.disp.length ? S.disp.map((l, i) => lineHtml(l, i, false, true)).join("") : '<p class="lyr-line empty">no lyrics found for this track</p>';
  }
  function padList() {
    const scroll = $("lyricsScroll");
    const list = $("lyricsList");
    if (!scroll || !list) return;
    const h = Math.round(scroll.clientHeight / 2);
    list.style.paddingTop = Math.min(24, h) + "px";
    list.style.paddingBottom = Math.max(80, h) + "px";
  }
  function syncModal(idx, smooth) {
    const scroll = $("lyricsScroll");
    const list = $("lyricsList");
    if (!scroll || !list) return;
    const els = list.children;
    if (!S.disp.length || !els.length) return;
    for (let i = 0; i < els.length; i++) {
      els[i].classList.toggle("active", i === idx);
      els[i].classList.toggle("passed", i < idx);
    }
    const a = els[idx];
    if (!a) return;
    const max = scroll.scrollHeight - scroll.clientHeight;
    if (max <= 0) return;
    let t = a.offsetTop - scroll.clientHeight / 2 + a.offsetHeight / 2;
    t = Math.max(0, Math.min(t, max));
    if (smooth) {
      try {
        scroll.scrollTo({ top: t, behavior: "smooth" });
      } catch (e) {
        scroll.scrollTop = t;
      }
    } else {
      scroll.scrollTop = t;
    }
  }
  function resetWords(c) {
    if (!c) return;
    const w = c.querySelectorAll(".w");
    for (let i = 0; i < w.length; i++) {
      w[i].style.opacity = "";
      w[i].classList.remove("now");
    }
  }
  function updWords(c, idx, sec) {
    if (!c) return;
    const l = S.disp[idx];
    if (!l || l.instrumental) return;
    const el = c.children[idx];
    if (!el) return;
    const ws = el.querySelectorAll(".w"), ts = l.wordTimings;
    if (!ts) return;
    const n = Math.min(ws.length, ts.length);
    for (let i = 0; i < n; i++) {
      const wt = ts[i];
      const op = sec <= wt.start ? 0.32 : sec >= wt.end ? 1 : 0.32 + (sec - wt.start) / (wt.end - wt.start) * 0.68;
      ws[i].style.opacity = op.toFixed(3);
      ws[i].classList.toggle("now", sec >= wt.start && sec < wt.end);
    }
  }
  function loop() {
    S.raf = requestAnimationFrame(loop);
    const now = performance.now();
    if (now - S.lastTick < 28) return;
    S.lastTick = now;
    updSongTime();
    if (!S.disp.length) return;
    const sec = Math.max(0, discordSec() - C.off);
    const idx = findIdx(sec);
    const track = $("lyricsTrack");
    const list = $("lyricsList");
    if (idx !== S.idx) {
      S.idx = idx;
      if (track) {
        resetWords(track);
        const els = track.children;
        for (let j = 0; j < els.length; j++) els[j].classList.toggle("active", j === idx);
        track.style.transform = "translateY(" + -idx * 38 + "px)";
      }
      if (S.modalOpen && list) {
        resetWords(list);
        syncModal(idx, true);
      }
    }
    if (track) updWords(track, idx, sec);
    if (S.modalOpen && list) updWords(list, idx, sec);
  }
  function startLoop2() {
    if (!S.raf) S.raf = requestAnimationFrame(loop);
  }
  function stopLoop() {
    if (S.raf) cancelAnimationFrame(S.raf);
    S.raf = null;
  }
  function resetLyrics() {
    S.disp = [];
    S.idx = -1;
    S.reqId++;
  }
  function setLyrics(l) {
    S.disp = buildDisplay(l);
    S.idx = -1;
    renderTrack(S.disp);
    buildList();
    padList();
    if (S.modalOpen) {
      requestAnimationFrame(() => syncModal(S.idx < 0 ? 0 : S.idx, false));
    }
  }
  function openLyrics() {
    if (!S.sp) return;
    S.modalOpen = true;
    const overlay = $("lyricsOverlay");
    if (overlay) overlay.classList.add("show");
    document.body.classList.add("locked");
    buildList();
    padList();
    updSongTime();
    const target = S.idx < 0 ? 0 : S.idx;
    syncModal(target, false);
    requestAnimationFrame(() => syncModal(target, false));
  }
  function exitFs() {
    try {
      const ex = document.exitFullscreen || document.webkitExitFullscreen;
      if (ex && (document.fullscreenElement || document.webkitFullscreenElement)) {
        const r = ex.call(document);
        if (r && r.catch) r.catch(() => {
        });
      }
    } catch (e) {
    }
  }
  function closeLyrics() {
    if (!S.modalOpen) return;
    S.modalOpen = false;
    const overlay = $("lyricsOverlay");
    if (overlay) overlay.classList.remove("show");
    document.body.classList.remove("locked");
    exitFs();
  }
  function applySp(sp) {
    S.sp = sp;
    const np = $("nowPlaying");
    if (np) {
      np.hidden = false;
      np.classList.add("in");
    }
    const sName = sp.song || "";
    const aName = sp.artist ? sp.artist.replace(/^by\s+/i, "") : "";
    const songEl = $("nowSong"), artEl = $("nowArtist");
    const lyrSong = $("lyricsSong"), lyrArt = $("lyricsArtist");
    if (songEl) songEl.textContent = sName;
    if (artEl) artEl.textContent = aName;
    if (lyrSong) lyrSong.textContent = sName;
    if (lyrArt) lyrArt.textContent = aName;
    const k = aName + " - " + sName;
    const isNew = k !== S.songKey;
    if (isNew) {
      S.songKey = k;
      S.spEnd = 0;
      S.lastTs = "";
      const nowArt = $("nowArt");
      const art = safeUrl(sp.album_art_url);
      if (art) {
        if (nowArt) {
          nowArt.src = art;
          nowArt.style.display = "";
        }
        setArt2(art);
        setBgArt(art);
      } else {
        fetchArtwork(aName, sName, sp.album).then((fetchedArt) => {
          if (fetchedArt && S.songKey === k) {
            if (nowArt) {
              nowArt.src = fetchedArt;
              nowArt.style.display = "";
            }
            setArt2(fetchedArt);
            setBgArt(fetchedArt);
          } else {
            if (nowArt) nowArt.src = FB;
            setArt2("");
            setBgArt(DEF_BG);
          }
        });
      }
    }
    if (sp.timestamps) {
      if (sp.timestamps.start) {
        const ns = sp.timestamps.start;
        if (isNew || !S.spStart || Math.abs(ns - S.spStart) > 1500) S.spStart = ns;
      }
      if (sp.timestamps.end) S.spEnd = sp.timestamps.end;
    }
    startLoop2();
    updSongTime();
    setTimeout(scMax, 50);
    if (!isNew) return;
    resetLyrics();
    renderTrack(null);
    const ck = (aName || "").toLowerCase() + "|" + (sName || "").toLowerCase() + "|" + Math.round(spDur());
    const cachedLyr = lyrCache[ck];
    if (cachedLyr && Date.now() - cachedLyr.t < 6048e5 && cachedLyr.l && cachedLyr.l.length) {
      setLyrics(cachedLyr.l);
      return;
    }
    const list = $("lyricsList");
    if (list) list.innerHTML = '<p class="lyr-line empty">loading lyrics\u2026</p>';
    padList();
    const rid = S.reqId;
    const dur = Math.round(spDur());
    fetchLyrics(aName, sName, dur, sp.album || "").then((lines) => {
      if (rid !== S.reqId || !S.sp || S.songKey !== k) return;
      setLyrics(lines);
    });
  }
  function clearNow() {
    S.sp = null;
    S.songKey = "";
    S.spStart = 0;
    S.spEnd = 0;
    S.lastTs = "";
    if ($("nowPlaying")) $("nowPlaying").hidden = true;
    resetLyrics();
    renderTrack(null);
    const list = $("lyricsList");
    if (list) list.innerHTML = '<p class="lyr-line empty">nothing playing right now</p>';
    setArt2("");
    setBgArt("");
    const nowArt = $("nowArt");
    if (nowArt) nowArt.removeAttribute("src");
    if ($("progressFill")) $("progressFill").style.width = "0%";
    if ($("timeCurrent")) $("timeCurrent").textContent = "0:00";
    if ($("timeTotal")) $("timeTotal").textContent = "--:--";
    closeLyrics();
    stopLoop();
    applyAccent([255, 255, 255]);
    setTimeout(scMax, 50);
  }
  function initLyricsModal() {
    const overlay = $("lyricsOverlay");
    const listeningLine = $("listeningLine");
    const fsBtn = $("fsBtn");
    const modal = $("lyricsModal");
    const lyrArt = $("lyricsArt");
    const nowArt = $("nowArt");
    if (overlay) {
      overlay.addEventListener("click", function(e) {
        if (e.target === e.currentTarget) closeLyrics();
      });
    }
    if (listeningLine) {
      listeningLine.addEventListener("click", openLyrics);
      listeningLine.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLyrics();
        }
      });
    }
    if (fsBtn && modal) {
      fsBtn.addEventListener("click", function() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          const req = modal.requestFullscreen || modal.webkitRequestFullscreen;
          if (req) {
            try {
              const r = req.call(modal);
              if (r && r.catch) r.catch(() => {
              });
            } catch (e) {
            }
          }
        } else {
          exitFs();
        }
        setTimeout(() => {
          if (!S.modalOpen) return;
          padList();
          if (S.disp.length && S.idx >= 0) syncModal(S.idx, false);
        }, 400);
      });
    }
    if (lyrArt) {
      lyrArt.addEventListener("load", function() {
        applyAccent(dominantColor(this));
      });
    }
    if (nowArt) {
      nowArt.addEventListener("error", function() {
        this.src = FB;
      });
    }
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && S.modalOpen && !document.fullscreenElement) {
        closeLyrics();
        return;
      }
      if (!S.sp) return;
      if (e.key === "[") C.off -= 0.1;
      else if (e.key === "]") C.off += 0.1;
      else if (e.key === "\\") C.off = 0;
      else return;
      C.off = Math.max(-10, Math.min(10, Math.round(C.off * 100) / 100));
      try {
        localStorage.setItem("sat-off", String(C.off));
      } catch (err) {
      }
      S.idx = -1;
    });
  }

  // src/lanyard.js
  function resolveAsset(a, img) {
    const urls = [];
    img = String(img || "").trim();
    if (!a || !img) return urls;
    if (/^https?:\/\//i.test(img)) {
      urls.push(img);
      return urls;
    }
    if (img.indexOf("//") === 0) {
      urls.push("https:" + img);
      return urls;
    }
    if (img.indexOf("mp:") === 0) {
      const r = img.slice(3);
      urls.push("https://media.discordapp.net/" + r);
      if (r.indexOf("external/") !== 0 && r.indexOf("attachments/") !== 0) {
        urls.push("https://media.discordapp.net/external/" + r);
      }
      return urls;
    }
    if (img.indexOf("spotify:") === 0) {
      urls.push("https://i.scdn.co/image/" + img.slice(8));
      return urls;
    }
    if (a.application_id) {
      const base = "https://cdn.discordapp.com/app-assets/" + a.application_id + "/" + img;
      if (/\.(png|gif|webp|jpe?g)$/i.test(img)) urls.push(base);
      else {
        urls.push(base + (img.indexOf("a_") === 0 ? ".gif" : ".png"));
        urls.push(base + ".gif");
        urls.push(base);
      }
    }
    return urls;
  }
  function getImgs(a) {
    const o = [];
    if (!a || !a.assets) return o;
    ["large_image", "small_image"].forEach((k) => {
      resolveAsset(a, a.assets[k]).forEach((u) => {
        if (!o.includes(u)) o.push(u);
      });
    });
    return o;
  }
  function getPrimary(as) {
    if (!Array.isArray(as)) return null;
    let fb = null;
    for (let i = 0; i < as.length; i++) {
      const a = as[i];
      if (!a || a.type === 2 || a.type === 4) continue;
      if (a.assets && (a.assets.large_image || a.assets.small_image)) return a;
      if (!fb) fb = a;
    }
    return fb;
  }
  function getCustom(as) {
    if (!Array.isArray(as)) return null;
    for (let i = 0; i < as.length; i++) {
      if (as[i] && as[i].type === 4) return as[i];
    }
    return null;
  }
  function fmtEl2(ms) {
    const t = Math.max(0, Math.floor(ms / 1e3));
    const h = Math.floor(t / 3600);
    const m = Math.floor(t % 3600 / 60);
    const s = t % 60;
    return h ? h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") : m + ":" + String(s).padStart(2, "0");
  }
  function updActT() {
    if (S.actStart) {
      const el = $("activityTime");
      if (el) el.textContent = fmtEl2(Date.now() - S.actStart);
    }
  }
  function stopActT() {
    clearInterval(S.actTimer);
    S.actTimer = null;
    S.actStart = 0;
  }
  function act(a) {
    const line = $("activityLine");
    const actArt = $("activityArt");
    if (!line) return;
    if (!a) {
      line.hidden = true;
      stopActT();
      S.actKey = "";
      return;
    }
    const st = a.timestamps ? a.timestamps.start : 0;
    const key = (a.application_id || a.name || "") + ":" + st;
    const changed = key !== S.actKey;
    S.actKey = key;
    const imgs = getImgs(a);
    if (actArt) {
      if (imgs.length) {
        if (actArt.dataset.primary !== imgs[0] || actArt.hidden) {
          actArt.dataset.primary = imgs[0];
          actArt.dataset.fallbacks = JSON.stringify(imgs.slice(1));
          actArt.hidden = false;
          actArt.src = imgs[0];
        }
      } else {
        actArt.dataset.primary = "";
        actArt.dataset.fallbacks = "[]";
        actArt.removeAttribute("src");
        actArt.hidden = true;
      }
    }
    const name = a.name || "";
    const det = a.details || "";
    const stat = a.state || "";
    let main = (VB[a.type] || "Playing") + " <b>" + esc(name) + "</b>";
    let by = "";
    if (det && det !== name) main += " \xB7 " + esc(det);
    if (stat) {
      if (stat.toLowerCase().indexOf("by ") === 0) {
        by = '<div class="activity-by">' + esc(stat.substring(3).replace(/[\u2705\u2611\uFE0F]/g, "").trim()) + ' <img src="https://cdn3.emoji.gg/emojis/663784-robloxverified.png" class="verified-icon" alt="verified" referrerpolicy="no-referrer"></div>';
      } else {
        main += " \xB7 " + esc(stat);
      }
    }
    const actText = $("activityText");
    if (actText) actText.innerHTML = '<div class="activity-main">' + main + "</div>" + by;
    const meta = $("activityMeta");
    if (st && meta) {
      meta.hidden = false;
      if (changed || !S.actTimer) {
        S.actStart = st;
        updActT();
        clearInterval(S.actTimer);
        S.actTimer = setInterval(updActT, 1e3);
      }
    } else if (meta) {
      meta.hidden = true;
      stopActT();
    }
    line.hidden = false;
    line.classList.add("in");
    setTimeout(scMax, 50);
  }
  function custom(s) {
    const c = $("customStatusContainer");
    const e = $("customStatusEmoji");
    if (!c || !e) return;
    if (!s || !s.state && !s.emoji) {
      c.hidden = true;
      return;
    }
    if (s.emoji && s.emoji.id) {
      e.src = "https://cdn.discordapp.com/emojis/" + encodeURIComponent(s.emoji.id) + (s.emoji.animated ? ".gif" : ".png");
      e.hidden = false;
    } else if (s.emoji && s.emoji.name) {
      e.src = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><text x="0" y="13" font-size="13">' + esc(s.emoji.name) + "</text></svg>");
      e.hidden = false;
    } else {
      e.removeAttribute("src");
      e.hidden = true;
    }
    const statText = $("customStatusText");
    if (statText) statText.textContent = s.state || "";
    c.hidden = false;
    c.classList.add("in");
    setTimeout(scMax, 50);
  }
  function presence(p) {
    const u = p.discord_user;
    if (u) {
      const avUrl = u.avatar ? "https://cdn.discordapp.com/avatars/" + encodeURIComponent(u.id) + "/" + encodeURIComponent(u.avatar) + (u.avatar.indexOf("a_") === 0 ? ".gif" : ".png") + "?size=512" : FB;
      const av = $("avatar");
      if (av) av.src = avUrl;
      const dn = $("displayName");
      if (dn) dn.textContent = u.global_name || u.display_name || "Sativa";
      const ht = $("handleText");
      if (ht) ht.textContent = "@" + u.username;
    }
    const sd = $("statusDot");
    if (sd) sd.innerHTML = SI[p.discord_status] || SI.offline;
    act(getPrimary(p.activities));
    custom(getCustom(p.activities));
    let sp = null;
    if (p.listening_to_spotify && p.spotify) {
      sp = p.spotify;
    } else if (Array.isArray(p.activities)) {
      for (let i = 0; i < p.activities.length; i++) {
        const a = p.activities[i];
        if (a && (a.type === 2 || a.name === "Spotify" || a.name === "Apple Music" || a.name === "YouTube Music")) {
          const song = a.details || a.name || "";
          const artist = a.state ? a.state.replace(/^by\s+/i, "") : "";
          let artUrl = "";
          const imgs = getImgs(a);
          if (imgs.length) artUrl = imgs[0];
          sp = { song, artist, album: a.assets ? a.assets.large_text : "", album_art_url: artUrl, timestamps: a.timestamps };
          break;
        }
      }
    }
    if (sp && (sp.song || sp.artist)) {
      applySp(sp);
    } else {
      if (S.sp) clearNow();
    }
    cSet(CK_P, p);
    setTimeout(scMax, 100);
  }
  function pollLanyard() {
    fetch("https://api.lanyard.rest/v1/users/" + C.id, { cache: "no-store", referrerPolicy: "no-referrer" }).then((r) => r.ok ? r.json() : null).then((res) => {
      if (res && res.success && res.data) presence(res.data);
    }).catch(() => {
    });
  }
  function connect() {
    pollLanyard();
    if (!S.apiTimer) S.apiTimer = setInterval(pollLanyard, 3e3);
    let ws;
    try {
      ws = new WebSocket("wss://api.lanyard.rest/socket");
    } catch (e) {
      return;
    }
    S.sock = ws;
    ws.onopen = () => {
    };
    ws.onmessage = (ev) => {
      let p;
      try {
        p = JSON.parse(ev.data);
      } catch (e) {
        return;
      }
      if (p.op === 1) {
        try {
          ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: C.id } }));
        } catch (e) {
        }
        clearInterval(S.hb);
        S.hb = setInterval(() => {
          if (ws.readyState === 1) ws.send(JSON.stringify({ op: 3 }));
        }, p.d && p.d.heartbeat_interval || 3e4);
      }
      if ((p.t === "INIT_STATE" || p.t === "PRESENCE_UPDATE") && p.d) presence(p.d);
    };
    ws.onclose = () => {
      clearInterval(S.hb);
    };
    ws.onerror = () => {
      try {
        ws.close();
      } catch (e) {
      }
    };
    const actArt = $("activityArt");
    if (actArt) {
      actArt.addEventListener("error", function() {
        let l = [];
        try {
          l = JSON.parse(actArt.dataset.fallbacks || "[]");
        } catch (e) {
        }
        if (l.length) {
          actArt.dataset.fallbacks = JSON.stringify(l.slice(1));
          actArt.src = l[0];
          return;
        }
        actArt.removeAttribute("src");
        actArt.hidden = true;
      });
    }
  }

  // src/stats.js
  var API = "/api/lastfm";
  var VAULT = "/api/scrobble";
  var REFRESH_MS = 3e5;
  var loaded = false;
  var timer = null;
  async function getJSON(url) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 7e3);
    try {
      const r = await fetch(url, { headers: { Accept: "application/json" }, signal: ctl.signal });
      if (!r.ok) return null;
      const j = await r.json();
      return j && j.ok === true ? j : null;
    } catch (e) {
      return null;
    } finally {
      clearTimeout(t);
    }
  }
  function set(id, v) {
    const el = $(id);
    if (el) el.textContent = v;
  }
  function renderStats(st, counts, exact) {
    const plus = exact ? "" : "+";
    set("statScrobbles", fmtNum(st.scrobbles));
    set("statArtists", counts && counts.artists != null ? fmtNum(counts.artists) + plus : "\u2014");
    set("statTracks", counts && counts.tracks != null ? fmtNum(counts.tracks) + plus : "\u2014");
    set("statAlbums", counts && counts.albums != null ? fmtNum(counts.albums) + plus : "\u2014");
    set("statAvg", st.avgPerDay != null ? fmtNum(st.avgPerDay) : "\u2014");
    set("statDays", st.days != null ? fmtNum(st.days) : "\u2014");
    const wrap = $("statTopArtist");
    const name = $("statTopArtistName");
    if (wrap && name) {
      const v = st.topArtist || "";
      wrap.hidden = !v;
      name.textContent = v;
    }
    const grid = $("statGrid");
    if (grid) grid.classList.toggle("is-loaded", true);
    const exactNote = $("statsExact");
    if (exactNote) {
      exactNote.hidden = exact === true;
      exactNote.textContent = "distinct counts are a lower bound";
    }
  }
  function renderRecent(rows) {
    const el = $("recentList");
    if (!el) return;
    if (!rows || !rows.length) {
      el.innerHTML = '<p class="rp-empty">nothing played yet</p>';
      return;
    }
    el.innerHTML = rows.map(function(r) {
      const live = r.now ? " is-live" : "";
      const art = safeUrl(r.art) ? '<img class="rp-art" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="' + esc(safeUrl(r.art)) + '">' : '<span class="rp-art rp-art-ph" aria-hidden="true"></span>';
      const when = r.now ? "now" : timeAgo(r.ts);
      return '<a class="rp-row' + live + '"' + (safeUrl(r.url) ? ' href="' + esc(safeUrl(r.url)) + '" target="_blank" rel="noopener noreferrer"' : "") + ">" + art + '<span class="rp-txt"><span class="rp-name">' + esc(String(r.name || "").slice(0, 90)) + '</span><span class="rp-artist">' + esc(String(r.artist || "").slice(0, 90)) + '</span></span><span class="rp-when">' + esc(when) + "</span></a>";
    }).join("");
  }
  function rankRows(rows) {
    if (!rows || !rows.length) return '<p class="rp-empty">no data</p>';
    return rows.map(function(r, i) {
      const art = safeUrl(r.art) ? '<img alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="' + esc(safeUrl(r.art)) + '">' : '<span class="rk-art rk-art-ph" aria-hidden="true"></span>';
      const tag = safeUrl(r.url) ? '<a class="rk-row" href="' + esc(safeUrl(r.url)) + '" target="_blank" rel="noopener noreferrer">' : '<div class="rk-row">';
      const end = safeUrl(r.url) ? "</a>" : "</div>";
      return tag + '<span class="rk-n">' + (i + 1) + '</span><span class="rk-art">' + art + '</span><span class="rk-txt"><span class="rk-name">' + esc(String(r.name || "").slice(0, 80)) + "</span>" + (r.artist ? '<span class="rk-sub">' + esc(String(r.artist).slice(0, 80)) + "</span>" : "") + '</span><span class="rk-plays">' + esc(fmtNum(r.plays)) + "</span>" + end;
    }).join("");
  }
  function renderAlbums(rows) {
    const el = $("topAlbumsList");
    if (!el) return;
    if (!rows || !rows.length) {
      el.innerHTML = '<p class="rp-empty">no data</p>';
      return;
    }
    el.innerHTML = rows.map(function(r) {
      const art = safeUrl(r.art) ? '<img alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="' + esc(safeUrl(r.art)) + '">' : '<span class="al-art al-art-ph" aria-hidden="true"></span>';
      const inner = '<span class="al-art">' + art + '</span><span class="al-name">' + esc(String(r.name || "").slice(0, 70)) + '</span><span class="al-artist">' + esc(String(r.artist || "").slice(0, 70)) + '</span><span class="al-plays">' + esc(fmtNum(r.plays)) + " plays</span>";
      return safeUrl(r.url) ? '<a class="al-card" href="' + esc(safeUrl(r.url)) + '" target="_blank" rel="noopener noreferrer">' + inner + "</a>" : '<div class="al-card">' + inner + "</div>";
    }).join("");
  }
  function markSource(label) {
    const el = $("statsSource");
    if (el) {
      el.textContent = label;
      el.dataset.src = label === "last.fm" ? "lf" : "vault";
    }
  }
  async function load() {
    const parts = await Promise.all([
      getJSON(API + "?part=stats"),
      getJSON(API + "?part=counts"),
      getJSON(API + "?part=artists"),
      getJSON(API + "?part=albums"),
      getJSON(API + "?part=recent")
    ]);
    const statsPart = parts[0];
    if (statsPart && statsPart.stats) {
      markSource("last.fm");
      const counts = parts[1] && parts[1].counts ? parts[1].counts : {};
      const exact = parts[1] ? parts[1].exact === true : false;
      const topArtist = parts[2] && parts[2].topArtists && parts[2].topArtists[0];
      renderStats(
        Object.assign({}, statsPart.stats, { topArtist: topArtist ? topArtist.name : "" }),
        Object.assign({ artists: 0, tracks: 0, albums: 0 }, counts),
        exact
      );
      renderRecent(parts[4] && parts[4].recent);
      const artistsEl2 = $("topArtistsList");
      if (artistsEl2) artistsEl2.innerHTML = rankRows(parts[2] && parts[2].topArtists);
      renderAlbums(parts[3] && parts[3].topAlbums);
      setTimeout(scMax, 80);
      return;
    }
    const vault = await getJSON(VAULT);
    if (!vault || !vault.stats) {
      const el = $("statsEmpty");
      if (el) {
        el.hidden = false;
        el.textContent = "listening stats are unavailable right now";
      }
      markSource("unavailable");
      return;
    }
    markSource("this site");
    renderStats(vault.stats, { artists: vault.stats.artists, tracks: vault.stats.tracks, albums: 0 }, true);
    const artistsEl = $("topArtistsList");
    if (artistsEl) artistsEl.innerHTML = rankRows(vault.topArtists);
    renderAlbums([]);
    renderRecent(vault.recent);
    setTimeout(scMax, 80);
  }
  function refresh() {
    load().catch(() => toast("could not refresh listening stats", true));
  }
  function initStats() {
    const section = document.querySelector('[data-view="music"]');
    const grid = $("statGrid");
    if (!section || !grid) return;
    function begin() {
      if (loaded) return;
      loaded = true;
      refresh();
      clearInterval(timer);
      timer = setInterval(refresh, REFRESH_MS);
    }
    if (typeof IntersectionObserver === "function") {
      const io = new IntersectionObserver(
        function(entries) {
          for (let i = 0; i < entries.length; i++) {
            if (!entries[i].isIntersecting) continue;
            begin();
            io.disconnect();
            return;
          }
        },
        { threshold: 0.05 }
      );
      io.observe(section);
    } else {
      begin();
    }
  }

  // src/games.js
  var PADDLE_FRAC = 0.15;
  var BALL_REF_R = 0.021;
  var COLS = 8;
  var ROWS = 5;
  var GAP = 5;
  var SIDE = 10;
  var TRAIL = 8;
  var START_LIVES = 3;
  var ROWS_SPEC = [
    { hp: 1, pts: 50, c: "#00f0ff" },
    { hp: 1, pts: 50, c: "#39ff88" },
    { hp: 2, pts: 90, c: "#ffd93d" },
    { hp: 3, pts: 140, c: "#ff9f43" },
    { hp: 3, pts: 180, c: "#ff2a55" }
  ];
  var POWERS = {
    expand: { label: "WIDE", c: "#39ff88" },
    shrink: { label: "SMALL", c: "#ff9f43" },
    multi: { label: "MULTI", c: "#00f0ff" },
    slow: { label: "SLOW", c: "#b28dff" },
    life: { label: "LIFE", c: "#ff2a55" }
  };
  function initGames() {
    const cv = document.getElementById("arcadeCanvas");
    const wrap = document.getElementById("arcadeWrap");
    if (!cv || !wrap) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const ov = document.getElementById("arcadeOverlay");
    const ovTitle = document.getElementById("arcadeTitle");
    const ovHint = document.getElementById("arcadeHint");
    const startBtn = document.getElementById("arcadeStartBtn");
    const scoreEl = document.getElementById("arcadeScore");
    const bestEl = document.getElementById("arcadeBest");
    const livesEl = document.getElementById("arcadeLives");
    const levelEl = document.getElementById("arcadeLevel");
    let W2 = 580;
    let H = 220;
    let dpr = 1;
    let state = "idle";
    let score = 0;
    let lives = START_LIVES;
    let level = 1;
    let best = 0;
    let combo = 0;
    let raf = 0;
    let last = 0;
    let shake = 0;
    let flash = 0;
    let slowT = 0;
    let expandT = 0;
    let bricks = [];
    let balls = [];
    let drops = [];
    let debris = [];
    const steer = { x: 0, active: false };
    const paddle = { x: 0, w: 84, h: 12, y: 0, vx: 0, baseW: 84 };
    const keys = /* @__PURE__ */ Object.create(null);
    try {
      best = parseInt(localStorage.getItem("sat-arcade-best") || "0", 10) || 0;
    } catch (e) {
      best = 0;
    }
    function hud() {
      if (scoreEl) scoreEl.textContent = String(score);
      if (bestEl) bestEl.textContent = String(Math.max(best, score));
      if (livesEl) {
        livesEl.textContent = "x" + lives;
      }
      if (levelEl) levelEl.textContent = String(level);
    }
    function banner(title, hint, btn) {
      if (ovTitle) ovTitle.textContent = title;
      if (ovHint) ovHint.textContent = hint;
      if (startBtn) startBtn.textContent = btn;
      if (ov) ov.style.display = "flex";
    }
    function resize() {
      const r = wrap.getBoundingClientRect();
      const cw = Math.max(240, Math.round(r.width));
      const ch = Math.max(160, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(cw * dpr);
      cv.height = Math.round(ch * dpr);
      const sx = cw / (W2 || cw);
      W2 = cw;
      H = ch;
      for (let i = 0; i < bricks.length; i++) {
        bricks[i].x *= sx;
        bricks[i].w *= sx;
      }
      paddle.baseW = Math.max(52, Math.round(W2 * PADDLE_FRAC));
      paddle.w = expandT > 0 ? Math.round(paddle.baseW * 1.45) : paddle.baseW;
      paddle.h = Math.max(9, Math.round(H * 0.045));
      paddle.y = H - paddle.h - Math.round(H * 0.06);
      paddle.x = Math.max(0, Math.min(W2 - paddle.w, paddle.x || (W2 - paddle.w) / 2));
    }
    function makeBall(x, y, vx, vy) {
      return { x, y, vx, vy, r: Math.max(4, Math.round(H * BALL_REF_R)), trail: [] };
    }
    function brickGeom() {
      const bw = (W2 - SIDE * 2 - GAP * (COLS - 1)) / COLS;
      const bh = Math.max(9, Math.round(H * 0.045));
      const top = Math.round(H * 0.14);
      return { bw, bh, top };
    }
    function buildLevel() {
      const { bw, bh, top } = brickGeom();
      bricks = [];
      for (let r = 0; r < ROWS; r++) {
        const spec = ROWS_SPEC[ROWS - 1 - r];
        const inset = level % 2 === 1 && r % 2 === 1 ? bw * 0.5 : 0;
        for (let c = 0; c < COLS; c++) {
          const x = SIDE + inset + c * (bw + GAP);
          if (x + bw > W2 - SIDE + 0.5) continue;
          bricks.push({
            x,
            y: top + r * (bh + GAP),
            w: bw,
            h: bh,
            hp: spec.hp,
            max: spec.hp,
            pts: spec.pts,
            c: spec.c,
            alive: true,
            hit: 0
          });
        }
      }
    }
    function resetBall() {
      balls = [makeBall(paddle.x + paddle.w / 2, paddle.y - 8, 0, 0)];
      combo = 0;
    }
    function serve() {
      state = "launch";
      resetBall();
      if (ov) ov.style.display = "none";
      last = performance.now();
      hud();
    }
    function start() {
      score = 0;
      lives = START_LIVES;
      level = 1;
      slowT = 0;
      expandT = 0;
      drops = [];
      debris = [];
      shake = 0;
      buildLevel();
      paddle.w = paddle.baseW;
      paddle.x = (W2 - paddle.w) / 2;
      serve();
      last = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }
    function togglePause() {
      if (state === "play") {
        state = "paused";
        banner("PAUSED", "Press P or click to resume", "RESUME");
      } else if (state === "paused") {
        state = "play";
        if (ov) ov.style.display = "none";
        last = performance.now();
      }
    }
    function loseLife() {
      lives -= 1;
      combo = 0;
      shake = 9;
      flash = 1;
      if (lives <= 0) {
        state = "over";
        cancelAnimationFrame(raf);
        if (score > best) {
          best = score;
          try {
            localStorage.setItem("sat-arcade-best", String(best));
          } catch (e) {
          }
        }
        banner("GAME OVER", "Score " + score + " \xB7 press to run it back", "PLAY AGAIN");
        hud();
        return;
      }
      serve();
      hud();
    }
    function advance() {
      level += 1;
      slowT = 0;
      expandT = 0;
      paddle.w = paddle.baseW;
      drops = [];
      debris = [];
      buildLevel();
      serve();
    }
    function shatter(b) {
      const n = 9;
      for (let i = 0; i < n; i++) {
        const a = Math.PI * 2 * i / n + Math.random() * 0.5;
        const sp = 40 + Math.random() * 130;
        debris.push({
          x: b.x + b.w / 2,
          y: b.y + b.h / 2,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0.5 + Math.random() * 0.35,
          max: 0.85,
          c: b.c,
          s: 1.5 + Math.random() * 2.5
        });
      }
      if (Math.random() < 0.11) {
        const keys2 = Object.keys(POWERS);
        drops.push({
          x: b.x + b.w / 2,
          y: b.y + b.h / 2,
          w: Math.max(30, W2 * 0.09),
          h: Math.max(11, H * 0.055),
          v: H * 0.24,
          kind: keys2[Math.floor(Math.random() * keys2.length)],
          a: 0
        });
      }
    }
    function applyPower(kind) {
      if (kind === "expand") {
        expandT = 12e3;
        paddle.w = Math.round(paddle.baseW * 1.45);
      } else if (kind === "shrink") {
        expandT = 0;
        paddle.w = Math.round(paddle.baseW * 0.72);
      } else if (kind === "multi") {
        const src = balls[0];
        if (src) {
          for (let i = 0; i < 2; i++) {
            const spread = (i === 0 ? 1 : -1) * (0.5 + Math.random() * 0.35);
            const sp = Math.hypot(src.vx, src.vy) || H;
            const ang = Math.atan2(src.vy, src.vx) + spread;
            balls.push(makeBall(src.x, src.y, Math.cos(ang) * sp, Math.sin(ang) * sp));
          }
        }
      } else if (kind === "slow") {
        slowT = 7e3;
      } else if (kind === "life") {
        lives = Math.min(9, lives + 1);
        hud();
      }
      clampPaddle();
    }
    function clampPaddle() {
      paddle.x = Math.max(0, Math.min(W2 - paddle.w, paddle.x));
    }
    function brickHit(b) {
      b.hp -= 1;
      b.hit = 1;
      if (b.hp > 0) return;
      b.alive = false;
      combo += 1;
      const mult = Math.min(8, 1 + Math.floor(combo / 4));
      score += b.pts * mult;
      shatter(b);
      hud();
    }
    function step(dt) {
      const speedScale = slowT > 0 ? 0.58 : 1;
      if (slowT > 0) slowT -= dt;
      if (expandT > 0) {
        expandT -= dt;
        if (expandT <= 0) {
          paddle.w = paddle.baseW;
          clampPaddle();
        }
      }
      const accel = W2 * 3.4;
      let dir = 0;
      if (keys.ArrowLeft || keys.KeyA) dir -= 1;
      if (keys.ArrowRight || keys.KeyD) dir += 1;
      if (dir) {
        paddle.vx += dir * accel * dt;
        paddle.x += paddle.vx * dt;
        paddle.vx *= 0.86;
      } else {
        paddle.vx *= 0.7;
        if (steer.active) paddle.x = steer.x;
      }
      clampPaddle();
      const base = H * 1.08 + (level - 1) * H * 0.06;
      const cap = H * 2.15;
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        if (state !== "play") {
          if (state === "launch") {
            b.x = paddle.x + paddle.w / 2;
            b.y = paddle.y - b.r - 2;
          }
          b.trail.length = 0;
          continue;
        }
        let sp = Math.hypot(b.vx, b.vy);
        if (sp > 1e-4) {
          const want = Math.min(cap, Math.max(H * 0.5, base)) * speedScale;
          const k = want / sp;
          b.vx *= k;
          b.vy *= k;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > TRAIL) b.trail.shift();
        if (b.x - b.r < 0) {
          b.x = b.r;
          b.vx = Math.abs(b.vx);
        } else if (b.x + b.r > W2) {
          b.x = W2 - b.r;
          b.vx = -Math.abs(b.vx);
        }
        if (b.y - b.r < 0) {
          b.y = b.r;
          b.vy = Math.abs(b.vy);
        }
        if (b.vy > 0 && b.y + b.r >= paddle.y && b.y - b.r <= paddle.y + paddle.h) {
          if (b.x >= paddle.x - b.r && b.x <= paddle.x + paddle.w + b.r) {
            const rel = (b.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
            const ang = rel * 1.15;
            const sp2 = Math.max(H * 0.5, Math.hypot(b.vx, b.vy)) * 1.005;
            b.vx = Math.sin(ang) * sp2;
            b.vy = -Math.cos(ang) * sp2;
            b.y = paddle.y - b.r - 0.5;
            combo = 0;
            shake = Math.max(shake, 1.6);
          }
        }
        for (let j = 0; j < bricks.length; j++) {
          const k = bricks[j];
          if (!k.alive) continue;
          if (b.x + b.r < k.x || b.x - b.r > k.x + k.w || b.y + b.r < k.y || b.y - b.r > k.y + k.h) continue;
          const ox = Math.min(b.x + b.r - k.x, k.x + k.w - (b.x - b.r));
          const oy = Math.min(b.y + b.r - k.y, k.y + k.h - (b.y - b.r));
          if (ox < oy) b.vx = -b.vx;
          else b.vy = -b.vy;
          brickHit(k);
          break;
        }
        if (b.y - b.r > H) {
          balls.splice(i, 1);
        }
      }
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.y += d.v * dt;
        d.a += dt * 2.2;
        const hitPaddle = d.y + d.h >= paddle.y && d.y <= paddle.y + paddle.h && d.x + d.w > paddle.x && d.x < paddle.x + paddle.w;
        if (hitPaddle) {
          applyPower(d.kind);
          drops.splice(i, 1);
        } else if (d.y > H) {
          drops.splice(i, 1);
        }
      }
      for (let i = debris.length - 1; i >= 0; i--) {
        const p = debris[i];
        p.life -= dt;
        if (p.life <= 0) {
          debris.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += H * 1.5 * dt;
        p.vx *= 0.99;
      }
      for (let i = 0; i < bricks.length; i++) if (bricks[i].hit > 0) bricks[i].hit = Math.max(0, bricks[i].hit - dt * 5);
      if (balls.length === 0) {
        loseLife();
        return;
      }
      let left = 0;
      for (let i = 0; i < bricks.length; i++) if (bricks[i].alive) left++;
      if (left === 0 && state === "play") {
        state = "clear";
        score += 250 * level;
        hud();
        banner("LEVEL " + level + " CLEAR", "Next level is faster", "CONTINUE");
      }
    }
    function roundRect(x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W2, H);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0b0d14");
      g.addColorStop(1, "#05060a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W2, H);
      ctx.save();
      if (shake > 0.05) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.028)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < W2; x += 22) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, H);
      }
      for (let y = 0; y < H; y += 22) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(W2, y + 0.5);
      }
      ctx.stroke();
      for (let i = 0; i < bricks.length; i++) {
        const b = bricks[i];
        if (!b.alive) continue;
        const dmg = 1 - b.hp / b.max;
        ctx.globalAlpha = 1;
        ctx.shadowColor = b.c;
        ctx.shadowBlur = b.hit > 0 ? 22 : 9;
        ctx.fillStyle = b.c;
        ctx.globalAlpha = b.hit > 0 ? 1 : 0.42 + dmg * 0.5;
        roundRect(b.x, b.y, b.w, b.h, 3);
        ctx.fill();
        if (b.max > 1) {
          ctx.globalAlpha = 0.5;
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(0,0,0,0.55)";
          ctx.fillRect(b.x, b.y, b.w * b.hp / b.max, b.h);
        }
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const c = POWERS[d.kind].c;
        ctx.save();
        ctx.translate(d.x + d.w / 2, d.y + d.h / 2);
        ctx.rotate(Math.sin(d.a) * 0.25);
        ctx.shadowColor = c;
        ctx.shadowBlur = 14;
        ctx.fillStyle = c;
        roundRect(-d.w / 2, -d.h / 2, d.w, d.h, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(0,0,0,0.78)";
        ctx.font = "700 " + Math.max(7, Math.round(d.h * 0.62)) + "px Satoshi, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(POWERS[d.kind].label, 0, 0.5);
        ctx.restore();
      }
      for (let i = 0; i < debris.length; i++) {
        const p = debris[i];
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
      ctx.globalAlpha = 1;
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#ffffff";
      roundRect(paddle.x, paddle.y, paddle.w, paddle.h, paddle.h / 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        for (let t = 0; t < b.trail.length; t++) {
          const q = b.trail[t];
          const a = t / b.trail.length * 0.5;
          ctx.globalAlpha = a;
          ctx.fillStyle = "#8fe9ff";
          ctx.beginPath();
          ctx.arc(q.x, q.y, b.r * t / b.trail.length, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowColor = "#7fdfff";
        ctx.shadowBlur = 16;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      if (combo > 2) {
        ctx.fillStyle = "rgba(255,255,255,0.72)";
        ctx.font = "700 11px Satoshi, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("x" + Math.min(8, 1 + Math.floor(combo / 4)) + " COMBO", W2 / 2, 4);
      }
      ctx.restore();
      if (flash > 0) {
        ctx.fillStyle = "rgba(255,42,85," + (flash * 0.28).toFixed(3) + ")";
        ctx.fillRect(0, 0, W2, H);
      }
    }
    function frame(now) {
      if (state === "over") return;
      raf = requestAnimationFrame(frame);
      let dt = (now - last) / 1e3;
      last = now;
      if (!isFinite(dt) || dt < 0) dt = 0;
      if (dt > 1 / 30) dt = 1 / 30;
      if (shake > 0) shake = Math.max(0, shake - dt * 26);
      if (flash > 0) flash = Math.max(0, flash - dt * 2.6);
      if (state !== "paused") step(dt);
      draw();
    }
    function pointTo(e) {
      const r = cv.getBoundingClientRect();
      steer.x = (e.clientX - r.left) / r.width * W2 - paddle.w / 2;
      steer.active = true;
    }
    cv.addEventListener("pointermove", (e) => {
      if (state === "play" || state === "launch") pointTo(e);
    });
    cv.addEventListener("pointerdown", (e) => {
      if (state === "play" || state === "launch") pointTo(e);
      if (state === "launch") launchBall();
    });
    cv.addEventListener("pointerleave", () => {
      steer.active = false;
    });
    function onKey(e, down) {
      const c = e.code;
      if (c === "ArrowLeft" || c === "ArrowRight" || c === "KeyA" || c === "KeyD") {
        keys[c] = down;
        if (down && (state === "play" || state === "launch")) e.preventDefault();
        return;
      }
      if (!down) return;
      if (c === "Space" || c === "Enter") {
        if (state === "launch") {
          e.preventDefault();
          launchBall();
        } else if (state === "play") {
          e.preventDefault();
          togglePause();
        } else {
          e.preventDefault();
          activate();
        }
        return;
      }
      if (c === "KeyP" && (state === "play" || state === "paused")) {
        e.preventDefault();
        togglePause();
      }
    }
    window.addEventListener("keydown", (e) => onKey(e, true));
    window.addEventListener("keyup", (e) => onKey(e, false));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state === "play") togglePause();
    });
    function activate() {
      if (state === "paused") togglePause();
      else if (state === "clear") advance();
      else if (state === "over" || state === "idle") start();
    }
    function launchBall() {
      state = "play";
      const b = balls[0];
      if (!b) return;
      const sp = H * 1.08;
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 0.7;
      b.vx = Math.cos(ang) * sp;
      b.vy = Math.sin(ang) * sp;
    }
    if (startBtn) startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      activate();
    });
    if (ov) ov.addEventListener("click", () => activate());
    let rt = null;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        resize();
        if (state === "idle" || state === "over") draw();
      }, 120);
    });
    resize();
    buildLevel();
    resetBall();
    hud();
    draw();
    banner("NEON BREAKER", "Drag or A / D to move \xB7 Space to launch \xB7 P to pause", "START GAME");
  }

  // src/turnstile.js
  var SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  var READY_TIMEOUT_MS = 12e3;
  var loader = null;
  var widgetId = null;
  var token = "";
  var active = false;
  function scriptReady() {
    if (loader) return loader;
    loader = new Promise((resolve, reject) => {
      if (window.turnstile) return resolve(window.turnstile);
      const s = document.createElement("script");
      s.src = SRC;
      s.async = true;
      s.defer = true;
      const timer2 = setTimeout(() => {
        cleanup();
        reject(new Error("turnstile_timeout"));
      }, READY_TIMEOUT_MS);
      function cleanup() {
        clearTimeout(timer2);
        s.onload = null;
        s.onerror = null;
      }
      s.onload = () => {
        cleanup();
        let tries = 0;
        (function wait() {
          if (window.turnstile) return resolve(window.turnstile);
          if (++tries > 40) return reject(new Error("turnstile_absent"));
          setTimeout(wait, 50);
        })();
      };
      s.onerror = () => {
        cleanup();
        reject(new Error("turnstile_blocked"));
      };
      document.head.appendChild(s);
    });
    loader.catch(() => {
      loader = null;
    });
    return loader;
  }
  function clearToken() {
    token = "";
  }
  async function mountTurnstile(mount, siteKey, theme) {
    if (!mount) return false;
    if (!siteKey || siteKey.length < 10) {
      mount.hidden = true;
      return false;
    }
    mount.hidden = false;
    try {
      const api = await scriptReady();
      if (widgetId !== null) {
        try {
          api.remove(widgetId);
        } catch (e) {
        }
        widgetId = null;
      }
      mount.innerHTML = "";
      widgetId = api.render(mount, {
        sitekey: siteKey,
        theme: theme === "light" ? "light" : "dark",
        appearance: "always",
        callback: function(t) {
          token = t;
        },
        "expired-callback": clearToken,
        "error-callback": clearToken,
        "timeout-callback": clearToken,
        "unsupported-callback": clearToken
      });
      active = true;
      return true;
    } catch (e) {
      mount.hidden = true;
      active = false;
      return false;
    }
  }
  function turnstileActive() {
    return active;
  }
  function turnstileToken() {
    return token;
  }
  function resetTurnstile() {
    token = "";
    if (!active || !window.turnstile || widgetId === null) return;
    try {
      window.turnstile.reset(widgetId);
    } catch (e) {
    }
  }

  // src/guestbook.js
  var API2 = "/api/guestbook";
  var NAME_MAX = 32;
  var MSG_MAX = 500;
  var REFRESH_MS2 = 9e4;
  function initGuestbook() {
    const list = $("gbList");
    const form = $("gbForm");
    const nameInput = $("gbAuthor");
    const msgInput = $("gbText");
    const badge = $("gbCountBadge");
    const btn = $("gbSubmit");
    const tsMount = $("gbTurnstile");
    const trap = $("gbTrap");
    const hint = $("gbHint");
    if (!list || !form || !nameInput || !msgInput) return;
    if (nameInput) nameInput.maxLength = NAME_MAX;
    if (msgInput) msgInput.maxLength = MSG_MAX;
    form.setAttribute("novalidate", "");
    let renderedAt = Date.now();
    let offline = false;
    let inFlight = false;
    if (btn) btn.disabled = true;
    function setBusy(on) {
      inFlight = on;
      if (btn) {
        btn.disabled = on;
        btn.textContent = on ? "Signing\u2026" : "Sign Guestbook";
      }
    }
    function renderNotes(notes) {
      if (!list) return;
      if (!notes.length) {
        list.innerHTML = '<p class="gb-empty">no notes yet \u2014 be the first</p>';
        return;
      }
      list.innerHTML = notes.map(function(n) {
        const who = String(n.n || "").slice(0, NAME_MAX);
        const body = String(n.m || "").slice(0, MSG_MAX);
        if (!who || !body) return "";
        return '<article class="gb-entry"><div class="gb-entry-head"><span class="gb-entry-name">' + esc(who) + '</span><time class="gb-entry-time" datetime="' + esc(new Date(Number(n.t) || 0).toISOString()) + '">' + esc(timeAgo(n.t)) + '</time></div><p class="gb-entry-msg">' + esc(body) + "</p></article>";
      }).join("");
      setTimeout(scMax, 60);
    }
    function renderBadges(total) {
      if (badge) badge.textContent = total > 0 ? total + " signature" + (total === 1 ? "" : "s") : "no notes yet";
    }
    function setOffline(on, msg) {
      offline = on;
      if (hint) {
        hint.textContent = msg || "";
        hint.hidden = !msg;
      }
      if (btn) btn.disabled = on || inFlight;
      form.classList.toggle("is-offline", on);
    }
    async function load2(quiet) {
      let r;
      try {
        r = await fetch(API2 + "?limit=40", { headers: { Accept: "application/json" } });
      } catch (e) {
        setOffline(true, "cannot reach the guestbook \u2014 check your connection");
        return;
      }
      let j = null;
      try {
        j = await r.json();
      } catch (e) {
        setOffline(true, "guestbook returned an unreadable response");
        return;
      }
      if (!r.ok || !j || j.ok !== true) {
        const d = j && j.detail ? String(j.detail) : "";
        setOffline(true, d || "guestbook is unavailable right now");
        return;
      }
      setOffline(false, "");
      renderBadges(j.total || 0);
      if (!quiet || !list.childElementCount) renderNotes(Array.isArray(j.notes) ? j.notes : []);
      mountTurnstile(tsMount, j.turnstile && j.turnstile.siteKey || "", "dark").then(function(armed) {
        if (btn) btn.disabled = false;
        if (armed) form.classList.add("is-armed");
        else form.classList.remove("is-armed");
      });
    }
    form.addEventListener("submit", async function(e) {
      e.preventDefault();
      if (inFlight || offline) return;
      const name = nameInput.value.trim().replace(/\s+/g, " ");
      const msg = msgInput.value.trim().replace(/\s+/g, " ");
      if (trap && trap.value.trim() !== "") return;
      if (name.length < 2) {
        toast("name needs at least 2 characters", true);
        nameInput.focus();
        return;
      }
      if (msg.length < 4) {
        toast("message needs at least 4 characters", true);
        msgInput.focus();
        return;
      }
      const token2 = turnstileToken();
      if (turnstileActive() && !token2) {
        toast("finish the verification first", true);
        return;
      }
      setBusy(true);
      try {
        const r = await fetch(API2, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name,
            message: msg,
            website: trap ? trap.value : "",
            turnstileToken: token2,
            renderedAt
          })
        });
        const j = await r.json().catch(function() {
          return null;
        });
        if (!r.ok || !j || j.ok !== true) {
          const code = j && j.error || "submit_failed";
          if (code === "rate_limited") {
            toast(j.detail || "too many signatures \u2014 slow down", true);
          } else if (code === "duplicate") {
            toast("you already signed with this message", true);
          } else if (code === "turnstile_failed") {
            toast("verification failed \u2014 try again", true);
            resetTurnstile();
          } else {
            toast(j && j.detail || "could not sign the guestbook", true);
          }
          return;
        }
        nameInput.value = "";
        msgInput.value = "";
        if (trap) trap.value = "";
        renderedAt = Date.now();
        resetTurnstile();
        const note = j.note;
        const existing = Array.prototype.slice.call(list.querySelectorAll(".gb-entry"));
        renderNotes(note ? [note].concat(existing.map(remap)) : []);
        toast("signed the guestbook");
        load2(true);
      } catch (e2) {
        toast("network error \u2014 signature not saved", true);
      } finally {
        setBusy(false);
      }
    });
    function remap(el) {
      return {
        n: (el.querySelector(".gb-entry-name") || {}).textContent || "",
        m: (el.querySelector(".gb-entry-msg") || {}).textContent || "",
        t: Date.parse((el.querySelector("time") || {}).getAttribute("datetime") || "") || Date.now()
      };
    }
    load2(false);
    setTimeout(function() {
      load2(true);
    }, REFRESH_MS2);
  }

  // src/main.js
  function boot(fn) {
    try {
      fn();
    } catch (e) {
      if (window.console && console.warn) console.warn("[init] " + (fn && fn.name) + " failed:", e);
    }
  }
  if (typeof document !== "undefined") {
    document.addEventListener(
      "submit",
      function(e) {
        const f = e.target;
        if (f && f.id === "gbForm") e.preventDefault();
      },
      true
    );
  }
  var booted = false;
  function init() {
    if (booted) return;
    booted = true;
    const bio = $("bioText");
    if (bio) bio.innerHTML = C.bio;
    const status = $("statusDot");
    if (status) status.innerHTML = SI.offline;
    const handle = $("handle");
    if (handle) {
      handle.addEventListener("click", function() {
        const v = $("handleText") ? $("handleText").textContent.trim() : "";
        if (v) copy(v, this);
      });
    }
    setArt2("");
    setBgArt("");
    clearNow();
    boot(initScroll);
    boot(initTilt);
    boot(initBg);
    boot(initWeather);
    boot(initLyricsModal);
    boot(initMusic);
    boot(initStats);
    boot(initGames);
    boot(initGuestbook);
    boot(initViewCounter);
    boot(initNavigation);
    try {
      const cp = cGet(CK_P, 3e5);
      if (cp && cp.discord_user && cp.discord_user.id === C.id) {
        presence(cp);
      }
    } catch (e) {
    }
    connect();
    setTimeout(scMax, 300);
    setTimeout(scMax, 1200);
    if (document.readyState === "complete") {
      setTimeout(playReveal, 40);
    } else {
      window.addEventListener("load", () => setTimeout(playReveal, 40));
    }
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
})();
