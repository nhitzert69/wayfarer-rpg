/* Wayfarer quests tab renderer. Loaded on first tab selection. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.quests = function() {
 const activeQuests=state.quests.filter(q=>!q.done);
 const mainQuests=activeQuests.filter(q=>getSkillPriority(q.skill)==="priority");
 const sideQuests=activeQuests.filter(q=>getSkillPriority(q.skill)!=="priority");
 const mainGrid=document.getElementById("mainQuestGrid"),sideGrid=document.getElementById("sideQuestGrid");
 if(mainGrid)mainGrid.innerHTML=mainQuests.length?mainQuests.map(questCard).join(""):'<div class="empty">No main quests yet. Mark one or more selected skills as Priority in the Skills tab, then generate quests.</div>';
 if(sideGrid)sideGrid.innerHTML=sideQuests.length?sideQuests.map(questCard).join(""):'<div class="empty">No side quests right now. Select secondary skills and generate quests, or enjoy your clear board.</div>';
 const gridRoots=[mainGrid,sideGrid].filter(Boolean);
 gridRoots.forEach(grid=>grid.querySelectorAll("[data-complete-btn]").forEach(el=>el.addEventListener("click",()=>completeQuest(el.dataset.completeBtn,true))));
 updateGenerateButtonStatus();
};
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.quests = function() { window.WayfarerTabRenderers.quests(); };
