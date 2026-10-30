// Independent Kingdoms login and map test. No Wayfarer globals or saves.
const $=id=>document.getElementById(id);
const status=$("authStatus"),form=$("authForm"),actions=$("accountActions"),ready=$("ready");
const CONFIG=window.KOTU_AUTH_CONFIG;
// Standalone orientation gate replaces the retired Wayfarer-hosted overlay gate.
const orientationQuery=window.matchMedia("(max-width: 900px) and (orientation: portrait)");
function updateOrientation(){ $("rotateGate").hidden=!orientationQuery.matches; }
if(orientationQuery.addEventListener)orientationQuery.addEventListener("change",updateOrientation);
else orientationQuery.addListener(updateOrientation);
window.addEventListener("resize",updateOrientation);
updateOrientation();
let client=null,mode="login",cleanup=null,activeUser=null,loadGeneration=0;

let sandboxActive=false;
const allowedDebugNames=new Set(["admin","chatgpt"]);
const safeMap=name=>["human","greek","undead"].includes(name)?name:"human";
const authenticatedName=user=>{
  const email=String(user?.email||"").toLowerCase();
  return email.endsWith("@wayfarer.example")?email.slice(0,-"@wayfarer.example".length):"";
};
const debugAllowed=()=>!!activeUser&&allowedDebugNames.has(authenticatedName(activeUser));
const storageKey=kind=>"kotu-v1:"+activeUser.id+":"+kind;
function readMap(kind){try{return safeMap(localStorage.getItem(storageKey(kind)));}catch{return "human";}}
function saveMap(){if(!activeUser)return;try{localStorage.setItem(storageKey(sandboxActive?"sandbox-map":"live-map"),safeMap($("faction").value));}catch(error){console.warn("Map preference storage unavailable",error);}}
function refreshDebug(){
  const allowed=debugAllowed();
  if(!allowed)sandboxActive=false;
  $("debugToggle").hidden=!allowed;
  if(!allowed)$("debugPanel").hidden=true;
  $("sandboxBadge").hidden=!sandboxActive;
  $("sandboxToggle").textContent=sandboxActive?"Exit Sandbox":"Enter Sandbox";
  $("sandboxToggle").setAttribute("aria-pressed",String(sandboxActive));
  $("debugModeStatus").textContent=sandboxActive?"Sandbox active · isolated test preferences":"Live mode · normal preferences";
}
function setSandbox(enabled){
  if(!debugAllowed()||sandboxActive===enabled)return;
  sandboxActive=enabled;
  $("faction").value=readMap(enabled?"sandbox-map":"live-map");
  refreshDebug();
  if(!$("world").hidden)enterWorld();
}
$("debugToggle").onclick=()=>{if(debugAllowed())$("debugPanel").hidden=!$("debugPanel").hidden;};
$("sandboxToggle").onclick=()=>setSandbox(!sandboxActive);

function message(text){status.textContent=text;}
function showForm(create){mode=create?"create":"login";form.hidden=false;actions.hidden=true;ready.hidden=true;$("formTitle").textContent=create?"Create account":"Log in";$("pin").autocomplete=create?"new-password":"current-password";}
function signedOut(){activeUser=null;sandboxActive=false;$("debugPanel").hidden=true;refreshDebug();ready.hidden=true;form.hidden=true;actions.hidden=false;message("Log in or create an account to play.");}
function signedIn(user){const changed=activeUser?.id!==user.id;activeUser=user;if(changed){sandboxActive=false;$("debugPanel").hidden=true;$("faction").value=readMap("live-map");}refreshDebug();form.hidden=true;actions.hidden=true;ready.hidden=false;$("welcome").textContent="Welcome, "+String(user.user_metadata?.wayfarer_username||user.email?.split("@")[0]||"Commander");message("Account ready.");}
$("showLogin").onclick=()=>showForm(false);
$("showCreate").onclick=()=>showForm(true);
$("cancelAuth").onclick=signedOut;
$("return").onclick=()=>{if(window.parent!==window){window.parent.postMessage({type:"kotu-return"},"*");}else{window.location.href="../index.html";}};
$("logout").onclick=async()=>{if(client)await client.auth.signOut();signedOut();};
const menuToggle=$("menuToggle"),menuPanel=$("menuPanel");
function closeGameMenu(){menuPanel.hidden=true;$("debugPanel").hidden=true;menuToggle.setAttribute("aria-expanded","false");}
menuToggle.onclick=()=>{const open=menuPanel.hidden;menuPanel.hidden=!open;menuToggle.setAttribute("aria-expanded",String(open));};
document.addEventListener("pointerdown",event=>{if(!event.target.closest(".game-menu"))closeGameMenu();});
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeGameMenu();});
$("back").onclick=()=>{loadGeneration++;$("terrainLoading").hidden=true;closeGameMenu();cleanup?.();cleanup=null;$("world").hidden=true;$("title").hidden=false;};
$("authForm").onsubmit=async e=>{
  e.preventDefault();
  if(!client)return message("Authentication service unavailable.");
  const username=$("username").value.trim(),pin=$("pin").value;
  if(!/^[A-Za-z0-9_-]{3,20}$/.test(username)||!/^[0-9]{8,32}$/.test(pin))return message("Use a 3–20 character username and an 8–32 digit PIN.");
  $("submitAuth").disabled=true;message(mode==="create"?"Creating account…":"Logging in…");
  try{
    const email=username.toLowerCase()+"@wayfarer.example";
    const result=mode==="create"
      ?await client.auth.signUp({email,password:pin,options:{data:{wayfarer_username:username}}})
      :await client.auth.signInWithPassword({email,password:pin});
    if(result.error)throw result.error;
    if(!result.data.session)throw new Error("Account created but no session returned. Check Supabase email confirmation settings.");
    signedIn(result.data.user);
  }catch(error){message(error.message||"Login failed.");}
  finally{$("submitAuth").disabled=false;}
};
async function enterWorld(){
  if(!activeUser)return;
  const generation=++loadGeneration;
  closeGameMenu();
  cleanup?.();cleanup=null;
  $("title").hidden=true;$("world").hidden=false;
  $("worldStatus").hidden=true;
  $("terrainLoading").hidden=false;
  $("terrainLoadingMessage").textContent="Loading terrain and textures";
  try{
    const {startTerrain}=await import("./terrain.js");
    if(generation!==loadGeneration)return;
    const dispose=await startTerrain($("world"),$("faction").value);
    if(generation!==loadGeneration){dispose();return;}
    cleanup=dispose;
    $("terrainLoading").hidden=true;
  }catch(error){
    if(generation!==loadGeneration)return;
    $("terrainLoading").hidden=true;
    $("worldStatus").hidden=false;
    $("worldStatus").textContent="Could not load map: "+String(error.message||error);
  }
}
$("play").onclick=enterWorld;
$("faction").onchange=()=>{saveMap();if(!$("world").hidden)enterWorld();};
(async()=>{
  try{
    if(!window.supabase?.createClient)throw new Error("Authentication library unavailable.");
    client=window.supabase.createClient(CONFIG.url,CONFIG.anonKey,{auth:{storageKey:"kotu-auth-session-v1",persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    const {data,error}=await client.auth.getSession();if(error)throw error;
    if(data.session?.user)signedIn(data.session.user);else signedOut();
    client.auth.onAuthStateChange((event,session)=>{if(event==="SIGNED_OUT")signedOut();else if(session?.user)signedIn(session.user);});
  }catch(error){message("Authentication unavailable: "+String(error.message||error));actions.hidden=true;}
})();
