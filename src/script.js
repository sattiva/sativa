import { DAT, NAMES } from './mapData.js?v=1.0.3';
import { thighs } from './ascii.js';

const mc = document.getElementById('mc');
const m = document.getElementById('m');
const nr = document.getElementById('nr');
const gt = document.getElementById('gt');
const art = document.getElementById('gate-art');

const mdl = document.getElementById('mdl');
const mdlCls = document.getElementById('mdl-cls');
const mdlH = document.querySelector('.mdl-h');
const mdlSz = document.querySelector('.mdl-sz');
const mdlVol = document.querySelector('.mdl-vol');
const mdlJig = document.querySelector('.mdl-jig');
const mdlSoft = document.querySelector('.mdl-soft');
const projectDesc = document.getElementById('project-description');

const ldrMdl = document.getElementById('ldr-mdl');
const ldrCls = document.getElementById('ldr-cls');
const ldrList = document.getElementById('ldr-list');
const hdrLdr = document.getElementById('hdr-ldr');
const mobLdr = document.getElementById('mob-ldr');

const cmpMdl = document.getElementById('cmp-mdl');
const cmpCls = document.getElementById('cmp-cls');
const cmpBody1 = document.getElementById('cmp-body-1');
const cmpBody2 = document.getElementById('cmp-body-2');
const cmpVis = document.getElementById('cmp-vis');
const hdrCmp = document.getElementById('hdr-cmp');
const mobCmp = document.getElementById('mob-cmp');

// Lanyard elements
const avatarImg = document.getElementById('discord-avatar');
const statusDot = document.getElementById('discord-status-dot');
const nameText = document.getElementById('discord-name');
const tagText = document.getElementById('discord-tag');
const spotifyCard = document.getElementById('spotify-card');
const spotifyArt = document.getElementById('spotify-art');
const spotifySong = document.getElementById('spotify-song');
const spotifyArtist = document.getElementById('spotify-artist');

m.onclick = () => {
    m.classList.toggle('open');
    nr.classList.toggle('show');
};

const gtBg = document.createElement('div');
gtBg.className = 'gt-bg';
gt.insertBefore(gtBg, gt.firstChild);

gt.onclick = () => {
    mc.style.display = 'block';
    gt.classList.add('h');
};

art.textContent = thighs;

async function fetchLanyard() {
    try {
        const res = await fetch('https://api.lanyard.rest/v1/users/1281996800340791452');
        const data = await res.json();
        if (data.success && data.data) {
            const user = data.data.discord_user;
            if (user.avatar) {
                avatarImg.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
                avatarImg.style.display = 'block';
            }
            nameText.textContent = user.global_name || user.username;
            tagText.textContent = `@${user.username}`;
            
            // Status Dot
            statusDot.className = 'status-indicator ' + data.data.discord_status;
            
            // Spotify
            if (data.data.listening_to_spotify && data.data.spotify) {
                const sp = data.data.spotify;
                spotifyArt.src = sp.album_art_url;
                spotifySong.textContent = sp.song;
                spotifyArtist.textContent = sp.artist;
                spotifyCard.style.display = 'flex';
            } else {
                spotifyCard.style.display = 'none';
            }
        }
    } catch (e) {
        // fail-silent
    }
}

async function init() {
    // Bind project card click events
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            const d = DAT[id];
            if (d) {
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

    // Lanyard dynamic checking
    fetchLanyard();
    setInterval(fetchLanyard, 15000);
}

const showLeaderboard = () => {
    const sorted = Object.keys(DAT)
        .map(k => ({ code: k, ...DAT[k] }))
        .sort((a, b) => parseInt(b.v.replace(/,/g, '')) - parseInt(a.v.replace(/,/g, '')));

    ldrList.innerHTML = sorted.map((item, idx) => `
        <div class="ipli" style="font-size: 0.95rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 8px;">
            <span>${idx + 1}. ${item.n.toUpperCase()}</span>
            <span style="color: var(--acc-go); font-weight: 700;">${item.c} (${item.v})</span>
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

const showComparison = () => {
    const sorted = Object.keys(DAT).map(k => DAT[k]);
    if (sorted.length < 2) return;
    
    const c1 = sorted[0];
    const c2 = sorted[1];
    
    cmpBody1.innerHTML = `<p>${c1.n}</p><strong>LOC: ${c1.v}</strong><p>${c1.c}</p>`;
    cmpBody2.innerHTML = `<p>${c2.n}</p><strong>LOC: ${c2.v}</strong><p>${c2.c}</p>`;
    
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
    
    cmpMdl.style.display = 'flex';
    setTimeout(() => cmpMdl.classList.add('show'), 10);
};

if (hdrCmp) hdrCmp.onclick = e => { e.preventDefault(); showComparison(); };
cmpCls.onclick = () => {
    cmpMdl.classList.remove('show');
    setTimeout(() => cmpMdl.style.display = 'none', 300);
};

init();
