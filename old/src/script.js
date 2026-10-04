const SATIVA_DEFAULT_SPOTIFY = {
  track_id: "5lZsh9Qf7CbHI9Fcc7Zcsq",
  song: "Bounce Out x Limerence",
  artist: "Limerence",
  album: "Bounce Out x Limerence",
  album_art_url: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02af41341020c85f2f2279aeb2",
  timestamps: {
    start: Date.now() - 75000,
    end: Date.now() + 90000
  }
};
function getSativaLastSpotify() {
  try {
    const saved = localStorage.getItem('sativa-last-spotify');
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return SATIVA_DEFAULT_SPOTIFY;
}
const CURATED_TRACKS = [
  {
    endTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    track: {
      name: "Bounce Out x Limerence",
      durationMs: 329000,
      explicit: false,
      artists: [{ name: "Limerence" }, { name: "Yves Tumor" }],
      albums: [{
        name: "Bounce Out x Limerence",
        image: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02af41341020c85f2f2279aeb2"
      }],
      externalIds: { spotify: ["5lZsh9Qf7CbHI9Fcc7Zcsq"] },
      spotifyPreview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/63/3a/9a/633a9af3-3962-ddc6-2a6d-a41ed22355cd/mzaf_17064792644112666738.plus.aac.p.m4a",
      appleMusicPreview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/63/3a/9a/633a9af3-3962-ddc6-2a6d-a41ed22355cd/mzaf_17064792644112666738.plus.aac.p.m4a"
    }
  },
  {
    endTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    track: {
      name: "Sundress",
      durationMs: 218000,
      explicit: false,
      artists: [{ name: "A$AP Rocky" }],
      albums: [{ image: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1a/c1/6a/1ac16a12-cfb5-269e-fa3e-ac9080ad420b/886447427460.jpg/600x600bb.jpg" }],
      externalIds: { spotify: ["2aPTvyE09vUCR0Vvj0I8WK"] },
      spotifyPreview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d6/8b/ec/d68bec2b-cafb-9463-2a31-43444f18f809/mzaf_7780389792608977942.plus.aac.p.m4a",
      appleMusicPreview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d6/8b/ec/d68bec2b-cafb-9463-2a31-43444f18f809/mzaf_7780389792608977942.plus.aac.p.m4a"
    }
  },
  {
    endTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    track: {
      name: "Her Pistol Go (Bang Bang)",
      durationMs: 144000,
      explicit: true,
      artists: [{ name: "DJ Yae" }],
      albums: [{ image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/da/01/8c/da018cac-1ffa-e627-aa52-3569ebe8e879/artwork.jpg/600x600bb.jpg" }],
      externalIds: { appleMusic: ["1785501865"] },
      spotifyPreview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/2a/dd/1b/2add1b23-5c28-e795-9bfd-dd09a1265e2c/mzaf_15459223967044214819.plus.aac.p.m4a",
      appleMusicPreview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/2a/dd/1b/2add1b23-5c28-e795-9bfd-dd09a1265e2c/mzaf_15459223967044214819.plus.aac.p.m4a"
    }
  },
  {
    endTime: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    track: {
      name: "Touch The Sky (feat. Lupe Fiasco)",
      durationMs: 237000,
      explicit: true,
      artists: [{ name: "Kanye West" }],
      albums: [{ image: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/0e/90/3c/0e903c43-9d81-f91b-90f1-727a58f7fb2c/00602498824030.rgb.jpg/600x600bb.jpg" }],
      externalIds: { spotify: ["2DXA4ga4e3lJ13b7h9Wv76"] },
      spotifyPreview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/45/03/92/450392a8-9829-b7fd-8a6b-b8b8831d3790/mzaf_14545688503375738268.plus.aac.p.m4a",
      appleMusicPreview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/45/03/92/450392a8-9829-b7fd-8a6b-b8b8831d3790/mzaf_14545688503375738268.plus.aac.p.m4a"
    }
  }
];
const FALLBACK_STREAMS = CURATED_TRACKS;const vars={ws:{socket:null,heartbeat:null,connectionFailures:0,reconnectTimer:null,offlineTimeout:null,isOffline:!1},player:{spotifyData:null,progressRafId:null,currentSongTab:"recent",switchCooldown:!1,refreshCooldown:!1,loading:{recent:!1,top:!1}},audio:{currentAudio:null,currentPlayingButton:null,lastVolume:(()=>{try{let e=Number(localStorage.getItem("volume"));return e>0?Math.min(1,e):.67}catch(t){return .67}})(),loadingTimeout:null,spinnerWasVisible:!1,isSeeking:!1},visualizer:{audioContext:null,dataArray:null,analyser:null,sourceNode:null,animationFrameId:null,gainNode:null,isInitialized:!1,isPlaying:!1,currentBarHeights:[]},lyrics:{currentLyrics:[],cachedLyricLines:[],active:!1,isFullscreen:!1,currentTrackId:null,lastActiveLineIndex:-1,pinRafId:null,noLyrics:new Map},statsfm:{enabled:!1,discordPlaying:!1,timer:null,controller:null,inFlight:!1,lastFetch:0,idleStreak:0,errorStreak:0,settleStreak:0,data:null},misc:{imageObserver:null,controllerRegistry:new Map,timestampsInterval:null}},PLACEHOLDER_IMG="assets/sativa_avatar.gif",STATUS_MAP={online:{icon:"assets/states/online.png",label:"Online"},idle:{icon:"assets/states/idle.png",label:"Idle"},dnd:{icon:"assets/states/dnd.png",label:"Do Not Disturb"},offline:{icon:"assets/states/offline.png",label:"Offline"},streaming:{icon:"assets/states/streaming.png",label:"Streaming"}},CONFIG={discordId:"423953946827161610",statsFmId:"sativa"};if(!function(){let e="...................../$$................./$$......\n....................|.$$................|.$$......\n../$$$$$$$../$$$$$$$|.$$$$$$$../$$.../$$|.$$$$$$$ \n./$$_____/./$$_____/|.$$__..$$|.$$..|.$$|.$$__..$$\n|..$$$$$$.|.$$......|.$$..\\.$$|.$$..|.$$|.$$..\\.$$\n.\\____..$$|.$$......|.$$..|.$$|.$$..|.$$|.$$..|.$$\n./$$$$$$$/|..$$$$$$$|.$$..|.$$|..$$$$$$/|.$$..|.$$\n|_______/..\\_______/|__/..|__/.\\______/.|__/..|__/".replace(/\./g," "),t="made by schuh with lots of love <3",r="build v2.1.3 @ July 26, 2026",a=new Map;console.load=function(e,t=100,r=null){return new Promise(s=>{let i=(e,a,i)=>{let n=t||i,l=`display: inline-block; font-size: 0px; line-height: 0px; color: transparent; padding: ${n/2}px ${(r||n*a/i)/2}px; background: url(${e}) no-repeat; background-size: contain;`;console.log("%c ",l),s(!0)},n=0!==e.indexOf("blob:"),l=n?a.get(e):null;if(l){setTimeout(()=>i(l.dataUrl,l.naturalWidth,l.naturalHeight),0);return}fetch(e).then(e=>e.blob()).then(t=>{if(0!==t.type.indexOf("image")||t.size>8192&&(!window.chrome||navigator.userAgent.indexOf("Firefox")>0))return s(!1);let r=new FileReader;r.onloadend=()=>{let t=r.result,l=new Image;l.onload=function(){n&&a.set(e,{dataUrl:t,naturalWidth:l.naturalWidth,naturalHeight:l.naturalHeight}),i(t,l.naturalWidth,l.naturalHeight)},l.onerror=()=>s(!1),l.src=t},r.readAsDataURL(t)}).catch(()=>{s(!1)})})};let s=()=>{if(s.running)return;s.running=!0;let a=a=>{if(!a){let i="",n=[],l=e.split("\n");l.forEach((e,t)=>{for(let r=0;r<e.length;r++){let a=190+1.4*r+8*t;i+=`%c${e[r]}`,n.push(`color:hsl(${a},100%,65%);font-family:monospace;font-weight:900;`)}i+="\n"}),console.log(i,...n)}let o=()=>{let e="",r=[];for(let a=0;a<t.length;a++)if(e+="%c"+t[a],a>=8&&a<=12){let s=1-Math.abs(2*((a-8)/4)-1),i=Math.round(180+55*s);r.push(`color:rgb(${i},${i},${i});font-family:Consolas,monaco,monospace;font-weight:bold;`)}else if(a>=27){let n=(a-27)/(t.length-28),l=1-Math.abs(2*n-1),o=Math.round(60+75*l),c=Math.round(68+70*l);r.push(`color:rgb(255,${o},${c});font-family:Consolas,monaco,monospace;font-weight:bold;`)}else r.push("color:#8a8a8a;font-family:Consolas,monaco,monospace;font-weight:bold;");console.log(e,...r)},c=()=>{let e="",t=[];for(let a=0;a<r.length;a++){e+="%c"+r[a];let s=140+a*(80/r.length);t.push(`color:rgb(${s},${s},${s}); font-family:monospace; font-size: 10px; font-weight:bold;`)}console.log(e,...t)};window.chrome?console.load("assets/tagline.svg",13).then(e=>{e||o(),c(),s.running=!1}):(o(),c(),s.running=!1)};console.load("assets/console.png",250,500).then(a)},i=console.clear,n=function(){if(i&&i.apply(console,arguments),"function"==typeof window._stopBadApple)try{window._stopBadApple()}catch(e){}s()};console.clear=n,console.cls=n;try{Object.defineProperty(window,"clear",{configurable:!0,get:()=>(setTimeout(n,0),function(){})}),Object.defineProperty(window,"cls",{configurable:!0,get:()=>(setTimeout(n,0),function(){})});let l=!1;if(Object.defineProperty(window,"clearcache",{get:()=>l?()=>"Already clearing..":(l=!0,(async()=>{try{if("serviceWorker"in navigator){let e=await navigator.serviceWorker.getRegistrations();await Promise.allSettled(e.map(e=>e.unregister()))}if(window.caches){let t=await caches.keys();await Promise.allSettled(t.map(e=>caches.delete(e)))}let r=[location.href];document.querySelectorAll("script[src]").forEach(e=>r.push(e.src)),document.querySelectorAll('link[rel="stylesheet"][href]').forEach(e=>r.push(e.href)),await Promise.allSettled(r.map(e=>fetch(e,{cache:"reload"})))}catch(a){}location.reload()})(),()=>"Clearing cache..")}),window.chrome){let o=!1;Object.defineProperty(window,"badapple",{get(){if(o)return()=>"Bad Apple is already playing!";o=!0;let e=String.fromCharCode(60,33,45,45),t=String.fromCharCode(45,45,62),r=!1,a=()=>{o=!1,window._badAppleAudio=null};return window._stopBadApple=()=>{r=!0,window._badAppleAudio?.pause(),a()},fetch("assets/badapple.svg").then(e=>e.text()).then(s=>{let i=s.lastIndexOf(e),n=s.slice(0,i),l=s.slice(i+e.length).split(t)[0],o=new Audio("data:audio/mp3;base64,"+l);o.volume=.3,o.onended=a,o.onerror=a;let c=URL.createObjectURL(new Blob([n+e+Date.now()+t],{type:"image/svg+xml"}));console.load(c,250).then(e=>{if(URL.revokeObjectURL(c),!e)return a();r||(window._badAppleAudio?.pause(),window._badAppleAudio=o,setTimeout(()=>{r||o.play().catch(a)},600))})}).catch(a),()=>"Loading.."}})}}catch(c){}s()}(),"serviceWorker"in navigator){let e=()=>{navigator.serviceWorker.register("/assets/sw.js",{scope:"/"}).catch(()=>{})};"complete"===document.readyState?e():window.addEventListener("load",e,{once:!0})}function glIndicatesSoftware(){let e=document.createElement("canvas");e.width=e.height=1;let t=e.getContext("webgl")||e.getContext("experimental-webgl");if(!t)return!1;let r="";try{let a=t.getExtension("WEBGL_debug_renderer_info");a&&(r=String(t.getParameter(a.UNMASKED_RENDERER_WEBGL)||""))}catch(s){}if(!r)try{r=String(t.getParameter(t.RENDERER)||"")}catch(i){}try{t.getExtension("WEBGL_lose_context")?.loseContext()}catch(n){}return/swiftshader|llvmpipe|softpipe|lavapipe|microsoft basic|basic render|\bsoftware\b|mesa offscreen|apple software/i.test(r)}function checkHardwareAcceleration(){try{if(glIndicatesSoftware())return!1}catch(e){}try{let t=!1;if(document.createElement("canvas").getContext("2d",{get willReadFrequently(){return t=!0,!1}}),!t)return!0;let r=e=>{let t=document.createElement("canvas");t.width=128,t.height=128;let r=t.getContext("2d",{willReadFrequently:e});return r.moveTo(.5,.5),r.lineTo(120.3,121.7),r.stroke(),r.getImageData(0,0,128,128).data},a=r(!1),s=r(!0);for(let i=0;i<s.length;i++)if(s[i]!==a[i])return!0;return!1}catch(n){return!0}}const whenIdle=(e,t=1e3)=>"function"==typeof requestIdleCallback?requestIdleCallback(e,{timeout:t}):"complete"===document.readyState?setTimeout(e,500):void addEventListener("load",()=>setTimeout(e,500),{once:!0}),whenVisible=e=>{if(!document.hidden)return e();let t=()=>{document.hidden||(document.removeEventListener("visibilitychange",t),e())};document.addEventListener("visibilitychange",t)};function confirmSoftwareRendering(e,t,r){if(!checkHardwareAcceleration()){if(e<=1)return r();setTimeout(()=>confirmSoftwareRendering(e-1,t,r),t)}}const showHwWarning=()=>{let e=document.getElementById("hw-warning-popup");e&&(e.hidden=!1,e.offsetWidth,e.classList.add("visible"))};function escapeHTML(e){return e?e.toString().replace(/[&<>'"`\/]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;","`":"&#96;","/":"&#x2F;"})[e]):""}function cleanupSocket(){vars.ws.socket&&(vars.ws.socket.onopen=vars.ws.socket.onmessage=vars.ws.socket.onerror=vars.ws.socket.onclose=null,(vars.ws.socket.readyState===WebSocket.OPEN||vars.ws.socket.readyState===WebSocket.CONNECTING)&&vars.ws.socket.close(),vars.ws.socket=null),vars.ws.heartbeat&&(clearInterval(vars.ws.heartbeat),vars.ws.heartbeat=null)}function connect(){if(vars.ws.socket&&(vars.ws.socket.readyState===WebSocket.OPEN||vars.ws.socket.readyState===WebSocket.CONNECTING))return;cleanupSocket(),void 0===vars.ws.urlIndex&&(vars.ws.urlIndex=0),void 0===vars.ws.connectionFailures&&(vars.ws.connectionFailures=0);let e="function"==typeof DecompressionStream,t=e?"?compression=zlib_json":"",r=["wss://api.lanyard.rest/socket"+t,"wss://api.lanyard.rest/socket"+t],a;try{a=new WebSocket(r[vars.ws.urlIndex])}catch(s){vars.ws.urlIndex=(vars.ws.urlIndex+1)%r.length,vars.ws.connectionFailures++,vars.ws.offlineTimeout||(vars.ws.offlineTimeout=setTimeout(()=>{updateStatusDisconnected(),vars.ws.offlineTimeout=null},3e3)),navigator.onLine&&(vars.ws.reconnectTimer&&clearTimeout(vars.ws.reconnectTimer),vars.ws.reconnectTimer=setTimeout(connect,Math.min(3e4,1e3*Math.pow(2,vars.ws.connectionFailures-1))+500*Math.random()));return}vars.ws.socket=a;let i=0,n=!1,l=setTimeout(()=>{if(a.readyState===WebSocket.CONNECTING)try{a.close()}catch(e){}},1e4);a.onopen=()=>{a===vars.ws.socket&&(clearTimeout(l),i=Date.now(),vars.ws.reconnectTimer&&(clearTimeout(vars.ws.reconnectTimer),vars.ws.reconnectTimer=null))};let o=async t=>{let r=t.data;if(t.data instanceof Blob)try{if(e){let s=new DecompressionStream("deflate");r=await new Response(t.data.stream().pipeThrough(s)).text()}else r=await t.data.text()}catch(i){return}if(a!==vars.ws.socket)return;let l;try{l=JSON.parse(r)}catch(o){return}switch(l.op){case 1:{let c=l.d?.heartbeat_interval||3e4;try{a.send(JSON.stringify({op:2,d:{subscribe_to_ids:[CONFIG.discordId]}}))}catch(d){return}vars.ws.heartbeat&&clearInterval(vars.ws.heartbeat),vars.ws.heartbeat=setInterval(()=>{if(a===vars.ws.socket&&a.readyState===WebSocket.OPEN)try{a.send(JSON.stringify({op:3}))}catch(e){}},c);break}case 0:if("INIT_STATE"===l.t||"PRESENCE_UPDATE"===l.t){vars.ws.offlineTimeout&&(clearTimeout(vars.ws.offlineTimeout),vars.ws.offlineTimeout=null),vars.ws.isOffline=!1,n=!0,document.getElementById("profile-loader")?.classList.add("hidden"),document.getElementById("spotify-loader")?.classList.add("hidden");let u="INIT_STATE"===l.t?l.d[CONFIG.discordId]:l.d;updateStatus(u);document.getElementById("profile-loader")?.classList.add("hidden");document.getElementById("spotify-loader")?.classList.add("hidden");}}},c=Promise.resolve();a.onmessage=e=>{c=c.then(()=>o(e)).catch(()=>{})},a.onerror=()=>{try{a.close()}catch(e){}},a.onclose=()=>{if(clearTimeout(l),a!==vars.ws.socket)return;cleanupSocket();let e=i?Date.now()-i:0;n&&e>=5e3&&(vars.ws.connectionFailures=0),vars.ws.connectionFailures++,(!n||e<5e3)&&(vars.ws.urlIndex=(vars.ws.urlIndex+1)%r.length),vars.ws.offlineTimeout||(vars.ws.offlineTimeout=setTimeout(()=>{updateStatusDisconnected(),vars.ws.offlineTimeout=null},3e3));let t=3e4,s=Math.min(t,1e3*Math.pow(2,vars.ws.connectionFailures-1));vars.ws.connectionFailures<2&&(s=500),s+=500*Math.random(),navigator.onLine&&(vars.ws.reconnectTimer&&clearTimeout(vars.ws.reconnectTimer),vars.ws.reconnectTimer=setTimeout(connect,s))}}function formatTime(e){return isNaN(e)?"0:00":`${Math.floor(e/60)}:${Math.floor(e%60).toString().padStart(2,"0")}`}function progressLoop(){updateProgress(),vars.player.progressRafId=requestAnimationFrame(progressLoop)}function parseLyricsFile(e){if(!e||"string"!=typeof e)return[];let t=e.split("\n"),r=0;for(;r<t.length&&"lines:"!==t[r].trim();)r++;if(r>=t.length)return[];r++;let a=e=>{let t=e.trim();return t.length>1&&'"'===t[0]&&'"'===t[t.length-1]?t.slice(1,-1).replace(/\\"/g,'"').replace(/\\n/g,"\n").replace(/\\\\/g,"\\"):t.length>1&&"'"===t[0]&&"'"===t[t.length-1]?t.slice(1,-1).replace(/''/g,"'"):t},s=e=>{let t=parseInt(e.trim(),10);return isNaN(t)?null:t},i=[],n=-1,l=-1,o=null,c=null,d=!1;for(;r<t.length;r++){var u;let m=t[r];if(!m.trim())continue;let y=(u=m).length-u.replace(/^ +/,"").length,p=m.trim(),v=p.startsWith("- ")||"-"===p;if(!v&&0===y)break;if(v){let g="-"===p?"":p.slice(2);if(-1===n&&(n=y),y===n){o={time:null,endTime:null,text:"",words:null},i.push(o),d=!1,c=null,l=-1;let f=g.match(/^text:\s?(.*)$/);f&&(o.text=a(f[1]));continue}if(d&&o&&(-1===l&&(l=y),y===l)){c={text:"",time:null},o.words.push(c);let $=g.match(/^text:\s?(.*)$/);$&&(c.text=a($[1]))}continue}if(!o)continue;let h=p.match(/^([a-z_]+):\s?(.*)$/);if(!h)continue;let _=h[1],b=h[2];if(d&&c&&-1!==l&&y>l){if("text"===_)c.text=a(b);else if("start_ms"===_){let w=s(b);c.time=null===w?null:w/1e3}continue}if(y===n+2){if("words"===_)""===b.trim()?(o.words=[],d=!0,l=-1):(o.words=null,d=!1);else if(d=!1,"text"===_)o.text=a(b);else if("start_ms"===_){let L=s(b);o.time=null===L?null:L/1e3}else if("end_ms"===_){let I=s(b);o.endTime=null===I?null:I/1e3}}}return i.filter(e=>null!==e.time&&!isNaN(e.time)).map(e=>{let t=e.words&&e.words.length?e.words.filter(e=>null!==e.time&&!isNaN(e.time)).map(e=>({text:e.text,time:e.time})):null;return{time:e.time,endTime:null!==e.endTime&&!isNaN(e.endTime)&&e.endTime>e.time?e.endTime:null,text:e.text,isInstrumental:!e.text.trim(),words:t&&t.length?t:null}}).sort((e,t)=>e.time-t.time)}function rememberNoLyrics(e,t){e&&(vars.lyrics.noLyrics.size>100&&vars.lyrics.noLyrics.clear(),vars.lyrics.noLyrics.set(e,t))}function showNoLyrics(e,t){let r=document.getElementById("lyrics-content"),a="unconfirmed"===e;if(r.innerHTML=a?`<div class="lyrics-status-message" style="flex-direction: column;"> <span>No lyrics found</span> <button class="retry-lyrics-btn" id="retry-lyrics-btn">Try again</button> </div>`:"instrumental"===e?'<div class="lyrics-status-message">No lyrics found<br>(instrumental)</div>':'<div class="lyrics-status-message">No lyrics found</div>',r.classList.add("locked"),r.dataset.state="empty",vars.lyrics.currentLyrics=[],setLyricsBtnDisabled("none"===e),a&&t){let s=document.getElementById("retry-lyrics-btn");s&&s.addEventListener("click",t)}}function parseLyricsFilePlain(e){if(!e||"string"!=typeof e)return"";let t=e.split("\n"),r=t.findIndex(e=>/^\s*plain:\s*\|/.test(e));if(-1===r)return"";r++;let a=[],s=null;for(;r<t.length;r++){let i=t[r].replace(/\r$/,"");if(!i.trim()){a.push("");continue}let n=i.length-i.replace(/^ +/,"").length;if(null===s&&(s=n),n<s)break;a.push(i.slice(s))}for(;a.length&&!a[a.length-1].trim();)a.pop();return a.join("\n")}function parseLrc(e){let t=e.split("\n"),r=[],a=/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;for(let s of t){let i=[...s.matchAll(a)];if(0===i.length)continue;let n=s.replace(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g,"").trim(),l=!n;for(let o of i){let c=parseInt(o[1],10),d=parseInt(o[2],10),u=o[3],m=u?parseInt(u,10)/Math.pow(10,u.length):0,y=60*c+d+m;r.push({time:y,text:n,isInstrumental:l})}}return r.sort((e,t)=>e.time-t.time),r.filter((e,t,r)=>!(e.isInstrumental&&t>0&&r[t-1].isInstrumental))}function updateLyricsHeader(e,t,r,a=!1){let s=document.getElementById("lyrics-backdrop"),i=document.getElementById("lyrics-song-title"),n=document.getElementById("lyrics-song-artist");s.style.backgroundImage=r&&"null"!==r?`url(${r})`:"none",i.textContent=e,n.textContent=t.replace(/; /g,", "),a&&(triggerUpdateAnimation(s),triggerUpdateAnimation(i),triggerUpdateAnimation(n),triggerUpdateAnimation(document.getElementById("lyrics-content")))}function restoreOrFetchLyrics(e,t,r,a,s){let i=document.getElementById("lyrics-content"),n=!i.querySelector(".lyric-line"),l=(a.end-a.start)/1e3;if(!n)return;let o=vars.misc.controllerRegistry.get("lyrics-fetch");if(!o||o.signal.aborted||"loading"!==i.dataset.state||i.dataset.currentTrackId!==s){if(vars.lyrics.currentLyrics.length>0){i.classList.remove("locked"),i.dataset.state="",renderLyrics();let c=void 0===vars.lyrics.currentLyrics[0].time;i.classList.toggle("unsynced",c),document.getElementById("unsynced-label").style.display=c?"block":"none"}else fetchLyrics(e,t,r,l,s)}}async function fetchLyrics(e,t,r,a,s,i){let n=document.getElementById("lyrics-content"),l=document.getElementById("unsynced-label"),o=vars.misc.controllerRegistry.get("lyrics-fetch");o&&o.abort();let c=new AbortController;vars.misc.controllerRegistry.set("lyrics-fetch",c);let{signal:d}=c;n.dataset.currentTrackId=s,n.classList.remove("unsynced"),n.classList.add("locked"),n.dataset.state="loading",n.innerHTML='<div class="lyrics-status-message loading">Loading..</div>',l.style.display="none",vars.lyrics.currentLyrics=[],document.getElementById("lyrics-song-title").textContent=e,document.getElementById("lyrics-song-artist").textContent=t.replace(/; /g,", "),i&&vars.lyrics.noLyrics.delete(s);let u=i?null:vars.lyrics.noLyrics.get(s);if(u){showNoLyrics(u,()=>fetchLyrics(e,t,r,a,s,!0));return}try{let m=t.split(";")[0].trim(),y=`track_name=${encodeURIComponent(e)}&artist_name=${encodeURIComponent(m)}&album_name=${encodeURIComponent(r)}`,p=null,v=!1,g=!1;for(let f of[`https://lrclib.schuh.wtf/api/search?${y}`,`https://lrclib.net/api/search?${y}`]){if(d.aborted||s!==vars.lyrics.currentTrackId)return;let $=new AbortController,h=()=>$.abort();d.addEventListener("abort",h,{once:!0});let _=setTimeout(()=>$.abort(),8e3);try{let b=await fetch(f,{signal:$.signal});if(b.ok){let w=await b.json();if(Array.isArray(w)&&w.length){p=w;break}if(Array.isArray(w)){v=!0;break}g=!0}else g=!0}catch{g=!0}finally{clearTimeout(_),d.removeEventListener("abort",h)}}if(d.aborted||s!==vars.lyrics.currentTrackId)return;if(!p){if(!v)throw Error("Failed to fetch");let L=Error("No lyrics found");throw L.unconfirmed=g,L}let I=p.filter(e=>!!(!a||isNaN(a))||2>=Math.abs(e.duration-a));if(0===I.length)throw Error("No lyrics found");let S=e=>{let t=e.lyricsfile||"",r=/\n\s*lines:\s*\r?\n/.test(t);return r&&-1!==t.indexOf("words:")?4:r?3:e.syncedLyrics?2:e.plainLyrics||/\n\s*plain:\s*\|/.test(t)?1:0};I.sort((e,t)=>{let r=S(t)-S(e);return 0!==r?r:!a||isNaN(a)?0:Math.abs(e.duration-a)-Math.abs(t.duration-a)});let T=I[0];if(d.aborted||s!==vars.lyrics.currentTrackId)return;let E=parseLyricsFile(T.lyricsfile);!E.length&&T.syncedLyrics&&(E=parseLrc(T.syncedLyrics));let x=T.plainLyrics||parseLyricsFilePlain(T.lyricsfile),A=E.filter((e,t,r)=>{if(!e.isInstrumental)return!0;let a=r[t+1],s=null!==e.endTime&&void 0!==e.endTime?e.endTime:a?a.time:null;return null===s||s-e.time>3});if(A.length>0){n.classList.remove("locked"),vars.lyrics.currentLyrics=A,vars.lyrics.currentLyrics[0].time>3&&!vars.lyrics.currentLyrics[0].isInstrumental&&vars.lyrics.currentLyrics.unshift({time:0,text:"",isInstrumental:!0});let k=vars.lyrics.currentLyrics[vars.lyrics.currentLyrics.length-1],B=null!==k.endTime&&void 0!==k.endTime?k.endTime:k.time+2;!k.isInstrumental&&a-B>3&&vars.lyrics.currentLyrics.push({time:B,text:"",isInstrumental:!0}),renderLyrics()}else if(x)n.classList.remove("locked"),vars.lyrics.currentLyrics=x.split("\n").map(e=>({time:void 0,text:e})),renderLyrics(),n.classList.add("unsynced"),l.style.display="block";else if(T.instrumental)rememberNoLyrics(s,"instrumental"),showNoLyrics("instrumental");else throw Error("No lyrics found")}catch(C){if("AbortError"===C.name||s!==vars.lyrics.currentTrackId||!vars.lyrics.active)return;let P=()=>fetchLyrics(e,t,r,a,s,!0);if("No lyrics found"===C.message){let z=C.unconfirmed?"unconfirmed":"none";rememberNoLyrics(s,z),showNoLyrics(z,P);return}n.innerHTML=` <div class="lyrics-status-message" style="flex-direction: column;"> <span>${escapeHTML(C.message)}</span> <button class="retry-lyrics-btn" id="retry-lyrics-btn">Try again</button> </div> `,n.classList.add("locked"),vars.lyrics.currentLyrics=[],setLyricsBtnDisabled(!1);let M=document.getElementById("retry-lyrics-btn");M&&M.addEventListener("click",P)}}function renderLyrics(){let e=document.getElementById("lyrics-content");vars.lyrics.lastActiveLineIndex=-1,e.innerHTML=vars.lyrics.currentLyrics.map((e,t)=>{let r=e.isInstrumental?"instrumental":"";if(e.isInstrumental)return`<div class="lyric-line ${r}" data-index="${t}"><div class="music-dots"><span></span><span></span><span></span></div></div>`;let a=(e,t,r)=>{let a=(e,t)=>null===e?"":` data-ws="${e}" data-we="${t}"`;if(/[-—–]/.test(e)){let s=e.split(/([-—–])/),i=[],n="";for(let l=0;l<s.length;l++)n+=s[l],(l%2!=0||l===s.length-1)&&(n&&i.push(n),n="");let o=i.reduce((e,t)=>e+t.length,0)||1,c=0,d=i.map(e=>{let s=null,i=null;return null!==t&&(s=t+(r-t)*(c/o),c+=e.length,i=t+(r-t)*(c/o)),`<span class="lyric-word"${a(s,i)}>${escapeHTML(e)}</span>`});return`<span class="word-wrapper">${d.join("<wbr>")}</span>`}return`<span class="lyric-word"${a(t,r)}>${escapeHTML(e)}</span>`},s=e.words&&e.words.length?e.words.map((t,r)=>{let s=t.text.trim();if(!s)return"";let i=e.words[r+1],n=i?i.time:null!==e.endTime&&void 0!==e.endTime?e.endTime:t.time+.5;return a(s,t.time,n)}).join(""):e.text.split(" ").map(e=>a(e,null,null)).join("");return`<div class="lyric-line" data-index="${t}">${s}</div>`}).join(""),vars.lyrics.cachedLyricLines=Array.from(e.querySelectorAll(".lyric-line"))}function syncLyrics(e,t=!1){if(!vars.lyrics.active||0===vars.lyrics.currentLyrics.length||0===vars.lyrics.cachedLyricLines.length)return;let r=vars.lyrics.currentLyrics,a=vars.lyrics.cachedLyricLines;if(void 0===r[0].time)return;let s=vars.player.spotifyData?(vars.player.spotifyData.timestamps.end-vars.player.spotifyData.timestamps.start)/1e3:null,i=e=>{let t=r[e];return t.isInstrumental||null===t.endTime||void 0===t.endTime?e<r.length-1?r[e+1].time:null!==s?s:t.time+5:t.endTime},n=e=>{let t=r[e];return e===r.length-1&&(t.isInstrumental||null===t.endTime||void 0===t.endTime)?1/0:i(e)},l=-1;for(let o=0;o<r.length;o++)if(r[o].time<=e)l=o;else break;let c=[];for(let d=0;d<a.length;d++){let u=a[d],m;"active"==(m=d>l?"upcoming":e>=n(d)?"past":"active")&&c.push(d),u.dataset.lstate!==m&&(u.dataset.lstate=m,u.classList.toggle("active","active"===m),u.classList.toggle("past","past"===m),"active"!==m&&u.querySelectorAll(".lyric-word").forEach(e=>{e.classList.toggle("past","past"===m),e.classList.remove("current"),e.style.removeProperty("--word-progress")}))}if(l!==vars.lyrics.lastActiveLineIndex||t){let y=document.getElementById("lyrics-content"),p=vars.lyrics.lastActiveLineIndex;if(-1!==l&&l<a.length){let v=a[l],g=y.clientHeight,f=v.clientHeight,$=v.offsetTop-.43*g+f/2;y.scrollTo({top:$,behavior:t||-1===p?"auto":"smooth"})}vars.lyrics.lastActiveLineIndex=l}for(let h of c){let _=r[h];if(_.isInstrumental)continue;let b=_.time,w=i(h),L=w-b;if(L<=0)continue;let I=a[h].querySelectorAll(".lyric-word");if(0===I.length)continue;let S=void 0!==I[0].dataset.ws,T=0;S||I.forEach(e=>{T+=e.textContent.length}),0===T&&(T=1);let E=0;I.forEach(t=>{let r,a;if(S)r=parseFloat(t.dataset.ws),a=parseFloat(t.dataset.we);else{let s=t.textContent.length;r=b+E/T*L,a=b+(E+s)/T*L,E+=s}if(e>=a)"lyric-word past"!==t.className&&(t.className="lyric-word past",t.style.removeProperty("--word-progress"));else if(e>=r){t.classList.contains("current")||(t.className="lyric-word current");let i=a-r,n=e-r,l=i>0?Math.min(Math.max(n/i*100,0),100):100;t.style.setProperty("--word-progress",`${l}%`)}else"lyric-word"!==t.className&&(t.className="lyric-word",t.style.removeProperty("--word-progress"))})}}function updateProgress(){if(!vars.player.spotifyData)return;let{start:e,end:t}=vars.player.spotifyData.timestamps,r=Math.max(0,Math.min(Date.now()-e,t-e)),a=t-e,s=Math.min(r/a*100,100),i=a-r,n=formatTime(r/1e3),l=`-${formatTime(i>0?i/1e3:0)}`,o=document.getElementById("progress-fill"),c=document.getElementById("time-elapsed"),d=document.getElementById("time-remaining");if(o&&o.style.setProperty("--bar-progress",s),c&&c.textContent!==n&&(c.textContent=n),d&&d.textContent!==l&&(d.textContent=l),vars.lyrics.active){syncLyrics(r/1e3);let u=document.getElementById("lyrics-progress-fill"),m=document.getElementById("lyrics-time-elapsed"),y=document.getElementById("lyrics-time-remaining");u&&u.style.setProperty("--bar-progress",s),m&&m.textContent!==n&&(m.textContent=n),y&&y.textContent!==l&&(y.textContent=l)}}function triggerUpdateAnimation(e){e.classList.remove("updated"),e.offsetWidth,e.classList.add("updated"),e.addEventListener("animationend",()=>e.classList.remove("updated"),{once:!0})}function updateStatus(e){if(!e){updateStatusDisconnected();return}let t=document.getElementById("profile-banner");if(e.kv&&e.kv.banner&&e.discord_user){let r=e.kv.banner,a=e.discord_user.id,s=r.startsWith("a_")?"gif":"png",i=`https://cdn.discordapp.com/banners/${a}/${r}.${s}?size=600`;t.src!==i?(t.onload=()=>{t.style.display="block"},t.onerror=()=>{t.style.display="none"},t.src=i):(t.style.display="block")}else{t.src="https://files.catbox.moe/iauikg.jpg";t.style.display="block";}let n=document.getElementById("avatar"),l=document.getElementById("avatar-decoration"),o=document.getElementById("display-name"),c=document.getElementById("at-username"),d=document.getElementById("status-icon"),u=document.getElementById("devices"),m=document.getElementById("guild-badge"),y=document.getElementById("guild-badge-icon"),p=document.getElementById("guild-badge-tag");if(e.discord_user){let v=e.discord_user,g=v.global_name||v.username;if(o.textContent.trim()!==g){let f=o.querySelector(".display-name-inner");f&&(f.textContent=g,applyDisplayNameScroll()),triggerUpdateAnimation(o)}let $=`@${v.username}`;c.textContent!==$&&(c.textContent=$,triggerUpdateAnimation(c));let h=v.avatar?`https://cdn.discordapp.com/avatars/${v.id}/${v.avatar}.${v.avatar.startsWith("a_")?"gif":"png"}?size=128`:PLACEHOLDER_IMG;n.getAttribute("src")!==h&&(n.src=h,triggerUpdateAnimation(n));let _=v.avatar_decoration_data?`https://cdn.discordapp.com/avatar-decoration-presets/${v.avatar_decoration_data.asset}.png`:"";l.getAttribute("src")!==_?(l.src=_,l.style.display=_?"block":"none"):_&&"none"===l.style.display&&(l.style.display="block",l.removeAttribute("src"),l.src=_);let b=document.getElementById("discord-link");if(b&&!b.href.includes("discord.com")&&(b.href=`https://discord.com/users/${v.id}`,b.removeAttribute("aria-disabled"),b.removeAttribute("tabindex"),b.style.pointerEvents=""),v.primary_guild&&v.primary_guild.identity_enabled){let w=v.primary_guild,L=`https://cdn.discordapp.com/clan-badges/${w.identity_guild_id}/${w.badge}.png?size=32`;y.src!==L?(y.style.display="",y.src=L):"none"===y.style.display&&(y.style.display="",y.removeAttribute("src"),y.src=L),p.textContent!==w.tag&&(p.textContent=w.tag),m.style.display="inline-flex"}else m.style.display="none"}let I=e.activities&&e.activities.some(e=>1===e.type)?STATUS_MAP.streaming:("offline"===e.discord_status?STATUS_MAP.dnd:(STATUS_MAP[e.discord_status]||STATUS_MAP.dnd));d.alt!==I.label&&(d.alt=I.label),d.src.endsWith(I.icon)?"none"===d.style.display&&(d.style.display="",d.removeAttribute("src"),d.src=I.icon):(d.style.display="",d.src=I.icon,triggerUpdateAnimation(d));let S=(e.active_on_discord_web?"w":"")+(e.active_on_discord_desktop?"d":"")+(e.active_on_discord_mobile?"m":"")+(e.active_on_discord_embedded?"e":"")+(e.active_on_discord_vr?"v":"");if(u.dataset.active!==S){u.dataset.active=S;let T="";e.active_on_discord_web&&(T+='<svg class="device-icon web" role="img" aria-label="Active on web" height="20" width="20" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93Zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39Z"></path></svg>'),e.active_on_discord_desktop&&(T+='<svg class="device-icon desktop" role="img" aria-label="Active on desktop" height="20" width="20" viewBox="0 0 24 24"><path d="M4 2.5c-1.103 0-2 .897-2 2v11c0 1.104.897 2 2 2h7v2H7v2h10v-2h-4v-2h7c1.103 0 2-.896 2-2v-11c0-1.103-.897-2-2-2H4Zm16 2v9H4v-9h16Z"></path></svg>'),e.active_on_discord_mobile&&(T+='<svg class="device-icon mobile" role="img" aria-label="Active on mobile" height="20" width="20" viewBox="0 0 1000 1500"><path d="M 187 0 L 813 0 C 916.277 0 1000 83.723 1000 187 L 1000 1313 C 1000 1416.277 916.277 1500 813 1500 L 187 1500 C 83.723 1500 0 1416.277 0 1313 L 0 187 C 0 83.723 83.723 0 187 0 Z M 125 1000 L 875 1000 L 875 250 L 125 250 Z M 500 1125 C 430.964 1125 375 1180.964 375 1250 C 375 1319.036 430.964 1375 500 1375 C 569.036 1375 625 1319.036 625 1250 C 625 1180.964 569.036 1125 500 1125 Z"></path></svg>'),e.active_on_discord_embedded&&(T+='<svg class="device-icon embedded" role="img" aria-label="Active in an embedded app" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.06 20.4q-1.53 0-2.37-1.065T.06 16.74l1.26-9q.27-1.8 1.605-2.97T6.06 3.6h11.88q1.8 0 3.135 1.17t1.605 2.97l1.26 9q.21 1.53-.63 2.595T20.94 20.4q-.63 0-1.17-.225T18.78 19.5l-2.7-2.7H7.92l-2.7 2.7q-.45.45-.99.675t-1.17.225Zm14.94-7.2q.51 0 .855-.345T19.2 12q0-.51-.345-.855T18 10.8q-.51 0-.855.345T16.8 12q0 .51.345 .855T18 13.2Zm-2.4-3.6q.51 0 .855-.345T16.8 8.4q0-.51-.345-.855T15.6 7.2q-.51 0-.855.345T14.4 8.4q0 .51.345 .855T15.6 9.6ZM6.9 13.2h1.8v-2.1h2.1v-1.8h-2.1v-2.1h-1.8v2.1h-2.1v1.8h2.1v2.1Z"/></svg>'),e.active_on_discord_vr&&(T+='<svg class="device-icon vr" role="img" aria-label="Active in VR" height="20" width="20" viewBox="0 0 24 24"><path d="M8.46 8.64a1 1 0 0 1 1 1c0 .44-.3.8-.72.92l-.11.07c-.08.06-.2.19-.2.41a.99.99 0 0 1-.98.86h-.06a1 1 0 0 1-.94-1.05l.02-.32c.05-1.06.92-1.9 1.99-1.9ZM15.55 5a5.5 5.5 0 0 1 5.15 3.67h.3a2 2 0 0 1 2 2v3.18a2 2 0 0 1-2 1.99h-.2A4.54 4.54 0 0 1 16.55 19a4.45 4.45 0 0 1-3.6-1.83 1.2 1.2 0 0 0-1.9 0 4.44 4.44 0 0 1-3.9 1.82 4.54 4.54 0 0 1-3.94-3.15H3a2 2 0 0 1-2-2v-3.18c0-1.1.9-1.99 2-1.99h.3A5.5 5.5 0 0 1 8.46 5h7.09Zm-7.1 2C6.6 7 5.06 8.5 4.97 10.41l-.02.66v3.18c0 1.43 1.05 2.66 2.34 2.74.85.06 1.63-.32 2.14-1.01a3.2 3.2 0 0 1 2.57-1.3c1 0 1.97.48 2.57 1.3.5.69 1.3 1.08 2.14 1.01 1.3-.08 2.34-1.31 2.34-2.74l-.02-3.84a3.54 3.54 0 0 0-3.49-3.43H8.45Z"></path></svg>'),u.innerHTML=T}let E=!!(e.listening_to_spotify&&e.spotify);vars.statsfm.discordPlaying=E,setStatsfmEnabled(!E&&"offline"===e.discord_status),applySpotifyState(E?e.spotify:vars.statsfm.data),updateCustomStatus(e)}function makeTrackId(e){let t=e.track_id;if(t&&"null"!==t)return t;let r=e.timestamps,a=r&&r.end>r.start?r.end-r.start:0;return`local:${encodeURIComponent(e.song||"")}|${encodeURIComponent(e.artist||"")}|${encodeURIComponent(e.album||"")}|${a}`}
function logUserLiveStream(sp) {
  if (!sp || !sp.song) return;
  try {
    let saved = JSON.parse(localStorage.getItem('ursize_recent_streams') || '[]');
    if (saved.length > 0 && saved[0].track.name === sp.song && saved[0].track.artists?.[0]?.name === sp.artist) {
      return;
    }
    let newStream = {
      endTime: new Date().toISOString(),
      track: {
        name: sp.song,
        durationMs: (sp.timestamps?.end - sp.timestamps?.start) || 180000,
        explicit: false,
        artists: [{ name: sp.artist || 'Unknown' }],
        albums: [{ image: sp.album_art_url || PLACEHOLDER_IMG, name: sp.album || '' }],
        externalIds: { spotify: sp.track_id ? [sp.track_id] : [] },
        spotifyPreview: null,
        appleMusicPreview: null
      }
    };
    saved.unshift(newStream);
    if (saved.length > 30) saved = saved.slice(0, 30);
    localStorage.setItem('ursize_recent_streams', JSON.stringify(saved));
    let recContainer = document.getElementById("recent-songs-container");
    if (recContainer && vars.player.currentSongTab === 'recent') {
      let streams = [...saved, ...FALLBACK_STREAMS];
      let seen = new Set();
      streams = streams.filter(st => {
        if (!st || !st.track) return false;
        let k = st.track.name + '|' + (st.track.artists?.[0]?.name || '');
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      renderSongList(streams, 'recent', 'recent-songs-container');
    }
  } catch(e) {}
}

function applySpotifyState(e){
  let t = document.getElementById("spotify-card"),
      r = document.getElementById("album-art"),
      a = document.getElementById("song-name"),
      s = document.getElementById("artist-name"),
      i = document.getElementById("album-name"),
      n = document.getElementById("open-spotify-btn");
  if (e) {
    let l = e.track_id, o = makeTrackId(e);
    if (t.dataset.trackId !== o) {
      let c = vars.misc.controllerRegistry.get("spotify-fetch");
      if (c) c.abort();
      let d = new AbortController();
      vars.misc.controllerRegistry.set("spotify-fetch", d);
      let { signal: u } = d;
      t.dataset.trackId = o;
      r.src = e.album_art_url && "null" !== e.album_art_url ? e.album_art_url : PLACEHOLDER_IMG;
      a.textContent = e.song;
      s.textContent = e.artist.replace(/; /g, ", ");
      i.textContent = e.album;
      let m = document.getElementById("spotify-code-container");
      if (l && "null" !== l) {
        m.style.display = "";
        n.href = "https://open.spotify.com/track/" + encodeURIComponent(l);
        n.classList.remove("disabled");
        if (m.dataset.scannableId !== l) {
          m.innerHTML = "";
          delete m.dataset.scannableId;
          fetch("https://scannables.scdn.co/uri/plain/svg/000000/white/1024/spotify:track:" + encodeURIComponent(l), { signal: u })
            .then(res => { if (!res.ok) throw Error("Failed to fetch"); return res.text(); })
            .then(svgText => {
              let parsed = new DOMParser().parseFromString(svgText, "image/svg+xml"), el = parsed.documentElement;
              if ("svg" !== el.localName || parsed.querySelector("parsererror")) throw Error("Invalid SVG");
              let cleanAttrs = elem => {
                for (let { name, value } of [...elem.attributes]) {
                  if (name.startsWith("on") || (name.endsWith("href") && /^\s*javascript:/i.test(value))) elem.removeAttribute(name);
                }
              };
              el.querySelectorAll("script, style, foreignObject, use, animate, animateTransform, animateMotion, set").forEach(elem => elem.remove());
              cleanAttrs(el);
              el.querySelectorAll("*").forEach(cleanAttrs);
              el.querySelector('rect[fill="#000000" i]')?.remove();
              el.querySelectorAll('[fill="#ffffff" i]').forEach(elem => elem.setAttribute("fill", "#8B949E"));
              el.querySelectorAll('[stroke="#ffffff" i]').forEach(elem => elem.setAttribute("stroke", "#8B949E"));
              m.replaceChildren(el);
              m.dataset.scannableId = l;
            }).catch(err => { if ("AbortError" !== err.name) m.style.display = "none"; });
        }
      } else {
        m.style.display = "none";
        m.innerHTML = "";
        delete m.dataset.scannableId;
        n.removeAttribute("href");
        n.classList.add("disabled");
      }
      setLyricsBtnDisabled("none" === vars.lyrics.noLyrics.get(o));
      triggerUpdateAnimation(document.querySelector(".spotify-container"));
      if (vars.lyrics.active) {
        if (vars.lyrics.currentTrackId !== o) {
          vars.lyrics.currentTrackId = o;
          vars.lyrics.currentLyrics = [];
          let y = (e.timestamps.end - e.timestamps.start) / 1000;
          fetchLyrics(e.song, e.artist, e.album, y, o);
          updateLyricsHeader(e.song, e.artist, e.album_art_url, true);
        } else {
          restoreOrFetchLyrics(e.song, e.artist, e.album, e.timestamps, o);
        }
      }
    }
    t.classList.remove("inactive");
    vars.player.spotifyData = e; logUserLiveStream(e);
    try { localStorage.setItem('sativa-last-spotify', JSON.stringify(e)); } catch(err) {}
    if (vars.player.progressRafId) cancelAnimationFrame(vars.player.progressRafId);
    if (document.hidden) {
      updateProgress();
      vars.player.progressRafId = null;
    } else {
      updateProgress();
      vars.player.progressRafId = requestAnimationFrame(progressLoop);
    }
  } else {
    if (!t.classList.contains("inactive")) {
      let p = vars.misc.controllerRegistry.get("lyrics-fetch");
      if (p) p.abort();
      let v = vars.misc.controllerRegistry.get("spotify-fetch");
      if (v) v.abort();
      let lastTrack = getSativaLastSpotify();
      t.dataset.trackId = lastTrack.track_id || "sativa-last";
      r.src = lastTrack.album_art_url || "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02af41341020c85f2f2279aeb2";
      a.textContent = lastTrack.song || "Bounce Out x Limerence";
      s.textContent = (lastTrack.artist || "Limerence") + " • Last Played";
      i.textContent = lastTrack.album || "";
      if (lastTrack.track_id) {
        n.href = "https://open.spotify.com/track/" + encodeURIComponent(lastTrack.track_id);
        n.classList.remove("disabled");
      } else {
        n.removeAttribute("href");
        n.classList.add("disabled");
      }
      triggerUpdateAnimation(document.querySelector(".spotify-container"));
      if (vars.lyrics.active) {
        let g = document.getElementById("lyrics-content");
        g.innerHTML = '<div class="lyrics-status-message">Playback ended</div>';
        g.dataset.state = "ended";
        g.classList.add("locked");
        g.classList.remove("unsynced");
        document.getElementById("unsynced-label").style.display = "none";
      }
    }
    t.classList.add("inactive");
    vars.player.spotifyData = null;
    if (vars.player.progressRafId) {
      cancelAnimationFrame(vars.player.progressRafId);
      vars.player.progressRafId = null;
    }
  }
}
function updateCustomStatus(e){let t=document.getElementById("custom-status");if(!t)return;let r=(e.activities||[]).find(e=>4===e.type),a="",s=!1,i=!1;if(r){if(r.emoji){if(r.emoji.id){let n=`https://cdn.discordapp.com/emojis/${encodeURIComponent(r.emoji.id)}.${r.emoji.animated?"gif":"png"}?size=96`;a+=`<img src="${n}" class="custom-status-emoji" width="22" height="22" draggable="false" alt="">`,s=!0}else r.emoji.name&&(a+=`<span class="custom-status-text-emoji">${escapeHTML(r.emoji.name)}</span>`,s=!0)}r.state&&(a+=`<span>${escapeHTML(r.state)}</span>`,i=!0)}else a='',i=!1;t.dataset.statusKey!==a&&(t.dataset.statusKey=a,t.innerHTML=a,t.style.display=s||i?"block":"none",s&&!i?t.classList.add("only-emoji"):t.classList.remove("only-emoji"),(s||i)&&triggerUpdateAnimation(t))}whenIdle(()=>whenVisible(()=>{let e=!1;try{e=glIndicatesSoftware()}catch(t){}if(e)return showHwWarning();confirmSoftwareRendering(4,250,showHwWarning)}));const STATSFM_POLL={minGap:1500,playing:3e4,endPad:400,settleRetry:1500,settleMax:7,idleMin:3e4,idleMax:15e4,errorMin:2e4,errorMax:3e5,endGrace:1e4,requestTimeout:12e3};function statsfmToSpotify(e,t){let r=e&&e.track;if(!r||!1===e.isPlaying)return null;let a=Number(r.durationMs)||0,s=Number(e.progressMs)||0;if(a<=0||s>a+STATSFM_POLL.endGrace)return null;let i=(r.albums||[])[0]||null,n=r.externalIds&&r.externalIds.spotify,l=Array.isArray(n)?n[0]:null,o=t-Math.min(s,a);return{track_id:l||null,song:r.name||"Unknown track",artist:(r.artists||[]).map(e=>e.name).filter(Boolean).join("; ")||"Unknown artist",album:i&&i.name||"",album_art_url:i&&i.image||null,timestamps:{start:o,end:o+a}}}function clearStatsfmTimer(){vars.statsfm.timer&&(clearTimeout(vars.statsfm.timer),vars.statsfm.timer=null)}function scheduleStatsfm(e){if(clearStatsfmTimer(),!vars.statsfm.enabled||document.hidden||!navigator.onLine)return;let t=Date.now()-vars.statsfm.lastFetch,r=Math.max(e,STATSFM_POLL.minGap-t,0);vars.statsfm.timer=setTimeout(fetchStatsfmCurrent,r)}function setStatsfmEnabled(e){if(vars.statsfm.enabled!==e){if(vars.statsfm.enabled=e,vars.statsfm.idleStreak=0,vars.statsfm.errorStreak=0,vars.statsfm.settleStreak=0,!e){clearStatsfmTimer(),vars.statsfm.controller&&vars.statsfm.controller.abort(),vars.statsfm.controller=null,vars.statsfm.inFlight=!1,vars.statsfm.data=null;return}scheduleStatsfm(0)}}async function fetchStatsfmCurrent(){if(clearStatsfmTimer(),!vars.statsfm.enabled||document.hidden||!navigator.onLine)return;if(vars.statsfm.inFlight){scheduleStatsfm(STATSFM_POLL.minGap);return}let e=new AbortController;vars.statsfm.controller=e,vars.statsfm.inFlight=!0,vars.statsfm.lastFetch=Date.now();let t=setTimeout(()=>e.abort(),STATSFM_POLL.requestTimeout);try{let r=await fetch(`https://api.stats.fm/api/v1/users/${encodeURIComponent(CONFIG.statsFmId)}/streams/current`,{cache:"no-store",signal:e.signal});if(!r.ok)throw Error("Failed to fetch");let a=await r.json(),s=Date.now();if(e!==vars.statsfm.controller)return;vars.statsfm.errorStreak=0;let i=statsfmToSpotify(a&&a.item,s);if(vars.statsfm.data=i,vars.statsfm.discordPlaying||applySpotifyState(i),i){vars.statsfm.idleStreak=0;let n=i.timestamps.end-Date.now();n>0?(vars.statsfm.settleStreak=0,scheduleStatsfm(Math.min(STATSFM_POLL.playing,n+STATSFM_POLL.endPad))):vars.statsfm.settleStreak<STATSFM_POLL.settleMax?(vars.statsfm.settleStreak++,scheduleStatsfm(STATSFM_POLL.settleRetry)):scheduleStatsfm(STATSFM_POLL.playing)}else vars.statsfm.idleStreak++,scheduleStatsfm(Math.min(STATSFM_POLL.idleMax,STATSFM_POLL.idleMin*Math.pow(1.5,vars.statsfm.idleStreak-1)))}catch(l){if(e!==vars.statsfm.controller)return;vars.statsfm.errorStreak++,vars.statsfm.errorStreak>=3&&vars.statsfm.data&&(vars.statsfm.data=null,vars.statsfm.discordPlaying||applySpotifyState(null)),scheduleStatsfm(Math.min(STATSFM_POLL.errorMax,STATSFM_POLL.errorMin*Math.pow(2,vars.statsfm.errorStreak-1)))}finally{clearTimeout(t),e===vars.statsfm.controller&&(vars.statsfm.inFlight=!1,vars.statsfm.controller=null)}}function updateStatusDisconnected(){vars.ws.isOffline=!0,setStatsfmEnabled(!1),vars.player.progressRafId&&(cancelAnimationFrame(vars.player.progressRafId),vars.player.progressRafId=null),document.getElementById("profile-banner").src="https://files.catbox.moe/iauikg.jpg";document.getElementById("profile-banner").style.display="block",["profile-loader","spotify-loader"].forEach(e=>{let t=document.getElementById(e);if(t){t.classList.remove("hidden"),t.classList.add("error");let r=t.querySelector("span");if(r){let a=r.cloneNode(!1);a.textContent=navigator.onLine?"Failed to fetch":"You are offline",r.replaceWith(a)}}})}function foldText(e){return String(e).normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase()}function formatTimeAgo(e) {
  let t = Date.now(), r = typeof e === 'number' ? e : Date.parse(e);
  if (isNaN(r)) return 'Just now';
  let m = Math.floor((t - r) / 60000);
  let h = Math.floor(m / 60);
  let d = Math.floor(h / 24);
  if (m < 1) return 'Just now';
  if (m < 60) return m + 'm ago';
  if (h < 24) return h + 'h ago';
  if (d < 7) return d + 'd ago';
  if (d < 30) return Math.floor(d / 7) + 'w ago';
  if (d < 365) return Math.floor(d / 30) + 'mo ago';
  return Math.floor(d / 365) + 'y ago';
}
function formatDuration(e){if(isNaN(e)||e<0)return"0:00";let t=Math.floor(e/1e3);return`${Math.floor(t/60)}:${(t%60).toString().padStart(2,"0")}`}function updatePlayIcons(e){let t=document.getElementById("media-play-pause-btn"),r=t.querySelector(".play-icon"),a=t.querySelector(".pause-icon"),s=t.querySelector(".loading-icon"),i=(e,t,i)=>{r.style.display=e?"block":"none",a.style.display=t?"block":"none",s&&(s.style.display=i?"block":"none")},n=e=>{let t=vars.audio.currentPlayingButton;if(!t)return;t.classList.toggle("playing",e);let r=t.querySelector(".play-icon"),a=t.querySelector(".pause-icon");r&&(r.style.display=e?"none":"block"),a&&(a.style.display=e?"block":"none")},l=()=>{vars.audio.loadingTimeout&&(clearTimeout(vars.audio.loadingTimeout),vars.audio.loadingTimeout=null)},o=s&&"block"===s.style.display;if(!1===e&&(vars.audio.spinnerWasVisible=o||null!==vars.audio.loadingTimeout),"load"===e){n(!0),o||vars.audio.spinnerWasVisible?(i(!1,!1,!0),l()):(i(!1,!0,!1),vars.audio.loadingTimeout||(vars.audio.loadingTimeout=setTimeout(()=>{i(!1,!1,!0),vars.audio.loadingTimeout=null},130)));return}l(),!0===e?(i(!1,!0,!1),n(!0),vars.audio.spinnerWasVisible=!1):(i(!0,!1,!1),n(!1))}function openPopup(e){clearTimeout(e._closeTimer),e._closeTimer=null,e.hidden=!1,e.offsetWidth,e.classList.add("visible");let t=e.querySelector('[role="dialog"]');t&&!t.contains(document.activeElement)&&(e._returnFocus=document.activeElement,t.focus())}function closePopup(e,t){let r=e._returnFocus;e._returnFocus=null,r&&r.isConnected&&e.contains(document.activeElement)&&r.focus(),e.classList.remove("visible"),clearTimeout(e._closeTimer),e._closeTimer=setTimeout(()=>{e.hidden=!0,e._closeTimer=null,t&&t()},400)}function setLyricsBtnDisabled(e){let t=document.getElementById("lyrics-btn");t&&(t.classList.toggle("disabled",e),t.disabled=e)}function closeMediaPlayer(){let e=document.getElementById("media-player");e&&closePopup(e),vars.audio.currentAudio&&(vars.audio.currentAudio.pause(),vars.audio.currentAudio.src="",vars.audio.currentAudio.removeAttribute("src"),vars.audio.currentAudio.load()),vars.visualizer.isPlaying=!1,stopAndClearVisualizer(),vars.visualizer.audioContext&&"running"===vars.visualizer.audioContext.state&&vars.visualizer.audioContext.suspend().catch(()=>{}),updatePlayIcons(!1),vars.audio.currentPlayingButton=null,clearMediaSession()}function toggleMediaPlayerState(){vars.audio.currentAudio&&(vars.audio.currentAudio.paused?(vars.visualizer.audioContext&&"suspended"===vars.visualizer.audioContext.state&&vars.visualizer.audioContext.resume(),vars.audio.currentAudio.play().catch(()=>{})):vars.audio.currentAudio.pause())}function updateVolumeIcon(){let e=document.querySelector(".volume-icon-high"),t=document.querySelector(".volume-icon-low"),r=document.querySelector(".volume-icon-muted"),a=parseInt(document.getElementById("volume-slider").value)/100;e.style.display="none",t.style.display="none",r.style.display="none",0===a?r.style.display="block":a<.5?t.style.display="block":e.style.display="block"}function updateMediaSession(e,t){if("mediaSession"in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:e.name,artist:e.artists.map(e=>e.name).join(", "),album:e.albums[0]?.name||"",artwork:[{src:t,sizes:"512x512",type:"image/png"}]});let r=[["play",()=>toggleMediaPlayerState()],["pause",()=>toggleMediaPlayerState()],["stop",()=>closeMediaPlayer()],["previoustrack",()=>handleSkip("prev")],["nexttrack",()=>handleSkip("next")],["seekto",e=>{vars.audio.currentAudio&&e&&"number"==typeof e.seekTime&&(vars.audio.currentAudio.currentTime=e.seekTime,syncMediaSessionPosition())}]];for(let[a,s]of r)try{navigator.mediaSession.setActionHandler(a,s)}catch(i){}}}function clearMediaSession(){if("mediaSession"in navigator)for(let e of(navigator.mediaSession.playbackState="none",navigator.mediaSession.metadata=null,["play","pause","stop","seekto","previoustrack","nexttrack","seekbackward","seekforward"]))try{navigator.mediaSession.setActionHandler(e,null)}catch(t){}}function syncMediaSessionPosition(){if(!("mediaSession"in navigator)||!vars.audio.currentAudio)return;let{duration:e,playbackRate:t,currentTime:r}=vars.audio.currentAudio;if(isFinite(e)&&!(e<=0))try{navigator.mediaSession.setPositionState({duration:e,playbackRate:t,position:r})}catch(a){}}function togglePlay(e,t){let r=t.spotifyPreview||t.appleMusicPreview||t.previewUrl;if(!r)return;if(e===vars.audio.currentPlayingButton){toggleMediaPlayerState();return}if(vars.audio.currentAudio&&(vars.audio.currentAudio.pause(),vars.visualizer.isPlaying=!1),vars.audio.currentPlayingButton){vars.audio.currentPlayingButton.classList.remove("playing");let a=vars.audio.currentPlayingButton.querySelector(".play-icon"),s=vars.audio.currentPlayingButton.querySelector(".pause-icon");a&&(a.style.display="block"),s&&(s.style.display="none")}let i=document.getElementById("media-player"),n=document.getElementById("media-album-art"),l=t.albums[0]?.image||PLACEHOLDER_IMG;n.getAttribute("src")!==l&&(n.src=l),document.getElementById("media-song-title").textContent=t.name,document.getElementById("media-song-artist").textContent=t.artists.map(e=>e.name).join(", ");let o=document.getElementById("seek-slider"),c=document.getElementById("media-current-time"),d=document.getElementById("media-total-time");o.max=0,o.value=0,c.textContent=formatTime(0),d.textContent=formatTime(0),vars.audio.currentAudio||(vars.audio.currentAudio=new Audio,vars.audio.currentAudio.crossOrigin="anonymous",vars.audio.currentAudio.onerror=e=>{e.target===vars.audio.currentAudio&&(updatePlayIcons(!1),vars.visualizer.isPlaying=!1,"mediaSession"in navigator&&(navigator.mediaSession.playbackState="none"))},vars.audio.currentAudio.onwaiting=e=>{e.target===vars.audio.currentAudio&&updatePlayIcons("load")},vars.audio.currentAudio.onplaying=e=>{e.target===vars.audio.currentAudio&&updatePlayIcons(!0)},vars.audio.currentAudio.onloadedmetadata=e=>{e.target===vars.audio.currentAudio&&(o.max=vars.audio.currentAudio.duration,d.textContent=formatTime(vars.audio.currentAudio.duration),syncMediaSessionPosition())},vars.audio.currentAudio.ontimeupdate=e=>{e.target===vars.audio.currentAudio&&(vars.audio.isSeeking||(o.value=vars.audio.currentAudio.currentTime),c.textContent=formatTime(vars.audio.currentAudio.currentTime))},vars.audio.currentAudio.onplay=e=>{if(e.target!==vars.audio.currentAudio)return;let t=document.getElementById("media-player").classList.contains("visible");t&&(vars.audio.currentAudio.readyState<3?updatePlayIcons("load"):updatePlayIcons(!0),"mediaSession"in navigator&&(navigator.mediaSession.playbackState="playing",syncMediaSessionPosition()),vars.visualizer.audioContext&&"suspended"===vars.visualizer.audioContext.state&&vars.visualizer.audioContext.resume(),vars.visualizer.isPlaying=!0,vars.visualizer.animationFrameId||drawVisualizer())},vars.audio.currentAudio.onpause=e=>{if(e.target!==vars.audio.currentAudio)return;updatePlayIcons(!1);let t=document.getElementById("media-player").classList.contains("visible");if(!t){vars.visualizer.isPlaying=!1;return}"mediaSession"in navigator&&(navigator.mediaSession.playbackState="paused",syncMediaSessionPosition()),vars.visualizer.isPlaying=!1},vars.audio.currentAudio.onended=closeMediaPlayer),vars.audio.currentAudio.src=r,updateMediaSession(t,l),setupAudioVisualizer(),setVolumeUI(volumeSlider.value/100),vars.audio.currentPlayingButton=e,o.oninput=()=>{vars.audio.currentAudio&&(vars.audio.currentAudio.currentTime=o.value,syncMediaSessionPosition())},vars.visualizer.audioContext&&"suspended"===vars.visualizer.audioContext.state&&vars.visualizer.audioContext.resume(),vars.audio.currentAudio.readyState<3&&updatePlayIcons("load"),vars.audio.currentAudio.play().catch(()=>{}),openPopup(i),resizeCanvas()}function handleSkip(e){if(!vars.audio.currentPlayingButton)return;let t="recent"===vars.player.currentSongTab?"recent-songs-container":"top-songs-container",r=document.getElementById(t),a=Array.from((vars.audio.currentPlayingButton.closest("#recent-songs-container, #top-songs-container")||r).querySelectorAll(".song-item")).filter(e=>"none"!==e.style.display),s=vars.audio.currentPlayingButton.closest(".song-item"),i=a.indexOf(s);if(-1===i){if(0===a.length)return;i="next"===e?-1:a.length}for(let n=0;n<a.length;n++){"next"===e?++i>=a.length&&(i=0):--i<0&&(i=a.length-1);let l=a[i];if(l===s)continue;let o=l.querySelector(".play-button");if(o){o.click();return}}}function addPlayButtonListeners(e, t) {
  t.querySelectorAll(".song-item").forEach((item, idx) => {
    let trItem = e[idx];
    if (!trItem || !trItem.track) return;
    let track = trItem.track;
    let btn = item.querySelector(".play-button");
    if (!btn) return;
    
    const playHandler = async (ev) => {
      ev.stopPropagation();
      let prevUrl = track.spotifyPreview || track.appleMusicPreview || track.previewUrl;
      if (!prevUrl || prevUrl === 'preview') {
        updatePlayIcons("load");
        try {
          let q = encodeURIComponent(track.name + " " + (track.artists?.[0]?.name || ""));
          let itRes = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=1`);
          let itData = await itRes.json();
          if (itData.results?.[0]?.previewUrl) {
            track.spotifyPreview = itData.results[0].previewUrl;
            track.appleMusicPreview = itData.results[0].previewUrl;
            btn.dataset.previewUrl = itData.results[0].previewUrl;
          }
        } catch(err) {}
      }
      togglePlay(btn, track);
    };

    btn.addEventListener("click", playHandler);
    item.addEventListener("click", (ev) => {
      if (ev.target.closest(".song-links a")) return;
      playHandler(ev);
    });
  });
}
function updateTimestamps(){if("recent"!==vars.player.currentSongTab)return;let e=document.querySelectorAll("#recent-songs-container .song-timestamp[data-timestamp]");for(let t of e){let r=formatTimeAgo(Number(t.dataset.timestamp));t.textContent!==r&&(t.textContent=r)}}function renderSongList(e, t, r) {
  if ((!e || 0 === e.length) && "recent" === t) e = FALLBACK_STREAMS;
  let a = document.getElementById(r);
  if (!a) return;
  let s = vars.audio.currentAudio && !vars.audio.currentAudio.paused,
      i = vars.audio.currentAudio ? vars.audio.currentAudio.src : null;
  if (vars.misc.imageObserver) a.querySelectorAll(".lazy-image").forEach(elem => vars.misc.imageObserver.unobserve(elem));
  a.innerHTML = "";
  if (e && e.length > 0) {
    let n = document.createDocumentFragment();
    e.forEach(item => {
      let tr = item.track,
          art = tr.albums[0]?.image || PLACEHOLDER_IMG,
          name = tr.name,
          artist = tr.artists.map(ar => ar.name).join(", "),
          preview = tr.spotifyPreview || tr.appleMusicPreview || tr.previewUrl || "preview",
          dur = formatDuration(tr.durationMs),
          spId = tr.externalIds?.spotify?.[0],
          apId = tr.externalIds?.appleMusic?.[0],
          metaHtml = "";
      if ("recent" === t) {
        let m = formatTimeAgo(item.endTime);
        metaHtml = `<div class="song-timestamp" data-timestamp="${Date.parse(item.endTime)}">${m}</div>`;
      } else {
        let y = Number(item.streams) || 0;
        metaHtml = `<div class="song-timestamp">${y.toLocaleString()} streams</div>`;
      }
      let p = document.createElement("div");
      p.className = "song-item";
      p.dataset.search = foldText(`${name} ${artist}`);
      p.innerHTML = `
        <div class="song-links">
          ${spId ? `<a href="https://open.spotify.com/track/${encodeURIComponent(spId)}" target="_blank" rel="noopener noreferrer" title="Open in Spotify"><img src="assets/icons/spotify.png" width="18" height="18" draggable="false" alt="Spotify"></a>` : ""}
          ${apId ? `<a href="https://music.apple.com/song/${encodeURIComponent(apId)}" target="_blank" rel="noopener noreferrer" title="Open in Apple Music"><img src="assets/icons/applemusic.png" width="18" height="18" draggable="false" alt="Apple Music"></a>` : ""}
        </div>
        <div class="song-album-art-wrapper">
          <img src="${PLACEHOLDER_IMG}" data-src="${escapeHTML(art)}" width="56" height="56" class="song-album-art lazy-image" decoding="async" draggable="false" alt="Album art">
          <button class="play-button" data-preview-url="${escapeHTML(preview)}" aria-label="Play preview of ${escapeHTML(name)} by ${escapeHTML(artist)}">
            <svg class="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
            <svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>
          </button>
        </div>
        <div class="song-details">
          <div class="song-title">${escapeHTML(name)}</div>
          <div class="song-artist-container">
            ${tr.explicit ? '<span class="explicit-tag">E</span>' : ""}
            <span class="song-artist-name">${escapeHTML(artist)}</span>
          </div>
        </div>
        <div class="song-meta"><span>${dur}</span>${metaHtml}</div>
      `;
      n.appendChild(p);
    });
    a.appendChild(n);
    addPlayButtonListeners(e, a);
    if (!vars.misc.imageObserver) {
      vars.misc.imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(ent => {
          if (ent.isIntersecting) {
            let img = ent.target;
            if (img.dataset.src) img.src = img.dataset.src;
            img.classList.remove("lazy-image");
            observer.unobserve(img);
          }
        });
      }, { root: null, rootMargin: "100px" });
    }
    a.querySelectorAll(".lazy-image").forEach(img => vars.misc.imageObserver.observe(img));
    if (i && vars.audio.currentPlayingButton && !vars.audio.currentPlayingButton.isConnected) {
      let b = a.querySelector(`.play-button[data-preview-url="${CSS.escape(i)}"]`);
      if (b) {
        vars.audio.currentPlayingButton = b;
        if (s && vars.audio.currentAudio && vars.audio.currentAudio.readyState < 3) updatePlayIcons("load");
        else if (s) updatePlayIcons(true);
      }
    }
  } else {
    a.innerHTML = '<div class="empty-state" role="alert">No songs found</div>';
  }
  let curTab = "recent" === vars.player.currentSongTab ? "recent-songs-container" : "top-songs-container";
  if (searchInput && searchInput.value && r === curTab) filterSongs(searchInput.value);
}
async function loadSongs(e) {
  let t = "recent" === e,
      r = t ? "recent-songs-container" : "top-songs-container",
      a = document.getElementById(r),
      s = document.getElementById("songs-loader");
  if (!a) return;
  if (!vars.player.loading[e]) {
    vars.player.loading[e] = true;
    t && vars.misc.timestampsInterval && (clearInterval(vars.misc.timestampsInterval), vars.misc.timestampsInterval = null);
    vars.player.currentSongTab === e && (s.innerHTML = "<span>Loading..</span>", s.style.flexDirection = "", s.classList.remove("hidden", "error"), a.style.opacity = 0);
    try {
      if (t) {
        let liveStreams = [];
        try {
          liveStreams = JSON.parse(localStorage.getItem('sativa_recent_streams') || '[]');
        } catch(err) {}

        let streams = [...liveStreams, ...CURATED_TRACKS];
        let seen = new Set();
        streams = streams.filter(st => {
          if (!st || !st.track) return false;
          let k = st.track.name + '|' + (st.track.artists?.[0]?.name || '');
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });

        renderSongList(streams, "recent", r);
        a.dataset.loaded = "true";
        if (!vars.misc.timestampsInterval) vars.misc.timestampsInterval = setInterval(updateTimestamps, 30000);
        if (vars.player.currentSongTab === e) {
          a.style.opacity = 1;
          s.classList.add("hidden");
        }
      } else {
        renderSongList(CURATED_TRACKS, "top", r);
        a.dataset.loaded = "true";
        if (vars.player.currentSongTab === e) {
          a.style.opacity = 1;
          s.classList.add("hidden");
        }
      }
    } catch(err) {
      renderSongList(CURATED_TRACKS, "recent", r);
      a.dataset.loaded = "true";
      a.style.opacity = 1;
      s.classList.add("hidden");
    } finally {
      vars.player.loading[e] = false;
    }
  }
}
function switchSongTab(e){if(vars.player.currentSongTab===e)return;let t=document.getElementById("songs-loader"),r=document.getElementById("songs-list-wrapper");t&&r&&t.parentNode!==r&&(r.appendChild(t),t.style.borderRadius="8px");let a=document.getElementById("stream-type-toggle");a.textContent="recent"===e?"Recent":"Top";let s=document.getElementById("refresh-songs-btn"),i=document.getElementById("song-search-input"),n=document.getElementById("clear-search-btn");i.value&&(i.value="",n.classList.remove("visible"),filterSongs("")),vars.player.currentSongTab=e;let l=document.getElementById("recent-songs-container"),o=document.getElementById("top-songs-container");"recent"===e?(s.disabled=vars.player.refreshCooldown,o.style.display="none",o.style.opacity=0,l.style.display="block",setTimeout(()=>l.style.opacity=1,10),"true"!==l.dataset.loaded?vars.player.loading.recent?(t.innerHTML="<span>Loading..</span>",t.style.flexDirection="",t.classList.remove("hidden","error"),l.style.opacity=0):loadSongs("recent"):(t.classList.remove("error"),t.classList.add("hidden"),updateTimestamps(),vars.misc.timestampsInterval||(vars.misc.timestampsInterval=setInterval(updateTimestamps,3e4)))):(s.disabled=!0,vars.misc.timestampsInterval&&(clearInterval(vars.misc.timestampsInterval),vars.misc.timestampsInterval=null),l.style.display="none",l.style.opacity=0,o.style.display="block",setTimeout(()=>o.style.opacity=1,10),"true"!==o.dataset.loaded?vars.player.loading.top?(t.innerHTML="<span>Loading..</span>",t.style.flexDirection="",t.classList.remove("hidden","error"),o.style.opacity=0):loadSongs("top"):(t.classList.remove("error"),t.classList.add("hidden")))}function setupAudioVisualizer(){if(vars.audio.currentAudio){if(!vars.visualizer.audioContext){vars.visualizer.audioContext=new(window.AudioContext||window.webkitAudioContext),vars.visualizer.analyser=vars.visualizer.audioContext.createAnalyser(),vars.visualizer.analyser.fftSize=256;let e=vars.visualizer.analyser.frequencyBinCount;vars.visualizer.dataArray=new Uint8Array(e),vars.visualizer.gainNode=vars.visualizer.audioContext.createGain(),vars.visualizer.analyser.connect(vars.visualizer.gainNode),vars.visualizer.gainNode.connect(vars.visualizer.audioContext.destination),vars.visualizer.audioContext.onstatechange=()=>{"suspended"===vars.visualizer.audioContext.state&&vars.audio.currentAudio&&!vars.audio.currentAudio.paused?(updatePlayIcons(!1),vars.visualizer.isPlaying=!1):"running"!==vars.visualizer.audioContext.state||vars.audio.currentAudio.paused||(vars.audio.currentAudio.readyState<3?updatePlayIcons("load"):updatePlayIcons(!0),vars.visualizer.isPlaying=!0,vars.visualizer.animationFrameId||drawVisualizer())}}try{if(vars.visualizer.sourceNode){let t=vars.visualizer.audioContext.createAnalyser();t.fftSize=vars.visualizer.analyser.fftSize,vars.visualizer.sourceNode.disconnect(),vars.visualizer.analyser.disconnect(),vars.visualizer.sourceNode.connect(t),t.connect(vars.visualizer.gainNode),vars.visualizer.analyser=t,vars.visualizer.dataArray=new Uint8Array(t.frequencyBinCount)}else vars.visualizer.sourceNode=vars.visualizer.audioContext.createMediaElementSource(vars.audio.currentAudio),vars.visualizer.sourceNode.connect(vars.visualizer.analyser);let r=parseInt(document.getElementById("volume-slider").value)/100;vars.visualizer.gainNode.gain.setTargetAtTime(r*r,vars.visualizer.audioContext.currentTime,.015),vars.audio.currentAudio.volume=1}catch(a){let s=parseInt(document.getElementById("volume-slider").value)/100;vars.audio.currentAudio.volume=s*s}vars.visualizer.isInitialized=!0}}function stopAndClearVisualizer(){vars.visualizer.animationFrameId&&(cancelAnimationFrame(vars.visualizer.animationFrameId),vars.visualizer.animationFrameId=null),vars.visualizer.currentBarHeights.fill(0),vars.visualizer.dataArray&&vars.visualizer.dataArray.fill(0),drawVisualizer._lastTime=0;let e=document.getElementById("visualizer-canvas");if(e){let t=e.getContext("2d");t.clearRect(0,0,e.width,e.height)}}function drawVisualizer(){if(document.hidden)return;let e=document.getElementById("visualizer-canvas");if(!e||!vars.visualizer.analyser||!vars.visualizer.dataArray)return;let t=e.getContext("2d"),r=vars.visualizer.analyser.frequencyBinCount,a=vars.audio.currentAudio,s=!!(vars.visualizer.isPlaying&&a&&!a.paused&&a.readyState>=3);vars.visualizer.isPlaying&&a&&!a.paused&&vars.visualizer.analyser.getByteFrequencyData(vars.visualizer.dataArray),t.clearRect(0,0,e.width,e.height);let i=window.devicePixelRatio||1,n=Math.round(r/1.5),l=e.width/n,o=l-Math.max(i,.15*l),c=!0;if(drawVisualizer._gradient&&drawVisualizer._gradientH===e.height||(drawVisualizer._gradient=t.createLinearGradient(0,0,0,e.height),drawVisualizer._gradient.addColorStop(0,"rgba(201, 209, 217, 0.5)"),drawVisualizer._gradient.addColorStop(1,"rgba(201, 209, 217, 0.1)"),drawVisualizer._gradientH=e.height),t.fillStyle=drawVisualizer._gradient,vars.visualizer.currentBarHeights.length!==r&&(vars.visualizer.currentBarHeights=Array(r).fill(0)),!drawVisualizer._powerLookup){drawVisualizer._powerLookup=new Float32Array(256);for(let d=0;d<256;d++)drawVisualizer._powerLookup[d]=Math.pow(d/255,3)}let u=performance.now(),m=Math.min(u-(drawVisualizer._lastTime||u),100);drawVisualizer._lastTime=u;let y=1-Math.exp(-m/26);for(let p=0;p<n;p++){let v=s?drawVisualizer._powerLookup[vars.visualizer.dataArray[p]]*e.height:0,g=vars.visualizer.currentBarHeights[p],f=g+(v-g)*y;t.fillRect(p*l,e.height-f,o,f),vars.visualizer.currentBarHeights[p]=f,f>.1&&(c=!1)}!c||vars.visualizer.isPlaying?vars.visualizer.animationFrameId=requestAnimationFrame(drawVisualizer):stopAndClearVisualizer()}function resizeCanvas(){let e=document.getElementById("visualizer-canvas"),t=document.getElementById("media-player");if(e&&t){let r=window.devicePixelRatio||1,a=Math.floor(t.clientWidth*r),s=Math.floor(t.clientHeight*r);(e.width!==a||e.height!==s)&&(e.width=a,e.height=s)}}function applyDisplayNameScroll(){let e=document.getElementById("display-name"),t=e.querySelector(".display-name-inner");e&&t&&(e.classList.remove("scrolling"),t.style.removeProperty("--scroll-distance"),t.style.transform="translateX(0)",requestAnimationFrame(()=>{let r=e.clientWidth,a=t.scrollWidth;a>r&&(t.style.setProperty("--scroll-distance",`${r-a}px`),e.classList.add("scrolling"))}))}function animateCypherText(e,t){let r=document.getElementById("cypher-text");if(!r)return;let a="\xa1™\xa3\xa2∞\xa7\xb6•\xaa\xba–≠œ∑\xb4\xae†\xa5\xa8ˆ\xf8π“‘\xab\xe5\xdf∂ƒ\xa9˙∆˚\xac…\xe6≈\xe7√∫˜\xb5≤≥\xf7/?`~",s=0;function i(n){let l=n-s;if(l>t){s=n-l%t;let o=Array(e);for(let c=0;c<e;c++)o[c]=a.charAt(Math.floor(Math.random()*a.length));r.textContent=o.join("")}requestAnimationFrame(i)}requestAnimationFrame(i)}document.getElementById("stream-type-toggle").addEventListener("click",()=>{if(vars.player.switchCooldown)return;let e="recent"===vars.player.currentSongTab?"top":"recent";switchSongTab(e),vars.player.switchCooldown=!0,setTimeout(()=>{vars.player.switchCooldown=!1},400)});const timeFormatter=new Intl.DateTimeFormat("en-GB",{timeZone:"America/New_York",hour:"2-digit",minute:"2-digit",hour12:!1});function updateLocalTime(){let e=new Date,t=document.getElementById("time-text");t&&(t.textContent=timeFormatter.format(e));let r=document.getElementById("time-diff-display");if(r){let a=6e4*e.getTimezoneOffset(),s=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",timeZoneName:"shortOffset"}).formatToParts(e),i=s.find(e=>"timeZoneName"===e.type)?.value||"GMT",n=i.match(/GMT([+-]?\d+)?(?::(\d+))?/),l=n?-(6e4*(60*parseInt(n[1]||"0")+parseInt(n[2]||"0"))):0,o=Math.round((a-l)/6e4);if(0===o)r.textContent="Same time as you";else{let c=Math.abs(o),d=Math.floor(c/60),u=c%60,m=u>0?`:${u.toString().padStart(2,"0")}`:"";o>0?r.textContent=`${d}${m}h ahead of you`:r.textContent=`${d}${m}h behind you`}}}let clockTimer=null;function startClock(){clearTimeout(clockTimer),updateLocalTime();let e=()=>{let t=new Date,r=(60-t.getSeconds())*1e3-t.getMilliseconds();clockTimer=setTimeout(()=>{updateLocalTime(),e()},r)};e()}function setMobileViewText(e){let t=document.getElementById("mobile-view-badge");if(!t)return;let r=t.cloneNode(!0),a=r.querySelector("#mobile-view-text");a&&(a.textContent=e),t.replaceWith(r)}async function loadViewCounter() {
  let e = document.getElementById("view-counter");
  let renderDigits = (a) => {
    let numStr = a.toString().padStart(4, "0");
    setMobileViewText(Number(a).toLocaleString());
    if (e) {
      let s = "";
      for (let i = 0; i < numStr.length; i++) {
        let n = numStr[i];
        s += '<span class="view-digit">' + n + '</span>';
      }
      e.innerHTML = s;
      e.title = Number(a).toLocaleString() + " Profile Views";
    }
  };

  const BASE_COUNT = 1452;
  const isNewSession = !sessionStorage.getItem("sativa_view_tracked");

  try {
    let res = await fetch("/api/views", {
      cache: "no-store",
      signal: AbortSignal.timeout ? AbortSignal.timeout(3500) : void 0
    });
    if (res.ok) {
      let data = await res.json();
      if (data && data.count && !isNaN(data.count)) {
        sessionStorage.setItem("sativa_view_tracked", "1");
        localStorage.setItem("sativa_views_count", data.count.toString());
        renderDigits(data.count);
        return;
      }
    }
  } catch(err) {}

  let stored = parseInt(localStorage.getItem("sativa_views_count") || "0", 10);
  if (!stored || isNaN(stored) || stored < BASE_COUNT) {
    stored = BASE_COUNT;
  }
  if (isNewSession) {
    stored += 1;
    localStorage.setItem("sativa_views_count", stored.toString());
    sessionStorage.setItem("sativa_view_tracked", "1");
  }
  renderDigits(stored);
}
function toggleLyricsFullscreen(e=null){let t=document.querySelector(".lyrics-window"),r=document.getElementById("lyrics-content"),a=document.getElementById("fullscreen-lyrics-btn"),s=a.querySelector(".maximize-icon"),i=a.querySelector(".minimize-icon"),n=r.classList.contains("unsynced"),l=null!==e?e:!vars.lyrics.isFullscreen;if(l===vars.lyrics.isFullscreen||(vars.lyrics.isFullscreen=l,t.classList.toggle("fullscreen",l),s.style.display=l?"none":"block",i.style.display=l?"block":"none",n))return;let o=(()=>{let e=vars.lyrics.lastActiveLineIndex;return e>=0&&vars.lyrics.cachedLyricLines[e]||r.querySelector(".lyric-line.active")})();if(!o)return;let c=null,d=r.scrollTop,u=r.clientHeight,m=o.clientHeight,y=o.offsetTop-.43*u+m/2,p=Math.abs(d-y)>.5*u;function v(e){c||(c=e);let t=Math.min((e-c)/400,1),a=r.querySelector(".lyric-line.active")||o,s=r.clientHeight,i=a.clientHeight,n=a.offsetTop-.43*s+i/2;p?r.scrollTo({top:d+(n-d)*(t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2),behavior:"auto"}):r.scrollTo({top:n,behavior:"auto"}),t<1?vars.lyrics.pinRafId=requestAnimationFrame(v):vars.lyrics.pinRafId=null}vars.lyrics.pinRafId&&cancelAnimationFrame(vars.lyrics.pinRafId),vars.lyrics.pinRafId=requestAnimationFrame(v)}const AGE_BIRTHDAY=new Date(2007,3,20);function updateAge(){let e=Date.now(),t=updateAge._tooltip||(updateAge._tooltip=document.getElementById("global-tooltip-container"));t&&t.classList.contains("visible")&&(updateAge._animateUntil=e+400);let r=updateAge._animateUntil&&e<updateAge._animateUntil;if(!r&&updateAge._lastRun&&e-updateAge._lastRun<6e4){requestAnimationFrame(updateAge);return}updateAge._lastRun=e;let a=updateAge._static||(updateAge._static=document.getElementById("static-age")),s=updateAge._animated||(updateAge._animated=document.getElementById("animated-age"));if(a&&s){let i=new Date,n=AGE_BIRTHDAY,l=i.getFullYear()-n.getFullYear(),o=i.getMonth()-n.getMonth(),c=i.getDate()-n.getDate();(o<0||0===o&&c<0)&&l--;let d=new Date(n);d.setFullYear(i.getFullYear()),i<d&&d.setFullYear(i.getFullYear()-1);let u=new Date(d);u.setFullYear(d.getFullYear()+1);let m=l+(i-d)/(u-d);s.textContent=m.toFixed(10),a.textContent!=l&&(a.textContent=l)}requestAnimationFrame(updateAge)}function initTooltips(){let e=document.getElementById("global-tooltip-container");e||((e=document.createElement("div")).id="global-tooltip-container",document.body.appendChild(e));let t=null,r=null,a=0,s=null,i=null,n=null,l=()=>{let t=getComputedStyle(e);if(0>=parseFloat(t.opacity))return;let r=e.cloneNode(!0);r.classList.remove("visible"),r.style.visibility="visible",r.style.opacity=t.opacity,r.style.transform=t.transform,r.style.transition="none",document.body.appendChild(r);let a=null,s=n;s&&(a=new MutationObserver(()=>{r.textContent=s.textContent})).observe(s,{childList:!0,characterData:!0,subtree:!0}),r.offsetWidth,r.style.transition="opacity 0.2s ease, transform 0.2s ease",r.style.opacity="0",r.style.transform="translateY(0)",setTimeout(()=>{a&&a.disconnect(),r.remove()},250)},o=()=>{if(!r||!e.classList.contains("visible")){s=null;return}let t=r.getBoundingClientRect(),a=e.getBoundingClientRect(),i=t.left+t.width/2-a.width/2;i<10&&(i=10),i+a.width>window.innerWidth-10&&(i=window.innerWidth-a.width-10);let n=t.top-a.height;n<10?(n=t.bottom+8,e.classList.add("flipped")):e.classList.remove("flipped");let l=t.left+t.width/2,c=l-i-1;e.classList.remove("edge-left","edge-right"),c<10?(e.classList.add("edge-left"),c=Math.max(4,c)):c>a.width-10&&(e.classList.add("edge-right"),c=Math.min(a.width-8,c)),e.style.setProperty("--arrow-x",`${c}px`),e.style.left=`${i}px`,e.style.top=`${n}px`,s=requestAnimationFrame(o)},c=a=>{if(r===a&&e.classList.contains("visible"))return;let c=a.querySelector(".tooltip-box");if(!c)return;i&&(clearTimeout(i),i=null);let d=e.classList.contains("visible")||parseFloat(getComputedStyle(e).opacity)>0;d&&(l(),e.classList.remove("visible"),e.style.transition="none",e.style.opacity="0",e.style.transform="translateY(0)",e.offsetWidth,e.style.transition="",e.style.opacity="",e.style.transform=""),r=a,n=c,e.textContent=c.textContent,t&&t.disconnect(),(t=new MutationObserver(()=>{e.textContent=c.textContent})).observe(c,{childList:!0,characterData:!0,subtree:!0}),e.classList.add("visible"),s&&cancelAnimationFrame(s),o()},d=()=>{e.classList.remove("visible"),r=null,i&&clearTimeout(i),i=setTimeout(()=>{t&&(t.disconnect(),t=null)},200),s&&(cancelAnimationFrame(s),s=null)};document.body.addEventListener("mouseover",e=>{if(Date.now()-a<500)return;let t=e.target.closest(".tooltip-trigger");t&&c(t)}),document.body.addEventListener("mouseout",e=>{if(Date.now()-a<500)return;let t=e.target.closest(".tooltip-trigger");t&&!t.contains(e.relatedTarget)&&d()}),document.body.addEventListener("touchstart",t=>{a=Date.now();let s=t.target.closest(".tooltip-trigger");s?r===s&&e.classList.contains("visible")?d():c(s):d()},{passive:!0}),window.addEventListener("scroll",d,{capture:!0,passive:!0})}document.getElementById("refresh-songs-btn").addEventListener("click",()=>{if(searchInput.value="",clearSearchBtn.classList.remove("visible"),vars.player.refreshCooldown||"recent"!==vars.player.currentSongTab)return;let e=document.getElementById("songs-loader"),t=document.getElementById("songs-list-wrapper");e&&t&&e.parentNode!==t&&(t.appendChild(e),e.style.borderRadius="8px");let r=document.getElementById("refresh-songs-btn");r.disabled=!0,document.getElementById("recent-songs-container").removeAttribute("data-loaded"),loadSongs("recent"),vars.player.refreshCooldown=!0,setTimeout(()=>{"recent"===vars.player.currentSongTab&&(r.disabled=!1),vars.player.refreshCooldown=!1},3e4)});const searchInput=document.getElementById("song-search-input"),clearSearchBtn=document.getElementById("clear-search-btn");function filterSongs(e){let t="recent"===vars.player.currentSongTab?"recent-songs-container":"top-songs-container",r=document.getElementById(t),a=r.getElementsByClassName("song-item"),s=foldText(e).split(/\s+/).filter(Boolean),i=!1,n=r.querySelector(".search-empty-state");if(n&&n.remove(),Array.from(a).forEach(e=>{let t=e.dataset.search||foldText(`${e.querySelector(".song-title").textContent} ${e.querySelector(".song-artist-name").textContent}`);s.every(e=>t.includes(e))?(e.style.display="flex",i=!0):e.style.display="none"}),!i&&a.length>0){let l=document.createElement("div");l.className="empty-state search-empty-state",l.setAttribute("role","alert"),l.innerHTML=` <div>No songs found matching your search.</div> <button class="clear-search-btn" id="empty-clear-search-btn" style="margin-top: 4px;">Clear Search</button> `,r.appendChild(l);let o=l.querySelector("#empty-clear-search-btn");o.addEventListener("mousedown",e=>{document.activeElement===searchInput&&e.preventDefault()}),o.addEventListener("click",()=>{let e=document.activeElement===searchInput;searchInput.value="",clearSearchBtn.classList.remove("visible"),filterSongs(""),e&&searchInput.focus()})}}function closeLyricsPopup(){vars.lyrics.active=!1;let e=vars.misc.controllerRegistry.get("lyrics-fetch");e&&e.abort(),closePopup(document.getElementById("lyrics-popup"),()=>toggleLyricsFullscreen(!1))}searchInput.addEventListener("input",e=>{let t=e.target.value;t.length>0?clearSearchBtn.classList.add("visible"):clearSearchBtn.classList.remove("visible"),filterSongs(t)}),clearSearchBtn.addEventListener("mousedown",e=>{e.preventDefault()}),clearSearchBtn.addEventListener("click",()=>{let e=document.activeElement===searchInput;searchInput.value="",clearSearchBtn.classList.remove("visible"),filterSongs(""),e&&searchInput.focus()}),document.getElementById("seek-slider").addEventListener("pointerdown",()=>{vars.audio.isSeeking=!0}),window.addEventListener("pointerup",()=>{vars.audio.isSeeking=!1}),window.addEventListener("pointercancel",()=>{vars.audio.isSeeking=!1}),document.getElementById("close-button").addEventListener("click",closeMediaPlayer),document.getElementById("media-play-pause-btn").addEventListener("click",toggleMediaPlayerState),document.getElementById("lyrics-btn").addEventListener("click",()=>{if(!vars.player.spotifyData||document.getElementById("lyrics-btn").classList.contains("disabled"))return;let e=document.getElementById("lyrics-popup");e.offsetWidth,openPopup(e),vars.lyrics.active=!0;let t=makeTrackId(vars.player.spotifyData);if(vars.lyrics.currentTrackId!==t){vars.lyrics.currentTrackId=t;let r=(vars.player.spotifyData.timestamps.end-vars.player.spotifyData.timestamps.start)/1e3;fetchLyrics(vars.player.spotifyData.song,vars.player.spotifyData.artist,vars.player.spotifyData.album,r,t)}else{let a=vars.player.spotifyData;restoreOrFetchLyrics(a.song,a.artist,a.album,a.timestamps,vars.lyrics.currentTrackId),syncLyrics((Date.now()-a.timestamps.start)/1e3,!0)}updateLyricsHeader(vars.player.spotifyData.song,vars.player.spotifyData.artist,vars.player.spotifyData.album_art_url,!1)}),document.getElementById("close-lyrics-btn").addEventListener("click",closeLyricsPopup),document.getElementById("lyrics-overlay-dim").addEventListener("click",closeLyricsPopup),document.getElementById("fullscreen-lyrics-btn").addEventListener("click",()=>{toggleLyricsFullscreen()});const volumeSlider=document.getElementById("volume-slider"),volumePercentage=document.getElementById("volume-percentage"),volumeButton=document.getElementById("volume-button");function applyVolume(e){if(!vars.audio.currentAudio)return;let t=e*e;vars.visualizer.gainNode&&vars.visualizer.sourceNode?(vars.visualizer.gainNode.gain.value=t,vars.audio.currentAudio.volume=1):vars.audio.currentAudio.volume=t}function setVolumeUI(e){let t=Math.round(100*e);volumeSlider.value=t,volumePercentage.textContent=`${t}%`,volumePercentage.style.left=100===t?"-1px":"0",applyVolume(e),updateVolumeIcon()}volumeSlider.value=(()=>{try{let e=localStorage.getItem("volume");return null===e||isNaN(e)?67:Math.round(100*Math.min(1,Math.max(0,Number(e))))}catch(t){return 67}})(),volumePercentage.textContent=`${volumeSlider.value}%`,volumePercentage.style.left="100"===volumeSlider.value?"-1px":"0",volumeSlider.addEventListener("input",e=>{let t=e.target.value/100;applyVolume(t),t>0&&(vars.audio.lastVolume=t);try{localStorage.setItem("volume",t)}catch(r){}volumePercentage.textContent=`${e.target.value}%`,volumePercentage.style.left="100"===e.target.value?"-1px":"0",updateVolumeIcon()}),volumeButton.addEventListener("click",()=>{if(!vars.audio.currentAudio)return;let e=parseInt(volumeSlider.value),t=e>0?0:vars.audio.lastVolume;setVolumeUI(t);try{localStorage.setItem("volume",t)}catch(r){}});const volumeControlsContainer=document.querySelector(".volume-controls");volumeControlsContainer.addEventListener("wheel",e=>{if(e.preventDefault(),0===e.deltaY)return;let t=parseInt(volumeSlider.value),r=e.deltaY<0?2:-2;volumeSlider.value=Math.max(0,Math.min(100,t+r)),volumeSlider.dispatchEvent(new Event("input"))},{passive:!1}),document.addEventListener("keydown",e=>{let t=1===e.key.length?e.key.toLowerCase():e.key;if(("F12"===t||e.ctrlKey&&e.shiftKey&&["i","c","j"].includes(t)||e.ctrlKey&&["u","s","p","g","f","o","+","=","-"].includes(t))&&e.preventDefault(),"Tab"===e.key&&e.preventDefault(),vars.lyrics.active&&(" "===e.key&&"INPUT"!==e.target.tagName&&"TEXTAREA"!==e.target.tagName&&e.preventDefault(),"Escape"===e.key&&(vars.lyrics.isFullscreen?toggleLyricsFullscreen(!1):closeLyricsPopup())),"Escape"===e.key){let r=document.getElementById("webring-popup");r&&r.classList.contains("visible")&&closeWebringPopup()}}),document.addEventListener("contextmenu",e=>{e.preventDefault()}),document.getElementById("hw-warning-close").addEventListener("click",e=>{e.currentTarget.blur(),closePopup(e.currentTarget.parentElement)}),document.addEventListener("error",e=>{let t=e.target;if(!(t instanceof HTMLImageElement)||!t.hasAttribute("src"))return;let r=t.getAttribute("src");if(r){if(t.matches("#avatar, #album-art, #media-album-art, .song-album-art")){if(r===PLACEHOLDER_IMG){t.style.display="none";return}t.style.display="",t.src=PLACEHOLDER_IMG;return}t.style.display="none"}},!0),window===top&&window.addEventListener("wheel",e=>{if(e.ctrlKey)return e.preventDefault(),!1},{passive:!1}),window.addEventListener("online",()=>{vars.ws.reconnectTimer&&(clearTimeout(vars.ws.reconnectTimer),vars.ws.reconnectTimer=null),vars.ws.connectionFailures=0,connect(),scheduleStatsfm(0)}),window.addEventListener("offline",()=>{vars.ws.reconnectTimer&&(clearTimeout(vars.ws.reconnectTimer),vars.ws.reconnectTimer=null),cleanupSocket(),clearStatsfmTimer(),updateStatusDisconnected()}),window.addEventListener("pagehide",()=>{vars.ws.reconnectTimer&&(clearTimeout(vars.ws.reconnectTimer),vars.ws.reconnectTimer=null),cleanupSocket(),clearStatsfmTimer()}),window.addEventListener("pageshow",e=>{e.persisted&&(vars.ws.connectionFailures=0,connect(),scheduleStatsfm(0))});let resizeTimeout;const resizeObserver=new ResizeObserver(()=>{clearTimeout(resizeTimeout),resizeTimeout=setTimeout(()=>{resizeCanvas(),applyDisplayNameScroll()},100)});let playerResizeTimeout;const playerResizeObserver=new ResizeObserver(()=>{clearTimeout(playerResizeTimeout),playerResizeTimeout=setTimeout(resizeCanvas,100)});resizeObserver.observe(document.body);const playerEl=document.getElementById("media-player");playerEl&&playerResizeObserver.observe(playerEl);const watchDevicePixelRatio=()=>{let e=matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);e.addEventListener("change",()=>{resizeCanvas(),watchDevicePixelRatio()},{once:!0})};async function loadWebring(){try{let e=await fetch("https://lanyard.cafe/api/ring?url=https://schuh.wtf",{signal:AbortSignal.timeout?AbortSignal.timeout(1e4):void 0});if(!e.ok)throw Error("Failed to fetch");let t=await e.json(),r=e=>{try{return["http:","https:"].includes(new URL(e).protocol)}catch{return!1}};t.members&&(window.webringMembers=t.members.filter(e=>"https://schuh.wtf"!==e.url&&r(e.url)));let a=document.getElementById("webring-popup");if(a){let s=a.querySelector(".webring-prev"),i=a.querySelector(".webring-next"),n=a.querySelector(".webring-rand");if(s&&t.prev&&r(t.prev.url)&&(s.href=t.prev.url),i&&t.next&&r(t.next.url)&&(i.href=t.next.url),n){let l=()=>{window.webringMembers&&window.webringMembers.length&&(n.href=window.webringMembers[Math.floor(Math.random()*window.webringMembers.length)].url)};l(),n.addEventListener("mouseenter",l),n.addEventListener("focus",l)}}}catch(o){}finally{let c=document.getElementById("webring-popup");c&&c.querySelectorAll(".webring-prev, .webring-next, .webring-rand").forEach(e=>{let t=e.getAttribute("href");t&&"#"!==t||(e.removeAttribute("href"),e.setAttribute("aria-disabled","true"))})}}function closeWebringPopup(){closePopup(document.getElementById("webring-popup"))}watchDevicePixelRatio(),document.addEventListener("visibilitychange",()=>{if(document.hidden)vars.visualizer.animationFrameId&&(cancelAnimationFrame(vars.visualizer.animationFrameId),vars.visualizer.animationFrameId=null),vars.player.progressRafId&&(cancelAnimationFrame(vars.player.progressRafId),vars.player.progressRafId=null),clearStatsfmTimer();else{scheduleStatsfm(0),startClock(),navigator.onLine&&!(vars.ws.socket&&(vars.ws.socket.readyState===WebSocket.OPEN||vars.ws.socket.readyState===WebSocket.CONNECTING))&&(vars.ws.reconnectTimer&&(clearTimeout(vars.ws.reconnectTimer),vars.ws.reconnectTimer=null),vars.ws.connectionFailures=0,connect());let e=document.getElementById("media-player").classList.contains("visible");vars.visualizer.isInitialized&&e&&(vars.visualizer.animationFrameId&&cancelAnimationFrame(vars.visualizer.animationFrameId),drawVisualizer()),!vars.player.spotifyData||vars.ws.isOffline||(updateProgress(),vars.player.progressRafId||(vars.player.progressRafId=requestAnimationFrame(progressLoop)))}}),document.getElementById("webring-btn")?.addEventListener("click",()=>{let e=document.getElementById("webring-popup");e.offsetWidth,openPopup(e)}),document.getElementById("close-webring-btn")?.addEventListener("click",closeWebringPopup),document.getElementById("webring-overlay-dim")?.addEventListener("click",closeWebringPopup),connect(),loadSongs("recent"),loadViewCounter(),startClock(),animateCypherText(7,25),initTooltips(),updateAge(),loadWebring();
async function pollLanyardStatus() {
  try {
    const res = await fetch('https://api.lanyard.rest/v1/users/423953946827161610');
    const json = await res.json();
    if (json.success && json.data) {
      updateStatus(json.data);
      document.getElementById("profile-loader")?.classList.add("hidden");
      document.getElementById("spotify-loader")?.classList.add("hidden");
    }
  } catch(e) {}
}
setInterval(pollLanyardStatus, 3500);
pollLanyardStatus();


async function syncDiscordProfileBio() {
  try {
    let res = await fetch('https://dcdn.dstn.to/profile/423953946827161610');
    if (res.ok) {
      let data = await res.json();
      let bio = data.user_profile?.bio || data.user?.bio;
      let statusEl = document.getElementById('custom-status');
      if (statusEl && bio) {
        statusEl.innerHTML = '<span>' + escapeHTML(bio) + '</span>';
        statusEl.style.display = 'block';
      }
    }
  } catch(e) {}
}



let currentCuratedIdx = 0;
function playNextCuratedTrack() {
  currentCuratedIdx = (currentCuratedIdx + 1) % CURATED_TRACKS.length;
  let nextItem = CURATED_TRACKS[currentCuratedIdx];
  if (nextItem && nextItem.track) {
    let dummyBtn = document.createElement('button');
    dummyBtn.className = 'play-button';
    dummyBtn.dataset.previewUrl = nextItem.track.spotifyPreview;
    togglePlay(dummyBtn, nextItem.track);
  }
}


async function syncDiscordBioToAboutMe() {
  try {
    let res = await fetch('https://dcdn.dstn.to/profile/423953946827161610');
    if (res.ok) {
      let data = await res.json();
      let bio = data.user_profile?.bio || data.user?.bio;
      let pronouns = data.user_profile?.pronouns;
      let el = document.getElementById('discord-bio-tag');
      let pronEl = document.getElementById('discord-pronoun-tag');
      if (el && bio) {
        el.textContent = bio;
      }
      if (pronEl && pronouns) {
        pronEl.textContent = pronouns;
      }
    }
  } catch(e) {}
}
syncDiscordBioToAboutMe();
setInterval(syncDiscordBioToAboutMe, 30000);


// --- Spotify Direct Play (Limerence) ---
function setupSpotifyCardPlayer() {
  const playBtn = document.getElementById('spotify-card-play-btn');
  const albumContainer = document.getElementById('album-art-container');
  
  const limerenceTrack = {
    name: "Bounce Out x Limerence",
    artists: [{ name: "Limerence" }, { name: "Yves Tumor" }],
    albums: [{ name: "Bounce Out x Limerence", image: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02af41341020c85f2f2279aeb2" }],
    spotifyPreview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/63/3a/9a/633a9af3-3962-ddc6-2a6d-a41ed22355cd/mzaf_17064792644112666738.plus.aac.p.m4a"
  };

  function playLimerence(e) {
    if (e) e.stopPropagation();
    let btn = playBtn || document.createElement('button');
    btn.dataset.previewUrl = limerenceTrack.spotifyPreview;
    togglePlay(btn, limerenceTrack);
  }

  if (playBtn) playBtn.addEventListener('click', playLimerence);
  if (albumContainer) albumContainer.addEventListener('click', playLimerence);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupSpotifyCardPlayer);
} else {
  setupSpotifyCardPlayer();
}
