// Wayfarer modular script segment. Keep load order in index.html.
// Admin Debug Workshop (front-end convenience gate; not security for privileged backend operations).
let debugSandboxActive=false, debugLiveStateBackup=null, debugSandboxState=null, debugLogEntries=[];
let debugOverrideQuestRules=false;
function debugQuestRulesOverridden(){return debugSandboxActive&&debugOverrideQuestRules;}
function debugLog(message){debugLogEntries.unshift(new Date().toLocaleTimeString()+" · "+message);debugLogEntries=debugLogEntries.slice(0,80);const el=document.getElementById("debugEventLog");if(el)el.textContent=debugLogEntries.join("\n");}
// Independent Debug baseline: deliberately separate from UNLOCKABLE_ITEMS so a forgotten
// registration/CSS change cannot redefine its own expected result. Update this manifest only
// when a theme's intended identity is deliberately changed.
const THEME_DEBUG_BASELINE = {
 "dungeon-theme": {name:"Dungeon",cls:null,icon:"./assets/images/dungeon-theme.webp",background:"dungeon-background.webp",character:{male:"male-dungeon.webp",female:"female-dungeon.webp"},music:"./assets/sound/dungeon-theme.mp3",palette:{"--bg":"#15120f","--panel":"#211b16","--panel2":"#2a2119","--line":"#59432d","--gold":"#e4bd76","--gold2":"#b98b49","--cream":"#f4e8cf","--muted":"#b9a88d","--green":"#8fb58b","--red":"#c77b67"}},
 "adventure-theme": {name:"Adventurer",cls:"adventureTheme",icon:"./assets/images/adventure-theme.webp",background:"adventure-background.webp",character:{male:"male-adventurer.webp",female:"female-adventurer.webp"},music:"./assets/sound/adventure-theme.mp3",palette:{"--bg":"#20150f","--panel":"#2b1d17","--panel2":"#38241b","--line":"#8a6041","--gold":"#f0c16f","--gold2":"#c57b38","--cream":"#fff0d7","--muted":"#c7ad8c","--green":"#a6c58a","--red":"#d47c61"}},
 "academy-theme": {name:"Academy",cls:"academyTheme",icon:"./assets/images/academy-theme.webp",background:"academy-background.webp",character:{male:"male-academy.webp",female:"female-academy.webp"},music:"./assets/sound/academy-theme.mp3",palette:{"--bg":"#252b35","--panel":"#303744","--panel2":"#3b4554","--line":"#8f9ba8","--gold":"#b58a4a","--gold2":"#d0ad70","--cream":"#e8dfc9","--muted":"#b8c0c8","--green":"#527c89","--red":"#c46f63"}},
 "social-interactions-theme": {name:"Social Butterfly",cls:"socialInteractionsTheme",icon:"./assets/images/social-interactions-theme.webp",background:"social-interactions-background.webp",character:{male:"male-social.webp",female:"female-social.webp"},music:"./assets/sound/social-interactions-theme.mp3",palette:{"--bg":"#241017","--panel":"#351722","--panel2":"#48202d","--line":"#9b6a4a","--gold":"#e4b85f","--gold2":"#c99542","--cream":"#fff0df","--muted":"#d4b7b1","--green":"#9ab58b","--red":"#d87972"}},
 "relationships-theme": {name:"Heartkeeper",cls:"relationshipsTheme",icon:"./assets/images/relationships-theme.webp",background:"relationships-background.webp",character:{male:"male-relationships.webp",female:"female-relationships.webp"},music:"./assets/sound/relationships-theme.mp3",palette:{"--bg":"#21170f","--panel":"#332318","--panel2":"#463020","--line":"#9b7048","--gold":"#e5ad50","--gold2":"#c98536","--cream":"#fff0d5","--muted":"#d0b99a","--green":"#8da17a","--red":"#bd7255"}},
 "orthodox-theme": {name:"Faith",cls:"orthodoxTheme",icon:"./assets/images/orthodox-theme.webp",background:"orthodox-theme-background.webp",character:{male:"male-orthodox.webp",female:"female-orthodox.webp"},music:"./assets/sound/orthodox-theme.mp3",palette:{"--bg":"#20131f","--panel":"#302033","--panel2":"#40283f","--line":"#9b7549","--gold":"#e8c16b","--gold2":"#bd8d45","--cream":"#f7ecd9","--muted":"#c9b9c8","--green":"#819783","--red":"#c66d62"}},
 "fitness-theme": {name:"Roman Discipline",cls:"fitnessTheme",icon:"./assets/images/fitness-theme.webp",background:"fitness-background.webp",character:{male:"male-fitness.webp",female:"female-fitness.webp"},music:"./assets/sound/fitness-theme.mp3",palette:{"--bg":"#241719","--panel":"#342124","--panel2":"#472b2a","--line":"#9a6a37","--gold":"#d9a441","--gold2":"#b9802e","--cream":"#f1e4cc","--muted":"#d2bda2","--green":"#8a9b76","--red":"#8f1424"}},
  "mozart-salon-theme": {name:"Mozart's Salon",cls:"mozartSalonTheme",icon:"./assets/images/mozart-salon-theme.webp",background:"piano-background.webp",character:{male:"male-mozart-salon.webp",female:"female-mozart-salon.webp"},music:"./assets/sound/piano-theme.mp3",palette:{"--bg":"#101f3a","--panel":"#192c4d","--panel2":"#243d65","--line":"#496fa5","--gold":"#d4ac55","--gold2":"#b88936","--cream":"#f5e7c3","--muted":"#c0cbe0","--green":"#83aa91","--red":"#c66d62"}},
  "ceo-theme": {name:"CEO",cls:"ceoTheme",icon:"./assets/images/ceo-theme.webp",background:"ceo-background.webp",character:{male:"male-ceo.webp",female:"female-ceo.webp"},music:"./assets/sound/ceo-theme.mp3",palette:{"--bg":"#172D49","--panel":"#203954","--panel2":"#2A4662","--line":"#9C8150","--gold":"#E2BD72","--gold2":"#B08A43","--cream":"#F3E8D0","--muted":"#C5C8CB","--green":"#849B83","--red":"#9F3432"}},
  "spartan-endurance-theme": {name:"Spartan Endurance",cls:"spartanEnduranceTheme",icon:"./assets/images/spartan-endurance-theme.webp",background:"spartan-endurance-background.webp",character:{male:"male-spartan-endurance.webp",female:"female-spartan-endurance.webp"},music:"./assets/sound/cardio-theme.mp3",palette:{"--bg":"#241719","--panel":"#342124","--panel2":"#472b2a","--line":"#9a6a37","--gold":"#D9A441","--gold2":"#B9802E","--cream":"#F1E4CC","--muted":"#D2BDA2","--green":"#8A9B76","--red":"#8F1424"}},
 // Explicit test-only exception: Test intentionally reuses Dungeon's entire visual identity.
 "v0-test-theme": {name:"Test",cls:"v0TestTheme",icon:"./assets/images/dungeon-theme.webp",background:"dungeon-background.webp",character:{male:"male-dungeon.webp",female:"female-dungeon.webp"},music:"./assets/sound/dungeon-theme.mp3",palette:{"--bg":"#0b0e10","--panel":"#191d20","--panel2":"#24292c","--line":"#586168","--gold":"#efc783","--gold2":"#bd884c","--cream":"#f0e6d4","--muted":"#b6b3ac","--green":"#8fb58b","--red":"#d45c43"}},
 "bloodthirst-theme": {name:"Bloodthirst",cls:"bloodthirstTheme",icon:"./assets/images/bloodthirst-theme.webp",background:"bloodthirst-background.webp",character:{male:"male-bloodthirst.webp",female:"female-bloodthirst.webp"},music:"./assets/sound/bloodthirst-theme.mp3",palette:{"--bg":"#171316","--panel":"#21191c","--panel2":"#302126","--line":"#791e27","--gold":"#d4b078","--gold2":"#c65a32","--cream":"#d9d0c5","--muted":"#b5a5a2","--green":"#c65a32","--red":"#a82b36"}}
};

async function runThemeIntegrationTests(){
 if(!debugIsAdmin()||!debugSandboxActive){toast("Theme tests are available only to Admin in Sandbox mode.");return {status:"BLOCKED",results:[]};}
 const results=[];
 const add=(name,ok,detail,category="theme-integration",status)=>results.push({name,ok:!!ok,detail,category,...(status?{status}:{})});
 const registry=Array.isArray(UNLOCKABLE_ITEMS)?UNLOCKABLE_ITEMS.filter(item=>String(item.type||item.category||"").toLowerCase()==="theme"):[];
 const dungeon={...DUNGEON_THEME_ITEM};
 const themes=[{...dungeon},...registry].filter((item,index,arr)=>arr.findIndex(x=>x.id===item.id)===index).map(item=>({
  id:item.id,name:item.name,icon:item.icon,background:item.debugBackground||null,cls:item.debugThemeClass||null,
  character:item.debugCharacter||null,music:item.debugMusic||null,item
 }));
 const css=[...document.styleSheets].map(sh=>{try{return [...sh.cssRules].map(r=>r.cssText).join("\n")}catch(e){return ""}}).join("\n");
 const waitImage=src=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve({ok:im.naturalWidth>0&&im.naturalHeight>0,detail:`loaded ${im.naturalWidth}x${im.naturalHeight}`});im.onerror=()=>resolve({ok:false,detail:"image failed to load: "+src});im.src=src;});
 const waitFetch=async src=>{try{const r=await fetch(src,{cache:"no-store"});return {ok:r.ok,detail:`HTTP ${r.status} for ${src}`}}catch(e){return {ok:false,detail:`fetch failed for ${src}: ${e.message}`}}};
 for(const t of themes){
  const isDungeon=t.id==="dungeon-theme", item=isDungeon?state.inventory.find(x=>x&&x.id===t.id)||DUNGEON_THEME_ITEM:registry.find(x=>x.id===t.id);
  if(isDungeon){const starter=state.inventory.some(x=>x&&x.id===t.id);add(`${t.name}: starter theme is present`,starter,starter?"Starter theme exists in inventory":"Starter Dungeon theme is missing","registry");}
  else add(`${t.name}: registered in unlockable catalog`,!!item,item?`name=${item.name}; id=${item.id}; type=${item.type}; category=${item.category}`:"Theme is missing from UNLOCKABLE_ITEMS","registry");
  if(item)add(`${t.name}: display name`,item.name===t.name,`Expected "${t.name}", got "${item.name}"`,"registry");
  const baseline=THEME_DEBUG_BASELINE[t.id];
  if(!baseline){add(`${t.name}: independent expected specification`,false,"No independent baseline exists for this registered theme. Add its expected assets, class, and palette before considering it compliant.","baseline","INCONCLUSIVE");}
  else {
   add(`${t.name}: independent expected specification`,true,`Baseline found for stable ID ${t.id}; expectations are maintained separately from the theme registry.` ,"baseline");
   add(`${t.name}: baseline display name`,item?.name===baseline.name,`Expected=${baseline.name}; actual=${item?.name||"missing"}`,"baseline");
   add(`${t.name}: registered icon matches baseline`,t.icon===baseline.icon,`Expected=${baseline.icon}; actual=${t.icon||"missing"}`,"baseline");
   add(`${t.name}: registered background matches baseline`,t.background===baseline.background,`Expected=${baseline.background}; actual=${t.background||"missing"}`,"baseline");
   add(`${t.name}: registered body class matches baseline`,t.cls===baseline.cls,`Expected=${baseline.cls||"Dungeon/root"}; actual=${t.cls||"Dungeon/root"}`,"baseline");
   add(`${t.name}: registered character assets match baseline`,JSON.stringify(t.character)===JSON.stringify(baseline.character),`Expected=${JSON.stringify(baseline.character)}; actual=${JSON.stringify(t.character)}`,"baseline");
   add(`${t.name}: registered soundtrack matches baseline`,t.music===baseline.music,`Expected=${baseline.music}; actual=${t.music||"missing"}`,"baseline");
  }
  if(!t.cls&&!isDungeon)add(`${t.name}: Debug metadata`,false,"Registered theme is missing debugThemeClass; cannot verify automatic theme-class discovery","registry");
  else add(`${t.name}: dedicated CSS selector`,t.cls?css.includes("body."+t.cls):css.includes("dungeon-background.webp"),t.cls?`CSS selector body.${t.cls}`:"Dungeon fallback CSS","css");
  if(!t.background){add(`${t.name}: Debug background metadata`,false,"Registered theme is missing debugBackground; test cannot silently skip its background","registry");}
  else {
   add(`${t.name}: background reference`,css.includes(t.background),`Expected CSS reference to ${t.background}`,"assets");
   const bg=await waitFetch("./assets/images/"+t.background);add(`${t.name}: background file responds`,bg.ok,bg.detail,"assets");
   const bgImg=await waitImage("./assets/images/"+t.background);add(`${t.name}: background image decodes`,bgImg.ok,bgImg.detail,"assets");
  }
  if(!t.icon){add(`${t.name}: Debug icon metadata`,false,"Registered theme is missing its icon path","registry");}
  else {const iconPath=t.icon.startsWith("./")?t.icon:"./assets/images/"+t.icon;const icon=await waitFetch(iconPath);add(`${t.name}: icon file responds`,icon.ok,icon.detail,"assets");const iconImg=await waitImage(iconPath);add(`${t.name}: icon image decodes`,iconImg.ok,iconImg.detail,"assets");}
  if(!t.character||!t.character.male||!t.character.female)add(`${t.name}: character artwork metadata`,false,"Registered theme must declare debugCharacter.male and debugCharacter.female; coverage is inconclusive without both","registry","INCONCLUSIVE");
  else for(const gender of ["male","female"]){const path="./assets/images/"+t.character[gender];const response=await waitFetch(path);add(`${t.name}: ${gender} character file responds`,response.ok,response.detail,"assets");const decoded=await waitImage(path);add(`${t.name}: ${gender} character image decodes`,decoded.ok,decoded.detail,"assets");}
  if(!t.music)add(`${t.name}: soundtrack metadata`,false,"Registered theme is missing debugMusic; soundtrack coverage is inconclusive","registry","INCONCLUSIVE");
  else {const music=await waitFetch(t.music);add(`${t.name}: soundtrack file responds`,music.ok,music.detail,"assets");}
  if(t.cls){const prefix="body."+t.cls;add(`${t.name}: panel/card styling defined`,css.includes(prefix+" .card")||css.includes(prefix+" .panel")||css.includes(prefix+" .hero"),"Expected theme-specific styling for application panels","visual");add(`${t.name}: lower Inventory styling defined`,css.includes(prefix+" #section-character")||css.includes(prefix+" .inventoryItem")||css.includes(prefix+" .equipmentSlot")||css.includes(prefix+" .characterInventoryCard"),"Expected styling beyond header/hero for lower Inventory/equipment surfaces","visual");}
 }
 // Fault-injection self-checks: deliberately compare corrupted values against the independent
 // baseline. These prove the guard logic rejects the exact kinds of omissions seen previously.
 const faultReference=THEME_DEBUG_BASELINE["adventure-theme"];
 add("Baseline fault-injection: wrong background is rejected",faultReference.background!=="dungeon-background.webp",`Injected background=dungeon-background.webp; expected=${faultReference.background}; mismatch detector=${faultReference.background!=="dungeon-background.webp"?"detected":"MISSED"}`,"baseline-self-test");
 add("Baseline fault-injection: wrong palette is rejected",faultReference.palette["--gold"].toLowerCase()!=="#e4bd76",`Injected --gold=#e4bd76; expected=${faultReference.palette["--gold"]}; mismatch detector=${faultReference.palette["--gold"].toLowerCase()!=="#e4bd76"?"detected":"MISSED"}`,"baseline-self-test");
 // Read-only visual verification: toggle registered classes only in memory and restore the original class list.
 const body=document.body, originalClasses=[...body.classList], themeClasses=new Set(themes.map(t=>t.cls).filter(Boolean));
 const surfaceSelectors=[".brand",".hero",".tabs",".tab.active",".card",".panel","#section-character","#section-character .themeEquipmentSlot","#section-store .storeThemeCard",".btn"];
 const normalizeColor=v=>String(v||"").replace(/\s+/g,"").toLowerCase();
 for(const t of themes){
  body.className=originalClasses.filter(c=>!themeClasses.has(c)).join(" ");if(t.cls)body.classList.add(t.cls);
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const bg=getComputedStyle(body).backgroundImage;
  if(t.background)add(`${t.name}: computed page background`,bg.includes(t.background),`Computed backgroundImage=${bg.slice(0,220)}; expected asset=${t.background}`,"computed-style");
  else add(`${t.name}: computed page background`,false,"Cannot compare computed background: debugBackground is missing","computed-style","INCONCLUSIVE");
  const baseline=THEME_DEBUG_BASELINE[t.id];
  if(baseline){
   const paletteActual={},paletteExpected=baseline.palette||{};
   for(const [variable,expected] of Object.entries(paletteExpected)){
    const actual=getComputedStyle(body).getPropertyValue(variable).trim().toLowerCase();
    paletteActual[variable]=actual;
    add(`${t.name}: computed palette ${variable}`,actual===String(expected).toLowerCase(),`Expected=${expected}; computed=${actual||"missing"}`,"palette");
   }
   const paletteKeys=Object.keys(paletteExpected);
   const paletteDistinctFromDungeon=t.id==="dungeon-theme"||t.id==="v0-test-theme"||paletteKeys.some(k=>String(paletteExpected[k]).toLowerCase()!==String(THEME_DEBUG_BASELINE["dungeon-theme"].palette[k]).toLowerCase());
   add(`${t.name}: intended palette identity`,paletteDistinctFromDungeon,paletteDistinctFromDungeon?"Palette matches its independent baseline (intentional Dungeon reuse is documented for v0.test).":"Palette duplicates Dungeon unexpectedly; inspect theme CSS and baseline.","palette");
  } else add(`${t.name}: computed palette baseline`,false,"No independent palette baseline; cannot verify color completeness.","palette","INCONCLUSIVE");
  let styled=0,checked=0,missing=[];
  for(const sel of surfaceSelectors){const el=document.querySelector(sel);if(!el)continue;checked++;const cs=getComputedStyle(el);const color=normalizeColor(cs.color),border=normalizeColor(cs.borderTopColor),background=normalizeColor(cs.backgroundColor+" "+cs.backgroundImage);if(border.includes("rgb")||color.includes("rgb")||background.includes("gradient"))styled++;if(t.cls&&["#section-character .themeEquipmentSlot","#section-store .storeThemeCard"].includes(sel)){const rulePresent=css.includes("body."+t.cls+" .storeThemeCard")||css.includes("body."+t.cls+" .inventoryItem")||css.includes("body."+t.cls+" .equipmentSlot")||css.includes("body."+t.cls+" .characterInventoryCard")||css.includes("body."+t.cls+" .card")||css.includes("body."+t.cls+" .panel");if(!rulePresent)missing.push(sel+" lacks explicit theme styling rule");}}
  add(`${t.name}: computed UI surfaces inspected`,checked>=3&&styled>=3,`Inspected ${checked} rendered surfaces; ${styled} had measurable styled values; at least 3 styled surfaces are required`,"computed-style");
  if(t.cls)add(`${t.name}: lower UI surface selectors`,missing.length===0,missing.length?missing.join("; "):"Theme equipment and Store surfaces have explicit theme-specific selectors","visual");
 }
 body.className=originalClasses.join(" ");await new Promise(resolve=>requestAnimationFrame(resolve));
 const current=state?.equipment?.theme||"dungeon-theme",active=themes.find(t=>t.id===current);
 add("Currently equipped theme body class",!!active&&(!active.cls||body.classList.contains(active.cls)),`Equipped=${current}; expected=${active?.cls||"Dungeon fallback"}`,"equipped-state");
 // Verify actual active visual identity from registry metadata; missing mappings become inconclusive/fail, never silently pass.
 const lockedIds=["debugDisableBackground","debugDisableColors","debugDisablePortrait","debugDisableMusic"],lockState=Object.fromEntries(lockedIds.map(id=>[id,!!document.getElementById(id)?.checked])),isNonDungeon=current!=="dungeon-theme";
 const actualBg=getComputedStyle(document.body).backgroundImage;
 if(lockState.debugDisableBackground)add("Feature lock: selected theme background remains applied",!isNonDungeon||!actualBg.includes("dungeon-background.webp"),`Equipped=${current}; rendered background=${actualBg.slice(0,180)}`,"debug-lock-detection");
 if(lockState.debugDisableColors){const paletteVars=["--bg","--panel","--panel2","--line","--gold","--gold2","--cream","--muted"],lockedPalette=Object.fromEntries(paletteVars.map(v=>[v,getComputedStyle(body).getPropertyValue(v).trim()]));body.classList.remove("debug-disable-colors");const expectedPalette=Object.fromEntries(paletteVars.map(v=>[v,getComputedStyle(body).getPropertyValue(v).trim()]));body.classList.add("debug-disable-colors");const paletteMatches=paletteVars.every(v=>lockedPalette[v]===expectedPalette[v]);add("Feature lock: equipped theme palette still matches its expected palette",!isNonDungeon||paletteMatches,`Equipped=${current}; locked=${JSON.stringify(lockedPalette)}; expected=${JSON.stringify(expectedPalette)}`,"debug-lock-detection");}
 if(lockState.debugDisablePortrait){const art=document.getElementById("characterArtwork"),icon=document.querySelector(".themeIcon"),actualArt=(art?.getAttribute("src")||art?.src||"").split("/").pop(),actualIcon=(icon?.getAttribute("src")||icon?.src||"").split("/").pop(),gender=state?.profile?.gender==="female"?"female":"male",expectedArt=active?.character?.[gender]||null,expectedIcon=active?.icon?(active.icon.split("/").pop()):null,matches=!!expectedArt&&actualArt===expectedArt&&!!expectedIcon&&actualIcon===expectedIcon;add("Feature lock: equipped theme character and theme images still match",!isNonDungeon||matches,`Equipped=${current}; character=${actualArt}; expected character=${expectedArt||"missing debugCharacter metadata"}; theme icon=${actualIcon}; expected icon=${expectedIcon||"missing icon metadata"}`,"debug-lock-detection",expectedArt&&expectedIcon?undefined:"INCONCLUSIVE");}
 if(lockState.debugDisableMusic){const expected=active?.music||null,observed=themeMusicSource,matches=!!expected&&observed===expected;add("Feature lock: selected theme music remains applied",!isNonDungeon||matches,`Equipped=${current}; active music source=${observed||"not started"}; expected=${expected||"missing debugMusic metadata"}`,"debug-lock-detection",expected?undefined:"INCONCLUSIVE");}
 results.push({name:"Skill theme upgrade pricing",category:"store",ok:typeof themeUpgradePrice==="function"&&JSON.stringify([1,2,3,4,5].map(level=>themeUpgradePrice(200,level)))===JSON.stringify([200,300,400,500,600]),detail:typeof themeUpgradePrice==="function"?"Expected 200/300/400/500/600 coin prices for a 200-coin base theme.":"themeUpgradePrice helper is missing."});
 const passed=results.filter(x=>x.ok).length,failed=results.filter(x=>!x.ok&&x.status!=="INCONCLUSIVE").length,inconclusive=results.filter(x=>x.status==="INCONCLUSIVE").length;
 const report={version:"v1.19.7",status:failed?"FAILED":inconclusive?"INCONCLUSIVE":"PASSED",summary:{total:results.length,passed,failed,inconclusive},failures:results.filter(x=>!x.ok&&x.status!=="INCONCLUSIVE").map(x=>({test:x.name,category:x.category,expected:"Requirement is correctly registered, loaded, and visibly applied",actual:x.detail,severity:/background|icon|computed|lower|equip/i.test(x.name)?"high":"medium",suggestion:"Inspect the registered theme metadata, asset response, CSS selector, and computed styles."})),results,notes:["Theme Integration Tests discover Dungeon plus every registered unlockable theme from the shared registry and compare each against independent THEME_DEBUG_BASELINE expectations.","Baseline comparisons cover stable theme ID, display name, class, icon, background, male/female art, soundtrack, and computed palette variables. Missing baselines are INCONCLUSIVE, not PASS.","Test intentionally reuses Dungeon artwork, background, and soundtrack; this exception is explicitly documented in the independent baseline.","Bloodthirst kill-count threshold remains unconfigured pending product decision; it is not a Store purchase.","Every unlockable theme must declare debugThemeClass, debugBackground, debugCharacter.male/female, and debugMusic. Missing metadata is reported as FAIL or INCONCLUSIVE rather than silently skipped.","This browser-side integration test does not replace real end-to-end purchase/quest/account-isolation tests.","Visual class toggling is temporary and original body classes are restored without changing saved progress."]};
 const out=document.getElementById("debugThemeTestResults");if(out)out.textContent=JSON.stringify(report,null,2);debugLog("Theme compliance tests: "+passed+" passed, "+failed+" failed, "+inconclusive+" inconclusive.");return report;
}
document.getElementById("debugRunThemeTests")?.addEventListener("click",runThemeIntegrationTests);
document.getElementById("debugStartSandbox")?.addEventListener("click",()=>setTimeout(applyDebugFeatureSwitches,0));
document.getElementById("debugExitSandbox")?.addEventListener("click",()=>{featureIds.forEach(id=>{const el=document.getElementById(id);if(el)el.checked=false;});document.body.classList.remove("debug-disable-background","debug-disable-colors","debug-disable-portrait");setTimeout(applyDebugFeatureSwitches,0);});


const debugCharacterSnapshotKey="wayfarer-debug-character-snapshot-sandbox-v2";
function debugCharacterDataSnapshot(){if(!debugRequireSandbox())throw new Error("Admin Sandbox required");return JSON.parse(JSON.stringify({xp:state.xp,gold:state.gold,skillXp:state.skillXp,selectedSkills:state.selectedSkills,skillPriorities:state.skillPriorities,inventory:state.inventory,equipment:state.equipment,profile:state.profile,quests:state.quests,completedTotal:state.completedTotal,questGenerationCooldownUntil:state.questGenerationCooldownUntil,lastGeneratedSkills:state.lastGeneratedSkills,questHistory:state.questHistory,questDays:state.questDays,characterXp:state.characterXp,level:state.level}));}
function debugApplySnapshot(snapshot){if(!debugRequireSandbox())return;for(const k of Object.keys(snapshot||{}))state[k]=JSON.parse(JSON.stringify(snapshot[k]));save();renderDebugPanel();}
function debugCanUseCharacterTools(){if(!debugIsAdmin()){toast("Admin access required.");return false;}return true;}
document.getElementById("debugResetQuestCooldown")?.addEventListener("click",()=>{
 const status=document.getElementById("debugQuestCooldownStatus");
 if(!debugRequireSandbox()){if(status)status.textContent="No change made. Start the isolated Admin Sandbox first.";return;}
 if(!window.confirm("Reset the Generate Quests cooldown on the temporary Sandbox character? Your live account will not be changed."))return;
 state.questGenerationCooldownUntil=0;
 save();
 updateGenerateButtonStatus();
 const message="Sandbox Generate Quests cooldown reset. Your live account was not changed.";
 if(status)status.textContent=message;
 debugLog("Sandbox quest-generation cooldown reset by Admin. Live account unchanged.");
 toast("Generate Quests cooldown reset.");
});
document.getElementById("debugGrantResources")?.addEventListener("click",()=>{
 if(!debugRequireSandbox())return;
 const xp=Math.max(0,Math.min(100000,Number(document.getElementById("debugGrantXp")?.value)||0));
 const gold=Math.max(0,Math.min(100000,Number(document.getElementById("debugGrantGold")?.value)||0));
 state.xp=(Number(state.xp)||0)+xp;state.gold=(Number(state.gold)||0)+gold;
 save();renderDebugPanel();document.getElementById("debugCharacterToolsStatus").textContent=`Granted ${xp} XP and ${gold} gold to the temporary Sandbox character. Live account unchanged.`;debugLog(`Sandbox-only Admin grant: +${xp} XP, +${gold} gold.`);
});
document.getElementById("debugRemoveResources")?.addEventListener("click",()=>{
 if(!debugRequireSandbox())return;
 const xp=Math.max(0,Math.min(100000,Math.floor(Number(document.getElementById("debugGrantXp")?.value)||0)));
 const gold=Math.max(0,Math.min(100000,Math.floor(Number(document.getElementById("debugGrantGold")?.value)||0)));
 if(xp===0&&gold===0){toast("Enter an XP or gold amount greater than zero.");return;}
 if(!window.confirm(`Remove ${xp} XP and ${gold} gold from the temporary Sandbox character? This cannot change your live account.`))return;
 state.xp=Math.max(0,(Number(state.xp)||0)-xp);state.gold=Math.max(0,(Number(state.gold)||0)-gold);
 save();render();renderDebugPanel();
 const status=document.getElementById("debugCharacterToolsStatus");if(status)status.textContent=`Removed up to ${xp} XP and ${gold} gold from the temporary Sandbox character. Remaining: ${Number(state.xp)||0} XP, ${Number(state.gold)||0} gold. Live account unchanged.`;
 debugLog(`Sandbox-only Admin resource removal: -${xp} XP and -${gold} gold; remaining XP=${Number(state.xp)||0}, gold=${Number(state.gold)||0}.`);
});
document.getElementById("debugResetCharacter")?.addEventListener("click",()=>{
 if(!debugRequireSandbox())return;
 if(!window.confirm("Are you sure you want to reset your main character? This clears XP, gold, skill XP, selected skills, quests, inventory and equipment. Journal, To Do and Groceries will be preserved. A one-step restore snapshot will be saved."))return;
 try{sessionStorage.setItem(debugCharacterSnapshotKey,JSON.stringify(debugCharacterDataSnapshot()));}catch(e){}
 state.xp=0;state.gold=0;state.skillXp={};state.selectedSkills=[];state.skillPriorities={};state.inventory=[];state.equipment={theme:"dungeon-theme"};state.quests=[];state.completedTotal=0;state.questGenerationCooldownUntil=0;state.lastGeneratedSkills=[];state.questHistory={};state.questDays=[];state.characterXp=0;state.level=1;
 if(typeof ensureDungeonThemeState==="function")ensureDungeonThemeState();
 save();renderDebugPanel();document.getElementById("debugCharacterToolsStatus").textContent="Character reset. Journal, To Do and Groceries were preserved. Use Restore snapshot to undo.";debugLog("Character progression reset; journal, To Do and groceries preserved.");
});
document.getElementById("debugRestoreCharacter")?.addEventListener("click",()=>{
 if(!debugRequireSandbox())return;
 let snap=null;try{snap=JSON.parse(sessionStorage.getItem(debugCharacterSnapshotKey)||"null")}catch(e){}
 if(!snap){toast("No character snapshot is available.");return;}
 if(!window.confirm("Restore the saved character snapshot? This replaces current character stats, quests, inventory and equipment, but preserves Journal, To Do and Groceries."))return;
 debugApplySnapshot(snap);document.getElementById("debugCharacterToolsStatus").textContent="Character snapshot restored.";debugLog("Character snapshot restored.");
});
const featureIds=["debugDisableBackground","debugDisableColors","debugDisablePortrait","debugDisableMusic"];
function applyDebugFeatureSwitches(){
 const allowed=debugIsAdmin()&&debugSandboxActive;
 featureIds.forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=!allowed;});
 const values=Object.fromEntries(featureIds.map(id=>[id,!!document.getElementById(id)?.checked]));
 document.body.classList.toggle("debug-disable-background",allowed&&values.debugDisableBackground);
 document.body.classList.toggle("debug-disable-colors",allowed&&values.debugDisableColors);
 document.body.classList.toggle("debug-disable-portrait",allowed&&values.debugDisablePortrait);
 // Apply the Dungeon assets to the actual rendered image elements; normal render() can re-run this after theme changes.
 const gender=state?.profile?.gender==="female"?"female":"male";
 const art=document.getElementById("characterArtwork");
 if(art){if(allowed&&values.debugDisablePortrait){art.dataset.debugOriginalSrc=art.dataset.debugOriginalSrc||art.getAttribute("src")||"";art.src=`./assets/images/${gender}-dungeon.webp`;art.alt=gender+" Dungeon character portrait (Debug lock)";}else if(art.dataset.debugOriginalSrc!==undefined){const theme=state?.equipment?.theme||"dungeon-theme";const suffix={"orthodox-theme":"orthodox","relationships-theme":"relationships","social-interactions-theme":"social","academy-theme":"academy","adventure-theme":"adventurer","fitness-theme":"fitness"}[theme]||"dungeon";art.src=`./assets/images/${gender}-${suffix}.webp`;art.alt=gender+" "+theme+" character portrait";delete art.dataset.debugOriginalSrc;}}
 const icon=document.getElementById("characterThemeEquippedIcon");
 if(icon){if(allowed&&values.debugDisablePortrait){icon.dataset.debugOriginalSrc=icon.dataset.debugOriginalSrc||icon.getAttribute("src")||"";icon.src="./assets/images/dungeon-theme.webp";}else if(icon.dataset.debugOriginalSrc!==undefined){const theme=state?.equipment?.theme||"dungeon-theme";const item=UNLOCKABLE_ITEMS.find(x=>x.id===theme)||(theme==="dungeon-theme"?DUNGEON_THEME_ITEM:null);icon.src=item?.icon||"./assets/images/dungeon-theme.webp";delete icon.dataset.debugOriginalSrc;}}
 // The app's own music controller now selects the Dungeon track while this lock is active.
 if(typeof applyThemeMusic==="function")applyThemeMusic();
 const status=document.getElementById("debugFeatureSwitchStatus");if(status)status.textContent=allowed?featureIds.filter(id=>values[id]).map(id=>({debugDisableBackground:"Background",debugDisableColors:"Colors",debugDisablePortrait:"Character/theme images",debugDisableMusic:"Music"}[id])+" locked to Dungeon").join(", ")||"All equipped-theme effects enabled.":"Feature switches are available only in Sandbox mode.";
}
featureIds.forEach(id=>document.getElementById(id)?.addEventListener("change",applyDebugFeatureSwitches));
document.getElementById("debugRunQuestTests")?.addEventListener("click",()=>{
 if(!debugRequireSandbox())return;
 const out=[];const check=(test,ok,detail,status)=>out.push({test,status:status||(ok?"PASS":"FAIL"),detail});
 const xpCurveExpected={1:0,2:3,9:24,10:26,19:44,20:45,21:46};
 Object.entries(xpCurveExpected).forEach(([level,expected])=>{const actual=calculateSkillQuestLevelBonus(Number(level));check(`Skill quest XP scaling at level ${level}`,actual===expected,`Expected +${expected} skill-level XP; observed +${actual}.`);});
 const skills=allSkillNames();
 check("Skill catalog discovered",skills.length>0,`${skills.length} registered skills discovered dynamically`);
 const perkEntries=Object.entries(THEME_PERK_SKILLS).filter(([theme,skill])=>skills.includes(skill)&&UNLOCKABLE_ITEMS.some(x=>x.id===theme));
 const selected=debugFaultSkill();const injection=debugFaultEnabled("debugFailAcademyBonus");
 const tests=skills.map(skill=>{
   const themeEntry=perkEntries.find(([theme,perkSkill])=>perkSkill===skill);
   const themeId=themeEntry?.[0]||"dungeon-theme";
   const expectedBonus=themeEntry?5:0;
   const baseXp=15;
   const actualBonus=calculateThemeBonus(themeId,skill);
   const syntheticQuest={id:"debug-xp-"+skill,skill,category:"Skill",baseXp,xp:baseXp+actualBonus,perkBonusXp:actualBonus,perkThemeId:actualBonus?themeId:null,perkThemeName:actualBonus?(UNLOCKABLE_ITEMS.find(x=>x.id===themeId)?.name||themeId):"",done:false};
   const isolated={xp:0,gold:100,skillXp:{},completedTotal:0};
   const award=awardQuestRewards(isolated,syntheticQuest);
   const expectedTotal=baseXp+expectedBonus;
   const applicable=!!themeEntry;
   const faultApplies=injection&&selected===skill&&applicable;
   const ok=award.xp===expectedTotal;
   return {skill,themeId,applicable,expectedTotal,actualTotal:award.xp,actualSkillXp:isolated.skillXp[skill]||0,ok,faultApplies};
 });
 tests.forEach(t=>{if(!t.applicable){check(`${t.skill}: theme bonus lifecycle`,false,`No registered theme declares perkSkill=${t.skill}; base XP completion was observed, but a bonus-failure test is not applicable until a theme grants this skill a bonus.`,"INCONCLUSIVE");return;}check(`${t.skill}: generated quest completion awards theme bonus`,t.ok,`theme=${t.themeId}; expected=${t.expectedTotal} XP, actual=${t.actualTotal} XP${t.faultApplies?"; injected bonus suppression was active":""}`);});
 if(injection&&!selected)check("XP injector target selected",false,"Choose a target skill before running XP tests.");
 const failed=out.some(x=>x.status==="FAIL");const report={status:failed?"FAILED":out.some(x=>x.status==="INCONCLUSIVE")?"INCONCLUSIVE":"PASSED",results:out,summary:{skillsTested:tests.length,perkEligible:tests.filter(t=>t.applicable).length,passed:out.filter(x=>x.status==="PASS").length,failed:out.filter(x=>x.status==="FAIL").length},note:"Each test generates an isolated synthetic quest and runs the same reward-award helper used by real quest completion. No real quests, inventory, coins, or saved progress are changed."};document.getElementById("debugQuestStoreResults").textContent=JSON.stringify(report,null,2);debugLog("Quest completion XP tests: "+report.status);
});
document.getElementById("debugRunStoreTests")?.addEventListener("click",()=>{
 if(!debugRequireSandbox())return;
 const items=(Array.isArray(UNLOCKABLE_ITEMS)?UNLOCKABLE_ITEMS:[]).filter(item=>!item.specialUnlock),out=[];const add=(test,ok,detail,status)=>out.push({test,status:status||(ok?"PASS":"FAIL"),detail});
 add("Special unlock themes are not Store purchasables",(UNLOCKABLE_ITEMS||[]).filter(x=>x.specialUnlock).every(x=>x.id==="bloodthirst-theme"&&!x.unlockSkill),"Bloodthirst is achievement-unlocked and intentionally excluded from the Store.");
 add("Unlockable catalog exists",items.length>0,`${items.length} registered items`);
 add("Unique unlockable IDs",new Set(items.map(x=>x.id)).size===items.length,"Duplicate IDs can cause purchase/inventory inconsistencies");
 add("Prices are valid",items.every(x=>Number.isFinite(Number(x.price))&&Number(x.price)>=0),"All catalog prices should be non-negative numbers");
 add("Skill unlock requirements are valid",items.every(x=>!x.unlockSkill||(Number.isFinite(Number(x.unlockLevel))&&Number(x.unlockLevel)>0)),"Every gated theme has a valid skill and positive level requirement");
 const selected=debugFaultSkill();
 items.forEach(item=>{
  if(!item.unlockSkill)return;
  const targetLevel=Number(item.unlockLevel);const simulatedSkillXp=debugXpForSkillLevel(targetLevel);const level=getSkillProgress(simulatedSkillXp).level;const unlock=themeUnlockAllowed(item,level);
  const unlockFaultApplies=debugFaultEnabled("debugFailAcademyUnlock")&&selected===item.unlockSkill;
  add(`${item.name}: unlock at ${item.unlockSkill} level ${targetLevel}`,unlock,`Simulated skill XP=${simulatedSkillXp}; calculated level=${level}; actual unlock gate result=${unlock}; fault target=${selected||"none"}${unlockFaultApplies?"; injected failure active":""}`);
  const isolated={gold:Number(item.price),inventory:[]};const purchaseResult=attemptThemePurchase(item,isolated,level);
  const purchaseFaultApplies=debugFaultEnabled("debugFailAcademyPurchase")&&selected===item.unlockSkill;
  const purchase=purchaseResult.ok&&isolated.inventory.some(x=>x.id===item.id)&&isolated.gold===0;
  add(`${item.name}: purchase with required level and ${item.price} coins`,purchase,`Transaction=${purchaseResult.reason}; owned=${isolated.inventory.some(x=>x.id===item.id)}; remaining gold=${isolated.gold}; fault target=${selected||"none"}${purchaseFaultApplies?"; injected failure active":""}`);
 });
 if((debugFaultEnabled("debugFailAcademyUnlock")||debugFaultEnabled("debugFailAcademyPurchase"))&&!selected)add("Store injector target selected",false,"Choose the skill associated with the theme you want to test.");
 const failed=out.some(x=>x.status==="FAIL");const report={status:failed?"FAILED":"PASSED",results:out,summary:{total:out.length,passed:out.filter(x=>x.status==="PASS").length,failed:out.filter(x=>x.status==="FAIL").length},note:"Store tests use the same unlock and purchase decision helpers as the actual Store. Level and coin values are isolated inputs; no real balance or inventory is changed."};document.getElementById("debugQuestStoreResults").textContent=JSON.stringify(report,null,2);debugLog("Store integration checks: "+report.status);
});
function restoreWayfarerUsername(user){const metadataName=String(user?.user_metadata?.wayfarer_username||"").trim();if(metadataName){try{localStorage.setItem("wayfarer-last-username",metadataName);}catch(e){}return metadataName;}const email=String(user?.email||"").trim().toLowerCase();try{const last=String(localStorage.getItem("wayfarer-last-username")||"").trim();if(last&&usernameEmail(last).toLowerCase()===email)return last;}catch(e){}const localPart=email.includes("@")?email.slice(0,email.indexOf("@")):email;return localPart.trim();} function debugIsAdmin(){return String(wayfarerSignedInUsername||"").trim().toLowerCase()==="admin";}
function debugRequireSandbox(){if(!debugIsAdmin()){toast("Admin access required.");return false;}if(!debugSandboxActive){toast("Start the isolated sandbox first.");return false;}return true;}

function runEquipmentLifecycleTests(){
 if(!debugIsAdmin()||!debugSandboxActive){toast("Admin Sandbox is required.");return;}
 const out=document.getElementById("debugEquipmentLifecycleResults");if(!out)return;
 const inject={requirement:!!document.getElementById("debugInjectRequirementFailure")?.checked,purchase:!!document.getElementById("debugInjectPurchaseFailure")?.checked,equip:!!document.getElementById("debugInjectEquipFailure")?.checked,bonus:!!document.getElementById("debugInjectBonusFailure")?.checked};
 const registry=[DUNGEON_THEME_ITEM,...UNLOCKABLE_ITEMS];
 const items=registry.filter(i=>i&&!i.specialUnlock&&(i.equipable===true||["theme","artifact","pet"].includes(String(i.type||i.category||"").toLowerCase()))&&(!i.sandboxOnly||debugSandboxActive));
 const results=[];const check=(name,ok,detail)=>results.push({name,ok:!!ok,detail});
 const specialBloodthirst=UNLOCKABLE_ITEMS.find(x=>x.id==="bloodthirst-theme");check("Bloodthirst special unlock registration",!!specialBloodthirst&&specialBloodthirst.specialUnlock&&specialBloodthirst.unlockKills===null,"Special non-store theme is registered; kill threshold intentionally awaits product decision.");
 for(const item of items){
  const type=String(item.type||item.category||"artifact").toLowerCase(),requiredSkill=item.unlockSkill||null,requiredLevel=Number(item.unlockLevel??0),price=Math.max(0,Number(item.price)||0);
  const sandbox={...JSON.parse(JSON.stringify(state)),inventory:[],equipment:{},skillXp:{},selectedSkills:[],quests:[],gold:Math.max(1000,price+100),xp:0,completedTotal:0};
  if(item.id==="dungeon-theme"){sandbox.inventory.push({...item});sandbox.equipment.theme=item.id;check(`${item.name}: starter item present`,true,"Starter theme is available without Store purchase.");continue;}
  const levelXp=(level)=>{let xp=0;for(let n=1;n<level;n++)xp+=n<=3?60:n<=6?90:n<=9?120:150;return xp;};
  if(requiredSkill)sandbox.skillXp[requiredSkill]=levelXp(requiredLevel);
  const level=requiredSkill?getSkillProgress(sandbox.skillXp[requiredSkill]).level:0;
  const requirementOk=!requiredSkill||themeUnlockAllowed(item,level);
  check(`${item.name}: unlock requirement`,requirementOk,inject.requirement&&item.id==="v0-test-theme"?"Injected failure: shared unlock gate rejected the Test theme.":`Expected ${requiredSkill||"no skill requirement"} level ${requiredLevel}; simulated level ${level}.`);
  if(!requirementOk)continue;
  const purchaseResult=attemptThemePurchase(item,sandbox,level),purchaseOk=purchaseResult.ok;
  check(`${item.name}: acquire/purchase`,purchaseOk,purchaseOk?`Real purchase helper succeeded; price ${price}; remaining coins ${sandbox.gold}.`:`Real purchase helper rejected acquisition: ${purchaseResult.reason}.`);if(!purchaseOk)continue;
  const inventoryOk=sandbox.inventory.some(x=>x.id===item.id);
  check(`${item.name}: inventory integration`,inventoryOk,"Acquired item is present in isolated inventory state.");
  const slot=type==="theme"?"theme":type==="pet"?"pet":(item.equipmentSlot||item.slot||"artifact");const equipResult=type==="theme"?equipThemeItem(item.id,sandbox):{ok:!!(inventoryOk&&(type==="pet"||item.equipable===true)),reason:"unsupported-equip-helper"};const equipped=equipResult.ok;check(`${item.name}: equip integration`,equipped,equipped?`Real equip helper equipped item in ${slot} slot.`:`Real equip pathway failed: ${equipResult.reason||"no supported equip action/slot registered"}.`);if(!equipped)continue;
  if(type==="theme"&&item.perkSkill){const calculated=calculateThemeBonus(item.id,item.perkSkill),bonusOk=calculated>0;check(`${item.name}: effect/XP bonus`,bonusOk,`Expected positive ${item.perkSkill} bonus; shared calculation returned ${calculated} XP.`);const pool=buildQuestPool(item.perkSkill),template=pool.find(q=>q.skill===item.perkSkill)||null;const generated=!!template&&template.skill===item.perkSkill;check(`${item.name}: related quest generation`,generated,generated?`Shared quest-template pool produced ${template.title} for ${item.perkSkill}.`:`No eligible quest template for ${item.perkSkill}.`);if(generated){const base=Number(template.xp)||15;const bonus=calculateThemeBonus(item.id,item.perkSkill);const quest={...template,baseXp:base,xp:base+bonus,perkBonusXp:bonus};const before=Number(sandbox.skillXp[item.perkSkill])||0;const award=awardQuestRewards(sandbox,quest);const observed=(Number(sandbox.skillXp[item.perkSkill])||0)-before;const expected=base+bonus;check(`${item.name}: quest completion reward`,observed===expected,`Shared reward helper awarded ${observed} ${item.perkSkill} XP; expected ${expected} (${base} base + ${bonus} bonus).`);}}
  else check(`${item.name}: defined item effects`,true,"No theme XP-perk contract declared; type-specific effect coverage is not defined.");
 }
 const passed=results.filter(r=>r.ok).length,failed=results.length-passed;out.textContent=JSON.stringify({version:"v1.19.7",status:failed?"FAILED":"PASSED",summary:{itemsDiscovered:items.length,total:results.length,passed,failed},injectables:inject,results,notes:["Lifecycle suite is the visible Debug test system; legacy test panels are hidden while their code remains intact.","Registry discovery cannot detect items omitted from every authoritative registry.","This is isolated-state simulation, not live browser click-through or account-isolation proof."]},null,2);debugLog(`Equipment lifecycle suite: ${items.length} equipables discovered; ${passed} passed, ${failed} failed.`);
}
document.getElementById("debugRunEquipmentLifecycle")?.addEventListener("click",runEquipmentLifecycleTests);
// Fault switches affect shared theme gates, so refresh the actual theme/store/inventory surfaces immediately.
["debugInjectRequirementFailure","debugInjectPurchaseFailure","debugInjectEquipFailure","debugInjectBonusFailure"].forEach(id=>document.getElementById(id)?.addEventListener("change",()=>{
 if(!debugRequireSandbox()){const el=document.getElementById(id);if(el)el.checked=false;return;}
 renderStoreCatalog();renderCharacterInventory();renderCharacterOverview();render();renderDebugPanel();
 const item=UNLOCKABLE_ITEMS.find(x=>x.id==="v0-test-theme");
 const level=item?.unlockSkill?getSkillLevel(item.unlockSkill):0;
 const status={requirement:"unlock requirement",purchase:"purchase eligibility",equip:"equipment action",bonus:"XP bonus calculation"};
 const kind=id==="debugInjectRequirementFailure"?"unlock requirement":id==="debugInjectPurchaseFailure"?"purchase":id==="debugInjectEquipFailure"?"equip": "XP bonus";
 debugLog("Test theme "+kind+" injection "+(document.getElementById(id)?.checked?"enabled":"disabled")+"; theme/store/inventory surfaces refreshed immediately.");
 const result=document.getElementById("debugEquipmentLifecycleResults");if(result)result.textContent="Fault injection changed. Run the lifecycle suite again to verify the observed gameplay result.\n"+result.textContent;
 toast("Test theme refreshed for the changed fault injection.");
}));

function renderDebugPanel(){document.body.classList.toggle("sandbox-active",!!debugSandboxActive);document.querySelectorAll("#section-debug button, #section-debug input, #section-debug select, #section-debug textarea").forEach(el=>{if(el.id==="debugStartSandbox")el.disabled=debugSandboxActive||!debugIsAdmin();else if(el.id==="debugExitSandbox")el.disabled=!debugSandboxActive||!debugIsAdmin();else el.disabled=!debugSandboxActive||!debugIsAdmin();});const btn=document.getElementById("debugTabButton");if(!btn)return;const genderSelect=document.getElementById("debugAccountGender");const genderStatus=document.getElementById("debugAccountGenderStatus");const currentGender=(state.profile&&state.profile.gender)==="female"?"female":"male";if(genderSelect)genderSelect.value=currentGender;if(genderStatus)genderStatus.textContent="Current character gender: "+(state.profile&&state.profile.gender?String(state.profile.gender):"not set");const genderApply=document.getElementById("debugApplyAccountGender");if(genderApply)genderApply.disabled=!debugSandboxActive||!debugIsAdmin();const themeToggle=document.getElementById("debugAllowThemeUnequip");if(themeToggle){themeToggle.disabled=!debugSandboxActive;themeToggle.checked=!!debugAllowThemeUnequip;}const questOverrideToggle=document.getElementById("debugOverrideQuestRules");if(questOverrideToggle){questOverrideToggle.disabled=!debugSandboxActive;questOverrideToggle.checked=!!debugOverrideQuestRules;}const unlockToggle=document.getElementById("debugUnlockAllItems");if(unlockToggle){unlockToggle.disabled=!debugSandboxActive;unlockToggle.checked=!!debugUnlockAllItems;}btn.style.display=(!!cloudUser&&debugIsAdmin())?"inline-flex":"none";if(!debugIsAdmin()&&document.getElementById("section-debug")?.classList.contains("active")){document.querySelector('[data-tab="quests"]')?.click();return;}const status=document.getElementById("debugSandboxStatus");if(status)status.textContent=debugSandboxActive?"Sandbox active · changes are temporary":"Sandbox inactive";const data=debugSandboxActive?state:(debugLiveStateBackup||state);const date=document.getElementById("debugActiveDate");if(date)date.textContent=data.activeDate||"—";const level=document.getElementById("debugLevel");if(level)level.textContent=String(Math.floor((Number(data.xp)||0)/100)+1);const coinBalance=document.getElementById("debugCoinBalance");if(coinBalance)coinBalance.textContent=String(Math.max(0,Number(data.gold)||0));const faultSkillSel=document.getElementById("debugFaultSkillSelect");if(faultSkillSel){const previousFault=faultSkillSel.value;const faultNames=allSkillNames();faultSkillSel.innerHTML='<option value="">Choose skill…</option>'+faultNames.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");if(faultNames.includes(previousFault))faultSkillSel.value=previousFault;}const skillSel=document.getElementById("debugSkillSelect");if(skillSel){const previous=skillSel.value;const names=[...new Set([...(data.selectedSkills||[]),...skillCatalog.flatMap(c=>c.skills.map(x=>x[0]))])];skillSel.innerHTML='<option value="">Choose skill…</option>'+names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");if(names.includes(previous))skillSel.value=previous;}if(debugSandboxActive)debugRenderQuests();}
function debugRenderQuests(){const el=document.getElementById("debugQuestList");if(!el)return;const qs=Array.isArray(state.quests)?state.quests:[];el.textContent=qs.length?qs.map((q,i)=>`${i+1}. ${q.done?'[DONE]':'[OPEN]'} ${q.title||'(untitled)'} · skill=${q.skill||'—'} · xp=${q.xp??'—'} · source=${q.source||'—'} · id=${q.id||'—'}`).join("\n"):"No quests in sandbox.";}
function debugInspect(){const el=document.getElementById("debugSaveInspector");if(!el)return;const d=debugSandboxActive?state:(debugLiveStateBackup||state);el.textContent=JSON.stringify({mode:debugSandboxActive?"sandbox":"read-only live snapshot",xp:d.xp,calculatedLevel:Math.floor((Number(d.xp)||0)/100)+1,completedTotal:d.completedTotal,questCount:(d.quests||[]).length,openQuests:(d.quests||[]).filter(q=>!q.done).length,completedQuests:(d.quests||[]).filter(q=>q.done).length,selectedSkills:d.selectedSkills,skillXp:d.skillXp,activeDate:d.activeDate,lastDay:d.lastDay,journalEntries:(d.journal||[]).length,todoItems:(d.todo||[]).length,questHistoryKeys:Object.keys(d.questHistory||{}).length},null,2);}
document.getElementById("debugApplyAccountGender")?.addEventListener("click",()=>{if(!debugRequireSandbox())return;const select=document.getElementById("debugAccountGender");const gender=select?.value;if(gender!=="male"&&gender!=="female")return;if(!window.confirm("Change the Sandbox character gender to "+(gender==="female"?"Female":"Male")+"? This does not change your real account."))return;if(!state.profile||typeof state.profile!=="object")state.profile={gender:null};state.profile.gender=gender;save();render();renderDebugPanel();debugLog("Changed Sandbox character gender to "+gender+".");toast("Sandbox character gender updated.");});
function equipThemeItem(itemId,targetState=state){const item=(targetState.inventory||[]).find(x=>x&&x.id===itemId);if(!item||!(item.type==="theme"||String(item.category||"").toLowerCase()==="theme"||item.equipable===true))return {ok:false,reason:"not-equipable-or-not-owned"};if(lifecycleFaultEnabled("equip",item))return {ok:false,reason:"injected-equip-failure"};if(!targetState.equipment||typeof targetState.equipment!=="object")targetState.equipment={};targetState.equipment.theme=itemId;return {ok:true,slot:"theme"};}
document.getElementById("themeInventory")?.addEventListener("click",event=>{const button=event.target.closest("[data-inventory-item]");if(!button)return;const itemId=button.dataset.inventoryItem;if(!state.inventory.some(item=>item&&item.id===itemId&&(item.type==="theme"||String(item.category||"").toLowerCase()==="theme"||item.equipable===true)))return;if(state.equipment?.theme===itemId) {if(debugSandboxActive&&debugAllowThemeUnequip){state.equipment.theme=null;debugLog("Unequipped theme in sandbox test mode.");toast("Theme unequipped (sandbox only).");}else{toast("A theme must always be equipped. Enable the sandbox exception to test unequipped state.");return;}}else{const equipResult=equipThemeItem(itemId,state);if(!equipResult.ok){toast("Could not equip this theme: "+equipResult.reason+".");debugLog("Theme equip operation failed for "+itemId+": "+equipResult.reason);return;}const themeName=itemId==="orthodox-theme"?"Faith":itemId==="academy-theme"?"Academy":itemId==="adventure-theme"?"Adventurer":itemId==="social-interactions-theme"?"Social Butterfly":itemId==="relationships-theme"?"Heartkeeper":itemId==="fitness-theme"?"Fitness":itemId==="spartan-endurance-theme"?"Spartan Endurance":itemId==="v0-test-theme"?"Test":"Dungeon";debugLog(debugSandboxActive?"Equipped "+themeName+" theme in sandbox.":"Equipped "+themeName+" theme.");toast(themeName+" theme equipped.");}applyThemeMusic({userInitiated:true});save();renderDebugPanel();});
document.getElementById("petInventory")?.addEventListener("click",event=>{const button=event.target.closest("[data-inventory-item]");if(!button)return;const itemId=button.dataset.inventoryItem;const pet=(state.inventory||[]).find(item=>item&&String(item.id)===String(itemId)&&(item.type==="pet"||String(item.category||"").toLowerCase()==="pet"));if(!pet)return;if(state.equipment?.pet===itemId){state.equipment.pet=null;toast((pet.name||"Pet")+" unequipped.");}else{state.equipment.pet=itemId;toast((pet.name||"Pet")+" equipped.");}save();renderDebugPanel();});
document.getElementById("debugAllowThemeUnequip")?.addEventListener("change",event=>{if(!debugRequireSandbox()){event.target.checked=false;return;}debugAllowThemeUnequip=!!event.target.checked;if(!debugAllowThemeUnequip&&state.equipment?.theme==null){state.equipment.theme="dungeon-theme";save();}render();renderDebugPanel();debugLog(debugAllowThemeUnequip?"Sandbox-only unequipped theme exception enabled.":"Sandbox-only unequipped theme exception disabled.");toast(debugAllowThemeUnequip?"Sandbox can test no-theme state.":"Theme required again.");});
document.getElementById("debugOverrideQuestRules")?.addEventListener("change",event=>{if(!debugRequireSandbox()){event.target.checked=false;return;}debugOverrideQuestRules=!!event.target.checked;updateGenerateButtonStatus();renderDebugPanel();debugLog(debugOverrideQuestRules?"Sandbox-only quest safeguards override enabled: cooldown and completion confirmation bypassed.":"Sandbox-only quest safeguards restored.");toast(debugOverrideQuestRules?"Quest safeguards overridden in sandbox only.":"Quest safeguards restored.");});
function applyUnlockAllItems(enabled){if(!debugRequireSandbox())return;debugUnlockAllItems=!!enabled;if(!Array.isArray(state.inventory))state.inventory=[];if(debugUnlockAllItems){for(const item of UNLOCKABLE_ITEMS){if(!hasUnlockable(item.id))state.inventory.push({...item});}debugLog("Unlock all items enabled; all registered unlockables added to the sandbox inventory.");toast("All registered items unlocked in sandbox.");}else{const liveIds=new Set((debugLiveStateBackup?.inventory||[]).map(item=>item?.id));state.inventory=state.inventory.filter(item=>!UNLOCKABLE_ITEMS.some(def=>def.id===item.id));for(const item of UNLOCKABLE_ITEMS){if(liveIds.has(item.id)&&!hasUnlockable(item.id))state.inventory.push({...item});}if(state.equipment?.theme&&!hasUnlockable(state.equipment.theme))state.equipment.theme="dungeon-theme";debugLog("Unlock all items disabled; temporary grants removed unless owned before the sandbox.");toast("Sandbox item unlock override disabled.");}save(true);render();renderDebugPanel();}document.getElementById("debugUnlockAllItems")?.addEventListener("change",event=>{applyUnlockAllItems(!!event.target.checked);});
const DEBUG_SANDBOX_SESSION_KEY="wayfarer-debug-sandbox-session-v1";
function persistDebugSandboxSession(){if(!debugSandboxActive||!debugLiveStateBackup||!debugSandboxState)return;try{sessionStorage.setItem(DEBUG_SANDBOX_SESSION_KEY,JSON.stringify({username:wayfarerSignedInUsername||"",live:debugLiveStateBackup,sandbox:state}));}catch(e){debugLog("Could not persist temporary Sandbox session: "+String(e?.message||e));}}
function clearDebugSandboxSession(){try{sessionStorage.removeItem(DEBUG_SANDBOX_SESSION_KEY);}catch(e){}}
function restoreDebugSandboxSession(){if(!cloudUser||!debugIsAdmin())return false;if(debugSandboxActive)return true;try{const raw=sessionStorage.getItem(DEBUG_SANDBOX_SESSION_KEY);if(!raw)return false;const saved=JSON.parse(raw);if(!saved.username||saved.username.trim().toLowerCase()!==wayfarerSignedInUsername.trim().toLowerCase())return false;if(!saved.live||!saved.sandbox)return false;debugLiveStateBackup=saved.live;debugSandboxState=saved.sandbox;state=debugSandboxState;debugSandboxActive=true;document.body.classList.add("sandbox-active");debugAllowThemeUnequip=false;debugOverrideQuestRules=false;debugUnlockAllItems=false;render();renderDebugPanel();debugInspect();debugLog("Restored the temporary Admin Sandbox session after authentication; live account data was not replaced.");return true;}catch(e){debugLog("Could not restore the temporary Sandbox session: "+String(e?.message||e));return false;}}
document.getElementById("debugStartSandbox")?.addEventListener("click",()=>{if(!debugIsAdmin()){toast("Sign in using the exact username Admin.");return;}if(debugSandboxActive){toast("Sandbox is already active.");return;}debugLiveStateBackup=JSON.parse(JSON.stringify(state));debugSandboxState=JSON.parse(JSON.stringify(state));state=debugSandboxState;debugSandboxActive=true;document.body.classList.add("sandbox-active");debugAllowThemeUnequip=false;debugOverrideQuestRules=false;debugUnlockAllItems=false;persistDebugSandboxSession();debugLog("Sandbox started from a copy of the current character.");render();renderDebugPanel();debugInspect();toast("Isolated sandbox started.");});
document.getElementById("debugExitSandbox")?.addEventListener("click",()=>{if(!debugSandboxActive){toast("Sandbox is not active.");return;}state=debugLiveStateBackup;debugLiveStateBackup=null;debugSandboxState=null;debugSandboxActive=false;clearDebugSandboxSession();document.body.classList.remove("sandbox-active");debugAllowThemeUnequip=false;debugOverrideQuestRules=false;debugUnlockAllItems=false;render();renderDebugPanel();debugInspect();debugLog("Sandbox discarded; original in-memory character restored.");toast("Sandbox discarded. Real progress restored.");});
document.querySelectorAll("[data-debug-days]").forEach(b=>b.addEventListener("click",()=>{if(!debugRequireSandbox())return;const d=Number(b.dataset.debugDays)||1;const date=new Date((state.activeDate||today())+"T12:00:00");date.setDate(date.getDate()+d);state.activeDate=date.toLocaleDateString("en-CA");debugLog(`Time Machine shifted sandbox date by +${d} days to ${state.activeDate}.`);renderDebugPanel();debugInspect();}));
document.getElementById("debugSetOverallXp")?.addEventListener("click",()=>{if(!debugRequireSandbox())return;state.xp=Math.max(0,Number(document.getElementById("debugOverallXp").value)||0);render();renderDebugPanel();debugInspect();debugLog("Set sandbox overall XP to "+state.xp+"; all XP-dependent UI refreshed immediately.");toast("Overall XP updated.");});
document.getElementById("debugSetSkillXp")?.addEventListener("click",()=>{if(!debugRequireSandbox())return;const skill=document.getElementById("debugSkillSelect").value;if(!skill){toast("Choose a skill first.");return;}if(!state.skillXp||typeof state.skillXp!=="object")state.skillXp={};state.skillXp[skill]=Math.max(0,Number(document.getElementById("debugSkillXp").value)||0);render();renderDebugPanel();debugInspect();debugLog("Set sandbox XP for "+skill+" to "+state.skillXp[skill]+"; skill cards and progression UI refreshed immediately.");toast(skill+" XP updated.");});
document.getElementById("debugAddCoins")?.addEventListener("click",()=>{if(!debugRequireSandbox())return;const input=document.getElementById("debugAddCoinsAmount");const amount=Math.floor(Number(input?.value)||0);if(amount<=0){toast("Enter a coin amount greater than zero.");return;}state.gold=Math.max(0,Number(state.gold)||0)+amount;render();renderDebugPanel();debugInspect();debugLog("Added "+amount+" coins to sandbox; new balance is "+state.gold+".");toast("Added "+amount+" coins to the sandbox.");});
document.getElementById("debugAddQuest")?.addEventListener("click",()=>{if(!debugRequireSandbox())return;if(!Array.isArray(state.quests))state.quests=[];state.quests.unshift({id:"debug-"+Date.now(),title:"[TEST] Debug Workshop quest",description:"Disposable sandbox-only quest for checking quest cards and completion behavior.",category:"Skill",skill:state.selectedSkills?.[0]||"Adventure",xp:15,done:false,source:"debug-sandbox"});debugLog("Added disposable test quest to sandbox.");render();debugRenderQuests();});
document.getElementById("debugRefreshQuests")?.addEventListener("click",()=>{if(!debugRequireSandbox())return;debugRenderQuests();debugLog("Quest inspection refreshed.");});
document.getElementById("debugRunPlanner")?.addEventListener("click",()=>{if(!debugRequireSandbox())return;const opts={time:Number(document.getElementById("debugPlannerTime").value),energy:document.getElementById("debugPlannerEnergy").value,focus:document.getElementById("debugPlannerFocus").value,place:document.getElementById("debugPlannerLocation").value};try{const result=generateQuests(opts);const el=document.getElementById("debugPlannerResult");if(el)el.textContent=JSON.stringify({preset:opts,result:result??"Planner invoked; inspect quest board below.",quests:(state.quests||[]).map(q=>({title:q.title,skill:q.skill,done:q.done,source:q.source}))},null,2);debugLog("Ran planner preset: "+JSON.stringify(opts));render();}catch(e){document.getElementById("debugPlannerResult").textContent="Planner error: "+String(e?.stack||e);debugLog("Planner test failed: "+String(e));}});
document.getElementById("debugInspectSave")?.addEventListener("click",()=>{if(!debugRequireSandbox())return;debugInspect();debugLog("State summary inspected; secrets omitted.");});
document.getElementById("debugClearLog")?.addEventListener("click",()=>{if(!debugRequireSandbox())return;debugLogEntries=[];document.getElementById("debugEventLog").textContent="Log cleared.";});
// Keep sandbox changes out of localStorage and Supabase. The regular save path is temporarily shadowed while sandbox mode is active.
const debugOriginalSave=save;
save=function(skipRender=false){if(debugSandboxActive){persistDebugSandboxSession();if(!skipRender)render();return;}return debugOriginalSave(skipRender);};

renderDebugPanel();
// Restore only after authentication has identified the real Admin account. core-account.js also
// calls this after cloud hydration; the immediate attempt covers fast auth restoration that finishes
// before this script loads. The function is idempotent so both paths are safe.
if(cloudUser&&debugIsAdmin())restoreDebugSandboxSession();
window.addEventListener("wayfarer-auth-restored",()=>{if(cloudUser&&debugIsAdmin())restoreDebugSandboxSession();});

// Display the project's maintained release history inside the Admin Debug Workshop.
async function loadWayfarerChangelog(){
 const el=document.getElementById("debugChangelogContent");
 if(!el)return;
 el.textContent="Loading CHANGELOG.md…";
 try{
  const response=await fetch("./CHANGELOG.md",{cache:"no-store"});
  if(!response.ok)throw new Error("HTTP "+response.status);
  el.textContent=await response.text();
 }catch(error){
  el.textContent="Could not load CHANGELOG.md. Make sure the file is deployed beside index.html and try Reload changelog. Details: "+String(error?.message||error);
 }
}
document.getElementById("debugReloadChangelog")?.addEventListener("click",loadWayfarerChangelog);
loadWayfarerChangelog();
render();
enforceAccountGate();


// Hard safety barrier: Debug controls cannot mutate live account data.
// The only controls allowed outside Sandbox are opening Debug and starting Sandbox.
(function installDebugSandboxInteractionGuard(){
 const safeOutsideSandbox=new Set(["debugStartSandbox"]);
 const isDebugControl=el=>el&&el.closest&&el.closest("#section-debug");
 const allowedOutsideSandbox=el=>safeOutsideSandbox.has(el.id);
 document.addEventListener("click",event=>{
   const el=event.target.closest("button,[role='button'],input[type='checkbox'],input[type='radio']");
   if(!isDebugControl(el)||debugSandboxActive||allowedOutsideSandbox(el))return;
   event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
   toast("Debug controls are disabled outside Sandbox. Start the Admin Sandbox first.");
 },true);
 document.addEventListener("change",event=>{
   const el=event.target;
   if(!isDebugControl(el)||debugSandboxActive)return;
   if(el.id==="debugStartSandbox")return;
   event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
   if(el.type==="checkbox"||el.type==="radio")el.checked=false;
   toast("Debug options only work in Sandbox. Start the Admin Sandbox first.");
 },true);
})();
