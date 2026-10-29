/* v2.3.9: Settings owns synchronization of its form controls and labels. */
(()=>{
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
const renderSettingsControls = function(settings = window.state?.settings || {}) {
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
const settingsRenderer = function() { renderSettingsControls(window.state?.settings || {}); };
settingsRenderer.renderControls = renderSettingsControls;
window.WayfarerTabRenderers.settings = settingsRenderer;
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.settings = function() { settingsRenderer(); };
})();
