/* v2.1.1: IIFE isolates tab-local declarations so modules can preload together. */
(()=>{
/* Wayfarer tab renderers loaded on demand. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.skills = window.WayfarerTabRenderers.skills || {};
/* Wayfarer skills tab module. Shared state remains in the core; module initializes its view on demand. */
window.WayfarerTabRenderers.skills.renderSkillProgress = function(){
 ensureSelectedSkills();
 const attrs=state.selectedSkills;
 const root=document.getElementById("mainSkillCards");
 const other=document.getElementById("attributeList");
 const skillMarkup=attrs.length?attrs.map(a=>{
   const xp=Number(state.skillXp[a]||0), track=getSkillProgress(xp), level=track.level, rem=track.intoLevel, needed=track.needed, progress=track.progress;
   return `<div class="skillProgressCard" style="display:block;padding:7px 10px;border:1px solid var(--line);border-radius:10px;background:rgba(16,12,9,.32)">
     <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:nowrap;font-size:14px;line-height:1.2"><strong style="min-width:0;overflow-wrap:anywhere">${esc(a)}</strong><span style="color:var(--gold);white-space:nowrap;font-size:12px">${rem}/${needed} XP · Lv ${level}</span></div>
     <div class="miniBar" style="margin-top:6px;height:5px"><div style="width:${progress}%"></div></div>
   </div>`;
 }).join(""):'<div class="empty">No skills selected yet. Open Skills, choose what you want to improve, then tap Save selected skills.</div>';
 if(root) root.innerHTML=skillMarkup;
 if(other) other.innerHTML=skillMarkup;
}
window.WayfarerTabRenderers.skills.renderSkillCatalog = function(){
 const root=document.getElementById("skillCatalog"); if(!root)return;
 ensureSelectedSkills();
 root.innerHTML=skillCatalog.filter(cat=>debugSandboxActive||!cat.skills.some(skill=>skill[0]==="Test")).map(cat=>`<div class="skillCategory"><h3>${cat.icon} ${esc(cat.category)}</h3><div class="skillChoices">${cat.skills.map(([name,desc])=>{
   const selected=state.selectedSkills.includes(name);
   const priority=getSkillPriority(name);
   return `<div class="skillChoice" style="display:flex;align-items:flex-start;gap:10px"><input type="checkbox" data-skill-choice="${esc(name)}" aria-label="Select ${esc(name)}" ${selected?"checked":""}><span style="flex:1;min-width:0"><strong>${esc(name)}</strong><small>${esc(desc)}</small>${selected?`<div style="margin-top:9px;font-size:12px;color:var(--gold)">Main quest days <div role="group" aria-label="${esc(name)} main quest days" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day,i)=>`<label style="display:inline-flex;align-items:center;gap:3px;padding:5px 7px;border:1px solid var(--line);border-radius:7px;color:var(--cream);cursor:pointer"><input type="checkbox" data-skill-weekday="${esc(name)}" data-weekday="${i}" ${weekdays.includes(i)?"checked":""}>${day}</label>`).join("")}</div><small>Other days: side quest. Changes save automatically.</small></div>`:""}</span></div>`;
 }).join("")}</div></div>`).join("");
 const count=document.getElementById("selectedSkillCount");
 if(count)count.textContent=`${state.selectedSkills.length} skill${state.selectedSkills.length===1?"":"s"} selected`;
}
// The catalog root survives innerHTML rerenders; delegate change handling once.
const skillCatalogRoot=document.getElementById("skillCatalog");
if(skillCatalogRoot&&!skillCatalogRoot.dataset.wayfarerSkillActionsBound){
 skillCatalogRoot.dataset.wayfarerSkillActionsBound="true";
 skillCatalogRoot.addEventListener("change",event=>{
  const input=event.target.closest("[data-skill-choice]");
  if(input&&skillCatalogRoot.contains(input)){
   const name=input.dataset.skillChoice;
   if(input.checked){if(!state.selectedSkills.includes(name))state.selectedSkills.push(name);}
   else state.selectedSkills=state.selectedSkills.filter(s=>s!==name);
   ensureSelectedSkills();save(true);renderSkillCatalog();renderSkillProgress();
   if(typeof window.WayfarerSyncSelectedSkillQuests==="function")window.WayfarerSyncSelectedSkillQuests();
   else if(typeof loadWayfarerTab==="function")loadWayfarerTab("quests").then(ok=>{if(ok)window.WayfarerSyncSelectedSkillQuests?.();});
   return;
  }
  const dayInput=event.target.closest("[data-skill-weekday]");
  if(dayInput&&skillCatalogRoot.contains(dayInput)){
   const name=dayInput.dataset.skillWeekday,day=Number(dayInput.dataset.weekday);
   if(!state.selectedSkills.includes(name)||!Number.isInteger(day)||day<0||day>6)return;
   const days=new Set(state.skillWeekdays[name]||[]);
   if(dayInput.checked)days.add(day);else days.delete(day);
   state.skillWeekdays[name]=[...days].sort((a,b)=>a-b);
   save(true);renderSkillCatalog();return;
  }
 });
}
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.skills = function() { window.WayfarerTabRenderers.skills.renderSkillProgress(); window.WayfarerTabRenderers.skills.renderSkillCatalog(); };


/* Lazy Skills tab actions extracted from index.html in v2.1.1. */
const saveSkillsButton=document.getElementById("saveSkillsBtn");
if(saveSkillsButton&&!saveSkillsButton.dataset.wayfarerSkillSaveBound){
 saveSkillsButton.dataset.wayfarerSkillSaveBound="true";
 saveSkillsButton.addEventListener("click",function(event){
 event.preventDefault();
 const catalog=document.getElementById("skillCatalog");
 if(catalog){
   state.selectedSkills=Array.from(catalog.querySelectorAll("[data-skill-choice]:checked"))
     .map(input=>input.getAttribute("data-skill-choice"))
     .filter(name=>allSkillNames().includes(name));
 }
 ensureSelectedSkills();
 try{
   // Core save owns local/cloud persistence and enforces Sandbox isolation.
   save(true);
   renderSkillProgress();
   renderSkillCatalog();
   window.scrollTo({top: 0, behavior: "smooth"});
   toast(`✓ Saved ${state.selectedSkills.length} skill${state.selectedSkills.length===1?"":"s"}.`);
   }catch(error){
   toast("Could not save skills on this device. Please check browser storage settings.");
   console.error("Wayfarer could not save selected skills:",error);
 }
 });
}
})();
