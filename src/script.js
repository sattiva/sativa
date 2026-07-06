import { DAT, NAMES } from './mapData.js?v=1.0.3';
import { thighs } from './ascii.js';

const mc = document.getElementById('mc');
const m = document.getElementById('m');
const nr = document.getElementById('nr');
const gt = document.getElementById('gt');
const art = document.getElementById('gate-art');
const ip = document.getElementById('ip');
const ipt = document.querySelector('.ipt');
const ips = document.querySelector('.ips');
const ipd = document.querySelector('.ipd');
const ipv = document.getElementById('ipv');
const ipvs = document.querySelectorAll('.ipvs');
const tt = document.getElementById('tt');

const mdl = document.getElementById('mdl');
const mdlCls = document.getElementById('mdl-cls');
const mdlH = document.querySelector('.mdl-h');
const mdlSz = document.querySelector('.mdl-sz');
const mdlVol = document.querySelector('.mdl-vol');
const mdlJig = document.querySelector('.mdl-jig');
const mdlSoft = document.querySelector('.mdl-soft');
const projectDesc = document.getElementById('project-description');

const iplMin = document.getElementById('ipl-min');
const iplLst = document.getElementById('ipl-lst');
const ldrMdl = document.getElementById('ldr-mdl');
const ldrCls = document.getElementById('ldr-cls');
const ldrList = document.getElementById('ldr-list');
const hdrLdr = document.getElementById('hdr-ldr');
const mobLdr = document.getElementById('mob-ldr');

const ipCls = document.getElementById('ip-cls');
const ipOpen = document.getElementById('ip-open');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const zoomResetBtn = document.getElementById('zoom-reset');

const cmpMdl = document.getElementById('cmp-mdl');
const cmpCls = document.getElementById('cmp-cls');
const cmpSel1 = document.getElementById('cmp-sel-1');
const cmpSel2 = document.getElementById('cmp-sel-2');
const cmpBody1 = document.getElementById('cmp-body-1');
const cmpBody2 = document.getElementById('cmp-body-2');
const cmpVis = document.getElementById('cmp-vis');
const cmpTriggerBtn = document.getElementById('cmp-trigger-btn');
const hdrCmp = document.getElementById('hdr-cmp');
const mobCmp = document.getElementById('mob-cmp');
const cntrySrch = document.getElementById('cntry-srch');
const srchSug = document.getElementById('srch-sug');

let activeId = 'CHG';

m.onclick = () => {
    m.classList.toggle('open');
    nr.classList.toggle('show');
};

const gtBg = document.createElement('div');
gtBg.className = 'gt-bg';
gt.insertBefore(gtBg, gt.firstChild);

gt.onclick = () => {
    mc.style.display = 'block';
    ip.style.display = 'flex';
    gt.classList.add('h');
};

art.textContent = thighs;

const CLRS = {
    'CHG': '#ff2d55',
    'CHS': '#007aff',
    'BBS': '#ffcc00'
};

async function init() {
    const paths = mc.querySelectorAll('path');
    paths.forEach(p => {
        const id = p.getAttribute('id');
        const d = DAT[id];
        
        p.style.fill = CLRS[id] || '#27272a';

        p.addEventListener('mouseenter', () => {
            p.classList.add('act');
            const info = d ? `${d.n} (${d.v})` : `${id}: No Data`;
            tt.textContent = info;
            tt.style.opacity = '1';
            
            if (d) {
                activeId = id;
                ipt.textContent = d.n.toUpperCase();
                ips.textContent = d.c;
                ipd.textContent = `Scale: ${d.v}`;
                
                const val = parseInt(d.v.replace(/,/g, '')) || 1000;
                const dmtr = Math.round(Math.pow(val, 1/3) * 3);
                ipv.style.display = 'flex';
                ipvs.forEach(el => {
                    el.style.width = `${dmtr}px`;
                    el.style.height = `${dmtr}px`;
                });
            }
        });

        p.addEventListener('mousemove', (e) => {
            tt.style.left = `${e.pageX + 15}px`;
            tt.style.top = `${e.pageY + 15}px`;
        });

        p.addEventListener('mouseleave', () => {
            p.classList.remove('act');
            tt.style.opacity = '0';
        });

        p.addEventListener('click', () => {
            if (d) {
                activeId = id;
                mdlH.textContent = d.n.toUpperCase();
                mdlSz.textContent = d.c;
                mdlVol.textContent = d.v;
                mdlJig.textContent = 'High Complexity';
                mdlSoft.textContent = '9.8/10';
                projectDesc.textContent = d.desc;
                
                mdl.style.display = 'flex';
                setTimeout(() => mdl.classList.add('show'), 10);
            }
        });
    });

    // Populate Codebases
    const sorted = Object.keys(DAT)
        .map(k => ({ code: k, ...DAT[k] }))
        .sort((a, b) => parseInt(b.v.replace(/,/g, '')) - parseInt(a.v.replace(/,/g, '')));
    
    iplLst.innerHTML = sorted.map((item, idx) => `
        <div class="ipli" style="cursor: pointer; margin-bottom: 6px;" data-id="${item.code}">
            <span>${idx + 1}. ${item.n.toUpperCase()}</span>
            <span style="color: var(--acc); font-weight: 700;">${item.v}</span>
        </div>
    `).join('');

    iplLst.querySelectorAll('.ipli').forEach(el => {
        el.onclick = () => {
            const id = el.getAttribute('data-id');
            const path = mc.querySelector(`path[id="${id}"]`);
            if (path) {
                path.dispatchEvent(new Event('click'));
                path.dispatchEvent(new Event('mouseenter'));
            }
        };
    });
}

ipv.addEventListener('mousemove', (e) => {
    const rect = ipv.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rx = -(y / rect.height) * 30;
    const ry = (x / rect.width) * 30;
    ipvs.forEach(el => {
        el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
    });
});

ipv.addEventListener('mouseleave', () => {
    ipvs.forEach(el => {
        el.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    });
});

iplMin.onclick = (e) => {
    e.stopPropagation();
    if (iplLst.style.display === 'none') {
        iplLst.style.display = 'flex';
        iplMin.textContent = '[-]';
    } else {
        iplLst.style.display = 'none';
        iplMin.textContent = '[+]';
    }
};

const showLeaderboard = () => {
    const sorted = Object.keys(DAT)
        .map(k => ({ code: k, ...DAT[k] }))
        .sort((a, b) => parseInt(b.v.replace(/,/g, '')) - parseInt(a.v.replace(/,/g, '')));

    ldrList.innerHTML = sorted.map((item, idx) => `
        <div class="ipli" style="font-size: 0.95rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 8px;">
            <span>${idx + 1}. ${item.n.toUpperCase()}</span>
            <span style="color: var(--acc); font-weight: 700;">${item.c} (${item.v})</span>
        </div>
    `).join('');

    ldrMdl.style.display = 'flex';
    setTimeout(() => ldrMdl.classList.add('show'), 10);
};

hdrLdr.onclick = e => { e.preventDefault(); showLeaderboard(); };
if (mobLdr) mobLdr.onclick = e => { e.preventDefault(); m.classList.remove('open'); nr.classList.remove('show'); showLeaderboard(); };

ldrCls.onclick = () => {
    ldrMdl.classList.remove('show');
    setTimeout(() => ldrMdl.style.display = 'none', 300);
};

mdlCls.onclick = () => {
    mdl.classList.remove('show');
    setTimeout(() => mdl.style.display = 'none', 300);
};

window.onclick = e => {
    if (e.target === mdl) { mdl.classList.remove('show'); setTimeout(() => mdl.style.display = 'none', 300); }
    if (e.target === ldrMdl) { ldrMdl.classList.remove('show'); setTimeout(() => ldrMdl.style.display = 'none', 300); }
    if (e.target === cmpMdl) { cmpMdl.classList.remove('show'); setTimeout(() => cmpMdl.style.display = 'none', 300); }
};

ipCls.onclick = () => { ip.style.display = 'none'; ipOpen.style.display = 'block'; };
ipOpen.onclick = () => { ip.style.display = 'flex'; ipOpen.style.display = 'none'; };

let scale = 1;
let pointX = 0;
let pointY = 0;
let start = { x: 0, y: 0 };
let isPanning = false;

const getSvg = () => mc.querySelector('svg');
const updateTransform = () => {
    const svg = getSvg();
    if (svg) {
        svg.style.transformOrigin = '0 0';
        svg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }
};

zoomInBtn.onclick = () => { scale *= 1.25; updateTransform(); };
zoomOutBtn.onclick = () => { scale /= 1.25; updateTransform(); };
zoomResetBtn.onclick = () => { scale = 1; pointX = 0; pointY = 0; updateTransform(); };

mc.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isPanning = true;
    start = { x: e.clientX - pointX, y: e.clientY - pointY };
});

window.addEventListener('mousemove', e => {
    if (!isPanning) return;
    pointX = e.clientX - start.x;
    pointY = e.clientY - start.y;
    updateTransform();
});

window.addEventListener('mouseup', () => { isPanning = false; });

cntrySrch.oninput = () => {
    const val = cntrySrch.value.trim().toLowerCase();
    if (!val) { srchSug.style.display = 'none'; return; }
    const matches = Object.keys(DAT)
        .map(k => ({ code: k, ...DAT[k] }))
        .filter(item => item.n.toLowerCase().includes(val) || item.code.toLowerCase().includes(val));
    
    if (matches.length === 0) { srchSug.style.display = 'none'; return; }
    
    srchSug.innerHTML = matches.map(item => `<div class="sug-item" data-id="${item.code}">${item.n}</div>`).join('');
    srchSug.style.display = 'flex';
    
    srchSug.querySelectorAll('.sug-item').forEach(el => {
        el.onclick = () => {
            const id = el.getAttribute('data-id');
            cntrySrch.value = '';
            srchSug.style.display = 'none';
            const path = mc.querySelector(`path[id="${id}"]`);
            if (path) {
                path.dispatchEvent(new Event('click'));
                path.dispatchEvent(new Event('mouseenter'));
            }
        };
    });
};

const initCmpSelectors = () => {
    const list = Object.keys(DAT).map(k => ({ code: k, name: DAT[k].n }));
    const opts = list.map(item => `<option value="${item.code}">${item.name}</option>`).join('');
    cmpSel1.innerHTML = opts;
    cmpSel2.innerHTML = opts;
    cmpSel1.value = activeId || 'CHG';
    cmpSel2.value = 'CHS';
};

const updateComparison = () => {
    const c1 = DAT[cmpSel1.value];
    const c2 = DAT[cmpSel2.value];
    if (!c1 || !c2) return;
    
    cmpBody1.innerHTML = `<p>${c1.n}</p><strong>Scale: ${c1.v}</strong><p>${c1.c}</p>`;
    cmpBody2.innerHTML = `<p>${c2.n}</p><strong>Scale: ${c2.v}</strong><p>${c2.c}</p>`;
    
    const v1 = parseInt(c1.v.replace(/,/g, '')) || 1000;
    const v2 = parseInt(c2.v.replace(/,/g, '')) || 1000;
    const maxVal = Math.max(v1, v2, 30000);
    const w1 = (v1 / maxVal) * 100;
    const w2 = (v2 / maxVal) * 100;
    
    cmpVis.innerHTML = `
        <div class="cmp-bar-container">
            <div class="cmp-bar-track"><div class="cmp-bar-fill-1" style="width: ${w1}%;"></div></div>
            <div class="cmp-bar-track"><div class="cmp-bar-fill-2" style="width: ${w2}%;"></div></div>
        </div>
    `;
};

cmpSel1.onchange = updateComparison;
cmpSel2.onchange = updateComparison;

const showComparison = () => {
    initCmpSelectors();
    updateComparison();
    cmpMdl.style.display = 'flex';
    setTimeout(() => cmpMdl.classList.add('show'), 10);
};

cmpTriggerBtn.onclick = showComparison;
if (hdrCmp) hdrCmp.onclick = e => { e.preventDefault(); showComparison(); };

init();
