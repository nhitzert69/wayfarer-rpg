/* Wayfarer tab renderers loaded on demand. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.skills = window.WayfarerTabRenderers.skills || {};
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
   return `<div class="skillChoice" style="display:flex;align-items:flex-start;gap:10px"><input type="checkbox" data-skill-choice="${esc(name)}" aria-label="Select ${esc(name)}" ${selected?"checked":""}><span style="flex:1;min-width:0"><strong>${esc(name)}</strong><small>${esc(desc)}</small>${selected?`<label style="display:flex;align-items:center;gap:8px;margin-top:9px;font-size:12px;color:var(--gold)">Quest role <select data-skill-priority="${esc(name)}" style="margin-left:auto;max-width:145px;padding:6px 8px;background:#101315;color:#f0e6d4;border:1px solid #8f6b43;border-radius:8px"><option value="priority" ${priority==="priority"?"selected":""}>👑 Priority</option><option value="secondary" ${priority==="secondary"?"selected":""}>✦ Secondary</option></select></label>`:""}</span></div>`;
 }).join("")}</div></div>`).join("");
 const count=document.getElementById("selectedSkillCount");
 if(count)count.textContent=`${state.selectedSkills.length} skill${state.selectedSkills.length===1?"":"s"} selected`;
 root.querySelectorAll("[data-skill-choice]").forEach(input=>input.addEventListener("change",()=>{
   const name=input.dataset.skillChoice;
   if(input.checked){if(!state.selectedSkills.includes(name))state.selectedSkills.push(name);if(!state.skillPriorities[name])state.skillPriorities[name]="secondary";}
   else{state.selectedSkills=state.selectedSkills.filter(s=>s!==name);delete state.skillPriorities[name];}
   renderSkillCatalog();
   renderSkillProgress();
 }));
 root.querySelectorAll("[data-skill-priority]").forEach(select=>select.addEventListener("change",()=>{
   state.skillPriorities[select.dataset.skillPriority]=select.value;
   if(!debugSandboxActive){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(error){console.error("Could not persist skill priority:",error);}}
   renderSkillCatalog();
 }));
}
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.skills = function() { window.WayfarerTabRenderers.skills.renderSkillProgress(); window.WayfarerTabRenderers.skills.renderSkillCatalog(); };


/* Lazy Skills tab actions extracted from index.html in v2.1.0. */
const saveSkillsButton=document.getElementById("saveSkillsBtn");
if(saveSkillsButton)saveSkillsButton.addEventListener("click",function(event){
 event.preventDefault();
 const catalog=document.getElementById("skillCatalog");
 if(catalog){
   state.selectedSkills=Array.from(catalog.querySelectorAll("[data-skill-choice]:checked"))
     .map(input=>input.getAttribute("data-skill-choice"))
     .filter(name=>allSkillNames().includes(name));
 }
 ensureSelectedSkills();
 try{
   if(!debugSandboxActive){
     const revision=nextSaveRevision();
     localStorage.setItem(KEY,JSON.stringify(state));
     try{localStorage.setItem(STATE_UPDATED_KEY,String(revision));}catch(e){}
     if(cloudUser&&!cloudHydrating)syncCurrentState(revision);
   }
   renderSkillProgress();
   window.scrollTo({top: 0, behavior: "smooth"});
   toast(`✓ Saved ${state.selectedSkills.length} skill${state.selectedSkills.length===1?"":"s"}.`);
   }catch(error){
   toast("Could not save skills on this device. Please check browser storage settings.");
   console.error("Wayfarer could not save selected skills:",error);
 }
});
