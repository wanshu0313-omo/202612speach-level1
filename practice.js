(()=>{
const $=id=>document.getElementById(id),panel=$('practice-panel'),player=$('practice-player'),reference=$('reading-audio'),level=$('article-level');
const record=$('practice-record'),stop=$('practice-stop'),replay=$('practice-replay'),compare=$('practice-compare'),listen=$('practice-reference'),download=$('practice-download'),message=$('practice-status');
let selected=null,recording=null,stream=null,busy=false,timer=null,url=null,blob=null,selectionVersion=0,sequence=null;
const memory=new Map();
const database=new Promise(resolve=>{try{const req=indexedDB.open('speech-practice-recordings',1);req.onupgradeneeded=()=>req.result.createObjectStore('recordings');req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null);req.onblocked=()=>resolve(null)}catch{resolve(null)}});
async function storage(method,key,value){const db=await database;if(!db)return method==='get'?memory.get(key):false;return new Promise(resolve=>{try{const tx=db.transaction('recordings',method==='get'?'readonly':'readwrite'),store=tx.objectStore('recordings');const req=method==='get'?store.get(key):store.put(value,key);tx.oncomplete=()=>resolve(method==='get'?req.result:true);tx.onerror=()=>resolve(method==='get'?memory.get(key):false);tx.onabort=tx.onerror}catch{resolve(method==='get'?memory.get(key):false)}})}
function pauseReview(){sequence=null;player.pause();player.onended=null}
function controls(){record.disabled=!selected||busy;stop.disabled=!recording||recording.state!=='recording';replay.disabled=!blob||busy;compare.disabled=!blob||!selected?.file||busy;listen.disabled=!selected?.file||busy;level.disabled=busy;download.hidden=!blob||busy;$('practice-close').disabled=busy;document.dispatchEvent(new CustomEvent('speech-practice-context',{detail:{selected,blob,busy}}))}
function setBlob(value){if(url)URL.revokeObjectURL(url);blob=value||null;url=blob?URL.createObjectURL(blob):null;player.removeAttribute('src');if(url){player.src=url;download.href=url;const ext=blob.type.includes('mp4')?'m4a':blob.type.includes('ogg')?'ogg':'webm';download.download=selected.label+'.'+ext}controls()}
function show(){panel.hidden=false}
async function select(button){pauseReview();selected?.button.classList.remove('practice-selected');const label=button.getAttribute('aria-label').replace(/^(朗读|练习|読み上げ|練習)：/,'');selected={button,label,file:button.dataset.file,folder:button.dataset.audioFolder||'逐句朗读音频',key:level.value+':'+label};selected.button.classList.add('practice-selected');show();$('practice-title').textContent='一文ずつ練習 · '+label;setBlob(null);message.textContent='この文の録音を読み込んでいます…';const version=++selectionVersion;const value=await storage('get',selected.key);if(version!==selectionVersion)return;setBlob(value);message.textContent=value?'前回の録音が見つかりました。再生するか、録り直すことができます。':selected.file?'まずお手本を聞き、続いて自分の声を録音しましょう。各文の最新の録音がこのブラウザに保存されます。':'この文のお手本は準備中です。録音・再生の練習はできます。'}
document.addEventListener('click',e=>{const button=e.target.closest('.sentence-audio,.practice-only');if(!button)return;if(busy){e.preventDefault();e.stopImmediatePropagation();return}select(button)},true);
listen.onclick=()=>{if(selected?.file)selected.button.click()};
record.onclick=async()=>{
 if(!selected||busy)return;if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){message.textContent='このブラウザでは録音できません。HTTPSのサイトをSafari・Chrome・Edgeで開いてください。';return}
 const target={...selected};busy=true;controls();pauseReview();reference.pause();message.textContent='マイクの使用を許可してください…';
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  const type=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus','audio/webm'].find(t=>MediaRecorder.isTypeSupported(t));
  recording=new MediaRecorder(stream,type?{mimeType:type}:undefined);const chunks=[];const started=Date.now();
  recording.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  recording.onerror=()=>{message.textContent='録音が中断されました。マイクを確認して、もう一度お試しください。';finish()};
  recording.onstop=async()=>{
   clearInterval(timer);stream?.getTracks().forEach(t=>t.stop());stream=null;
   const value=new Blob(chunks,{type:recording.mimeType||type||'audio/webm'});recording=null;
   if(value.size){memory.set(target.key,value);const saved=await storage('put',target.key,value);if(selected?.key===target.key){setBlob(value);message.textContent=saved?'このブラウザに録音を保存しました。お手本と自分の声を聞き比べましょう。録り直すと前の録音は上書きされます。':'録音ができました。このページを閉じると消えるため、ダウンロードして保存してください。'}}else message.textContent='音声を録音できませんでした。もう一度お試しください。';
   busy=false;$('practice-timer').textContent='';controls();
  };
  recording.start();message.textContent='録音中です。選んだ文を読んでください…';controls();
  timer=setInterval(()=>{const seconds=Math.floor((Date.now()-started)/1000);$('practice-timer').textContent=seconds+' / 60 秒';if(seconds>=60)finish()},250);
 }catch(e){stream?.getTracks().forEach(t=>t.stop());stream=null;busy=false;recording=null;controls();message.textContent=e.name==='NotAllowedError'?'マイクの使用が許可されていません。ブラウザの設定で許可してから「録音する」を押してください。':e.name==='NotFoundError'?'マイクが見つかりません。接続を確認して、もう一度お試しください。':'録音を開始できません。他のアプリがマイクを使用していないか確認してください。'}
};
function finish(){clearInterval(timer);if(recording?.state==='recording'){recording.stop();stop.disabled=true;message.textContent='録音を保存しています…'}}stop.onclick=finish;
replay.onclick=()=>{pauseReview();reference.pause();player.src=url;player.play().catch(()=>message.textContent='録音を再生できません。ダウンロードしてお試しください。');message.textContent='自分の録音を再生しています。'};
compare.onclick=async()=>{pauseReview();reference.pause();const current=selected;sequence=current.key;player.src='./'+current.folder+'/'+encodeURIComponent(current.file);message.textContent='お手本の後に、自分の録音を自動で再生します。';player.onended=()=>{if(sequence!==current.key)return;player.onended=null;player.src=url;player.play().catch(()=>message.textContent='「自分の録音」を押して再生してください。');message.textContent='自分の録音を再生しています。声調・間の取り方・読む速さを比べましょう。'};try{await player.play()}catch{message.textContent='お手本を再生できません。音声がアップロードされているか確認してください。'}};
player.onerror=()=>{pauseReview();message.textContent='音声を読み込めません。お手本のファイルを確認するか、録り直してください。'};
$('practice-open').onclick=()=>{show();if(!selected){message.textContent='本文の中国語の文を選び、「録音する」を押してください。録音は送信されず、このブラウザにのみ保存されます。'}};
$('practice-close').onclick=()=>{pauseReview();panel.hidden=true};
level.addEventListener('change',()=>{pauseReview();selectionVersion++;selected?.button.classList.remove('practice-selected');selected=null;setBlob(null);panel.hidden=true;$('practice-title').textContent='中国語の文を選んで、録音・聞き比べを始めましょう'});
reference.addEventListener('play',()=>{if(busy){reference.pause();return}pauseReview()});
window.addEventListener('pagehide',()=>{clearInterval(timer);stream?.getTracks().forEach(t=>t.stop())});
window.speechPractice={get busy(){return busy},get context(){return {selected,blob,busy}},pauseReview};controls();
})();
