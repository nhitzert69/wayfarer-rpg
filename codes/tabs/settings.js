/* Wayfarer settings tab renderer. Loaded on first tab selection. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.settings = function() {
 for(const [id,val] of Object.entries(state.settings)){const el=document.getElementById(id);if(el&&el.type!=="checkbox"&&el.type!=="range")el.value=val}
};
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.settings = function() { window.WayfarerTabRenderers.settings(); };
