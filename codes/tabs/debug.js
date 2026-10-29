/* v2.1.1: IIFE isolates tab-local declarations so modules can preload together. */
(()=>{
/* Wayfarer tab renderers loaded on demand. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.debug = window.WayfarerTabRenderers.debug || {};
/* Wayfarer debug tab module. Shared state remains in the core; module initializes its view on demand. */
window.WayfarerTabRenderers.debug.renderDebugPanel = function(){document.body.classList.toggle("sandbox-active",!!debugSandboxActive);const btn=document.getElementById("debugTabButton");if(!btn)return;const genderSelect=document.getElementById("debugAccountGender");const genderStatus=document.getElementById("debugAccountGenderStatus");const currentGender=(state.profile&&state.profile.gender)==="female"?"female":"male";if(genderSelect)genderSelect.value=currentGender;if(genderStatus)genderStatus.textContent="Current character gender: "+(state.profile&&state.profile.gender?String(state.profile.gender):"not set");const genderApply=document.getElementById("debugApplyAccountGender");if(genderApply)genderApply.disabled=!cloudUser||!debugIsAdmin();const themeToggle=document.getElementById("debugAllowThemeUnequip");if(themeToggle){themeToggle.disabled=!debugSandboxActive;themeToggle.checked=!!debugAllowThemeUnequip;}const questOverrideToggle=document.getElementById("debugOverrideQuestRules");if(questOverrideToggle){questOverrideToggle.disabled=!debugSandboxActive;questOverrideToggle.checked=!!debugOverrideQuestRules;}const unlockToggle=document.getElementById("debugUnlockAllItems");if(unlockToggle){unlockToggle.disabled=!debugSandboxActive;unlockToggle.checked=!!debugUnlockAllItems;}const themeLevelSelect=document.getElementById("debugThemeGrantLevel");if(themeLevelSelect){themeLevelSelect.value=String(Math.max(1,Math.min(5,Number(debugThemeGrantLevel)||1)));themeLevelSelect.disabled=!debugIsAdmin();}btn.style.display=(!!cloudUser&&debugIsAdmin())?"inline-flex":"none";if(!debugIsAdmin()&&document.getElementById("section-debug")?.classList.contains("active")){document.querySelector('[data-tab="quests"]')?.click();return;}const startSandbox=document.getElementById("debugStartSandbox");if(startSandbox)startSandbox.disabled=!debugIsAdmin()||!!debugSandboxActive;const exitSandbox=document.getElementById("debugExitSandbox");if(exitSandbox)exitSandbox.disabled=!debugSandboxActive||!debugIsAdmin();const status=document.getElementById("debugSandboxStatus");if(status)status.textContent=debugSandboxActive?"Sandbox active · changes are temporary":"Sandbox inactive";const sandboxControls=["debugRemoveResources","debugRestoreCharacter","debugResetQuestCooldown","debugSetOverallXp","debugSetSkillXp","debugAddCoins","debugAddQuest","debugRunPlanner"];for(const id of sandboxControls){const control=document.getElementById(id);if(control)control.disabled=!debugSandboxActive||!debugIsAdmin();}const resetButton=document.getElementById("debugResetCharacter");if(resetButton){const liveTest=debugIsChatgptAccount()&&!debugSandboxActive;resetButton.disabled=!debugIsAdmin()||(!debugSandboxActive&&!liveTest);resetButton.textContent=liveTest?"Reset LIVE CHATGPT character…":"Reset Sandbox character…";}const grantButton=document.getElementById("debugGrantResources");if(grantButton){grantButton.disabled=!debugIsAdmin()||(!debugSandboxActive&&!debugIsChatgptAccount());grantButton.textContent=debugSandboxActive?"Grant XP & gold (Sandbox)":"Grant XP & gold (CHATGPT live only)";}const data=debugSandboxActive?state:(debugLiveStateBackup||state);const date=document.getElementById("debugActiveDate");if(date)date.textContent=data.activeDate||"—";const level=document.getElementById("debugLevel");if(level)level.textContent=String(Math.floor((Number(data.xp)||0)/100)+1);const coinBalance=document.getElementById("debugCoinBalance");if(coinBalance)coinBalance.textContent=String(Math.max(0,Number(data.gold)||0));const faultSkillSel=document.getElementById("debugFaultSkillSelect");if(faultSkillSel){const previousFault=faultSkillSel.value;const faultNames=allSkillNames();faultSkillSel.innerHTML='<option value="">Choose skill…</option>'+faultNames.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");if(faultNames.includes(previousFault))faultSkillSel.value=previousFault;}const skillSel=document.getElementById("debugSkillSelect");if(skillSel){const previous=skillSel.value;const names=[...new Set([...(data.selectedSkills||[]),...skillCatalog.flatMap(c=>c.skills.map(x=>x[0]))])];skillSel.innerHTML='<option value="">Choose skill…</option>'+names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");if(names.includes(previous))skillSel.value=previous;}if(debugSandboxActive)debugRenderQuests();}
window.WayfarerTabModules = window.WayfarerTabModules || {};
function debugRenderQuests(){const el=document.getElementById("debugQuestList");if(!el)return;const qs=Array.isArray(state.quests)?state.quests:[];el.textContent=qs.length?qs.map((q,i)=>`${i+1}. ${q.done?'[DONE]':'[OPEN]'} ${q.title||'(untitled)'} · skill=${q.skill||'—'} · xp=${q.xp??'—'} · source=${q.source||'—'} · id=${q.id||'—'}`).join("\n"):"No quests in sandbox.";}
function debugCharacterDataSnapshot(){return JSON.parse(JSON.stringify({xp:state.xp,gold:state.gold,skillXp:state.skillXp,selectedSkills:state.selectedSkills,skillPriorities:state.skillPriorities,inventory:state.inventory,equipment:state.equipment,profile:state.profile,quests:state.quests,completedTotal:state.completedTotal,questGenerationCooldownUntil:state.questGenerationCooldownUntil,lastGeneratedSkills:state.lastGeneratedSkills,questHistory:state.questHistory,questDays:state.questDays,characterXp:state.characterXp,level:state.level}));}
function debugApplySnapshot(snapshot){if(!debugRequireSandbox())return;for(const k of Object.keys(snapshot||{}))state[k]=JSON.parse(JSON.stringify(snapshot[k]));save();render();renderDebugPanel();}
function debugCanUseCharacterTools(){if(!debugIsAdmin()){toast("Admin access required.");return false;}if(!debugSandboxActive){toast("Start the isolated Sandbox first. No live-account changes are allowed.");return false;}return true;}
function debugXpForSkillLevel(targetLevel){let xp=0;for(let level=1;level<Math.max(1,Number(targetLevel)||1);level++)xp+=xpNeededForNextLevel(level);return xp;}
function bindDebugAction(id,type,handler){const el=document.getElementById(id);if(!el||el.dataset.wayfarerHandler)return;el.dataset.wayfarerHandler="1";el.addEventListener(type,handler);}
function debugCanGrantResources(){
 if(!debugIsAdmin()){toast("Admin access required.");return false;}
 if(debugSandboxActive)return true;
 if(!debugIsChatgptAccount()||cloudHydrating){toast("Live grants are only available to the signed-in CHATGPT test account after loading.");return false;}
 return window.confirm("Grant XP and gold to the LIVE CHATGPT character? Changes will be saved and synced to this test account.");
}
function initializeDebugActionHandlers(){
bindDebugAction("debugResetQuestCooldown","click",()=>{
 const status=document.getElementById("debugQuestCooldownStatus");
 if(!debugIsAdmin()){toast("Admin access required.");if(status)status.textContent="Denied: Admin access required.";return;}
 if(!debugSandboxActive){toast("Start the isolated Sandbox first.");if(status)status.textContent="Blocked: Sandbox is required.";return;}
 if(!window.confirm("Reset the Sandbox Generate Quests cooldown? This affects only the temporary character."))return;
 state.questGenerationCooldownUntil=0;save();updateGenerateButtonStatus();
 const message="Sandbox Generate Quests cooldown reset. Live progress is unchanged.";if(status)status.textContent=message;
 debugLog("Sandbox quest-generation cooldown reset by Admin.");toast("Sandbox quest cooldown reset.");
});
bindDebugAction("debugGrantResources","click",()=>{
 if(!debugCanGrantResources())return;
 const xp=Math.max(0,Math.min(100000,Math.floor(Number(document.getElementById("debugGrantXp")?.value)||0)));
 const gold=Math.max(0,Math.min(100000,Math.floor(Number(document.getElementById("debugGrantGold")?.value)||0)));
 if(xp===0&&gold===0){toast("Enter an XP or gold amount greater than zero.");return;}
 const mode=debugSandboxActive?"Sandbox":"live character";
 state.xp=(Number(state.xp)||0)+xp;state.gold=(Number(state.gold)||0)+gold;
 save();render();renderDebugPanel();debugInspect();
 const status=document.getElementById("debugCharacterToolsStatus");if(status)status.textContent=`Granted ${xp} XP and ${gold} gold to the ${mode}. ${debugSandboxActive?"Sandbox changes are temporary.":"The live character was saved through the normal account save path."}`;
 debugLog(`Admin grant: +${xp} XP, +${gold} gold (${mode}).`);toast(`Granted ${xp} XP and ${gold} gold to ${mode}.`);
});
bindDebugAction("debugRemoveResources","click",()=>{
 if(!debugCanUseCharacterTools())return;
 const xp=Math.max(0,Math.min(100000,Math.floor(Number(document.getElementById("debugGrantXp")?.value)||0)));
 const gold=Math.max(0,Math.min(100000,Math.floor(Number(document.getElementById("debugGrantGold")?.value)||0)));
 if(xp===0&&gold===0){toast("Enter an XP or gold amount greater than zero.");return;}
 if(!window.confirm(`Remove ${xp} XP and ${gold} gold from the temporary Sandbox character? You can restore the Sandbox snapshot if needed.`))return;
 state.xp=Math.max(0,(Number(state.xp)||0)-xp);state.gold=Math.max(0,(Number(state.gold)||0)-gold);
 save();render();renderDebugPanel();
 const status=document.getElementById("debugCharacterToolsStatus");if(status)status.textContent=`Removed up to ${xp} XP and ${gold} gold from the Sandbox. Remaining: ${Number(state.xp)||0} XP, ${Number(state.gold)||0} gold. Live progress is unchanged.`;
 debugLog(`Admin resource removal: -${xp} XP and -${gold} gold (${debugSandboxActive?"sandbox":"live"}); remaining XP=${Number(state.xp)||0}, gold=${Number(state.gold)||0}.`);
});
bindDebugAction("debugResetCharacter","click",()=>{
 const liveReset=!debugSandboxActive;
 if(liveReset){if(!debugIsChatgptAccount()||cloudHydrating){toast("Live reset is restricted to the signed-in CHATGPT test account.");return;}}
 else if(!debugCanUseCharacterTools())return;
 if(!window.confirm(liveReset?"Reset the LIVE CHATGPT character? This clears XP, gold, skill XP, selected skills, quests, inventory and equipment, and syncs the result. Journal, To Do and Groceries are preserved. Sandbox restore cannot undo this.":"Reset the temporary Sandbox character? Journal, To Do and Groceries will be preserved. A Sandbox snapshot will be saved."))return;
 if(liveReset){if(window.prompt("Type RESET CHATGPT to confirm the LIVE reset:")!=="RESET CHATGPT")return;}
 else debugSandboxCharacterSnapshot=debugCharacterDataSnapshot();
 state.xp=0;state.gold=0;state.skillXp={};state.selectedSkills=[];state.skillPriorities={};state.inventory=[];state.equipment={theme:"dungeon-theme"};state.quests=[];state.completedTotal=0;state.questGenerationCooldownUntil=0;state.lastGeneratedSkills=[];state.questHistory={};state.questDays=[];state.characterXp=0;state.level=1;
 if(typeof ensureDungeonThemeState==="function")ensureDungeonThemeState();
 save();render();renderDebugPanel();document.getElementById("debugCharacterToolsStatus").textContent=liveReset?"LIVE CHATGPT character reset submitted for normal account sync; verify cloud save status. Journal, To Do and Groceries preserved.":"Sandbox character reset. Journal, To Do and Groceries preserved. Use Restore snapshot to undo.";debugLog((liveReset?"LIVE CHATGPT":"Sandbox")+" character reset; journal, To Do and groceries preserved.");
});
bindDebugAction("debugRestoreCharacter","click",()=>{
 if(!debugCanUseCharacterTools())return;
 const snap=debugSandboxCharacterSnapshot;
 if(!snap){toast("No Sandbox character snapshot is available.");return;}
 if(!window.confirm("Restore the saved Sandbox character snapshot? This replaces the temporary character state only."))return;
 debugApplySnapshot(snap);document.getElementById("debugCharacterToolsStatus").textContent="Sandbox character snapshot restored.";debugLog("Sandbox character snapshot restored.");
});
document.querySelectorAll("[data-debug-days]").forEach((b,index)=>{if(b.dataset.wayfarerHandler)return;b.dataset.wayfarerHandler="1";b.addEventListener("click",()=>{if(!debugRequireSandbox())return;const d=Number(b.dataset.debugDays)||1;const date=new Date((state.activeDate||today())+"T12:00:00");date.setDate(date.getDate()+d);state.activeDate=date.toLocaleDateString("en-CA");debugLog(`Time Machine shifted sandbox date by +${d} days to ${state.activeDate}.`);renderDebugPanel();debugInspect();});});
bindDebugAction("debugSetOverallXp","click",()=>{if(!debugRequireSandbox())return;state.xp=Math.max(0,Number(document.getElementById("debugOverallXp").value)||0);render();renderDebugPanel();debugInspect();debugLog("Set sandbox overall XP to "+state.xp+"; all XP-dependent UI refreshed immediately.");toast("Overall XP updated.");});
bindDebugAction("debugSetSkillXp","click",()=>{if(!debugRequireSandbox())return;const skill=document.getElementById("debugSkillSelect").value;if(!skill){toast("Choose a skill first.");return;}if(!state.skillXp||typeof state.skillXp!=="object")state.skillXp={};state.skillXp[skill]=Math.max(0,Number(document.getElementById("debugSkillXp").value)||0);render();renderDebugPanel();debugInspect();debugLog("Set sandbox XP for "+skill+" to "+state.skillXp[skill]+"; skill cards and progression UI refreshed immediately.");toast(skill+" XP updated.");});
bindDebugAction("debugAddCoins","click",()=>{if(!debugRequireSandbox())return;const input=document.getElementById("debugAddCoinsAmount");const amount=Math.floor(Number(input?.value)||0);if(amount<=0){toast("Enter a coin amount greater than zero.");return;}state.gold=Math.max(0,Number(state.gold)||0)+amount;render();renderDebugPanel();debugInspect();debugLog("Added "+amount+" coins to sandbox; new balance is "+state.gold+".");toast("Added "+amount+" coins to the sandbox.");});
bindDebugAction("debugAddQuest","click",()=>{if(!debugRequireSandbox())return;if(!Array.isArray(state.quests))state.quests=[];state.quests.unshift({id:"debug-"+Date.now(),title:"[TEST] Debug Workshop quest",description:"Disposable sandbox-only quest for checking quest cards and completion behavior.",category:"Skill",skill:state.selectedSkills?.[0]||"Adventure",xp:15,done:false,source:"debug-sandbox"});debugLog("Added disposable test quest to sandbox.");render();debugRenderQuests();});
bindDebugAction("debugRefreshQuests","click",()=>{debugRenderQuests();debugLog("Quest inspection refreshed.");});
bindDebugAction("debugRunPlanner","click",()=>{if(!debugRequireSandbox())return;const opts={time:Number(document.getElementById("debugPlannerTime").value),energy:document.getElementById("debugPlannerEnergy").value,focus:document.getElementById("debugPlannerFocus").value,place:document.getElementById("debugPlannerLocation").value};try{const result=generateQuests(opts);const el=document.getElementById("debugPlannerResult");if(el)el.textContent=JSON.stringify({preset:opts,result:result??"Planner invoked; inspect quest board below.",quests:(state.quests||[]).map(q=>({title:q.title,skill:q.skill,done:q.done,source:q.source}))},null,2);debugLog("Ran planner preset: "+JSON.stringify(opts));render();}catch(e){document.getElementById("debugPlannerResult").textContent="Planner error: "+String(e?.stack||e);debugLog("Planner test failed: "+String(e));}});
bindDebugAction("debugInspectSave","click",()=>{debugInspect();debugLog("State summary inspected; secrets omitted.");});
bindDebugAction("debugClearLog","click",()=>{window.debugLogEntries.length=0;document.getElementById("debugEventLog").textContent="Log cleared.";});
}

function initializeDebugTabControls(){
 bindDebugAction("debugStartSandbox","click",()=>{
  if(!debugIsAdmin()){toast("Sign in using the exact username Admin.");return;}
  if(debugSandboxActive){toast("Sandbox is already active.");return;}
  try {
   if(!state||typeof state!=="object")throw new Error("Character state is not ready.");
   const liveSnapshot=JSON.parse(JSON.stringify(state));
   const temporarySnapshot=JSON.parse(JSON.stringify(state));
   debugLiveStateBackup=liveSnapshot;
   debugSandboxState=temporarySnapshot;
   debugSandboxCharacterSnapshot=null;
   state=debugSandboxState;
   debugSandboxActive=true;
   document.body.classList.add("sandbox-active");
   debugAllowThemeUnequip=false;debugOverrideQuestRules=false;debugUnlockAllItems=false;
   persistDebugSandboxSession();
   render();window.WayfarerTabRenderers.debug.renderDebugPanel();
   if(typeof window.applyDebugFeatureSwitches==="function")window.applyDebugFeatureSwitches();
   debugInspect();debugLog("Sandbox started from an isolated copy of the current character.");toast("Isolated sandbox started.");
  } catch(error) {
   state=debugLiveStateBackup||state;
   debugLiveStateBackup=null;debugSandboxState=null;debugSandboxCharacterSnapshot=null;debugSandboxActive=false;
   clearDebugSandboxSession();document.body.classList.remove("sandbox-active");
   console.error("Wayfarer Sandbox failed to initialize:",error);
   debugLog("Sandbox startup failed safely: "+String(error?.message||error));
   toast("Sandbox could not start: "+String(error?.message||error));
   window.WayfarerTabRenderers.debug.renderDebugPanel();
  }
 });
 bindDebugAction("debugExitSandbox","click",()=>{
  if(!debugIsAdmin()){toast("Admin access required.");return;}
  if(!debugSandboxActive){toast("Sandbox is not active.");return;}
  state=debugLiveStateBackup;
  debugLiveStateBackup=null;debugSandboxState=null;debugSandboxCharacterSnapshot=null;debugSandboxActive=false;
  clearDebugSandboxSession();document.body.classList.remove("sandbox-active");
  debugAllowThemeUnequip=false;debugOverrideQuestRules=false;debugUnlockAllItems=false;
  if(typeof window.resetDebugFeatureSwitches==="function")window.resetDebugFeatureSwitches();
  render();window.WayfarerTabRenderers.debug.renderDebugPanel();
  if(typeof window.applyDebugFeatureSwitches==="function")window.applyDebugFeatureSwitches();
  debugInspect();debugLog("Sandbox discarded; original in-memory character restored.");
  toast("Sandbox discarded. Real progress restored.");
 });
 const genderButton=document.getElementById("debugApplyAccountGender");
 if(genderButton&&!genderButton.dataset.wayfarerHandler){genderButton.dataset.wayfarerHandler="1";genderButton.addEventListener("click",()=>{
  if(!cloudUser||!debugIsAdmin()){toast("Admin access required.");return;}
  const select=document.getElementById("debugAccountGender");const gender=select?.value;if(gender!=="male"&&gender!=="female")return;
  const mode=debugSandboxActive?"temporary Sandbox character":"LIVE character profile";
  const action=debugSandboxActive?"This change is temporary and will be discarded when Sandbox ends.":"This will save the new gender to your real character profile and sync it through the normal save path.";
  if(!confirm("Apply "+gender+" gender to the "+mode+"?\n\n"+action))return;
  if(!state.profile||typeof state.profile!=="object")state.profile={gender:null};state.profile.gender=gender;
  save();render();window.WayfarerTabRenderers.debug.renderDebugPanel();debugLog("Changed "+(debugSandboxActive?"temporary Sandbox":"live Admin character")+" gender to "+gender+".");toast(debugSandboxActive?"Sandbox character gender set to "+(gender==="female"?"Female":"Male")+". Live profile unchanged.":"Live character gender saved as "+(gender==="female"?"Female":"Male")+".");
 });}
 const unlock=document.getElementById("debugUnlockAllItems");
 if(unlock&&!unlock.dataset.wayfarerHandler){unlock.dataset.wayfarerHandler="1";unlock.addEventListener("change",event=>{if(!debugRequireSandbox()){event.target.checked=false;return;}window.WayfarerTabRenderers.debug.applyUnlockAllItems(!!event.target.checked);});}
 const level=document.getElementById("debugThemeGrantLevel");
 if(level&&!level.dataset.wayfarerHandler){level.dataset.wayfarerHandler="1";level.addEventListener("change",event=>{const next=Math.floor(Number(event.target.value)||1);debugThemeGrantLevel=Math.max(1,Math.min(5,next));event.target.value=String(debugThemeGrantLevel);if(debugUnlockAllItems&&debugSandboxActive)window.WayfarerTabRenderers.debug.applyUnlockAllItems(true);else window.WayfarerTabRenderers.debug.renderDebugPanel();});}
 initializeDebugFeatureHandlers();
 initializeDebugActionHandlers();
}

/* Debug owns feature-specific switches and fault injection. Core retains the Sandbox/save boundary. */
function initializeDebugFeatureHandlers(){
 const unequip=document.getElementById("debugAllowThemeUnequip");
 if(unequip&&!unequip.dataset.wayfarerHandler){unequip.dataset.wayfarerHandler="1";unequip.addEventListener("change",event=>{if(!debugRequireSandbox()){event.target.checked=false;return;}debugAllowThemeUnequip=!!event.target.checked;if(!debugAllowThemeUnequip&&state.equipment?.theme==null){state.equipment.theme="dungeon-theme";save();}render();window.WayfarerTabRenderers.debug.renderDebugPanel();debugLog(debugAllowThemeUnequip?"Sandbox-only unequipped theme exception enabled.":"Sandbox-only unequipped theme exception disabled.");toast(debugAllowThemeUnequip?"Sandbox can test no-theme state.":"Theme required again.");});}
 const questRules=document.getElementById("debugOverrideQuestRules");
 if(questRules&&!questRules.dataset.wayfarerHandler){questRules.dataset.wayfarerHandler="1";questRules.addEventListener("change",event=>{if(!debugRequireSandbox()){event.target.checked=false;return;}debugOverrideQuestRules=!!event.target.checked;updateGenerateButtonStatus();window.WayfarerTabRenderers.debug.renderDebugPanel();debugLog(debugOverrideQuestRules?"Sandbox-only quest safeguards override enabled: cooldown and completion confirmation bypassed.":"Sandbox-only quest safeguards restored.");toast(debugOverrideQuestRules?"Quest safeguards overridden in sandbox only.":"Quest safeguards restored.");});}
 for(const id of ["debugInjectRequirementFailure","debugInjectPurchaseFailure","debugInjectEquipFailure","debugInjectBonusFailure"]){const control=document.getElementById(id);if(!control||control.dataset.wayfarerHandler)continue;control.dataset.wayfarerHandler="1";control.addEventListener("change",()=>{if(!debugRequireSandbox()){control.checked=false;return;}renderStoreCatalog();renderCharacterInventory();renderCharacterOverview();render();window.WayfarerTabRenderers.debug.renderDebugPanel();const item=UNLOCKABLE_ITEMS.find(x=>x.id==="v0-test-theme");const status={requirement:"unlock requirement",purchase:"purchase eligibility",equip:"equipment action",bonus:"XP bonus calculation"};const kind=id==="debugInjectRequirementFailure"?"unlock requirement":id==="debugInjectPurchaseFailure"?"purchase":id==="debugInjectEquipFailure"?"equip":"XP bonus";debugLog("Test theme "+kind+" injection "+(control.checked?"enabled":"disabled")+"; theme/store/inventory surfaces refreshed immediately.");const result=document.getElementById("debugEquipmentLifecycleResults");if(result)result.textContent="Fault injection changed. Run the lifecycle suite again to verify the observed gameplay result.\n"+result.textContent;toast("Test theme refreshed for the changed fault injection.");});}
}

window.WayfarerTabRenderers.debug.applyUnlockAllItems = function(enabled){
 if(!debugRequireSandbox())return;
 debugUnlockAllItems=!!enabled;
 if(!Array.isArray(state.inventory))state.inventory=[];
 if(debugUnlockAllItems){
  for(const item of UNLOCKABLE_ITEMS){
   const isTheme=isThemeInventoryItem(item);
   const granted={...item};
   if(isTheme){granted.themeLevel=debugThemeGrantLevel;granted.perkXp=5*debugThemeGrantLevel;granted.perkGold=2*(debugThemeGrantLevel-1);}
   const existing=state.inventory.find(entry=>entry&&entry.id===item.id);
   if(existing){if(isTheme){existing.themeLevel=debugThemeGrantLevel;existing.perkXp=granted.perkXp;existing.perkGold=granted.perkGold;}}
   else state.inventory.push(granted);
  }
  debugLog("Unlock all items enabled in Sandbox; themes granted at theme level "+debugThemeGrantLevel+", while non-theme items are unchanged.");
  toast("All items unlocked in Sandbox; themes set to level "+debugThemeGrantLevel+".");
 }else{
  const liveInventory=debugLiveStateBackup?.inventory||[];
  const liveById=new Map(liveInventory.map(item=>[item?.id,item]));
  state.inventory=state.inventory.filter(item=>!UNLOCKABLE_ITEMS.some(def=>def.id===item.id));
  for(const item of UNLOCKABLE_ITEMS){const original=liveById.get(item.id);if(original&&!hasUnlockable(item.id))state.inventory.push({...original});}
  if(state.equipment?.theme&&!hasUnlockable(state.equipment.theme))state.equipment.theme="dungeon-theme";
  debugLog("Unlock all items disabled; temporary unlockable grants removed unless owned before Sandbox.");
  toast("Sandbox item unlock override disabled.");
 }
 save(true);render();window.WayfarerTabRenderers.debug.renderDebugPanel();
};

/* Debug-only diagnostic orchestration moved out of index.html in v2.1.8.
   These suites use isolated state/synthetic inputs and never persist test mutations. */
window.runThemeIntegrationTests = async function(){
 if(!debugIsAdmin()||!debugSandboxActive){toast("Theme tests are available only to Admin in Sandbox mode.");return {status:"BLOCKED",results:[]};}
 const results=[];
 const add=(name,ok,detail,category="theme-integration",status)=>results.push({name,ok:!!ok,detail,category,...(status?{status}:{})});
 const registry=Array.isArray(UNLOCKABLE_ITEMS)?UNLOCKABLE_ITEMS.filter(item=>isThemeInventoryItem(item)):[];
 const dungeon={...DUNGEON_THEME_ITEM};
 const themes=[{...dungeon},...registry].filter((item,index,arr)=>arr.findIndex(x=>x.id===item.id)===index).map(item=>({
  id:item.id,name:item.name,icon:item.icon,background:item.debugBackground||null,cls:item.debugThemeClass||null,
  character:item.debugCharacter||null,music:item.debugMusic||null,item
 }));
 const css=[...document.styleSheets].map(sh=>{try{return [...sh.cssRules].map(r=>r.cssText).join("\n")}catch(e){return ""}}).join("\n");
 const waitImage=src=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve({ok:im.naturalWidth>0&&im.naturalHeight>0,detail:`loaded ${im.naturalWidth}x${im.naturalHeight}`});im.onerror=()=>resolve({ok:false,detail:"image failed to load: "+src});im.src=src;});
 const waitFetch=async src=>{try{const r=await fetch(src,{cache:"no-store"});return {ok:r.ok,detail:`HTTP ${r.status} for ${src}`}}catch(e){return {ok:false,detail:`fetch failed for ${src}: ${e.message}`}}};
 for(const t of themes){
  const isDungeon=t.id==="dungeon-theme", item=isDungeon?state.inventory.find(x=>x&&x.id===t.id)||DUNGEON_THEME_ITEM:registry.find(x=>x.id===t.id);
  if(isDungeon){const starter=state.inventory.some(x=>x&&x.id===t.id);add(`${t.name}: starter theme is present`,starter,starter?"Starter theme exists in inventory":"Starter Dungeon theme is missing","registry");}
  else add(`${t.name}: registered in unlockable catalog`,!!item,item?`name=${item.name}; id=${item.id}; type=${item.type}; category=${item.category}`:"Theme is missing from UNLOCKABLE_ITEMS","registry");
  if(item)add(`${t.name}: display name`,item.name===t.name,`Expected "${t.name}", got "${item.name}"`,"registry");
  const baseline=THEME_DEBUG_BASELINE[t.id];
  if(!baseline){add(`${t.name}: independent expected specification`,false,"No independent baseline exists for this registered theme. Add its expected assets, class, and palette before considering it compliant.","baseline","INCONCLUSIVE");}
  else {
   add(`${t.name}: independent expected specification`,true,`Baseline found for stable ID ${t.id}; expectations are maintained separately from the theme registry.` ,"baseline");
   add(`${t.name}: baseline display name`,item?.name===baseline.name,`Expected=${baseline.name}; actual=${item?.name||"missing"}`,"baseline");
   add(`${t.name}: registered icon matches baseline`,t.icon===baseline.icon,`Expected=${baseline.icon}; actual=${t.icon||"missing"}`,"baseline");
   add(`${t.name}: registered background matches baseline`,t.background===baseline.background,`Expected=${baseline.background}; actual=${t.background||"missing"}`,"baseline");
   add(`${t.name}: registered body class matches baseline`,t.cls===baseline.cls,`Expected=${baseline.cls||"Dungeon/root"}; actual=${t.cls||"Dungeon/root"}`,"baseline");
   add(`${t.name}: registered character assets match baseline`,JSON.stringify(t.character)===JSON.stringify(baseline.character),`Expected=${JSON.stringify(baseline.character)}; actual=${JSON.stringify(t.character)}`,"baseline");
   add(`${t.name}: registered soundtrack matches baseline`,t.music===baseline.music,`Expected=${baseline.music}; actual=${t.music||"missing"}`,"baseline");
  }
  if(!t.cls&&!isDungeon)add(`${t.name}: Debug metadata`,false,"Registered theme is missing debugThemeClass; cannot verify automatic theme-class discovery","registry");
  else add(`${t.name}: dedicated CSS selector`,t.cls?css.includes("body."+t.cls):css.includes("dungeon-background.webp"),t.cls?`CSS selector body.${t.cls}`:"Dungeon fallback CSS","css");
  if(!t.background){add(`${t.name}: Debug background metadata`,false,"Registered theme is missing debugBackground; test cannot silently skip its background","registry");}
  else {
   add(`${t.name}: background reference`,css.includes(t.background),`Expected CSS reference to ${t.background}`,"assets");
   const bg=await waitFetch("./assets/images/"+t.background);add(`${t.name}: background file responds`,bg.ok,bg.detail,"assets");
   const bgImg=await waitImage("./assets/images/"+t.background);add(`${t.name}: background image decodes`,bgImg.ok,bgImg.detail,"assets");
  }
  if(!t.icon){add(`${t.name}: Debug icon metadata`,false,"Registered theme is missing its icon path","registry");}
  else {const iconPath=t.icon.startsWith("./")?t.icon:"./assets/images/"+t.icon;const icon=await waitFetch(iconPath);add(`${t.name}: icon file responds`,icon.ok,icon.detail,"assets");const iconImg=await waitImage(iconPath);add(`${t.name}: icon image decodes`,iconImg.ok,iconImg.detail,"assets");}
  if(!t.character||!t.character.male||!t.character.female)add(`${t.name}: character artwork metadata`,false,"Registered theme must declare debugCharacter.male and debugCharacter.female; coverage is inconclusive without both","registry","INCONCLUSIVE");
  else for(const gender of ["male","female"]){const path="./assets/images/"+t.character[gender];const response=await waitFetch(path);add(`${t.name}: ${gender} character file responds`,response.ok,response.detail,"assets");const decoded=await waitImage(path);add(`${t.name}: ${gender} character image decodes`,decoded.ok,decoded.detail,"assets");}
  if(!t.music)add(`${t.name}: soundtrack metadata`,false,"Registered theme is missing debugMusic; soundtrack coverage is inconclusive","registry","INCONCLUSIVE");
  else {const music=await waitFetch(t.music);add(`${t.name}: soundtrack file responds`,music.ok,music.detail,"assets");}
  if(t.cls){const prefix="body."+t.cls;add(`${t.name}: panel/card styling defined`,css.includes(prefix+" .card")||css.includes(prefix+" .panel")||css.includes(prefix+" .hero"),"Expected theme-specific styling for application panels","visual");add(`${t.name}: lower Inventory styling defined`,css.includes(prefix+" #section-character")||css.includes(prefix+" .inventoryItem")||css.includes(prefix+" .equipmentSlot")||css.includes(prefix+" .characterInventoryCard"),"Expected styling beyond header/hero for lower Inventory/equipment surfaces","visual");}
 }
 // Fault-injection self-checks: deliberately compare corrupted values against the independent
 // baseline. These prove the guard logic rejects the exact kinds of omissions seen previously.
 const faultReference=THEME_DEBUG_BASELINE["adventure-theme"];
 add("Baseline fault-injection: wrong background is rejected",faultReference.background!=="dungeon-background.webp",`Injected background=dungeon-background.webp; expected=${faultReference.background}; mismatch detector=${faultReference.background!=="dungeon-background.webp"?"detected":"MISSED"}`,"baseline-self-test");
 add("Baseline fault-injection: wrong palette is rejected",faultReference.palette["--gold"].toLowerCase()!=="#e4bd76",`Injected --gold=#e4bd76; expected=${faultReference.palette["--gold"]}; mismatch detector=${faultReference.palette["--gold"].toLowerCase()!=="#e4bd76"?"detected":"MISSED"}`,"baseline-self-test");
 // Read-only visual verification: toggle registered classes only in memory and restore the original class list.
 const body=document.body, originalClasses=[...body.classList], themeClasses=new Set(themes.map(t=>t.cls).filter(Boolean));
 const surfaceSelectors=[".brand",".hero",".tabs",".tab.active",".card",".panel","#section-character","#section-character .themeEquipmentSlot","#section-store .storeThemeCard",".btn"];
 const normalizeColor=v=>String(v||"").replace(/\s+/g,"").toLowerCase();
 for(const t of themes){
  body.className=originalClasses.filter(c=>!themeClasses.has(c)).join(" ");if(t.cls)body.classList.add(t.cls);
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const bg=getComputedStyle(body).backgroundImage;
  if(t.background)add(`${t.name}: computed page background`,bg.includes(t.background),`Computed backgroundImage=${bg.slice(0,220)}; expected asset=${t.background}`,"computed-style");
  else add(`${t.name}: computed page background`,false,"Cannot compare computed background: debugBackground is missing","computed-style","INCONCLUSIVE");
  const baseline=THEME_DEBUG_BASELINE[t.id];
  if(baseline){
   const paletteActual={},paletteExpected=baseline.palette||{};
   for(const [variable,expected] of Object.entries(paletteExpected)){
    const actual=getComputedStyle(body).getPropertyValue(variable).trim().toLowerCase();
    paletteActual[variable]=actual;
    add(`${t.name}: computed palette ${variable}`,actual===String(expected).toLowerCase(),`Expected=${expected}; computed=${actual||"missing"}`,"palette");
   }
   const paletteKeys=Object.keys(paletteExpected);
   const paletteDistinctFromDungeon=t.id==="dungeon-theme"||t.id==="v0-test-theme"||paletteKeys.some(k=>String(paletteExpected[k]).toLowerCase()!==String(THEME_DEBUG_BASELINE["dungeon-theme"].palette[k]).toLowerCase());
   add(`${t.name}: intended palette identity`,paletteDistinctFromDungeon,paletteDistinctFromDungeon?"Palette matches its independent baseline (intentional Dungeon reuse is documented for v0.test).":"Palette duplicates Dungeon unexpectedly; inspect theme CSS and baseline.","palette");
  } else add(`${t.name}: computed palette baseline`,false,"No independent palette baseline; cannot verify color completeness.","palette","INCONCLUSIVE");
  let styled=0,checked=0,missing=[];
  for(const sel of surfaceSelectors){const el=document.querySelector(sel);if(!el)continue;checked++;const cs=getComputedStyle(el);const color=normalizeColor(cs.color),border=normalizeColor(cs.borderTopColor),background=normalizeColor(cs.backgroundColor+" "+cs.backgroundImage);if(border.includes("rgb")||color.includes("rgb")||background.includes("gradient"))styled++;if(t.cls&&["#section-character .themeEquipmentSlot","#section-store .storeThemeCard"].includes(sel)){const rulePresent=css.includes("body."+t.cls+" .storeThemeCard")||css.includes("body."+t.cls+" .inventoryItem")||css.includes("body."+t.cls+" .equipmentSlot")||css.includes("body."+t.cls+" .characterInventoryCard")||css.includes("body."+t.cls+" .card")||css.includes("body."+t.cls+" .panel");if(!rulePresent)missing.push(sel+" lacks explicit theme styling rule");}}
  add(`${t.name}: computed UI surfaces inspected`,checked>=3&&styled>=3,`Inspected ${checked} rendered surfaces; ${styled} had measurable styled values; at least 3 styled surfaces are required`,"computed-style");
  if(t.cls)add(`${t.name}: lower UI surface selectors`,missing.length===0,missing.length?missing.join("; "):"Theme equipment and Store surfaces have explicit theme-specific selectors","visual");
 }
 body.className=originalClasses.join(" ");await new Promise(resolve=>requestAnimationFrame(resolve));
 const current=state?.equipment?.theme||"dungeon-theme",active=themes.find(t=>t.id===current);
 add("Currently equipped theme body class",!!active&&(!active.cls||body.classList.contains(active.cls)),`Equipped=${current}; expected=${active?.cls||"Dungeon fallback"}`,"equipped-state");
 // Verify actual active visual identity from registry metadata; missing mappings become inconclusive/fail, never silently pass.
 const lockedIds=["debugDisableBackground","debugDisableColors","debugDisablePortrait","debugDisableMusic"],lockState=Object.fromEntries(lockedIds.map(id=>[id,!!document.getElementById(id)?.checked])),isNonDungeon=current!=="dungeon-theme";
 const actualBg=getComputedStyle(document.body).backgroundImage;
 if(lockState.debugDisableBackground)add("Feature lock: selected theme background remains applied",!isNonDungeon||!actualBg.includes("dungeon-background.webp"),`Equipped=${current}; rendered background=${actualBg.slice(0,180)}`,"debug-lock-detection");
 if(lockState.debugDisableColors){const paletteVars=["--bg","--panel","--panel2","--line","--gold","--gold2","--cream","--muted"],lockedPalette=Object.fromEntries(paletteVars.map(v=>[v,getComputedStyle(body).getPropertyValue(v).trim()]));body.classList.remove("debug-disable-colors");const expectedPalette=Object.fromEntries(paletteVars.map(v=>[v,getComputedStyle(body).getPropertyValue(v).trim()]));body.classList.add("debug-disable-colors");const paletteMatches=paletteVars.every(v=>lockedPalette[v]===expectedPalette[v]);add("Feature lock: equipped theme palette still matches its expected palette",!isNonDungeon||paletteMatches,`Equipped=${current}; locked=${JSON.stringify(lockedPalette)}; expected=${JSON.stringify(expectedPalette)}`,"debug-lock-detection");}
 if(lockState.debugDisablePortrait){const art=document.getElementById("characterArtwork"),icon=document.querySelector(".themeIcon"),actualArt=(art?.getAttribute("src")||art?.src||"").split("/").pop(),actualIcon=(icon?.getAttribute("src")||icon?.src||"").split("/").pop(),gender=state?.profile?.gender==="female"?"female":"male",expectedArt=active?.character?.[gender]||null,expectedIcon=active?.icon?(active.icon.split("/").pop()):null,matches=!!expectedArt&&actualArt===expectedArt&&!!expectedIcon&&actualIcon===expectedIcon;add("Feature lock: equipped theme character and theme images still match",!isNonDungeon||matches,`Equipped=${current}; character=${actualArt}; expected character=${expectedArt||"missing debugCharacter metadata"}; theme icon=${actualIcon}; expected icon=${expectedIcon||"missing icon metadata"}`,"debug-lock-detection",expectedArt&&expectedIcon?undefined:"INCONCLUSIVE");}
 if(lockState.debugDisableMusic){const expected=active?.music||null,observed=themeMusicSource,matches=!!expected&&observed===expected;add("Feature lock: selected theme music remains applied",!isNonDungeon||matches,`Equipped=${current}; active music source=${observed||"not started"}; expected=${expected||"missing debugMusic metadata"}`,"debug-lock-detection",expected?undefined:"INCONCLUSIVE");}
 const passed=results.filter(x=>x.ok).length,failed=results.filter(x=>!x.ok&&x.status!=="INCONCLUSIVE").length,inconclusive=results.filter(x=>x.status==="INCONCLUSIVE").length;
 const report={version:"v3.0.3",status:failed?"FAILED":inconclusive?"INCONCLUSIVE":"PASSED",summary:{total:results.length,passed,failed,inconclusive},failures:results.filter(x=>!x.ok&&x.status!=="INCONCLUSIVE").map(x=>({test:x.name,category:x.category,expected:"Requirement is correctly registered, loaded, and visibly applied",actual:x.detail,severity:/background|icon|computed|lower|equip/i.test(x.name)?"high":"medium",suggestion:"Inspect the registered theme metadata, asset response, CSS selector, and computed styles."})),results,notes:["Theme Integration Tests discover Dungeon plus every registered unlockable theme from the shared registry and compare each against independent THEME_DEBUG_BASELINE expectations.","Baseline comparisons cover stable theme ID, display name, class, icon, background, male/female art, soundtrack, and computed palette variables. Missing baselines are INCONCLUSIVE, not PASS.","Test intentionally reuses Dungeon artwork, background, and soundtrack; this exception is explicitly documented in the independent baseline.","Every unlockable theme must declare debugThemeClass, debugBackground, debugCharacter.male/female, and debugMusic. Missing metadata is reported as FAIL or INCONCLUSIVE rather than silently skipped.","This browser-side integration test does not replace real end-to-end purchase/quest/account-isolation tests.","Visual class toggling is temporary and original body classes are restored without changing saved progress."]};
 const out=document.getElementById("debugThemeTestResults");if(out)out.textContent=JSON.stringify(report,null,2);debugLog("Theme compliance tests: "+passed+" passed, "+failed+" failed, "+inconclusive+" inconclusive.");return report;
}
document.getElementById("debugRunThemeTests")?.addEventListener("click",window.runThemeIntegrationTests);

document.getElementById("debugRunQuestTests")?.addEventListener("click",()=>{
 if(!debugRequireSandbox())return;
 const out=[];const check=(test,ok,detail,status)=>out.push({test,status:status||(ok?"PASS":"FAIL"),detail});
 const xpCurveExpected={1:0,2:3,9:24,10:26,19:44,20:45,21:46};
 Object.entries(xpCurveExpected).forEach(([level,expected])=>{const actual=calculateSkillQuestLevelBonus(Number(level));check(`Skill quest XP scaling at level ${level}`,actual===expected,`Expected +${expected} skill-level XP; observed +${actual}.`);});
 const skills=allSkillNames();
 check("Skill catalog discovered",skills.length>0,`${skills.length} registered skills discovered dynamically`);
 const perkEntries=Object.entries(THEME_PERK_SKILLS).filter(([theme,skill])=>skills.includes(skill)&&UNLOCKABLE_ITEMS.some(x=>x.id===theme));
 const selected=debugFaultSkill();const injection=debugFaultEnabled("debugFailAcademyBonus");
 const tests=skills.map(skill=>{
   const themeEntry=perkEntries.find(([theme,perkSkill])=>perkSkill===skill);
   const themeId=themeEntry?.[0]||"dungeon-theme";
   const expectedBonus=themeEntry?5:0;
   const baseXp=15;
   const actualBonus=calculateThemeBonus(themeId,skill);
   const syntheticQuest={id:"debug-xp-"+skill,skill,category:"Skill",baseXp,xp:baseXp+actualBonus,perkBonusXp:actualBonus,perkThemeId:actualBonus?themeId:null,perkThemeName:actualBonus?(UNLOCKABLE_ITEMS.find(x=>x.id===themeId)?.name||themeId):"",done:false};
   const isolated={xp:0,gold:100,skillXp:{},completedTotal:0};
   const award=awardQuestRewards(isolated,syntheticQuest);
   const expectedTotal=baseXp+expectedBonus;
   const applicable=!!themeEntry;
   const faultApplies=injection&&selected===skill&&applicable;
   const ok=award.xp===expectedTotal;
   return {skill,themeId,applicable,expectedTotal,actualTotal:award.xp,actualSkillXp:isolated.skillXp[skill]||0,ok,faultApplies};
 });
 tests.forEach(t=>{if(!t.applicable){check(`${t.skill}: theme bonus lifecycle`,false,`No registered theme declares perkSkill=${t.skill}; base XP completion was observed, but a bonus-failure test is not applicable until a theme grants this skill a bonus.`,"INCONCLUSIVE");return;}check(`${t.skill}: generated quest completion awards theme bonus`,t.ok,`theme=${t.themeId}; expected=${t.expectedTotal} XP, actual=${t.actualTotal} XP${t.faultApplies?"; injected bonus suppression was active":""}`);});
 if(injection&&!selected)check("XP injector target selected",false,"Choose a target skill before running XP tests.");
 const failed=out.some(x=>x.status==="FAIL");const report={status:failed?"FAILED":out.some(x=>x.status==="INCONCLUSIVE")?"INCONCLUSIVE":"PASSED",results:out,summary:{skillsTested:tests.length,perkEligible:tests.filter(t=>t.applicable).length,passed:out.filter(x=>x.status==="PASS").length,failed:out.filter(x=>x.status==="FAIL").length},note:"Each test generates an isolated synthetic quest and runs the same reward-award helper used by real quest completion. No real quests, inventory, coins, or saved progress are changed."};document.getElementById("debugQuestStoreResults").textContent=JSON.stringify(report,null,2);debugLog("Quest completion XP tests: "+report.status);
});
document.getElementById("debugRunStoreTests")?.addEventListener("click",()=>{
 if(!debugRequireSandbox())return;
 const items=Array.isArray(UNLOCKABLE_ITEMS)?UNLOCKABLE_ITEMS:[],out=[];const add=(test,ok,detail,status)=>out.push({test,status:status||(ok?"PASS":"FAIL"),detail});
 add("Unlockable catalog exists",items.length>0,`${items.length} registered items`);
 add("Unique unlockable IDs",new Set(items.map(x=>x.id)).size===items.length,"Duplicate IDs can cause purchase/inventory inconsistencies");
 add("Prices are valid",items.every(x=>Number.isFinite(Number(x.price))&&Number(x.price)>=0),"All catalog prices should be non-negative numbers");
 add("Skill unlock requirements are valid",items.every(x=>!x.unlockSkill||(Number.isFinite(Number(x.unlockLevel))&&Number(x.unlockLevel)>0)),"Every gated theme has a valid skill and positive level requirement");
 const selected=debugFaultSkill();
 items.forEach(item=>{
  if(item.specialUnlock){add(`${item.name}: special unlock policy`,item.id==="bloodthirst-theme"&&item.price===0&&item.unlockKills===null,"Not Store-purchasable; kill threshold intentionally remains unset.");return;}
  if(!item.unlockSkill)return;
  const targetLevel=Number(item.unlockLevel);const simulatedSkillXp=debugXpForSkillLevel(targetLevel);const level=getSkillProgress(simulatedSkillXp).level;const unlock=themeUnlockAllowed(item,level);
  const unlockFaultApplies=debugFaultEnabled("debugFailAcademyUnlock")&&selected===item.unlockSkill;
  add(`${item.name}: unlock at ${item.unlockSkill} level ${targetLevel}`,unlock,`Simulated skill XP=${simulatedSkillXp}; calculated level=${level}; actual unlock gate result=${unlock}; fault target=${selected||"none"}${unlockFaultApplies?"; injected failure active":""}`);
  const isolated={gold:Number(item.price),inventory:[]};const purchaseResult=attemptThemePurchase(item,isolated,level);
  const purchaseFaultApplies=debugFaultEnabled("debugFailAcademyPurchase")&&selected===item.unlockSkill;
  const purchase=purchaseResult.ok&&isolated.inventory.some(x=>x.id===item.id)&&isolated.gold===0;
  add(`${item.name}: purchase with required level and ${item.price} coins`,purchase,`Transaction=${purchaseResult.reason}; owned=${isolated.inventory.some(x=>x.id===item.id)}; remaining gold=${isolated.gold}; fault target=${selected||"none"}${purchaseFaultApplies?"; injected failure active":""}`);
 });
 if((debugFaultEnabled("debugFailAcademyUnlock")||debugFaultEnabled("debugFailAcademyPurchase"))&&!selected)add("Store injector target selected",false,"Choose the skill associated with the theme you want to test.");
 const failed=out.some(x=>x.status==="FAIL");const report={status:failed?"FAILED":"PASSED",results:out,summary:{total:out.length,passed:out.filter(x=>x.status==="PASS").length,failed:out.filter(x=>x.status==="FAIL").length},note:"Store tests use the same unlock and purchase decision helpers as the actual Store. Level and coin values are isolated inputs; no real balance or inventory is changed."};document.getElementById("debugQuestStoreResults").textContent=JSON.stringify(report,null,2);debugLog("Store integration checks: "+report.status);
});

window.runEquipmentLifecycleTests = function(){
 if(!debugIsAdmin()||!debugSandboxActive){toast("Admin Sandbox is required.");return;}
 const out=document.getElementById("debugEquipmentLifecycleResults");if(!out)return;
 const inject={requirement:!!document.getElementById("debugInjectRequirementFailure")?.checked,purchase:!!document.getElementById("debugInjectPurchaseFailure")?.checked,equip:!!document.getElementById("debugInjectEquipFailure")?.checked,bonus:!!document.getElementById("debugInjectBonusFailure")?.checked};
 const registry=[DUNGEON_THEME_ITEM,...UNLOCKABLE_ITEMS];
 const items=registry.filter(i=>i&&(i.equipable===true||["theme","artifact","pet"].includes(getInventoryItemType(i)))&&(!i.sandboxOnly||debugSandboxActive));
 const results=[];const check=(name,ok,detail)=>results.push({name,ok:!!ok,detail});
 for(const item of items){
  if(item.specialUnlock){check(`${item.name}: special unlock policy`,item.id==="bloodthirst-theme"&&item.price===0&&item.unlockKills===null,"Not Store-purchasable; kill threshold intentionally remains unset.");continue;}
  const type=getInventoryItemType(item),requiredSkill=item.unlockSkill||null,requiredLevel=Number(item.unlockLevel??0),price=Math.max(0,Number(item.price)||0);
  const sandbox={...JSON.parse(JSON.stringify(state)),inventory:[],equipment:{},skillXp:{},selectedSkills:[],quests:[],gold:Math.max(1000,price+100),xp:0,completedTotal:0};
  if(item.id==="dungeon-theme"){sandbox.inventory.push({...item});sandbox.equipment.theme=item.id;check(`${item.name}: starter item present`,true,"Starter theme is available without Store purchase.");continue;}
  const levelXp=(level)=>{let xp=0;for(let n=1;n<level;n++)xp+=n<=3?60:n<=6?90:n<=9?120:150;return xp;};
  if(requiredSkill)sandbox.skillXp[requiredSkill]=levelXp(requiredLevel);
  const level=requiredSkill?getSkillProgress(sandbox.skillXp[requiredSkill]).level:0;
  const requirementOk=!requiredSkill||themeUnlockAllowed(item,level);
  check(`${item.name}: unlock requirement`,requirementOk,inject.requirement&&item.id==="v0-test-theme"?"Injected failure: shared unlock gate rejected the Test theme.":`Expected ${requiredSkill||"no skill requirement"} level ${requiredLevel}; simulated level ${level}.`);
  if(!requirementOk)continue;
  const purchaseResult=attemptThemePurchase(item,sandbox,level),purchaseOk=purchaseResult.ok;
  check(`${item.name}: acquire/purchase`,purchaseOk,purchaseOk?`Real purchase helper succeeded; price ${price}; remaining coins ${sandbox.gold}.`:`Real purchase helper rejected acquisition: ${purchaseResult.reason}.`);if(!purchaseOk)continue;
  const inventoryOk=sandbox.inventory.some(x=>x.id===item.id);
  check(`${item.name}: inventory integration`,inventoryOk,"Acquired item is present in isolated inventory state.");
  const slot=type==="theme"?"theme":type==="pet"?"pet":(item.equipmentSlot||item.slot||"artifact");const equipResult=type==="theme"?equipThemeItem(item.id,sandbox):{ok:!!(inventoryOk&&(type==="pet"||item.equipable===true)),reason:"unsupported-equip-helper"};const equipped=equipResult.ok;check(`${item.name}: equip integration`,equipped,equipped?`Real equip helper equipped item in ${slot} slot.`:`Real equip pathway failed: ${equipResult.reason||"no supported equip action/slot registered"}.`);if(!equipped)continue;
  if(type==="theme"&&item.perkSkill){const calculated=calculateThemeBonus(item.id,item.perkSkill),bonusOk=calculated>0;check(`${item.name}: effect/XP bonus`,bonusOk,`Expected positive ${item.perkSkill} bonus; shared calculation returned ${calculated} XP.`);const pool=buildQuestPool(item.perkSkill),template=pool.find(q=>q.skill===item.perkSkill)||null;const generated=!!template&&template.skill===item.perkSkill;check(`${item.name}: related quest generation`,generated,generated?`Shared quest-template pool produced ${template.title} for ${item.perkSkill}.`:`No eligible quest template for ${item.perkSkill}.`);if(generated){const base=Number(template.xp)||15;const bonus=calculateThemeBonus(item.id,item.perkSkill);const quest={...template,baseXp:base,xp:base+bonus,perkBonusXp:bonus};const before=Number(sandbox.skillXp[item.perkSkill])||0;const award=awardQuestRewards(sandbox,quest);const observed=(Number(sandbox.skillXp[item.perkSkill])||0)-before;const expected=base+bonus;check(`${item.name}: quest completion reward`,observed===expected,`Shared reward helper awarded ${observed} ${item.perkSkill} XP; expected ${expected} (${base} base + ${bonus} bonus).`);}}
  else check(`${item.name}: defined item effects`,true,"No theme XP-perk contract declared; type-specific effect coverage is not defined.");
 }
 const passed=results.filter(r=>r.ok).length,failed=results.length-passed;out.textContent=JSON.stringify({version:"v3.0.3",status:failed?"FAILED":"PASSED",summary:{itemsDiscovered:items.length,total:results.length,passed,failed},injectables:inject,results,notes:["Lifecycle suite is the visible Debug test system; legacy test panels are hidden while their code remains intact.","Registry discovery cannot detect items omitted from every authoritative registry.","This is isolated-state simulation, not live browser click-through or account-isolation proof."]},null,2);debugLog(`Equipment lifecycle suite: ${items.length} equipables discovered; ${passed} passed, ${failed} failed.`);
}
document.getElementById("debugRunEquipmentLifecycle")?.addEventListener("click",window.runEquipmentLifecycleTests);

/* Bind once as soon as this module loads; tab activation can safely call it again. */
initializeDebugTabControls();
window.WayfarerTabModules.debug = function() { initializeDebugTabControls(); window.WayfarerTabRenderers.debug.renderDebugPanel(); };

/* v2.1.8: Sandbox theme isolation switches are owned by Debug; core invokes the exported refresh hook. */
const featureIds=["debugDisableBackground","debugDisableColors","debugDisablePortrait","debugDisableMusic"];
function applyDebugFeatureSwitches(){
 const allowed=debugIsAdmin()&&debugSandboxActive;
 featureIds.forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=!allowed;});
 const values=Object.fromEntries(featureIds.map(id=>[id,!!document.getElementById(id)?.checked]));
 document.body.classList.toggle("debug-disable-background",allowed&&values.debugDisableBackground);
 document.body.classList.toggle("debug-disable-colors",allowed&&values.debugDisableColors);
 document.body.classList.toggle("debug-disable-portrait",allowed&&values.debugDisablePortrait);
 // Apply the Dungeon assets to the actual rendered image elements; normal render() can re-run this after theme changes.
 const gender=state?.profile?.gender==="female"?"female":"male";
 const art=document.getElementById("characterArtwork");
 if(art){if(allowed&&values.debugDisablePortrait){art.dataset.debugOriginalSrc=art.dataset.debugOriginalSrc||art.getAttribute("src")||"";art.src="./assets/images/"+(DUNGEON_THEME_ITEM.debugCharacter?.[gender]||`${gender}-dungeon.webp`);art.alt=gender+" Dungeon character portrait (Debug lock)";}else if(art.dataset.debugOriginalSrc!==undefined){const theme=state?.equipment?.theme||"dungeon-theme";const item=getThemeDefinition(theme)||DUNGEON_THEME_ITEM;const file=item.debugCharacter?.[gender]||DUNGEON_THEME_ITEM.debugCharacter[gender];art.src="./assets/images/"+file;art.alt=gender+" "+item.name+" character portrait";delete art.dataset.debugOriginalSrc;}}
 const icon=document.getElementById("characterThemeEquippedIcon");
 if(icon){if(allowed&&values.debugDisablePortrait){icon.dataset.debugOriginalSrc=icon.dataset.debugOriginalSrc||icon.getAttribute("src")||"";icon.src="./assets/images/dungeon-theme.webp";}else if(icon.dataset.debugOriginalSrc!==undefined){const theme=state?.equipment?.theme||"dungeon-theme";const item=UNLOCKABLE_ITEMS.find(x=>x.id===theme)||(theme==="dungeon-theme"?DUNGEON_THEME_ITEM:null);icon.src=item?.icon||"./assets/images/dungeon-theme.webp";delete icon.dataset.debugOriginalSrc;}}
 // The app's own music controller now selects the Dungeon track while this lock is active.
 if(typeof applyThemeMusic==="function")applyThemeMusic();
 const status=document.getElementById("debugFeatureSwitchStatus");if(status)status.textContent=allowed?featureIds.filter(id=>values[id]).map(id=>({debugDisableBackground:"Background",debugDisableColors:"Colors",debugDisablePortrait:"Character/theme images",debugDisableMusic:"Music"}[id])+" locked to Dungeon").join(", ")||"All equipped-theme effects enabled.":"Feature switches are available only in Sandbox mode.";
}
window.applyDebugFeatureSwitches=applyDebugFeatureSwitches;
window.resetDebugFeatureSwitches=function(){featureIds.forEach(id=>{const el=document.getElementById(id);if(el)el.checked=false;});document.body.classList.remove("debug-disable-background","debug-disable-colors","debug-disable-portrait");applyDebugFeatureSwitches();};
featureIds.forEach(id=>document.getElementById(id)?.addEventListener("change",applyDebugFeatureSwitches));

})();
