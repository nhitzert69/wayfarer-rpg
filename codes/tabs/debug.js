// Debug tab entry point. Privileged actions retain their explicit Admin/Sandbox guards.
window.WayfarerTabModules.debug = function(){ if(typeof renderDebugPanel === "function") renderDebugPanel(); };
