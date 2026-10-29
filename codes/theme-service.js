/* Wayfarer theme service — lifecycle, appearance, unlock rules, and perk calculations.
   Account state and persistence remain owned by index.html; this module only operates on state supplied by the core. */
function ensureDungeonThemeState(){
 let changed=false;
 if(!Array.isArray(state.inventory))state.inventory=[];
 for(const ownedItem of state.inventory){if(ownedItem&&ownedItem.id==="fitness-theme"&&ownedItem.name!=="Roman Discipline"){ownedItem.name="Roman Discipline";changed=true;}}
 const savedDungeonTheme=state.inventory.find(item=>item&&item.id==="dungeon-theme");if(!savedDungeonTheme){state.inventory.unshift({...DUNGEON_THEME_ITEM});changed=true;}else if(savedDungeonTheme.icon!==DUNGEON_THEME_ITEM.icon){savedDungeonTheme.icon=DUNGEON_THEME_ITEM.icon;changed=true;}
 if(!state.equipment||typeof state.equipment!=="object"){state.equipment={};changed=true;}
 if(!Object.prototype.hasOwnProperty.call(state.equipment,"theme")){state.equipment.theme="dungeon-theme";changed=true;}
 const ownedThemes=state.inventory.filter(item=>item&&item.type==="theme").map(item=>item.id);
 if(state.equipment.theme!==null&&!ownedThemes.includes(state.equipment.theme)){state.equipment.theme="dungeon-theme";changed=true;}
 if(state.equipment.theme==null&&!(debugSandboxActive&&debugAllowThemeUnequip)){state.equipment.theme="dungeon-theme";changed=true;}
 return changed;
}
function themeUnlockAllowed(item,level){if(item?.specialUnlock)return false;const levelMet=Number(level)>=Number(item?.unlockLevel??Infinity);const fault=(lifecycleFaultEnabled("requirement",item))||(debugFaultEnabled("debugFailAcademyUnlock")&&debugFaultSkill()&&item?.unlockSkill===debugFaultSkill());return levelMet&&!fault;}
function themeBonusAllowed(themeId,skill){const item=UNLOCKABLE_ITEMS.find(x=>x.id===themeId);return !(lifecycleFaultEnabled("bonus",item)||(debugFaultEnabled("debugFailAcademyBonus")&&debugFaultSkill()===skill&&THEME_PERK_SKILLS[themeId]===skill));}
function getOwnedThemeLevel(themeId,target=state){const owned=(target?.inventory||[]).find(item=>item&&item.id===themeId);return Math.max(1,Math.min(5,Math.floor(Number(owned?.themeLevel)||1)));}
function calculateThemeBonus(themeId,skill){if(themeId==="bloodthirst-theme")return 2;return THEME_PERK_SKILLS[themeId]===skill&&themeBonusAllowed(themeId,skill)?5*getOwnedThemeLevel(themeId):0;}
function calculateThemeGoldBonus(themeId,skill){if(themeId==="bloodthirst-theme")return 2;const item=UNLOCKABLE_ITEMS.find(x=>x.id===themeId);return item&&item.perkSkill===skill&&themeBonusAllowed(themeId,skill)?2*(getOwnedThemeLevel(themeId)-1):0;}
function equipThemeItem(itemId,targetState=state){const item=(targetState.inventory||[]).find(x=>x&&x.id===itemId);if(!item||!(item.type==="theme"||String(item.category||"").toLowerCase()==="theme"||item.equipable===true))return {ok:false,reason:"not-equipable-or-not-owned"};if(lifecycleFaultEnabled("equip",item))return {ok:false,reason:"injected-equip-failure"};if(!targetState.equipment||typeof targetState.equipment!=="object")targetState.equipment={};targetState.equipment.theme=itemId;return {ok:true,slot:"theme"};}

function getThemeDefinition(themeId){return UNLOCKABLE_ITEMS.find(item=>item&&item.id===themeId)||(themeId==="dungeon-theme"?DUNGEON_THEME_ITEM:null);}
function applyEquippedThemeAppearance({themeId,gender,artwork,icon,crest}={}){
 const id=themeId||"dungeon-theme";const theme=getThemeDefinition(id)||DUNGEON_THEME_ITEM;const female=gender==="female";
 const classes=["bloodthirstTheme","adventureTheme","academyTheme","socialInteractionsTheme","relationshipsTheme","orthodoxTheme","fitnessTheme","spartanEnduranceTheme","v0TestTheme","mozartSalonTheme","ceoTheme"];
 const activeClass=theme.debugThemeClass||null;for(const className of classes)document.body.classList.toggle(className,className===activeClass);
 const artFile=theme.debugCharacter?.[female?"female":"male"]||DUNGEON_THEME_ITEM.debugCharacter[female?"female":"male"];
 if(artwork){artwork.src="./assets/images/"+artFile;artwork.alt=(female?"Female ":"Male ")+theme.name+" character portrait";}
 if(icon){icon.src=theme.icon||DUNGEON_THEME_ITEM.icon;icon.alt=theme.name+" theme equipped";icon.style.visibility=themeId?"visible":"hidden";}
 if(crest){crest.innerHTML=id==="dungeon-theme"?'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 43V21C7 10 14 4 24 4s17 6 17 17v22" fill="#15191b" stroke="#d4a15f" stroke-width="2.2"/><path d="M12 43V22c0-8 5-13 12-13s12 5 12 13v21" fill="#282522" stroke="#786047" stroke-width="1.5"/><path d="M17 43V23c0-5 3-8 7-8s7 3 7 8v20" fill="#090c0e" stroke="#bd884c" stroke-width="1.5"/><path d="M13 22l-3-5 4 1 2-5 2 7M35 22l-3-5 4 1 2-5-2 7" fill="#f2a34e" stroke="#efc783" stroke-width="1"/><path d="M20 43V30h8v13" fill="#1d1712" stroke="#9b7446" stroke-width="1.2"/></svg>':`<img src="${theme.icon}" alt="${theme.name} theme" style="width:100%;height:100%;object-fit:contain;padding:2px">`;crest.setAttribute("aria-label",theme.name+" theme icon");}
 return theme;
}
