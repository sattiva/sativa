import { DAT } from './mapData.js?v=1.0.3';
import { thighs, sativaText } from './ascii.js';

const mc = document.getElementById('mc');
const m = document.getElementById('m');
const nr = document.getElementById('nr');
const gt = document.getElementById('gt');
const art = document.getElementById('gate-art');
const logoArt = document.getElementById('sativa-logo');

const mdl = document.getElementById('mdl');
const mdlCls = document.getElementById('mdl-cls');
const mdlH = document.querySelector('.mdl-h');
const mdlSz = document.querySelector('.mdl-sz');
const mdlVol = document.querySelector('.mdl-vol');
const mdlJig = document.querySelector('.mdl-jig');
const mdlSoft = document.querySelector('.mdl-soft');
const projectDesc = document.getElementById('project-description');

const avatarImg = document.getElementById('discord-avatar');
const statusDot = document.getElementById('discord-status-dot');
const nameText = document.getElementById('discord-name');
const tagText = document.getElementById('discord-tag');
const spotifyCard = document.getElementById('spotify-card');
const spotifyArt = document.getElementById('spotify-art');
const spotifySong = document.getElementById('spotify-song');
const spotifyArtist = document.getElementById('spotify-artist');

let pts = [];

m.onclick = () => {
    nr.classList.toggle('show');
};

const gtBg = document.createElement('div');
gtBg.className = 'gt-bg';
gt.insertBefore(gtBg, gt.firstChild);

gt.onclick = () => {
    mc.style.display = 'block';
    document.body.classList.add('mc-active');
    gt.classList.add('h');
    const slash = document.getElementById('slash-flash');
    if (slash) {
        slash.classList.add('active');
    }
    const audio = new Audio('https://files.catbox.moe/7m6zyt.mp3');
    audio.play().catch(e => {});
};

art.textContent = thighs;

async function fetchLanyard() {
    try {
        const res = await fetch('https://api.lanyard.rest/v1/users/423953946827161610');
        const data = await res.json();
        if (data.success && data.data) {
            const user = data.data.discord_user;
            if (user.avatar) {
                avatarImg.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
                avatarImg.style.display = 'block';
            }
            nameText.textContent = user.global_name || user.username;
            tagText.textContent = `@${user.username}`;
            
            statusDot.className = 'status-indicator ' + data.data.discord_status;
            
            if (data.data.listening_to_spotify && data.data.spotify) {
                const sp = data.data.spotify;
                spotifyArt.src = sp.album_art_url;
                spotifySong.textContent = sp.song;
                spotifyArtist.textContent = sp.artist;
                spotifyCard.style.display = 'flex';
                const wave = document.getElementById('spotify-wave');
                if (wave) wave.style.display = 'flex';
                localStorage.setItem('sativa-last-spotify', JSON.stringify({
                    s: sp.song,
                    a: sp.artist,
                    art: sp.album_art_url
                }));
            } else {
                const last = localStorage.getItem('sativa-last-spotify');
                if (last) {
                    const sp = JSON.parse(last);
                    spotifyArt.src = sp.art;
                    spotifySong.textContent = sp.s;
                    spotifyArtist.textContent = 'Last played: ' + sp.a;
                    spotifyCard.style.display = 'flex';
                    const wave = document.getElementById('spotify-wave');
                    if (wave) wave.style.display = 'none';
                } else {
                    spotifyCard.style.display = 'none';
                }
            }
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    } catch (e) {}
}

async function init() {
    if (logoArt) {
        logoArt.innerHTML = '';
        for (let i = 0; i < sativaText.length; i++) {
            const c = sativaText[i];
            if (c === '\n') {
                logoArt.appendChild(document.createElement('br'));
            } else if (c === ' ') {
                const s = document.createElement('span');
                s.style.whiteSpace = 'pre';
                s.textContent = ' ';
                logoArt.appendChild(s);
            } else {
                const s = document.createElement('span');
                s.className = 'ascii-char';
                s.textContent = c;
                s.addEventListener('click', (e) => {
                    s.classList.add('wave-active');
                    setTimeout(() => s.classList.remove('wave-active'), 600);
                    for (let j = 0; j < 10; j++) {
                        pts.push({
                            x: e.clientX,
                            y: e.clientY,
                            vx: (Math.random() - 0.5) * 6,
                            vy: (Math.random() - 0.5) * 6 - 2,
                            r: Math.random() * 8 + 6,
                            alpha: 0.8,
                            color: Math.random() > 0.5 ? '#ff3b30' : '#ff9f0a'
                        });
                    }
                });
                logoArt.appendChild(s);
            }
        }
    }

    document.querySelectorAll('.p-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('data-id');
            if (!id) return;
            e.preventDefault();
            nr.classList.remove('show');
            const d = DAT[id];
            if (d) {
                mdlH.textContent = d.n.toUpperCase();
                mdlSz.textContent = d.c;
                mdlVol.textContent = d.v;
                mdlJig.textContent = 'High Complexity';
                mdlSoft.textContent = '9.8/10';
                
                let descContent = d.desc;
                if (id === 'BBS') {
                    descContent += '<br><br><a href="https://boobs.lat" target="_blank" class="b" style="margin-top: 10px; width: 100%; text-align: center; font-weight: bold; background: var(--acc-boobs); color: #000; border: none;">Go to site</a>';
                }
                projectDesc.innerHTML = descContent;
                
                mdl.style.display = 'flex';
                setTimeout(() => mdl.classList.add('show'), 10);
            }
        });
    });

    fetchLanyard();
    setInterval(fetchLanyard, 15000);
    
    setupTabNav();
    setupTelemetry();

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function setupTabNav() {
    const btns = document.querySelectorAll('.db-tab-btn');
    const panes = document.querySelectorAll('.db-pane');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`pane-${tabId}`).classList.add('active');
        });
    });
}

function setupActivityFeed() {
    const feed = document.getElementById('activity-feed');
    const msgs = [
        "Established secure tunnel uplink to sativacdf core",
        "Refreshed cryptographic credential tokens",
        "Scanned database buffers for index optimization",
        "Completed handshake with edge nodes",
        "Pushed system telemetry tick to interface dashboard",
        "Flushed temporary cache allocations"
    ];
    
    setInterval(() => {
        if (!feed) return;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        
        const div = document.createElement('div');
        div.className = 'act-item';
        div.innerHTML = `<span class="act-time">${timeStr}</span><span class="act-text">${msg}</span>`;
        feed.insertBefore(div, feed.firstChild);
        
        if (feed.children.length > 8) {
            feed.removeChild(feed.lastChild);
        }
    }, 6000);
}

function setupTelemetry() {
    const latEl = document.getElementById('node-latency');
    const pngEl = document.getElementById('node-ping');
    
    const updTime = () => {
        const timeEl = document.getElementById('user-time');
        const offsetEl = document.getElementById('user-offset');
        if (!timeEl || !offsetEl) return;
        
        const options = {
            timeZone: 'America/New_York',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        timeEl.textContent = formatter.format(new Date());
        
        const visitorOffsetMin = new Date().getTimezoneOffset();
        const nyDate = new Date();
        const nyTime = new Date(nyDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const utcTime = new Date(nyDate.toLocaleString('en-US', { timeZone: 'UTC' }));
        const nyOffsetMin = Math.round((utcTime - nyTime) / 60000);
        
        const diffHours = (nyOffsetMin - visitorOffsetMin) / 60;
        if (diffHours === 0) {
            offsetEl.textContent = 'same time';
        } else if (diffHours > 0) {
            offsetEl.textContent = `${Math.abs(diffHours).toFixed(0)}h behind you`;
        } else {
            offsetEl.textContent = `${Math.abs(diffHours).toFixed(0)}h ahead of you`;
        }
    };

    updTime();
    setInterval(updTime, 1000);
    
    setInterval(() => {
        if (latEl && pngEl) {
            const lat = Math.floor(8 + Math.random() * 12);
            const png = Math.floor(lat + (Math.random() * 6 - 3));
            latEl.textContent = `${lat} ms`;
            pngEl.textContent = `${png} ms`;
        }
    }, 2500);
}

mdlCls.onclick = () => {
    mdl.classList.remove('show');
    setTimeout(() => mdl.style.display = 'none', 300);
};

window.onclick = e => {
    if (e.target === mdl) { mdl.classList.remove('show'); setTimeout(() => mdl.style.display = 'none', 300); }
};

const canvas = document.getElementById('vfx-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    
    const addParticles = (x, y) => {
        for (let i = 0; i < 3; i++) {
            pts.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                r: Math.random() * 3 + 1,
                alpha: 1
            });
        }
    };
    
    window.addEventListener('mousemove', (e) => {
        addParticles(e.clientX, e.clientY);
    });
    
    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
            addParticles(e.touches[0].clientX, e.touches[0].clientY);
        }
    });
    
    const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = pts.length - 1; i >= 0; i--) {
            const p = pts[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.02;
            if (p.alpha <= 0) {
                pts.splice(i, 1);
                continue;
            }
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color || '#ff3b30';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        requestAnimationFrame(loop);
    };
    loop();
}

init();
