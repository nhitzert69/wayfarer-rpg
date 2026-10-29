/* Wayfarer quests tab renderer. Loaded on first tab selection. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.quests = function() {
 const quests = Array.isArray(state?.quests) ? state.quests : [];
 const activeQuests = quests.filter(q => q && !q.done);
 const mainQuests = activeQuests.filter(q => getSkillPriority(q.skill) === "priority");
 const sideQuests = activeQuests.filter(q => getSkillPriority(q.skill) !== "priority");
 const mainGrid = document.getElementById("mainQuestGrid");
 const sideGrid = document.getElementById("sideQuestGrid");
 if (mainGrid) mainGrid.innerHTML = mainQuests.length
   ? mainQuests.map(questCard).join("")
   : '<div class="empty">No main quests yet. Mark one or more selected skills as Priority in the Skills tab, then generate quests.</div>';
 if (sideGrid) sideGrid.innerHTML = sideQuests.length
   ? sideQuests.map(questCard).join("")
   : '<div class="empty">No side quests right now. Select secondary skills and generate quests, or enjoy your clear board.</div>';
 // Delegation avoids duplicate completion handlers when the tab is revisited.
 [mainGrid, sideGrid].filter(Boolean).forEach(grid => {
   if (grid.dataset.questActionsBound === "true") return;
   grid.dataset.questActionsBound = "true";
   grid.addEventListener("click", event => {
     const button = event.target.closest("[data-complete-btn]");
     if (!button || !grid.contains(button)) return;
     completeQuest(button.dataset.completeBtn, true);
   });
 });
 if (typeof updateGenerateButtonStatus === "function") updateGenerateButtonStatus();
};
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.quests = function() {
  if (typeof window.WayfarerTabRenderers.quests === "function") window.WayfarerTabRenderers.quests();
};
