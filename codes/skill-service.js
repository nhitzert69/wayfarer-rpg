/* Wayfarer shared skill service. Skill catalog and account state remain core-owned;
   progression mathematics and skill normalization live here for every tab to reuse. */
(function(){
  const root=window;
  root.allSkillNames=function(){return skillCatalog.flatMap(c=>c.skills.map(s=>s[0]));};
  root.ensureSelectedSkills=function(){
    if(!Array.isArray(state.selectedSkills)) state.selectedSkills=[];
    state.selectedSkills=state.selectedSkills.filter(s=>root.allSkillNames().includes(s));
    if(!state.skillXp||typeof state.skillXp!=="object")state.skillXp={};
    if(!state.skillPriorities||typeof state.skillPriorities!=="object")state.skillPriorities={};
    state.selectedSkills.forEach(skill=>{if(!["priority","secondary"].includes(state.skillPriorities[skill]))state.skillPriorities[skill]="secondary";});
    Object.keys(state.skillPriorities).forEach(skill=>{if(!state.selectedSkills.includes(skill))delete state.skillPriorities[skill];});
  };
  root.getSkillPriority=function(skill){root.ensureSelectedSkills();return state.skillPriorities[skill]||"secondary";};
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
    for(let gainedLevel=2;gainedLevel<=attainedLevel;gainedLevel++)bonus+=gainedLevel>=20?1:gainedLevel>=10?2:3;
    return bonus;
  };
  root.getLevelBand=function(level){if(level<=3)return 1;if(level<=6)return 2;if(level<=9)return 3;return 3+Math.floor((level-7)/3);};
})();
