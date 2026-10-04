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
  var curAudio = null;
  var curTrackRow = null;
  function stopCustomAudio() {
    if (curAudio) {
      curAudio.pause();
      curAudio = null;
    }
    if (curTrackRow) {
      curTrackRow.classList.remove("playing");
      const btn = curTrackRow.querySelector(".track-play-btn");
      if (btn) btn.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
      curTrackRow = null;
    }
  }
  function initMusic() {
    document.querySelectorAll("#customTrackList .track-row").forEach((row) => {
      row.addEventListener("click", function() {
        const src = this.dataset.src;
        const btn = this.querySelector(".track-play-btn");
        if (curTrackRow === this) {
          if (curAudio && curAudio.paused) {
            curAudio.play().catch(() => {
            });
            this.classList.add("playing");
            if (btn) btn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
          } else if (curAudio) {
            curAudio.pause();
            this.classList.remove("playing");
            if (btn) btn.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
          }
          return;
        }
        stopCustomAudio();
        curTrackRow = this;
        this.classList.add("playing");
        if (btn) btn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
        curAudio = new Audio(src);
        curAudio.volume = 0.7;
        curAudio.play().catch(() => {
        });
        curAudio.addEventListener("ended", () => {
          stopCustomAudio();
        });
      });
    });
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
    function play() {
      if (!raf) raf = requestAnimationFrame(render);
    }
    document.addEventListener("visibilitychange", function() {
      if (document.hidden) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      } else {
        play();
      }
    });
    play();
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
        if (!d || typeof d.views !== "number") return;
        cSet(CK_V, d.views);
        if ($("viewCounter")) $("viewCounter").hidden = false;
        animateCount(d.views);
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
  function setArt(url) {
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
  function lineHtml(l, i, active, modal) {
    return '<p class="' + (modal ? "lyr-line" : "lyric-line") + (l.instrumental ? " instrumental" : "") + (active ? " active" : "") + '" data-idx="' + i + '">' + (l.instrumental ? "instrumental" : wSpans(l.text)) + "</p>";
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
  function startLoop() {
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
        setArt(art);
        setBgArt(art);
      } else {
        fetchArtwork(aName, sName, sp.album).then((fetchedArt) => {
          if (fetchedArt && S.songKey === k) {
            if (nowArt) {
              nowArt.src = fetchedArt;
              nowArt.style.display = "";
            }
            setArt(fetchedArt);
            setBgArt(fetchedArt);
          } else {
            if (nowArt) nowArt.src = FB;
            setArt("");
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
    startLoop();
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
    setArt("");
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

  // src/games.js
  function initGames() {
    const cv = document.getElementById("arcadeCanvas");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const overlay = document.getElementById("arcadeOverlay");
    const startBtn = document.getElementById("arcadeStartBtn");
    const scoreEl = document.getElementById("arcadeScore");
    const bestEl = document.getElementById("arcadeBest");
    let high = 0;
    try {
      high = parseInt(localStorage.getItem("sat-arcade-best") || "0", 10);
    } catch (e) {
    }
    if (bestEl) bestEl.textContent = high;
    let running = false;
    const player = { x: 280, y: 190, w: 26, h: 14, vx: 0 };
    let obstacles = [];
    let score = 0;
    let lastSpawn = 0;
    let animId = null;
    const keys = {};
    window.addEventListener("keydown", (e) => {
      if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(e.code)) keys[e.code] = true;
    });
    window.addEventListener("keyup", (e) => {
      if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(e.code)) keys[e.code] = false;
    });
    cv.addEventListener("pointermove", (e) => {
      if (!running) return;
      const rect = cv.getBoundingClientRect();
      player.x = (e.clientX - rect.left) / rect.width * cv.width - player.w / 2;
    });
    function start() {
      running = true;
      score = 0;
      obstacles = [];
      player.x = cv.width / 2 - 13;
      overlay.style.display = "none";
      lastSpawn = performance.now();
      loop2();
    }
    function gameOver() {
      running = false;
      cancelAnimationFrame(animId);
      if (score > high) {
        high = score;
        try {
          localStorage.setItem("sat-arcade-best", String(high));
        } catch (e) {
        }
        if (bestEl) bestEl.textContent = high;
      }
      const title = overlay.querySelector("div");
      if (title) title.textContent = "GAME OVER \xB7 SCORE " + score;
      overlay.style.display = "flex";
      if (startBtn) startBtn.textContent = "PLAY AGAIN";
    }
    function loop2() {
      if (!running) return;
      animId = requestAnimationFrame(loop2);
      ctx.fillStyle = "#0a0a0d";
      ctx.fillRect(0, 0, cv.width, cv.height);
      if (keys["ArrowLeft"] || keys["KeyA"]) player.x -= 6;
      if (keys["ArrowRight"] || keys["KeyD"]) player.x += 6;
      player.x = Math.max(0, Math.min(cv.width - player.w, player.x));
      ctx.fillStyle = "#ff2a55";
      ctx.shadowColor = "#ff2a55";
      ctx.shadowBlur = 12;
      ctx.fillRect(player.x, player.y, player.w, player.h);
      const now = performance.now();
      if (now - lastSpawn > Math.max(220, 600 - score * 10)) {
        lastSpawn = now;
        obstacles.push({
          x: Math.random() * (cv.width - 20),
          y: -15,
          w: 16 + Math.random() * 20,
          h: 12,
          speed: 3 + Math.min(score * 0.12, 7)
        });
      }
      ctx.fillStyle = "#00f0ff";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 10;
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const ob = obstacles[i];
        ob.y += ob.speed;
        ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
        if (player.x < ob.x + ob.w && player.x + player.w > ob.x && player.y < ob.y + ob.h && player.y + player.h > ob.y) {
          gameOver();
          return;
        }
        if (ob.y > cv.height) {
          obstacles.splice(i, 1);
          score++;
          if (scoreEl) scoreEl.textContent = score;
        }
      }
      ctx.shadowBlur = 0;
    }
    if (startBtn) startBtn.addEventListener("click", start);
  }

  // src/guestbook.js
  var INITIAL_NOTES = [
    { name: "Kovak", note: "Sick redesign Sativa! The custom music & games are clean af \u{1F525}", date: "Oct 4, 2026" },
    { name: "vivid_ghost", note: "Love the Toronto weather widget and neon aesthetic!", date: "Oct 3, 2026" },
    { name: "cipher_9", note: "lanyard discord presence synced instant, nice work", date: "Oct 2, 2026" },
    { name: "blaze", note: "Roblox sealanterns12 gang, added u", date: "Oct 1, 2026" }
  ];
  function initGuestbook() {
    const list = $("guestbookEntries");
    const form = $("guestbookForm");
    if (!list || !form) return;
    function getNotes() {
      try {
        const stored = localStorage.getItem("sat-guestbook");
        if (stored) return JSON.parse(stored);
      } catch (e) {
      }
      return INITIAL_NOTES;
    }
    function saveNotes(notes) {
      try {
        localStorage.setItem("sat-guestbook", JSON.stringify(notes));
      } catch (e) {
      }
    }
    function renderNotes() {
      const notes = getNotes();
      list.innerHTML = notes.map((n) => `
      <div class="gb-card">
        <div class="gb-card-header">
          <span class="gb-author">${esc(n.name)}</span>
          <span class="gb-date">${esc(n.date)}</span>
        </div>
        <p class="gb-text">${esc(n.note)}</p>
      </div>
    `).join("");
      setTimeout(scMax, 50);
    }
    renderNotes();
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = $("gbNameInput");
      const msgInput = $("gbMsgInput");
      if (!nameInput || !msgInput) return;
      const name = nameInput.value.trim();
      const note = msgInput.value.trim();
      if (!name || !note) {
        toast("Please enter both name and message", true);
        return;
      }
      const d = /* @__PURE__ */ new Date();
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const notes = getNotes();
      notes.unshift({ name, note, date: dateStr });
      saveNotes(notes);
      nameInput.value = "";
      msgInput.value = "";
      renderNotes();
      toast("Note added to guestbook!");
    });
  }

  // src/main.js
  function init() {
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
    setArt("");
    setBgArt("");
    clearNow();
    initScroll();
    initTilt();
    initBg();
    initWeather();
    initLyricsModal();
    initMusic();
    initGames();
    initGuestbook();
    initViewCounter();
    initNavigation();
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
