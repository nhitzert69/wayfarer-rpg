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
let client=null,mode="login",cleanup=null,activeUser=null;
function message(text){status.textContent=text;}
function showForm(create){mode=create?"create":"login";form.hidden=false;actions.hidden=true;ready.hidden=true;$("formTitle").textContent=create?"Create account":"Log in";$("pin").autocomplete=create?"new-password":"current-password";}
function signedOut(){activeUser=null;ready.hidden=true;form.hidden=true;actions.hidden=false;message("Log in or create an account to play.");}
function signedIn(user){activeUser=user;form.hidden=true;actions.hidden=true;ready.hidden=false;$("welcome").textContent="Welcome, "+String(user.user_metadata?.wayfarer_username||user.email?.split("@")[0]||"Commander");message("Account ready.");}
$("showLogin").onclick=()=>showForm(false);
$("showCreate").onclick=()=>showForm(true);
$("cancelAuth").onclick=signedOut;
$("return").onclick=()=>{if(window.parent!==window){window.parent.postMessage({type:"kotu-return"},"*");}else{window.location.href="../index.html";}};
$("logout").onclick=async()=>{if(client)await client.auth.signOut();signedOut();};
$("back").onclick=()=>{cleanup?.();cleanup=null;$("world").hidden=true;$("title").hidden=false;};
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
  $("title").hidden=true;$("world").hidden=false;
  $("worldStatus").textContent="Loading terrain…";
  cleanup?.();cleanup=null;
  try{
    const {startTerrain}=await import("./terrain.js");
    cleanup=await startTerrain($("world"),$("faction").value);
    $("worldStatus").textContent="Click to move · Drag to pan · Scroll to zoom";
  }catch(error){$("worldStatus").textContent="Could not load map: "+String(error.message||error);}
}
$("play").onclick=enterWorld;
$("faction").onchange=()=>{if(!$("world").hidden)enterWorld();};
(async()=>{
  try{
    if(!window.supabase?.createClient)throw new Error("Authentication library unavailable.");
    client=window.supabase.createClient(CONFIG.url,CONFIG.anonKey,{auth:{storageKey:"kotu-auth-session-v1",persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    const {data,error}=await client.auth.getSession();if(error)throw error;
    if(data.session?.user)signedIn(data.session.user);else signedOut();
    client.auth.onAuthStateChange((event,session)=>{if(event==="SIGNED_OUT")signedOut();else if(session?.user)signedIn(session.user);});
  }catch(error){message("Authentication unavailable: "+String(error.message||error));actions.hidden=true;}
})();
