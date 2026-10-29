/* v2.1.1: IIFE isolates tab-local declarations so modules can preload together. */
(()=>{
/* Wayfarer tab renderers loaded on demand. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.character = window.WayfarerTabRenderers.character || {};
/* Wayfarer character tab module. Shared state remains in the core; module initializes its view on demand. */
window.WayfarerTabRenderers.character.renderCharacterInventory = function(){
 const items=Array.isArray(state.inventory)?state.inventory:[];
 const themes=items.filter(item=>isThemeInventoryItem(item));
 const pets=items.filter(item=>isPetInventoryItem(item));
 const artifacts=items.filter(item=>item&&!themes.includes(item)&&!pets.includes(item));
 const equippedTheme=state.equipment?.theme||null;
 const equippedPet=state.equipment?.pet||null;
 const themeRoot=document.getElementById("themeInventory"),artifactRoot=document.getElementById("artifactInventory"),petRoot=document.getElementById("petInventory");
 const countEl=document.getElementById("inventoryCount");if(countEl)countEl.textContent=items.length+" item"+(items.length===1?"":"s");
 const makeItem=(item)=>{const id=String(item.id||"");const itemType=getInventoryItemType(item);const equipped=itemType==="theme"?equippedTheme===id:(itemType==="pet"?String(equippedPet)===id:false);const registeredTheme=UNLOCKABLE_ITEMS.find(def=>def.id===id)||(id==="dungeon-theme"?DUNGEON_THEME_ITEM:null);const icon=(itemType==="theme"&&registeredTheme?registeredTheme.icon:item.icon)||"";const level=Math.max(1,Math.min(5,Math.floor(Number(item.themeLevel)||1)));const perk=id==="bloodthirst-theme"?`<small class="inventoryPerk">${equipped?"Equipped · ":""}+2 XP and +2 gold for all skill quests</small>`:itemType==="theme"&&item.id!=="dungeon-theme"?`<small class="inventoryPerk">${equipped?"Equipped · ":""}${esc(item.perkSkill||"Skill")} +${5*level} XP and +${2*(level-1)} gold per quest</small>`:"";return `<button type="button" class="inventoryItemButton${equipped?" is-equipped":""}" data-inventory-item="${esc(id)}" data-inventory-type="${esc(item.type||item.category||"artifact")}" aria-pressed="${equipped?"true":"false"}" aria-label="${esc((equipped?"Currently equipped: ":"Equip ")+(item.name||"item"))}"><img src="${esc(icon)}" alt=""><strong>${esc(item.name||"Unknown item")}</strong>${perk}</button>`;};
 if(themeRoot){themeRoot.innerHTML=themes.length?themes.map(makeItem).join(""):'<div class="inventoryEmpty">No themes available.</div>';}
 if(artifactRoot){artifactRoot.innerHTML=artifacts.length?artifacts.map(item=>`<div class="equipmentSlot"><strong>${esc(item.name||"Unknown item")}</strong><small>${esc(item.category||"Artifact")}</small></div>`).join(""):'<div class="inventoryEmpty">No artifacts yet.</div>';}
 if(petRoot){petRoot.innerHTML=pets.length?pets.map(makeItem).join(""):'<div class="inventoryEmpty">No pets yet.</div>';}
 const petLabel=document.getElementById("characterPetLabel");if(petLabel){const pet= pets.find(item=>String(item.id)===String(equippedPet));petLabel.textContent=pet?(pet.name||"Pet") : "No pet equipped";}
 const petSlot=document.getElementById("characterPetsSlot");if(petSlot){const pet=pets.find(item=>String(item.id)===String(equippedPet));const petPreview=petSlot.querySelector(".petPreview");if(petPreview){if(pet){petPreview.textContent="";petPreview.innerHTML=`<img src="${esc(pet.icon||"")}" alt="" style="width:100%;height:100%;object-fit:contain">`;}else{petPreview.textContent="🐾";}}}
 const activeTheme=UNLOCKABLE_ITEMS.find(item=>item.id===equippedTheme)||DUNGEON_THEME_ITEM;
 const label=document.getElementById("characterThemeLabel");if(label)label.textContent=equippedTheme?activeTheme.name:(debugSandboxActive&&debugAllowThemeUnequip?"No theme equipped":"Dungeon");
 const preview=document.getElementById("characterThemeEquippedIcon");if(preview){preview.src=activeTheme.icon;preview.alt=equippedTheme?activeTheme.name+" theme equipped":"No theme equipped";preview.style.visibility=equippedTheme?"visible":"hidden";preview.style.boxShadow=equippedTheme?"0 0 7px rgba(57,255,101,.7)":"none";}
 const themeSlot=document.getElementById("characterThemeSlot");if(themeSlot)themeSlot.classList.toggle("themeUnequipped",!equippedTheme);
 applyEquippedThemeAppearance({themeId:equippedTheme,gender:state?.profile?.gender,artwork:document.getElementById("characterArtwork"),icon:document.getElementById("characterThemeEquippedIcon"),crest:document.querySelector(".crest")});
}
window.WayfarerTabRenderers.character.renderCharacterOverview = function(){if(ensureDungeonThemeState())save(true);const profile=state.profile||{};const gender=profile.gender;const equippedTheme=state.equipment?.theme||"dungeon-theme";const themeName=getThemeDefinition(equippedTheme)?.name||"Dungeon";const genderLabel=gender==="male"?"Male "+themeName:gender==="female"?"Female "+themeName:"Starting adventurer";const artwork=document.getElementById("characterArtwork");applyEquippedThemeAppearance({themeId:equippedTheme,gender,artwork,icon:document.getElementById("characterThemeEquippedIcon"),crest:document.querySelector(".crest")});const nameEl=document.getElementById("characterNameLabel");if(nameEl)nameEl.textContent=String(wayfarerSignedInUsername||cloudUser?.user_metadata?.wayfarer_username||((cloudUser?.email||"").split("@")[0])||"Wayfarer").trim()||"Wayfarer";const genderEl=document.getElementById("characterGenderLabel");if(genderEl)genderEl.textContent=genderLabel;const xpEl=document.getElementById("characterXpLabel");if(xpEl)xpEl.textContent=(Number(state.xp)||0)+" XP";const goldEl=document.getElementById("storeGoldBalance");if(goldEl)goldEl.textContent=String(Math.max(0,Number(state.gold)||0));renderCharacterInventory();if(typeof applyDebugFeatureSwitches==="function"&&debugSandboxActive)applyDebugFeatureSwitches();}
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.character = function() { window.WayfarerTabRenderers.character.renderCharacterOverview(); };


/* Character Inventory/equipment click handlers extracted in v2.1.1. */
const themeInventoryRoot=document.getElementById("themeInventory");
if(themeInventoryRoot&&!themeInventoryRoot.dataset.wayfarerEquipmentBound){
 themeInventoryRoot.dataset.wayfarerEquipmentBound="true";
 themeInventoryRoot.addEventListener("click",event=>{const button=event.target.closest("[data-inventory-item]");if(!button||!themeInventoryRoot.contains(button))return;const itemId=String(button.dataset.inventoryItem||"");if(!state.inventory.some(item=>item&&String(item.id)===itemId&&(isThemeInventoryItem(item)||item.equipable===true)))return;if(String(state.equipment?.theme||"")===itemId){if(debugSandboxActive&&debugAllowThemeUnequip){state.equipment.theme=null;debugLog("Unequipped theme in sandbox test mode.");toast("Theme unequipped (sandbox only).");}else{toast("A theme must always be equipped. Enable the sandbox exception to test unequipped state.");return;}}else{const equipResult=equipThemeItem(itemId,state);if(!equipResult.ok){toast("Could not equip this theme: "+equipResult.reason+".");debugLog("Theme equip operation failed for "+itemId+": "+equipResult.reason);return;}const themeName=getThemeDefinition(itemId)?.name||"Dungeon";debugLog(debugSandboxActive?"Equipped "+themeName+" theme in sandbox.":"Equipped "+themeName+" theme.");toast(themeName+" theme equipped.");}applyThemeMusic({userInitiated:true});save();renderDebugPanel();});
}
const petInventoryRoot=document.getElementById("petInventory");
if(petInventoryRoot&&!petInventoryRoot.dataset.wayfarerEquipmentBound){
 petInventoryRoot.dataset.wayfarerEquipmentBound="true";
 petInventoryRoot.addEventListener("click",event=>{const button=event.target.closest("[data-inventory-item]");if(!button||!petInventoryRoot.contains(button))return;const itemId=String(button.dataset.inventoryItem||"");const pet=(state.inventory||[]).find(item=>item&&String(item.id)===itemId&&isPetInventoryItem(item));if(!pet)return;if(String(state.equipment?.pet||"")===itemId){state.equipment.pet=null;toast((pet.name||"Pet")+" unequipped.");}else{state.equipment.pet=itemId;toast((pet.name||"Pet")+" equipped.");}save();renderDebugPanel();});
}
})();
