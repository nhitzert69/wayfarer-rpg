/* v2.1.1: IIFE isolates tab-local declarations so modules can preload together. */
(()=>{
/* Wayfarer tab renderers loaded on demand. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.store = window.WayfarerTabRenderers.store || {};
let activeStoreCategory = "themes";
function setStoreCategory(category){
 if(!["themes","artifacts","pets"].includes(category))return;
 activeStoreCategory=category;
 document.querySelectorAll("[data-store-category]").forEach(button=>{const active=button.dataset.storeCategory===category;button.setAttribute("aria-selected",active?"true":"false");button.tabIndex=active?0:-1;});
 document.querySelectorAll(".storeCategoryPanel").forEach(panel=>{panel.hidden=panel.id!==({themes:"storePanelThemes",artifacts:"storePanelArtifacts",pets:"storePanelPets"}[category]);});
}
/* Store-owned transaction rules moved from index.html in v2.1.5.
   Persistence remains with the core save boundary; target state is explicit for isolated tests. */
function themePurchaseAllowed(item,level,gold){if(!item)return false;const eligible=Number(level)>=Number(item.unlockLevel??Infinity)&&Number(gold)>=Number(item.price);if(!eligible)return false;return !(lifecycleFaultEnabled("purchase",item)||(debugFaultEnabled("debugFailAcademyPurchase")&&debugFaultSkill()&&item.unlockSkill===debugFaultSkill()));}
window.attemptThemePurchase = function(item,target,level){
 if(!item||!target)return {ok:false,reason:"invalid-item"};
 if(item.specialUnlock||item.id==="bloodthirst-theme")return {ok:false,reason:"special-unlock"};
 if(!Array.isArray(target.inventory))target.inventory=[];
 const owned=target.inventory.find(entry=>entry&&entry.id===item.id);
 const isUpgrade=!!item.upgradeOf;
 if(owned&&!isUpgrade)return {ok:false,reason:"already-owned"};
 if(isUpgrade&&(!owned||Number(owned.themeLevel||1)!==Number(item.themeLevel)-1))return {ok:false,reason:"invalid-upgrade"};
 const actualLevel=Number(level??getSkillLevel(item.unlockSkill));
 if(!themeUnlockAllowed(item,actualLevel))return {ok:false,reason:"locked"};
 const gold=Math.max(0,Number(target.gold)||0);
 if(gold<Number(item.price))return {ok:false,reason:"insufficient-gold"};
 if(!themePurchaseAllowed(item,actualLevel,gold))return {ok:false,reason:"injected-purchase-failure"};
 target.gold=gold-Number(item.price);
 if(isUpgrade){Object.assign(owned,{name:item.name,themeLevel:item.themeLevel,perkXp:item.perkXp,perkGold:item.perkGold,unlockLevel:item.unlockLevel,price:item.price,description:item.description,perkSkill:item.perkSkill});}
 else target.inventory.push({...item,themeLevel:1,perkXp:5,perkGold:0});
 return {ok:true,reason:isUpgrade?"upgraded":"purchased",goldRemaining:target.gold};
};
/* Wayfarer store tab module. Shared state remains in the core; module initializes its view on demand. */
window.WayfarerTabRenderers.store.renderStoreCatalog = function(){
 const root=document.getElementById("storeThemeCatalog");if(!root)return;
 const catalog=UNLOCKABLE_ITEMS.filter(item=>!item.sandboxOnly||debugSandboxActive);
 const storeItems=catalog.filter(item=>String(item.type||item.category||"theme").toLowerCase()==="theme"&&item.id!=="bloodthirst-theme").map(base=>{const owned=state.inventory.find(x=>x&&x.id===base.id);const current=Math.max(1,Number(owned?.themeLevel)||1);if(owned&&current>=5)return null;const next=owned?current+1:1;return {...base,themeLevel:next,unlockLevel:3+(next-1)*5,name:next===1?base.name:`${base.perkSkill} Level ${next}`,perkXp:5*next,perkGold:2*(next-1),price:100*next,upgradeOf:owned?base.id:null};}).filter(Boolean);
 root.innerHTML=storeItems.length?storeItems.map(item=>{const level=getSkillLevel(item.unlockSkill);const unlocked=(level>=item.unlockLevel)&&themeUnlockAllowed(item,level);const name=item.name;const titleIcon=item.id==="orthodox-theme"?"✝️":item.id==="academy-theme"?"📚":item.id==="social-interactions-theme"?"🗣️":item.id==="relationships-theme"?"🤝":item.id==="fitness-theme"?"🏛️":item.id==="spartan-endurance-theme"?"🛡️":item.id==="ceo-theme"?"⚓":"🧭";const perk=`+${item.perkXp} ${esc(item.perkSkill)} XP and +${item.perkGold} gold per eligible quest generated while equipped.`;return `<article class="card storeThemeCard${unlocked?"":" locked"}"><img src="${esc(item.icon)}" alt="${esc(name)} theme icon"><div><div class="row" style="align-items:flex-start"><h3 style="margin:0">${unlocked?titleIcon+" ":"🔒 "}${esc(name)}</h3><span class="themePrice">${unlocked?item.price+" coins":"🔒 Locked"}</span></div><p style="margin:5px 0">${esc(item.description)}</p><div class="themeRequirement"><strong>Perk:</strong> ${perk}</div>${unlocked?`<button class="btn" type="button" id="buy-${esc(item.id)}">${item.upgradeOf?"Upgrade for ":"Buy for "}${item.price} coins</button>`:`<div class="themeRequirement">Reach ${esc(item.unlockSkill)} level ${item.unlockLevel} to unlock · Current level ${level}</div>`}</div></article>`;}).join(""):'<div class="storeCategoryEmpty">All theme upgrades are at maximum level.</div>';
 const artifactRoot=document.getElementById("storeArtifactCatalog"),petRoot=document.getElementById("storePetCatalog");
 const artifacts=catalog.filter(item=>["artifact","artifacts"].includes(String(item.type||item.category||"").toLowerCase())&&!hasUnlockable(item.id));
 const pets=catalog.filter(item=>["pet","pets"].includes(String(item.type||item.category||"").toLowerCase())&&!hasUnlockable(item.id));
 if(artifactRoot)artifactRoot.innerHTML=artifacts.length?'<div class="storeCategoryEmpty">Artifact catalog items are not yet registered.</div>':'<div class="storeCategoryEmpty">No artifacts available yet. New artifacts will appear here.</div>';
 if(petRoot)petRoot.innerHTML=pets.length?'<div class="storeCategoryEmpty">Pet catalog items are not yet registered.</div>':'<div class="storeCategoryEmpty">No pets available yet. New pets will appear here.</div>';
 setStoreCategory(activeStoreCategory);
 for(const item of storeItems){const button=document.getElementById("buy-"+item.id);button?.addEventListener("click",()=>{if(debugSandboxActive&&debugUnlockAllItems){const owned=state.inventory.find(x=>x&&x.id===item.id);if(owned&&item.upgradeOf)Object.assign(owned,{name:item.name,themeLevel:item.themeLevel,perkXp:item.perkXp,perkGold:item.perkGold,unlockLevel:item.unlockLevel});else if(!owned)state.inventory.push({...item});save();render();toast(item.upgradeOf?item.name+" upgraded in sandbox.":item.name+" theme added to your inventory.");return;}const result=attemptThemePurchase(item,state,getSkillLevel(item.unlockSkill));if(!result.ok){if(result.reason==="locked")toast(`Reach ${item.unlockSkill} level ${item.unlockLevel} first.`);else if(result.reason==="insufficient-gold")toast(`You need ${item.price} coins to buy the ${item.name} theme.`);else if(result.reason==="injected-purchase-failure")toast(item.name+" purchase failed in Debug fault-injection mode.");else if(result.reason==="special-unlock")toast("This theme cannot be purchased in the Store.");renderStoreCatalog();return;}save();render();toast(item.upgradeOf?item.name+" purchased and upgraded.":item.name+" theme added to your inventory.");});}
}
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.store = function() { window.WayfarerTabRenderers.store.renderStoreCatalog(); };


/* Store category interaction extracted in v2.1.1. */
document.querySelectorAll("[data-store-category]").forEach(button=>button.addEventListener("click",()=>setStoreCategory(button.dataset.storeCategory)));
})();
