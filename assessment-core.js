(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SpeechAssessmentCore=api})(typeof window==='object'?window:globalThis,()=>{
function validate(data,reference,digest){
 if(!data||data.version!==1||data.referenceText!==reference||data.audioDigest!==digest||typeof data.provider!=='string'||!data.provider.trim())throw Error('INVALID_RESULT');
 if(!['completed','insufficient_audio'].includes(data.status)||!Array.isArray(data.words))throw Error('INVALID_RESULT');
 const chars=Array.from(reference);let end=0;const covered=new Set();
 for(const w of data.words){if(!Number.isInteger(w.start)||!Number.isInteger(w.end)||w.start<end||w.end<=w.start||w.end>chars.length||w.text!==chars.slice(w.start,w.end).join('')||!['none','pronunciation','omission','uncertain'].includes(w.issue))throw Error('INVALID_RESULT');if(w.accuracy!=null&&(!Number.isFinite(w.accuracy)||w.accuracy<0||w.accuracy>100))throw Error('INVALID_RESULT');for(let i=w.start;i<w.end;i++)covered.add(i);end=w.end}
 // Unusable recordings must never produce highlighted pronunciation judgments.
 if(data.status==='insufficient_audio')return {...data,words:[]};if(!data.words.length||chars.some((c,i)=>/[\u4e00-\u9fff]/.test(c)&&!covered.has(i)))throw Error('INCOMPLETE_RESULT');return data;
}
function advice(word){
 if(word.issue==='uncertain')return 'この部分は音声を十分に確認できませんでした。静かな場所で、もう一度録音してみましょう。';
 if(word.issue==='omission')return '読み飛ばしていないか、録音を聞いて確認しましょう。音が小さくて認識されなかった可能性もあります。';
 if(word.issue==='pronunciation')return '発音を確認したいところです。お手本と聞き比べて、口の形や声調を意識しながら、ゆっくり読み直してみましょう。';
 return '';
}
return {validate,advice};
});
