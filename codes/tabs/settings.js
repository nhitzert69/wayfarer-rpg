/* v2.3.9: Settings owns synchronization of its form controls and labels. */
(()=>{
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
const renderSettingsControls = function(settings = state?.settings || {}) {
 for(const [id,val] of Object.entries(settings)) {
  const el=document.getElementById(id);
  if(!el) continue;
  if(el.type==="checkbox") el.checked=!!val;
  else if(el.type==="range" || el.type==="number") el.value=String(val);
  else if(el.tagName==="SELECT" || el.tagName==="INPUT" || el.tagName==="TEXTAREA") el.value=String(val ?? "");
 }
 const volume=document.getElementById("musicVolume");
 const volumeLabel=document.getElementById("musicVolumeValue");
 if(volume&&volumeLabel) volumeLabel.textContent=`${Math.max(0,Math.min(100,Number(volume.value)||0))}%`;
};
const REQUIRED=new Set(["quests","character","store","skills","settings"]);
const LABELS={todo:"☑ To Do",groceries:"🛒 Groceries",journal:"📜 Journal",chess:"♟ Chess",reflux:"🌿 Reflux Guide",debug:"🛠 Debug"};
function renderTabVisibility(){
 const el=document.getElementById("tabVisibilityOptions");if(!el)return;
 // The account may hydrate after this module initializes; controls must still render.
 if(!cloudUser){el.replaceChildren();return;}
 const settings=state.settings||(state.settings={});
 const hidden=Array.isArray(settings.hiddenTabs)?settings.hiddenTabs:[];
 el.replaceChildren();
 for(const [id,name] of Object.entries(LABELS)){
  if((id==="debug"||id==="reflux")&&!(typeof debugIsAdmin==="function"&&debugIsAdmin()))continue;
  const label=document.createElement("label");label.className="field";label.style.cssText="display:flex;align-items:center;gap:10px";
  const input=document.createElement("input");input.type="checkbox";input.checked=!hidden.includes(id);input.style.width="auto";
  input.addEventListener("change",()=>{
   const next=new Set(Array.isArray(settings.hiddenTabs)?settings.hiddenTabs:[]);
   if(input.checked)next.delete(id);else next.add(id);
   settings.hiddenTabs=[...next].filter(x=>!REQUIRED.has(x));
   if(!input.checked&&document.querySelector(".tab.active")?.dataset.tab===id)activateWayfarerTab("settings");
   save(true);enforceAccountGate();
  });label.append(input,document.createTextNode(" "+name));el.appendChild(label);
 }
}
const settingsRenderer = function() { renderSettingsControls(state?.settings || {});renderTabVisibility(); };
settingsRenderer.renderControls = renderSettingsControls;
window.WayfarerTabRenderers.settings = settingsRenderer;
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.settings = function() { settingsRenderer(); };
})();
