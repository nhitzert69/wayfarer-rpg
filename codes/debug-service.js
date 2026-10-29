/* Shared Debug services used by core lifecycle and multiple tab modules.
   Admin identity and Sandbox lifecycle remain authoritative in the core. */
(function(root){
  root.debugLogEntries=root.debugLogEntries||[];
  root.debugLog=function(message){
    root.debugLogEntries.unshift(new Date().toLocaleTimeString()+" · "+message);
    root.debugLogEntries=root.debugLogEntries.slice(0,80);
    const el=document.getElementById("debugEventLog");if(el)el.textContent=root.debugLogEntries.join("\n");
  };
  root.debugFaultEnabled=function(id){return !!(debugIsAdmin()&&debugSandboxActive&&document.getElementById(id)?.checked);};
  root.debugFaultSkill=function(){return String(document.getElementById("debugFaultSkillSelect")?.value||"");};
  root.debugQuestRulesOverridden=function(){return !!(debugSandboxActive&&debugOverrideQuestRules);};
  root.debugInspect=function(){
    const el=document.getElementById("debugSaveInspector");if(!el)return;
    const d=debugSandboxActive?state:(debugLiveStateBackup||state);
    el.textContent=JSON.stringify({mode:debugSandboxActive?"sandbox":"read-only live snapshot",xp:d.xp,calculatedLevel:Math.floor((Number(d.xp)||0)/100)+1,completedTotal:d.completedTotal,questCount:(d.quests||[]).length,openQuests:(d.quests||[]).filter(q=>!q.done).length,completedQuests:(d.quests||[]).filter(q=>q.done).length,selectedSkills:d.selectedSkills,skillXp:d.skillXp,activeDate:d.activeDate,lastDay:d.lastDay,journalEntries:(d.journal||[]).length,todoItems:(d.todo||[]).length,questHistoryKeys:Object.keys(d.questHistory||{}).length},null,2);
  };
})(window);
