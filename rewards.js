'use strict';
// 英文街机播报：独立于听写语速，不改变教学音频。
window.QUEST_REWARDS = (() => {
  const tiers = [
    {line:'Nice!',badge:'FIRST BLOOD',call:'First Blood!',icon:'✦',color:'#bcebcf'},
    {line:'Good!',badge:'DOUBLE KILL',call:'Double Kill!',icon:'⚡',color:'#bcebcf'},
    {line:'Very good!',badge:'TRIPLE KILL',call:'Triple Kill!',icon:'⚡',color:'#c6e9ff'},
    {line:'Excellent!',badge:'QUADRA KILL',call:'Quadra Kill!',icon:'★',color:'#d6cdff'},
    {line:'Perfect!',badge:'PENTA KILL',call:'Penta Kill!',icon:'♛',color:'#ffe1a2'},
    {line:'Wonderful!',badge:'UNSTOPPABLE',call:'Unstoppable!',icon:'♛',color:'#ffd1e5'},
    {line:'Amazing!',badge:'LEGENDARY',call:'Legendary!',icon:'✧',color:'#ffe1a2'}
  ];
  let context=null,utterance=null,voices=[],previewTimers=[],audioNodes=[],generation=0;
  function tier(streak){const n=Number.isFinite(streak)?Math.max(1,Math.floor(streak)):1;return {...tiers[Math.min(n-1,tiers.length-1)],streak:n,level:Math.min(n,7)}}
  function warm(){
    try{const C=window.AudioContext||window.webkitAudioContext;if(C){context=context||new C();if(context.state==='suspended')context.resume().catch(()=>{})}}catch{}
    if('speechSynthesis'in window)voices=speechSynthesis.getVoices();
  }
  function stop(){generation++;previewTimers.forEach(clearTimeout);previewTimers=[];audioNodes.forEach(n=>{try{n.stop()}catch{}});audioNodes=[];if(utterance&&'speechSynthesis'in window)speechSynthesis.cancel();utterance=null}
  function chime(level=1,reason=false){
    warm();if(!context||context.state!=='running')return;
    const notes=reason?[659.25,783.99,987.77]:[523.25,659.25,783.99,1046.5,1318.51,1567.98].slice(0,Math.min(2+level,6));
    const time=context.currentTime;
    notes.forEach((f,i)=>{const o=context.createOscillator(),g=context.createGain();o.type=i%2?'sine':'triangle';o.frequency.setValueAtTime(f*.72,time+i*.075);o.frequency.exponentialRampToValueAtTime(f,time+i*.075+.035);g.gain.setValueAtTime(0,time+i*.075);g.gain.linearRampToValueAtTime(.075,time+i*.075+.012);g.gain.exponentialRampToValueAtTime(.001,time+i*.075+.2);o.connect(g);g.connect(context.destination);o.start(time+i*.075);o.stop(time+i*.075+.23);audioNodes.push(o);o.onended=()=>{o.disconnect();g.disconnect();audioNodes=audioNodes.filter(n=>n!==o)}});
  }
  function chooseVoice(){
    if(!('speechSynthesis'in window))return null;
    voices=speechSynthesis.getVoices();const english=voices.filter(v=>/^en[-_]/i.test(v.lang));
    return english.find(v=>/aria|jenny|ana|michelle|samantha|zira|ava|susan|google us english/i.test(v.name))||english.find(v=>/en-US/i.test(v.lang))||english[0]||null;
  }
  function say(text,level,onUnavailable){
    if(!('speechSynthesis'in window)){onUnavailable?.();return}
    const u=new SpeechSynthesisUtterance(text),v=chooseVoice();u.lang='en-US';if(v)u.voice=v;
    // 较高音调、短句和轻快节奏营造卡通感，不使用中文朗读器。
    u.pitch=Math.min(1.48,1.24+level*.035);u.rate=level>=5?1.04:1.10;u.volume=.85;utterance=u;
    u.onend=()=>{if(utterance===u)utterance=null};u.onerror=e=>{if(utterance===u)utterance=null;if(!['canceled','interrupted'].includes(e.error))onUnavailable?.()};
    speechSynthesis.cancel();speechSynthesis.speak(u);
  }
  function play(streak,{reason=false,correct=true,onUnavailable}={}){
    stop();warm();const t=tier(streak);chime(correct?t.level:1,reason&&!correct);
    const text=correct?`${t.line} ${t.call}${reason?' Great detective work!':''}`:'Great detective work! Evidence found!';
    const ownGeneration=generation;
    // 铃声先起，播报紧随其后；新题/静音时可立即取消。
    previewTimers.push(setTimeout(()=>{if(ownGeneration===generation)say(text,t.level,onUnavailable)},190));
    return t;
  }
  function preview(onUnavailable){play(1,{onUnavailable});const token=generation;[2,3,4,5].forEach((n,i)=>previewTimers.push(setTimeout(()=>{if(generation!==token)return;chime(n);say(`${tier(n).line} ${tier(n).call}`,n,onUnavailable)},(i+1)*2600)))}
  if('speechSynthesis'in window)speechSynthesis.addEventListener?.('voiceschanged',()=>{voices=speechSynthesis.getVoices()});
  return {tier,warm,play,stop,preview};
})();
