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
        }
    } catch (e) {}
}

async function init() {
    document.querySelectorAll('.p-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('data-id');
            if (!id) return;
            e.preventDefault();
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
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

mdlCls.onclick = () => {
    mdl.classList.remove('show');
    setTimeout(() => mdl.style.display = 'none', 300);
};

window.onclick = e => {
    if (e.target === mdl) { mdl.classList.remove('show'); setTimeout(() => mdl.style.display = 'none', 300); }
};

init();
