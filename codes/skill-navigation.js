// Wayfarer modular script segment. Keep load order in index.html.
function renderSkillCatalog(){
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
document.getElementById("saveSkillsBtn").addEventListener("click",()=>{
 const catalog=document.getElementById("skillCatalog");
 if(catalog){
   state.selectedSkills=Array.from(catalog.querySelectorAll("[data-skill-choice]:checked")).map(input=>input.dataset.skillChoice).filter(name=>allSkillNames().includes(name));
   catalog.querySelectorAll("[data-skill-priority]").forEach(select=>{state.skillPriorities[select.dataset.skillPriority]=select.value;});
 }
 ensureSelectedSkills();save();renderSkillProgress();render();window.scrollTo({top:0,behavior:"smooth"});toast("Skills and quest priorities saved.");
});

// Delegated navigation handler: one click handler for every tab.
document.addEventListener("click", function(event) {
  const button = event.target.closest(".tab[data-tab]");
  if (!button) return;
  event.preventDefault();
  const tabName = button.getAttribute("data-tab");
  document.querySelectorAll(".tab[data-tab]").forEach(function(tab) {
    tab.classList.toggle("active", tab === button);
  });
  document.querySelectorAll("main .section[id^='section-']").forEach(function(section) {
    section.classList.toggle("active", section.id === "section-" + tabName);
  });
  if (tabName === "skills" && typeof renderSkillCatalog === "function") renderSkillCatalog();
});



