/* v2.1.1: IIFE isolates tab-local declarations so modules can preload together. */
(()=>{
/* Wayfarer settings tab renderer. Loaded on first tab selection. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.settings = function() {
 for(const [id,val] of Object.entries(state.settings)){const el=document.getElementById(id);if(!el)continue;if(el.type==="checkbox")el.checked=!!val;else if(el.type==="range")el.value=String(val);else el.value=val;}
 const volume=document.getElementById("musicVolume");const volumeLabel=document.getElementById("musicVolumeValue");if(volume&&volumeLabel)volumeLabel.textContent=`${Number(volume.value)||0}%`;
};
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.settings = function() { window.WayfarerTabRenderers.settings(); };
})();
