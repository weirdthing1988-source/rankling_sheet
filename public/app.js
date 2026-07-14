'use strict';

const STORAGE_KEY = 'rankling-cohort-sheet-v1';
const CURRENT_VERSION = 9;
const abilities = ['str','dex','con','int','wis','cha'];
const abilityNames = {str:'Strength',dex:'Dexterity',con:'Constitution',int:'Intelligence',wis:'Wisdom',cha:'Charisma'};
const skills = [
  ['Acrobatics','dex'],['Animal Handling','wis'],['Arcana','int'],['Athletics','str'],['Deception','cha'],['History','int'],
  ['Insight','wis'],['Intimidation','cha'],['Investigation','int'],['Medicine','wis'],['Nature','int'],['Perception','wis'],
  ['Performance','cha'],['Persuasion','cha'],['Religion','int'],['Sleight of Hand','dex'],['Stealth','dex'],['Survival','wis']
];
const hairColours = ['#9a6d3e','#6f452c','#a74272','#e3cf9f','#8b7767'];
const trooperWeapons = {
  'Trooper sword':'slashing',
  'Dagger':'piercing',
  'Handaxe':'slashing',
  'Light hammer':'bludgeoning',
  'Club':'bludgeoning',
  'Small spear':'piercing',
  'Sickle':'slashing'
};
const basicOrders = ['Follow','Slash','Help','Guard','Hold Position','Return'];
const delegatedOrders = ['Dash','Disengage','Interpose'];

const asiLevels = [4,6,8,12,14,16,19];
const supportedFeats = {
  'Tough':{description:'Maximum HP increases by twice your character level.'},
  'Alert':{description:'Add your Proficiency Bonus to Initiative.'},
  'Mobile':{description:'Walking speed increases by 10 feet.'},
  'Resilient':{description:'Increase one chosen ability by 1 and gain proficiency in that saving throw.',abilityChoice:'any'},
  'Athlete':{description:'Increase Strength or Dexterity by 1. Standing and climbing benefits are listed for reference.',abilityChoice:'strDex'},
  'Heavy Armor Master':{description:'Increase Strength by 1 and reduce nonmagical physical damage by your Proficiency Bonus.'},
  'Shield Master':{description:'Adds a shield shove action and defensive reaction reminders.'},
  'Inspiring Leader':{description:'Once per Short or Long Rest, grant temporary HP equal to level + Charisma modifier.'},
  'Lucky':{description:'Gain a number of Luck Points equal to your Proficiency Bonus each Long Rest.'},
  'Skill Expert':{description:'Increase one ability by 1 and gain expertise in one chosen proficient skill.',abilityChoice:'any',skillChoice:true},
  'Custom / Manual':{description:'Track a custom feat in Additional Features. No automatic numeric changes are applied.'}
};
const superiorTechniqueManeuvers = ['Precision Attack','Trip Attack','Pushing Attack','Rally'];
function defaultLevelChoices(){
  return Object.fromEntries(asiLevels.map(lvl=>[String(lvl),{type:'none',ability1:'str',ability2:'str',feat:'Tough',featAbility:'str',featSkill:'Athletics'}]));
}

const stanceArtworkSets = {
  female:{
    march:{src:'assets/art-march.png',alt:'The female Brass leader and five fae troopers marching in formation.'},
    shield:{src:'assets/art-shield-wall.png',alt:'The female Rankling cohort in a tight shield wall.'},
    spearhead:{src:'assets/art-spearhead.png',alt:'The female Rankling cohort driving forward in a spearhead charge.'},
    assault:{src:'assets/art-assault-rank.png',alt:'The female Rankling cohort charging aggressively in assault formation.'},
    escort:{src:'assets/art-escort-formation.png',alt:'The female Rankling cohort protecting a taller ward in escort formation.'}
  },
  male:{
    march:{src:'assets/art-march-male.png',alt:'The male Brass leader and five fae troopers marching in formation.'},
    shield:{src:'assets/art-shield-wall-male.png',alt:'The male Rankling cohort in a tight shield wall.'},
    spearhead:{src:'assets/art-spearhead-male.png',alt:'The male Rankling cohort driving forward in a spearhead charge.'},
    assault:{src:'assets/art-assault-rank-male.png',alt:'The male Rankling cohort charging aggressively in assault formation.'},
    escort:{src:'assets/art-escort-formation-male.png',alt:'The male Rankling cohort protecting a taller ward in escort formation.'}
  }
};

const megaArtworkSets = {
  female:{src:'assets/art-mega-unison-female.png',alt:'The female Rankling Brass in the fused Mega Unison war-form.'},
  male:{src:'assets/art-mega-unison-male.png',alt:'The male Rankling Brass in the fused Mega Unison war-form.'}
};

const speciesFeatures = [
  {name:'Fey Cohort',text:'You are a Fey cohort made of one Brass and five bonded Troopers. The assembled cohort is Medium; an individual Brass or detached Trooper is Small. Your walking speed is 25 feet, and you know Common and Sylvan.'},
  {name:'Six as One',text:'The Brass and formed Troopers use one turn, one action economy, one concentration state, one pool of conditions and one Formation HP total. Formed Troopers are not separate combatants or separately targetable creatures under ordinary circumstances.'},
  {name:'Cohort Vitality',text:'Maximum Formation HP is displayed as six proportional chunks: one Brass reserve and one chunk for each Trooper. Formed chunks are a visual breakdown of one shared pool, not separate targets.'},
  {name:'Dependent Troopers',text:'Troopers have memories, emotions, speech and basic self-care, but cannot establish complex combat goals. They act through drilled commands from the Brass or a recognised Temporary Leader.'},
  {name:'Assign Temporary Leader',text:'One Trooper at a time may detach and follow a willing creature appointed by the Brass. It acts immediately after that leader, uses its personal AC and HP, and follows simple orders.'},
  {name:'Fixed Trooper Armament',text:'Every Trooper carries one short, simple one-handed weapon and one shield. Equipment names and damage type may change, but the detached attack remains a fixed Trooper Strike and receives no magic-item, mastery, feat or Fighting Style benefits.'},
  {name:'Return Instinct',text:'Without an order, a Trooper follows its recognised leader. If leaderless, it returns to the visible Brass, searches the Brass’s last known location, then shelters and waits for authority.'},
  {name:'Downed, Not Dead',text:'A detached Trooper at 0 personal HP becomes Prone and Incapacitated instead of making death saves. It may be carried and restored by healing. Permanent loss should be a significant narrative event.'}
];

const fighterProgression = [
  {level:1,kind:'Fighter',name:'Fighting Style',text:'Choose a martial specialty. The selected style is shown in the character header; Interception or Protection suits the cohort especially well.'},
  {level:1,kind:'Fighter',name:'Second Wind',text:'Recover 1d10 + Fighter level HP as a Bonus Action, subject to the table’s normal Fighter rules.'},
  {level:2,kind:'Fighter',name:'Action Surge',text:'Take one additional action on your turn once per Short or Long Rest.'},
  {level:3,kind:'Cohort Commander',name:'Form Up',text:'Unlock Shield Wall, Spearhead, Assault Rank and Escort Formation. Changing primary stance requires a Bonus Action.'},
  {level:3,kind:'Cohort Commander',name:'Command Dice',text:'Gain four d6 Command Dice, restored on a Short or Long Rest. Formation manoeuvres spend these dice.'},
  {level:4,kind:'Fighter',name:'Ability Score Improvement',text:'Choose an Ability Score Improvement or supported feat in the Level Choices panel; its effects are applied automatically.'},
  {level:5,kind:'Fighter',name:'Extra Attack',text:'Attack twice whenever you take the Attack action.'},
  {level:6,kind:'Fighter',name:'Ability Score Improvement',text:'Choose an Ability Score Improvement or supported feat in the Level Choices panel.'},
  {level:7,kind:'Cohort Commander',name:'Delegated Command',text:'Command Dice increase to five. A Temporary Leader may issue one simple order each round without spending a Bonus Action. Unlock Dash, Disengage and Interpose orders.'},
  {level:8,kind:'Fighter',name:'Ability Score Improvement',text:'Choose an Ability Score Improvement or supported feat in the Level Choices panel.'},
  {level:9,kind:'Fighter',name:'Indomitable',text:'Reroll one failed saving throw per Long Rest.'},
  {level:10,kind:'Cohort Commander',name:'Drilled Formations',text:'Command Dice become d8s. Shield Wall loses its speed penalty; Spearhead pushes 10 feet; Assault bonus damage doubles; Escort grants its ward +1 AC.'},
  {level:11,kind:'Fighter',name:'Extra Attack (2)',text:'Attack three times whenever you take the Attack action.'},
  {level:12,kind:'Fighter',name:'Ability Score Improvement',text:'Choose an Ability Score Improvement or supported feat in the Level Choices panel.'},
  {level:13,kind:'Fighter',name:'Indomitable (2 uses)',text:'Use Indomitable twice between Long Rests.'},
  {level:14,kind:'Fighter',name:'Ability Score Improvement',text:'Choose an Ability Score Improvement or supported feat in the Level Choices panel.'},
  {level:15,kind:'Cohort Commander',name:'Instant Reformation',text:'Command Dice increase to six. Choose a stance when Initiative is rolled, change stance once per turn without a Bonus Action, and recall a detached Trooper as an emergency reaction.'},
  {level:15,kind:'Cohort Commander',name:'Mega Unison',text:'Spend Heroic Inspiration to fuse the Brass and all five formed Troopers for a number of rounds equal to your Proficiency Bonus. The fused form gains flight, enhanced offence and Aegis of the Five, but cannot use formation stances or detached Troopers.'},
  {level:16,kind:'Fighter',name:'Ability Score Improvement',text:'Choose an Ability Score Improvement or supported feat in the Level Choices panel.'},
  {level:17,kind:'Fighter',name:'Action Surge (2 uses)',text:'Use Action Surge twice between rests, but only once on a turn.'},
  {level:17,kind:'Fighter',name:'Indomitable (3 uses)',text:'Use Indomitable three times between Long Rests.'},
  {level:18,kind:'Cohort Commander',name:'Perfect Formation',text:'Command Dice become d10s. Maintain one primary stance and one secondary lesser benefit. Regain one Command Die on Initiative if empty. Once per Long Rest, a formed Trooper may become Downed to leave the cohort at 1 HP instead of 0.'},
  {level:19,kind:'Fighter',name:'Ability Score Improvement',text:'Choose an Ability Score Improvement or supported feat in the Level Choices panel.'},
  {level:20,kind:'Fighter',name:'Extra Attack (3)',text:'Attack four times whenever you take the Attack action.'}
];

function defaultTrooper(id,name,hair) {
  return {id,name,hair,status:'formed',currentHP:6,maxHP:6,ac:14,leader:'The Brass',order:'Form up',weapon:'Trooper sword',shield:'Round shield'};
}
function defaultState() {
  return {
    version: CURRENT_VERSION,
    character: {
      name:'The Copper Rank',player:'',species:'Rankling',className:'Fighter',subclass:'Cohort Commander',fightingStyle:'Interception',superiorTechniqueManeuver:'Precision Attack',background:'Soldier',artGender:'female',level:3,
      baseAC:16,baseSpeed:25,currentHP:28,maxHP:28,bonusHP:0,tempHP:0,hitDiceRemaining:3,hitDiceMax:3,
      autoLevelStats:true,heroicInspiration:true,initiativeBonus:0,abilities:{str:16,dex:12,con:14,int:14,wis:10,cha:8},
      saves:{str:true,dex:false,con:true,int:false,wis:false,cha:false},
      skills:{'Athletics':1,'History':1,'Investigation':1,'Perception':1},
      equipment:"Leader's short spear and red-ring command shield\nFive short simple weapons and five round shields\nMatching bronze helmets and light formation armour\nBanner ribbons, field rations and repair kit",
      notes:'The Brass is the only fully self-directing member of the cohort. Each Trooper has a distinct personality but depends on recognised leadership for purposeful action.',
      customFeatures:'',sessionLog:'',levelChoices:defaultLevelChoices(),
      artwork:{dataUrl:'',fit:'cover',zoom:100,x:50,y:50}
    },
    formation:{stance:'',secondaryStance:'',ward:'',linkDetachedDamage:true},
    resources:{commandDiceCurrent:4,commandDiceMax:4,commandDie:6,lastStandAvailable:true,megaUsedThisLongRest:false,superiorTechniqueCurrent:1,luckyCurrent:0,inspiringLeaderAvailable:true},
    mega:{active:false,roundsRemaining:0,previousStance:'',breakthroughAvailable:true,aegisActive:false},
    troopers:[
      defaultTrooper(1,'Pip','Chestnut'),defaultTrooper(2,'Tansy','Cocoa'),defaultTrooper(3,'Nell','Rose'),
      defaultTrooper(4,'Button','Pale blond'),defaultTrooper(5,'Scruff','Ash brown')
    ],
    rollHistory:[]
  };
}

let state = loadState();
let saveTimer;

function loadState() {
  try {
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    return normaliseState(mergeDeep(defaultState(),JSON.parse(raw)));
  } catch(err) {
    console.warn('Could not load saved sheet',err);
    return defaultState();
  }
}
function mergeDeep(target,source) {
  if(!source||typeof source!=='object') return target;
  for(const key of Object.keys(source)) {
    if(Array.isArray(source[key])) target[key]=source[key];
    else if(source[key]&&typeof source[key]==='object') target[key]=mergeDeep(target[key]||{},source[key]);
    else target[key]=source[key];
  }
  return target;
}
function normaliseState(candidate) {
  const defaults=defaultState();
  const previousVersion=Number(candidate.version||1);
  candidate.version=CURRENT_VERSION;
  candidate.character=candidate.character||defaults.character;
  candidate.formation=candidate.formation||defaults.formation;
  candidate.resources=candidate.resources||defaults.resources;
  candidate.mega={...defaults.mega,...(candidate.mega||{})};
  candidate.character.heroicInspiration=Boolean(candidate.character.heroicInspiration);
  candidate.resources.megaUsedThisLongRest=Boolean(candidate.resources.megaUsedThisLongRest);
  candidate.mega.active=Boolean(candidate.mega.active);
  candidate.mega.roundsRemaining=Math.max(0,Math.trunc(Number(candidate.mega.roundsRemaining)||0));
  candidate.mega.previousStance=typeof candidate.mega.previousStance==='string'?candidate.mega.previousStance:'';
  candidate.mega.breakthroughAvailable=candidate.mega.breakthroughAvailable!==false;
  candidate.mega.aegisActive=Boolean(candidate.mega.aegisActive);
  candidate.rollHistory=Array.isArray(candidate.rollHistory)?candidate.rollHistory:[];
  if(previousVersion<CURRENT_VERSION&&candidate.character.subclass==='Battle Master') candidate.character.subclass='Cohort Commander';
  if(!candidate.character.fightingStyle) candidate.character.fightingStyle='Interception';
  if(!superiorTechniqueManeuvers.includes(candidate.character.superiorTechniqueManeuver)) candidate.character.superiorTechniqueManeuver='Precision Attack';
  candidate.character.levelChoices={...defaultLevelChoices(),...(candidate.character.levelChoices||{})};
  for(const lvl of asiLevels){
    const key=String(lvl),base=defaultLevelChoices()[key],choice={...base,...(candidate.character.levelChoices[key]||{})};
    if(!['none','asi','feat'].includes(choice.type))choice.type='none';
    if(!abilities.includes(choice.ability1))choice.ability1='str';
    if(!abilities.includes(choice.ability2))choice.ability2='str';
    if(!supportedFeats[choice.feat])choice.feat='Tough';
    if(!abilities.includes(choice.featAbility))choice.featAbility='str';
    if(!skills.some(([name])=>name===choice.featSkill))choice.featSkill='Athletics';
    candidate.character.levelChoices[key]=choice;
  }
  candidate.resources.superiorTechniqueCurrent=clamp(candidate.resources.superiorTechniqueCurrent??1,0,1);
  candidate.resources.luckyCurrent=Math.max(0,Math.trunc(Number(candidate.resources.luckyCurrent)||0));
  candidate.resources.inspiringLeaderAvailable=candidate.resources.inspiringLeaderAvailable!==false;
  if(!['female','male'].includes(candidate.character.artGender)) candidate.character.artGender='female';
  candidate.character.artwork={...defaults.character.artwork,...(candidate.character.artwork||{})};
  candidate.character.artwork.fit=['cover','contain'].includes(candidate.character.artwork.fit)?candidate.character.artwork.fit:'cover';
  candidate.character.artwork.zoom=clamp(candidate.character.artwork.zoom??100,50,200);
  candidate.character.artwork.x=clamp(candidate.character.artwork.x??50,0,100);
  candidate.character.artwork.y=clamp(candidate.character.artwork.y??50,0,100);
  if(typeof candidate.character.artwork.dataUrl!=='string') candidate.character.artwork.dataUrl='';
  if(candidate.formation.secondaryStance===undefined) candidate.formation.secondaryStance='';
  if(candidate.formation.ward===undefined) candidate.formation.ward='';
  const oldTroopers=Array.isArray(candidate.troopers)?candidate.troopers:[];
  candidate.troopers=defaults.troopers.map((base,index)=>({...base,...(oldTroopers[index]||{}),id:index+1}));
  candidate.troopers.forEach(t=>{
    if(!trooperWeapons[t.weapon]) t.weapon='Trooper sword';
    if(!t.shield) t.shield='Round shield';
    if(!t.order) t.order=t.status==='formed'?'Form up':'Follow';
  });
  return candidate;
}
function getPath(obj,path){return path.split('.').reduce((acc,key)=>acc?.[key],obj);}
function setPath(obj,path,value){const keys=path.split('.');const last=keys.pop();const root=keys.reduce((acc,key)=>acc[key]??={},obj);root[last]=value;}
function clamp(value,min,max){return Math.min(max,Math.max(min,Number(value)));}
function mod(score){return Math.floor((Number(score)-10)/2);}
function level(){return clamp(Math.trunc(state.character.level||1),1,20);}
function prof(){return 2+Math.floor((level()-1)/4);}
function fmt(n){return Number(n)>=0?`+${Number(n)}`:String(Number(n));}
function unlockedLevelChoices(){
  return asiLevels.filter(lvl=>level()>=lvl).map(lvl=>({level:lvl,...state.character.levelChoices[String(lvl)]}));
}
function hasFeat(name){return unlockedLevelChoices().some(choice=>choice.type==='feat'&&choice.feat===name);}
function abilityChoiceBonuses(){
  const totals=Object.fromEntries(abilities.map(key=>[key,0]));
  unlockedLevelChoices().forEach(choice=>{
    if(choice.type==='asi'){
      totals[choice.ability1]=(totals[choice.ability1]||0)+1;
      totals[choice.ability2]=(totals[choice.ability2]||0)+1;
    }else if(choice.type==='feat'){
      if(choice.feat==='Resilient'||choice.feat==='Skill Expert')totals[choice.featAbility]=(totals[choice.featAbility]||0)+1;
      if(choice.feat==='Athlete'){
        const key=['str','dex'].includes(choice.featAbility)?choice.featAbility:'str';totals[key]=(totals[key]||0)+1;
      }
      if(choice.feat==='Heavy Armor Master')totals.str+=1;
    }
  });
  return totals;
}
function effectiveAbility(key){return clamp(Number(state.character.abilities[key]||10)+(abilityChoiceBonuses()[key]||0),1,30);}
function effectiveMod(key){return mod(effectiveAbility(key));}
function effectiveSaveProficient(key){return Boolean(state.character.saves[key]||unlockedLevelChoices().some(c=>c.type==='feat'&&c.feat==='Resilient'&&c.featAbility===key));}
function effectiveSkillRank(name){
  let rank=Number(state.character.skills[name]||0);
  if(unlockedLevelChoices().some(c=>c.type==='feat'&&c.feat==='Skill Expert'&&c.featSkill===name))rank=Math.max(rank,2);
  return rank;
}
function fightingStyleACBonus(){return state.character.fightingStyle==='Defense'?1:0;}
function duelingDamageBonus(){return state.character.fightingStyle==='Dueling'?2:0;}
function featSpeedBonus(){return hasFeat('Mobile')?10:0;}
function featInitiativeBonus(){return hasFeat('Alert')?prof():0;}
function toughHPBonus(){return hasFeat('Tough')?2*level():0;}
function inspiringLeaderTempHP(){return Math.max(1,level()+Math.max(0,effectiveMod('cha')));}
function luckyMax(){return hasFeat('Lucky')?prof():0;}
function formedCount(){return state.troopers.filter(t=>t.status==='formed').length;}
function fighterAttacks(){return level()>=20?4:level()>=11?3:level()>=5?2:1;}
function formationSaveDC(){return 8+prof()+effectiveMod('str');}
function detachedTrooperMaxHP(){return 3+level();}
function detachedTrooperAC(){return 12+prof();}
function calculatedMaxHP(){const con=effectiveMod('con');return Math.max(1,10+con+Math.max(0,level()-1)*Math.max(1,6+con)+Number(state.character.bonusHP||0)+toughHPBonus());}
function commandDiceProfile(lvl=level()) {
  if(lvl<3) return {max:0,die:0,label:'Locked'};
  const max=lvl>=15?6:lvl>=7?5:4;
  const die=lvl>=18?10:lvl>=10?8:6;
  return {max,die,label:`${max}d${die}`};
}
function orderCostText(){return level()>=7?'One simple order each round without a Bonus Action':'A Temporary Leader uses a Bonus Action to issue an order';}
function stanceSwitchText(){return level()>=15?'Once per turn without a Bonus Action':'Bonus Action';}
function weaponDamageType(t){return trooperWeapons[t.weapon]||'slashing';}
function availableOrders(){return level()>=7?[...basicOrders,...delegatedOrders]:basicOrders;}
function megaUnlocked(){return level()>=15;}
function megaActive(){return Boolean(state.mega?.active);}
function megaDuration(){return prof();}
function allTroopersFormed(){return state.troopers.every(t=>t.status==='formed');}
function megaRequirements(){
  const reasons=[];
  if(!megaUnlocked()) reasons.push('Unlocks at level 15');
  if(!state.character.heroicInspiration) reasons.push('Heroic Inspiration is required');
  if(state.resources.megaUsedThisLongRest) reasons.push('Already used this Long Rest');
  if(!allTroopersFormed()) reasons.push('All five Troopers must be formed');
  return reasons;
}
function canActivateMega(){return !megaActive()&&megaRequirements().length===0;}
function activateMega(){
  const reasons=megaRequirements();
  if(reasons.length)return showToast(reasons[0]);
  state.mega.active=true;
  state.mega.roundsRemaining=megaDuration();
  state.mega.previousStance=state.formation.stance||'';
  state.mega.breakthroughAvailable=true;
  state.mega.aegisActive=false;
  state.character.heroicInspiration=false;
  state.resources.megaUsedThisLongRest=true;
  renderAll();scheduleSave();showToast(`Mega Unison activated for ${megaDuration()} rounds.`);
}
function endMega(reason='Mega Unison ended.'){
  if(!megaActive())return;
  const previous=state.mega.previousStance;
  state.mega.active=false;
  state.mega.roundsRemaining=0;
  state.mega.aegisActive=false;
  state.mega.previousStance='';
  if(previous&&stanceAvailable(previous))state.formation.stance=previous;
  renderAll();scheduleSave();showToast(reason);
}
function advanceMegaRound(){
  if(!megaActive())return;
  state.mega.aegisActive=false;
  state.mega.roundsRemaining=Math.max(0,state.mega.roundsRemaining-1);
  if(state.mega.roundsRemaining===0)return endMega('Mega Unison duration expired.');
  renderAll();scheduleSave();showToast(`${state.mega.roundsRemaining} Mega Unison round${state.mega.roundsRemaining===1?'':'s'} remain.`);
}
function toggleAegis(){
  if(!megaActive())return showToast('Mega Unison is not active.');
  state.mega.aegisActive=!state.mega.aegisActive;
  renderAll();scheduleSave();showToast(state.mega.aegisActive?'Aegis of the Five is active until the start of your next turn.':'Aegis of the Five ended.');
}
function useWingedBreakthrough(){
  if(!megaActive())return showToast('Mega Unison is not active.');
  if(!state.mega.breakthroughAvailable)return showToast('Winged Breakthrough has already been used during this Mega Unison.');
  state.mega.breakthroughAvailable=false;
  rollAndDisplay(`1d20${fmt(effectiveMod('str')+prof())}`,'Winged Breakthrough attack');
  renderAll();scheduleSave();showToast('Winged Breakthrough used. Roll its damage buttons on the action card.');
}

function stanceRules(key) {
  const improved=level()>=10;
  const rules={
    shield:{name:'Shield Wall',min:2,ac:1,speed:improved?0:-5,description:`Troopers overlap shields around the Brass. Gain +1 AC, advantage against being shoved or knocked Prone${improved?', and no longer lose speed':', but speed is reduced by 5 feet'}.`,mods:['+1 AC',improved?'Full speed':'−5 ft speed','Lock Shields']},
    spearhead:{name:'Spearhead',min:3,ac:0,speed:0,description:`After moving at least 10 feet directly toward a target, spend a Command Die when the Brass hits with its spear to add the die to damage and force a Strength save or push the target ${improved?'10':'5'} feet.`,mods:['10 ft approach',`Push ${improved?'10':'5'} ft`,'Command Die damage']},
    assault:{name:'Assault Rank',min:3,ac:0,speed:0,description:`Once per turn, a melee hit deals +${improved?prof()*2:prof()} damage from coordinated blades. Spend a Command Die to suppress the target’s Reactions until its next turn.`,mods:[`+${improved?prof()*2:prof()} damage / turn`,'Suppress Reactions','Requires 3 formed']},
    escort:{name:'Escort Formation',min:2,ac:0,speed:0,description:`Choose an adjacent ward. Impose disadvantage on one attack against the ward with your Reaction${improved?' and the ward gains +1 AC while adjacent':''}. Spend a Command Die to move the ward up to half its speed without Opportunity Attacks.`,mods:['Guard ward',improved?'+1 ward AC':'Guided withdrawal','Command Die movement']}
  };
  return rules[key]||rules.shield;
}
function stanceAvailable(key){return level()>=3&&formedCount()>=stanceRules(key).min;}
function primaryStanceKey(){if(megaActive())return '';return stanceAvailable(state.formation.stance)?state.formation.stance:'';}
function secondaryStanceKey(){
  if(megaActive())return '';
  const key=state.formation.secondaryStance;
  return level()>=18&&key&&key!==primaryStanceKey()&&stanceAvailable(key)?key:'';
}
function primaryStance(){const key=primaryStanceKey();return key?stanceRules(key):null;}
function secondaryBenefitText(key){
  const values={
    shield:'Lesser Shield Wall: advantage against being shoved or knocked Prone.',
    spearhead:`Lesser Spearhead: after a 10-foot approach, the first spear hit deals +${prof()} damage without a push.`,
    assault:`Lesser Assault Rank: once per turn, a melee hit deals +${prof()} coordinated damage.`,
    escort:'Lesser Escort: use your Reaction to impose disadvantage on one attack against the ward.'
  };
  return values[key]||'';
}
function formationState(){
  if(megaActive()) return 'Mega Unison';
  if(state.character.currentHP<=0||formedCount()<2) return 'Broken';
  const unavailable=state.troopers.filter(t=>t.status!=='formed').length;
  if(unavailable===0) return 'Complete';
  if(unavailable===1) return 'Reduced';
  return 'Fragmented';
}
function partitionInteger(total,count){total=Math.max(0,Math.trunc(total));const base=Math.floor(total/count),rem=total%count;return Array.from({length:count},(_,i)=>base+(i<rem?1:0));}
function apportionCurrent(total,maxParts){
  const maxTotal=maxParts.reduce((a,b)=>a+b,0);if(!maxTotal)return maxParts.map(()=>0);total=clamp(Math.trunc(total),0,maxTotal);
  const raw=maxParts.map(part=>total*part/maxTotal),result=raw.map(Math.floor);let rem=total-result.reduce((a,b)=>a+b,0);
  raw.map((value,index)=>({index,fraction:value-Math.floor(value)})).sort((a,b)=>b.fraction-a.fraction||a.index-b.index).slice(0,rem).forEach(({index})=>result[index]++);
  return result;
}
function sharedVitalitySegments(){const maxima=partitionInteger(state.character.maxHP,6),current=apportionCurrent(state.character.currentHP,maxima);return maxima.map((max,index)=>({max,current:current[index]}));}
function trooperSharedSegment(index){return sharedVitalitySegments()[index+1];}

function syncDerivedStats({preserveDamage=true}={}) {
  state.character.level=level();
  const profile=commandDiceProfile();
  const oldCommandMax=Math.max(0,Number(state.resources.commandDiceMax??profile.max));
  const oldCommandCurrent=clamp(Number(state.resources.commandDiceCurrent??oldCommandMax),0,oldCommandMax||0);
  const spent=Math.max(0,oldCommandMax-oldCommandCurrent);
  state.resources.commandDiceMax=profile.max;
  state.resources.commandDie=profile.die;
  state.resources.commandDiceCurrent=clamp(profile.max-spent,0,profile.max);
  state.resources.superiorTechniqueCurrent=state.character.fightingStyle==='Superior Technique'?clamp(state.resources.superiorTechniqueCurrent??1,0,1):1;
  const nextLuckyMax=luckyMax();
  state.resources.luckyCurrent=clamp(state.resources.luckyCurrent??nextLuckyMax,0,nextLuckyMax);
  if(level()<18) state.resources.lastStandAvailable=true;

  if(!state.character.autoLevelStats) {
    state.character.maxHP=Math.max(1,Number(state.character.maxHP)||1);
    state.character.currentHP=clamp(state.character.currentHP,0,state.character.maxHP);
    state.character.hitDiceMax=Math.max(1,Number(state.character.hitDiceMax)||level());
    state.character.hitDiceRemaining=clamp(state.character.hitDiceRemaining,0,state.character.hitDiceMax);
  } else {
    const oldMax=Math.max(1,Number(state.character.maxHP)||1),oldCurrent=clamp(state.character.currentHP,0,oldMax),missing=oldMax-oldCurrent;
    const oldHDMax=Math.max(1,Number(state.character.hitDiceMax)||level()),spentHD=Math.max(0,oldHDMax-Number(state.character.hitDiceRemaining||0));
    const nextMax=calculatedMaxHP();
    state.character.maxHP=nextMax;
    state.character.currentHP=preserveDamage?clamp(nextMax-missing,0,nextMax):clamp(oldCurrent,0,nextMax);
    state.character.hitDiceMax=level();
    state.character.hitDiceRemaining=clamp(level()-spentHD,0,level());
  }

  const nextTrooperMax=detachedTrooperMaxHP(),nextTrooperAC=detachedTrooperAC();
  state.troopers.forEach(t=>{
    const oldMax=Math.max(1,Number(t.maxHP)||nextTrooperMax),missing=Math.max(0,oldMax-Number(t.currentHP||0));
    if(state.character.autoLevelStats){t.maxHP=nextTrooperMax;t.currentHP=clamp(nextTrooperMax-missing,0,nextTrooperMax);t.ac=nextTrooperAC;}
    else {t.maxHP=Math.max(1,Number(t.maxHP)||nextTrooperMax);t.currentHP=clamp(t.currentHP,0,t.maxHP);t.ac=Math.max(1,Number(t.ac)||nextTrooperAC);}
  });
  if(level()<18) state.formation.secondaryStance='';
  if(state.formation.secondaryStance===state.formation.stance) state.formation.secondaryStance='';
  if(megaActive()&&(!megaUnlocked()||!allTroopersFormed())){state.mega.active=false;state.mega.roundsRemaining=0;state.mega.aegisActive=false;}
}

function scheduleSave(){
  const status=document.getElementById('saveStatus');status.textContent='Saving…';clearTimeout(saveTimer);
  saveTimer=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));status.textContent='Saved locally';}catch(err){console.warn('Could not save sheet',err);status.textContent='Not saved';showToast('The sheet could not be saved locally. Try a smaller artwork image.');}},180);
}
function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2400);}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function handleBoundInput(input){
  const path=input.dataset.path;let next=input.type==='checkbox'?input.checked:input.value;if(input.type==='number')next=Number(next);setPath(state,path,next);
  if(['character.level','character.bonusHP','character.autoLevelStats','character.fightingStyle'].includes(path)) syncDerivedStats();
  if(path==='character.currentHP') state.character.currentHP=clamp(state.character.currentHP,0,state.character.maxHP);
  if(path==='character.maxHP'&&!state.character.autoLevelStats) syncDerivedStats({preserveDamage:false});
  renderAll();scheduleSave();
}
function bindInputs(){
  document.querySelectorAll('.data-input').forEach(input=>{
    const path=input.dataset.path;if(!path)return;const value=getPath(state,path);if(input.type==='checkbox')input.checked=Boolean(value);else input.value=value??'';
    const event=input.tagName==='TEXTAREA'?'input':'change';input.addEventListener(event,()=>handleBoundInput(input));
    if(event!=='input')input.addEventListener('input',()=>{if(input.type==='number'||input.type==='text'||input.tagName==='INPUT')handleBoundInput(input);});
  });
}
function syncBoundInputs(){document.querySelectorAll('.data-input[data-path]').forEach(input=>{if(document.activeElement===input)return;const value=getPath(state,input.dataset.path);if(input.type==='checkbox')input.checked=Boolean(value);else input.value=value??'';});}


function currentArtworkKey(){
  return primaryStanceKey() || 'march';
}
function currentArtworkSet(){
  return stanceArtworkSets[state.character.artGender]||stanceArtworkSets.female;
}
function renderArtwork(){
  const image=document.getElementById('heroImage');if(!image)return;
  const art=megaActive()?(megaArtworkSets[state.character.artGender]||megaArtworkSets.female):((currentArtworkSet()[currentArtworkKey()])||currentArtworkSet().march);
  image.src=art.src;
  image.alt=art.alt;
  image.style.objectFit='cover';
  image.style.objectPosition='center';
  image.style.transform='scale(1)';
  image.style.transformOrigin='center';
  document.getElementById('heroArt')?.classList.toggle('mega-active-glow',megaActive());
}
function setupArtworkEditor(){ return; }

function renderAbilities(){

  const grid=document.getElementById('abilityGrid');grid.innerHTML='';
  abilities.forEach(key=>{
    const card=document.createElement('div');card.className='ability-card';
    card.innerHTML=`<label>${abilityNames[key]}<input type="number" min="1" max="30" value="${state.character.abilities[key]}" data-ability="${key}"><small class="effective-score">Effective ${effectiveAbility(key)}</small></label><button class="ability-mod" type="button" title="Roll ${abilityNames[key]} check">${fmt(effectiveMod(key))}</button>`;
    card.querySelector('input').addEventListener('change',e=>{state.character.abilities[key]=Number(e.target.value);syncDerivedStats();renderAll();scheduleSave();});
    card.querySelector('button').addEventListener('click',()=>rollAndDisplay(`1d20${fmt(effectiveMod(key))}`,`${abilityNames[key]} check`));grid.appendChild(card);
  });
}
function renderChecks(){
  const savesEl=document.getElementById('saveList'),skillEl=document.getElementById('skillList');savesEl.innerHTML='';skillEl.innerHTML='';
  abilities.forEach(key=>{const bonus=effectiveMod(key)+(effectiveSaveProficient(key)?prof():0),row=document.createElement('div');row.className='check-row';row.innerHTML=`<input type="checkbox" ${effectiveSaveProficient(key)?'checked':''} aria-label="${abilityNames[key]} save proficiency"><span>${abilityNames[key]} <small>(${key.toUpperCase()})</small></span><button type="button">${fmt(bonus)}</button>`;row.querySelector('input').addEventListener('change',e=>{state.character.saves[key]=e.target.checked;renderChecks();scheduleSave();});row.querySelector('button').addEventListener('click',()=>rollAndDisplay(`1d20${fmt(bonus)}`,`${abilityNames[key]} saving throw`));savesEl.appendChild(row);});
  skills.forEach(([name,key])=>{const rank=effectiveSkillRank(name),bonus=effectiveMod(key)+prof()*rank,row=document.createElement('div');row.className='check-row';row.innerHTML=`<input type="checkbox" ${rank?'checked':''} aria-label="${name} proficiency"><span>${name} <small>${key.toUpperCase()}</small></span><button type="button">${fmt(bonus)}</button>`;row.querySelector('input').addEventListener('change',e=>{state.character.skills[name]=e.target.checked?1:0;renderChecks();renderDynamic();scheduleSave();});row.querySelector('button').addEventListener('click',()=>rollAndDisplay(`1d20${fmt(bonus)}`,name));skillEl.appendChild(row);});
}

function renderCommandResources(){
  const panel=document.getElementById('commandResourcePanel');if(!panel)return;const profile=commandDiceProfile();
  if(level()<3){panel.innerHTML='<div class="resource-locked"><strong>Formation command features unlock at Fighter level 3.</strong><span>Until then, the cohort fights as an ordinary Fighter with its species rules.</span></div>';return;}
  if(megaActive()){panel.innerHTML='<div class="resource-locked"><strong>Formation commands are suspended during Mega Unison.</strong><span>The five Troopers are fused into the Brass, so no stance or detached-Trooper command can be used.</span></div>';return;}
  const secondaryOptions=['<option value="">No secondary stance</option>',...Object.keys({shield:1,spearhead:1,assault:1,escort:1}).filter(k=>k!==primaryStanceKey()).map(k=>`<option value="${k}" ${state.formation.secondaryStance===k?'selected':''}>${stanceRules(k).name}</option>`)].join('');
  panel.innerHTML=`
    <div class="resource-stat"><span>Command Dice</span><strong>${state.resources.commandDiceCurrent}/${profile.max} d${profile.die}</strong><small>Short or Long Rest</small></div>
    <div class="resource-controls"><button type="button" data-resource="spend" ${state.resources.commandDiceCurrent<=0?'disabled':''}>Spend one</button><button type="button" data-resource="restore" ${state.resources.commandDiceCurrent>=profile.max?'disabled':''}>Restore one</button></div>
    <div class="resource-stat"><span>Stance change</span><strong>${stanceSwitchText()}</strong><small>${formedCount()} Troopers formed</small></div>
    <label class="resource-field">Escort ward<input id="wardInput" value="${escapeHtml(state.formation.ward||'')}" placeholder="Adjacent ally"></label>
    <label class="resource-field secondary-field ${level()<18?'locked':''}">Secondary stance<select id="secondaryStanceSelect" ${level()<18?'disabled':''}>${level()>=18?secondaryOptions:'<option>Unlocks at level 18</option>'}</select></label>
    <div class="resource-note">${orderCostText()}.</div>`;
  panel.querySelector('[data-resource="spend"]').addEventListener('click',()=>{state.resources.commandDiceCurrent=Math.max(0,state.resources.commandDiceCurrent-1);renderAll();scheduleSave();});
  panel.querySelector('[data-resource="restore"]').addEventListener('click',()=>{state.resources.commandDiceCurrent=Math.min(profile.max,state.resources.commandDiceCurrent+1);renderAll();scheduleSave();});
  panel.querySelector('#wardInput').addEventListener('input',e=>{state.formation.ward=e.target.value;scheduleSave();renderActions();});
  const secondary=panel.querySelector('#secondaryStanceSelect');if(secondary&&!secondary.disabled)secondary.addEventListener('change',e=>{state.formation.secondaryStance=e.target.value;renderAll();scheduleSave();});
}
function renderMegaUnison(){
  const panel=document.getElementById('megaUnisonPanel'),badge=document.getElementById('megaStatusBadge');
  if(!panel||!badge)return;
  const active=megaActive(),reasons=megaRequirements(),available=canActivateMega();
  badge.textContent=active?`${state.mega.roundsRemaining} round${state.mega.roundsRemaining===1?'':'s'} remaining`:megaUnlocked()?(available?'Ready':'Unavailable'):'Locked';
  badge.style.color=active?'var(--gold-bright)':available?'var(--green)':reasons.length?'var(--red-bright)':'var(--muted)';
  const requirements=megaUnlocked()?[
    ['Heroic Inspiration',state.character.heroicInspiration],
    ['Long-Rest use available',!state.resources.megaUsedThisLongRest],
    ['All five Troopers formed',allTroopersFormed()]
  ]:[['Reach Fighter level 15',false]];
  panel.innerHTML=`
    <div class="mega-control-card ${active?'active':''}">
      <div class="mega-resource-row"><span>Form</span><strong>${active?'Mega Unison':'Normal Cohort'}</strong></div>
      <div class="mega-resource-row"><span>Duration</span><strong>${megaDuration()} rounds (PB)</strong></div>
      <div class="mega-resource-row"><label class="check-line"><input id="heroicInspirationToggle" type="checkbox" ${state.character.heroicInspiration?'checked':''} ${active?'disabled':''}> Heroic Inspiration available</label></div>
      ${active?`<div class="mega-rounds"><div><span>Remaining</span><strong>${state.mega.roundsRemaining}</strong></div><div><span>Winged Breakthrough</span><strong>${state.mega.breakthroughAvailable?'Ready':'Used'}</strong></div><div><span>Aegis</span><strong>${state.mega.aegisActive?'Active':'Inactive'}</strong></div></div>`:''}
      <div class="mega-button-row">
        ${active?`<button type="button" id="megaNextRoundBtn">Next round</button><button type="button" id="megaEndBtn" class="mega-end">End Mega Unison</button>`:`<button type="button" id="megaActivateBtn" class="mega-activate" ${available?'':'disabled'}>Activate Mega Unison</button>`}
      </div>
      ${!active&&reasons.length?`<p class="mega-warning">${reasons.map(escapeHtml).join(' · ')}</p>`:''}
      <p class="mega-note">Activation is a Bonus Action. Heroic Inspiration is consumed, and this transformation can be used once per Long Rest.</p>
    </div>
    <div class="mega-benefits-card">
      <h3>Mega Unison effects</h3>
      <ul class="mega-benefit-list">
        <li><strong>Unified armour:</strong> +1 AC. Aegis of the Five grants another +2 AC until the start of your next turn.</li>
        <li><strong>Winged movement:</strong> walking speed 30 ft and flying speed 30 ft; you must end your turn on solid ground.</li>
        <li><strong>Fused offence:</strong> melee weapon attacks deal +1d8 damage, and one hit per turn can deal +${prof()} damage.</li>
        <li><strong>Perfect cohesion:</strong> advantage on saves against being shoved, knocked Prone or forcibly moved.</li>
        <li><strong>Winged Breakthrough:</strong> once per transformation, rush without Opportunity Attacks and deliver a crushing spear charge.</li>
        <li><strong>Aegis of the Five:</strong> take an Action for +2 AC, physical damage resistance, immunity to Prone and half cover for nearby allies.</li>
      </ul>
      <p class="mega-warning">All Troopers are fused into the Brass. You cannot detach a Trooper or use Formation Stances until Mega Unison ends.</p>
    </div>`;
  const inspiration=document.getElementById('heroicInspirationToggle');
  if(inspiration)inspiration.addEventListener('change',event=>{state.character.heroicInspiration=event.target.checked;renderMegaUnison();scheduleSave();});
  document.getElementById('megaActivateBtn')?.addEventListener('click',activateMega);
  document.getElementById('megaNextRoundBtn')?.addEventListener('click',advanceMegaRound);
  document.getElementById('megaEndBtn')?.addEventListener('click',()=>endMega('Mega Unison ended early.'));
}

function renderStances(){
  const grid=document.getElementById('stanceGrid');grid.innerHTML='';
  ['shield','spearhead','assault','escort'].forEach(key=>{
    const stance=stanceRules(key),active=!megaActive()&&primaryStanceKey()===key,secondary=secondaryStanceKey()===key,available=stanceAvailable(key),card=document.createElement('div');
    card.className=`stance-card${active?' active':''}${secondary?' secondary':''}`;
    const lockReason=megaActive()?'Unavailable during Mega Unison':level()<3?'Unlocks at level 3':formedCount()<stance.min?`Needs ${stance.min} formed`:'Adopt stance';
    const buttonText=megaActive()?'Fused form active':active?'Return to Phalanx':available?'Adopt stance':lockReason;
    card.innerHTML=`<div class="stance-title-row"><h3>${stance.name}</h3>${secondary?'<span class="secondary-badge">Secondary</span>':''}</div><p>${stance.description}</p><div class="stance-mods">${stance.mods.map(m=>`<span>${m}</span>`).join('')}</div>${level()>=18&&secondary?`<small class="lesser-benefit">${secondaryBenefitText(key)}</small>`:''}<button type="button" ${megaActive()||(!available&&!active)?'disabled':''} class="${active?'active':''}">${buttonText}</button>`;
    card.querySelector('button').addEventListener('click',()=>{
      if(megaActive())return showToast('Formation Stances are unavailable during Mega Unison.');
      if(active){state.formation.stance='';if(state.formation.secondaryStance===key)state.formation.secondaryStance='';renderAll();scheduleSave();return showToast('Returned to Phalanx Formation.');}
      if(!available)return showToast(lockReason);
      state.formation.stance=key;if(state.formation.secondaryStance===key)state.formation.secondaryStance='';renderAll();scheduleSave();showToast(`${stance.name} adopted.`);
    });
    grid.appendChild(card);
  });
}

function renderOverviewTroopers(){
  const row=document.getElementById('overviewTrooperRow');if(!row)return;row.innerHTML='';const segments=sharedVitalitySegments();
  state.troopers.forEach((t,index)=>{const segment=segments[index+1],personal=t.status==='detached'||t.status==='downed',current=personal?t.currentHP:(t.status==='missing'?0:segment.current),maximum=personal?t.maxHP:segment.max,percent=maximum?clamp(current/maximum*100,0,100):0,card=document.createElement('button');card.type='button';card.className=`overview-trooper-card status-${t.status}`;card.title='Open this Trooper in the Formation tab';card.innerHTML=`<div class="overview-trooper-head"><i class="hair-swatch" style="background:${hairColours[index]}"></i><span>${escapeHtml(t.name)}</span><small>${escapeHtml(t.status)}</small></div><div class="overview-loadout"><span>⚔ ${escapeHtml(t.weapon)}</span><span>◉ ${escapeHtml(t.shield)}</span></div><div class="chunk-bar"><i style="width:${percent}%"></i></div><div class="chunk-values"><strong>${current}/${maximum}</strong><span>${personal?'personal HP':'shared chunk'}</span></div>`;card.addEventListener('click',()=>activateTab('formation'));row.appendChild(card);});
  document.getElementById('brassChunkSummary').textContent=`Brass reserve: ${segments[0].current}/${segments[0].max} HP · all six chunks total ${state.character.currentHP}/${state.character.maxHP}`;
}
function weaponOptionsHtml(selected){return Object.keys(trooperWeapons).map(name=>`<option value="${escapeHtml(name)}" ${name===selected?'selected':''}>${escapeHtml(name)}</option>`).join('');}
function orderOptionsHtml(selected){const options=availableOrders();if(selected&&!options.includes(selected))options.unshift(selected);return options.map(name=>`<option value="${escapeHtml(name)}" ${name===selected?'selected':''}>${escapeHtml(name)}</option>`).join('');}
function renderTroopers(){
  const grid=document.getElementById('trooperGrid');grid.innerHTML='';
  state.troopers.forEach((t,index)=>{
    const card=document.createElement('div');card.className='trooper-card';card.dataset.status=t.status;const personal=t.status==='detached'||t.status==='downed',segment=trooperSharedSegment(index),displayCurrent=personal?t.currentHP:(t.status==='missing'?0:segment.current),displayMax=personal?t.maxHP:segment.max;
    card.innerHTML=`
      <div class="trooper-id"><strong>Trooper ${index+1}</strong><i class="hair-swatch" style="background:${hairColours[index]}"></i></div>
      <div class="trooper-fields two-col"><label>Name<input value="${escapeHtml(t.name)}" data-field="name"></label><label>Hair / marker<input value="${escapeHtml(t.hair)}" data-field="hair"></label></div>
      <label>Status<select data-field="status" ${megaActive()?'disabled':''}><option value="formed">Formed</option><option value="detached">Detached</option><option value="downed">Downed</option><option value="missing">Missing</option></select></label>
      <div class="trooper-hp"><label>${personal?'Personal':'Shared'} HP<input type="number" min="0" value="${displayCurrent}" data-field="currentHP" ${personal?'':'disabled'}></label><span>/</span><label>Max<input type="number" min="1" value="${displayMax}" data-field="maxHP" ${personal&&!state.character.autoLevelStats?'':'disabled'}></label></div>
      <label>AC<input type="number" min="1" value="${t.ac}" data-field="ac" ${state.character.autoLevelStats?'disabled':''}></label>
      <div class="trooper-equipment"><label>Short simple weapon<select data-field="weapon">${weaponOptionsHtml(t.weapon)}</select></label><label>Shield<input value="${escapeHtml(t.shield)}" data-field="shield"></label></div>
      <div class="fixed-profile"><strong>Trooper Strike</strong><span>${fmt(effectiveMod('str')+prof())} to hit · 1d6 ${fmt(prof())} ${weaponDamageType(t)}</span><small>Equipment changes name and damage type only.</small></div>
      <label>Recognised leader<input value="${escapeHtml(t.leader)}" data-field="leader"></label>
      <label>Current order<select data-field="order">${orderOptionsHtml(t.order)}</select></label>
      <p class="small-note">${megaActive()?'Fused into the Mega Unison war-form.':t.status==='formed'?`Shares the Formation pool as a ${segment.current}/${segment.max} HP chunk.`:t.status==='detached'?`Acts after ${escapeHtml(t.leader||'its Temporary Leader')}. ${orderCostText()}.`:t.status==='downed'?'Prone and Incapacitated until healed or recovered.':'Seeking shelter or the Brass’s last known position.'}</p>
      <div class="trooper-actions"><button type="button" data-act="strike" ${megaActive()?'disabled':''}>Trooper Strike</button><button type="button" data-act="damage">Damage</button><button type="button" data-act="heal">Heal</button><button type="button" data-act="return" ${megaActive()?'disabled':''}>Return</button></div>`;
    card.querySelector('[data-field="status"]').value=t.status;
    card.querySelectorAll('[data-field]').forEach(input=>input.addEventListener('change',e=>{
      const field=e.target.dataset.field;if(e.target.disabled)return;let value=e.target.type==='number'?Number(e.target.value):e.target.value;
      if(megaActive()&&field==='status'){e.target.value=t.status;return showToast('Troopers cannot separate during Mega Unison.');}
      if(field==='status'&&value==='detached'){
        const other=state.troopers.find(x=>x.id!==t.id&&(x.status==='detached'||x.status==='downed'));
        if(other){e.target.value=t.status;return showToast(`${other.name} is already away from formation.`);}
        if(t.status==='formed'){const ratio=segment.max?segment.current/segment.max:0;t.currentHP=clamp(Math.round(t.maxHP*ratio),0,t.maxHP);t.leader=t.leader==='The Brass'?'Temporary Leader':t.leader;t.order='Follow';}
      }
      t[field]=value;
      if(field==='status'&&value==='formed'){t.leader='The Brass';t.order='Form up';}
      if(field==='weapon'&&!trooperWeapons[value])t.weapon='Trooper sword';
      renderAll();scheduleSave();
    }));
    card.querySelector('[data-act="strike"]').addEventListener('click',()=>{if(t.status!=='detached')return showToast('Only a detached Trooper makes an individual Trooper Strike.');rollAndDisplay(`1d20${fmt(effectiveMod('str')+prof())}`,`${t.name} Trooper Strike`);});
    card.querySelector('[data-act="damage"]').addEventListener('click',()=>adjustTrooperHP(t,-1));
    card.querySelector('[data-act="heal"]').addEventListener('click',()=>adjustTrooperHP(t,1));
    card.querySelector('[data-act="return"]').addEventListener('click',()=>{if(megaActive())return showToast('Troopers cannot separate or re-form during Mega Unison.');t.status='formed';t.leader='The Brass';t.order='Form up';renderAll();scheduleSave();showToast(`${t.name} returned to formation.`);});
    grid.appendChild(card);
  });
}
function adjustTrooperHP(t,delta){
  if(!['detached','downed'].includes(t.status))return showToast('Personal HP is only tracked while detached or Downed.');
  const amount=Math.max(0,Number(prompt(delta<0?'Damage amount':'Healing amount','1')||0));if(!amount)return;
  if(delta<0){t.currentHP=Math.max(0,t.currentHP-amount);if(state.formation.linkDetachedDamage)applyFormationDamage(amount);if(t.currentHP===0)t.status='downed';}
  else {const actual=Math.min(amount,t.maxHP-t.currentHP);t.currentHP+=actual;if(state.formation.linkDetachedDamage)state.character.currentHP=Math.min(state.character.maxHP,state.character.currentHP+actual);if(t.currentHP>0&&t.status==='downed')t.status='detached';}
  renderAll();scheduleSave();
}

function renderSpeciesFeatures(){
  const grid=document.getElementById('speciesFeatureGrid');if(!grid)return;grid.innerHTML='';speciesFeatures.forEach(feature=>{const card=document.createElement('div');card.className='fighter-feature-card species-feature-card';card.innerHTML=`<span>Species · Active</span><h3>${feature.name}</h3><p>${feature.text}</p>`;grid.appendChild(card);});
}
function abilityOptions(selected,restrict='any'){
  const keys=restrict==='strDex'?['str','dex']:abilities;
  return keys.map(key=>`<option value="${key}" ${selected===key?'selected':''}>${abilityNames[key]}</option>`).join('');
}
function featOptions(selected){return Object.keys(supportedFeats).map(name=>`<option value="${escapeHtml(name)}" ${selected===name?'selected':''}>${escapeHtml(name)}</option>`).join('');}
function renderFightingStyleMechanics(){
  const panel=document.getElementById('fightingStyleMechanics');if(!panel)return;
  const style=state.character.fightingStyle;
  const descriptions={
    'Defense':'+1 AC is applied automatically.',
    'Dueling':'+2 damage is applied to the Brass’s one-handed spear attacks.',
    'Interception':'Reaction action added: reduce damage to an adjacent creature by 1d10 + Proficiency Bonus.',
    'Protection':'Reaction reminder added: impose disadvantage on an attack against an adjacent ally while wielding a shield.',
    'Superior Technique':'Gain one d6 superiority die per Short or Long Rest and select a manoeuvre below.',
    'Other':'No automatic effect. Describe the custom style in Additional Features.'
  };
  panel.innerHTML=`<div class="choice-summary"><span>Selected Fighting Style</span><strong>${escapeHtml(style)}</strong><p>${descriptions[style]||'No automatic effect.'}</p>${style==='Superior Technique'?`<label>Manoeuvre<select id="superiorTechniqueManeuver">${superiorTechniqueManeuvers.map(name=>`<option ${name===state.character.superiorTechniqueManeuver?'selected':''}>${name}</option>`).join('')}</select></label><div class="choice-resource">Superiority die: <strong>${state.resources.superiorTechniqueCurrent}/1 d6</strong></div>`:''}</div>`;
  document.getElementById('superiorTechniqueManeuver')?.addEventListener('change',e=>{state.character.superiorTechniqueManeuver=e.target.value;renderAll();scheduleSave();});
}
function renderLevelChoices(){
  renderFightingStyleMechanics();
  const grid=document.getElementById('levelChoiceGrid');if(!grid)return;grid.innerHTML='';
  asiLevels.forEach(lvl=>{
    const unlocked=level()>=lvl,choice=state.character.levelChoices[String(lvl)],card=document.createElement('div');
    card.className=`level-choice-card${unlocked?'':' locked'}`;
    const feat=supportedFeats[choice.feat]||supportedFeats.Tough;
    let detail='No choice selected.';
    if(choice.type==='asi')detail=`+1 ${abilityNames[choice.ability1]} and +1 ${abilityNames[choice.ability2]}${choice.ability1===choice.ability2?' (+2 total)':''}.`;
    if(choice.type==='feat')detail=feat.description;
    card.innerHTML=`<div class="level-choice-head"><strong>Fighter level ${lvl}</strong><span>${unlocked?'Active':'Locked'}</span></div><label>Choice<select data-choice="type" ${unlocked?'':'disabled'}><option value="none" ${choice.type==='none'?'selected':''}>None</option><option value="asi" ${choice.type==='asi'?'selected':''}>Ability Score Improvement</option><option value="feat" ${choice.type==='feat'?'selected':''}>Feat</option></select></label><div class="choice-asi" ${choice.type==='asi'?'':'hidden'}><label>First +1<select data-choice="ability1">${abilityOptions(choice.ability1)}</select></label><label>Second +1<select data-choice="ability2">${abilityOptions(choice.ability2)}</select></label></div><div class="choice-feat" ${choice.type==='feat'?'':'hidden'}><label>Feat<select data-choice="feat">${featOptions(choice.feat)}</select></label>${feat.abilityChoice?`<label>Ability +1<select data-choice="featAbility">${abilityOptions(choice.featAbility,feat.abilityChoice)}</select></label>`:''}${feat.skillChoice?`<label>Expertise skill<select data-choice="featSkill">${skills.map(([name])=>`<option ${choice.featSkill===name?'selected':''}>${name}</option>`).join('')}</select></label>`:''}</div><p>${escapeHtml(detail)}</p>`;
    card.querySelectorAll('[data-choice]').forEach(control=>control.addEventListener('change',e=>{
      const field=e.target.dataset.choice;choice[field]=e.target.value;
      if(field==='feat'){
        const next=supportedFeats[choice.feat];if(next?.abilityChoice==='strDex'&&!['str','dex'].includes(choice.featAbility))choice.featAbility='str';
      }
      if(field==='feat'&&choice.feat==='Lucky')state.resources.luckyCurrent=luckyMax();
      if(field==='feat'&&choice.feat==='Inspiring Leader')state.resources.inspiringLeaderAvailable=true;
      syncDerivedStats();renderAll();scheduleSave();
    }));
    grid.appendChild(card);
  });
}
function renderFighterFeatures(){
  renderLevelChoices();
  const lvl=level(),profile=commandDiceProfile(),summary=document.getElementById('derivedFeatureSummary');
  summary.innerHTML=`<div><span>Attacks / action</span><strong>${fighterAttacks()}</strong></div><div><span>Formation save DC</span><strong>${formationSaveDC()}</strong></div><div><span>Command Dice</span><strong>${lvl<3?'Locked':`${state.resources.commandDiceCurrent}/${profile.max} d${profile.die}`}</strong></div><div><span>Detached Trooper</span><strong>AC ${detachedTrooperAC()} · ${detachedTrooperMaxHP()} HP</strong></div><div><span>Stance switching</span><strong>${lvl<3?'Locked':stanceSwitchText()}</strong></div><div><span>Temporary orders</span><strong>${lvl>=7?'Free 1/round':'Bonus Action'}</strong></div><div><span>Mega Unison</span><strong>${lvl<15?'Locked':megaActive()?`${state.mega.roundsRemaining} rounds`:(state.resources.megaUsedThisLongRest?'Used':'Ready')}</strong></div><div><span>Fighting Style</span><strong>${escapeHtml(state.character.fightingStyle)}</strong></div><div><span>Active feats</span><strong>${unlockedLevelChoices().filter(c=>c.type==='feat').length}</strong></div>`;
  document.getElementById('fighterLevelBadge').textContent=`Level ${lvl}`;
  const grid=document.getElementById('fighterFeatureGrid');grid.innerHTML='';
  fighterProgression.forEach(feature=>{const unlocked=feature.level<=lvl,card=document.createElement('div');card.className=`fighter-feature-card${unlocked?'':' locked'}`;card.innerHTML=`<span>${escapeHtml(feature.kind)} · Level ${feature.level} · ${unlocked?'Unlocked':'Locked'}</span><h3>${feature.name}</h3><p>${feature.text}</p>`;grid.appendChild(card);});
}

function spendCommandDie(label,formula=''){
  const profile=commandDiceProfile();if(level()<3)return showToast('Command Dice unlock at level 3.');if(state.resources.commandDiceCurrent<=0)return showToast('No Command Dice remain.');
  state.resources.commandDiceCurrent--;if(formula)rollAndDisplay(formula,label);else{recordHistory(label,'Command Die',0,'Resource spent');showToast(`${label}: Command Die spent.`);}renderAll();scheduleSave();
}
function recordHistory(label,formula,total,detail){state.rollHistory.unshift({label,formula,total,detail,time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});state.rollHistory=state.rollHistory.slice(0,20);renderRollHistory();}
function useLastStand(){
  if(level()<18)return showToast('Perfect Formation unlocks at level 18.');if(!state.resources.lastStandAvailable)return showToast('Trooper Sacrifice has already been used this Long Rest.');if(state.character.currentHP>0)return showToast('Use this only when the cohort is at 0 HP.');
  const trooper=state.troopers.find(t=>t.status==='formed');if(!trooper)return showToast('No formed Trooper can take the fall.');trooper.status='downed';trooper.currentHP=0;trooper.leader='The Brass';trooper.order='Recover';state.character.currentHP=1;state.resources.lastStandAvailable=false;renderAll();scheduleSave();showToast(`${trooper.name} becomes Downed; the cohort remains at 1 HP.`);
}
function makeRollButton(label,formula,desc,disabled=false){const btn=document.createElement('button');btn.type='button';btn.textContent=`${label}: ${formula}`;btn.disabled=disabled;btn.addEventListener('click',()=>rollAndDisplay(formula,desc));return btn;}
function makeCommandRollButton(label,formula,desc,disabled=false){const btn=document.createElement('button');btn.type='button';btn.textContent=`${label}: ${formula}`;btn.disabled=disabled||state.resources.commandDiceCurrent<=0;btn.addEventListener('click',()=>spendCommandDie(desc,formula));return btn;}
function makeCommandSpendButton(label,desc,disabled=false){const btn=document.createElement('button');btn.type='button';btn.textContent=label;btn.disabled=disabled||state.resources.commandDiceCurrent<=0;btn.addEventListener('click',()=>spendCommandDie(desc));return btn;}
function renderActions(){
  const str=effectiveMod('str'),p=prof(),attack=str+p,profile=commandDiceProfile(),primary=primaryStanceKey(),formed=formedCount(),detached=state.troopers.find(t=>t.status==='detached'),mega=megaActive(),dueling=duelingDamageBonus();
  const actions=[];
  const spearDamage=mega?`1d6${fmt(str+dueling)}+1d8`:`1d6${fmt(str+dueling)}`;
  actions.push({name:mega?'Mega Unison Spear':"Brass's Spear",tag:'Attack action',text:mega?`Make ${fighterAttacks()} spear attack${fighterAttacks()===1?'':'s'}. Every melee weapon hit deals an additional 1d8 damage while Mega Unison is active.`:`Make ${fighterAttacks()} spear attack${fighterAttacks()===1?'':'s'} when you take the Attack action. Trooper movements and sword strikes may describe these attacks without creating extra attack rolls.`,buttons:[{type:'roll',label:'Attack',formula:`1d20${fmt(attack)}`,desc:mega?'Mega Unison Spear attack':"Brass's Spear attack"},{type:'roll',label:'Damage',formula:spearDamage,desc:mega?'Mega Unison Spear damage':"Brass's Spear damage"}]});
  if(mega)actions.push({name:'Unison Surge',tag:'Mega Unison · Once per turn',text:`Once on each of your turns, add ${p} damage to one melee weapon hit as the five Troopers reinforce the Brass from within.`,style:'mega-offense',buttons:[{type:'roll',label:'Bonus damage',formula:String(p),desc:'Mega Unison once-per-turn bonus damage'}]});
  actions.push({name:'Trooper Strike',tag:'Detached Trooper',text:mega?'All five Troopers are fused into the Brass and cannot act separately.':detached?`${detached.name} attacks with ${detached.weapon}. The fixed profile ignores weapon bonuses, mastery, feats and Fighting Styles; only the damage type changes to ${weaponDamageType(detached)}.`:'Detach one Trooper to enable its fixed short-weapon attack.',disabled:mega||!detached,buttons:[{type:'roll',label:'Attack',formula:`1d20${fmt(attack)}`,desc:`${detached?.name||'Trooper'} Strike`},{type:'roll',label:'Damage',formula:`1d6${fmt(p)}`,desc:`${detached?.name||'Trooper'} Strike (${detached?weaponDamageType(detached):'weapon'}) damage`}]});
  actions.push({name:'Lock Shields',tag:'Shield Wall · Reaction',text:`Spend one Command Die to reduce damage to the cohort or an adjacent ally by the die + proficiency bonus. Shield Wall also grants +1 AC and advantage against being shoved or knocked Prone.`,disabled:mega||primary!=='shield'||level()<3,buttons:[{type:'commandRoll',label:'Reduce',formula:profile.die?`1d${profile.die}${fmt(p)}`:'—',desc:'Lock Shields damage reduction'}]});
  actions.push({name:'Spearhead Charge',tag:'Spearhead · On hit',text:`After moving at least 10 feet directly toward the target, spend one Command Die to add it to spear damage. The target makes a Strength save against DC ${formationSaveDC()} or is pushed ${level()>=10?'10':'5'} feet.`,disabled:mega||primary!=='spearhead'||formed<3||level()<3,buttons:[{type:'commandRoll',label:'Bonus damage',formula:profile.die?`1d${profile.die}`:'—',desc:'Spearhead Charge bonus damage'}]});
  actions.push({name:'Coordinated Blades',tag:'Assault Rank · Once per turn',text:`A melee hit deals +${level()>=10?p*2:p} damage from the Troopers’ coordinated blades. Spend one Command Die to also prevent the target from taking Reactions until the start of its next turn.`,disabled:mega||primary!=='assault'||formed<3||level()<3,buttons:[{type:'roll',label:'Passive bonus',formula:String(level()>=10?p*2:p),desc:'Coordinated Blades bonus damage'},{type:'commandSpend',label:'Suppress Reactions',desc:'Suppressing Blows'}]});
  actions.push({name:'Guard the Ward',tag:'Escort · Reaction',text:`Ward: ${escapeHtml(state.formation.ward||'not selected')}. Impose disadvantage on one attack against the adjacent ward${level()>=10?' and grant that ward +1 AC while adjacent':''}. Spend one Command Die to move the ward up to half its speed without provoking Opportunity Attacks.`,disabled:mega||primary!=='escort'||formed<2||level()<3,buttons:[{type:'commandSpend',label:'Guided Withdrawal',desc:'Guided Withdrawal'}]});
  if(level()>=7) actions.push({name:'Interpose',tag:'Delegated Command · Reaction',text:mega?'The Troopers are fused and cannot Interpose separately.':`A detached Trooper may move up to 10 feet to become adjacent to its Temporary Leader and reduce damage to that leader by ${p}, provided it can reach them.`,disabled:mega||!detached,buttons:[{type:'roll',label:'Reduce',formula:String(p),desc:'Detached Trooper Interpose'}]});
  if(level()>=15) actions.push({name:'Emergency Recall',tag:'Instant Reformation · Reaction',text:mega?'All Troopers are already fused into the Brass.':'A detached Trooper may immediately move up to its speed toward the Brass when recalled. The Return button on its roster card rejoins it once it reaches formation.',disabled:mega||!detached,buttons:[]});
  if(mega){
    actions.push({name:'Winged Breakthrough',tag:'Mega Unison · Action · 1/use',text:`Move up to 30 feet in a straight line without provoking Opportunity Attacks, then make one melee weapon attack. On a hit, deal normal Mega Unison spear damage plus 2d8 piercing and 2d8 slashing damage. The target makes a Strength save against DC ${formationSaveDC()} or is pushed 10 feet and knocked Prone.`,style:'mega-offense',buttons:[{type:'megaBreakthrough',label:state.mega.breakthroughAvailable?'Use & roll attack':'Attack already used',disabled:!state.mega.breakthroughAvailable},{type:'roll',label:'Spear + Unison',formula:`1d6${fmt(str+dueling)}+1d8`,desc:'Winged Breakthrough spear damage'},{type:'roll',label:'+ Piercing',formula:'2d8',desc:'Winged Breakthrough piercing damage'},{type:'roll',label:'+ Slashing',formula:'2d8',desc:'Winged Breakthrough slashing damage'}]});
    actions.push({name:'Aegis of the Five',tag:'Mega Unison · Action',text:`Until the start of your next turn, gain +2 AC, resistance to bludgeoning, piercing and slashing damage, immunity to being knocked Prone, and grant half cover to creatures of your choice within 5 feet.`,style:'mega-defense',buttons:[{type:'megaAegis',label:state.mega.aegisActive?'End Aegis':'Activate Aegis'}]});
  }
  if(level()>=18) actions.push({name:'Trooper Sacrifice',tag:'Perfect Formation · 1/Long Rest',text:mega?'This feature is unavailable while the Troopers are fused.':`When the cohort is reduced to 0 HP, one formed Trooper becomes Downed and the cohort remains at 1 HP. ${state.resources.lastStandAvailable?'Available.':'Already used this Long Rest.'}`,disabled:mega||!state.resources.lastStandAvailable||state.character.currentHP>0||formed<1,buttons:[{type:'special',label:'Use at 0 HP'}]});
  if(state.character.fightingStyle==='Interception')actions.push({name:'Interception',tag:'Fighting Style · Reaction',text:`When a creature you can see hits an adjacent target other than you, reduce the damage by 1d10 + ${p}. You must be wielding a shield or weapon.`,buttons:[{type:'roll',label:'Reduce damage',formula:`1d10${fmt(p)}`,desc:'Interception damage reduction'}]});
  if(state.character.fightingStyle==='Protection')actions.push({name:'Protection',tag:'Fighting Style · Reaction',text:'While wielding a shield, impose disadvantage on an attack against an adjacent creature you can see.',buttons:[]});
  if(state.character.fightingStyle==='Superior Technique'){
    const maneuver=state.character.superiorTechniqueManeuver;
    const maneuverText={
      'Precision Attack':'Spend the d6 after an attack roll to add it to the roll.',
      'Trip Attack':`On a weapon hit, spend the d6 to add it to damage; the target saves against DC ${formationSaveDC()} or falls Prone.`,
      'Pushing Attack':`On a weapon hit, spend the d6 to add it to damage; the target saves against DC ${formationSaveDC()} or is pushed up to 15 feet.`,
      'Rally':`As a Bonus Action, spend the d6; an ally gains the roll + ${Math.max(0,effectiveMod('cha'))} temporary HP.`
    };
    actions.push({name:`Superior Technique: ${maneuver}`,tag:'Fighting Style · 1 die/rest',text:maneuverText[maneuver],buttons:[{type:'superiorTechnique',label:state.resources.superiorTechniqueCurrent?'Spend d6':'Die spent'}]});
  }
  if(hasFeat('Heavy Armor Master'))actions.push({name:'Heavy Armor Master',tag:'Feat · Passive',text:`While wearing heavy armour, reduce nonmagical bludgeoning, piercing or slashing damage by ${p}.`,buttons:[{type:'roll',label:'Damage reduction',formula:String(p),desc:'Heavy Armor Master reduction'}]});
  if(hasFeat('Shield Master'))actions.push({name:'Shield Master',tag:'Feat · Bonus Action / Reaction',text:'After attacking, use a Bonus Action to shove a creature within 5 feet with your shield. Add the feat’s defensive benefits to applicable Dexterity saves.',buttons:[]});
  if(hasFeat('Inspiring Leader'))actions.push({name:'Inspiring Leader',tag:'Feat · Short/Long Rest',text:`Grant ${inspiringLeaderTempHP()} temporary HP to the cohort and eligible allies after a 10-minute speech.`,buttons:[{type:'inspiringLeader',label:state.resources.inspiringLeaderAvailable?`Grant ${inspiringLeaderTempHP()} temp HP`:'Already used'}]});
  if(hasFeat('Lucky'))actions.push({name:'Lucky',tag:'Feat · Luck Points',text:`Spend a Luck Point to reroll an eligible d20 test. ${state.resources.luckyCurrent}/${luckyMax()} points remain.`,buttons:[{type:'lucky',label:state.resources.luckyCurrent?'Spend Luck Point':'No points'}]});
  if(secondaryStanceKey()) actions.push({name:'Secondary Stance',tag:'Perfect Formation',text:secondaryBenefitText(secondaryStanceKey()),buttons:[]});

  const grid=document.getElementById('actionGrid');grid.innerHTML='';
  actions.forEach(action=>{const card=document.createElement('div');card.className=`action-card${action.style?` ${action.style}`:''}`;if(action.disabled)card.style.opacity='.52';card.innerHTML=`<div class="action-top"><h3>${action.name}</h3><span class="action-tag">${action.tag}</span></div><p>${action.text}</p><div class="action-buttons"></div>`;const buttons=card.querySelector('.action-buttons');(action.buttons||[]).forEach(b=>{let btn;if(b.type==='commandRoll')btn=makeCommandRollButton(b.label,b.formula,b.desc,action.disabled);else if(b.type==='commandSpend')btn=makeCommandSpendButton(b.label,b.desc,action.disabled);else if(b.type==='special'){btn=document.createElement('button');btn.type='button';btn.textContent=b.label;btn.disabled=action.disabled;btn.addEventListener('click',useLastStand);}else if(b.type==='megaBreakthrough'){btn=document.createElement('button');btn.type='button';btn.textContent=b.label;btn.disabled=Boolean(action.disabled||b.disabled);btn.addEventListener('click',useWingedBreakthrough);}else if(b.type==='megaAegis'){btn=document.createElement('button');btn.type='button';btn.textContent=b.label;btn.addEventListener('click',toggleAegis);}else if(b.type==='superiorTechnique'){btn=document.createElement('button');btn.type='button';btn.textContent=b.label;btn.disabled=action.disabled||state.resources.superiorTechniqueCurrent<=0;btn.addEventListener('click',()=>{state.resources.superiorTechniqueCurrent=0;rollAndDisplay('1d6',state.character.superiorTechniqueManeuver);renderAll();scheduleSave();});}else if(b.type==='inspiringLeader'){btn=document.createElement('button');btn.type='button';btn.textContent=b.label;btn.disabled=action.disabled||!state.resources.inspiringLeaderAvailable;btn.addEventListener('click',()=>{state.character.tempHP=Math.max(state.character.tempHP,inspiringLeaderTempHP());state.resources.inspiringLeaderAvailable=false;renderAll();scheduleSave();showToast('Inspiring Leader temporary HP applied.');});}else if(b.type==='lucky'){btn=document.createElement('button');btn.type='button';btn.textContent=b.label;btn.disabled=action.disabled||state.resources.luckyCurrent<=0;btn.addEventListener('click',()=>{state.resources.luckyCurrent--;renderAll();scheduleSave();showToast('Luck Point spent.');});}else btn=makeRollButton(b.label,b.formula,b.desc,action.disabled);buttons.appendChild(btn);});grid.appendChild(card);});
  document.getElementById('attackSummary').textContent=`Attack ${fmt(attack)} · ${fighterAttacks()} / action · DC ${formationSaveDC()}${mega?' · Mega Unison':''}`;
}

function renderDynamic(){
  const stance=primaryStance(),p=prof(),mega=megaActive(),megaAC=mega?1:0,aegisAC=mega&&state.mega.aegisActive?2:0,styleAC=fightingStyleACBonus();
  const ac=Number(state.character.baseAC)+styleAC+(stance?.ac||0)+megaAC+aegisAC;
  const speed=mega?30:Math.max(0,Number(state.character.baseSpeed)+featSpeedBonus()+(stance?.speed||0));
  const initiative=effectiveMod('dex')+Number(state.character.initiativeBonus||0)+featInitiativeBonus();
  const perceptionRank=effectiveSkillRank('Perception'),passive=10+effectiveMod('wis')+p*perceptionRank;
  document.getElementById('displayAC').textContent=ac;
  document.getElementById('acBreakdown').textContent=`Base ${state.character.baseAC}${styleAC?' · Defense +1':''}${stance?.ac?` · ${stance.name} ${fmt(stance.ac)}`:''}${mega?' · Mega +1':''}${aegisAC?' · Aegis +2':''}`;
  document.getElementById('displaySpeed').textContent=speed;
  const speedBreakdown=document.getElementById('speedBreakdown');if(speedBreakdown)speedBreakdown.textContent=mega?'feet · fly 30 ft (land at turn end)':featSpeedBonus()?'feet · Mobile +10':'feet';
  document.getElementById('displayInitiative').textContent=fmt(initiative);document.getElementById('displayProf').textContent=fmt(p);document.getElementById('passivePerception').textContent=passive;
  const primaryName=mega?'Mega Unison':stance?.name||'Phalanx Formation',secondaryName=!mega&&secondaryStanceKey()?` + ${stanceRules(secondaryStanceKey()).name}`:'';document.getElementById('displayStance').textContent=`${primaryName}${secondaryName}`;
  document.getElementById('currentHPDisplay').textContent=state.character.currentHP;document.getElementById('maxHPDisplay').textContent=state.character.maxHP;const hpPercent=Math.max(0,Math.min(1,state.character.currentHP/Math.max(1,state.character.maxHP)));document.getElementById('hpRing').style.setProperty('--hp-angle',`${hpPercent*360}deg`);
  const fState=formationState(),badge=document.getElementById('formationStateBadge');badge.textContent=fState;badge.style.color=fState==='Mega Unison'?'var(--gold-bright)':fState==='Complete'?'var(--gold-bright)':fState==='Reduced'?'var(--blue)':'var(--red-bright)';document.getElementById('activeStanceBadge').textContent=mega?'Mega Unison active':stance?`${stance.name} primary`:`${level()<3?'Unlocks at level 3':'Phalanx active'}`;
  const auto=Boolean(state.character.autoLevelStats);document.getElementById('maxHPInput').disabled=auto;document.getElementById('hitDiceMaxInput').disabled=auto;document.getElementById('maxHPHint').textContent=auto?`Fighter average: ${calculatedMaxHP()}`:'manual';
  renderMegaUnison();renderCommandResources();renderOverviewTroopers();renderSpeciesFeatures();renderFighterFeatures();renderActions();
}

function renderAll(){renderArtwork();renderAbilities();renderChecks();renderStances();renderTroopers();renderDynamic();syncBoundInputs();renderRollHistory();}

function applyFormationDamage(amount){amount=Math.max(0,Number(amount));const absorbed=Math.min(state.character.tempHP,amount);state.character.tempHP-=absorbed;amount-=absorbed;state.character.currentHP=Math.max(0,state.character.currentHP-amount);if(state.character.currentHP===0&&megaActive()){const previous=state.mega.previousStance;state.mega.active=false;state.mega.roundsRemaining=0;state.mega.aegisActive=false;state.mega.previousStance='';if(previous&&stanceAvailable(previous))state.formation.stance=previous;}}
function healFormation(amount){state.character.currentHP=Math.min(state.character.maxHP,state.character.currentHP+Math.max(0,Number(amount)));}
function parseAndRoll(formula){
  const cleaned=String(formula).replace(/\s+/g,'').toLowerCase();if(!cleaned)throw new Error('Enter a dice formula.');const tokens=cleaned.match(/[+-]?[^+-]+/g);if(!tokens)throw new Error('Invalid formula.');let total=0;const parts=[];
  for(let token of tokens){let sign=1;if(token[0]==='+')token=token.slice(1);else if(token[0]==='-'){sign=-1;token=token.slice(1);}const dice=token.match(/^(\d*)d(\d+)$/);if(dice){const count=Math.min(100,Number(dice[1]||1)),sides=Math.min(10000,Number(dice[2]));if(!count||!sides)throw new Error('Invalid dice.');const rolls=Array.from({length:count},()=>Math.floor(Math.random()*sides)+1),subtotal=rolls.reduce((a,b)=>a+b,0)*sign;total+=subtotal;parts.push(`${sign<0?'- ':''}${count}d${sides} [${rolls.join(', ')}]`);}else if(/^\d+$/.test(token)){total+=Number(token)*sign;parts.push(`${sign<0?'- ':'+ '}${token}`);}else throw new Error(`Could not read “${token}”.`);}return{total,detail:parts.join(' ')};
}
function rollAndDisplay(formula,label='Roll'){
  try{const result=parseAndRoll(formula),resultEl=document.getElementById('rollResult');resultEl.innerHTML=`<strong>${result.total}</strong><span>${escapeHtml(label)} · ${escapeHtml(formula)} · ${escapeHtml(result.detail)}</span>`;recordHistory(label,formula,result.total,result.detail);scheduleSave();}catch(err){showToast(err.message);}
}
function renderRollHistory(){const list=document.getElementById('rollHistory');if(!list)return;list.innerHTML='';state.rollHistory.forEach(r=>{const li=document.createElement('li');li.textContent=`${r.time} · ${r.label}: ${r.total} (${r.formula})`;list.appendChild(li);});}

function setupTabs(){document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>activateTab(tab.dataset.tab)));document.querySelectorAll('[data-goto]').forEach(btn=>btn.addEventListener('click',()=>activateTab(btn.dataset.goto)));}
function activateTab(id){document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===id));document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active',p.id===`tab-${id}`));const bar=document.querySelector('.tabbar');window.scrollTo({top:bar.offsetTop-78,behavior:'smooth'});}
function setupDice(){
  const quick=document.getElementById('quickDice');[4,6,8,10,12,20,100].forEach(s=>{const btn=document.createElement('button');btn.type='button';btn.textContent=`d${s}`;btn.addEventListener('click',()=>rollAndDisplay(`1d${s}`,`d${s}`));quick.appendChild(btn);});
  const adv=document.createElement('button');adv.type='button';adv.textContent='Adv';adv.addEventListener('click',()=>{const a=parseAndRoll('1d20'),b=parseAndRoll('1d20'),total=Math.max(a.total,b.total),detail=`kept ${total} from ${a.total} / ${b.total}`;document.getElementById('rollResult').innerHTML=`<strong>${total}</strong><span>Advantage · 2d20 keep highest · ${detail}</span>`;recordHistory('Advantage','2d20kh1',total,detail);scheduleSave();});quick.appendChild(adv);
  document.getElementById('customRollBtn').addEventListener('click',()=>rollAndDisplay(document.getElementById('customRoll').value,'Custom roll'));document.getElementById('customRoll').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('customRollBtn').click();});
  document.querySelector('[data-roll="initiative"]').addEventListener('click',()=>{if(level()>=18&&state.resources.commandDiceCurrent===0){state.resources.commandDiceCurrent=1;showToast('Perfect Formation restores one Command Die.');}rollAndDisplay(`1d20${fmt(effectiveMod('dex')+Number(state.character.initiativeBonus||0))}`,'Initiative');renderAll();scheduleSave();});
}
function setupControls(){
  document.getElementById('damageBtn').addEventListener('click',()=>{applyFormationDamage(document.getElementById('hpAmount').value);renderAll();scheduleSave();});document.getElementById('healBtn').addEventListener('click',()=>{healFormation(document.getElementById('hpAmount').value);renderAll();scheduleSave();});
  document.getElementById('shortRestBtn').addEventListener('click',()=>{const available=state.character.hitDiceRemaining,answer=prompt(`Spend how many Hit Dice? (${available} available)` ,available>0?'1':'0'),count=Math.max(0,Math.min(available,Number(answer||0)));let recovered=0;if(count){const formula=`${count}d10${fmt(effectiveMod('con')*count)}`,result=parseAndRoll(formula);recovered=result.total;healFormation(recovered);state.character.hitDiceRemaining-=count;recordHistory('Short-rest healing',formula,result.total,result.detail);}state.resources.commandDiceCurrent=commandDiceProfile().max;state.resources.superiorTechniqueCurrent=1;state.resources.inspiringLeaderAvailable=true;renderAll();scheduleSave();showToast(`Short Rest complete${count?`; recovered ${recovered} HP`:''}. Command Dice restored.`);});
  document.getElementById('longRestBtn').addEventListener('click',()=>{state.character.currentHP=state.character.maxHP;state.character.tempHP=0;state.character.hitDiceRemaining=Math.min(state.character.hitDiceMax,state.character.hitDiceRemaining+Math.max(1,Math.floor(state.character.hitDiceMax/2)));state.resources.commandDiceCurrent=commandDiceProfile().max;state.resources.superiorTechniqueCurrent=1;state.resources.luckyCurrent=luckyMax();state.resources.inspiringLeaderAvailable=true;state.resources.lastStandAvailable=true;state.resources.megaUsedThisLongRest=false;state.mega={active:false,roundsRemaining:0,previousStance:'',breakthroughAvailable:true,aegisActive:false};state.troopers.forEach(t=>{t.currentHP=t.maxHP;if(t.status==='downed')t.status='formed';if(t.status==='formed'){t.leader='The Brass';t.order='Form up';}});renderAll();scheduleSave();showToast('Long Rest completed.');});
  document.getElementById('printBtn').addEventListener('click',()=>window.print());document.getElementById('pdfBtn').addEventListener('click',exportPdf);document.getElementById('exportBtn').addEventListener('click',exportState);document.getElementById('talespireBtn').addEventListener('click',exportTaleSpireState);document.getElementById('importFile').addEventListener('change',importState);document.getElementById('resetBtn').addEventListener('click',()=>{if(confirm('Reset the entire sheet to its default character?')){state=defaultState();syncDerivedStats({preserveDamage:false});localStorage.removeItem(STORAGE_KEY);renderAll();scheduleSave();showToast('Sheet reset.');}});
}
function exportState(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${(state.character.name||'rankling-cohort').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.json`;a.click();URL.revokeObjectURL(url);showToast('Character exported.');}
function importState(event){const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{state=normaliseState(mergeDeep(defaultState(),JSON.parse(reader.result)));syncDerivedStats();renderAll();scheduleSave();showToast('Character imported.');}catch{showToast('That file is not valid character JSON.');}event.target.value='';};reader.readAsText(file);}

function exportPdf(){
  showToast('Choose “Save as PDF” in the print dialog.');
  window.print();
}
function buildTaleSpirePayload(){
  const primary=primaryStance();
  return {
    schema:'rankling-cohort.talespire.v1',
    exportedAt:new Date().toISOString(),
    identity:{
      name:state.character.name,
      player:state.character.player,
      species:state.character.species,
      class:state.character.className,
      subclass:state.character.subclass,
      level:level(),
      gender:state.character.artGender,
      background:state.character.background,
      fightingStyle:state.character.fightingStyle,levelChoices:state.character.levelChoices
    },
    stats:{
      ac:Number(document.getElementById('displayAC')?.textContent||state.character.baseAC),
      speed:Number(document.getElementById('displaySpeed')?.textContent||state.character.baseSpeed),
      initiative:effectiveMod('dex')+Number(state.character.initiativeBonus||0)+featInitiativeBonus(),
      proficiency:prof(),
      passivePerception:Number(document.getElementById('passivePerception')?.textContent||0),
      hp:{current:state.character.currentHP,max:state.character.maxHP,temp:state.character.tempHP},
      abilities:Object.fromEntries(abilities.map(key=>[key,effectiveAbility(key)])),
      saves:Object.fromEntries(abilities.map(key=>[key,effectiveSaveProficient(key)])),
      skills:Object.fromEntries(skills.map(([name])=>[name,effectiveSkillRank(name)]))
    },
    formation:{
      state:formationState(),
      primaryStance:primary?primary.name:'Phalanx Formation',
      secondaryStance:secondaryStanceKey()?stanceRules(secondaryStanceKey()).name:'',
      ward:state.formation.ward,
      commandDice:{current:state.resources.commandDiceCurrent,max:state.resources.commandDiceMax,die:state.resources.commandDie},
      heroicInspiration:state.character.heroicInspiration,
      megaUnison:{active:megaActive(),roundsRemaining:state.mega.roundsRemaining,usedThisLongRest:state.resources.megaUsedThisLongRest,breakthroughAvailable:state.mega.breakthroughAvailable,aegisActive:state.mega.aegisActive}
    },
    troopers:state.troopers.map((t,index)=>({
      id:t.id,name:t.name,status:t.status,leader:t.leader,order:t.order,weapon:t.weapon,shield:t.shield,
      personalHP:t.currentHP,personalMaxHP:t.maxHP,sharedChunk:trooperSharedSegment(index),ac:t.ac
    })),
    equipment:state.character.equipment,
    notes:state.character.notes,
    customFeatures:state.character.customFeatures
  };
}
function exportTaleSpireState(){
  const payload=buildTaleSpirePayload();
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;
  a.download=`${(state.character.name||'rankling-cohort').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.talespire.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('TaleSpire JSON exported.');
}

function init(){state=normaliseState(state);syncDerivedStats();bindInputs();setupTabs();setupDice();setupControls();setupArtworkEditor();renderAll();if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});}
document.addEventListener('DOMContentLoaded',init);
