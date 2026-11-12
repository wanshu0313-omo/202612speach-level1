(()=>{
const audio=document.getElementById('reading-audio'),dock=document.getElementById('audio-dock'),title=document.getElementById('audio-title'),status=document.getElementById('audio-status'),full=document.getElementById('full-reading');
let active=null,fullMode=false,request=0;
function clear(){document.querySelectorAll('.sentence-audio.playing').forEach(el=>el.classList.remove('playing'));full.textContent='▶ 全文朗读'}
async function play(path,label,button,isFull=false){
 const token=++request;audio.pause();clear();active=button;fullMode=isFull;
 dock.hidden=false;document.body.classList.add('audio-open');title.textContent=label;status.textContent=isFull?'标题与正文 · 不含开场及结尾致辞':'示范朗读';
 audio.src=path;button?.classList.add('playing');
 try{await audio.play()}catch(e){if(token===request&&e.name!=='AbortError')status.textContent='无法播放，请再试一次或检查音频文件。'}
}
document.querySelectorAll('.sentence-audio').forEach(button=>button.addEventListener('click',()=>play('./逐句朗读音频/'+encodeURIComponent(button.dataset.file),button.textContent.trim(),button)));
full.addEventListener('click',()=>{if(fullMode&&!audio.ended&&audio.src){if(audio.paused)audio.play().catch(()=>status.textContent='请再次点击播放。');else audio.pause()}else play('./全文朗读音频/'+encodeURIComponent('全文.m4a'),'全文朗读 · 两个人看的日记',null,true)});
function playName(){const select=document.getElementById('student-name'),name=select.options[select.selectedIndex].text;play('./逐句朗读音频/'+encodeURIComponent(name+'.m4a'),name,null)}
document.querySelector('.student-picker').addEventListener('click',playName);
document.querySelector('.student-picker').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();playName()}});
const choose=document.getElementById('choose-name'),menu=document.getElementById('student-menu'),select=document.getElementById('student-name');
function closeMenu(){menu.hidden=true;choose.setAttribute('aria-expanded','false')}
choose.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;choose.setAttribute('aria-expanded',String(open));menu.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.student===select.value)));if(open)menu.querySelector('button[aria-pressed="true"]').focus()});
menu.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{select.value=b.dataset.student;select.dispatchEvent(new Event('change',{bubbles:true}));closeMenu();choose.focus()}));
document.addEventListener('click',e=>{if(!e.target.closest('.student-control'))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();choose.focus()}});
document.getElementById('student-name').addEventListener('change',playName);
audio.addEventListener('play',()=>{active?.classList.add('playing');if(fullMode)full.textContent='Ⅱ 暂停全文朗读'});
audio.addEventListener('pause',()=>{active?.classList.remove('playing');if(fullMode)full.textContent='▶ 继续全文朗读'});
audio.addEventListener('ended',()=>{clear();status.textContent='朗读完毕';fullMode=false});
audio.addEventListener('error',()=>{clear();status.textContent='音频加载失败，请确认文件存在。'});
document.getElementById('audio-close').addEventListener('click',()=>{request++;audio.pause();clear();dock.hidden=true;document.body.classList.remove('audio-open');fullMode=false});
})();
