let solPrice = 148.50;
let solTimer = null;
let botTimer = null;

export async function fetchLiveSolPrice() {
  const usdEl = document.getElementById('solUsdVal');
  const unitEl = document.getElementById('solUnitPrice');
  if (!usdEl && !unitEl) return;

  function apply(p) {
    if (typeof p !== 'number' || isNaN(p) || p <= 0) return;
    solPrice = p;
    if (unitEl) unitEl.textContent = '1 SOL ≈ $' + p.toFixed(2);
    if (usdEl) {
      const tot = 4.5 * p;
      usdEl.textContent = '≈ $' + tot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD';
    }
  }

  try {
    const res = await fetch('https://api.coinbase.com/v2/prices/SOL-USD/spot', { cache: 'no-store' });
    if (res.ok) {
      const d = await res.json();
      const p = parseFloat(d && d.data && d.data.amount);
      if (p > 0) {
        apply(p);
        return;
      }
    }
  } catch (e) {}

  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT', { cache: 'no-store' });
    if (res.ok) {
      const d = await res.json();
      const p = parseFloat(d && d.price);
      if (p > 0) {
        apply(p);
        return;
      }
    }
  } catch (e) {}

  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', { cache: 'no-store' });
    if (res.ok) {
      const d = await res.json();
      const p = d && d.solana && d.solana.usd;
      if (typeof p === 'number' && p > 0) apply(p);
    }
  } catch (e) {}
}

export function startSolPricePolling() {
  fetchLiveSolPrice();
  if (!solTimer) {
    solTimer = setInterval(fetchLiveSolPrice, 30000);
  }
}

export function initBotTelemetry() {
  if (botTimer) return;
  const h1 = document.getElementById('botHeap1');
  const l1 = document.getElementById('botLag1');
  const b1 = document.getElementById('botBar1');
  const h2 = document.getElementById('botHeap2');
  const l2 = document.getElementById('botLag2');
  const b2 = document.getElementById('botBar2');
  if (!h1 && !h2) return;

  botTimer = setInterval(() => {
    if (h1) h1.textContent = (31.1 + Math.random() * 0.6).toFixed(1) + ' MB';
    if (l1) l1.textContent = (17 + Math.floor(Math.random() * 6)) + 'ms';
    if (b1) b1.style.width = (52 + Math.floor(Math.random() * 8)) + '%';
    if (h2) h2.textContent = (16.4 + Math.random() * 0.7).toFixed(1) + ' MB';
    if (l2) l2.textContent = (9 + Math.floor(Math.random() * 5)) + 'ms';
    if (b2) b2.style.width = (58 + Math.floor(Math.random() * 8)) + '%';
  }, 2400);
}

let casinoTimer = null;
export function initCasinoTicker() {
  if (casinoTimer) return;
  const mEl = document.getElementById('casinoMultiplier');
  const pEl = document.getElementById('casinoPayout');
  if (!mEl && !pEl) return;
  let mult = 1.20;
  casinoTimer = setInterval(() => {
    mult += (0.04 + Math.random() * 0.08);
    if (mult > 4.40) mult = 1.05;
    if (mEl) mEl.textContent = mult.toFixed(2) + 'x';
    if (pEl) pEl.textContent = '+' + (1.50 * mult).toFixed(2) + ' SOL';
  }, 220);
}

export function triggerProjectsEntrance() {
  const view = document.querySelector('section[data-view="projects"]');
  if (!view) return;
  view.classList.remove('projects-active');
  void view.offsetWidth;
  view.classList.add('projects-active');

  const cards = Array.from(view.querySelectorAll('.proj'));
  cards.forEach((card, idx) => {
    card.classList.remove('proj-entered');
    setTimeout(() => {
      card.classList.add('proj-entered');
    }, 60 + idx * 90);
  });
}

export function initEspCanvas() {
  const cv = document.getElementById('espCanvas');
  if (!cv) return;
  const wrap = cv.parentElement;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    cv.width = wrap.clientWidth * dpr;
    cv.height = wrap.clientHeight * dpr;
    cv.style.width = wrap.clientWidth + 'px';
    cv.style.height = wrap.clientHeight + 'px';
  }
  resize();

  const gl = cv.getContext('webgl', { alpha: true, antialias: true }) || cv.getContext('experimental-webgl');
  if (!gl) return;

  const VS = `
    attribute vec3 pos;
    attribute vec3 nrm;
    uniform mat4 uMVP;
    uniform mat3 uNorm;
    varying vec3 vN;
    void main(){vN=uNorm*nrm;gl_Position=uMVP*vec4(pos,1.0);}
  `;
  const FS = `
    precision mediump float;
    varying vec3 vN;
    uniform vec3 uCol;
    uniform float uAlpha;
    void main(){
      vec3 L=normalize(vec3(0.6,1.0,0.8));
      float d=max(dot(normalize(vN),L),0.0);
      float amb=0.22;
      float lit=amb+d*0.78;
      gl_FragColor=vec4(uCol*lit,uAlpha);
    }
  `;

  function sh(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const aPos = gl.getAttribLocation(prog, 'pos');
  const aNrm = gl.getAttribLocation(prog, 'nrm');
  const uMVP = gl.getUniformLocation(prog, 'uMVP');
  const uNorm = gl.getUniformLocation(prog, 'uNorm');
  const uCol = gl.getUniformLocation(prog, 'uCol');
  const uAlpha = gl.getUniformLocation(prog, 'uAlpha');

  // box: 36 verts (6 faces * 2 tris * 3 verts)
  function boxGeo(x, y, z, w, h, d) {
    const hx = w / 2, hy = h / 2, hz = d / 2;
    const faces = [
      [[1,0,0], [[hx,hy,hz],[hx,-hy,hz],[hx,-hy,-hz],[hx,hy,hz],[hx,-hy,-hz],[hx,hy,-hz]]],
      [[-1,0,0],[[-hx,hy,-hz],[-hx,-hy,-hz],[-hx,-hy,hz],[-hx,hy,-hz],[-hx,-hy,hz],[-hx,hy,hz]]],
      [[0,1,0],[[-hx,hy,-hz],[hx,hy,-hz],[hx,hy,hz],[-hx,hy,-hz],[hx,hy,hz],[-hx,hy,hz]]],
      [[0,-1,0],[[-hx,-hy,hz],[hx,-hy,hz],[hx,-hy,-hz],[-hx,-hy,hz],[hx,-hy,-hz],[-hx,-hy,-hz]]],
      [[0,0,1],[[-hx,hy,hz],[hx,hy,hz],[hx,-hy,hz],[-hx,hy,hz],[hx,-hy,hz],[-hx,-hy,hz]]],
      [[0,0,-1],[[hx,hy,-hz],[-hx,hy,-hz],[-hx,-hy,-hz],[hx,hy,-hz],[-hx,-hy,-hz],[hx,-hy,-hz]]],
    ];
    const verts = [];
    for (const [n, pts] of faces) {
      for (const p of pts) {
        verts.push(p[0]+x, p[1]+y, p[2]+z, n[0], n[1], n[2]);
      }
    }
    return verts;
  }

  // Roblox-ish block character: head, torso, left-arm, right-arm, left-leg, right-leg
  const parts = [
    { geo: boxGeo(0, 1.4, 0, 0.9, 0.9, 0.9), col: [0.95, 0.88, 0.78] },    // head
    { geo: boxGeo(0, 0.3, 0, 1.2, 1.2, 0.7), col: [0.85, 0.20, 0.20] },    // torso
    { geo: boxGeo(-0.85, 0.3, 0, 0.45, 1.1, 0.45), col: [0.95, 0.88, 0.78] }, // left arm
    { geo: boxGeo(0.85, 0.3, 0, 0.45, 1.1, 0.45), col: [0.95, 0.88, 0.78] },  // right arm
    { geo: boxGeo(-0.3, -0.9, 0, 0.52, 1.0, 0.52), col: [0.20, 0.22, 0.28] }, // left leg
    { geo: boxGeo(0.3, -0.9, 0, 0.52, 1.0, 0.52), col: [0.20, 0.22, 0.28] },  // right leg
  ];

  const bufs = parts.map(p => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(p.geo), gl.STATIC_DRAW);
    return { buf: b, count: p.geo.length / 6, col: p.col };
  });

  function mat4mul(a, b) {
    const r = new Float32Array(16);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[i*4+k] * b[k*4+j];
      r[i*4+j] = s;
    }
    return r;
  }
  function perspective(fov, asp, n, f) {
    const t = Math.tan(fov * 0.5), r = new Float32Array(16);
    r[0]=1/(asp*t); r[5]=1/t; r[10]=-(f+n)/(f-n); r[11]=-1; r[14]=-2*f*n/(f-n);
    return r;
  }
  function rotY(a) {
    const c=Math.cos(a),s=Math.sin(a),r=new Float32Array(16);
    r[0]=c;r[2]=s;r[5]=1;r[8]=-s;r[10]=c;r[15]=1;
    return r;
  }
  function translate(x,y,z) {
    const r=new Float32Array(16);
    r[0]=r[5]=r[10]=r[15]=1;r[12]=x;r[13]=y;r[14]=z;
    return r;
  }

  let raf;
  function draw(t) {
    resize();
    gl.viewport(0, 0, cv.width, cv.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const asp = cv.width / cv.height;
    const proj = perspective(0.7, asp, 0.1, 50);
    const view = translate(0, 0.1, -5.2);
    const rot = rotY(t * 0.00055);
    const mv = mat4mul(view, rot);
    const mvp = mat4mul(proj, mv);

    // 3x3 normal matrix (simplified identity rot since uniform scale)
    const nm = [rot[0],rot[1],rot[2],rot[4],rot[5],rot[6],rot[8],rot[9],rot[10]];

    gl.uniformMatrix4fv(uMVP, false, mvp);
    gl.uniformMatrix3fv(uNorm, false, nm);

    for (const b of bufs) {
      gl.bindBuffer(gl.ARRAY_BUFFER, b.buf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(aNrm);
      gl.vertexAttribPointer(aNrm, 3, gl.FLOAT, false, 24, 12);
      gl.uniform3fv(uCol, b.col);
      gl.uniform1f(uAlpha, 0.92);
      gl.drawArrays(gl.TRIANGLES, 0, b.count);
    }
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
}

export function initProjectsScroller() {
  const view = document.querySelector('section[data-view="projects"]');
  if (!view) return;
  const cards = Array.from(view.querySelectorAll('.proj'));

  function check() {
    if (view.hidden) return;
    const vh = window.innerHeight || 800;
    cards.forEach((card, idx) => {
      const rect = card.getBoundingClientRect();
      if (rect.top < vh * 0.92 && rect.bottom > 50) {
        if (!card.classList.contains('proj-scrolled')) {
          card.classList.add('proj-scrolled');
          card.classList.add('proj-scrolled-' + (idx + 1));
        }
      }
    });
  }

  window.addEventListener('stagescroll', check);
  window.addEventListener('wheel', check, { passive: true });
  window.addEventListener('scroll', check, { passive: true });
  document.addEventListener('keydown', check);
  setTimeout(check, 80);
  setTimeout(check, 320);

  const tabs = document.querySelectorAll('.art-exo-tab');
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
    });
  });

  initBotTelemetry();
  initCasinoTicker();
  initEspCanvas();
}
