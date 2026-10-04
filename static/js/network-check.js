(function(){
'use strict';
var host=location.hostname.toLowerCase();
if(host==='localhost'||host==='127.0.0.1'||host==='0.0.0.0'||host==='::1'||host==='[::1]')return;
var root=document.documentElement,revealed=false;
root.style.visibility='hidden';
function reveal(){if(revealed)return;revealed=true;root.style.visibility=''}
var timeout=setTimeout(reveal,2500);
fetch('https://yt.kast.rest/network/check',{cache:'no-store',referrerPolicy:'no-referrer'})
  .then(function(response){return response.ok?response.json():null})
  .then(function(result){
    if(result&&result.blocked){
      var blockedPath=location.pathname.indexOf('/html/')===0?'/html/blocked.html':'/blocked';
      location.replace(blockedPath);
      return;
    }
    clearTimeout(timeout);reveal();
  })
  .catch(function(){clearTimeout(timeout);reveal()});
})();
