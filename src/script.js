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

m.onclick = () => {
    nr.classList.toggle('show');
};

const gtBg = document.createElement('div');
gtBg.className = 'gt-bg';
gt.insertBefore(gtBg, gt.firstChild);

gt.onclick = () => {
    mc.style.display = 'block';
    gt.classList.add('h');
    const audio = new Audio('https://files.catbox.moe/7m6zyt.mp3');
    audio.play().catch(e => {});
};

art.textContent = thighs;
logoArt.textContent = sativaText;

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
            } else {
                spotifyCard.style.display = 'none';
            }
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    } catch (e) {}
}

async function init() {
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
    setupTerm();
    setupSynth();
    setupGame();
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

function setupTerm() {
    const termScr = document.getElementById('term-scr');
    const termIn = document.getElementById('term-in');
    
    const prn = (txt, cls = '') => {
        const div = document.createElement('div');
        div.className = `term-line ${cls}`;
        div.innerHTML = txt;
        termScr.appendChild(div);
        termScr.scrollTop = termScr.scrollHeight;
    };

    termIn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const raw = termIn.value.trim();
            termIn.value = '';
            if (!raw) return;
            prn(`sativa@guest:~$ ${raw}`, 'usr-cmd');
            
            const args = raw.toLowerCase().split(' ');
            const cmd = args[0];
            
            switch (cmd) {
                case 'help':
                    prn('Commands: help, hack, matrix, joke, play, clear, about, languages');
                    break;
                case 'clear':
                    termScr.innerHTML = '';
                    break;
                case 'about':
                    prn('I go by sativa and like to build stuff. Hardened systems engineering and cryptanalysis.');
                    break;
                case 'languages':
                    prn('Active skills: Golang, JavaScript, Python, Java.');
                    break;
                case 'play':
                    playTone(440, 'triangle', 0.3);
                    prn('Tone generated: A4 (440Hz)');
                    break;
                case 'joke':
                    const jokes = [
                        "There are 10 types of people: those who understand binary, and those who don't.",
                        "Why do programmers wear glasses? Because they can't C#.",
                        "['hip', 'hip'] (hip hip array!)"
                    ];
                    prn(jokes[Math.floor(Math.random() * jokes.length)]);
                    break;
                case 'hack':
                    prn('Accessing mainframe...', 'acc-go');
                    let step = 0;
                    const runHack = () => {
                        const logs = [
                            '[INFO] Bypassing secure gateway firewall...',
                            '[WARN] Packet injection detected. Reshuffling token payload.',
                            '[OK] Port 8080 decrypted. Payload injection complete.',
                            '[SUCCESS] Access granted. Sativa cluster is online.'
                        ];
                        if (step < logs.length) {
                            prn(logs[step]);
                            step++;
                            setTimeout(runHack, 600);
                        }
                    };
                    setTimeout(runHack, 600);
                    break;
                case 'matrix':
                    prn('Streaming cipher sequence...');
                    let lineCount = 0;
                    const stream = setInterval(() => {
                        let line = '';
                        for (let i = 0; i < 40; i++) {
                            line += Math.random() > 0.5 ? '1' : '0';
                        }
                        prn(line, 'acc-go');
                        lineCount++;
                        if (lineCount > 15) clearInterval(stream);
                    }, 100);
                    break;
                default:
                    prn(`Command not found: ${cmd}. Type 'help' for suggestions.`);
            }
        }
    });
}

let actCtx = null;
function playTone(freq, wave, dur) {
    try {
        if (!actCtx) actCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (actCtx.state === 'suspended') actCtx.resume();
        const osc = actCtx.createOscillator();
        const gNode = actCtx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, actCtx.currentTime);
        gNode.gain.setValueAtTime(0.1, actCtx.currentTime);
        gNode.gain.exponentialRampToValueAtTime(0.01, actCtx.currentTime + dur);
        osc.connect(gNode);
        gNode.connect(actCtx.destination);
        osc.start();
        osc.stop(actCtx.currentTime + dur);
    } catch (e) {}
}

function setupSynth() {
    const waveSel = document.getElementById('synth-wave-type');
    document.querySelectorAll('.synth-key').forEach(key => {
        key.addEventListener('click', () => {
            const freq = parseFloat(key.getAttribute('data-note'));
            const wave = waveSel.value;
            playTone(freq, wave, 0.2);
            key.classList.add('active');
            setTimeout(() => key.classList.remove('active'), 150);
        });
    });
}

function setupGame() {
    let creds = 0;
    let cps = 0;
    
    const credsEl = document.getElementById('game-credits');
    const cpsEl = document.getElementById('game-cps');
    const coreBtn = document.getElementById('game-core-btn');
    
    const upgs = {
        gpu: { cost: 15, cps: 0.5, count: 0, el: document.getElementById('shop-gpu'), costEl: document.getElementById('cost-gpu') },
        quantum: { cost: 100, cps: 4.0, count: 0, el: document.getElementById('shop-quantum'), costEl: document.getElementById('cost-quantum') },
        ai: { cost: 500, cps: 25.0, count: 0, el: document.getElementById('shop-ai'), costEl: document.getElementById('cost-ai') }
    };

    const upd = () => {
        credsEl.textContent = Math.floor(creds);
        cpsEl.textContent = cps.toFixed(1);
        for (const k in upgs) {
            const u = upgs[k];
            u.costEl.textContent = `Cost: ${u.cost}`;
            if (creds >= u.cost) {
                u.el.style.opacity = '1';
                u.el.style.pointerEvents = 'auto';
            } else {
                u.el.style.opacity = '0.5';
                u.el.style.pointerEvents = 'none';
            }
        }
    };

    coreBtn.addEventListener('click', () => {
        creds += 1;
        playTone(300 + Math.random() * 200, 'sine', 0.05);
        upd();
    });

    for (const k in upgs) {
        const u = upgs[k];
        u.el.addEventListener('click', () => {
            if (creds >= u.cost) {
                creds -= u.cost;
                u.count++;
                cps += u.cps;
                u.cost = Math.floor(u.cost * 1.25);
                playTone(600, 'square', 0.1);
                upd();
            }
        });
    }

    setInterval(() => {
        if (cps > 0) {
            creds += cps / 10;
            upd();
        }
    }, 100);
    
    upd();
}

function setupTelemetry() {
    const latEl = document.getElementById('node-latency');
    const ldEl = document.getElementById('node-load');
    
    setInterval(() => {
        const lat = Math.floor(10 + Math.random() * 15);
        const ld = (Math.random() * 0.08 + 0.01).toFixed(3);
        latEl.textContent = `${lat} ms`;
        ldEl.textContent = `${ld}%`;
    }, 2000);
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
    let pts = [];
    
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
            ctx.fillStyle = '#ff3b30';
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
