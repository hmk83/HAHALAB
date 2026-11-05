(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const exitDialogOpen=()=>document.getElementById('playlabGlobalExitModal')?.getAttribute('aria-hidden')==='false';
  const DATA = window.SituationOXData || {};
  const levels = DATA.levels || [];
  const TITLE = '생각 쑥쑥 OX 모험';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let audioContext=null, soundEnabled=true;
  try { soundEnabled=localStorage.getItem('hahalab-situation-ox-sound')!=='off'; } catch (_) {}
  function unlockSound() {
    if(!soundEnabled)return;
    try { const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext ||= new Audio();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{}); } catch (_) {}
  }
  function playFeedbackSound(correct) {
    if(!soundEnabled||document.hidden||!audioContext||audioContext.state!=='running')return;
    try {
      const start=audioContext.currentTime;
      const notes=correct?[523.25,659.25,783.99]:[329.63,261.63];
      notes.forEach((frequency,i)=>{const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();const t=start+i*(correct ? .105 : .15);oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,t);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.085,t+.018);gain.gain.exponentialRampToValueAtTime(.001,t+.18);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(t);oscillator.stop(t+.2);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};});
    } catch (_) {}
  }
  function renderSoundButton() { $('soundButton').textContent=soundEnabled?'♪':'♪̸';$('soundButton').setAttribute('aria-pressed',String(!soundEnabled));$('soundButton').setAttribute('aria-label',soundEnabled?'소리 끄기':'소리 켜기');$('soundButton').title=soundEnabled?'소리 끄기':'소리 켜기'; }
  const state = { phase: 'intro', level: null, deck: [], index: 0, results: [], gender: 'boy', started: 0, presented: 0, saved: false, token: 0, timers: [] };
  const descriptions = { preschool: ['🌱','우리 주변의 안전과 배려'], lower: ['🌿','학교와 친구 사이의 선택'], upper: ['🌳','함께 살아가는 책임과 존중'] };
  function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function shuffle(list) { const a = [...list]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
  function answerOf(item) { return typeof item.answer === 'boolean' ? item.answer : item.correct; }
  function cube(kind, front='') { return `<div class="cube ${kind}">${['front','back','left','right','top','bottom'].map(side=>`<span class="cube-face face-${side}">${side==='front'?front:''}</span>`).join('')}</div>`; }
  function avatar(gender, color) {
    return `<div class="avatar block-avatar ${gender}"${color ? ` style="--shirt:${color}"` : ''}><div class="avatar-rig"><div class="block-head">${cube('skin-head','<i class="block-eye eye-a"></i><i class="block-eye eye-b"></i><i class="block-smile"></i>')}${cube('hair-cap')}${cube('hair-fringe')}${gender==='girl'?cube('hair-tail tail-a')+cube('hair-tail tail-b'):cube('hair-tuft')}</div><div class="block-body">${cube('shirt-body','<span class="shirt-badge">✦</span><span class="shirt-seam"></span>')}${cube('belt')}</div><div class="arm left block-joint">${cube('sleeve')}${cube('hand')}</div><div class="arm right block-joint">${cube('sleeve')}${cube('hand')}</div><div class="leg left block-joint">${cube('trouser')}${cube('shoe')}</div><div class="leg right block-joint">${cube('trouser')}${cube('shoe')}</div></div></div>`;
  }
  function clearTimers() { state.token++; state.timers.forEach(clearTimeout); state.timers=[]; }
  function later(fn, ms) { const token=state.token; const id=setTimeout(()=>{const index=state.timers.indexOf(id);if(index!==-1)state.timers.splice(index,1);if(token===state.token)fn();},ms);state.timers.push(id); }
  function view(name) { ['intro','level','game','result'].forEach(n=>$(n+'View').classList.toggle('active',n===name)); state.phase=name; window.scrollTo({top:0}); }
  function setGender(gender) { state.gender=gender; document.querySelectorAll('[data-gender]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gender===gender))); }
  function detectGender() {
    const params=new URLSearchParams(location.search); const context=window.HahaLabLearningHarness?.readLaunchContext() || {};
    const raw=String(context.clientGender || context.gender || params.get('clientGender') || params.get('gender') || '').toLowerCase();
    if(['female','girl','여','여성','여자'].includes(raw)){setGender('girl');$('genderNote').textContent='선택한 아동의 정보에 맞춰 여자 캐릭터를 골랐어요. 변경할 수 있어요.';}
    else if(['male','boy','남','남성','남자'].includes(raw)){setGender('boy');$('genderNote').textContent='선택한 아동의 정보에 맞춰 남자 캐릭터를 골랐어요. 변경할 수 있어요.';}
  }
  function levelMenu() { clearTimers();view('level'); }
  function start(id) {
    const level=levels.find(l=>l.id===id); if(!level)return;
    const bank=level.items || [];
    if(bank.length<12){alert('상황 자료를 준비 중입니다. 잠시 후 다시 열어 주세요.');return;}
    clearTimers();state.level=level;state.deck=shuffle([...shuffle(bank.filter(i=>answerOf(i)===true)).slice(0,6),...shuffle(bank.filter(i=>answerOf(i)===false)).slice(0,6)]);
    if(state.deck.length!==12)state.deck=shuffle(bank).slice(0,12);
    state.index=0;state.results=[];state.started=Date.now();state.sessionId='situation-ox-'+crypto.randomUUID();state.saved=false;view('game');render();
  }
  function renderActors() {
    const colors=['#df9878','#8973ca','#4b9ec2','#d3ad46','#78a56b'];
    const cast=[{gender:state.gender,home:50,player:true,color:'#159f93'},...Array.from({length:10},(_,i)=>({gender:i%2?'boy':'girl',home:22+(i%5)*14+Math.floor(i/5)*4.5,color:colors[i%5]}))];
    const final=state.index===state.deck.length-1;
    $('characters').classList.toggle('final-round',final);
    $('characters').innerHTML=(final?cast.slice(0,2):cast).map((a,i)=>`<div class="actor ${a.player?'player':'npc'}" data-actor="${i}" style="--home:${a.home}%;--npc-row:${i?Math.floor((i-1)/5):0}">${avatar(a.gender,a.color)}</div>`).join('');
  }
  function render() {
    clearTimers();state.phase='loading';const item=state.deck[state.index];$('feedback').hidden=true;$('oButton').disabled=true;$('xButton').disabled=true;
    state.storyOpened=false;state.readingUntil=0;setStoryOpen(false);
    $('arena').querySelectorAll('.platform').forEach(p=>p.classList.remove('open'));$('sparkles').replaceChildren();renderActors();
    $('levelLabel').textContent=state.level.label;$('progressLabel').textContent=`${state.index+1} / ${state.deck.length}`;
    $('progressDots').innerHTML=state.deck.map((_,i)=>`<i class="${i<state.index?(state.results[i]?.correct?'done':'missed'):i===state.index?'current':''}"></i>`).join('');
    $('sceneTitle').textContent=item.title;
    const img=$('sceneImage');$('imageStatus').hidden=false;$('imageStatus').textContent='그림을 불러오고 있어요…';img.alt=item.alt || item.story;const token=state.token;
    function ready(){if(token!==state.token || state.phase!=='loading')return;$('imageStatus').hidden=true;state.phase='answer';state.presented=performance.now();syncChoices();schedulePeers(item);}
    img.onload=ready;img.onerror=()=>{if(token!==state.token)return;$('imageStatus').textContent='그림을 불러오지 못했어요. 연결을 확인한 뒤 다시 시작해 주세요.';state.phase='image-error';};img.src=item.image || `images/situation-ox/${item.id}.webp`;
    if(img.complete && img.naturalWidth)ready();
    $('sceneTitle').focus({preventScroll:true});
  }
  function moveActor(actor, selected, index, quick=false) {
    const final=state.index===state.deck.length-1;
    actor.dataset.choice=selected?'o':'x';
    actor.classList.toggle('quick-moving',quick);
    const slot=state.peerSlots?.[index] || 0;
    const duration=reduced?20:index===0?1000:1100;
    actor.style.setProperty('--move-ms',duration+'ms');
    placeOnDisc(actor,selected,slot,false);
    actor.dataset.moving='normal';
    actor.classList.add('walking');
    later(()=>{actor.classList.remove('walking');placeOnDisc(actor,selected,slot,true);actor.dataset.moving='arrived';},duration);
  }
  function placeOnDisc(actor,selected,slot,instant){
    const arena=$('arena'),disc=arena.querySelector(selected?'.platform-o':'.platform-x');
    if(!disc||disc.classList.contains('open'))return;
    actor.dataset.disc=selected?'o':'x';actor.dataset.slot=String(slot);
    const a=arena.getBoundingClientRect(),d=disc.getBoundingClientRect(),style=getComputedStyle(disc);
    const surfaceH=d.height-parseFloat(style.borderBottomWidth||0);
    const player=actor.classList.contains('player');
    const final=state.index===state.deck.length-1;
    const nx=player||final?0:[-.48,-.16,.16,.48][slot%4],ny=player ? .35 : final?0:Math.floor(slot/4)? .08:-.35;
    const targetX=d.left+d.width/2+nx*d.width/2,targetY=d.top+surfaceH/2+ny*surfaceH/2;
    const feet=[...actor.querySelectorAll('.shoe')].map(n=>n.getBoundingClientRect());if(!feet.length)return;
    const footX=(Math.min(...feet.map(f=>f.left))+Math.max(...feet.map(f=>f.right)))/2;
    const footY=Math.max(...feet.map(f=>f.bottom));
    if(instant)actor.style.transition='none';else actor.style.removeProperty('transition');
    actor.style.left=(actor.offsetLeft+targetX-footX)+'px';
    actor.style.bottom=(arena.clientHeight-actor.offsetTop-actor.offsetHeight-(targetY-footY))+'px';
    if(instant){void actor.offsetWidth;actor.style.removeProperty('transition');}
  }
  function placeAtStart(actor){
    const arena=$('arena'),pad=arena.querySelector('.start-pad'),d=pad.getBoundingClientRect();
    const feet=[...actor.querySelectorAll('.shoe')].map(n=>n.getBoundingClientRect());if(!feet.length)return;
    const x=(Math.min(...feet.map(f=>f.left))+Math.max(...feet.map(f=>f.right)))/2,y=Math.max(...feet.map(f=>f.bottom));
    actor.style.transition='none';actor.style.left=(actor.offsetLeft+d.left+d.width/2-x)+'px';actor.style.bottom=(arena.clientHeight-actor.offsetTop-actor.offsetHeight-(d.top+d.height/2-y))+'px';
    delete actor.dataset.disc;delete actor.dataset.slot;void actor.offsetWidth;actor.style.removeProperty('transition');
  }
  function schedulePeers(item) {
    [...$('characters').children].forEach((actor,i)=>i===0?placeAtStart(actor):placeOnDisc(actor,i%2===0,Math.floor(i/2),true));
    if(state.index===state.deck.length-1){state.peerChoices=[null,null];state.peerSlots=[0,0];startPeerWandering(true);return;}
    let leftCount=5+Math.floor(Math.random()*3);
    if(Math.random()<.5)leftCount=10-leftCount;
    state.peerChoices=[null,...shuffle(Array.from({length:10},(_,i)=>i<leftCount))];
    const counts={o:0,x:0};state.peerSlots=state.peerChoices.map((choice,i)=>i===0?0:counts[choice?'o':'x']++);
    startPeerWandering(false);
  }
  function startPeerWandering(final) {
    [...$('characters').children].slice(1).forEach((actor,i)=>{
      let direction=i%2?1:-1;
      function hesitate(){
        if(state.phase!=='answer')return;
        if(document.hidden||$('helpDialog').open||exitDialogOpen()){later(hesitate,700);return;}
        direction*=-1;
        actor.dataset.moving='wandering';
        actor.classList.add('hesitating','walking');
        actor.classList.remove('quick-moving');
        actor.style.setProperty('--peer-turn',`${direction*12}deg`);
        const selected=reduced?i%2===0:direction<0,slot=final?0:i%7;
        actor.style.setProperty('--move-ms',reduced?'20ms':'1200ms');placeOnDisc(actor,selected,slot,false);
        later(()=>{actor.classList.remove('walking');placeOnDisc(actor,selected,slot,true);actor.dataset.moving='arrived';},reduced?20:1200);
        if(!reduced)later(hesitate,1800+Math.random()*1000);
      }
      later(hesitate,200+i*110+Math.random()*150);
    });
  }
  function burst(side) { if(reduced)return;const box=$('sparkles');box.innerHTML=Array.from({length:22},(_,i)=>`<i style="left:${side?25:75}%;--color:${['#ffcb5e','#38b99b','#a087e8','#ee969c'][i%4]};--dx:${Math.round(Math.cos(i/22*Math.PI*2)*150)}px;--dy:${Math.round(Math.sin(i/22*Math.PI*2)*95)-40}px"></i>`).join(''); }
  function choose(selected) {
    if(state.phase!=='answer'||$('helpDialog').open||exitDialogOpen()||performance.now()<(state.readingUntil||0))return;
    if(state.deck[state.index]?.requiresContext&&!state.storyOpened){setStoryOpen(true);state.readingUntil=performance.now()+450;$('storyToggle').focus({preventScroll:true});$('storyToggle').classList.add('needs-reading');later(()=>$('storyToggle').classList.remove('needs-reading'),900);return;}
    state.phase='moving';$('oButton').disabled=true;$('xButton').disabled=true;
    unlockSound();
    const item=state.deck[state.index], correct=selected===answerOf(item), responseMs=Math.max(0,Math.round(performance.now()-state.presented));
    state.results.push({id:item.id,title:item.title,selected,expected:answerOf(item),correct,response_ms:responseMs,storyOpened:state.storyOpened===true,category:item.category || ''});
    clearTimers();
    const actors=[...$('characters').children];const choices=[...state.peerChoices];choices[0]=selected;
    // Peer side allocation is independent of the answer and never enters learner scoring.
    const final=state.index===state.deck.length-1;
    if(final){choices[1]=!selected;state.peerChoices=[null,!selected];}
    actors.forEach((a,i)=>{a.classList.remove('hesitating');a.style.removeProperty('--peer-turn');moveActor(a,choices[i],i,i!==0);});
    later(()=>{
      actors.forEach(a=>{a.classList.remove('walking');a.dataset.moving='arrived';});
      $('arena').querySelector(answerOf(item)?'.platform-x':'.platform-o').classList.add('open');
      actors.forEach((a,i)=>a.classList.add(choices[i]===answerOf(item)?'celebrate':'falling'));
      if(correct)burst(selected);
      playFeedbackSound(correct);
      $('feedbackTitle').textContent=correct?'정답입니다!':'아쉬워요!';$('feedbackText').textContent=item.explanation;
      $('feedback').classList.toggle('retry',!correct);$('feedback').hidden=false;$('nextButton').textContent=state.index===state.deck.length-1?'모험 마치기 →':'다음 상황 →';
      state.phase='feedback';
      $('nextButton').hidden=correct;
      $('feedback').focus({preventScroll:true});
      state.feedbackDelay=correct?Math.max(2800,Math.min(5500,1500+Array.from(item.explanation).length*70)):0;
      $('feedback').dataset.autoDelay=String(state.feedbackDelay);
      if(correct)later(function advanceCorrect(){if($('helpDialog').open||exitDialogOpen()){later(advanceCorrect,400);return;}next();},state.feedbackDelay);
    },reduced?170:1250);
  }
  function next() { if(state.phase!=='feedback')return; if(state.index===state.deck.length-1){finish();return;}state.index++;render(); }
  function finish() {
    clearTimers();const correct=state.results.filter(r=>r.correct).length;
    $('resultAvatar').innerHTML=`<div class="celebrate">${avatar(state.gender)}</div>`;
    $('resultSummary').textContent=`12가지 상황 중 ${correct}가지에서 알맞은 선택을 했어요.`;
    $('resultGrid').innerHTML=state.deck.map((item,i)=>`<article class="review-card ${state.results[i].correct?'':'missed'}"><img src="${esc(item.image)}" alt="${esc(item.alt || item.story)}" loading="lazy"><div><span class="review-mark">${state.results[i].correct?'✓ 알맞은 선택':'↻ 함께 다시 보기'} · ${answerOf(item)?'O':'X'}</span><strong>${esc(item.title)}</strong><p>${esc(item.explanation)}</p></div></article>`).join('');
    try { persist(correct); } catch (error) { state.saved=false; console.warn('OX session recording failed', error); }
    view('result');
  }
  function persist(correct) {
    if(state.saved || !window.HahaLabLearningHarness?.recordSession)return;
    const durationSeconds=Math.max(1,Math.round((Date.now()-state.started)/1000));
    const summary=`${state.level.label} 상황 판단 활동 12문항 중 ${correct}문항에서 알맞은 행동을 선택했습니다.`;
    window.HahaLabLearningHarness?.recordSession({sessionId:state.sessionId,labKind:'cardlab',reportScope:'cardlab',saveToClientReport:true,curriculumKey:'cardlab-situation-ox',reportType:'cardlab-situation-ox',stageKey:state.level.id,stageTitle:state.level.label,labTitle:TITLE,scored:true,totalQuestions:12,correctCount:correct,wrongCount:12-correct,startedAtMs:state.started,durationSeconds,summary,guardianSummary:summary+' 선택한 까닭과 다른 행동 방법을 함께 이야기해 주세요.',teacherReviewNote:'이번 상황 판단 수행 기록입니다. 읽기 도움과 문장 이해의 영향을 고려해 해석하며, 실제 생활 행동이나 사회성 발달 수준을 판정하지 않습니다.',actionPlanSummary:'다시 볼 상황의 그림 단서를 짚고 안전하고 배려하는 행동을 역할놀이로 연습해 주세요.',focusKey:'situation-judgement',focusLabel:'상황 이해·행동 판단',wrongWords:state.results.filter(r=>!r.correct).map(r=>r.title),questionSnapshot:state.results.map(r=>({...r})),resultSnapshot:state.results.map(r=>({...r})),details:{report_type:'cardlab-situation-ox',report_scope:'cardlab',lab_scope:'cardlab',assessment_mode:'situational-ox',metric_semantics:'first_response_accuracy',item_responses:state.results.map(r=>({...r})),difficulty:state.level.id,avatar_gender:state.gender,npc_results_excluded:true,completion_reason:'all-12-answered',clinical_limit:'상황 판단 활동의 수행 기록이며 표준화된 사회성 검사 또는 진단 결과가 아닙니다.'}});
    state.saved=true;
  }
  $('introAvatars').innerHTML=avatar('boy','#13998f')+avatar('girl','#a77bce');
  $('levelCards').innerHTML=levels.map(l=>{const d=descriptions[l.id]||['✦','상황 판단'];return `<button class="level-card" data-level="${esc(l.id)}"><span class="level-icon">${d[0]}</span><h2>${esc(l.label)}</h2><p>${d[1]}</p><strong>12가지 상황 만나기 →</strong></button>`;}).join('');
  $('startButton').onclick=levelMenu;$('levelsButton').onclick=levelMenu;$('homeButton').onclick=()=>{clearTimers();view('intro');};
  $('levelCards').onclick=e=>{const b=e.target.closest('[data-level]');if(b)start(b.dataset.level);};
  document.querySelectorAll('[data-gender]').forEach(b=>b.onclick=()=>setGender(b.dataset.gender));
  $('oButton').onclick=()=>choose(true);$('xButton').onclick=()=>choose(false);$('nextButton').onclick=next;$('retryButton').onclick=()=>start(state.level.id);$('chooseLevelButton').onclick=levelMenu;
  function syncChoices() {
    const locked=state.phase!=='answer';
    $('oButton').disabled=locked;$('xButton').disabled=locked;
  }
  function setStoryOpen(open) {
    if(open && ['loading','answer'].includes(state.phase)){state.storyOpened=true;state.readingUntil=performance.now()+450;}
    $('storyToggle').setAttribute('aria-pressed',String(open));
    $('sceneStory').textContent=open?(state.deck[state.index]?.story || ''):'어떤 내용인지 클릭해서 확인해 볼까요?';
    $('storyToggle').classList.toggle('is-revealed',open);
    syncChoices();
  }
  $('storyToggle').onclick=()=>{if($('storyToggle').getAttribute('aria-pressed')!=='true')setStoryOpen(true);};
  let helpOpenedAt=0;
  $('helpButton').onclick=()=>{helpOpenedAt=performance.now();$('helpDialog').showModal();};
  $('soundButton').onclick=()=>{soundEnabled=!soundEnabled;try{localStorage.setItem('hahalab-situation-ox-sound',soundEnabled?'on':'off');}catch(_){}if(soundEnabled)unlockSound();renderSoundButton();};
  $('closeHelp').onclick=$('confirmHelp').onclick=()=>$('helpDialog').close();
  $('helpDialog').addEventListener('close',()=>{if(state.phase==='answer')state.presented+=performance.now()-helpOpenedAt;});
document.addEventListener('keydown',e=>{if($('helpDialog').open||exitDialogOpen()||e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;if(state.phase==='answer'&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();choose(e.key==='ArrowLeft');}else if(state.phase==='feedback'&&e.key==='Enter'){e.preventDefault();next();}});
window.SituationOXTest=Object.freeze({snapshot:()=>({phase:state.phase,activeTimers:state.timers.length,soundEnabled,peerDistribution:{o:(state.peerChoices||[]).filter(v=>v===true).length,x:(state.peerChoices||[]).filter(v=>v===false).length},index:state.index,gender:state.gender,level:state.level?.id || null,deck:state.deck.map(i=>i.id),current:state.deck[state.index]?{id:state.deck[state.index].id,answer:answerOf(state.deck[state.index])}:null,results:state.results.map(r=>({...r})),playerState:document.querySelector('.actor.player')?.className || '',npcFalls:document.querySelectorAll('.npc.falling').length,saved:state.saved})});
  detectGender();
  renderSoundButton();
  document.addEventListener('keydown',e=>{if(state.phase!=='feedback'||exitDialogOpen()||e.key!=='Tab')return;const targets=[$('nextButton'),document.querySelector('[data-playlab-global-exit]')].filter(n=>n&&!n.hidden);if(!targets.length)return;e.preventDefault();const i=targets.indexOf(document.activeElement);targets[(i+(e.shiftKey?-1:1)+targets.length)%targets.length].focus();});
  let resizePending=false;
window.addEventListener('resize',()=>{if(resizePending)return;resizePending=true;requestAnimationFrame(()=>{resizePending=false;if(!['answer','moving'].includes(state.phase))return;const player=$('characters').querySelector('.actor.player');if(player&&!player.dataset.disc)placeAtStart(player);$('characters').querySelectorAll('.actor[data-disc]').forEach(actor=>placeOnDisc(actor,actor.dataset.disc==='o',Number(actor.dataset.slot)||0,true));});});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&audioContext){audioContext.close().catch(()=>{});audioContext=null;}});
})();
