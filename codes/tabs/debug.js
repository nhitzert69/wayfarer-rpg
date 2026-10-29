/* v2.1.1: IIFE isolates tab-local declarations so modules can preload together. */
(()=>{
/* Wayfarer tab renderers loaded on demand. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.debug = window.WayfarerTabRenderers.debug || {};
/* Wayfarer debug tab module. Shared state remains in the core; module initializes its view on demand. */
window.WayfarerTabRenderers.debug.renderDebugPanel = function(){document.body.classList.toggle("sandbox-active",!!debugSandboxActive);const btn=document.getElementById("debugTabButton");if(!btn)return;const genderSelect=document.getElementById("debugAccountGender");const genderStatus=document.getElementById("debugAccountGenderStatus");const currentGender=(state.profile&&state.profile.gender)==="female"?"female":"male";if(genderSelect)genderSelect.value=currentGender;if(genderStatus)genderStatus.textContent="Current character gender: "+(state.profile&&state.profile.gender?String(state.profile.gender):"not set");const genderApply=document.getElementById("debugApplyAccountGender");if(genderApply)genderApply.disabled=!cloudUser||!debugIsAdmin();const themeToggle=document.getElementById("debugAllowThemeUnequip");if(themeToggle){themeToggle.disabled=!debugSandboxActive;themeToggle.checked=!!debugAllowThemeUnequip;}const questOverrideToggle=document.getElementById("debugOverrideQuestRules");if(questOverrideToggle){questOverrideToggle.disabled=!debugSandboxActive;questOverrideToggle.checked=!!debugOverrideQuestRules;}const unlockToggle=document.getElementById("debugUnlockAllItems");if(unlockToggle){unlockToggle.disabled=!debugSandboxActive;unlockToggle.checked=!!debugUnlockAllItems;}const themeLevelSelect=document.getElementById("debugThemeGrantLevel");if(themeLevelSelect){themeLevelSelect.value=String(Math.max(1,Math.min(5,Number(debugThemeGrantLevel)||1)));themeLevelSelect.disabled=!debugIsAdmin();}btn.style.display=(!!cloudUser&&debugIsAdmin())?"inline-flex":"none";if(!debugIsAdmin()&&document.getElementById("section-debug")?.classList.contains("active")){document.querySelector('[data-tab="quests"]')?.click();return;}const startSandbox=document.getElementById("debugStartSandbox");if(startSandbox)startSandbox.disabled=!debugIsAdmin()||!!debugSandboxActive;const exitSandbox=document.getElementById("debugExitSandbox");if(exitSandbox)exitSandbox.disabled=!debugSandboxActive||!debugIsAdmin();const status=document.getElementById("debugSandboxStatus");if(status)status.textContent=debugSandboxActive?"Sandbox active · changes are temporary":"Sandbox inactive";const sandboxControls=["debugGrantResources","debugRemoveResources","debugRestoreCharacter","debugResetCharacter","debugResetQuestCooldown","debugSetOverallXp","debugSetSkillXp","debugAddCoins","debugAddQuest","debugRunPlanner"];for(const id of sandboxControls){const control=document.getElementById(id);if(control)control.disabled=!debugSandboxActive||!debugIsAdmin();}const data=debugSandboxActive?state:(debugLiveStateBackup||state);const date=document.getElementById("debugActiveDate");if(date)date.textContent=data.activeDate||"—";const level=document.getElementById("debugLevel");if(level)level.textContent=String(Math.floor((Number(data.xp)||0)/100)+1);const coinBalance=document.getElementById("debugCoinBalance");if(coinBalance)coinBalance.textContent=String(Math.max(0,Number(data.gold)||0));const faultSkillSel=document.getElementById("debugFaultSkillSelect");if(faultSkillSel){const previousFault=faultSkillSel.value;const faultNames=allSkillNames();faultSkillSel.innerHTML='<option value="">Choose skill…</option>'+faultNames.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");if(faultNames.includes(previousFault))faultSkillSel.value=previousFault;}const skillSel=document.getElementById("debugSkillSelect");if(skillSel){const previous=skillSel.value;const names=[...new Set([...(data.selectedSkills||[]),...skillCatalog.flatMap(c=>c.skills.map(x=>x[0]))])];skillSel.innerHTML='<option value="">Choose skill…</option>'+names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");if(names.includes(previous))skillSel.value=previous;}if(debugSandboxActive)debugRenderQuests();}
window.WayfarerTabModules = window.WayfarerTabModules || {};
function initializeDebugTabControls(){
 const unlock=document.getElementById("debugUnlockAllItems");
 if(unlock&&!unlock.dataset.wayfarerHandler){unlock.dataset.wayfarerHandler="1";unlock.addEventListener("change",event=>{if(!debugRequireSandbox()){event.target.checked=false;return;}window.WayfarerTabRenderers.debug.applyUnlockAllItems(!!event.target.checked);});}
 const level=document.getElementById("debugThemeGrantLevel");
 if(level&&!level.dataset.wayfarerHandler){level.dataset.wayfarerHandler="1";level.addEventListener("change",event=>{const next=Math.floor(Number(event.target.value)||1);debugThemeGrantLevel=Math.max(1,Math.min(5,next));event.target.value=String(debugThemeGrantLevel);if(debugUnlockAllItems&&debugSandboxActive)window.WayfarerTabRenderers.debug.applyUnlockAllItems(true);else window.WayfarerTabRenderers.debug.renderDebugPanel();});}
}
window.WayfarerTabRenderers.debug.applyUnlockAllItems = function(enabled){
 if(!debugRequireSandbox())return;
 debugUnlockAllItems=!!enabled;
 if(!Array.isArray(state.inventory))state.inventory=[];
 if(debugUnlockAllItems){
  for(const item of UNLOCKABLE_ITEMS){
   const isTheme=String(item.type||item.category||"").toLowerCase()==="theme";
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
window.WayfarerTabModules.debug = function() { initializeDebugTabControls(); window.WayfarerTabRenderers.debug.renderDebugPanel(); };
})();
