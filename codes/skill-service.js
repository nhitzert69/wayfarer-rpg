/* Wayfarer shared skill service. Skill catalog and account state remain core-owned;
   progression mathematics and skill normalization live here for every tab to reuse. */
(function(){
  const root=window;
  root.migrateSkillState=function(target){
    if(!target||typeof target!=="object")return target;
    if(!Array.isArray(target.quests))target.quests=[];
    if(!target.skillXp||typeof target.skillXp!=="object")target.skillXp={};
    // Preserve XP and quest attribution when retiring the legacy skill label.
    target.quests.forEach(q=>{if(q&&q.skill==="Social Confidence")q.skill="Social Interactions";});
    if(Object.prototype.hasOwnProperty.call(target.skillXp,"Social Confidence")){
      target.skillXp["Social Interactions"]=(Number(target.skillXp["Social Interactions"])||0)+(Number(target.skillXp["Social Confidence"])||0);
      delete target.skillXp["Social Confidence"];
    }
    return target;
  };
  root.allSkillNames=function(){return skillCatalog.flatMap(c=>c.skills.map(s=>s[0]));};
  root.ensureSelectedSkills=function(){
    if(!Array.isArray(state.selectedSkills)) state.selectedSkills=[];
    state.selectedSkills=state.selectedSkills.filter(s=>root.allSkillNames().includes(s));
    if(!state.skillXp||typeof state.skillXp!=="object")state.skillXp={};
    if(!state.skillPriorities||typeof state.skillPriorities!=="object")state.skillPriorities={};
    if(!state.skillWeekdays||typeof state.skillWeekdays!=="object"||Array.isArray(state.skillWeekdays))state.skillWeekdays={};
    for(const skill of state.selectedSkills){
      if(!Object.prototype.hasOwnProperty.call(state.skillWeekdays,skill))state.skillWeekdays[skill]=state.skillPriorities[skill]==="priority"?[0,1,2,3,4,5,6]:[];
    }
    for(const [skill,days] of Object.entries(state.skillWeekdays)){
      if(!root.allSkillNames().includes(skill)){delete state.skillWeekdays[skill];continue;}
      state.skillWeekdays[skill]=Array.isArray(days)?[...new Set(days.map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<=6))].sort((a,b)=>a-b):[];
    }
  };
  root.skillWeekdayForCycle=function(cycle){
    const key=/^\d{4}-\d{2}-\d{2}$/.test(String(cycle||""))?cycle:typeof amsterdamQuestCycleKey==="function"?amsterdamQuestCycleKey():new Date().toISOString().slice(0,10);
    return (new Date(key+"T12:00:00Z").getUTCDay()+6)%7;
  };
  root.getSkillPriority=function(skill,cycle){root.ensureSelectedSkills();return state.skillWeekdays[skill]?.includes(root.skillWeekdayForCycle(cycle))?"priority":"secondary";};
  root.skillDescription=function(name){for(const c of skillCatalog){const found=c.skills.find(s=>s[0]===name);if(found)return found[1];}return "";};
  root.xpNeededForNextLevel=function(level){
    level=Math.max(1,Math.floor(Number(level)||1));
    if(level<=2)return 60;if(level<=4)return 90;if(level<=6)return 120;if(level<=9)return 150;if(level<=14)return 180;if(level<=19)return 225;if(level<=29)return 270;return 300;
  };
  root.getSkillProgress=function(totalXp){
    let xp=Math.max(0,Number(totalXp)||0),level=1;
    while(level<1000){const needed=root.xpNeededForNextLevel(level);if(xp<needed)return {level,intoLevel:xp,needed,progress:xp/needed*100};xp-=needed;level++;}
    return {level,intoLevel:0,needed:root.xpNeededForNextLevel(level),progress:0};
  };
  root.getSkillLevel=function(skill){return root.getSkillProgress(state.skillXp&&state.skillXp[skill]).level;};
  root.calculateSkillQuestLevelBonus=function(level){
    const attainedLevel=Math.max(1,Math.floor(Number(level)||1));let bonus=0;
    for(let gainedLevel=2;gainedLevel<=Math.min(attainedLevel,14);gainedLevel+=2)bonus+=gainedLevel>=10?0.5:gainedLevel>=6?1:2;
    return bonus;
  };
  root.getLevelBand=function(level){if(level<=3)return 1;if(level<=6)return 2;if(level<=9)return 3;return 3+Math.floor((level-7)/3);};
})();
