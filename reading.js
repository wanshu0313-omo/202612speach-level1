(()=>{
const audio=document.getElementById('reading-audio'),dock=document.getElementById('audio-dock'),title=document.getElementById('audio-title'),status=document.getElementById('audio-status'),level=document.getElementById('article-level'),fullButtons=Array.from(document.querySelectorAll('[data-full-file]'));
let active=null,activeFull=null,request=0;
function clear(){document.querySelectorAll('.sentence-audio.playing').forEach(el=>el.classList.remove('playing'));fullButtons.forEach(button=>button.textContent='▶ 全文を聞く')}
function path(folder,file){return './'+folder+'/'+encodeURIComponent(file)}
async function play(src,label,button,fullButton=null){
 if(window.speechPractice?.busy)return;window.speechPractice?.pauseReview();const token=++request;audio.pause();clear();active=button;activeFull=fullButton;dock.hidden=false;document.body.classList.add('audio-open');title.textContent=label;status.textContent=fullButton?(level.value==='beginner'?'タイトルと本文のみ（冒頭・結びの挨拶を除く）':'全文のお手本音声'):'お手本の音声';audio.src=src;button?.classList.add('playing');
 try{await audio.play()}catch(e){if(token===request&&e.name!=='AbortError'){clear();status.textContent='再生できません。もう一度お試しいただくか、音声ファイルをご確認ください。'}}
}
document.querySelectorAll('.sentence-audio').forEach(button=>button.addEventListener('click',()=>play(path(button.dataset.audioFolder||'逐句朗读音频',button.dataset.file),button.getAttribute('aria-label').replace(/^(朗读|読み上げ)：/,''),button)));
fullButtons.forEach(button=>button.addEventListener('click',()=>{
 if(window.speechPractice?.busy)return;
 if(activeFull===button&&!audio.ended&&audio.src){if(audio.paused){window.speechPractice?.pauseReview();audio.play().catch(()=>{status.textContent='もう一度再生ボタンを押してください。'})}else audio.pause()}
 else play(path(button.dataset.fullFolder,button.dataset.fullFile),'全文音声 · '+button.dataset.fullTitle,null,button);
}));
audio.addEventListener('play',()=>{active?.classList.add('playing');if(activeFull)activeFull.textContent='Ⅱ 全文を一時停止'});
audio.addEventListener('pause',()=>{active?.classList.remove('playing');if(activeFull)activeFull.textContent='▶ 全文を続きから聞く'});
audio.addEventListener('ended',()=>{clear();status.textContent='再生が終了しました';activeFull=null});
audio.addEventListener('error',()=>{clear();activeFull=null;status.textContent='音声を読み込めません。音声ファイルをご確認ください。'});
function stop(){request++;audio.pause();clear();active=null;activeFull=null;dock.hidden=true;document.body.classList.remove('audio-open')}
document.getElementById('audio-close').addEventListener('click',stop);
function changeArticle(){stop();const intermediate=level.value==='intermediate';document.getElementById('beginner-article').hidden=intermediate;document.getElementById('intermediate-article').hidden=!intermediate;document.title=intermediate?'你，不敢吗？ · 中級スピーチ練習':'两个人看的日记 · 初級スピーチ練習';try{localStorage.setItem('speech-level',level.value)}catch{}window.scrollTo({top:0,behavior:'instant'})}
try{const saved=localStorage.getItem('speech-level');if(saved==='intermediate'||saved==='beginner')level.value=saved}catch{}
level.addEventListener('change',changeArticle);changeArticle();
})();
