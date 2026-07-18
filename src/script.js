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
            
            if (user.public_flags !== undefined) {
                renderBadges(user.public_flags);
            }
            
            let curr = null;
            if (data.data.listening_to_spotify && data.data.spotify) {
                curr = data.data.spotify;
                localStorage.setItem('sativa-last-spotify', JSON.stringify({
                    s: curr.song,
                    a: curr.artist,
                    art: curr.album_art_url
                }));
                const wave = document.getElementById('spotify-wave');
                if (wave) wave.style.display = 'flex';
            } else {
                const wave = document.getElementById('spotify-wave');
                if (wave) wave.style.display = 'none';
            }
            
            renderMusicLog(curr);
        }
    } catch (e) {}
}

function renderMusicLog(curr) {
    const listEl = document.getElementById('music-log-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    
    let track = null;
    if (curr) {
        track = {
            s: curr.song,
            a: curr.artist,
            art: curr.album_art_url,
            active: true
        };
    } else {
        const lastSaved = localStorage.getItem('sativa-last-spotify');
        if (lastSaved) {
            const parsed = JSON.parse(lastSaved);
            track = {
                s: parsed.s,
                a: parsed.a,
                art: parsed.art,
                active: false,
                last: true
            };
        }
    }
    
    if (track) {
        const div = document.createElement('div');
        div.className = `music-log-item ${track.active ? 'active-now' : ''}`;
        div.innerHTML = `
            <img src="${track.art || 'https://files.catbox.moe/e7tfw0.jpg'}" onerror="this.onerror=null; this.src='https://files.catbox.moe/e7tfw0.jpg';" alt="Art">
            <div class="music-log-details">
                <span class="song-title">${track.s}</span>
                <span class="song-artist">${track.active ? 'Listening Now' : 'Last Played: ' + track.a}</span>
            </div>
        `;
        listEl.appendChild(div);
    }
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
    const viewEl = document.getElementById('view-count');
    
    if (viewEl) {
        let count = parseInt(localStorage.getItem('sativa-views') || '1342');
        count++;
        localStorage.setItem('sativa-views', count.toString());
        viewEl.textContent = count.toLocaleString();
    }
    
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
        if (latEl) {
            const lat = Math.floor(8 + Math.random() * 12);
            latEl.textContent = `${lat} ms`;
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

function renderBadges(flags) {
    const badgesEl = document.getElementById('discord-badges');
    if (!badgesEl) return;
    badgesEl.innerHTML = '';
    
    const activeDev = 1 << 22;
    const staff = 1 << 0;
    const partner = 1 << 1;
    const bravery = 1 << 6;
    const brilliance = 1 << 7;
    const balance = 1 << 8;
    const early = 1 << 9;

    const list = [];
    if (flags & activeDev) {
        list.push({
            name: "Active Developer",
            svg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5865F2" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 3px rgba(88,101,242,0.6));"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`
        });
    }
    if (flags & staff) {
        list.push({
            name: "Discord Staff",
            svg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
        });
    }
    if (flags & partner) {
        list.push({
            name: "Partnered Server Owner",
            svg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007aff" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
        });
    }
    if (flags & early) {
        list.push({
            name: "Early Supporter",
            svg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff9f0a" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
        });
    }
    if (flags & bravery) {
        list.push({
            name: "HypeSquad Bravery",
            svg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9b59b6" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
        });
    }
    if (flags & brilliance) {
        list.push({
            name: "HypeSquad Brilliance",
            svg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f1c40f" stroke-width="2.5"><polygon points="12 2 22 12 12 22 2 12 12 2"></polygon></svg>`
        });
    }
    if (flags & balance) {
        list.push({
            name: "HypeSquad Balance",
            svg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`
        });
    }

    list.forEach(b => {
        const span = document.createElement('span');
        span.innerHTML = b.svg;
        span.title = b.name;
        badgesEl.appendChild(span);
    });
}

window.playKatanaAnim = function(type) {
    const w = document.getElementById('katana-nav-blade');
    if (!w) return;
    w.classList.remove('anim-unsheathe', 'anim-slash', 'anim-combined');
    void w.offsetWidth;
    w.classList.add('anim-' + type);
    
    if (type === 'slash' || type === 'combined') {
        const audio = new Audio('https://files.catbox.moe/7m6zyt.mp3');
        audio.play().catch(e => {});
        const sf = document.getElementById('slash-flash');
        if (sf) {
            sf.classList.remove('active');
            void sf.offsetWidth;
            sf.classList.add('active');
        }
    }
};

const kWrap = document.getElementById('katana-nav-blade');
const kMenu = document.getElementById('katana-menu');
if (kWrap && kMenu) {
    kWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        kMenu.classList.toggle('show');
    });
    document.addEventListener('click', () => {
        kMenu.classList.remove('show');
    });
}

function initTilt() {
    const cards = document.querySelectorAll('.profile-card, .contact-card, .proj-card, .system-status, .spotify-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            
            const tiltX = ((y - cy) / cy) * -8;
            const tiltY = ((x - cx) / cx) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
            card.style.transition = 'transform 0.05s ease';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            card.style.transition = 'transform 0.5s ease';
        });
    });
}

initTilt();
init();
