'use strict';

const STORAGE_KEY = 'rankling-cohort-sheet-v1';
const abilities = ['str','dex','con','int','wis','cha'];
const abilityNames = {str:'Strength',dex:'Dexterity',con:'Constitution',int:'Intelligence',wis:'Wisdom',cha:'Charisma'};
const skills = [
  ['Acrobatics','dex'],['Animal Handling','wis'],['Arcana','int'],['Athletics','str'],['Deception','cha'],['History','int'],
  ['Insight','wis'],['Intimidation','cha'],['Investigation','int'],['Medicine','wis'],['Nature','int'],['Perception','wis'],
  ['Performance','cha'],['Persuasion','cha'],['Religion','int'],['Sleight of Hand','dex'],['Stealth','dex'],['Survival','wis']
];
const stances = {
  shield: {name:'Shield Wall', min:2, ac:1, speed:-5, description:'Troopers overlap shields around the Brass. Gain +1 AC and brace the cohort against forced movement.', mods:['+1 AC','−5 ft speed','Lock Shields']},
  spearhead: {name:'Spearhead', min:3, ac:0, speed:5, description:'The Brass lowers its spear and the troopers drive forward in a wedge. Built for charges and pushing through a line.', mods:['+5 ft speed','Charge attack','Push']},
  assault: {name:'Assault Rank', min:3, ac:0, speed:0, description:'The line opens just enough for successive sword strikes. Offensive manoeuvres can spread pressure across adjacent enemies.', mods:['Coordinated slash','No reaction rider','Aggressive']},
  escort: {name:'Escort Formation', min:2, ac:0, speed:0, description:'The cohort surrounds and moves with a protected ally. Troopers may interpose shields or help escort them through danger.', mods:['Guard ally','Interpose','Mobile cover']}
};
const hairColours = ['#9a6d3e','#6f452c','#b88966','#a74272','#e3cf9f'];

function defaultState() {
  return {
    version: 1,
    character: {
      name: 'The Copper Rank', player: '', species: 'Rankling', className: 'Fighter', subclass: 'Battle Master', background: 'Soldier', level: 3,
      baseAC: 16, baseSpeed: 25, currentHP: 28, maxHP: 28, tempHP: 0, hitDiceRemaining: 3, hitDiceMax: 3,
      initiativeBonus: 0, abilities: {str:16,dex:12,con:14,int:14,wis:10,cha:8},
      saves: {str:true,dex:false,con:true,int:false,wis:false,cha:false},
      skills: {'Athletics':1,'History':1,'Investigation':1,'Perception':1},
      equipment: "Leader's short spear and command shield\nFive short swords and five round shields\nMatching bronze helmets and light formation armour\nBanner ribbons, field rations and repair kit",
      notes: 'The Brass is the only fully self-directing member of the cohort. Each trooper has a distinct personality but depends on recognised leadership for purposeful action.',
      sessionLog: ''
    },
    formation: { stance:'shield', linkDetachedDamage:true },
    troopers: [
      {id:1,name:'Pip',hair:'Chestnut',status:'formed',currentHP:6,maxHP:6,ac:14,leader:'The Brass',order:'Form up'},
      {id:2,name:'Tansy',hair:'Cocoa',status:'formed',currentHP:6,maxHP:6,ac:14,leader:'The Brass',order:'Form up'},
      {id:3,name:'Nell',hair:'Rose',status:'formed',currentHP:6,maxHP:6,ac:14,leader:'The Brass',order:'Form up'},
      {id:4,name:'Button',hair:'Pale blond',status:'formed',currentHP:6,maxHP:6,ac:14,leader:'The Brass',order:'Form up'},
      {id:5,name:'Scruff',hair:'Ash brown',status:'formed',currentHP:6,maxHP:6,ac:14,leader:'The Brass',order:'Form up'}
    ],
    rollHistory: []
  };
}

let state = loadState();
let saveTimer;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return mergeDeep(defaultState(), JSON.parse(raw));
  } catch (err) {
    console.warn('Could not load saved sheet', err);
    return defaultState();
  }
}
function mergeDeep(target, source) {
  if (!source || typeof source !== 'object') return target;
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) target[key] = source[key];
    else if (source[key] && typeof source[key] === 'object') target[key] = mergeDeep(target[key] || {}, source[key]);
    else target[key] = source[key];
  }
  return target;
}
function getPath(obj, path) { return path.split('.').reduce((acc,key)=>acc?.[key],obj); }
function setPath(obj, path, value) {
  const keys = path.split('.'); const last = keys.pop(); const root = keys.reduce((acc,key)=>acc[key] ??= {},obj); root[last]=value;
}
function mod(score) { return Math.floor((Number(score)-10)/2); }
function prof() { return 2 + Math.floor((Math.max(1,Number(state.character.level))-1)/4); }
function fmt(n) { return Number(n)>=0 ? `+${Number(n)}` : String(Number(n)); }
function formedCount() { return state.troopers.filter(t=>t.status==='formed').length; }
function formationState() {
  if (state.character.currentHP <= 0 || formedCount() < 2) return 'Broken';
  const unavailable = state.troopers.filter(t=>t.status!=='formed').length;
  if (unavailable === 0) return 'Complete';
  if (unavailable === 1) return 'Reduced';
  return 'Fragmented';
}
function currentStance() { return stances[state.formation.stance] || stances.shield; }

function scheduleSave() {
  document.getElementById('saveStatus').textContent = 'Saving…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.getElementById('saveStatus').textContent = 'Saved locally';
  }, 180);
}
function showToast(message) {
  const toast=document.getElementById('toast'); toast.textContent=message; toast.classList.add('show');
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove('show'),2200);
}

function bindInputs() {
  document.querySelectorAll('.data-input').forEach(input=>{
    const path=input.dataset.path;
    if (!path) return;
    const value=getPath(state,path);
    if (input.type==='checkbox') input.checked=Boolean(value); else input.value=value ?? '';
    const event=input.tagName==='TEXTAREA' ? 'input' : 'change';
    input.addEventListener(event,()=>{
      let next=input.type==='checkbox' ? input.checked : input.value;
      if (input.type==='number') next=Number(next);
      setPath(state,path,next);
      renderDynamic(); scheduleSave();
    });
    if (event!=='input') input.addEventListener('input',()=>{
      if (input.type==='number') setPath(state,path,Number(input.value));
      else if (input.type!=='file') setPath(state,path,input.value);
      renderDynamic(); scheduleSave();
    });
  });
}

function renderAbilities() {
  const grid=document.getElementById('abilityGrid'); grid.innerHTML='';
  abilities.forEach(key=>{
    const card=document.createElement('div'); card.className='ability-card';
    card.innerHTML=`<label>${abilityNames[key]}<input type="number" min="1" max="30" value="${state.character.abilities[key]}" data-ability="${key}"></label><button class="ability-mod" type="button" title="Roll ${abilityNames[key]} check">${fmt(mod(state.character.abilities[key]))}</button>`;
    card.querySelector('input').addEventListener('input',e=>{state.character.abilities[key]=Number(e.target.value);renderChecks();renderDynamic();scheduleSave();});
    card.querySelector('button').addEventListener('click',()=>rollAndDisplay(`1d20${fmt(mod(state.character.abilities[key]))}`,`${abilityNames[key]} check`));
    grid.appendChild(card);
  });
}

function renderChecks() {
  const savesEl=document.getElementById('saveList'); const skillEl=document.getElementById('skillList'); savesEl.innerHTML=''; skillEl.innerHTML='';
  abilities.forEach(key=>{
    const bonus=mod(state.character.abilities[key])+(state.character.saves[key]?prof():0);
    const row=document.createElement('div'); row.className='check-row';
    row.innerHTML=`<input type="checkbox" ${state.character.saves[key]?'checked':''} aria-label="${abilityNames[key]} save proficiency"><span>${abilityNames[key]} <small>(${key.toUpperCase()})</small></span><button type="button">${fmt(bonus)}</button>`;
    row.querySelector('input').addEventListener('change',e=>{state.character.saves[key]=e.target.checked;renderChecks();scheduleSave();});
    row.querySelector('button').addEventListener('click',()=>rollAndDisplay(`1d20${fmt(bonus)}`,`${abilityNames[key]} saving throw`));
    savesEl.appendChild(row);
  });
  skills.forEach(([name,key])=>{
    const rank=Number(state.character.skills[name]||0); const bonus=mod(state.character.abilities[key])+prof()*rank;
    const row=document.createElement('div'); row.className='check-row';
    row.innerHTML=`<input type="checkbox" ${rank?'checked':''} aria-label="${name} proficiency"><span>${name} <small>${key.toUpperCase()}</small></span><button type="button">${fmt(bonus)}</button>`;
    row.querySelector('input').addEventListener('change',e=>{state.character.skills[name]=e.target.checked?1:0;renderChecks();renderDynamic();scheduleSave();});
    row.querySelector('button').addEventListener('click',()=>rollAndDisplay(`1d20${fmt(bonus)}`,name));
    skillEl.appendChild(row);
  });
}

function renderStances() {
  const grid=document.getElementById('stanceGrid'); grid.innerHTML='';
  Object.entries(stances).forEach(([key,stance])=>{
    const active=state.formation.stance===key; const available=formedCount()>=stance.min;
    const card=document.createElement('div'); card.className=`stance-card ${active?'active':''}`;
    card.innerHTML=`<h3>${stance.name}</h3><p>${stance.description}</p><div class="stance-mods">${stance.mods.map(x=>`<span>${x}</span>`).join('')}</div><button type="button" ${!available&&!active?'disabled':''} class="${active?'active':''}">${active?'Active':available?'Adopt stance':`Needs ${stance.min} formed`}</button>`;
    card.querySelector('button').addEventListener('click',()=>{
      if (!available) return showToast(`At least ${stance.min} troopers must be formed.`);
      state.formation.stance=key; renderAll(); scheduleSave(); showToast(`${stance.name} adopted.`);
    });
    grid.appendChild(card);
  });
}

function renderTroopers() {
  const grid=document.getElementById('trooperGrid'); grid.innerHTML='';
  state.troopers.forEach((t,index)=>{
    const card=document.createElement('div'); card.className='trooper-card'; card.dataset.status=t.status;
    const canTrack=t.status==='detached'||t.status==='downed';
    card.innerHTML=`
      <div class="trooper-id"><strong>Trooper ${index+1}</strong><i class="hair-swatch" style="background:${hairColours[index]}"></i></div>
      <label>Name<input value="${escapeHtml(t.name)}" data-field="name"></label>
      <label>Hair / marker<input value="${escapeHtml(t.hair)}" data-field="hair"></label>
      <label>Status<select data-field="status"><option value="formed">Formed</option><option value="detached">Detached</option><option value="downed">Downed</option><option value="missing">Missing</option></select></label>
      <div class="trooper-hp"><label>HP<input type="number" min="0" value="${t.currentHP}" data-field="currentHP" ${canTrack?'':'disabled'}></label><span>/</span><label>Max<input type="number" min="1" value="${t.maxHP}" data-field="maxHP"></label></div>
      <label>AC<input type="number" min="1" value="${t.ac}" data-field="ac"></label>
      <label>Recognised leader<input value="${escapeHtml(t.leader)}" data-field="leader"></label>
      <label>Current order<input value="${escapeHtml(t.order)}" data-field="order"></label>
      <p class="small-note">${t.status==='formed'?'Uses Formation HP and occupies the cohort space.':t.status==='detached'?'Acts after its temporary leader and may Slash, Help, Guard or Return.':t.status==='downed'?'Incapacitated until recovered or restored.':'Seeking shelter or the Brass’s last known position.'}</p>
      <div class="trooper-actions"><button type="button" data-act="slash">Slash</button><button type="button" data-act="damage">Damage</button><button type="button" data-act="heal">Heal</button><button type="button" data-act="return">Return</button></div>`;
    card.querySelector('[data-field="status"]').value=t.status;
    card.querySelectorAll('[data-field]').forEach(input=>input.addEventListener('change',e=>{
      const field=e.target.dataset.field; let value=e.target.type==='number'?Number(e.target.value):e.target.value;
      if (field==='status' && value==='detached') {
        const other=state.troopers.find(x=>x.id!==t.id&&x.status==='detached');
        if (other) { e.target.value=t.status; return showToast(`${other.name} is already detached.`); }
      }
      t[field]=value;
      if (field==='status'&&value==='formed') {t.leader='The Brass';t.order='Form up';}
      renderAll(); scheduleSave();
    }));
    card.querySelector('[data-act="slash"]').addEventListener('click',()=>{
      if (t.status!=='detached') return showToast('Only a detached trooper makes an individual Slash.');
      rollAndDisplay(`1d20${fmt(mod(state.character.abilities.str)+prof())}`,`${t.name} Slash attack`);
    });
    card.querySelector('[data-act="damage"]').addEventListener('click',()=>adjustTrooperHP(t,-1));
    card.querySelector('[data-act="heal"]').addEventListener('click',()=>adjustTrooperHP(t,1));
    card.querySelector('[data-act="return"]').addEventListener('click',()=>{t.status='formed';t.leader='The Brass';t.order='Form up';renderAll();scheduleSave();showToast(`${t.name} returned to formation.`);});
    grid.appendChild(card);
  });
}

function adjustTrooperHP(t,delta) {
  if (t.status!=='detached'&&t.status!=='downed') return showToast('Personal HP is only tracked while detached or downed.');
  const amount=Math.max(1,Number(prompt(delta<0?'Damage amount':'Healing amount','1')||0));
  if (!amount) return;
  if (delta<0) {
    t.currentHP=Math.max(0,t.currentHP-amount);
    if (state.formation.linkDetachedDamage) applyFormationDamage(amount);
    if (t.currentHP===0) t.status='downed';
  } else {
    const actual=Math.min(amount,t.maxHP-t.currentHP); t.currentHP+=actual;
    if (state.formation.linkDetachedDamage) state.character.currentHP=Math.min(state.character.maxHP,state.character.currentHP+actual);
    if (t.currentHP>0&&t.status==='downed') t.status='detached';
  }
  renderAll();scheduleSave();
}

function renderActions() {
  const str=mod(state.character.abilities.str), p=prof(), attack=str+p;
  const formed=formedCount(); const stance=state.formation.stance;
  const actions=[
    {name:"Brass's Spear",tag:'Melee weapon',text:'The Brass attacks personally with its short spear.',attack:`1d20${fmt(attack)}`,damage:`1d6${fmt(str)}`},
    {name:'Coordinated Slash',tag:'Formation attack',text:`A commanded sequence of sword strikes. Requires at least 3 formed troopers. ${formed<3?'Currently unavailable.':''}`,attack:`1d20${fmt(attack)}`,damage:`1d8${fmt(str)}+1d4`,disabled:formed<3},
    {name:'Spearhead Charge',tag:'Spearhead stance',text:'After moving at least 15 feet toward the target, drive the formation through it and attempt to push.',attack:`1d20${fmt(attack)}`,damage:`1d8${fmt(str)}+1d6`,disabled:stance!=='spearhead'||formed<3},
    {name:'Shield Rush',tag:'Shield Wall',text:'The front rank shoves as one. Roll Athletics against the target; on success it is pushed or knocked prone.',attack:`1d20${fmt(mod(state.character.abilities.str)+p)}`,label:'Athletics',disabled:stance!=='shield'||formed<2},
    {name:'Lock Shields',tag:'Reaction',text:'Reduce damage to the cohort or an adjacent ally as the troopers snap their shields into place.',damage:`1d10${fmt(p)}`,label:'Reduce',disabled:stance!=='shield'},
    {name:'Detached Trooper Slash',tag:'Companion',text:'A detached trooper makes one basic sword attack after receiving an order.',attack:`1d20${fmt(attack)}`,damage:`1d6${fmt(p)}`,disabled:!state.troopers.some(t=>t.status==='detached')}
  ];
  const grid=document.getElementById('actionGrid');grid.innerHTML='';
  actions.forEach(a=>{
    const card=document.createElement('div');card.className='action-card';
    card.innerHTML=`<div class="action-top"><h3>${a.name}</h3><span class="action-tag">${a.tag}</span></div><p>${a.text}</p><div class="action-buttons"></div>`;
    const buttons=card.querySelector('.action-buttons');
    if (a.attack) buttons.appendChild(actionButton(a.label||'Attack',a.attack,a.name,a.disabled));
    if (a.damage) buttons.appendChild(actionButton(a.label||'Damage',a.damage,`${a.name} damage`,a.disabled));
    if (a.disabled) card.style.opacity='.52';
    grid.appendChild(card);
  });
  document.getElementById('attackSummary').textContent=`Attack ${fmt(attack)} · ${formed} formed`;
}
function actionButton(label,formula,desc,disabled) {
  const btn=document.createElement('button');btn.type='button';btn.textContent=`${label}: ${formula}`;btn.disabled=disabled;
  btn.addEventListener('click',()=>rollAndDisplay(formula,desc));return btn;
}

function renderDynamic() {
  const stance=currentStance(); const p=prof();
  const ac=Number(state.character.baseAC)+stance.ac; const speed=Math.max(0,Number(state.character.baseSpeed)+stance.speed);
  const initiative=mod(state.character.abilities.dex)+Number(state.character.initiativeBonus||0);
  const perceptionRank=Number(state.character.skills.Perception||0); const passive=10+mod(state.character.abilities.wis)+p*perceptionRank;
  document.getElementById('displayAC').textContent=ac;
  document.getElementById('acBreakdown').textContent=`Base ${state.character.baseAC}${stance.ac?` · ${stance.name} ${fmt(stance.ac)}`:''}`;
  document.getElementById('displaySpeed').textContent=speed;
  document.getElementById('displayInitiative').textContent=fmt(initiative);
  document.getElementById('displayProf').textContent=fmt(p);
  document.getElementById('passivePerception').textContent=passive;
  document.getElementById('displayStance').textContent=stance.name;
  document.getElementById('currentHPDisplay').textContent=state.character.currentHP;
  document.getElementById('maxHPDisplay').textContent=state.character.maxHP;
  const hpPercent=Math.max(0,Math.min(1,state.character.currentHP/Math.max(1,state.character.maxHP)));
  document.getElementById('hpRing').style.setProperty('--hp-angle',`${hpPercent*360}deg`);
  const fState=formationState(); const badge=document.getElementById('formationStateBadge'); badge.textContent=fState; badge.style.color=fState==='Complete'?'var(--gold-bright)':fState==='Reduced'?'var(--blue)':'var(--red-bright)';
  document.getElementById('activeStanceBadge').textContent=`${stance.name} active`;
  renderActions();
}

function renderAll() { renderAbilities(); renderChecks(); renderStances(); renderTroopers(); renderDynamic(); syncBoundInputs(); renderRollHistory(); }
function syncBoundInputs() {
  document.querySelectorAll('.data-input[data-path]').forEach(input=>{
    if (document.activeElement===input) return;
    const value=getPath(state,input.dataset.path); if(input.type==='checkbox') input.checked=Boolean(value); else input.value=value ?? '';
  });
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function applyFormationDamage(amount) {
  amount=Math.max(0,Number(amount));
  const absorbed=Math.min(state.character.tempHP,amount); state.character.tempHP-=absorbed; amount-=absorbed;
  state.character.currentHP=Math.max(0,state.character.currentHP-amount);
}
function healFormation(amount) { state.character.currentHP=Math.min(state.character.maxHP,state.character.currentHP+Math.max(0,Number(amount))); }

function parseAndRoll(formula) {
  const cleaned=String(formula).replace(/\s+/g,'').toLowerCase();
  if (!cleaned) throw new Error('Enter a dice formula.');
  const tokens=cleaned.match(/[+-]?[^+-]+/g); if (!tokens) throw new Error('Invalid formula.');
  let total=0; const parts=[];
  for (let token of tokens) {
    let sign=1; if(token[0]==='+') token=token.slice(1); else if(token[0]==='-'){sign=-1;token=token.slice(1);}
    const dice=token.match(/^(\d*)d(\d+)$/);
    if (dice) {
      const count=Math.min(100,Number(dice[1]||1)), sides=Math.min(10000,Number(dice[2])); if(!count||!sides) throw new Error('Invalid dice.');
      const rolls=Array.from({length:count},()=>Math.floor(Math.random()*sides)+1); const subtotal=rolls.reduce((a,b)=>a+b,0)*sign; total+=subtotal;
      parts.push(`${sign<0?'- ':''}${count}d${sides} [${rolls.join(', ')}]`);
    } else if (/^\d+$/.test(token)) { total+=Number(token)*sign; parts.push(`${sign<0?'- ':'+ '}${token}`); }
    else throw new Error(`Could not read “${token}”.`);
  }
  return {total,detail:parts.join(' ')};
}
function rollAndDisplay(formula,label='Roll') {
  try {
    const result=parseAndRoll(formula); const resultEl=document.getElementById('rollResult');
    resultEl.innerHTML=`<strong>${result.total}</strong><span>${escapeHtml(label)} · ${escapeHtml(formula)} · ${escapeHtml(result.detail)}</span>`;
    state.rollHistory.unshift({label,formula,total:result.total,detail:result.detail,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});
    state.rollHistory=state.rollHistory.slice(0,20); renderRollHistory(); scheduleSave();
  } catch(err) { showToast(err.message); }
}
function renderRollHistory() {
  const list=document.getElementById('rollHistory'); if(!list)return; list.innerHTML='';
  state.rollHistory.forEach(r=>{const li=document.createElement('li');li.textContent=`${r.time} · ${r.label}: ${r.total} (${r.formula})`;list.appendChild(li);});
}

function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>activateTab(tab.dataset.tab)));
  document.querySelectorAll('[data-goto]').forEach(btn=>btn.addEventListener('click',()=>activateTab(btn.dataset.goto)));
}
function activateTab(id) {
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===id));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active',p.id===`tab-${id}`));
  window.scrollTo({top:document.querySelector('.tabbar').offsetTop-78,behavior:'smooth'});
}
function setupDice() {
  const quick=document.getElementById('quickDice'); [4,6,8,10,12,20,100].forEach(s=>{
    const btn=document.createElement('button');btn.type='button';btn.textContent=`d${s}`;btn.addEventListener('click',()=>rollAndDisplay(`1d${s}`,`d${s}`));quick.appendChild(btn);
  });
  const btn=document.createElement('button');btn.type='button';btn.textContent='Adv';btn.addEventListener('click',()=>{
    const a=parseAndRoll('1d20'), b=parseAndRoll('1d20'), total=Math.max(a.total,b.total);
    const label='Advantage'; const detail=`kept ${total} from ${a.total} / ${b.total}`;
    document.getElementById('rollResult').innerHTML=`<strong>${total}</strong><span>${label} · 2d20 keep highest · ${detail}</span>`;
    state.rollHistory.unshift({label,formula:'2d20kh1',total,detail,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});
    state.rollHistory=state.rollHistory.slice(0,20);renderRollHistory();scheduleSave();
  });quick.appendChild(btn);
  document.getElementById('customRollBtn').addEventListener('click',()=>rollAndDisplay(document.getElementById('customRoll').value,'Custom roll'));
  document.getElementById('customRoll').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('customRollBtn').click();});
  document.querySelector('[data-roll="initiative"]').addEventListener('click',()=>rollAndDisplay(`1d20${fmt(mod(state.character.abilities.dex)+Number(state.character.initiativeBonus||0))}`,'Initiative'));
}
function setupControls() {
  document.getElementById('damageBtn').addEventListener('click',()=>{applyFormationDamage(document.getElementById('hpAmount').value);renderAll();scheduleSave();});
  document.getElementById('healBtn').addEventListener('click',()=>{healFormation(document.getElementById('hpAmount').value);renderAll();scheduleSave();});
  document.getElementById('shortRestBtn').addEventListener('click',()=>{
    if(state.character.hitDiceRemaining<=0)return showToast('No Hit Dice remaining.');
    const die=prompt('Spend how many Hit Dice?','1'); const count=Math.max(0,Math.min(state.character.hitDiceRemaining,Number(die||0))); if(!count)return;
    const formula=`${count}d10${fmt(mod(state.character.abilities.con)*count)}`; const result=parseAndRoll(formula); healFormation(result.total); state.character.hitDiceRemaining-=count;
    state.rollHistory.unshift({label:'Short-rest healing',formula,total:result.total,detail:result.detail,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}); renderAll();scheduleSave();showToast(`Recovered ${result.total} HP.`);
  });
  document.getElementById('longRestBtn').addEventListener('click',()=>{
    state.character.currentHP=state.character.maxHP;state.character.tempHP=0;state.character.hitDiceRemaining=Math.min(state.character.hitDiceMax,state.character.hitDiceRemaining+Math.max(1,Math.floor(state.character.hitDiceMax/2)));
    state.troopers.forEach(t=>{t.currentHP=t.maxHP;if(t.status==='downed')t.status='formed';});renderAll();scheduleSave();showToast('Long rest completed.');
  });
  document.getElementById('printBtn').addEventListener('click',()=>window.print());
  document.getElementById('exportBtn').addEventListener('click',exportState);
  document.getElementById('importFile').addEventListener('change',importState);
  document.getElementById('resetBtn').addEventListener('click',()=>{if(confirm('Reset the entire sheet to its default character?')){state=defaultState();localStorage.removeItem(STORAGE_KEY);renderAll();scheduleSave();showToast('Sheet reset.');}});
}
function exportState() {
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download=`${(state.character.name||'rankling-cohort').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.json`;a.click();URL.revokeObjectURL(url);showToast('Character exported.');
}
function importState(event) {
  const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{state=mergeDeep(defaultState(),JSON.parse(reader.result));renderAll();scheduleSave();showToast('Character imported.');}catch{showToast('That file is not valid character JSON.');}event.target.value='';};reader.readAsText(file);
}

function init() {
  bindInputs(); setupTabs(); setupDice(); setupControls(); renderAll();
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
}
document.addEventListener('DOMContentLoaded',init);
