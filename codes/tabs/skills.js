// Skills tab entry point. Uses shared skill catalog, XP and priorities.
window.WayfarerTabModules.skills = function(){ if(typeof renderSkillCatalog === "function") renderSkillCatalog(); if(typeof renderSkillProgress === "function") renderSkillProgress(); };
