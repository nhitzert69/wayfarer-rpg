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

let sandboxActive=false,sandboxSnapshot=null,buildHandler=null,buildItems=[];
const sandboxBuild={free:false,unlimited:false,instant:false};
const allowedDebugNames=new Set(["admin","chatgpt"]);
const authenticatedName=user=>{
  const email=String(user?.email||"").toLowerCase();
  return email.endsWith("@wayfarer.example")?email.slice(0,-"@wayfarer.example".length):"";
};
const debugAllowed=()=>!!activeUser&&allowedDebugNames.has(authenticatedName(activeUser));
const storageKey=kind=>"kotu-v1:"+activeUser.id+":"+kind;
function refreshDebug(){
  const allowed=debugAllowed();
  if(!allowed)sandboxActive=false;
  $("debugToggle").hidden=!allowed;
  if(!allowed)$("debugPanel").hidden=true;
  $("sandboxBadge").hidden=!sandboxActive;
  if($("sandboxBuildOptions"))$("sandboxBuildOptions").hidden=!sandboxActive;
  $("sandboxToggle").textContent=sandboxActive?"Exit Sandbox":"Enter Sandbox";
  $("sandboxToggle").setAttribute("aria-pressed",String(sandboxActive));
  $("debugModeStatus").textContent=sandboxActive?"Sandbox active · isolated test resources":"Live mode · normal resources";
}
function setSandbox(enabled){
  if(!debugAllowed()||sandboxActive===enabled)return;
  if(enabled){sandboxSnapshot={resources:readResources("live"),buildings:readBuildings("live")};}else{sandboxSnapshot=null;}
  sandboxActive=enabled;
  if(!enabled){for(const key of ["free","unlimited","instant"]){sandboxBuild[key]=false;$("sandbox-"+key).checked=false;}}
  refreshDebug();renderResources();closeBuild();
  if(!$("world").hidden)enterWorld();
}
$("debugToggle").onclick=()=>{if(debugAllowed())$("debugPanel").hidden=!$("debugPanel").hidden;};
$("sandboxToggle").onclick=()=>setSandbox(!sandboxActive);
const sandboxOptions=document.createElement("div");sandboxOptions.id="sandboxBuildOptions";sandboxOptions.hidden=true;
for(const [key,label] of [["free","Free purchases"],["unlimited","Unlimited buildings"],["instant","Instant construction"]]){
  const row=document.createElement("label");
  const box=document.createElement("input");box.type="checkbox";box.id="sandbox-"+key;
  box.onchange=()=>{if(!sandboxActive){box.checked=false;return;}sandboxBuild[key]=box.checked;renderBuild();};
  row.append(box,document.createTextNode(label));sandboxOptions.append(row);
}
$("sandboxToggle").after(sandboxOptions);



const RESOURCE_NAMES=["gold","wood","stone","food"];
const COST={gold:1250,wood:200,stone:150},REFUND={gold:1000,wood:150,stone:100};
function readBuildings(kind){
  try{return JSON.parse(localStorage.getItem(storageKey(kind+"-buildings-v1"))||"null");}catch{return null;}
}
function activeBuildings(){return sandboxActive?sandboxSnapshot?.buildings:readBuildings("live");}
function saveBuildings(value){
  if(sandboxActive){sandboxSnapshot.buildings=value;return;}
  try{localStorage.setItem(storageKey("live-buildings-v1"),JSON.stringify(value));}
  catch(error){window.alert("Could not save building positions: "+error.message);}
}
function currentResources(){return sandboxActive?sandboxSnapshot.resources:readResources("live");}
function changeResources(delta){
  const before=currentResources(),after={...before};
  for(const [key,amount] of Object.entries(delta)){after[key]=(after[key]||0)+amount;if(after[key]<0)return false;}
  if(sandboxActive)sandboxSnapshot.resources=after;
  else {try{localStorage.setItem(storageKey("live-resources"),JSON.stringify(after));}catch{return false;}}
  renderResources();renderBuild();return true;
}
function sellBuilding(){return changeResources(REFUND);}
function buyBuilding(){if(sandboxActive&&sandboxBuild.free)return true;return changeResources(Object.fromEntries(Object.entries(COST).map(([key,value])=>[key,-value])));}
function renderBuild(){
  const list=$("buildCatalog");if(!list)return;
  list.replaceChildren();
  const options=sandboxActive;
  for(const item of buildItems.filter(b=>b.id!=="townhall"&&(!b.present||(options&&sandboxBuild.unlimited)))){
    const button=document.createElement("button");button.type="button";
    button.textContent=item.name+(options&&sandboxBuild.free?" · FREE":" · 1,250 gold · 200 wood · 150 stone")+(options?"":" · Requires Town Hall Level 2");
    button.disabled=!options;
    button.onclick=()=>{if(buildHandler?.(item.id))closeBuild();};
    list.append(button);
  }
  if(!list.children.length){const note=document.createElement("p");note.textContent=options?"No additional buildings available.":"New buildings unlock at Town Hall Level 2.";list.append(note);}
}
function readResources(kind){
  try{
    const raw=JSON.parse(localStorage.getItem(storageKey(kind+"-resources"))||"{}");
    return Object.fromEntries(RESOURCE_NAMES.map(name=>[name,Math.max(0,Math.floor(Number(raw[name])||0))]));
  }catch{return Object.fromEntries(RESOURCE_NAMES.map(name=>[name,0]));}
}
function renderResources(){
  const resources=activeUser?currentResources():Object.fromEntries(RESOURCE_NAMES.map(name=>[name,0]));
  for(const name of RESOURCE_NAMES) $("resource"+name[0].toUpperCase()+name.slice(1)).textContent=resources[name].toLocaleString();
}
const buildToggle=$("buildToggle"),buildPanel=$("buildPanel");
function closeBuild(){buildPanel.hidden=true;buildToggle.setAttribute("aria-expanded","false");}
buildToggle.onclick=()=>{const opening=buildPanel.hidden;buildPanel.hidden=!opening;buildToggle.setAttribute("aria-expanded",String(opening));if(opening){closeGameMenu();renderBuild();}};
$("buildClose").onclick=closeBuild;
document.addEventListener("pointerdown",event=>{if(!event.target.closest(".kotu-build-ui"))closeBuild();});

function message(text){status.textContent=text;}
function showForm(create){mode=create?"create":"login";form.hidden=false;actions.hidden=true;ready.hidden=true;$("formTitle").textContent=create?"Create account":"Log in";$("pin").autocomplete=create?"new-password":"current-password";}
function signedOut(){sandboxSnapshot=null;closeBuild();activeUser=null;sandboxActive=false;$("debugPanel").hidden=true;refreshDebug();renderResources();ready.hidden=true;form.hidden=true;actions.hidden=false;message("Log in or create an account to play.");}
function signedIn(user){const changed=activeUser?.id!==user.id;activeUser=user;if(changed){sandboxSnapshot=null;sandboxActive=false;$("debugPanel").hidden=true;}refreshDebug();renderResources();form.hidden=true;actions.hidden=true;ready.hidden=false;$("welcome").textContent="Welcome, "+String(user.user_metadata?.wayfarer_username||user.email?.split("@")[0]||"Commander");message("Account ready.");}
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
$("back").onclick=()=>{closeBuild();loadGeneration++;$("terrainLoading").hidden=true;closeGameMenu();cleanup?.();cleanup=null;buildHandler=null;buildItems=[];$("world").hidden=true;$("title").hidden=false;};
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
  closeGameMenu();closeBuild();renderResources();
  cleanup?.();cleanup=null;buildHandler=null;buildItems=[];
  $("title").hidden=true;$("world").hidden=false;
  $("worldStatus").hidden=true;
  $("terrainLoading").hidden=false;
  $("terrainLoadingMessage").textContent="Loading terrain and textures";
  try{
    const {startTerrain}=await import("./terrain.js?v=3.0.70");
    if(generation!==loadGeneration)return;
    const legacyKey=storageKey("live-townhall-level1");
    const dispose=await startTerrain($("world"),{
      read:()=>{
        const current=activeBuildings();
        if(current)return current;
        try{return JSON.parse(localStorage.getItem(legacyKey)||"null")||{};}catch{return {};}
      },
      write:saveBuildings,
      sell:()=>{const ok=sellBuilding();if(ok)renderBuild();return ok;},
      buy:()=>{const ok=buyBuilding();if(ok)renderBuild();return ok;},
      sandboxOptions:()=>({active:sandboxActive,free:sandboxActive&&sandboxBuild.free,unlimited:sandboxActive&&sandboxBuild.unlimited,instant:sandboxActive&&sandboxBuild.instant}),
      setBuildHandler:handler=>{buildHandler=handler;},
      refreshBuild:items=>{buildItems=items;renderBuild();}
    });
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
(async()=>{
  try{
    if(!window.supabase?.createClient)throw new Error("Authentication library unavailable.");
    client=window.supabase.createClient(CONFIG.url,CONFIG.anonKey,{auth:{storageKey:"kotu-auth-session-v1",persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    const {data,error}=await client.auth.getSession();if(error)throw error;
    if(data.session?.user)signedIn(data.session.user);else signedOut();
    client.auth.onAuthStateChange((event,session)=>{if(event==="SIGNED_OUT")signedOut();else if(session?.user)signedIn(session.user);});
  }catch(error){message("Authentication unavailable: "+String(error.message||error));actions.hidden=true;}
})();
