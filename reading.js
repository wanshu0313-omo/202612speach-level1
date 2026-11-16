(()=>{
const audio=document.getElementById('reading-audio'),dock=document.getElementById('audio-dock'),title=document.getElementById('audio-title'),status=document.getElementById('audio-status'),full=document.getElementById('full-reading'),level=document.getElementById('article-level');
let active=null,fullMode=false,request=0;
function clear(){document.querySelectorAll('.sentence-audio.playing').forEach(el=>el.classList.remove('playing'));full.textContent='▶ 全文を聞く'}
async function play(path,label,button,isFull=false){if(window.speechPractice?.busy)return;window.speechPractice?.pauseReview();const token=++request;audio.pause();clear();active=button;fullMode=isFull;dock.hidden=false;document.body.classList.add('audio-open');title.textContent=label;status.textContent=isFull?'タイトルと本文のみ（冒頭・結びの挨拶を除く）':'お手本の音声';audio.src=path;button?.classList.add('playing');try{await audio.play()}catch(e){if(token===request&&e.name!=='AbortError')status.textContent='再生できません。もう一度お試しいただくか、音声ファイルをご確認ください。'}}
document.querySelectorAll('.sentence-audio').forEach(button=>button.addEventListener('click',()=>play('./'+(button.dataset.audioFolder||'逐句朗读音频')+'/'+encodeURIComponent(button.dataset.file),button.getAttribute('aria-label').replace(/^(朗读|読み上げ)：/,''),button)));
full.addEventListener('click',()=>{if(fullMode&&!audio.ended&&audio.src){if(audio.paused)audio.play().catch(()=>status.textContent='もう一度再生ボタンを押してください。');else audio.pause()}else play('./全文朗读音频/'+encodeURIComponent('全文.m4a'),'全文音声 · 两个人看的日记',null,true)});
audio.addEventListener('play',()=>{active?.classList.add('playing');if(fullMode)full.textContent='Ⅱ 全文を一時停止'});
audio.addEventListener('pause',()=>{active?.classList.remove('playing');if(fullMode)full.textContent='▶ 全文を続きから聞く'});
audio.addEventListener('ended',()=>{clear();status.textContent='再生が終了しました';fullMode=false});
audio.addEventListener('error',()=>{clear();status.textContent='音声を読み込めません。音声ファイルをご確認ください。'});
function stop(){request++;audio.pause();clear();active=null;dock.hidden=true;document.body.classList.remove('audio-open');fullMode=false}
document.getElementById('audio-close').addEventListener('click',stop);
function changeArticle(){stop();const intermediate=level.value==='intermediate';document.getElementById('beginner-article').hidden=intermediate;document.getElementById('intermediate-article').hidden=!intermediate;document.title=intermediate?'你，不敢吗？ · 中級スピーチ練習':'两个人看的日记 · 初級スピーチ練習';try{localStorage.setItem('speech-level',level.value)}catch{}window.scrollTo({top:0,behavior:'instant'})}
try{const saved=localStorage.getItem('speech-level');if(saved==='intermediate'||saved==='beginner')level.value=saved}catch{}
level.addEventListener('change',changeArticle);changeArticle();
})();